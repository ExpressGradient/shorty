import { FastifyPluginAsync } from "fastify";
import { PrismaClient, Shortcut, Prisma } from "@prisma/client";
import jsonSchema from "../utils/json-schema.json";
import { Static, Type } from "@sinclair/typebox";
import slugify from "slugify";

const getShortcutsQuery = Type.Object({
    search: Type.Optional(Type.String()),
    page: Type.Optional(Type.Integer()),
    sort: Type.Optional(Type.String()),
    order: Type.Optional(Type.String()),
});

const createShortcutResponse = Type.Object({
    message: Type.String(),
    data: Type.Object({
        id: Type.Number(),
    }),
});

const deleteShortcutParam = Type.Object({
    id: Type.Number(),
});

const prisma = new PrismaClient();

const shortcuts: FastifyPluginAsync = async (app, opts) => {
    // Add an onRequest hook for verifying JWT
    app.addHook("onRequest", async (request, reply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.forbidden("Bad Auth Token");
        }
    });

    // Add jsonSchema to the app
    app.addSchema({ $id: "Shorty", ...jsonSchema });

    // Route for fetching all shortcuts
    app.get<{
        Reply: Array<Shortcut>;
        Querystring: Static<typeof getShortcutsQuery>;
    }>(
        "/",
        {
            schema: {
                querystring: getShortcutsQuery,
                response: {
                    200: {
                        type: "array",
                        items: { $ref: "Shorty#/definitions/Shortcut" },
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
    app.post<{
        Body: Prisma.ShortcutCreateWithoutTagsInput;
        Reply: Static<typeof createShortcutResponse>;
    }>(
        "/",
        {
            schema: {
                body: { $ref: "Shorty#/definitions/Shortcut" },
                response: {
                    201: createShortcutResponse,
                },
            },
        },
        async (request, reply) => {
            const payload = request.body;
            payload.shortLink = slugify(payload.shortLink, {
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
            } catch (e) {
                if (
                    e instanceof Prisma.PrismaClientKnownRequestError &&
                    e.code === "P2002"
                ) {
                    reply.notAcceptable("ShortLink already in use");
                } else {
                    app.log.error(e);
                    reply.internalServerError("Failed to create a Shortcut");
                }
            }
        }
    );

    // Route for deleting a shortcut
    app.delete<{ Params: Static<typeof deleteShortcutParam> }>(
        "/:id",
        { schema: { params: deleteShortcutParam } },
        async (request, reply) => {
            try {
                await prisma.shortcut.delete({
                    where: { id: request.params.id },
                });

                reply.send({ message: "Shortcut deleted" });
            } catch (e) {
                if (
                    e instanceof Prisma.PrismaClientKnownRequestError &&
                    (e.code === "P2001" || e.code === "P2025")
                ) {
                    reply.notFound(
                        `Shortcut with Id: ${request.params.id} not found`
                    );
                } else {
                    app.log.error(e);
                    reply.internalServerError("Failed to delete a Shortcut");
                }
            }
        }
    );
};

export default shortcuts;
