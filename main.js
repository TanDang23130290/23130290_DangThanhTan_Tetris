// Quản lý các màn hình
const screen ={
    Mainmenu: document.getElementById("main-menu"),
    Stagemenu: document.getElementById("select-menu"),
    Playmenu: document.getElementById("play-menu")
};
//Chức năng hiển thị màn hình
function ShowScreen(ShowedScreen) {
    Object.value(screen).forEach(screen => {
        screen.classList.remove("active");
    });
 ShowedScreen.classList.add("active");

}
//Xử lý chuyển đổi màn hình
document.getElementById("btn-play-button").addEventListener("click", () =>{
    ShowScreen(screen.Stagemenu);
});

//
document.getElementById("btn-back-to-menu").addEventListener("click", () =>{
    ShowScreen(screen.Mainmenu);
});
const stageNum = e.currentTarget.getAttribute('data-stage');
document.getElementById('current-stage-display').textContent = stageNum;
showScreen(screens.gameScreen);

document.getElementById('btn-back-to-stage').addEventListener('click', () => {
    showScreen(screens.stageSelect);
});

