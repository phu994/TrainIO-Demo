const socket = io();
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let isBoosting = false;
let train = {};
let fruits = [];
let id = null;

// Load hình ảnh
const fruitImg = new Image();
fruitImg.src = "/assets/fruit.png";

const trainImg = new Image();
trainImg.src = "/assets/train_segment.png";

// Bắt đầu game
function startGame() {
    const name = document.getElementById("playerName").value.trim();
    if (!name) return alert("Bạn cần nhập tên!");
    document.getElementById("nameForm").style.display = "none";
    canvas.style.display = "block";
    socket.emit("join", { name });
}

// Bắt sự kiện di chuột
canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    socket.emit("move", { x, y });
});

// Nhấn giữ chuột trái để tăng tốc
document.addEventListener("mousedown", e => {
    if (e.button === 0) isBoosting = true;
});
document.addEventListener("mouseup", e => {
    if (e.button === 0) isBoosting = false;
});
setInterval(() => {
    socket.emit("boost", isBoosting);
}, 100);

// Nhận dữ liệu từ server
socket.on("init", data => {
    id = data.id;
});
socket.on("state", state => {
    train = state.players;
    fruits = state.fruits;
});

// Vẽ game
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Vẽ trái cây
    for (const fruit of fruits) {
        ctx.drawImage(fruitImg, fruit.x - fruit.size, fruit.y - fruit.size, fruit.size * 2, fruit.size * 2);
    }

    // Vẽ tàu
    for (const playerId in train) {
        const t = train[playerId];
        const isMe = playerId === id;

        for (let i = 0; i < t.body.length; i++) {
            const segment = t.body[i];
            let angle = 0;

            if (i === 0 && t.body.length > 1) {
                // Đầu tàu xoay theo hướng đi
                const next = t.body[1];
                angle = Math.atan2(segment.y - next.y, segment.x - next.x);
            }

            ctx.save();
            ctx.translate(segment.x, segment.y);
            ctx.rotate(angle);
            ctx.drawImage(trainImg, -10, -10, 20, 20);
            ctx.restore();
        }

        // Vẽ tên người chơi
        if (t.name) {
            ctx.fillStyle = "black";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(t.name, t.x, t.y - 15);
        }

        // Vẽ điểm người chơi của chính mình
        if (isMe) {
            ctx.fillStyle = "black";
            ctx.font = "16px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(`Điểm: ${t.score}`, 10, 20);
        }
    }

    requestAnimationFrame(draw);
}

draw();
