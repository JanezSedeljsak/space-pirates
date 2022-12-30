export class SoundController {
    constructor(gameController) {
        this.soundControl = document.getElementById("soundControl");
        this.ambientSound = document.getElementById("ambientSound");
        this.gameSound = document.getElementById("gameSound");
        this.gameController = gameController;

        const { soundVolume } = this.gameController.state;
        this.soundControl.addEventListener('change', () => this.changeSoundVolume());
        if (soundVolume) {
            this.setVolume(soundVolume);
        }

        // music will not autoplay without user interaction >:(
        document.addEventListener('click', () => {
            this.ambientSound.play();
        }, { once: true });
    }

    setVolume(volume) {
        this.soundControl.value = volume;
        this.changeSoundVolume();
    }

    changeSoundVolume() {
        this.ambientSound.volume = this.soundControl.value;
        this.gameSound.volume = this.soundControl.value;
        this.gameController.setState({ soundVolume: this.soundControl.value })
    }

    playSound(sound, extension="ogg") {
        this.gameSound.src = `/assets/sound/${sound}.${extension}`;
        this.gameSound.play();
    }
}