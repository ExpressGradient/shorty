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
const app = (0, fastify_1.default)({ logger: true });
// Register Plugins
app.register(jwt_1.default, { secret: "secret" });
app.register(sensible_1.default);
// Register Routes
app.register(auth_1.default, { prefix: "/auth" });
app.register(shortcuts_1.default, { prefix: "/shortcuts" });
app.listen(3000).then(() => console.log("Shorty listening on Port 3000"));
//# sourceMappingURL=index.js.map