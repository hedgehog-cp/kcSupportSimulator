/**@type {Array.<EnemyFleet[]>} デッキビルダー形式の敵艦隊*/
let enemyFleet = [[], []];

/**入力された敵艦隊 */
class EnemyFleet {
    constructor() {
        /**@type {Number} 艦隊番号*/
        this.fleetNum = null;
        /**@type {Number} 序列*/
        this.shipNum = null;
        /**@type {Number} 敵艦船ID*/
        this.shipId = null;
        /**@type {String} 敵艦名*/
        this.shipName = null;
        /**@type {Number} 敵耐久*/
        this.hp = null;
        /**@type {Number} 敵装甲*/
        this.armor = null;
        /**@type {Number} 敵運*/
        this.luck = null;
        /**@type {Number} 敵回避: 素+合計装備*/
        this.shipEvasion = null;
        /**@type {Number} 回避項*/
        this.evasion = null;
        /**@type {boolean} 存在性*/
        this.skip = null;
    }
    /**
     * パラメータ設定の値を考慮した回避項を格納し, 返す  
     * 未定義の場合は-1
    */
    calcEvasion() {
        if (this.shipEvasion < 1 || this.luck < 1) {
            this.evasion = -1;
            return this.evasion;
        }
        const basicEvasion = Math.floor(setParam.formationEvasion * (this.shipEvasion + Math.sqrt(2 * this.luck)));
        if (basicEvasion < 40) {
            this.evasion = Math.floor(basicEvasion);
        } else if (basicEvasion < 65) {
            this.evasion = Math.floor(40 + 3 * Math.sqrt(basicEvasion - 40));
        } else {
            this.evasion = Math.floor(55 + 2 * Math.sqrt(basicEvasion - 65));
        }
        return this.evasion;
    }
}

/**
 * 入力された敵艦隊のデータを格納して, HTMLに出力する
 * グローバル変数 enemyFleet[][]に格納する
 * f1, f2を走査する
 * f1:s0~s(length-1)と, f2:s0~s(length-1)まで
 * 旗艦から順番に埋まっているものとする(本家で有り得ない艦隊は仕様外)
 */
function getEnemyFleet() {
    try {
        const FLEET = JSON.parse(document.getElementById('input-enemy-fleet-json').value);

        // HTMLをクリア
        clearDocument('enemyfleet');
        clearDocument('output-table');

        // 初期化
        enemyFleet = [[],[]];

        for (let i = 0; i < 2; i++) {
            // 第f艦隊
            let fleetKey = 'f' + (i + 1);
            for (let j = 0; j < Object.keys(FLEET[fleetKey]).length; j++) {
                // 艦隊の(1~6)番艦
                let shipKey = 's' + (j + 1);

                // メモリを確保する
                enemyFleet[i][j] = new EnemyFleet();

                // 艦隊での位置を格納する
                enemyFleet[i][j].fleetNum = i + 1;
                enemyFleet[i][j].shipNum = j + 1;

                // 敵艦船IDを格納する
                enemyFleet[i][j].shipId = FLEET[fleetKey][shipKey].id;

                // 敵艦名を格納する
                let id = enemyFleet[i][j].shipId;
                let name = id2value(enemyFleet[i][j].shipId, 'name', ENEMY);
                let rank = id2value(enemyFleet[i][j].shipId, 'rank', ENEMY);
                rank = rank.length >= 2 ? rank : '';
                enemyFleet[i][j].shipName = `${id}:${name}${rank}`;

                // 敵耐久, 敵装甲, 敵運, 敵回避を格納する
                enemyFleet[i][j].hp = id2value(enemyFleet[i][j].shipId, 'hp', ENEMY);
                enemyFleet[i][j].armor = id2value(enemyFleet[i][j].shipId, 'armor', ENEMY);
                enemyFleet[i][j].luck = id2value(enemyFleet[i][j].shipId, 'luck', ENEMY);
                enemyFleet[i][j].shipEvasion = id2value(enemyFleet[i][j].shipId, 'evasion', ENEMY);

                // 回避項を格納する
                enemyFleet[i][j].calcEvasion();
                
                // 存在性(潜水艦なら被攻撃艦から外す)を格納する
                enemyFleet[i][j].skip = /潜水/.test(enemyFleet[i][j].shipName);


                /**HTMLに出力する*/
                // 要素番号を変換する
                let elementNum = i * FLEET_SIZE + j;

                // 敵艦船名を描画
                document.getElementById('output-enemy-name-' + elementNum).innerHTML = enemyFleet[i][j].shipName;

                // 敵耐久を描画
                document.getElementById('output-enemy-hp-' + elementNum).value = enemyFleet[i][j].hp;

                // 敵装甲を描画
                document.getElementById('output-enemy-armor-' + elementNum).value = enemyFleet[i][j].armor;

                // 敵回避項を描画
                document.getElementById('output-enemy-evasion-' + elementNum).value = enemyFleet[i][j].calcEvasion();
            }
        }
    } catch (error) {
        alert('入力された敵艦隊を解析できませんでした');
        return -1;
    }
}