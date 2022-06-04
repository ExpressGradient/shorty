"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shortcuts = async (app, opts) => {
    app.get("/", async (request, reply) => reply.send("Shortcuts"));
};
exports.default = shortcuts;
//# sourceMappingURL=shortcuts.js.map