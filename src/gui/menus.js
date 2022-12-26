import { App } from "../App.js";

// screens
const startMenu = document.getElementById("start-menu-container");
const scoreboard = document.getElementById("scoreboard");
const gameSettings = document.getElementById("game-settings");

// buttons/divs with events
const btnGameSettings = document.getElementById("btnGameSettings");
const btnScoreboard = document.getElementById("btnScoreboard");
const divHideScoreboard = document.getElementById("divHideScoreboard");
const btnStartScoredGame = document.getElementById("btnStartScoredGame");

// register events
btnGameSettings.addEventListener("click", showGameSettings);
btnScoreboard.addEventListener("click", showScoreboard);
divHideScoreboard.addEventListener("click", hideScoreboard);
btnStartScoredGame.addEventListener("click", startScoredGame);

function hideScoreboard() {
    scoreboard.style.display = "none";
}

function showScoreboard() {
    // TODO: read users from localstorage
    scoreboard.style.display = "block";
}

function showGameSettings() {
    gameSettings.style.display = "block";
}

async function startScoredGame() {
    startMenu.style.display = "none";
    gameSettings.style.display = "none";
    
    const canvas = document.getElementById('game-canvas');
    const app = new App(canvas);
    await app.init();
    document.querySelector('.loader-container').remove();
}

// To ignore start menu uncomment the following line:
// startScoredGame();
