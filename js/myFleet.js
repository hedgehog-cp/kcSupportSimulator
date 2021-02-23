/**@type {Array.<MyFleet>} デッキビルダー形式の自艦隊*/
let myFleet = [];

/**入力された自艦隊*/
class MyFleet {
    constructor() {
        /**@type {Number} 艦船ID*/
        this.shipId = null
        /**@type {String} 艦名*/
        this.shipName = null;
        /**@type {Number} レベル*/
        this.lv = null;
        /**@type {Number} 運*/
        this.luck = null;
        /**@type {Number} 命中項: 基礎命中項+合計装備命中*/
        this.shipAcc = null;
        /**@type {Number} 命中項: 命中定数加算や乗算補正をした値*/
        this.acc = null;
        /**@type {Array<number>} 装備している装備ID群*/
        this.itemId = [];
        /**@type {Array<Number>} 装備している装備の改修値*/
        this.itemRf = [];
        /**@type {Number} 基本攻撃力*/
        this.basicFp = null;
    }
    /**パラメータ設定の値を考慮した命中項を格納し, 返す*/
    calcAcc() {
        this.acc = Math.floor(Math.floor(setParam.accuracyConst + this.shipAcc) * setParam.formationAcc * setParam.condition);
        return this.acc;
    }
}

/**
 * 入力された自艦隊のデータを格納して, HTMLに出力する
 * グローバル変数 myFleet[]に格納する
 * s0~s(length-1)までの(length)隻
 * 旗艦から順番に埋まっているものとする(本家で有り得ない艦隊は仕様外)
 */
function getMyFleet() {
    try {
        const FLEET = JSON.parse(document.getElementById('input-my-fleet-json').value);

        // HTMLをクリア
        clearDocument('myfleet');

        // 初期化
        myFleet = [];
        
        for (let i = 0; i < Object.keys(FLEET.f1).length; i++) {
            // 艦隊の(1~6)番艦
            const shipKey = 's' + (i + 1);

            // メモリを確保する
            myFleet[i] = new MyFleet();

            // 艦娘のIDを格納する
            myFleet[i].shipId = FLEET.f1[shipKey].id;

            // 名前を格納する
            myFleet[i].shipName = id2value(myFleet[i].shipId, 'name', SHIPS);

            // レベルと運を格納する
            myFleet[i].lv     = FLEET.f1[shipKey].lv;
            myFleet[i].luck   = FLEET.f1[shipKey].luck;
            
            // 装備のIDと改修値を格納する
            let itemLength = 0;
            for (const itemKey in FLEET.f1[shipKey].items) {
                myFleet[i].itemId[itemLength] = FLEET.f1[shipKey].items[itemKey].id;
                myFleet[i].itemRf[itemLength] = FLEET.f1[shipKey].items[itemKey].rf;
                itemLength++;
            }

            // 命中項を格納する
            myFleet[i].shipAcc = Math.floor(2 * Math.sqrt(myFleet[i].lv) + 1.5 * Math.sqrt(myFleet[i].luck));
            myFleet[i].shipAcc += getEquipsValue(myFleet[i].itemId, 'acc');

            // 基本攻撃力を格納
            myFleet[i].basicFp = calcBasicFp(i);

            /**HTMLに出力する*/         
            // 艦娘の名前を描画
            document.getElementById('output-ship-name-' + i).innerHTML = myFleet[i].shipName;
    
            // 艦娘の基本攻撃力を描画
            document.getElementById('output-ship-basicfp-' + i).value = myFleet[i].basicFp;
    
            // 艦娘の命中項を描画
            document.getElementById('output-ship-acc-' + i).value = myFleet[i].calcAcc();
        }
    } catch (error) {
        alert('入力された自艦隊を解析できませんでした');
        return -1;
    }
}

/**
 * 装備の火力値または雷装値または爆装値または命中値の合計を返す
 * @param {Array<Number>} items 装備ID群
 * @param {'fp'|'top'|'bom'|'acc'} element 装備の, 火力|雷装|爆装|命中
 * @returns {Number} 装備の合計
 */
function getEquipsValue(items, element) {
    let value = 0;
    for (let i = 0; i < items.length; i++) {
        value += id2value(items[i], element, EQUIPS);
    }
    return value;
}

/**
 * 艦娘の基本攻撃力を返す  
 * 空母の合計装備雷爆装が正ではない場合はundefined
 * @param {Number} index 入力された艦娘の序列番号
 */
function calcBasicFp(index) {
    const shipFp = id2value(myFleet[index].shipId, 'fp', SHIPS);
    const equipsFp = getEquipsValue(myFleet[index].itemId, 'fp');
    const bonusFp = getBonusFp(myFleet[index]);
    const shipType = id2value(myFleet[index].shipId, 'type', SHIPS);
    if (['軽空母', '正規空母', '装甲空母'].includes(shipType)) {
        // 空母式
        const equipsTop = getEquipsValue(myFleet[index].itemId, 'top');
        const equipsBom = getEquipsValue(myFleet[index].itemId, 'bom');
        return (equipsTop + equipsBom) > 0 ? Math.floor((shipFp + equipsFp + bonusFp + equipsTop + Math.floor(1.3 * equipsBom) - 1) * 1.5) + 55 : undefined;
    } else {
        // 非空母式
        return shipFp + equipsFp + bonusFp + 4;
    }
}