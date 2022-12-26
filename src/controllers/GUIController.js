import { GameController } from "./GameController.js";

export class GUIController {

    init() {
        // screens
        this.startMenu = document.getElementById("start-menu-container");
        this.scoreboard = document.getElementById("scoreboard");
        this.gameSettings = document.getElementById("game-settings");
        this.gameGUI = document.getElementById("game-gui");

        // buttons/divs with events
        this.btnGameSettings = document.getElementById("btnGameSettings");
        this.btnScoreboard = document.getElementById("btnScoreboard");
        this.divHideScoreboard = document.getElementById("divHideScoreboard");
        this.btnStartScoredGame = document.getElementById("btnStartScoredGame");

        // get canvas
        this.canvas = document.getElementById('game-canvas');

        // bind events to self
        this._bind = this._bind.bind(this);
        this._bind();

        // register events
        this.btnGameSettings.addEventListener("click", this.showGameSettings);
        this.btnScoreboard.addEventListener("click", this.showScoreboard);
        this.divHideScoreboard.addEventListener("click", this.hideScoreboard);
        this.btnStartScoredGame.addEventListener("click", this.startScoredGame);

        // create game controller instance 
        this.gameController = new GameController(this.canvas);

        // state stores picked planet and other user settings
        this.state = this.init_state;
    }

    _bind() {
        this.showGameSettings = this.showGameSettings.bind(this);
        this.showScoreboard = this.showScoreboard.bind(this);
        this.hideScoreboard = this.hideScoreboard.bind(this);
        this.startScoredGame = this.startScoredGame.bind(this);
    }

    get init_state() {
        return {};
    }

    setState(newState) {
        this.state = {
            ...this.state,
            ...newState
        };
    }

    hideScoreboard() {
        this.scoreboard.style.display = "none";
    }
    
    showScoreboard() {
        // TODO: read users from localstorage
        this.scoreboard.style.display = "block";
    }
    
    showGameSettings() {
        debugger
        this.gameSettings.style.display = "block";
    }
    
    async startScoredGame() {
        this.startMenu.style.display = "none";
        this.gameSettings.style.display = "none";
        this.gameGUI.style.display = "block";

        
        await this.gameController.init();
        document.querySelector('.loader-container').remove();
    }
}
