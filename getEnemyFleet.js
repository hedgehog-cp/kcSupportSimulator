function getEnemyFleet() {
    clearDocument('enemyfleet'); 
    const FLEET = JSON.parse(document.getElementById('input-enemy-fleet-json').value);
    const SHIP_NUM_1 = Object.keys(FLEET.f1).length;
    const SHIP_NUM_2 = Object.keys(FLEET.f2).length;

    let shipName  = new Array(2);
    let shipHp    = new Array(2);
    let shipArmor = new Array(2);
    let shipAgl   = new Array(2);

    for (let i = 0; i < 2; i++) {
        let len = [SHIP_NUM_1, SHIP_NUM_2];
        shipName[i]  = new Array(len[i]);
        shipHp[i]    = new Array(len[i]);
        shipArmor[i] = new Array(len[i]);
        shipAgl[i]   = new Array(len[i]);
    }

    for (let i = 0; i < 2; i++) {
        let fn = 'f' + (i + 1);
        for (let j = 0; j < shipName[i].length; j++) {
            let shipId = getShipvalue(j, 'id', FLEET, fn);
            let shipRank = id2value(shipId, 'rank', ENEMY).length >= 2 ? id2value(shipId, 'rank', ENEMY) : '';
            shipName[i][j] = `${shipId}: ${id2value(shipId, 'name', ENEMY)}${shipRank}`;
            shipHp[i][j] = id2value(shipId, 'hp', ENEMY);
            shipArmor[i][j] = id2value(shipId, 'armor', ENEMY);
            shipAgl[i][j] = calcShipAgl(id2value(shipId, 'agl', ENEMY), id2value(shipId, 'luck', ENEMY), 1);          
        }
    }
    writeEnemyfleetValue (shipName, shipHp, shipArmor, shipAgl);
}

function calcShipAgl(agl, luck, formationBonus) {
    let basicAgl = Math.floor(formationBonus * (agl + Math.sqrt(2 * luck)));
    let result = 0;

    if (basicAgl < 40) {
        result = basicAgl;
    } else if (basicAgl < 65) {
        result = 40 + 3 * Math.sqrt(basicAgl - 40);
    } else {
        result = 55 + 2 * Math.sqrt(basicAgl - 65);
    }

    if (agl < 1 || luck < 1) {
        result = '';
    } else {
        result = Math.floor(result);
    }

    return result;
}

function fixAgl() {    
    const aglBonus = Number(document.getElementById('formation-agl-bonus').value);
    for (let i = 0; i < 12; i++) {
        let shipId = document.getElementById('output-enemy-name-' + i).innerHTML;
        shipId = Number(shipId.replace(/[^0-9]+/, ''));
        if (shipId == 0) {
            continue;
        }
        let agl = id2value(shipId, 'agl', ENEMY);
        let luck = id2value(shipId, 'luck', ENEMY);
        let fixedAgl = calcShipAgl(agl, luck, aglBonus);
        document.getElementById('output-enemy-agl-' + i).value = fixedAgl;
    }
}

/**
 * 入力された敵艦隊のデッキビルダー形式のjsonから、要素を取得してHTMLに出力
 * @param {JSON} fleet 入力されたデッキビルダー形式のjson
 */
function writeEnemyfleetValue (shipName, shipHp, shipArmor, shipAgl) {
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < shipName[i].length; j++) {
            let elementNum = i * 6 + j;
            // 敵艦船の名前を描画
            document.getElementById('output-enemy-name-' + elementNum).innerHTML = shipName[i][j];

            // 敵艦船の初期耐久値を描画
            document.getElementById('output-enemy-hp-' + elementNum).value = shipHp[i][j];

            // 敵艦船の装甲値を描画
            document.getElementById('output-enemy-armor-' + elementNum).value = shipArmor[i][j];

            // 敵艦船の回避項を描画
            document.getElementById('output-enemy-agl-' + elementNum).value = shipAgl[i][j];
        }
    }
}