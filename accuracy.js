function getShipAcc(FLEET) {
    const SHIP_NUM = Object.keys(FLEET.f1).length
    let shipLv;
    let shipLuck;
    let shipAcc = new Array(SHIP_NUM);
    let shipItemId = new Array(I_N.length);

    for (let i = 0; i < SHIP_NUM; i++) {

        // 艦娘FLEET.f1[i]のlvとluckとを格納
        shipLv = getShipvalue(i, 'lv', FLEET, 'f1');
        shipLuck = getShipvalue(i, 'luck', FLEET, 'f1');

        // 基礎命中項
        shipAcc[i] = Math.floor(2 * Math.sqrt(shipLv) + 1.5 * Math.sqrt(shipLuck));

        // この艦娘の装備の合計命中を加算する。
        shipItemId = getShipItemValue(i, 'id', I_N, FLEET);
        for (let j = 0; j < I_N.length; j++) {
            shipAcc[i] += id2value(shipItemId[j], 'acc', EQUIPS);
        }

        // 命中定数を加算する
        shipAcc[i] += Number(document.getElementById('accuracy-const').value);

        // キラ補正を乗算する
        let cond = document.getElementById('condition-bonus').checked;        
        shipAcc[i] *= cond ? 1.2 : 1;

        // 陣形補正を乗算する
        let form = document.getElementById('formation-acc-bonus').value;
        shipAcc[i] *= form;

        // 切り捨て処理
        shipAcc[i] = Math.floor(shipAcc[i]);
    }

    return shipAcc;
}

function fixAcc() {
    let FLEET = document.getElementById('input-my-fleet-json').value;
    try {
        FLEET = JSON.parse(FLEET);
    } catch (e) {
        return;
    }
    
    const len = Object.keys(FLEET.f1).length;
    let fixedAcc = new Array(len);
    fixedAcc = getShipAcc(FLEET);
    for (let i = 0; i < len; i++) {
        document.getElementById('output-ship-acc-' + i).value = fixedAcc[i];
    }
}


function switchCondBonus() {
    let cond = document.getElementById('condition-bonus').checked;
    for (let i = 0; i < 6; i++) {
        let acc = document.getElementById('output-ship-acc-' + i).value;
        if (acc !== '') {
            if (cond) {
                acc = Math.floor(acc * 1.2);
            } else {
                acc = Math.ceil(acc / 1.2);
            }
        }
        document.getElementById('output-ship-acc-' + i).value = acc;
    }
}