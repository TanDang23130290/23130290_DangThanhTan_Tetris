// Quản lý các màn hình
const screen = {
    Mainmenu: document.getElementById("main-menu"),
    Stagemenu: document.getElementById("select-menu"),
    Playmenu: document.getElementById("play-menu")
};

// Chức năng hiển thị màn hình
function ShowScreen(ShowedScreen) {
    Object.values(screen).forEach(s => {
        s.classList.remove("active");
        s.classList.remove("screen-active");
    });
    ShowedScreen.classList.add("active");
}

// Xử lý chuyển đổi màn hình
document.getElementById("btn-play-button").addEventListener("click", () => {
    ShowScreen(screen.Stagemenu);
});

// Nút quay lại menu chính từ màn chọn màn
document.getElementById("btn-back-to-menu").addEventListener("click", () => {
    ShowScreen(screen.Mainmenu);
});

// Click vào nút Màn 1 để vào giao diện chơi Tetris
document.querySelector(".Stage1").addEventListener("click", () => {
    ShowScreen(screen.Playmenu);
});

// Click nút (X) để thoát về màn hình chọn màn chơi
document.getElementById("btn-close-button").addEventListener("click", () => {
    ShowScreen(screen.Stagemenu);
});
//Khởi tạo giao diện Canvas
const canvas = document.getElementById('tetris-canvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');

//Vẽ lưới cho giao diện hiển thi
function DrawGrid(){
    //Vẽ phông nền
    ctx.fillStyle = '#08091a';
    ctx.fillRect(0,0, canvas.width, canvas.height);
    //Vẽ đường lưới mờ
    ctx.strokeStyle = '#151838';
    ctx.lineWidth =1;

    for (let x = 0; x < canvas.width; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    //Nền Canvas cho ô dự báo
    nextCtx.fillStyle = '#08091a';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
}
DrawGrid();


//Viết Logic cho gameplay


//Tạo bàn Tetris (Giao diện xử lý logic) (
const Cols = 10;   //Cột
const Rows = 20;    //Hàng
const Block_Size = 24;  //Kích cỡ khối


let board = Array.from({ length: Rows }, () => Array(Cols).fill(0));  // Vẽ bảng

//Tạo khối
const shape =[
    { shape: [[1, 1, 1, 1]], color: '#00f0ff' }, //  - Xanh lam
    { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000ff' }, //  - Xanh dương
    { shape: [[0, 0, 1], [1, 1, 1]], color: '#ffaa00' }, //  - Cam
    { shape: [[1, 1], [1, 1]], color: '#ffff00' }, //  - Vàng
    { shape: [[0, 1, 1], [1, 1, 0]], color: '#00ff00' }, //  - Xanh lá
    { shape: [[0, 1, 0], [1, 1, 1]], color: '#aa00ff' }, //  - Tím
    { shape: [[1, 1, 0], [0, 1, 1]], color: '#ff0000' }  //  - Đỏ}
];





//Khối gạch đang rơi

let currentPiece ={
    shape:null,
    color:'',
    x:0,
    y:0

};

//Tạo khối ngẫu nhiên
function spawnPiece(){
    const randomPiece = shape[Math.floor(Math.random() * shape.length)];
    currentPiece.shape = randomPiece.shape;
    currentPiece.color = randomPiece.color;

    //Set vị trí rơi của khối là ở giữa trên cùng
    currentPiece.x = Math.floor(Cols /2) - Math.floor(currentPiece.shape[0].length/2);
    currentPiece.y =0;
}

//Vẽ khối
function drawBlock(ctx, x, y, color) {
    ctx.fillRect(x* Block_Size, y*Block_Size, Block_Size, Block_Size);
    ctx.fillStyle(Color);

    //Tạo viền cho khối
    ctx.strokeStyle = '#08091a';
    ctx.lineWidth = 2;
    ctx.strokeRect(x* Block_Size, y*Block_Size, Block_Size, Block_Size);
}


