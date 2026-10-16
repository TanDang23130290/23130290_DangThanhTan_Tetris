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

//Vẽ lưới cho giao diện
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




