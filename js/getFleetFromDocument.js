/**@type {Array.<MyFleet_>} HTML形式の自艦隊*/
let myFleet_ = [];

/**@type {Array.<EnemyFleet_[]>} HTML形式の敵艦隊*/
let enemyFleet_ = [[], []];

class MyFleet_ {
    constructor() {
        /**@type {Number} HTMLに描画されている基本攻撃力*/
        this.fp = null;
        /**@type {Number} HTMLに描画されている命中項*/
        this.acc = null;
    }
}

class EnemyFleet_ {
    constructor() {
        /**@type {Number} HTMLに描画されている敵耐久*/
        this.hp = null;
        /**@type {Number} HTMLに描画されている敵装甲*/
        this.armor = null;
        /**@type {Number} HTMLに描画されている敵回避項*/
        this.evasion = null;
    }
}

/**
 * 入力された彼我の艦隊の, 各パラメータ編集後の値を取得し, グローバル変数: myFleet_[], enemyFleet_[][]に格納する  
 * 艦隊の有効な艦船数を返す
 * @returns {Array<Number>} [0]=自艦隊, [1]=敵第1艦隊, [2]=敵第2艦隊
 */
function getFleetFromDocument() {
    let fleetSize = [0, 0, 0];
    for (let i = 0; i < FLEET_SIZE; i++) {
        myFleet_[i] = new MyFleet_();
        myFleet_[i].fp  = Number(document.getElementById('output-ship-basicfp-' + i).value);
        myFleet_[i].acc = Number(document.getElementById('output-ship-acc-' + i).value);

        fleetSize[0] += (myFleet_[i].fp >= 1) && (myFleet_[i].acc >= 1)? 1 : 0;
    }
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < FLEET_SIZE; j++) {
            const elementNum = i * FLEET_SIZE + j;
            enemyFleet_[i][j] = new EnemyFleet_();
            enemyFleet_[i][j].hp        = Number(document.getElementById('output-enemy-hp-' + elementNum).value);
            enemyFleet_[i][j].armor     = Number(document.getElementById('output-enemy-armor-' + elementNum).value);
            enemyFleet_[i][j].evasion   = Number(document.getElementById('output-enemy-evasion-' + elementNum).value);

            let isSS;
            try {
                isSS = enemyFleet[i][j].skip;
            } catch (error) {
                isSS = false;
            }

            fleetSize[i + 1] += (enemyFleet_[i][j].hp >= 1) && (enemyFleet_[i][j].armor >= 1) && (enemyFleet_[i][j].evasion >= 1) && (!isSS) ? 1 : 0;
        }
    }
    return fleetSize;
}