"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Fastify Plugins
const fastify_1 = __importDefault(require("fastify"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const sensible_1 = __importDefault(require("@fastify/sensible"));
// Route Modules
const shortcuts_1 = __importDefault(require("./shortcuts"));
const auth_1 = __importDefault(require("./auth"));
const env_schema_1 = __importDefault(require("env-schema"));
const app = (0, fastify_1.default)({ logger: true });
const config = (0, env_schema_1.default)({
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
app.register(jwt_1.default, { secret: config.JWT_SECRET });
app.register(sensible_1.default);
// Register Routes
app.register(auth_1.default, { prefix: "/auth" });
app.register(shortcuts_1.default, { prefix: "/shortcuts" });
app.listen(config.PORT).then(() => console.log(`Shorty listening on Port ${config.PORT}`));
//# sourceMappingURL=index.js.map