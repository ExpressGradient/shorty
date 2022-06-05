"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Fastify Plugins
const fastify_1 = __importDefault(require("fastify"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const sensible_1 = __importDefault(require("@fastify/sensible"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
// Route Modules
const shortcuts_1 = __importDefault(require("./routes/shortcuts"));
const auth_1 = __importDefault(require("./routes/auth"));
const goto_1 = __importDefault(require("./routes/goto"));
// Config imports
const pluginConfig_1 = require("./utils/pluginConfig");
const app = (0, fastify_1.default)({ logger: true });
app.register(jwt_1.default, { secret: pluginConfig_1.envConfig.JWT_SECRET });
app.register(sensible_1.default);
app.register(swagger_1.default, pluginConfig_1.swaggerConfig);
// Register Routes
app.register(auth_1.default, { prefix: "/auth" });
app.register(shortcuts_1.default, { prefix: "/shortcuts" });
app.register(goto_1.default, { prefix: "/goto" });
app.listen(pluginConfig_1.envConfig.PORT).then(() => console.log(`Shorty listening on Port ${pluginConfig_1.envConfig.PORT}`));
//# sourceMappingURL=index.js.map