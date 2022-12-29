export class SoundController {
    constructor(gameController) {
        // this.gameController = gameController;
        this.soundControl = document.getElementById("soundControl");
        this.ambientSound = document.getElementById("ambientSound");

        // const { soundVolume } = this.gameController.state;
        this.soundControl.addEventListener('change', () => this.changeSoundVolume());
        // this.soundControl.value = 0.5;
        // this.ambientSound.volume = 0.5;
    }

    changeSoundVolume() {
        // console.log(this.ambientSound.volume, this.soundControl.value);
        this.ambientSound.volume = this.soundControl.value;
        // this.gameController.setState({ soundVolume: this.soundControl.value })
    }
}