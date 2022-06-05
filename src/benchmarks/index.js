const autoCannon = require("autocannon");
const fs = require("fs");

autoCannon(
    {
        url: "https://shorty.onrender.com/health",
    },
    (_, res) =>
        fs.writeFile(
            "src/benchmarks/health_benchmark.json",
            JSON.stringify(res, null, 2),
            (err) => {
                if (err) throw err;
                console.log("Health Benchmark Saved!");
            }
        )
);

autoCannon(
    {
        url: "https://shorty.onrender.com/shortcuts",
        headers: {
            Authorization: "Bearer <your-auth-token-here>",
        },
    },
    (_, res) =>
        fs.writeFile(
            "src/benchmarks/get_shortcuts_benchmark.json",
            JSON.stringify(res, null, 2),
            (err) => {
                if (err) throw err;
                console.log("GET Shortcuts Benchmark Saved!");
            }
        )
);
