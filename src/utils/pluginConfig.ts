// Register Plugins
import envSchema from "env-schema";
import { FastifyRegisterOptions } from "fastify";
import { FastifyDynamicSwaggerOptions } from "@fastify/swagger";
import jsonSchema from "./json-schema.json";

type Schema = {
    JWT_SECRET: string;
    PORT: number;
};
export const envConfig = envSchema<Schema>({
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

export const swaggerConfig: FastifyRegisterOptions<FastifyDynamicSwaggerOptions> =
    {
        routePrefix: "/docs",
        mode: "dynamic",
        exposeRoute: true,
        swagger: {
            info: {
                title: "Shorty API",
                description:
                    "A simple API for creating and accessing short links",
                version: "1.0.0",
            },
            definitions: jsonSchema.definitions,
            host: "shorty.onrender.com",
            schemes: ["https"],
            consumes: ["application/json"],
            produces: ["application/json"],
        },
        uiConfig: {
            deepLinking: false,
        },
    };
