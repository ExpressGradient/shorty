"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typebox_1 = require("@sinclair/typebox");
const client_1 = require("@prisma/client");
const getGotoShortLinkParams = typebox_1.Type.Object({
    shortLink: typebox_1.Type.String(),
});
const getGotoShortLinkHeaders = typebox_1.Type.Object({
    Authorization: typebox_1.Type.String({ default: "Bearer something" }),
});
const prisma = new client_1.PrismaClient();
const goto = async (app, opts) => {
    // Add an onRequest hook for verifying JWT
    app.addHook("onRequest", async (request, reply) => {
        try {
            await request.jwtVerify();
        }
        catch (err) {
            reply.forbidden("Bad Auth Token");
        }
    });
    // Add route to goto shortLinks
    app.get("/:shortLink", {
        schema: {
            description: `
                    Enter the shortLink and get redirected to the destination
                    
                    Throws a Not Found Error if the shortLink does not exist
                    Throws an Internal Server Error if failed to goto shortLink
                `,
            params: getGotoShortLinkParams,
            headers: getGotoShortLinkHeaders,
        },
    }, async (request, reply) => {
        try {
            const shortcut = await prisma.shortcut.findUnique({
                where: {
                    shortLink_userId: {
                        userId: request.user.id,
                        shortLink: request.params.shortLink,
                    },
                },
                select: { destination: true, id: true },
            });
            if (!shortcut) {
                reply.notFound("Shortcut not found");
            }
            else {
                // Add it to record
                await prisma.record.create({
                    data: { shortcutId: shortcut.id },
                });
                reply.redirect(shortcut.destination);
            }
        }
        catch (e) {
            app.log.error(e);
            reply.internalServerError("Failed to goto shortcut");
        }
    });
};
exports.default = goto;
//# sourceMappingURL=goto.js.map