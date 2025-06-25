const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const path = require("path");

// Phục vụ các file trong thư mục 'public'
app.use(express.static(path.join(__dirname, "public")));

const players = {};
const fruits = [];

function spawnFruit() {
  const size = Math.random() < 0.3 ? 20 : 10; // 30% là trái lớn
  fruits.push({
    x: Math.random() * 800,
    y: Math.random() * 600,
    size
  });
}
setInterval(spawnFruit, 1000);

io.on("connection", socket => {
  socket.on("join", data => {
    const name = data.name || "Ẩn danh";
    players[socket.id] = {
      x: 400, y: 300,
      vx: 0, vy: 0,
      body: [{ x: 400, y: 300 }],
      length: 5,
      name,
      boost: false,
      score: 0
    };
    socket.emit("init", { id: socket.id });
  });

  socket.on("move", pos => {
    const p = players[socket.id];
    if (!p) return;
    const dx = pos.x - p.x;
    const dy = pos.y - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist === 0) return;
    p.vx = dx / dist;
    p.vy = dy / dist;
  });

  socket.on("boost", boosting => {
    if (players[socket.id]) {
      players[socket.id].boost = boosting;
    }
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
  });
});

setInterval(() => {
  for (const id in players) {
    const p = players[id];

    const speed = p.boost ? 4 : 2;
    p.x += p.vx * speed;
    p.y += p.vy * speed;

    // Cập nhật toa tàu
    p.body.unshift({ x: p.x, y: p.y });

    if (p.boost && p.length > 5) {
      p.length -= 0.1;
    }

    while (p.body.length > Math.floor(p.length)) {
      p.body.pop();
    }

    for (let i = fruits.length - 1; i >= 0; i--) {
      const f = fruits[i];
      const dx = f.x - p.x;
      const dy = f.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < f.size + 10) {
        p.length += f.size === 20 ? 3 : 1;
        p.score = (p.score || 0) + (f.size === 20 ? 3 : 1);
        fruits.splice(i, 1);
      }
    }
  }

  io.emit("state", {
    players,
    fru
