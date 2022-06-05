// Fastify Plugins
import fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifySensible from "@fastify/sensible";

// Route Modules
import shortcuts from "./routes/shortcuts";
import auth from "./routes/auth";

import envSchema from "env-schema";

const app = fastify({ logger: true });

// Register Plugins
type Schema = {
    JWT_SECRET: string;
    PORT: number;
};
const config = envSchema<Schema>({
    schema: {
        type: "object",
        required: ["JWT_SECRET", "PORT"],
        properties: {
            JWT_SECRET: {
                type: "string",
            },
            PORT: {
                type: "number",
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

app.listen(config.PORT).then(() =>
    console.log(`Shorty listening on Port ${config.PORT}`)
);
