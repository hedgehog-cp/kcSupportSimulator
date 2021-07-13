/**
 * ターゲットリストを返す
 * シミュレーターで毎回呼び出す
 * @param {Array<Number>} fleetLength [0]=自艦隊, [1]=敵第1艦隊, [2]=敵第2艦隊
 * @returns {Array<Number>} ターゲットリスト
 */
function getTargetList(fleetLength) {
    // これを返す
    let targetList = new Array(fleetLength[0]);

    if (fleetLength[2] >= 1) {
        // 連合艦隊ならば
        for (let i = 0; i < fleetLength[0]; i++) {
            if (Math.random() < 0.45) {
                // 主力艦隊が狙われたならば
                const index = Math.floor(Math.random() * fleetLength[1]);
                const sn = targetableList[0][index]
                if (sn === 0) {
                    // 旗艦が狙われたならば
                    if (setParam.kabaware > Math.random()) {
                        // 庇われる
                        const jndex = Math.floor(Math.random() * (fleetLength[1] - 1)) + Math.min(fleetLength[1] - 1, 1);
                        targetList[i] = targetableList[0][jndex];
                    } else {
                        targetList[i] = 0;
                    }
                } else {
                    // 旗艦が庇われなかった||随伴艦が狙われた ならば
                    targetList[i] = sn;
                }
            } else {
                // 護衛艦隊が狙われたならば
                const index = Math.floor(Math.random() * fleetLength[2]);
                targetList[i] = FLEET_SIZE + targetableList[1][index];
            }
        }
    } else {
        // 通常艦隊ならば
        for (let i = 0; i < fleetLength[0]; i++) {
            const index = Math.floor(Math.random() * fleetLength[1]);
            const sn = targetableList[0][index]
            if (sn === 0) {
                // 旗艦が狙われたならば
                if (setParam.kabaware > Math.random()) {
                    // 庇われる
                    const jndex = Math.floor(Math.random() * (fleetLength[1] - 1)) + Math.min(fleetLength[1] - 1, 1);
                    targetList[i] = targetableList[0][jndex];
                } else {
                    targetList[i] = 0;
                }
            } else {
                // 旗艦が庇われなかった||随伴艦が狙われた ならば
                targetList[i] = sn;
            }
        }
    }
    return targetList;
}

/**
 * 命中率を返す
 * @param {Number} acc 命中項
 * @param {Number} evasion 回避項
 * @returns {Number} 10以上96以下
 */
function capAcc(acc, evasion) {
    let cappedAcc = Math.min(acc - evasion, 96);
    cappedAcc = Math.max(cappedAcc, 10);
    return cappedAcc;    
}

/**
 * 命中したかどうか
 * @param {Number} acc 命中率
 * @returns {0|1|1.5} 0: 非命中, 1: 命中, 1.5: 急所
 */
function isHit(acc) {
    const CL = 1;
    const rand = Math.floor(Math.random() * 100);
    if (rand <= Math.sqrt(acc) * CL) {
        return 1.5;
    } else if (rand > acc) {
        return 0;
    } else {
        return 1;
    }    
}

/**
 * 発生確率にしたがって交戦形態補正を返す
 * @param {Array} proba
 * @returns {1.2|1|0.8|0.6} 交戦形態補正
 */
function getEFBonus(proba) {
    const rand = Math.random() * 1;
    for (let i = 0; i < proba[0].length; i++) {        
        if (rand < proba[1][i]) {
            return proba[0][i];
        }
    }
}

/**
 * 最終攻撃力を返す; キャップ処理をして急所補正乗算
 * @param {Number} fp キャップ前攻撃力
 * @param {1|1.5} cl 急所倍率
 * @returns {Number} 最終攻撃力
 */
function getFinalFp(fp, cl) {
    const cap = 170;
    let cappedFp;
    let finalFp;

    if (fp > cap) {
        cappedFp = Math.floor(cap + Math.sqrt(fp - cap));
    } else {
        cappedFp = Math.floor(fp);
    }
    finalFp = Math.floor(cappedFp * cl);

    return finalFp;
}

/**
 * ダメージ量を返す
 * @param {Number} fp 最終攻撃力
 * @param {Number} defense 最終防御力
 * @param {Number} hp 耐久値; 割合ダメージ算出に用いる
 * @returns {Number} 与ダメージ 
 */
function getDamage(fp, defense, hp) {
    let damage = Math.floor(fp - defense);
    if (damage <= 0) {
        // 割合置換のとき,耐久値が0以下のときdamage=0 -> 7以下でも確定でdamage=0
        if (hp <= 7) {
            damage = 0;
        } else {
            damage = Math.floor(0.06 * hp + 0.08 * Math.floor(Math.random() * hp));
        }
    }
    return damage;
}

/**
 * 小数点以下digit位を四捨五入して返す
 * @param {Number} num 被四捨五入数
 * @param {Number} digit 桁位置
 * @returns {Number}
 */
function myRound(num) {
    return Math.floor(num * 100 + 0.5) / 100;
}
