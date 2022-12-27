export class ScoreBoardController {

    constructor() {
        if (localStorage.getItem(ScoreBoardController.STORAGE_KEY) === null) {
            localStorage.setItem(ScoreBoardController.STORAGE_KEY, JSON.stringify([]));
        }
        
        this.scoresTable = document.getElementById('scoresTable');
        this.drawScoreboard = this.drawScoreboard.bind(this);
        this.addScore = this.addScore.bind(this);

        // add dummy data to scoreboard
        // this.addScore({ user: 'Janez', time: 201 });
        // this.addScore({ user: 'Janez', time: 131 });
        // this.addScore({ user: 'Janez', time: 191 });
        // this.addScore({ user: 'Marko', time: 191 });
        // this.addScore({ user: 'Marko', time: 120 });
        // this.addScore({ user: 'John Doe', time: 300 });
    }

    static STORAGE_KEY = 'scoreboard';

    getScoreboard() {
        const jsonItems = localStorage.getItem(ScoreBoardController.STORAGE_KEY);
        const items = JSON.parse(jsonItems);
        const sorted = items.sort((a, b) => a.time - b.time);
        return sorted;
    }

    drawScoreboard() {
        // draw only header row
        this.scoresTable.innerHTML = (`
            <div class="row">
                <div>#</div>
                <div>User</div>
                <div>Time</div>
            </div>
        `);

        const items = this.getScoreboard();
        items.forEach((score, idx) => {
            this.scoresTable.innerHTML += (`
                <div class="row">
                    <div class="cell">${idx + 1}</div>
                    <div class="cell">${score.user}</div>
                    <div class="cell">${this.formatTime(score.time)}</div>
                </div>
            `);
        });
    }

    addScore({ user, time }) {
        const items = this.getScoreboard();
        items.push({ user, time });
        localStorage.setItem(ScoreBoardController.STORAGE_KEY, JSON.stringify(items));
    }

    formatTime(s){
        return (s-(s%=60))/60+(9<s?':':':0')+s;
    }
}