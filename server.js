
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("."));

let players = {};
let fruits = [];

function spawnFruit() {
    const size = Math.random() < 0.5 ? 10 : 20;
    fruits.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        size
    });
}

setInterval(() => {
    if (fruits.length < 20) spawnFruit();
}, 1000);

io.on("connection", socket => {
    players[socket.id] = {
        x: 400, y: 300,
        vx: 0, vy: 0,
        body: [{ x: 400, y: 300 }],
        length: 5
    };

    socket.emit("init", { id: socket.id });

    socket.on("move", pos => {
        const p = players[socket.id];
        if (!p) return;
        const dx = pos.x - p.x;
        const dy = pos.y - p.y;
        const dist = Math.hypot(dx, dy);
        p.vx = (dx / dist) * 2;
        p.vy = (dy / dist) * 2;
    });

    socket.on("disconnect", () => {
        delete players[socket.id];
    });
});

setInterval(() => {
    for (const id in players) {
        const p = players[id];
        p.x += p.vx;
        p.y += p.vy;
        p.body.unshift({ x: p.x, y: p.y });
        while (p.body.length > p.length) p.body.pop();

        // Ăn trái cây
        for (let i = fruits.length - 1; i >= 0; i--) {
            const f = fruits[i];
            const dx = f.x - p.x, dy = f.y - p.y;
            if (Math.hypot(dx, dy) < f.size + 10) {
                p.length += f.size > 15 ? 3 : 1;
                fruits.splice(i, 1);
            }
        }
    }

    io.emit("state", { players, fruits });
}, 50);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Train.io server running on port", PORT));
