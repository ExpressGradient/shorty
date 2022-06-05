"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const json_schema_json_1 = __importDefault(require("./utils/json-schema.json"));
const typebox_1 = require("@sinclair/typebox");
const shortcutsQuery = typebox_1.Type.Object({
    search: typebox_1.Type.Optional(typebox_1.Type.String()),
    page: typebox_1.Type.Optional(typebox_1.Type.Integer()),
    sort: typebox_1.Type.Optional(typebox_1.Type.String()),
    order: typebox_1.Type.Optional(typebox_1.Type.String()),
});
const prisma = new client_1.PrismaClient();
const shortcuts = async (app, opts) => {
    app.addHook("onRequest", async (request, reply) => {
        try {
            await request.jwtVerify();
        }
        catch (err) {
            reply.forbidden("Bad Auth Token");
        }
    });
    // Route for fetching all shortcuts
    app.get("/", {
        schema: {
            querystring: shortcutsQuery,
            response: {
                200: {
                    type: "array",
                    items: json_schema_json_1.default.definitions,
                },
            },
        },
    }, async (request, reply) => {
        try {
            const query = {
                where: { userId: request.user.id },
                include: { tags: true },
                take: 10,
            };
            if (request.query.search && query.where) {
                const search = request.query.search;
                query.where.OR = [
                    { shortLink: { search } },
                    { description: { search } },
                    { tags: { some: { tag: { search } } } },
                ];
            }
            if (request.query.page) {
                query.skip = (request.query.page - 1) * 10;
            }
            if (request.query.sort) {
                query.orderBy = {
                    [request.query.sort]: request.query.order,
                };
            }
            reply.send(await prisma.shortcut.findMany(query));
        }
        catch (e) {
            app.log.error(e);
            reply.internalServerError("Failed to fetch shortcuts");
        }
    });
    // Route for deleting a shortcut
    app.delete("/:id", async (request, reply) => { });
};
exports.default = shortcuts;
//# sourceMappingURL=shortcuts.js.map