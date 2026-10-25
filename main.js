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
    ctx.fillStyle = color;
    ctx.fillRect(x * Block_Size, y * Block_Size, Block_Size, Block_Size);

    //Tạo viền cho khối
    ctx.strokeStyle = '#08091a';
    ctx.lineWidth = 2;
    ctx.strokeRect(x* Block_Size, y*Block_Size, Block_Size, Block_Size);
}
//Vẽ bàn chơi
function drawGame() {
    ctx.fillStyle = '#08091a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#151838';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += Block_Size) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += Block_Size) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    // Vẽ khối gạch đang rơi
    if (currentPiece.shape) {
        currentPiece.shape.forEach((row, r) => {
            row.forEach((value, c) => {
                if (value) {
                    drawBlock(ctx, currentPiece.x + c, currentPiece.y + r, currentPiece.color);
                }
            });
        });
    }
    // Vẽ các khối đã nằm cố định trên board từ trước
    board.forEach((row, r) => {
        row.forEach((color, c) => {
            if (color !== 0) {
                drawBlock(ctx, c, r, color);
            }
        });
    });
}
// Cấu hình tickrate cho game
let dropCounter = 0;
let dropInterval = 1000; // Khối gạch rơi xuống sau mỗi 1000ms (khoảng 1s)
let lastTime = 0;

// Tạo vòng lặp chạy game chuẩn
function gameLoop(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        // Kiểm tra nếu dịch xuống 1 ô mà bị va chạm
        if (!collide(currentPiece, 0, 1)) {
            currentPiece.y++;
        } else {
            // Đã chạm đáy hoặc chạm khối khác -> Khóa lại
            mergePiece();
            clearLines();
            spawnPiece();
            // Kiểm tra điều kiện thua (Game Over)
            if (collide(currentPiece, 0, 0)) {
                alert("Game Over! Bạn đã thua.");
                board = Array.from({ length: ROWS }, () => Array(COLS).fill(0)); // Reset bàn chơi
                spawnPiece();
            }
        }
        dropCounter = 0;
    }

    drawGame();
    requestAnimationFrame(gameLoop);
}
//Kiểm tra va chạm tránh khối gạch xoay vào tường
function collide(piece, offsetX, offsetY) {
    for(let r=0; r< piece.shape.length; r++){
        for (let c = 0; c<piece.shape[r].length; c++) {
            if(piece.shape[r][c] !==0) {
                let newX = piece.x + c +offsetX;
                let newY =piece.y +r +offsetY;
                //kiểm tra va chạm biên trái, phải, đáy
                if(newX <0|| newX>=Cols||newY >=Rows){
                    return true;
                }
                //kiểm tra va chạm các khối khác
                if(newY >=0 && board[newY][newX]!=0){
                    return true;
                }
            }
        }
    }
    return false;
}
//Xử lý thao tác bàn phím
document.addEventListener('keydown', event =>{
if(event.key ==='ArrowLeft') {
    //dịch sang trái
    if (!collide(currentPiece, -1, 0)) {
        currentPiece.x--;
    }
    //dịch sang phải
} else if(event.key ==='ArrowRight') {
    if (!collide(currentPiece, 1, 0)) {
        currentPiece.x++;
    }
    //thả nhanh xuống 1 ô
}else if (event.key === 'ArrowDown') {
    if (!collide(currentPiece, 0, 1)) {
        currentPiece.y++;
        dropCounter = 0; //làm mới thời gian rơi tự động
    }
}else if(event.key==='ArrowUp') {
    rotatePiece();
}
});
//Xoay khối gạch
function rotatePiece(){
    let originalShape = currentPiece.shape;
    // Thuật toán transpose + reverse
    let transposed = currentPiece.shape[0].map((_, colIndex) =>
        currentPiece.shape.map(row => row[colIndex])
    );
    currentPiece.shape = transposed.reverse();
    // Kiểm tra nếu xoay xong mà bị kẹt tường thì đẩy ra hoặc hủy xoay
    let offset = 1;
    while(collide(currentPiece, 0, 0)){
        currentPiece.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > currentPiece.shape[0].length){
            currentPiece.shape = originalShape; // Hoàn tác nếu kẹt cứng
            break;
        }
    }
}
//Khóa khối gạch vào bảng
function mergePiece(){
    currentPiece.shape.forEach((row,r) => {
        row.forEach((value,c) => {
            if (value!==0){
                let boardY = currentPiece.y + r;
                let boardX = currentPiece.x +c
                if(boardY >=0){
                    boardY= Math.min(boardY, Rows-1);
                    boardX= Math.max(0,Math.min(boardX, Cols  -1));
                    board[boardY][boardX] =currentPiece.color;//lưu màu sắc khối vào bảng

                }
            }
        });
    });
}
//logic dọn hàng
function clearLines(){
    let rowCount =0;
    outer: for (let r= Rows -1; r>=0 ;r--) {
        for (let c = 0; c < Cols; c++) {
            if (board[r][c] === 0) {
                continue outer; //nếu có 1 ô trống thì bỏ qua hàng này
            }
        }
        // Nếu hàng r đầy, cắt bỏ hàng đó và thêm một hàng trống 0 vào trên cùng
        const row = board.splice(r, 1)[0].fill(0);
        board.unshift(row);
        r++; // Kiểm tra lại hàng hiện tại sau khi dồn xuống
        rowCount++;
    }
    // Cộng điểm nếu có xóa hàng ( 1 hàng = 100 điểm, 4 hàng = 800 điểm)
    if (rowCount > 0) {
        // Bạn có thể cập nhật biến điểm số và hiển thị lên giao diện ở đây
        console.log(`Đã xóa ${rowCount} hàng!`);
    }
}



// click chọn Màn 1 để bắt đầu chơi
document.querySelector(".Stage1").addEventListener("click", () => {
    ShowScreen(screen.Playmenu);
    spawnPiece(); // Tạo khối gạch đầu tiên
    lastTime = performance.now();
    requestAnimationFrame(gameLoop); // Bắt đầu chạy vòng lặp game
});



