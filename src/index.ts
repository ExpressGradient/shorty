// Fastify Plugins
import fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifySensible from "@fastify/sensible";
import fastifyEnv from "@fastify/env";

// Route Modules
import shortcuts from "./shortcuts";
import auth from "./auth";

const app = fastify({ logger: true });

// Register Plugins
const schema = {
    type: "object",
    required: ["JWT_SECRET"],
    properties: {
        JWT_SECRET: { type: "string" },
    },
};
app.register(fastifyEnv, { schema, dotenv: true });
app.register(fastifyJwt, { secret: process.env.JWT_SECRET || "" });
app.register(fastifySensible);

// Register Routes
app.register(auth, { prefix: "/auth" });
app.register(shortcuts, { prefix: "/shortcuts" });

app.listen(3000).then(() => console.log("Shorty listening on Port 3000"));
