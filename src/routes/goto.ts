import { FastifyPluginAsync } from "fastify";
import { Static, Type } from "@sinclair/typebox";
import { PrismaClient } from "@prisma/client";

const getGotoShortLinkParams = Type.Object({
    shortLink: Type.String(),
});

const getGotoShortLinkHeaders = Type.Object({
    Authorization: Type.String({ default: "Bearer something" }),
});

const prisma = new PrismaClient();

const goto: FastifyPluginAsync = async (app, opts) => {
    // Add an onRequest hook for verifying JWT
    app.addHook("onRequest", async (request, reply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.forbidden("Bad Auth Token");
        }
    });

    // Add route to goto shortLinks
    app.get<{ Params: Static<typeof getGotoShortLinkParams> }>(
        "/:shortLink",
        {
            schema: {
                description: `
                    Enter the shortLink and get redirected to the destination
                    
                    Throws a Not Found Error if the shortLink does not exist
                    Throws an Internal Server Error if failed to goto shortLink
                `,
                params: getGotoShortLinkParams,
                headers: getGotoShortLinkHeaders,
            },
        },
        async (request, reply) => {
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
                } else {
                    // Add it to record
                    await prisma.record.create({
                        data: { shortcutId: shortcut.id },
                    });

                    reply.redirect(shortcut.destination);
                }
            } catch (e) {
                app.log.error(e);
                reply.internalServerError("Failed to goto shortcut");
            }
        }
    );
};

export default goto;
