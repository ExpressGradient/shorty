"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shortcuts = async (app, opts) => {
    app.addHook("onRequest", async (request, reply) => {
        try {
            await request.jwtVerify();
        }
        catch (err) {
            reply.forbidden("Bad Auth Token");
        }
    });
    app.get("/", async (request, reply) => reply.send("Shortcuts"));
};
exports.default = shortcuts;
//# sourceMappingURL=shortcuts.js.map