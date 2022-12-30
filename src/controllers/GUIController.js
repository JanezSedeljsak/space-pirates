import { GameController } from "./GameController.js";
import { ScoreBoardController } from "./ScoreBoardController.js";
import { SoundController } from "./SoundController.js";

export class GUIController {

    init() {
        //  variables
        this.timer = 0;
        this.timerInterval = undefined;
        this.score = 0;
        this.isSandbox = false;

        // screens
        this.startMenu = document.getElementById("start-menu-container");
        this.scoreboard = document.getElementById("scoreboard");
        this.gameSettings = document.getElementById("game-settings");
        this.gameGUI = document.getElementById("game-gui");
        this.loader = document.querySelector('.loader-container');
        this.selectedPlanet = document.getElementById('selected-planet');
        this.startGUI = document.getElementById("start-gui");

        // buttons/divs with events
        this.btnGameSettings = document.getElementById("btnGameSettings");
        this.btnScoreboard = document.getElementById("btnScoreboard");
        this.divHideScoreboard = document.getElementById("divHideScoreboard");
        this.divHideGameSettings = document.getElementById("divHideGameSettings");
        this.btnStartScoredGame = document.getElementById("btnStartScoredGame");
        this.btnStartSandboxGame = document.getElementById("btnStartSandboxGame");
        this.gameTimer = document.getElementById("gameTimer");
        this.gameScore = document.getElementById("gameScore");
        this.countdown = document.getElementById("countdown");

        // get canvas
        this.canvas = document.getElementById('game-canvas');
        this.canvas.addEventListener('click', () => this.canvas.requestPointerLock());

        // bind events to self
        this._bind = this._bind.bind(this);
        this._bind();
        
        // create game controller instance 
        this.gameController = new GameController(this, this.canvas);

        // read current selected planet from game controller state
        const { planetName } = this.gameController.state;
        this.selectedPlanet.innerHTML = planetName;

        // register events
        this.btnGameSettings.addEventListener("click", this.showGameSettings);
        this.btnScoreboard.addEventListener("click", this.showScoreboard);
        this.divHideScoreboard.addEventListener("click", this.hideScoreboard);
        this.divHideGameSettings.addEventListener("click", this.hideGameSettings);
        this.btnStartScoredGame.addEventListener("click", this.startScoredGame);
        this.btnStartSandboxGame.addEventListener("click", this.startSandboxGame);
        this.startGUI.addEventListener("click", this.startGameCountdown);

        document.addEventListener('keydown', this.handleKeyDown);
        document.querySelectorAll('.planet').forEach(planet => {
            planet.style.background = `url('../../assets/images/planets_min/${planet.id}.avif') repeat-x`;
            planet.addEventListener('click', () => {
                this.selectedPlanet.innerHTML = planet.id;
                this.gameController.setState({ planetName: planet.id })
            });
        });

        // add scoreboard controller
        this.scoreboardController = new ScoreBoardController();
        // add sound controller
        this.soundController = new SoundController(this.gameController);

        // bind game events
        document.addEventListener('pointerlockchange', e => this.gameController.pointerLockChange(e));
    }

    _bind() {
        this.showGameSettings = this.showGameSettings.bind(this);
        this.showScoreboard = this.showScoreboard.bind(this);
        this.hideScoreboard = this.hideScoreboard.bind(this);
        this.startScoredGame = this.startScoredGame.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.hideGameSettings = this.hideGameSettings.bind(this);
        this.startGameCountdown = this.startGameCountdown.bind(this);
        this.startSandboxGame = this.startSandboxGame.bind(this);
    }

    async handleKeyDown(event) {
        switch (event.code) {
            case 'KeyV':
                this.gameController.toggleFirstPerson();
                break;
            case 'KeyR':
                await this.gameController.start();
                break;
            case 'KeyM':
                alert("open menu");
                break;
            case 'Escape':
                this.startMenu.style.display = "block";
                this.gameGUI.style.display = "none";
                this.startGUI.style.display = "none";
                this.endGame();
                break;
            default:
                return;
        }
    }

    hideScoreboard() {
        this.scoreboard.style.display = "none";
    }

    hideGameSettings() {
        this.gameSettings.style.display = "none";
    }
    
    showScoreboard() {
        this.scoreboardController.drawScoreboard();
        this.scoreboard.style.display = "block";
    }
    
    showGameSettings() {
        this.gameSettings.style.display = "block";
    }
    
    async startScoredGame() {
        this.isSandbox = false;
        this.startMenu.style.display = "none";
        this.gameGUI.style.display = "block";

        await this.gameController.init();
        this.loader.style.display = "none";
        this.startGUI.style.display = "block";
    }

    async startSandboxGame() {
        this.isSandbox = true;
        this.gameGUI.classList.add("sandbox");
        this.countdown.innerHTML = "Fly around and explore!"
        this.startMenu.style.display = "none";
        this.gameGUI.style.display = "block";
        
        await this.gameController.init();
        this.loader.style.display = "none";
        this.startGUI.style.display = "block";
    }

    startGameCountdown() {
        if (this.isSandbox) {
            this.startGUI.style.display = "none";
            this.canvas.click();
            return;
        }
        this.countdown.style.fontSize = "6rem";
        this.countdown.innerHTML = "3";
        setTimeout(() => this.countdown.innerHTML = "2", 1000);
        setTimeout(() => this.countdown.innerHTML = "1", 2000);
        setTimeout(() => {
            this.countdown.style.fontSize = "3rem";
            this.startGUI.style.display = "none";
            this.canvas.click();
            this.startGameTimer();
        }, 3000);
    }

    parseTimer() {
        const padNumber = num => num.toString().padStart(2, '0');
        return `${padNumber(Math.floor(this.timer / 60))}:${padNumber(this.timer % 60)}`
    }

    _updateGameTimer() {
        this.gameTimer.innerHTML = this.parseTimer();
        this.timer++;
    }

    startGameTimer() {
        this._updateGameTimer();
        this.timerInterval = setInterval(this._updateGameTimer.bind(this), 1000);
    }

    endGame() {
        clearInterval(this.timerInterval);
        this.countdown.innerHTML = "Collect all 10 commets!";
        this.gameGUI.classList.remove("sandbox");
    }

    _updateGameScore() {
        this.gameScore.innerHTML = `${this.score} / 10`;
    }

    addGameScore() {
        this.score++;
        this._updateGameScore();
    }
}
