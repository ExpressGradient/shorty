// Fastify Plugins
import fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifySensible from "@fastify/sensible";
import fastifySwagger from "@fastify/swagger";

// Route Modules
import shortcuts from "./routes/shortcuts";
import auth from "./routes/auth";
import goto from "./routes/goto";

// Config imports
import { envConfig, swaggerConfig } from "./utils/pluginConfig";

const app = fastify({ logger: true });

app.register(fastifyJwt, { secret: envConfig.JWT_SECRET });
app.register(fastifySensible);
app.register(fastifySwagger, swaggerConfig);

// Register Routes
app.register(auth, { prefix: "/auth" });
app.register(shortcuts, { prefix: "/shortcuts" });
app.register(goto, { prefix: "/goto" });

app.listen(envConfig.PORT).then(() =>
    console.log(`Shorty listening on Port ${envConfig.PORT}`)
);
