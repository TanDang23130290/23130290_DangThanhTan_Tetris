// Quản lý các màn hình
const screen = {
    Mainmenu: document.getElementById("main-menu"),
    Stagemenu: document.getElementById("select-menu"),
    Playmenu: document.getElementById("play-menu"),
    GameOvermenu: document.getElementById("gameover-menu")
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
// Nút pause
const screenGameOver = document.getElementById("gameover-menu");
document.getElementById("btn-pause-button").addEventListener("click", () => {
    isPaused = !isPaused;
    document.getElementById("btn-pause-button").innerText = isPaused ? "▶" : "⏸";
});


//Nút chơi lại
document.getElementById("btn-restart").addEventListener("click", () => {
    board = Array.from({ length: Rows }, () => Array(Cols).fill(0));
    score = 0;
    document.getElementById("score-value").innerText = "0000";
    ShowScreen(screen.Playmenu);
    isPaused = false;
    DrawGrid(); // Xóa sạch Canvas cũ
    spawnPiece();
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
});

// Nút quay lại chọn màn khi game over
document.getElementById("btn-back-to-select").addEventListener("click", () => {
    ShowScreen(screen.Stagemenu);
});

// Click nút (X) để thoát về màn hình chọn màn chơi
document.getElementById("btn-close-button").addEventListener("click", () => {
    ShowScreen(screen.Stagemenu);
});
// Click vào nút Màn 1 để vào giao diện chơi Tetris
document.querySelector(".Stage1").addEventListener("click", () => {
    ShowScreen(screen.Playmenu);
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

//Tạo công cụ hỗ trợ
let toolCounts = {
    pickaxe: 3,
    bomb: 3,
    clock: 3,
    dumbbell: 3
};
let mousePos = { x: -1, y: -1 }; // Lưu tọa độ chuột trên canvas

let activeClockEffect = false; // Trạng thái đồng hồ
let selectedTool = null;       // Lưu công cụ đang chờ chọn vị trí (dành cho Cuốc chim / Bom)

let board = Array.from({ length: Rows }, () => Array(Cols).fill(0));  // Vẽ bảng
let score =0;
let isPaused=false;
let nextPiece=null;
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
     if(!nextPiece) {
         //lần đầu tiên tạo khối thì tạo khối hiện tại và khối tiếp theo
         currentPiece.shape = shape[Math.floor(Math.random() * shape.length)].shape;
         currentPiece.color = shape[Math.floor(Math.random() * shape.length)].color;
     } else {
         //đẩy khối tiếp theo lên làm khối hiện tại
         currentPiece.shape = nextPiece.shape;
         currentPiece.color = nextPiece.color;
     }
     //Tạo 1 khối tiếp theo
    const randomNext = shape[Math.floor(Math.random() * shape.length)];
    nextPiece = { shape: randomNext.shape, color: randomNext.color };
    currentPiece.x = Math.floor(Cols / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentPiece.y = 0;
    drawNextPiece(); // Vẽ lên ô dự báo
}
// Vẽ khối tiếp theo lên ô dự báo
function drawNextPiece() {
    nextCtx.fillStyle = '#08091a';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    if (nextPiece && nextPiece.shape) {
        const blockSize = 18; // ép kích thước khối xuống cho vừa ô dự báo
        const pieceWidth = nextPiece.shape[0].length;
        const pieceHeight = nextPiece.shape.length;

        // căn giữa khối trong ô dự báo
        const offsetX = (nextCanvas.width - pieceWidth * blockSize) / 2;
        const offsetY = (nextCanvas.height - pieceHeight * blockSize) / 2;
        nextPiece.shape.forEach((row, r) => {
            row.forEach((value, c) => {
                if (value) {
                    nextCtx.fillStyle = nextPiece.color;
                    nextCtx.fillRect(offsetX + c * blockSize, offsetY + r * blockSize, blockSize, blockSize);
                    nextCtx.strokeStyle = '#08091a';
                    nextCtx.lineWidth = 1;
                    nextCtx.strokeRect(offsetX + c * blockSize, offsetY + r * blockSize, blockSize, blockSize);
                }
            });
        });
    }
}

//Vẽ khối
    function drawBlock(ctx, x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * Block_Size, y * Block_Size, Block_Size, Block_Size);

        //Tạo viền cho khối
        ctx.strokeStyle = '#08091a';
        ctx.lineWidth = 2;
        ctx.strokeRect(x * Block_Size, y * Block_Size, Block_Size, Block_Size);
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
        //Vẽ vùng hiển thị vị trí bị phá khí sử dụng cuốc chim và bom
        if (selectedTool && mousePos.x >= 0 && mousePos.y >= 0) {
            const targetCol = Math.floor(mousePos.x / Block_Size);
            const targetRow = Math.floor(mousePos.y / Block_Size);

            ctx.fillStyle = 'rgba(255, 0, 0, 0.35);'; // Màu đỏ mờ cảnh báo phá hủy
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;

            if (selectedTool === 'pickaxe') {
                // Cuốc chim: hiển thị phá 2 hàng dọc
                let col1 = targetCol;
                let col2 = targetCol + 1 < Cols ? targetCol + 1 : targetCol - 1;
                if (col2 < 0) col2 = 0;

                [col1, col2].forEach(c => {
                    if (c >= 0 && c < Cols) {
                        ctx.fillRect(c * Block_Size, 0, Block_Size, canvas.height);
                        ctx.strokeRect(c * Block_Size, 0, Block_Size, canvas.height);
                    }
                });
            } else if (selectedTool === 'bomb') {
                // Bom: hiển thị phá 2 hàng ngang
                let row1 = targetRow;
                let row2 = targetRow + 1 < Rows ? targetRow + 1 : targetRow - 1;
                if (row2 < 0) row2 = 0;

                [row1, row2].forEach(r => {
                    if (r >= 0 && r < Rows) {
                        ctx.fillRect(0, r * Block_Size, canvas.width, Block_Size);
                        ctx.strokeRect(0, r * Block_Size, canvas.width, Block_Size);
                    }
                });
            }
        }
    }

// Cấu hình tickrate cho game
    let dropCounter = 0;
    let dropInterval = 1000; // Khối gạch rơi xuống sau mỗi 1000ms (khoảng 1s)
    let lastTime = 0;

// Tạo vòng lặp chạy game chuẩn
    function gameLoop(time = 0) {
        if (isPaused) {
            lastTime = time; // Cập nhật lại thời gian để tránh bị tua nhanh khi bấm tiếp tục
            requestAnimationFrame(gameLoop);
            return;
        }
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
                // Kiểm tra điều kiện game over
                if (collide(currentPiece, 0, 0)) {
                    isPaused = true;
                    document.getElementById("final-score").innerText = score;
                    ShowScreen(screen.GameOvermenu);
                    return;
                }
            }
            dropCounter = 0;
        }

        drawGame();
        requestAnimationFrame(gameLoop);
    }

//Kiểm tra va chạm tránh khối gạch xoay vào tường
    function collide(piece, offsetX, offsetY) {
        for (let r = 0; r < piece.shape.length; r++) {
            for (let c = 0; c < piece.shape[r].length; c++) {
                if (piece.shape[r][c] !== 0) {
                    let newX = piece.x + c + offsetX;
                    let newY = piece.y + r + offsetY;
                    //kiểm tra va chạm biên trái, phải, đáy
                    if (newX < 0 || newX >= Cols || newY >= Rows) {
                        return true;
                    }
                    //kiểm tra va chạm các khối khác
                    if (newY >= 0 && board[newY][newX] != 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

//Xử lý thao tác bàn phím
    document.addEventListener('keydown', event => {
        if (isPaused) return; // Không nhận phím khi đang tạm dừng
        if (event.key === 'ArrowLeft') {
            //dịch sang trái
            if (!collide(currentPiece, -1, 0)) {
                currentPiece.x--;
            }
            //dịch sang phải
        } else if (event.key === 'ArrowRight') {
            if (!collide(currentPiece, 1, 0)) {
                currentPiece.x++;
            }
            //thả nhanh xuống 1 ô
        } else if (event.key === 'ArrowDown') {
            if (!collide(currentPiece, 0, 1)) {
                currentPiece.y++;
                dropCounter = 0; //làm mới thời gian rơi tự động
            }
        } else if (event.key === 'ArrowUp') {
            rotatePiece();
        }
    });

//Xoay khối gạch
    function rotatePiece() {
        let originalShape = currentPiece.shape;
        // Thuật toán transpose + reverse
        let transposed = currentPiece.shape[0].map((_, colIndex) =>
            currentPiece.shape.map(row => row[colIndex])
        );
        currentPiece.shape = transposed.reverse();
        // Kiểm tra nếu xoay xong mà bị kẹt tường thì đẩy ra hoặc hủy xoay
        let offset = 1;
        while (collide(currentPiece, 0, 0)) {
            currentPiece.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > currentPiece.shape[0].length) {
                currentPiece.shape = originalShape; // Hoàn tác nếu kẹt cứng
                break;
            }
        }
    }

//Khóa khối gạch vào bảng
    function mergePiece() {
        currentPiece.shape.forEach((row, r) => {
            row.forEach((value, c) => {
                if (value !== 0) {
                    let boardY = currentPiece.y + r;
                    let boardX = currentPiece.x + c
                    if (boardY >= 0) {
                        boardY = Math.min(boardY, Rows - 1);
                        boardX = Math.max(0, Math.min(boardX, Cols - 1));
                        board[boardY][boardX] = currentPiece.color;//lưu màu sắc khối vào bảng

                    }
                }
            });
        });
    }

//logic dọn hàng
    function clearLines() {
        let rowCount = 0;
        outer: for (let r = Rows - 1; r >= 0; r--) {
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
        // Cộng điểm nếu có xóa hàng (1 hàng 100, 2 hàng 300...)
        if (rowCount > 0) {
            const points = [0, 100, 300, 500, 800];
            score += points[rowCount] || (rowCount * 100);
            document.getElementById("score-value").innerText = String(score).padStart(4, '0');
        }
    }
    //Hàm reset lại công cụ hỗ trợ khi chơi lại
function resetTools() {
    toolCounts = { pickaxe: 3, bomb: 3, clock: 3, dumbbell: 3 };
    activeClockEffect = false;
    selectedTool = null;
    document.querySelectorAll(".tool-count").forEach((el, index) => {
        el.innerText = "3";
    });
}
//Chức năng của cuốc chim
function usePickaxe(colIndex) {
    if (toolCounts.pickaxe <= 0) return;
    for (let r = 0; r < Rows; r++) {
        board[r][colIndex] = 0;
        if (colIndex + 1 < Cols) board[r][colIndex + 1] = 0;
    }
    toolCounts.pickaxe--;
    updateToolUI('tool-pickaxe', toolCounts.pickaxe);
}
//Xử lý chọn vị trí sử dụng của cuốc chim
//Chức năng của bom
function useBomb(rowIndex) {
    if (toolCounts.bomb <= 0) return;
    board[rowIndex].fill(0);
    if (rowIndex + 1 < Rows) {
        board[rowIndex + 1].fill(0);
    }
    toolCounts.bomb--;
    updateToolUI('tool-bomb', toolCounts.bomb);
}
//Chức năng của đồng hồ
document.getElementById("tool-clock").addEventListener("click", () => {
    if (toolCounts.clock <= 0 || isPaused) return;
    activeClockEffect = !activeClockEffect;

    // Nếu bật đồng hồ, giảm thời gian giãn cách rơi xuống 30% (từ 1000ms còn 700ms)
    dropInterval = activeClockEffect ? 700 : 1000;

    toolCounts.clock--;
    updateToolUI('tool-clock', toolCounts.clock);
});
 //Chức năng của quả tạ
function useDumbbell() {
    if (toolCounts.dumbbell <= 0) return;
    // Duyệt qua từng cột từ dưới lên để dồn các ô có màu rơi xuống sát nhau
    for (let c = 0; c < Cols; c++) {
        let colValues = [];
        for (let r = 0; r < Rows; r++) {
            if (board[r][c] !== 0) {
                colValues.push(board[r][c]);
                board[r][c] = 0;
            }
        }
        // Đặt lại các khối từ đáy bàn cờ dồn lên
        let startRow = Rows - colValues.length;
        for (let i = 0; i < colValues.length; i++) {
            board[startRow + i][c] = colValues[i];
        }
    }

    toolCounts.dumbbell--;
    updateToolUI('tool-dumbbell', toolCounts.dumbbell);
}
//Cập nhật lại số lần sử dụng công cụ lên giao diện
function updateToolUI(elementId, count) {
    const btn = document.getElementById(elementId);
    if (btn) {
        btn.querySelector(".tool-count").innerText = count;
    }
}

// click chọn Màn 1 để bắt đầu chơi
    document.querySelector(".Stage1").addEventListener("click", () => {
        ShowScreen(screen.Playmenu);
        spawnPiece(); // Tạo khối gạch đầu tiên
        lastTime = performance.now();
        requestAnimationFrame(gameLoop); // Bắt đầu chạy vòng lặp game
    });



