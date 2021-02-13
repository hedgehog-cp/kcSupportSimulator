function getMyFleet() {
    clearDocument('myfleet');  
    const FLEET = JSON.parse(document.getElementById('input-my-fleet-json').value);
    let basicFp = getBasicFp(FLEET);
    let shipAcc = getShipAcc(FLEET);
    writeMyfleetValue(FLEET, basicFp, shipAcc);

}

function clearDocument(fleet) {
    if (fleet === 'myfleet') {
        for (let i = 0; i < I_N.length; i++) {
            document.getElementById('output-ship-name-' + i).innerHTML = '';
            document.getElementById('output-ship-basicfp-' + i).value = '';
            document.getElementById('output-ship-acc-' + i).value = '';
        }
    } else if (fleet === 'enemyfleet') {
        for (let i = 0; i < 12; i++) {
            document.getElementById('output-enemy-name-' + i).innerHTML = '';
            document.getElementById('output-enemy-hp-' + i).value = '';
            document.getElementById('output-enemy-armor-' + i).value = '';
            document.getElementById('output-enemy-agl-' + i).value = '';
        }
    } else if (fleet === 'output-table') {
        for (let i = 0; i < 12; i++) {
            document.getElementById('output-enemy-sunk-' + i).innerHTML = '';
            document.getElementById('output-enemy-taiha-' + i).innerHTML = '';
            document.getElementById('output-enemy-tyuuha-' + i).innerHTML = '';
            document.getElementById('output-enemy-avedmg-' + i).innerHTML = '';
            document.getElementById('output-sunk-num-proba-' + i).innerHTML = '';
        }
        document.getElementById('output-sunk-num-proba-' + 12).innerHTML = '';
    }    
}


/**
 * 二分探索で、jsonのidを検索し、その要素番号のvalueを返す。
 * @param {number} id 艦娘idまたは装備id
 * @param {string} value SHIPS  -> ID:id or 艦種:type or 艦名:name or 火力:fpなど。
 *                       EQUIPS -> 火力:fp or 雷装:top or 爆装:bomなど。
 * @param {JSON} json SHIPSまたはEQUIPSまたはENEMY
 * @returns {number} json.(index of id).value
 */
function id2value(id, value, json) {
    let index = -1;
    let left = 0;
    let right = Object.keys(json).length - 1;

    while (left <= right) {
        middle =Math.floor((left + right) / 2);
        if (json[middle].id === id) {
            index = middle;
            break;
        } else if (json[middle].id < id) {
            left = middle + 1;
        } else {
            right = middle - 1;
        }
    }

    return json[index][value];
}

/**
 * 入力されたデッキビルダー形式のjsonから、艦娘名を取得してHTMLに出力
 * @param {JSON} fleet 入力されたデッキビルダー形式のjson
 */
function writeMyfleetValue(fleet, basicFp, shipAcc) {
    for (let i = 0; i < Object.keys(fleet.f1).length; i++) {
        // 艦娘の名前を描画
        let key = 's' + (i + 1);
        let shipId = fleet.f1[key].id;
        let shipName = id2value(shipId, 'name', SHIPS);
        document.getElementById('output-ship-name-' + i).innerHTML = shipName;

        // 艦娘の基本攻撃力を描画
        document.getElementById('output-ship-basicfp-' + i).value = basicFp[i];

        // 艦娘の命中項を描画
        document.getElementById('output-ship-acc-' + i).value = shipAcc[i];
    }
}

/**
 * その艦娘の、入力されたJSON内の'value'パラメータを返す。
 * @param {number} index 編成[index]
 * @param {strings} value ID:id or レベル:lv or 運:luck or 装備:itemsなど
 * @param {JSON} fleet FLEET
 * @param {'f1'|'f2'} fn 艦隊番号
 * @returns {number} id
 */
function getShipvalue(index, value, fleet, fn) {
    let shipKey = 's' + (index + 1);
    let shipId = fleet[fn][shipKey][value];
    return shipId;
}

function alertSum100() {
    let sumProbability = 0;

    for (let i = 0; i < 4; i++) {
        let formation = 'EF' + i;
        sumProbability += Number(document.getElementById(formation).value);
    }

    if (sumProbability === 100) {
        document.getElementById('alertSum100').style.color = "black";
    } else {
        document.getElementById('alertSum100').style.color = "red";
    }
}