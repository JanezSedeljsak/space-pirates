import { GameController } from "./GameController.js";
import { ScoreBoardController } from "./ScoreBoardController.js";
import { SoundController } from "./SoundController.js";
import { END_GAME_SCORE } from "../config.js";
import { Utils } from "../core/Utils.js";

export class GUIController {

    init() {
        //  variables
        this.timer = 0;
        this.timerInterval = undefined;
        this.speedInterval = undefined;
        this.score = 0;
        this.isSandbox = false;
        this.isStarted = false;
        this.isPaused = false;

        // get canvas
        this.canvas = document.getElementById('game-canvas');
        this.canvas.addEventListener('click', () => this.canvas.requestPointerLock());
        
        // create game controller instance 
        this.gameController = new GameController(this, this.canvas);
        this.gameController.init();

        // screens
        this.startMenu = document.getElementById("start-menu-container");
        this.scoreboard = document.getElementById("scoreboard");
        this.gameSettings = document.getElementById("game-settings");
        this.gameGUI = document.getElementById("game-gui");
        this.loader = document.querySelector('.loader-container');
        this.selectedPlanet = document.getElementById('selected-planet');
        this.startGUI = document.getElementById("start-gui");
        this.pausedScreen = document.getElementById("paused-screen");
        this.addScoreScreen = document.getElementById("add-score");

        // buttons/divs with events
        this.btnGameSettings = document.getElementById("btnGameSettings");
        this.btnScoreboard = document.getElementById("btnScoreboard");
        this.divHideScoreboard = document.getElementById("divHideScoreboard");
        this.divHideGameSettings = document.getElementById("divHideGameSettings");
        this.btnStartScoredGame = document.getElementById("btnStartScoredGame");
        this.btnStartSandboxGame = document.getElementById("btnStartSandboxGame");
        this.btnScoreSubmit = document.getElementById("btnScoreSubmit");
        this.inputUsernameSubmit = document.getElementById("username-submit");
        this.gameTimer = document.getElementById("gameTimer");
        this.gameScore = document.getElementById("gameScore");
        this.countdown = document.getElementById("countdown");
        this.speedGauge = document.getElementById("speed-gauge");

        // bind events to self
        this._bind = this._bind.bind(this);
        this._bind();

        // read current selected planet and username from game controller state
        const { planetName, username } = this.gameController.state;
        this.selectedPlanet.innerHTML = planetName;
        this.inputUsernameSubmit.value = username;

        // register events
        this.btnGameSettings.addEventListener("click", this.showGameSettings);
        this.btnScoreboard.addEventListener("click", this.showScoreboard);
        this.divHideScoreboard.addEventListener("click", this.hideScoreboard);
        this.divHideGameSettings.addEventListener("click", this.hideGameSettings);
        this.btnStartScoredGame.addEventListener("click", this.startScoredGame);
        this.btnStartSandboxGame.addEventListener("click", this.startSandboxGame);
        this.startGUI.addEventListener("click", this.startGame);
        this.pausedScreen.addEventListener("click", this.unpauseGame);
        this.btnScoreSubmit.addEventListener("click", this.addScoreToScoreboard);

        document.addEventListener('keydown', this.handleKeyDown);
        document.querySelectorAll('.planet').forEach(planet => {
            planet.style.background = `url('../../assets/images/planets_min/${planet.id}.avif') repeat-x`;
            planet.addEventListener('click', () => {
                this.selectedPlanet.innerHTML = planet.id;
                this.gameController.setState({ planetName: planet.id })
            });
        });

        // init scoreboard controller
        ScoreBoardController.init();

        // add sound controller
        this.soundController = new SoundController(this.gameController);

        // bind game events
        document.addEventListener('pointerlockchange', e => this.gameController.pointerLockChange(e));
        this.setGameLabel();
        this.resetScoreTimerGUI();
    }

    _bind() {
        this.showGameSettings = this.showGameSettings.bind(this);
        this.showScoreboard = this.showScoreboard.bind(this);
        this.hideScoreboard = this.hideScoreboard.bind(this);
        this.startScoredGame = this.startScoredGame.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.hideGameSettings = this.hideGameSettings.bind(this);
        this.startGame = this.startGame.bind(this);
        this.startGameCountdown = this.startGameCountdown.bind(this);
        this.startSandboxGame = this.startSandboxGame.bind(this);
        this.unpauseGame = this.unpauseGame.bind(this);
        this.addScoreToScoreboard = this.addScoreToScoreboard.bind(this);
    }

    async handleKeyDown(event) {
        if (!this.isStarted)
            return;

        switch (event.code) {
            case 'KeyV':
                this.gameController.toggleFirstPerson();
                break;
            case 'Escape':
                this.resetScoreTimerGUI();
                this.startMenu.style.display = "block";
                this.gameGUI.style.display = "none";
                this.startGUI.style.display = "none";
                this.endGame();
                break;
            case 'KeyP':
                this.gameController.plane.stop();
                this.pauseGame();
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
        ScoreBoardController.drawScoreboard();
        this.scoreboard.style.display = "block";
    }

    showGameSettings() {
        this.gameSettings.style.display = "block";
    }

    async startScoredGame() {
        this.isSandbox = false;
        this.startMenu.style.display = "none";
        this.gameGUI.style.display = "block";

        await this.gameController.controller_init({ isSandbox: false });
        this.loader.style.display = "none";
        this.startGUI.style.display = "block";
    }

    async startSandboxGame() {
        this.resetSpeedMeter();
        this.isSandbox = true;
        this.gameGUI.classList.add("sandbox");
        this.countdown.innerHTML = "Fly around and explore!"
        this.startMenu.style.display = "none";
        this.gameGUI.style.display = "block";

        await this.gameController.controller_init({ isSandbox: true });
        this.loader.style.display = "none";
        this.startGUI.style.display = "block";
        this.startSpeedMeter();
    }

    startGame() {
        this.resetSpeedMeter();
        this.soundController.startPlaneSound();
        if (this.isSandbox) {
            this.startGUI.style.display = "none";
            this.canvas.click();
            this.isStarted = true;
            return;
        }

        this.startGameCountdown();
        this.isStarted = true;
    }

    setGameLabel() {
        this.countdown.innerHTML = `Collect ${END_GAME_SCORE} gold space rocks!`;
    }

    startGameCountdown() {
        if (this.isStarted)
            return;

        this.countdown.style.fontSize = "6rem";
        this.countdown.innerHTML = "3";
        setTimeout(() => this.countdown.innerHTML = "2", 1000);
        setTimeout(() => this.countdown.innerHTML = "1", 2000);
        setTimeout(() => {
            this.countdown.style.fontSize = "3rem";
            this.startGUI.style.display = "none";
            if (this.isStarted) {
                this.canvas.click();
                this.startGameTimer();
                this.startSpeedMeter();
            }
        }, 3000);
    }

    resetSpeedMeter() {
        this.speedGauge.style.transform = `rotate(-45deg)`;
    }

    pauseGame() {
        this.isPaused = true;
        this.pausedScreen.style.display = "block";
        this.resetSpeedMeter();
        document.exitPointerLock();
    }

    unpauseGame() {
        this.pausedScreen.style.display = "none";
        this.canvas.requestPointerLock();
        this.isPaused = false;
    }

    parseTimer() {
        const padNumber = num => num.toString().padStart(2, '0');
        return `${padNumber(Math.floor(this.timer / 60))}:${padNumber(this.timer % 60)}`
    }

    _updateGameTimer(amount = 1) {
        if (this.isPaused)
            return;

        this.gameTimer.innerHTML = this.parseTimer();
        this.timer += amount;
    }

    startGameTimer() {
        clearInterval(this.speedInterval);
        this._updateGameTimer();
        this.timerInterval = setInterval(this._updateGameTimer.bind(this), 1000);
    }

    _updateSpeedMeter() {
        if (this.isPaused)
            return;

        const planeSpeed = this.gameController.plane.forward;
        const planeMaxSpeed = this.gameController.plane.max_velocity;
        const speed = Utils.scale(planeSpeed, 0, planeMaxSpeed, -45, 270);
        this.speedGauge.style.transform = `rotate(${speed}deg)`;
        const { soundVolume } = this.gameController.state;
        const planeVolume = Utils.scale(planeSpeed, 0, planeMaxSpeed, 0, soundVolume)
        this.soundController.changePlaneVolume(planeVolume);
    }

    startSpeedMeter() {
        this._updateSpeedMeter();
        this.speedInterval = setInterval(this._updateSpeedMeter.bind(this), 100);
    }

    endGame() {
        document.exitPointerLock();
        clearInterval(this.timerInterval);
        clearInterval(this.speedInterval);
        this.isStarted = false;
        this.setGameLabel();
        this.gameGUI.classList.remove("sandbox");
        if (this.score >= END_GAME_SCORE) {
            this.addScoreScreen.style.display = "block";
        }
        this.soundController.stopPlaneSound();
    }

    addScoreToScoreboard() {
        if (this.inputUsernameSubmit.value.length !== 0) {
            ScoreBoardController.addScore({
                user: this.inputUsernameSubmit.value,
                time: this.timer,
            });
            this.gameController.setState({ username: this.inputUsernameSubmit.value });
        }
        this.startMenu.style.display = "block";
        this.gameGUI.style.display = "none";
        this.startGUI.style.display = "none";
        this.addScoreScreen.style.display = "none";
        this.resetScoreTimerGUI();
    }

    resetScoreTimerGUI() {
        this.timer = 0;
        this.score = 0;
        this._updateGameScore();
        this._updateGameTimer();
    }

    _updateGameScore() {
        this.gameScore.innerHTML = `${this.score} / ${END_GAME_SCORE}`;
    }

    addGameScore(score = 1) {
        if (!this.isStarted)
            return;

        this.score += score;
        this._updateGameScore();
        if (this.score >= END_GAME_SCORE) {
            this.endGame();
        }
    }

    negativeCollect() {
        if (!this.isStarted)
            return;

        // set the timer to red color for a second
        this._updateGameTimer(5);
        this.gameTimer.style.color = 'red';
        setTimeout(() => this.gameTimer.style.color = "white", 1000);
        this._updateGameScore();
    }
}
