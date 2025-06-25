const socket = io();
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let isBoosting = false;
let train = {};
let fruits = [];
let id = null;

// Khi giữ chuột trái
document.addEventListener("mousedown", e => {
  if (e.button === 0) isBoosting = true;
});

// Khi nhả chuột trái
document.addEventListener("mouseup", e => {
  if (e.button === 0) isBoosting = false;
});

// Cứ mỗi 100ms, gửi trạng thái boost lên server
setInterval(() => {
  socket.emit("boost", isBoosting);
}, 100);

function startGame() {
  const name = document.getElementById("playerName").value.trim();
  if (!name) return alert("Bạn cần nhập tên!");
  document.getElementById("nameForm").style.display = "none";
  canvas.style.display = "block";
  socket.emit("join", { name });
}

// Gửi hướng di chuyển theo vị trí chuột
canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  socket.emit("move", { x, y });
});

// Lưu ID người chơi từ server
socket.on("init", data => {
  id = data.id;
});

// Nhận trạng thái từ server: tất cả tàu + trái cây
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

  // Vẽ từng người chơi
  for (const playerId in train) {
    const t = train[playerId];
    ctx.fillStyle = playerId === id ? "blue" : "gray";

    // Vẽ các toa
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

  // ✅ Hiển thị điểm số người chơi góc trên trái
  if (train[id]) {
    const score = Math.floor(train[id].length - 5);
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`Điểm: ${score}`, 20, 30);
  }

  requestAnimationFrame(draw);
}
draw();
