import { FastifyPluginAsync } from "fastify";

const shortcuts: FastifyPluginAsync = async (app, opts) => {
    app.get("/", async (request, reply) => reply.send("Shortcuts"));
};

export default shortcuts;
