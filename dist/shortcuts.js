"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const json_schema_json_1 = __importDefault(require("./utils/json-schema.json"));
const typebox_1 = require("@sinclair/typebox");
const slugify_1 = __importDefault(require("slugify"));
const getShortcutsQuery = typebox_1.Type.Object({
    search: typebox_1.Type.Optional(typebox_1.Type.String()),
    page: typebox_1.Type.Optional(typebox_1.Type.Integer()),
    sort: typebox_1.Type.Optional(typebox_1.Type.String()),
    order: typebox_1.Type.Optional(typebox_1.Type.String()),
});
const createShortcutsResponse = typebox_1.Type.Object({
    message: typebox_1.Type.String(),
    data: typebox_1.Type.Object({
        id: typebox_1.Type.Number(),
    }),
});
const prisma = new client_1.PrismaClient();
const shortcuts = async (app, opts) => {
    // Add an onRequest hook for verifying JWT
    app.addHook("onRequest", async (request, reply) => {
        try {
            await request.jwtVerify();
        }
        catch (err) {
            reply.forbidden("Bad Auth Token");
        }
    });
    // Add jsonSchema to the app
    app.addSchema({ $id: "Shorty", ...json_schema_json_1.default });
    // Route for fetching all shortcuts
    app.get("/", {
        schema: {
            querystring: getShortcutsQuery,
            response: {
                200: {
                    type: "array",
                    items: { $ref: "Shorty#/definitions/Shortcut" },
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
    // Route for creating a shortcut
    app.post("/", {
        schema: {
            body: { $ref: "Shorty#/definitions/Shortcut" },
            response: {
                201: createShortcutsResponse,
            },
        },
    }, async (request, reply) => {
        const payload = request.body;
        payload.shortLink = (0, slugify_1.default)(payload.shortLink, {
            lower: true,
        });
        try {
            const { id } = await prisma.shortcut.create({
                data: {
                    ...payload,
                    // @ts-ignore
                    tags: { create: payload.tags },
                    user: { connect: { id: request.user.id } },
                },
                select: { id: true },
            });
            reply
                .code(201)
                .send({ message: "Shortcut created", data: { id } });
        }
        catch (e) {
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                e.code === "P2002") {
                reply.notAcceptable("ShortLink already in use");
            }
            else {
                app.log.error(e);
                reply.internalServerError("Failed to create a ShortLink");
            }
        }
    });
    // Route for deleting a shortcut
    app.delete("/:id", async (request, reply) => { });
};
exports.default = shortcuts;
//# sourceMappingURL=shortcuts.js.map