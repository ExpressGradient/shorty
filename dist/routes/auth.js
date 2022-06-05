"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const typebox_1 = require("@sinclair/typebox");
const bcrypt_1 = require("bcrypt");
const prisma = new client_1.PrismaClient();
const loginPayload = typebox_1.Type.Object({
    email: typebox_1.Type.String({ format: "email" }),
    password: typebox_1.Type.String({ minLength: 12 }),
});
const registerPayload = typebox_1.Type.Object({
    username: typebox_1.Type.String(),
    email: typebox_1.Type.String({ format: "email" }),
    password: typebox_1.Type.String({ minLength: 12 }),
});
const responsePayload = typebox_1.Type.Object({
    message: typebox_1.Type.String(),
    data: typebox_1.Type.Object({
        token: typebox_1.Type.String(),
    }),
});
const auth = async (app, opts) => {
    app.post("/register", {
        schema: {
            description: `
                    Register a new user by passing in credentials like username, email and password.
                    Returns a JWT which is required to access rest of the API.
                    
                    Throws a Not Acceptable Error if the Email is already in use.
                    Throws an Internal Server Error if the user could not be created.
                `,
            body: registerPayload,
            response: { 201: responsePayload },
        },
    }, async (request, reply) => {
        // Extract the payload from the request
        const { username, email, password } = request.body;
        // Create a user
        try {
            // Hash the password
            const hashedPassword = await (0, bcrypt_1.hash)(password, 10);
            const { id } = await prisma.user.create({
                data: { username, email, password: hashedPassword },
                select: { id: true },
            });
            // Sign a token and reply
            const token = await app.jwt.sign({ id, email });
            reply
                .code(201)
                .send({ message: "User created", data: { token } });
        }
        catch (e) {
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                e.code === "P2002") {
                reply.notAcceptable("Email already in use");
            }
            else {
                reply.internalServerError();
            }
        }
    });
    app.post("/login", {
        schema: {
            description: `
                    Login a user by passing in credentials like email and password.
                    Returns a JWT which is required to access rest of the API.
                    
                    Throws a Not Found Error if the user could not be found.
                    Throws a Bad Request Error if the password is incorrect.
                    Throws an Internal Server Error if the user could not be logged in.
                `,
            body: loginPayload,
            response: { 200: responsePayload },
        },
    }, async (request, reply) => {
        // Extract email and password from request body
        const { email, password } = request.body;
        // Find a user based on the email
        const user = await prisma.user.findFirst({ where: { email } });
        if (!user) {
            reply.notFound("User not found, try signing up first");
        }
        else {
            // Compare the password with the hash stored in the database
            if (!(await (0, bcrypt_1.compare)(password, user.password))) {
                reply.badRequest("Invalid password");
            }
            else {
                // Sign a JWT and reply
                const token = await app.jwt.sign({
                    id: user.id,
                    email,
                });
                reply.send({
                    message: `Welcome ${user.username}`,
                    data: { token },
                });
            }
        }
    });
};
exports.default = auth;
//# sourceMappingURL=auth.js.map