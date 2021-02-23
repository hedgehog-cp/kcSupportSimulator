class SetParameter {
    constructor() {
        /**@type {Number} キラ補正*/
        this.condition = 1.2;
        /**@type {Number} 命中定数*/
        this.accuracyConst = 64;
        /**@type {Number} 攻撃側陣形補正(命中項)*/
        this.formationAcc = 1;
        /**@type {Number} 防御側陣形補正(回避項)*/
        this.formationEvasion = 1;
        /**@type {Number} 攻撃側陣形補正(火力)*/
        this.formationAttack = 1;
        /**@type {Number} 敵第1旗艦庇われ率*/
        this.kabaware = 0.45;
        /**@type {Array<Number[]>} 交戦形態補正*/
        this.engagementForm = [
            [1.2, 1, 0.8, 0.6],
            [15, 60, 90, 100]
        ];
    }
}

/**@type {SetParameter} setParameters 各種パラメータ*/
let setParam = new SetParameter();

/**
 * 交戦形態補正, 庇われ率, 攻撃側陣形補正(火力)の値を更新する
 */
function fixCommonParameter() {
    // 交戦形態補正
    const enagageLen = setParam.engagementForm[1].length; // =4
    for (let i = 0; i < enagageLen; i++) {
        const proba = Number(document.getElementById('EF' + i).value);
        if (i === 0) {
            setParam.engagementForm[1][i] = proba;
            continue;
        }
        setParam.engagementForm[1][i] = setParam.engagementForm[1][i - 1] + proba;
    }
    if (setParam.engagementForm[1][enagageLen-1] === 100) {
        document.getElementById('alertSum100').style.color = "black";
    } else {
        document.getElementById('alertSum100').style.color = "red";
    }

    // 敵第1旗艦庇われ率
    setParam.kabaware = Number(document.getElementById('kabaware').value);

    // 攻撃側陣形補正(火力)
    setParam.formationAttack = Number(document.getElementById('formation-attack-bonus').value);
}

/**
 * キラ補正, 命中定数, 攻撃側陣形補正(命中項)の値を更新し, 自艦隊の命中項を更新描画する
 */
function fixAccParameter() {
    // キラ補正
    setParam.condition = document.getElementById('condition-bonus').checked ? 1.2 : 1;

    // 命中定数
    setParam.accuracyConst = Number(document.getElementById('accuracy-const').value);

    // 攻撃側陣形補正(命中項)
    setParam.formationAcc = Number(document.getElementById('formation-acc-bonus').value);

    // 自艦隊の命中項を更新描画する
    for (let i = 0; i < myFleet.length; i++) {
        document.getElementById('output-ship-acc-' + i).value = myFleet[i].calcAcc();
    }
}

/**
 * 防御側陣形補正(回避項)の値を更新し, 敵艦隊の回避項を更新描画する
 */
function fixEvasionParameter() {
    // 防御側陣形補正(回避項)
    setParam.formationEvasion = Number(document.getElementById('formation-evasion-bonus').value);

    // 敵艦隊の回避項を更新描画する
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < enemyFleet[i].length; j++) {
            const evasion = enemyFleet[i][j].calcEvasion();
            if (evasion >= 1) {
                const elementNum = i * FLEET_SIZE + j;
                document.getElementById('output-enemy-evasion-' + elementNum).value = evasion;
            }
        }
    }
}