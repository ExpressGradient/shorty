"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerConfig = exports.envConfig = void 0;
// Register Plugins
const env_schema_1 = __importDefault(require("env-schema"));
const json_schema_json_1 = __importDefault(require("./json-schema.json"));
exports.envConfig = (0, env_schema_1.default)({
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
exports.swaggerConfig = {
    routePrefix: "/docs",
    mode: "dynamic",
    exposeRoute: true,
    swagger: {
        info: {
            title: "Shorty API",
            description: "A simple API for creating and accessing short links",
            version: "1.0.0",
        },
        definitions: json_schema_json_1.default.definitions,
        host: "shorty.onrender.com",
        schemes: ["https"],
        consumes: ["application/json"],
        produces: ["application/json"],
    },
    uiConfig: {
        deepLinking: false,
    },
};
//# sourceMappingURL=pluginConfig.js.map