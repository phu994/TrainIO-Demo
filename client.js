
const socket = io();
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let train = [];
let fruits = [];
let id = null;

// Gửi vị trí chuột liên tục
canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    socket.emit("move", { x, y });
});

socket.on("init", data => { id = data.id; });
socket.on("state", state => {
    train = state.players;
    fruits = state.fruits;
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Vẽ trái cây
    for (const fruit of fruits) {
        ctx.fillStyle = fruit.size > 15 ? "orange" : "lime";
        ctx.beginPath();
        ctx.arc(fruit.x, fruit.y, fruit.size, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Vẽ tàu
    for (const playerId in train) {
        const t = train[playerId];
        ctx.fillStyle = playerId === id ? "blue" : "gray";
        for (const segment of t.body) {
            ctx.beginPath();
            ctx.arc(segment.x, segment.y, 10, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    requestAnimationFrame(draw);
}
draw();
