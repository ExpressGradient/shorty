import { PrismaClient, Prisma } from "@prisma/client";
import { Static, Type } from "@sinclair/typebox";
import { compare, hash } from "bcrypt";
import { FastifyPluginAsync } from "fastify";

const prisma = new PrismaClient();

const loginPayload = Type.Object({
    email: Type.String({ format: "email" }),
    password: Type.String({ minLength: 12 }),
});

const registerPayload = Type.Object({
    username: Type.String(),
    email: Type.String({ format: "email" }),
    password: Type.String({ minLength: 12 }),
});

const responsePayload = Type.Object({
    message: Type.String(),
    data: Type.Object({
        token: Type.String(),
    }),
});

const auth: FastifyPluginAsync = async (app, opts) => {
    app.post<{ Body: Static<typeof registerPayload> }>(
        "/register",
        {
            schema: {
                body: registerPayload,
                response: { 201: responsePayload },
            },
        },
        async (request, reply) => {
            // Extract the payload from the request
            const { username, email, password } = request.body;

            // Create a user
            try {
                // Hash the password
                const hashedPassword = await hash(password, 10);

                const { id } = await prisma.user.create({
                    data: { username, email, password: hashedPassword },
                    select: { id: true },
                });

                // Sign a token and reply
                const token = await app.jwt.sign({ id, email });

                reply
                    .code(201)
                    .send({ message: "User created", data: { token } });
            } catch (e) {
                if (
                    e instanceof Prisma.PrismaClientKnownRequestError &&
                    e.code === "P2002"
                ) {
                    reply.notAcceptable("Email already in use");
                } else {
                    reply.internalServerError();
                }
            }
        }
    );

    app.post<{ Body: Static<typeof loginPayload> }>(
        "/login",
        {
            schema: {
                body: loginPayload,
                response: { 200: responsePayload },
            },
        },
        async (request, reply) => {
            // Extract email and password from request body
            const { email, password } = request.body;

            // Find a user based on the email
            const user = await prisma.user.findFirst({ where: { email } });

            if (!user) {
                reply.notFound("User not found, try signing up first");
            } else {
                // Compare the password with the hash stored in the database
                if (!(await compare(password, user.password))) {
                    reply.unauthorized("Invalid password");
                } else {
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
        }
    );
};

export default auth;
