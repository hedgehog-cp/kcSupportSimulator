class SimulationResult {
    constructor() {
        /**@type {Number} 現在の耐久 */
        this.nowHp = 0;
        this.sunk = 0;
        this.taiha = 0;
        this.tyuha = 0;
        this.sumHp = 0;
    }
}

function simulator() {
    // シミュレーション回数を格納
    const SIMULATION_NUM = Number(document.getElementById('input-simulation-num').value);
    if (Number(SIMULATION_NUM) <= 0) {
        alert('シミュレーション回数が不正です');
        return -1;
    }

    // パラメータ更新
    fixCommonParameter();
    fixAccParameter();
    fixEvasionParameter();

    // 艦隊情報を取得する
    let fleetLength = [];
    fleetLength = getFleetFromDocument();
    if (fleetLength[0] < 1) {
        alert('自艦隊が不正です');
        return -1;
    } else if (fleetLength[1] < 1) {
        alert('敵艦隊が不正です');
        return -1;
    }

    // 交戦形態補正の検証
    if (setParam.engagementForm[1][3] !== 100) {
        alert('交戦形態補正の合計確率が100%ではありません');
        return -1;
    }

    // ターゲットリスト生成のセットアップをする
    createTargetableList()

    // ターゲットリストを格納するメモリを確保する
    let targetList = new Array(fleetLength[0]);


    // シミュ結果を格納するためのメモリを確保する
    /**@type {Array.<SimulationResult[]>} シミュ結果を格納する*/
    let result = [[], []];
    for (let i = 0; i < enemyFleet_.length; i++) {
        for (let j = 0; j < enemyFleet_[i].length; j++) {
            result[i][j] = new SimulationResult();
        }
    }

    // n隻撃沈率 (12+1)
    let nSunk = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    // シミュレーター本体
    for (let i = 0; i < SIMULATION_NUM; i++) {

        // 初期耐久をコピーする
        for (let j = 0; j < enemyFleet_.length; j++) {
            for (let k = 0; k < enemyFleet_[j].length; k++) {
                result[j][k].nowHp = enemyFleet_[j][k].hp;
            }
        }

        // ターゲットを取得する
        targetList = getTargetList(fleetLength);

        // 砲撃支援が攻撃する
        for (let j = 0; j < fleetLength[0]; j++) {

            // j番目の艦娘が狙う敵艦を取得する
            const target = targetList[j];

            // index計算
            const ii = Math.floor(target / FLEET_SIZE);
            const jj = target % FLEET_SIZE;

            // 最終命中率を取得する
            const finalAcc = capAcc(myFleet_[j].acc, enemyFleet_[ii][jj].evasion);

            let criticalFlag;
            if (criticalFlag = isHit(finalAcc)) {

                // 最終攻撃力を取得
                const finalFp = getFinalFp(myFleet_[j].fp * getEFBonus(setParam.engagementForm) * setParam.formationAttack, criticalFlag);

                // 最終防御力を取得
                const finalDefense =  0.7 * enemyFleet_[ii][jj].armor + 0.6 * Math.floor(Math.random() * enemyFleet_[ii][jj].armor);

                // ダメージ量を取得
                const damage = getDamage(finalFp, finalDefense, result[ii][jj].nowHp);

                // ダメージ量を反映
                result[ii][jj].nowHp -= damage;
            }
            // else {damage = 0;}
        }

        // 戦闘ごとに集計する
        let countSunk = 0;
        for (let j = 0; j < 2; j++) {
            for (let k = 0; k < FLEET_SIZE; k++) {
                if ((enemyFleet_[j][k].hp >= 1) && (enemyFleet_[j][k].armor >= 1) && (enemyFleet_[j][k].evasion >= 1)) {
                    if (result[j][k].nowHp <= 0) {
                        result[j][k].sunk++;
                        countSunk++;
                    } else if (result[j][k].nowHp <= Math.floor(0.25 * enemyFleet_[j][k].hp)) {
                        result[j][k].taiha++;
                    } else if (result[j][k].nowHp <= Math.floor(0.5 * enemyFleet_[j][k].hp)) {
                        result[j][k].tyuha++;
                    }
                }
                result[j][k].sumHp += Number(result[j][k].nowHp);
            }
        }
        nSunk[countSunk]++;
    }

    clearDocument('output-table');

    // 出力
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < FLEET_SIZE; j++) {
            const elementNum = i * FLEET_SIZE + j;
            if ((enemyFleet_[i][j].hp >= 1) && (enemyFleet_[i][j].armor >= 1) && (enemyFleet_[i][j].evasion >= 1)) {
                document.getElementById('output-enemy-sunk-' + elementNum).innerHTML =  myRound(result[i][j].sunk / SIMULATION_NUM * 100) + '%';
                document.getElementById('output-enemy-taiha-' + elementNum).innerHTML = myRound(result[i][j].taiha / SIMULATION_NUM * 100) + '%';
                document.getElementById('output-enemy-tyuuha-' + elementNum).innerHTML = myRound(result[i][j].tyuha / SIMULATION_NUM * 100) + '%';
                document.getElementById('output-enemy-avedmg-' + elementNum).innerHTML = myRound(result[i][j].sumHp / SIMULATION_NUM);
            }
        }
    }
    for (let i = 0; i <= 2 * FLEET_SIZE; i++) {
        document.getElementById('output-sunk-num-proba-' + i).innerHTML = myRound(nSunk[i] / SIMULATION_NUM * 100) + '%';
    }




    /**メモリの解放 */
    /**@type {Array.<MyFleet>} デッキビルダー形式の自艦隊*/
    // myFleet = [];
    /**@type {Array.<EnemyFleet[]>} デッキビルダー形式の敵艦隊*/
    // enemyFleet = [[], []];
    /**@type {Array.<MyFleet_>} HTML形式の自艦隊*/
    myFleet_ = [];
    /**@type {Array.<EnemyFleet_[]>} HTML形式の敵艦隊*/
    enemyFleet_ = [[], []];
    /**@type {Array<Number[]>} getTargetList()で使う*/
    targetableList = [[], []];
    /**@type {SetParameter} setParameters 各種パラメータ*/
    // setParam = [];
    /**@type {Array.<SimulationResult[]>} シミュ結果を格納する*/
    result = [[], []];
}
