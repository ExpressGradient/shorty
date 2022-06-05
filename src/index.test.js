const { test } = require("tap");
const axios = require("axios");

test("Requests Shortcuts Unauthorized", async (t) => {
    try {
        const response = await axios.get("http://localhost:3000/shortcuts");
        t.equal(response.status, 200);
    } catch (e) {
        t.equal(e.response.status, 403);
    }
});

test("Requests Shortcuts for a User", async (t) => {
    try {
        const loginRes = await axios.post("http://localhost:3000/auth/login", {
            email: "<youremail@here.com>",
            password: "<yourpasswordhere>",
        });

        const res = await axios.get("http://localhost:3000/shortcuts", {
            headers: {
                Authorization: `Bearer ${loginRes.data.data.token}`,
            },
        });

        t.equal(res.status, 200);
    } catch (e) {
        t.equal(e.response.status, 500);
    }
});

test("Requests Goto Shortcut for a User", async (t) => {
    try {
        const loginRes = await axios.post("http://localhost:3000/auth/login", {
            email: "<youremail@here.com>",
            password: "<yourpasswordhere>",
        });

        const res = await axios.get("http://localhost:3000/goto/github", {
            headers: {
                Authorization: `Bearer ${loginRes.data.data.token}`,
            },
        });

        // test the res request url
        t.equal(res.request.path, "/ExpressGradient");
        t.equal(res.status, 200);
    } catch (e) {
        t.equal(e.response.status, 500);
    }
});
