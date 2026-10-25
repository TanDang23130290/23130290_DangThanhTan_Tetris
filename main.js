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
    resetTools();             // Reset số lượng công cụ về 3
    resetToolButtonStyles();  // Reset màu nút bấm
    ShowScreen(screen.Playmenu);
    isPaused = false;
    DrawGrid(); //Vẽ lại viền hiển thị bàn chơi
    spawnPiece(); //Tạo khối đầu tiên
    startTimer();//Bắt đầu đếm thời gian
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
let score =0; //Điểm
let isPaused=false; //Trạng thái dừng
let nextPiece=null; //Khối tiếp theo
let currentStage = 1; //ghi lại màn chơi
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
    // Tạo 1 khối tiếp theo (cũng áp dụng tỷ lệ 30% khối xám nếu ở màn 2)
    let nextIsGray = (currentStage === 2 && Math.random() < 0.3);
    const randomNextShape = shape[Math.floor(Math.random() * shape.length)];
    const randomNextColor = nextIsGray ? '#7f8c8d' : randomNextShape.color;

    nextPiece = { shape: randomNextShape.shape, color: randomNextColor };

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

            ctx.fillStyle = 'rgba(255, 0, 0, 0.35)'; // Màu đỏ mờ cảnh báo phá hủy
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
    let gameSeconds = 0;      // Tổng số giây đã chơi
    let timerInterval = null; // Biến đếm thời gian
    let clockTimeout = null;  // Biến đếm ngược 30 giây hiệu lực của đồng hồ kỹ năng
    let lastFlipSecond = 0; // Lưu mốc giây lần đảo ngược gần nhất
//Hàm đếm thời gian chạy game
function startTimer() {
    clearInterval(timerInterval);
    gameSeconds = 0;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        if (!isPaused) {
            gameSeconds++;
            updateTimerDisplay();
            // Đặc trưng Màn 1-3: Cứ mỗi 30 giây bàn chơi sẽ đảo ngược 1 lần
            if (currentStage === 3 && gameSeconds > 0 && gameSeconds % 30 === 0 && gameSeconds !== lastFlipSecond) {
                lastFlipSecond = gameSeconds;

                // Lật ngược toàn bộ mảng board theo chiều dọc (Hàng trên cùng thành hàng dưới cùng và ngược lại)
                board.reverse();
                //Dồn tất cả các khối rơi xuống sát đáy theo từng cột để tránh bị lơ lửng hoặc chạm đỉnh vô lý
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
            }
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = String(Math.floor(gameSeconds / 60)).padStart(2, '0');
    const seconds = String(gameSeconds % 60).padStart(2, '0');
    const timeEl = document.getElementById("time-value");
    if (timeEl) {
        timeEl.innerText = `${minutes}:${seconds}`;
    }
}
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
                    isPaused = true; //Đổi trạng thái sang dừng gameUp
                    clearInterval(timerInterval); // Dừng bộ đếm thời gian
                    clearTimeout(clockTimeout);   // Dừng bộ đếm hiệu lực đồng hồ
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
    //Xử lý thao tác chuôt
canvas.addEventListener("mousemove", (event) => {
    if (!selectedTool) return;
    const rect = canvas.getBoundingClientRect();
    mousePos.x = event.clientX - rect.left;
    mousePos.y = event.clientY - rect.top;
});

// Rời chuột khỏi bảng thì ẩn hiển thị trước
canvas.addEventListener("mouseleave", () => {
    mousePos.x = -1;
    mousePos.y = -1;
});

// Xử lý click chọn vị trí để thi triển công cụ
canvas.addEventListener("click", (event) => {
    if (!selectedTool || isPaused) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const clickedCol = Math.floor(clickX / Block_Size);
    const clickedRow = Math.floor(clickY / Block_Size);

    if (selectedTool === 'pickaxe') {
        usePickaxe(clickedCol);
    } else if (selectedTool === 'bomb') {
        useBomb(clickedRow);
    }

    // Reset trạng thái sau khi dùng xong
    selectedTool = null;
    mousePos.x = -1;
    mousePos.y = -1;
    canvas.style.cursor = "default";
    resetToolButtonStyles();
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
                let boardX = currentPiece.x + c;
                if (boardY >= 0) {
                    boardY = Math.min(boardY, Rows - 1);
                    boardX = Math.max(0, Math.min(boardX, Cols - 1));
                    board[boardY][boardX] = currentPiece.color; // Lưu trực tiếp màu (xám hoặc màu thường)
                }
            }
        });
    });
}

//logic dọn hàng
    function clearLines() {
        let rowCount = 0;
        outer: for (let r = Rows - 1; r >= 0; r--) {
            let hasGrayBlock = false; // Khởi tạo lại trạng thái cho từng hàng
            for (let c = 0; c < Cols; c++) {
                if (board[r][c] === 0) {
                    continue outer; //nếu có 1 ô trống thì bỏ qua hàng này
                }
                if (board[r][c] === '#7f8c8d') {
                    hasGrayBlock = true; // Phát hiện có khối xám cản trở
                }
            }

            // Nếu hàng đầy nhưng chứa khối xám (ở Màn 2), không cho phép xóa hàng này!
            if (currentStage === 2 && hasGrayBlock) {
                continue outer;
            }
            // Nếu hàng r đầy và không bị chặn bởi khối xám, tiến hành cắt bỏ và dồn xuống
            const row = board.splice(r, 1)[0].fill(0);
            board.unshift(row);
            r++;
            rowCount++;
        }
        // Cộng điểm nếu có xóa hàng (1 hàng 100, 2 hàng 300...)
        if (rowCount > 0) {
            const points = [0, 100, 300, 500, 800];
            let basePoints = points[rowCount] || (rowCount * 100);

            // Nếu đồng hồ đang kích hoạt, thưởng thêm 30% điểm
            if (activeClockEffect) {
                basePoints = Math.round(basePoints * 1.3);
            }
            score +=  basePoints;
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
    let row1 = rowIndex;
    let row2 = rowIndex + 1;

    if (row2 >= Rows) {
        row2 = Rows - 1;
        row1 = Rows - 2;
    }

    if (row1 >= 0 && row1 < Rows) board[row1].fill(0);
    if (row2 >= 0 && row2 < Rows) board[row2].fill(0);

    toolCounts.bomb--;
    updateToolUI('tool-bomb', toolCounts.bomb);
}
//Chức năng của đồng hồ
document.getElementById("tool-clock").addEventListener("click", () => {
    // Nếu hết lượt hoặc đồng hồ đang trong thời gian hiệu lực 30s thì không bấm được nữa
    if (toolCounts.clock <= 0 || isPaused || activeClockEffect) return;

    activeClockEffect = true;
    dropInterval = 700; // Tăng tốc độ rơi (giảm 30% thời gian)
    toolCounts.clock--;
    updateToolUI('tool-clock', toolCounts.clock);

    // Hủy đếm ngược cũ (nếu có) và thiết lập tự động tắt hiệu lực sau 30 giây
    clearTimeout(clockTimeout);
    clockTimeout = setTimeout(() => {
        activeClockEffect = false;
        dropInterval = 1000; // Trả lại tốc độ rơi bình thường
    }, 30000); // 30000 ms = 30 giây
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
//Hàm reset hiệu ứng sáng trên thanh công cụ
function resetToolButtonStyles() {
    document.querySelectorAll(".toolbox .item").forEach(btn => {
        btn.style.borderColor = "#4e54c8";
        btn.style.background = "#252850";
    });
}
//Xử lý chuột khi chọn công cụ
document.getElementById("tetris-canvas").addEventListener("click", (event) => {
    if (!selectedTool || isPaused) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Tính toán xem click vào cột mấy, hàng mấy dựa vào Block_Size
    const clickedCol = Math.floor(clickX / Block_Size);
    const clickedRow = Math.floor(clickY / Block_Size);

    if (selectedTool === 'pickaxe') {
        usePickaxe(clickedCol);
    } else if (selectedTool === 'bomb') {
        useBomb(clickedRow);
    }

    selectedTool = null; // Reset trạng thái chọn công cụ sau khi dùng xong
    canvas.style.cursor = "default";
});
// Gán sự kiện click vào icon trên thanh công cụ để kích hoạt chế độ chọn vị trí
//Cuốc chim
document.getElementById("tool-pickaxe").addEventListener("click", () => {
    if (toolCounts.pickaxe <= 0 || isPaused) return;

    if (selectedTool === 'pickaxe') {
        // Click lần 2 để hủy
        selectedTool = null;
        canvas.style.cursor = "default";
        resetToolButtonStyles();
    } else {
        selectedTool = 'pickaxe';
        canvas.style.cursor = "crosshair";
        resetToolButtonStyles();
        document.getElementById("tool-pickaxe").style.borderColor = "#00f0ff";
        document.getElementById("tool-pickaxe").style.background = "#383c7a";
    }
});
//Bom
document.getElementById("tool-bomb").addEventListener("click", () => {
    if (toolCounts.bomb <= 0 || isPaused) return;

    if (selectedTool === 'bomb') {
        // Click lần 2 để hủy
        selectedTool = null;
        canvas.style.cursor = "default";
        resetToolButtonStyles();
    } else {
        selectedTool = 'bomb';
        canvas.style.cursor = "crosshair";
        resetToolButtonStyles();
        document.getElementById("tool-bomb").style.borderColor = "#00f0ff";
        document.getElementById("tool-bomb").style.background = "#383c7a";
    }
});
//Quả tạ
document.getElementById("tool-dumbbell").addEventListener("click", () => {
    useDumbbell();
});
// click chọn Màn 1 để bắt đầu chơi
document.querySelectorAll("[data-stage]").forEach(btn => {
    btn.addEventListener("click", () => {
        currentStage = parseInt(btn.getAttribute("data-stage"));
        ShowScreen(screen.Playmenu);

        // Cập nhật tiêu đề hiển thị màn chơi ở sidebar (ví dụ: 1-2, 1-3...)
        document.querySelector(".stage-title").innerText = `1-${currentStage}`;
        board = Array.from({length: Rows}, () => Array(Cols).fill(0));
        score = 0;
        gameSeconds = 0;
        lastFlipSecond = 0; // Reset mốc lật bàn chơi
        document.getElementById("score-value").innerText = "0000";
        resetTools();             // Reset số lượng công cụ về 3 khi vào màn chơi mới
        resetToolButtonStyles();  // Reset giao diện nút công cụ
        spawnPiece(); //Tạo khối đầu tiên
        startTimer(); //Bắt đầu đếm thời gian
        isPaused = false;
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    });
});



