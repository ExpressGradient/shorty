// Fastify Plugins
import fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifySensible from "@fastify/sensible";

// Route Modules
import shortcuts from "./shortcuts";
import auth from "./auth";

import envSchema from "env-schema";

const app = fastify({ logger: true });

// Register Plugins
type Schema = {
    JWT_SECRET: string;
};
const config = envSchema<Schema>({
    schema: {
        type: "object",
        required: ["JWT_SECRET"],
        properties: {
            JWT_SECRET: {
                type: "string",
            },
        },
    },
    dotenv: true,
});
app.register(fastifyJwt, { secret: config.JWT_SECRET });
app.register(fastifySensible);

// Register Routes
app.register(auth, { prefix: "/auth" });
app.register(shortcuts, { prefix: "/shortcuts" });

app.listen(3000).then(() => console.log("Shorty listening on Port 3000"));
