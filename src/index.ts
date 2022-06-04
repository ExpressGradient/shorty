// Fastify Plugins
import fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifySensible from "@fastify/sensible";

// Route Modules
import shortcuts from "./shortcuts";
import auth from "./auth";

const app = fastify({ logger: true });

// Register Plugins
app.register(fastifyJwt, { secret: "secret" });
app.register(fastifySensible);

// Register Routes
app.register(auth, { prefix: "/auth" });
app.register(shortcuts, { prefix: "/shortcuts" });

app.listen(3000).then(() => console.log("Shorty listening on Port 3000"));
