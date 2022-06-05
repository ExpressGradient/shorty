var $8zHUo$fastify = require("fastify");
var $8zHUo$fastifyjwt = require("@fastify/jwt");
var $8zHUo$fastifysensible = require("@fastify/sensible");
var $8zHUo$fastifyswagger = require("@fastify/swagger");
var $8zHUo$prismaclient = require("@prisma/client");
var $8zHUo$sinclairtypebox = require("@sinclair/typebox");
var $8zHUo$slugify = require("slugify");
var $8zHUo$bcrypt = require("bcrypt");
var $8zHUo$envschema = require("env-schema");

function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}





var $49f71150acbe71b5$exports = {};
$49f71150acbe71b5$exports = JSON.parse('{"$schema":"http://json-schema.org/draft-07/schema#","definitions":{"User":{"type":"object","description":"User Model.\\nContains fields like username, email, hashedPassword, etc.","properties":{"id":{"type":"integer"},"username":{"type":"string"},"email":{"type":"string"},"password":{"type":"string"},"createdAt":{"type":"string","format":"date-time"},"shortcuts":{"type":"array","items":{"$ref":"#/definitions/Shortcut"}}}},"Shortcut":{"description":"Shortcut Model used to store Shortcuts.\\nEach shortcut is linked to a user.\\nContains fields like shortLink, destination, tags etc","required":["destination","shortLink","tags","description"],"type":"object","properties":{"id":{"type":"integer"},"destination":{"type":"string","format":"uri"},"shortLink":{"type":"string"},"tags":{"type":"array","items":{"$ref":"#/definitions/Tag"}},"description":{"type":"string"},"user":{"$ref":"#/definitions/User"},"createdAt":{"type":"string","format":"date-time"},"records":{"type":"array","items":{"$ref":"#/definitions/Record"}}}},"Tag":{"description":"Tag Model used to store Tags.\\nEach tag is linked to a shortcut.\\nContains fields like name, color, etc","type":"object","properties":{"id":{"type":"integer"},"tag":{"type":"string"},"shortcuts":{"type":"array","items":{"$ref":"#/definitions/Shortcut"}},"createdAt":{"type":"string","format":"date-time"}}},"Record":{"description":"Record Model serves no purpose for the API except for analytics.\\nFor example we could get to know how many times a user is accessing a shortcut.","type":"object","properties":{"id":{"type":"integer"},"shortcut":{"$ref":"#/definitions/Shortcut"},"accessedAt":{"type":"string","format":"date-time"}}}},"type":"object","properties":{"user":{"$ref":"#/definitions/User"},"shortcut":{"$ref":"#/definitions/Shortcut"},"tag":{"$ref":"#/definitions/Tag"},"record":{"$ref":"#/definitions/Record"}}}');




const $2a7f5224abf523d1$var$getShortcutsQuery = (0, $8zHUo$sinclairtypebox.Type).Object({
    search: (0, $8zHUo$sinclairtypebox.Type).Optional((0, $8zHUo$sinclairtypebox.Type).String()),
    page: (0, $8zHUo$sinclairtypebox.Type).Optional((0, $8zHUo$sinclairtypebox.Type).Integer()),
    sort: (0, $8zHUo$sinclairtypebox.Type).Optional((0, $8zHUo$sinclairtypebox.Type).String()),
    order: (0, $8zHUo$sinclairtypebox.Type).Optional((0, $8zHUo$sinclairtypebox.Type).String())
});
const $2a7f5224abf523d1$var$createShortcutResponse = (0, $8zHUo$sinclairtypebox.Type).Object({
    message: (0, $8zHUo$sinclairtypebox.Type).String(),
    data: (0, $8zHUo$sinclairtypebox.Type).Object({
        id: (0, $8zHUo$sinclairtypebox.Type).Number()
    })
});
const $2a7f5224abf523d1$var$deleteShortcutParam = (0, $8zHUo$sinclairtypebox.Type).Object({
    id: (0, $8zHUo$sinclairtypebox.Type).Number()
});
const $2a7f5224abf523d1$var$shortCutHeaders = (0, $8zHUo$sinclairtypebox.Type).Object({
    Authorization: (0, $8zHUo$sinclairtypebox.Type).String({
        default: "Bearer something"
    })
});
const $2a7f5224abf523d1$var$prisma = new (0, $8zHUo$prismaclient.PrismaClient)();
const $2a7f5224abf523d1$var$shortcuts = async (app, opts)=>{
    // Add an onRequest hook for verifying JWT
    app.addHook("onRequest", async (request, reply)=>{
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.forbidden("Bad Auth Token");
        }
    });
    // Add jsonSchema to the app
    app.addSchema({
        $id: "Shorty",
        ...(0, (/*@__PURE__*/$parcel$interopDefault($49f71150acbe71b5$exports)))
    });
    // Route for fetching all shortcuts
    app.get("/", {
        schema: {
            description: `
                    Get all shortcuts for a User Id.
                    Pass in filters and sorting options.
                    Searchable by shortLink, destination, and tags.
                    
                    Throws Internal Server Error if failed to fetch data.
                `,
            headers: $2a7f5224abf523d1$var$shortCutHeaders,
            querystring: $2a7f5224abf523d1$var$getShortcutsQuery,
            response: {
                200: {
                    type: "array",
                    items: {
                        $ref: "Shorty#/definitions/Shortcut"
                    }
                }
            }
        }
    }, async (request, reply)=>{
        try {
            const query = {
                where: {
                    userId: request.user.id
                },
                include: {
                    tags: true
                },
                take: 10
            };
            if (request.query.search && query.where) {
                const search = request.query.search;
                query.where.OR = [
                    {
                        shortLink: {
                            search: search
                        }
                    },
                    {
                        description: {
                            search: search
                        }
                    },
                    {
                        tags: {
                            some: {
                                tag: {
                                    search: search
                                }
                            }
                        }
                    }, 
                ];
            }
            if (request.query.page) query.skip = (request.query.page - 1) * 10;
            if (request.query.sort) query.orderBy = {
                [request.query.sort]: request.query.order
            };
            reply.send(await $2a7f5224abf523d1$var$prisma.shortcut.findMany(query));
        } catch (e) {
            app.log.error(e);
            reply.internalServerError("Failed to fetch shortcuts");
        }
    });
    // Route for creating a shortcut
    app.post("/", {
        schema: {
            description: `
                    Create a new Shortcut by passing in all the necessary information like destination, shortLink, tags etc.
                    
                    Throws a Not Acceptable Error if the shortLink is already taken.
                    Throws an Internal Server Error if failed to create the shortcut.
                `,
            headers: $2a7f5224abf523d1$var$shortCutHeaders,
            body: {
                $ref: "Shorty#/definitions/Shortcut"
            },
            response: {
                201: $2a7f5224abf523d1$var$createShortcutResponse
            }
        }
    }, async (request, reply)=>{
        const payload = request.body;
        payload.shortLink = (0, ($parcel$interopDefault($8zHUo$slugify)))(payload.shortLink, {
            lower: true
        });
        try {
            const { id: id  } = await $2a7f5224abf523d1$var$prisma.shortcut.create({
                data: {
                    ...payload,
                    // @ts-ignore
                    tags: {
                        create: payload.tags
                    },
                    user: {
                        connect: {
                            id: request.user.id
                        }
                    }
                },
                select: {
                    id: true
                }
            });
            reply.code(201).send({
                message: "Shortcut created",
                data: {
                    id: id
                }
            });
        } catch (e) {
            if (e instanceof (0, $8zHUo$prismaclient.Prisma).PrismaClientKnownRequestError && e.code === "P2002") reply.notAcceptable("ShortLink already in use");
            else {
                app.log.error(e);
                reply.internalServerError("Failed to create a Shortcut");
            }
        }
    });
    // Route for deleting a shortcut
    app.delete("/:id", {
        schema: {
            description: `
                    Delete a Shortcut by passing in the id of the shortcut.
                    
                    Throws a Not Found Error if the shortcut does not exist.
                    Throws an Internal Server Error if failed to delete the shortcut.
                `,
            headers: $2a7f5224abf523d1$var$shortCutHeaders,
            params: $2a7f5224abf523d1$var$deleteShortcutParam
        }
    }, async (request, reply)=>{
        try {
            await $2a7f5224abf523d1$var$prisma.shortcut.delete({
                where: {
                    id: request.params.id
                }
            });
            reply.send({
                message: "Shortcut deleted"
            });
        } catch (e) {
            if (e instanceof (0, $8zHUo$prismaclient.Prisma).PrismaClientKnownRequestError && (e.code === "P2001" || e.code === "P2025")) reply.notFound(`Shortcut with Id: ${request.params.id} not found`);
            else {
                app.log.error(e);
                reply.internalServerError("Failed to delete a Shortcut");
            }
        }
    });
};
var $2a7f5224abf523d1$export$2e2bcd8739ae039 = $2a7f5224abf523d1$var$shortcuts;





const $f7d1c3745a3d6af7$var$prisma = new (0, $8zHUo$prismaclient.PrismaClient)();
const $f7d1c3745a3d6af7$var$loginPayload = (0, $8zHUo$sinclairtypebox.Type).Object({
    email: (0, $8zHUo$sinclairtypebox.Type).String({
        format: "email"
    }),
    password: (0, $8zHUo$sinclairtypebox.Type).String({
        minLength: 12
    })
});
const $f7d1c3745a3d6af7$var$registerPayload = (0, $8zHUo$sinclairtypebox.Type).Object({
    username: (0, $8zHUo$sinclairtypebox.Type).String(),
    email: (0, $8zHUo$sinclairtypebox.Type).String({
        format: "email"
    }),
    password: (0, $8zHUo$sinclairtypebox.Type).String({
        minLength: 12
    })
});
const $f7d1c3745a3d6af7$var$responsePayload = (0, $8zHUo$sinclairtypebox.Type).Object({
    message: (0, $8zHUo$sinclairtypebox.Type).String(),
    data: (0, $8zHUo$sinclairtypebox.Type).Object({
        token: (0, $8zHUo$sinclairtypebox.Type).String()
    })
});
const $f7d1c3745a3d6af7$var$auth = async (app, opts)=>{
    app.post("/register", {
        schema: {
            description: `
                    Register a new user by passing in credentials like username, email and password.
                    Returns a JWT which is required to access rest of the API.
                    
                    Throws a Not Acceptable Error if the Email is already in use.
                    Throws an Internal Server Error if the user could not be created.
                `,
            body: $f7d1c3745a3d6af7$var$registerPayload,
            response: {
                201: $f7d1c3745a3d6af7$var$responsePayload
            }
        }
    }, async (request, reply)=>{
        // Extract the payload from the request
        const { username: username , email: email , password: password  } = request.body;
        // Create a user
        try {
            // Hash the password
            const hashedPassword = await (0, $8zHUo$bcrypt.hash)(password, 10);
            const { id: id  } = await $f7d1c3745a3d6af7$var$prisma.user.create({
                data: {
                    username: username,
                    email: email,
                    password: hashedPassword
                },
                select: {
                    id: true
                }
            });
            // Sign a token and reply
            const token = await app.jwt.sign({
                id: id,
                email: email
            });
            reply.code(201).send({
                message: "User created",
                data: {
                    token: token
                }
            });
        } catch (e) {
            if (e instanceof (0, $8zHUo$prismaclient.Prisma).PrismaClientKnownRequestError && e.code === "P2002") reply.notAcceptable("Email already in use");
            else reply.internalServerError();
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
            body: $f7d1c3745a3d6af7$var$loginPayload,
            response: {
                200: $f7d1c3745a3d6af7$var$responsePayload
            }
        }
    }, async (request, reply)=>{
        // Extract email and password from request body
        const { email: email , password: password  } = request.body;
        // Find a user based on the email
        const user = await $f7d1c3745a3d6af7$var$prisma.user.findFirst({
            where: {
                email: email
            }
        });
        if (!user) reply.notFound("User not found, try signing up first");
        else // Compare the password with the hash stored in the database
        if (!await (0, $8zHUo$bcrypt.compare)(password, user.password)) reply.badRequest("Invalid password");
        else {
            // Sign a JWT and reply
            const token = await app.jwt.sign({
                id: user.id,
                email: email
            });
            reply.send({
                message: `Welcome ${user.username}`,
                data: {
                    token: token
                }
            });
        }
    });
};
var $f7d1c3745a3d6af7$export$2e2bcd8739ae039 = $f7d1c3745a3d6af7$var$auth;




const $a3eaa1ce8c256510$var$getGotoShortLinkParams = (0, $8zHUo$sinclairtypebox.Type).Object({
    shortLink: (0, $8zHUo$sinclairtypebox.Type).String()
});
const $a3eaa1ce8c256510$var$getGotoShortLinkHeaders = (0, $8zHUo$sinclairtypebox.Type).Object({
    Authorization: (0, $8zHUo$sinclairtypebox.Type).String({
        default: "Bearer something"
    })
});
const $a3eaa1ce8c256510$var$prisma = new (0, $8zHUo$prismaclient.PrismaClient)();
const $a3eaa1ce8c256510$var$goto = async (app, opts)=>{
    // Add an onRequest hook for verifying JWT
    app.addHook("onRequest", async (request, reply)=>{
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.forbidden("Bad Auth Token");
        }
    });
    // Add route to goto shortLinks
    app.get("/:shortLink", {
        schema: {
            description: `
                    Enter the shortLink and get redirected to the destination
                    
                    Throws a Not Found Error if the shortLink does not exist
                    Throws an Internal Server Error if failed to goto shortLink
                `,
            params: $a3eaa1ce8c256510$var$getGotoShortLinkParams,
            headers: $a3eaa1ce8c256510$var$getGotoShortLinkHeaders
        }
    }, async (request, reply)=>{
        try {
            const shortcut = await $a3eaa1ce8c256510$var$prisma.shortcut.findUnique({
                where: {
                    shortLink_userId: {
                        userId: request.user.id,
                        shortLink: request.params.shortLink
                    }
                },
                select: {
                    destination: true,
                    id: true
                }
            });
            if (!shortcut) reply.notFound("Shortcut not found");
            else {
                // Add it to record
                await $a3eaa1ce8c256510$var$prisma.record.create({
                    data: {
                        shortcutId: shortcut.id
                    }
                });
                reply.redirect(shortcut.destination);
            }
        } catch (e) {
            app.log.error(e);
            reply.internalServerError("Failed to goto shortcut");
        }
    });
};
var $a3eaa1ce8c256510$export$2e2bcd8739ae039 = $a3eaa1ce8c256510$var$goto;




const $f0c0e324f9dc3781$export$d8f93e2d9223a77d = (0, ($parcel$interopDefault($8zHUo$envschema)))({
    schema: {
        type: "object",
        required: [
            "JWT_SECRET",
            "PORT"
        ],
        properties: {
            JWT_SECRET: {
                type: "string"
            },
            PORT: {
                type: "number"
            }
        }
    },
    dotenv: true
});
const $f0c0e324f9dc3781$export$f1fd6a3aebeb8881 = {
    routePrefix: "/docs",
    mode: "dynamic",
    exposeRoute: true,
    swagger: {
        info: {
            title: "Shorty API",
            description: "A simple API for creating and accessing short links",
            version: "1.0.0"
        },
        definitions: (0, (/*@__PURE__*/$parcel$interopDefault($49f71150acbe71b5$exports))).definitions,
        host: "shorty.onrender.com",
        schemes: [
            "https"
        ],
        consumes: [
            "application/json"
        ],
        produces: [
            "application/json"
        ]
    },
    uiConfig: {
        deepLinking: false
    }
};


const $882b6d93070905b3$var$app = (0, ($parcel$interopDefault($8zHUo$fastify)))({
    logger: true
});
$882b6d93070905b3$var$app.register((0, ($parcel$interopDefault($8zHUo$fastifyjwt))), {
    secret: (0, $f0c0e324f9dc3781$export$d8f93e2d9223a77d).JWT_SECRET
});
$882b6d93070905b3$var$app.register((0, ($parcel$interopDefault($8zHUo$fastifysensible))));
$882b6d93070905b3$var$app.register((0, ($parcel$interopDefault($8zHUo$fastifyswagger))), (0, $f0c0e324f9dc3781$export$f1fd6a3aebeb8881));
// Register Routes
$882b6d93070905b3$var$app.register((0, $f7d1c3745a3d6af7$export$2e2bcd8739ae039), {
    prefix: "/auth"
});
$882b6d93070905b3$var$app.register((0, $2a7f5224abf523d1$export$2e2bcd8739ae039), {
    prefix: "/shortcuts"
});
$882b6d93070905b3$var$app.register((0, $a3eaa1ce8c256510$export$2e2bcd8739ae039), {
    prefix: "/goto"
});
// Health Check Route
$882b6d93070905b3$var$app.get("/health", async (request, reply)=>{
    reply.send({
        message: "I'm doing fine! Thanks for asking."
    });
});
$882b6d93070905b3$var$app.listen((0, $f0c0e324f9dc3781$export$d8f93e2d9223a77d).PORT).then(()=>console.log(`Shorty listening on Port ${(0, $f0c0e324f9dc3781$export$d8f93e2d9223a77d).PORT}`));


//# sourceMappingURL=index.js.map
