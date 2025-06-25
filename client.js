const socket = io();
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let train = {};
let fruits = [];
let id = null;

function startGame() {
    const name = document.getElementById("playerName").value.trim();
    if (!name) return alert("Bạn cần nhập tên!");

    document.getElementById("nameForm").style.display = "none";
    canvas.style.display = "block";

    socket.emit("join", { name });
}

canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    socket.emit("move", { x, y });
});

socket.on("init", data => {
    id = data.id;
});

socket.on("state", state => {
    train = state.players;
    fruits = state.fruits;
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const fruit of fruits) {
        ctx.fillStyle = fruit.size > 15 ? "orange" : "lime";
        ctx.beginPath();
        ctx.arc(fruit.x, fruit.y, fruit.size, 0, 2 * Math.PI);
        ctx.fill();
    }

    for (const playerId in train) {
        const t = train[playerId];
        ctx.fillStyle = playerId === id ? "blue" : "gray";
        for (const segment of t.body) {
            ctx.beginPath();
            ctx.arc(segment.x, segment.y, 10, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Vẽ tên người chơi
        if (t.name) {
            ctx.fillStyle = "black";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(t.name, t.x, t.y - 15);
        }
    }

    requestAnimationFrame(draw);
}
draw();
