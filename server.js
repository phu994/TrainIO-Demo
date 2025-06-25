io.on("connection", socket => {
    socket.on("join", data => {
        const name = data.name || "Ẩn danh";
        players[socket.id] = {
            x: 400, y: 300,
            vx: 0, vy: 0,
            body: [{ x: 400, y: 300 }],
            length: 5,
            name
        };
        socket.emit("init", { id: socket.id });
    });

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
