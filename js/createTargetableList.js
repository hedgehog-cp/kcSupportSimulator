/**@type {Array<Number[]>} getTargetList()で使う*/
let targetableList = [[], []];
/**
 * グローバル変数: enemyFleet[][], enemyFleet_[][]を参照して,  
 * ターゲット可能な敵艦船のリストをグローバル変数: targetableList[]に置く  
 * 
 */
function createTargetableList() {
    for (let i = 0; i < enemyFleet_.length; i++) {
        let index = -1;
        for (let j = 0; j < enemyFleet_[i].length; j++) {
            let skip;
            try {
                skip = enemyFleet[i][j].skip;
            } catch (error) {
                skip = false;
            }
            const skip_ = !((enemyFleet_[i][j].hp >= 1) && (enemyFleet_[i][j].armor >= 1) && (enemyFleet_[i][j].evasion >= 1));
            if (!(skip || skip_)) {
                index++;
                targetableList[i][index] = j;
            }
        }
    }
}