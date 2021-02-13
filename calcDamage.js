function calc() {
    clearDocument('output-table');

    // 1艦隊の最大隻数6
    const ESTABLISHED_FLEET_SIZE = 6;

    // 交戦形態補正の発生確率を累積して格納
    let engagementFormProba = [
        [1.2, 1.0, 0.8, 0.6],
        [0, 0, 0, 0]
    ];
    for (let i = 0; i <engagementFormProba[1].length; i++) {
        let proba = Number(document.getElementById('EF' + i).value);
        if (i === 0) {
            engagementFormProba[1][i] = proba;
            continue;
        }
        engagementFormProba[1][i] = engagementFormProba[1][i - 1] + proba;          
    }
    if (engagementFormProba[1][3] != 100) {
        alert('交戦形態補正の合計確率が100%ではありません');
        return -1;
    }

    // シミュレーション回数を格納
    const SIMULATION_NUM = Number(document.getElementById('input-simulation-num').value);
    if (Number(SIMULATION_NUM) <= 0) {
        alert('シミュレーション回数が不正です');
        return -1;
    }

    // 庇われ率を格納
    const KABAWARE = Number(document.getElementById('kabaware').value);

    // 攻撃側陣形補正(火力)を格納
    const formationBonus = Number(document.getElementById('formation-attack-bonus').value);

    // 自艦隊の基本攻撃力と命中項を格納
    let shipFp = new Array(ESTABLISHED_FLEET_SIZE);
    let shipAcc = new Array(ESTABLISHED_FLEET_SIZE);
    for (let i = 0; i < ESTABLISHED_FLEET_SIZE; i++) {
        shipFp[i] = Number(document.getElementById('output-ship-basicfp-' + i).value);
        shipAcc[i] = Number(document.getElementById('output-ship-acc-' + i).value);
        if (shipFp[i] <= 0 || shipAcc[i] <= 0) {
            alert('支援艦隊を6隻入力してください');
            return -1;
        }
    }

    // 敵艦隊の初期耐久と装甲と回避項を格納
    let enemyFleetSize1 = ESTABLISHED_FLEET_SIZE;
    let enemyFleetSize2 = ESTABLISHED_FLEET_SIZE;
    let shipHp = new Array(2 * ESTABLISHED_FLEET_SIZE);
    let shipAromor = new Array(2 * ESTABLISHED_FLEET_SIZE);
    let shipAgl = new Array(2 * ESTABLISHED_FLEET_SIZE);
    for (let i = 0; i < 2 * ESTABLISHED_FLEET_SIZE; i++) {
        shipHp[i] = Number(document.getElementById('output-enemy-hp-' + i).value);
        shipAromor[i] = Number(document.getElementById('output-enemy-armor-' + i).value);
        shipAgl[i] = Number(document.getElementById('output-enemy-agl-' + i).value);

        
        // 潜水艦ならば
        let isSS = false;
        let shipName = document.getElementById('output-enemy-name-' + i).innerHTML;
        if (shipName != shipName.replace(/潜水/, '')) {
            isSS = true;
        }

        // 敵艦船の存在性
        let temp = (shipHp[i] > 0) && (shipAromor[i] > 0) && (shipAgl[i] > 0) && !isSS ? 0 : -1;
        if (i < ESTABLISHED_FLEET_SIZE) {
            enemyFleetSize1+= temp;
        } else {
            enemyFleetSize2 += temp;
        }
    }
    if (enemyFleetSize1 === 0) {
        alert('敵第1艦隊が入力されていません');
        return -1;
    }   

    // シミュレーション結果を格納する配列を作成    
    let enemyFleetHp = new Array(SIMULATION_NUM);
    for (let i = 0; i < SIMULATION_NUM; i++) {
        enemyFleetHp[i] = new Array(ESTABLISHED_FLEET_SIZE + enemyFleetSize2); 
    }

    // ターゲットリストの配列を作成
    let targetList = new Array(ESTABLISHED_FLEET_SIZE);




    // シミュレータ本体
    for (let i = 0; i < SIMULATION_NUM; i++) {

        // 砲撃支援艦隊が狙う敵艦隊のindexを6個ずつ取得
        targetList = getTarget(enemyFleetSize1, enemyFleetSize2, KABAWARE, ESTABLISHED_FLEET_SIZE);


        // 敵耐久初期値をコピー
        for (let j = 0; j < ESTABLISHED_FLEET_SIZE + enemyFleetSize2; j++) {
            enemyFleetHp[i][j] = shipHp[j];
        }

        // 6隻砲撃支援艦隊が攻撃する
        for (let j = 0; j < ESTABLISHED_FLEET_SIZE; j++) {

            // j番目の艦娘が狙う敵艦を取得
            const target = targetList[j];
            
            // 最終命中率を取得
            const finalAcc = capAcc(shipAcc[j], shipAgl[target]);

            let criticalFlag;             
            if (criticalFlag = isHit(finalAcc)) { // 命中したならば
                // 最終攻撃力を取得
                const finalFp = getFinalFp(shipFp[j] * getEFBonus(engagementFormProba) * formationBonus, criticalFlag);
                
                // 最終防御力を取得
                const finalDefense =  0.7 * shipAromor[target] + 0.6 * Math.floor(Math.random() * shipAromor[target]);

                // ダメージ量を取得
                let damage = getDamage(finalFp, finalDefense, enemyFleetHp[i][target]);

                // ダメージ量を反映
                enemyFleetHp[i][target] -= damage;

            } else { // 非命中ならば
                damage = 0;
            }
        }
    }    

    // 出力: 第1艦隊の撃沈率, 大破率, 中破率, 平均残耐久
    for (let i = 0; i <  2 * ESTABLISHED_FLEET_SIZE; i++) {
        if (i < ESTABLISHED_FLEET_SIZE && i >= enemyFleetSize1) {
            continue;
        } else if (ESTABLISHED_FLEET_SIZE <= i && i >= ESTABLISHED_FLEET_SIZE + enemyFleetSize2) {
            break;
        }
        let sunkSum = 0;
        let taihaSum = 0;
        let tyuuhaSum = 0;
        let hpSum = 0;
        for (let j = 0; j < SIMULATION_NUM; j++) {
            if (enemyFleetHp[j][i] <= 0) {
                sunkSum++;
            } else if (enemyFleetHp[j][i] <= Math.floor(shipHp[i] * 0.25)) {
                taihaSum++;
            }
            else if (enemyFleetHp[j][i] <= Math.floor(shipHp[i] * 0.5)) {
                tyuuhaSum++;
            }
            hpSum += enemyFleetHp[j][i];
        }

        // HTMLに出力
        document.getElementById('output-enemy-sunk-' + i).innerHTML =  myRound(sunkSum / SIMULATION_NUM * 100) + '%';
        document.getElementById('output-enemy-taiha-' + i).innerHTML = myRound(taihaSum / SIMULATION_NUM * 100) + '%';
        document.getElementById('output-enemy-tyuuha-' + i).innerHTML = myRound(tyuuhaSum / SIMULATION_NUM * 100) + '%';
        document.getElementById('output-enemy-avedmg-' + i).innerHTML = myRound(hpSum / SIMULATION_NUM);
    }

    





    // 出力 n隻撃沈率
    let howManySunk = new Array(enemyFleetSize1 + enemyFleetSize2 + 1);
    for (let i = 0; i < howManySunk.length; i++) {
        howManySunk[i] = 0;
    }
    for (let i = 0; i < SIMULATION_NUM; i++) {
        let sunkNum = 0;
        for (let j = 0; j <  2 * ESTABLISHED_FLEET_SIZE; j++) {
            if (j < ESTABLISHED_FLEET_SIZE && j >= enemyFleetSize1) {
                continue;
            } else if (ESTABLISHED_FLEET_SIZE <= j && j >= ESTABLISHED_FLEET_SIZE + enemyFleetSize2) {
                break;
            }
            if (enemyFleetHp[i][j] <= 0) {
                sunkNum++;
            }
        }
        howManySunk[sunkNum]++;
    }
    for (let i = 0; i < howManySunk.length; i++) {
        document.getElementById('output-sunk-num-proba-' + i).innerHTML = myRound(howManySunk[i] / SIMULATION_NUM * 100) + '%';
    }

    console.log(enemyFleetHp);
    console.log('https://docs.google.com/spreadsheets/d/16rYWBesVe5_vTmhVyVfnFIB55-w3QameAmDs1qyhgeU/edit?usp=sharing');    
}

/**
 * 6隻が狙うターゲットを決定する
 * @param {Number} f1 敵第1艦隊のサイズ
 * @param {Number} f2 敵第2艦隊のサイズ
 * @param {Number} k 庇われ率
 * @param {Number} establishedFleetSize 既定されている艦隊サイズ6
 * @returns {Array} 自軍支援艦隊6隻が狙う敵艦隊の番号0~11
 */
function getTarget(f1, f2, k, establishedFleetSize) {
    let target = new Array(establishedFleetSize);    
    if (f2 > 0) {
        // 連合艦隊ならば
        for (let i = 0; i < establishedFleetSize; i++) {
            if (Math.random() < 0.5) { // [0, 5): f1,  [0.5, 1): f2
                // 主力艦隊が狙われたならば
                let sn = Math.floor(Math.random() * f1);
                if (sn === 0) {
                    // 旗艦が狙われたならば
                    if (k > Math.random()) {
                        // 庇われる
                        target[i] = Math.floor(Math.random() * (f1 - 1)) + Math.min(f1 - 1, 1);
                    } else {
                        // 庇われない
                        target[i] = 0;
                    }
                } else {
                    // 随伴艦が狙われたならば
                    target[i] = sn;
                }
            } else {
                // 護衛艦隊が狙われたならば
                target[i] = establishedFleetSize + Math.floor(Math.random() * f2);
            }
        }
    } else {
        // 通常艦隊ならば
        for (let i = 0; i < establishedFleetSize; i++) {            
            let sn = Math.floor(Math.random() * f1);
            if (sn === 0) {
                // 旗艦が狙われたならば
                if (k > Math.random()) {
                    // 庇われる
                    target[i] = Math.floor(Math.random() * (f1 - 1)) + Math.min(f1 - 1, 1);
                } else {
                    // 庇われない
                    target[i] = 0;
                }
            } else {
                // 随伴艦が狙われたならば
                target[i] = sn;
            }
        }
    }
    return target;
}

/**
 * 命中率を返す
 * @param {Number} acc 命中項
 * @param {Number} agl 回避項
 * @returns {Number} 10以上96以下
 */
function capAcc(acc, agl) {
    let cappedAcc = Math.min(acc - agl, 96);
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
    const rand = Math.random() * 100;
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
    const cap = 150;
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

function getCSV(num) {
    const tab = ',';
    for (let i = 0; i < temp1.length; i++) {
        for (let j = 0; j < temp1[i].length; j++) {
            document.write(temp1[i][j]);
            if (j < temp1[i].length - 1) {
                document.write(tab);
            }
        }
        document.write('<br>');
    }
}
