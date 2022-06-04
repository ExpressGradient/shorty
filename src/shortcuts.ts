import { FastifyPluginAsync } from "fastify";

const shortcuts: FastifyPluginAsync = async (app, opts) => {
    app.addHook("onRequest", async (request, reply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.forbidden("Bad Auth Token");
        }
    });

    app.get("/", async (request, reply) => reply.send("Shortcuts"));
};

export default shortcuts;
