import { FastifyPluginAsync } from "fastify";
import { PrismaClient, Shortcut, Prisma } from "@prisma/client";
import jsonSchema from "./utils/json-schema.json";
import { Static, Type } from "@sinclair/typebox";

const shortcutsQuery = Type.Object({
    search: Type.Optional(Type.String()),
    page: Type.Optional(Type.Integer()),
    sort: Type.Optional(Type.String()),
    order: Type.Optional(Type.String()),
});

const prisma = new PrismaClient();

const shortcuts: FastifyPluginAsync = async (app, opts) => {
    app.addHook("onRequest", async (request, reply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.forbidden("Bad Auth Token");
        }
    });

    // Route for fetching all shortcuts
    app.get<{
        Reply: Array<Shortcut>;
        Querystring: Static<typeof shortcutsQuery>;
    }>(
        "/",
        {
            schema: {
                querystring: shortcutsQuery,
                response: {
                    200: {
                        type: "array",
                        items: jsonSchema.definitions,
                    },
                },
            },
        },
        async (request, reply) => {
            try {
                const query: Prisma.ShortcutFindManyArgs = {
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
            } catch (e) {
                app.log.error(e);
                reply.internalServerError("Failed to fetch shortcuts");
            }
        }
    );

    // Route for creating a shortcut
    app.post("/", async (request, reply) => {});

    // Route for deleting a shortcut
    app.delete("/:id", async (request, reply) => {});
};

export default shortcuts;
