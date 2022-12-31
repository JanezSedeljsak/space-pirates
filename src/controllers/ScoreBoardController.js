
import { IS_DEBUG, SCOREBOARD_KEY } from "../config.js";

export class ScoreBoardController {

    static scoresTable = document.getElementById('scoresTable');

    static init() {
        if (localStorage.getItem(SCOREBOARD_KEY) === null) {
            localStorage.setItem(SCOREBOARD_KEY, JSON.stringify([]));
            ScoreBoardController.__createDummyData();
        }
    }

    // this should be removed in prod
    static __createDummyData() {
        if (!IS_DEBUG) return;
        ScoreBoardController.addScore({ user: 'Janez', time: 201 });
        ScoreBoardController.addScore({ user: 'Janez', time: 131 });
        ScoreBoardController.addScore({ user: 'Janez', time: 191 });
        ScoreBoardController.addScore({ user: 'Marko', time: 191 });
        ScoreBoardController.addScore({ user: 'Marko', time: 120 });
        ScoreBoardController.addScore({ user: 'John Doe', time: 300 });
        ScoreBoardController.addScore({ user: 'John Doe', time: 230 });
        ScoreBoardController.addScore({ user: 'John Doe', time: 140 });
        ScoreBoardController.addScore({ user: 'Random', time: 110 });
        ScoreBoardController.addScore({ user: 'Random', time: 209 });
        ScoreBoardController.addScore({ user: 'Random', time: 152 });
    }

    static getScoreboard() {
        const jsonItems = localStorage.getItem(SCOREBOARD_KEY);
        const items = JSON.parse(jsonItems);
        const sorted = items.sort((a, b) => a.time - b.time);
        return sorted.slice(0, 10);
    }

    static drawScoreboard() {
        // init table with header row
        ScoreBoardController.scoresTable.innerHTML = (`
            <div class="row">
                <div>#</div>
                <div>User</div>
                <div>Time</div>
            </div>
        `);

        const items = ScoreBoardController.getScoreboard();
        items.forEach((score, idx) => {
            ScoreBoardController.scoresTable.innerHTML += (`
                <div class="row">
                    <div class="cell">${idx + 1}</div>
                    <div class="cell">${score.user}</div>
                    <div class="cell">${ScoreBoardController.formatTime(score.time)}</div>
                </div>
            `);
        });
    }

    static addScore({ user, time }) {
        const items = ScoreBoardController.getScoreboard();
        items.push({ user, time });
        localStorage.setItem(SCOREBOARD_KEY, JSON.stringify(items));
    }

    static formatTime(s){
        return (s-(s%=60))/60+(9<s?':':':0')+s;
    }
}