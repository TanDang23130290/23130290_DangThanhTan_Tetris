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