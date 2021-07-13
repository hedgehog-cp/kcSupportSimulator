/**
 * HTMLをクリアする
 * @param {'myfleet'|'enemyfleet'|'output-table'} place
 */
function clearDocument(place) {
    if (place === 'myfleet') {
        for (let i = 0; i < FLEET_SIZE; i++) {
            document.getElementById('output-ship-name-' + i).innerHTML = '';
            document.getElementById('output-ship-basicfp-' + i).value = '';
            document.getElementById('output-ship-acc-' + i).value = '';
        }
    } else if (place === 'enemyfleet') {
        for (let i = 0; i < 2 * FLEET_SIZE; i++) {
            document.getElementById('output-enemy-name-' + i).innerHTML = '';
            document.getElementById('output-enemy-hp-' + i).value = '';
            document.getElementById('output-enemy-armor-' + i).value = '';
            document.getElementById('output-enemy-evasion-' + i).value = '';
        }
    } else if (place === 'output-table') {
        for (let i = 0; i < 2 * FLEET_SIZE; i++) {
            document.getElementById('output-enemy-sunk-' + i).innerHTML = '';
            document.getElementById('output-enemy-taiha-' + i).innerHTML = '';
            document.getElementById('output-enemy-tyuuha-' + i).innerHTML = '';
            document.getElementById('output-enemy-avedmg-' + i).innerHTML = '';
        }
        for (let i = 0; i <= 2 * FLEET_SIZE; i++) {
            document.getElementById('output-sunk-num-proba-' + i).innerHTML = '';
        }
    }    
}

/**
 * idに対応する値を返す  
 * 二分探索で、jsonをidで検索し、その要素番号のvalueを返す
 * @param {Number} id 艦娘idまたは装備id
 * @param {String} element SHIPS  -> ID:id or 艦種:type or 艦名:name or 火力:fpなど  
 *                         EQUIPS -> 火力:fp or 雷装:top or 爆装:bomなど
 * @param {JSON} json マスタデータ
 * @returns {Number|String} json.(index of id).value
 */
function id2value(id, element, json) {
    let index = -1;
    let left = 0;
    let right = Object.keys(json).length - 1;

    while (left <= right) {
        middle = Math.floor((left + right) / 2);
        if (json[middle].id === id) {
            index = middle;
            break;
        } else if (json[middle].id < id) {
            left = middle + 1;
        } else {
            right = middle - 1;
        }
    }
    return json[index][element];
}
