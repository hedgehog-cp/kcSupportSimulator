/**
 * 装備ボーナス(火力)を返す
 * @param {MyFleet} ship 入力された自艦隊のある1隻
 * @returns {Number} 装備ボーナス(火力)
 */
function getBonusFp(ship) {
    /**@type {String} 艦種*/
    const SHIP_TYPE = id2value(ship.shipId, 'type', SHIPS);
    /**@type {String} 艦型*/
    const SHIP_CLASS = id2value(ship.shipId, 'class', SHIPS);
    /**@type {String} 艦名*/
    const SHIP_NAME = id2value(ship.shipId, 'name', SHIPS);
    /**@type {String} よみ*/
    const SHIP_YOMI = id2value(ship.shipId, 'yomi', SHIPS);

    /**アメリカ艦娘 -よみ*/
    const US_SHIPS = {
        /**@type {Array<String>} 戦艦*/
        "BB" : ['コロラド', 'ワシントン', 'サウスダコタ', 'アイオワ'],
        /**@type {Array<String>} 空母*/
        "CV" : ['サラトガ', 'ホーネット', 'イントレピッド', 'ガンビア・ベイ'],
        /**@type {Array<String>} 重巡*/
        "AC" : ['ヒューストン', 'ノーザンプトン'],
        /**@type {Array<String>} 軽巡*/
        "CL" : ['ヘレナ', 'アトランタ', 'ホノルル'],
        /**@type {Array<String>} 駆逐艦*/
        "DD" : ['フレッチャー', 'ジョンストン', 'サミュエル・B・ロバーツ']
    };

    /**イギリス艦娘 -よみ*/
    const UK_SHIPS = {
        /**@type {Array<String>} 戦艦*/
        "BB" : ['ウォースパイト', 'ネルソン'],
        /**@type {Array<String>} 空母*/
        "CV" : ['アークロイヤル'],
        /**@type {Array<String>} 軽巡*/
        "CL" : ['シェフィールド'],
        /**@type {Array<String>} 駆逐艦*/
        "DD" : ['ジャーヴィス', 'ジェーナス']
    };

    /**日本艦娘 -艦型*/
    const JP_SHIPS = {
        /**@type {Array<String>} 重巡*/
        "AC" : ['古鷹型', '青葉型', '妙高型', '高雄型', '最上型', '利根型'],
        /**@type {Array<String>} 軽巡*/
        "CL" : ['天龍型', '長良型', '球磨型', '川内型', '夕張型', '阿賀野型', '香取型', '大淀型'],
        /**@type {Array<String>} 駆逐艦*/
        "DD" : ['神風型', '睦月型', '吹雪型', '綾波型', '暁型', '初春型', '白露型', '朝潮型', '陽炎型', '秋月型', '夕雲型', '島風型', '松型']
    };

    /**@type {Number} ボーナス火力*/
    let bonusFp = 0;
    /**@type {Number} 装備個数*/
    let num = 0;
    /**@type {Array<Number>} 改修値*/
    let rfs = new Array(ship.itemRf.length);

    /**
     * 装備している装備の個数を返す
     * @param {Number} id 装備ID
     * @returns {Number} 個数
     */
    function itemNum(id) {
        let count = 0;
        for (let i = 0; i < ship.itemId.length; i++) {
            count += ship.itemId[i] === id ? 1 : 0;
        }
        return count;
    }

    /**
     * その装備IDの改修値を配列で返す  
     * 該当しない装備IDの改修値は-1とする
     * @param {Number} id 装備ID
     * @returns {Array<Number>} 
     */
    function itemRfs(id) {
        const slotSize = ship.itemId.length;
        let result = new Array(slotSize)
        for (let i = 0; i < slotSize; i++) {
            result[i] = ship.itemId[i] === id ? ship.itemRf[i] : -1;
        }
        return result;
    }

    /**
     * その装備種を装備しているか
     * @param {'surface'|'air'|'ReSea'|'SeaBom'|'SeaBomJp'|'AAA'} kind 水上電探|対空電探|水上偵察機|水上爆撃機|水上爆撃機日本機|対空機銃
     * @returns {boolean} t/f
     */
    function isHaveX(kind) {
        const kindList = ['surface', 'air', 'ReSea', 'SeaBom', 'SeaBomJp', 'AAA', 'AAA25mm'];
        const equipList = [SURFACE_RADAR, AIR_RADAR, RECONNAISSANCE_SEAPLANE, SEAPLANE_BOMBER, SEAPLANE_BOMBER_JAPAN, ANTI_AIR_AUTOCANNON];
        let equip = equipList[kindList.indexOf(kind)];
    
        for (let i = 0; i < ship.itemId.length; i++) {
            if (equip.includes(ship.itemId[i])) {
                return true;
            }
        }
        return false;
    }

    /**
     * shipsArrayにsearchの艦娘があればtrue, なければfalseを返す  
     * includesの拡張
     * @param {String} search 艦種|艦型|艦名|よみ
     * @param {Array<String>} shipsArray 検索対象
     * @returns {boolean} t/f
     */
    function isIn(search, shipsArray) {
        for (let i = 0; i < shipsArray.length; i++) {
            if (shipsArray[i].includes(search)) {
                return true;
            }
        }
        return false;
    }

    // 10cm連装高角砲=3
    if (num = itemNum(3)) {
        if (SHIP_CLASS === '秋月型') {
            bonusFp += 2 * num;
        }
    }

    // 15.5cm三連装砲=5
    if (num = itemNum(5)) {
        if (['大淀型', '最上型'].includes(SHIP_CLASS)) {
            bonusFp += num;
        }
    }

    // 流星=18
    // 流星改=52
    if (num = itemNum(18) + itemNum(52)) {
        if (['あかぎ', 'かが', 'たいほう'].includes(SHIP_YOMI)) {
            if (/改二戊/.test(SHIP_NAME)) {
                bonusFp += 2 * num;
            } else if (/改/.test(SHIP_NAME)) {
                bonusFp += num;
            }
        }
    }

    // 九六式艦戦=19
    if (num = itemNum(19)) {
        if (['ほうしょう', 'たいよう', 'しんよう'].includes(SHIP_YOMI)) {
            bonusFp += 2 * num;
        }
    }

    // 彗星=24
    // 彗星一二型甲=57
    // 彗星(六〇一空)=111
    if (num = itemNum(24) + itemNum(57) + itemNum(111)) {
        if (['伊勢改二', '日向改二'].includes(SHIP_NAME)) {
            bonusFp += 2 * num;
        }
    }

    // 三式弾=35
    if (itemNum(35)) {
        if (['金剛改二', '金剛改二丙', '比叡改二丙', '霧島改二'].includes(SHIP_NAME)) {
            bonusFp += 1;
        }
    }

    // 三式水中探信儀=47
    if (num = itemNum(47)) {
        if (['かみかぜ', 'はるかぜ', 'しぐれ', 'やまかぜ', 'まいかぜ', 'あさしも'].includes(SHIP_YOMI)) {
            bonusFp += 1;
        }
    }

    // 零式艦戦62型(爆戦)=60
    // 零戦62型(爆戦/岩井隊)154
    // 零式艦戦63型(爆戦)=219
    if (num = itemNum(60) + itemNum(154) + itemNum(219)) {
        if (/龍鳳改二/.test(SHIP_NAME)) {
            bonusFp += 2 * num;
        } else if (['祥鳳型', '飛鷹型', '千歳型'].includes(SHIP_TYPE)) {
            bonusFp += num;
        }
    }

    // 二式艦上偵察機=61
    if (itemNum(61)) {
        let rfMax = itemRfs(61).reduce(function(a, b) {
            return Math.max(a, b);
        });
        if (4 <= rfMax && rfMax <= 9) {
            bonusFp += 1;
        } else if (rfMax >= 10) {
            bonusFp += 2;
        }
        if (['伊勢改二', '日向改二'].includes(SHIP_NAME)) {
            bonusFp += 3;
        } else if (SHIP_YOMI=== 'そうりゅう') {
            if (1 <= rfMax && rfMax <= 7) {
                bonusFp += 3;
            } else if (rfMax >= 8) {
                bonusFp += 4;
            }
        } else if (SHIP_YOMI === 'ひりゅう') {
            bonusFp += rfMax >= 1 ? 2 : 0;
        } else if (['瑞鳳改二乙', '鈴谷航改二', '熊野航改二'].includes(SHIP_NAME)) {
            bonusFp += rfMax >= 1 ? 1 : 0;
        }
    }

    // 12.7cm連装砲B型改二=63
    if (num = itemNum(63)) {
        if (['敷波改二', '時雨改二', '夕立改', '夕立改二'].includes(SHIP_NAME)) {
            bonusFp += num;
        }
    }

    // 8cm高角砲=66
    if (num = itemNum(66)) {
        if (/最上改二/.test(SHIP_NAME)) {
            bonusFp += num;
        }
    }

    // 瑞雲(六三四空)=79
    // 瑞雲12型(六三四空)=81
    if (num = itemNum(79) + itemNum(81)) {
        if (SHIP_CLASS === '扶桑型') {
            if (/改/.test(SHIP_NAME)) {
                bonusFp += 2 * num;
            }
        } else if (SHIP_CLASS === '伊勢型') {
            if (/改$/.test(SHIP_NAME)) {
                bonusFp += 2 * num;
            } else if (/改二/.test(SHIP_NAME)) {
                bonusFp += 3 * num;
            }
        }
    }

    // 九七式艦攻(友永隊)=93
    if (itemNum(93)) {
        if (SHIP_YOMI === 'そうりゅう') {
            bonusFp += 1;
        } else if (SHIP_YOMI === 'ひりゅう') {
            bonusFp += 3;
        }
    }

    // 天山一二型(友永隊)=94
    if (itemNum(94)) {
        if (SHIP_NAME === '蒼龍改二') {
            bonusFp += 3;
        } else if (SHIP_NAME === '飛龍改二') {
            bonusFp += 7;
        }
    }

    // 九九式艦爆(江草隊)=99
    if (itemNum(99)) {
        if (SHIP_YOMI === 'そうりゅう') {
            bonusFp += 4;
        } else if (SHIP_YOMI === 'ひりゅう') {
            bonusFp += 1;
        }
    }

    // 彗星(江草隊)=100
    if (itemNum(100)) {
        if (SHIP_NAME === '蒼龍改二') {
            bonusFp += 6;
        } else if (SHIP_NAME === '飛龍改二') {
            bonusFp += 3;
        } else if (['伊勢改二', '日向改二'].includes(SHIP_NAME)) {
            bonusFp += 4;
        }
    }

    // 35.6cm連装砲(ダズル迷彩)=104
    if (num = itemNum(104)) {
        if (['金剛改二', '榛名改二'].includes(SHIP_NAME)) {
            bonusFp += 2 * num;
        } else if (['比叡改二', '霧島改二'].includes(SHIP_NAME)) {
            bonusFp += num;
        }
    }

    // 13号対空電探改=106
    if (num = itemNum(106)) {
        // (沖波改二, 秋雲改二)については, 全ての対空電探に補正があるため別で扱う
        if (['潮改二', '時雨改二', '初霜改二', '榛名改二', '長門改二'].includes(SHIP_NAME)) {
            bonusFp += num;
        } else if (/矢矧改二/.test(SHIP_NAME)) {
            bonusFp += 1;
        }
    }

    // Ar196改=115
    if (itemNum(115)) {
        rfs = itemRfs(115);
        if (['ビスマルク', 'プリンツ・オイゲン'].includes(SHIP_YOMI)) {
            for (let i = 0; i < rfs.length; i++) {
                if (0 <= rfs[i] && rfs[i] <= 9) {
                    bonusFp += 2;
                } else if (rfs[i] >= 10) {
                    bonusFp += 3;
                }
            }
        }
    }

    // 紫雲=118
    if (itemNum(118)) {
        rfs = itemRfs(118);
        if (SHIP_YOMI === 'おおよど') {
            for (let i = 0; i < rfs.length; i++) {
                if (0 <= rfs[i] && rfs[i] <= 9) {
                    bonusFp += 1;
                } else if (rfs[i] >= 10) {
                    bonusFp += 3;
                }
            }
        }
    }


    // 14cm連装砲=119
    if (num = itemNum(119)) {
        if (['夕張型', '香取型'].includes(SHIP_CLASS)) {
            bonusFp += num;
        } else if (SHIP_YOMI === 'にっしん') {
            bonusFp += 2 * num;
        }
    }

    // 15.2cm連装砲改=139
    if (num = itemNum(139)) {
        if (['能代改二', '矢矧改二'].includes(SHIP_NAME)) {
            bonusFp += 2 * num;
        }
    }

    // 九七式艦攻(村田隊)=143
    if (itemNum(143)) {
        if (/赤城改/.test(SHIP_NAME)) {
            bonusFp += 3;
        } else if (/加賀改/.test(SHIP_NAME)) {
            bonusFp += 2;
        } else if (/龍驤改/.test(SHIP_NAME)) {
            bonusFp += 1;
        }  else if (SHIP_YOMI === 'しょうかく') {
            bonusFp += 2;
        }  else if (SHIP_YOMI === 'ずいかく') {
            bonusFp += 1;
        }
    }

    // 天山一二型(村田隊)=144
    if (itemNum(144)) {
        if (/赤城改/.test(SHIP_NAME)) {
            bonusFp += 3;
        } else if (/加賀改/.test(SHIP_NAME)) {
            bonusFp += 2;
        } else if (SHIP_YOMI === 'しょうかく') {
            if (/改二/.test(SHIP_NAME)) {
                bonusFp += 4;
            } else {
                bonusFp += 2;
            }
        } else if (SHIP_YOMI === 'ずいかく') {
            if (/改二/.test(SHIP_NAME)) {
                bonusFp += 2;
            } else {
                bonusFp += 1;
            }
        } else if (SHIP_YOMI === 'りゅうじょう') {
            bonusFp += 1;
        }
    }

    // 120mm/50 連装砲=147
    if(num = itemNum(147)) {
        if (SHIP_CLASS === 'Maestrale級') {
            bonusFp += num;
        }
    }

    // 試製景雲(艦偵型)=151
    if (itemNum(151)) {
        let rfMax = itemRfs(151).reduce(function(a, b) {
            return Math.max(a, b);
        });
        if (4 <= rfMax && rfMax <= 9) {
            bonusFp += 1;
        } else if (rfMax >= 10) {
            bonusFp += 2;
        }
    }

    // OS2U=171
    if (itemNum(171)) {
        let rfMax = itemRfs(171).reduce(function(a, b) {
            return Math.max(a, b);
        });
        if (US_SHIPS.BB.includes(SHIP_YOMI)) {
            bonusFp += 1;
            bonusFp += rfMax >= 10 ? 2 : 0;
        } else if (isIn(SHIP_YOMI, [US_SHIPS.AC, US_SHIPS.CL])) {
            bonusFp += rfMax >= 10 ? 1 : 0;
        }
    }

    // Re.2001 OR改=184
    if (num = itemNum(184)) {
        if (SHIP_YOMI === 'アクィラ') {
            bonusFp += num;
        }
    }

    // Re.2001 G改=188
    if (num = itemNum(188)) {
        if (SHIP_YOMI === 'アクィラ') {
            bonusFp += 3 * num;
        }
    }

    // Late 298B=194
    if (num = itemNum(194)) {
        if (SHIP_NAME === 'Richelieu改') {
            bonusFp += num;
        } else if (SHIP_YOMI === 'コマンダン・テスト') {
            bonusFp += 3 * num;
        }
    }

    // 強風改=217
    if (itemNum(217)) {
        if (/最上改二/.test(SHIP_NAME)) {
            bonusFp += 1;
        }
    }

    // 九六式艦戦改=228
    if (num = itemNum(228)) {
        if (SHIP_YOMI === 'ほうしょう') {
            bonusFp += 3 * num;
        } else if (['たいよう', 'しんよう'].includes(SHIP_YOMI)) {
            bonusFp += 2 * num;
        }
    }

    // Swordfish=242
    if (num = itemNum(242)) {
        if (SHIP_YOMI === 'アークロイヤル') {
            bonusFp += 2 * num;
        } else if (SHIP_YOMI === 'ほうしょう') {
            bonusFp += num;
        }
    }

    // Swordfish Mk.II(熟練)=243
    if (num = itemNum(243)) {
        if (SHIP_YOMI === 'アークロイヤル') {
            bonusFp += 3 * num;
        } else if (SHIP_YOMI === 'ほうしょう') {
            bonusFp += 2 * num;
        }
    }

    // Swordfish Mk.III(熟練)=244
    if (num = itemNum(244)) {
        if (SHIP_YOMI === 'アークロイヤル') {
            bonusFp += 4 * num;
        } else if (SHIP_YOMI === 'ほうしょう') {
            bonusFp += 3 * num;
        }
    }

    // SK+SG レーダー=279
    if (itemNum(279)) {
        let rfMax = itemRfs(279).reduce(function(a, b) {
            return Math.max(a, b);
        });
        if (isIn(SHIP_YOMI, [US_SHIPS.BB, US_SHIPS.CV, US_SHIPS.AC, US_SHIPS.CL])) {
            if (rfMax >= 10) {
                bonusFp += 2;
            }
        } else if (isIn(SHIP_YOMI, [UK_SHIPS.BB, UK_SHIPS.CV, UK_SHIPS.CL, 'パース'])) {
            bonusFp += 1;
        }
        
    }

    // 533mm 三連装魚雷=283
    if (num = itemNum(283)) {
        if (SHIP_YOMI === 'タシュケント' || SHIP_NAME === 'Верный') {
            bonusFp += num;
        }
    }

    // 試製15cm9連装対潜噴進砲=288
    if (num = itemNum(288)) {
        if (SHIP_NAME === '夕張改二丁') {
            bonusFp += num;
        }
    }

    // 彗星二二型(六三四空)=291
    if (num = itemNum(291)) {
        if (['伊勢改二', '日向改二'].includes(SHIP_NAME)) {
            bonusFp += 6 * num;
        }
    }

    // 彗星二二型(六三四空/熟練)=292
    if (num = itemNum(292)) {
        if (['伊勢改二', '日向改二'].includes(SHIP_NAME)) {
            bonusFp += 8 * num;
        }
    }

    // 16inch Mk.I三連装砲=298
    // 16inch Mk.I三連装砲+AFCT改=299
    // 16inch Mk.I三連装砲改+FCR type284=300
    if (num = itemNum(298) + itemNum(299) + itemNum(300)) {
        if (UK_SHIPS.BB.includes(SHIP_YOMI)) {
            bonusFp += 2 * num;
        } else if (SHIP_CLASS === '金剛型' && /改二$/.test(SHIP_NAME)) {
            bonusFp += num;
        }
    }

    // Bofors 15.2cm連装砲 Model 1930=303
    // S9 Osprey=304
    if (num = itemNum(303) + itemNum(304)) {
        if (['球磨型', '長良型', '川内型', '阿賀野型', 'Gotland級'].includes(SHIP_CLASS)) {
            bonusFp += num;
        }
    }

    // Ju87C改二(KMX搭載機)=305
    // Ju87C改二(KMX搭載機/熟練)=306
    if (num = itemNum(305) + itemNum(306)) {
        if (['グラーフ・ツェッペリン', 'アクィラ'].includes(SHIP_YOMI)) {
            bonusFp += num;
        }
    }

    // GFCS Mk.37=307
    if (num = itemNum(307)) {
        if (isIn(SHIP_YOMI, [US_SHIPS.BB, US_SHIPS.CV, US_SHIPS.AC, US_SHIPS.CL, US_SHIPS.DD])) {
            bonusFp += num;
        }
    }

    // 5inch単装砲 Mk.30改+GFCS Mk.37=308
    if (num = itemNum(308)) {
        if (US_SHIPS.DD.includes(SHIP_YOMI) || ['丹陽', '雪風改二'].includes(SHIP_NAME)) {
            bonusFp += 2 * num;
        } else if (US_SHIPS.CL.includes(SHIP_YOMI) || SHIP_TYPE === '駆逐艦') {
            bonusFp += num;
        }
    }

    // 5inch単装砲 Mk.30改=313
    if (num = itemNum(313)) {
        if (US_SHIPS.DD.includes(SHIP_YOMI) || ['丹陽', '雪風改二'].includes(SHIP_NAME)) {
            bonusFp += 2 * num;
        }
    }

    // 533mm五連装魚雷(初期型)=314
    if (num = itemNum(314)) {
        if (US_SHIPS.DD.includes(SHIP_YOMI)) {
            bonusFp += num;
        }
    }

    // SG レーダー(初期型)=315
    if (num = itemNum(315)) {
        if (US_SHIPS.DD.includes(SHIP_YOMI)) {
            bonusFp += 3 * num;
        } else if (isIn(SHIP_YOMI, [US_SHIPS.BB, US_SHIPS.CV, US_SHIPS.AC, US_SHIPS.CL])) {
            bonusFp += 2 * num;
        } else if (['丹陽', '雪風改二'].includes(SHIP_NAME)) {
            bonusFp += 2;
        }
    }

    // Re.2001 CB改=316
    if (num = itemNum(316)) {
        if (SHIP_YOMI === 'アクィラ') {
            bonusFp += 4 * num;
        }
    }

    // 三式弾改=317
    if (itemNum(317)) {
        if ((SHIP_CLASS === '金剛型' && !/改二/.test(SHIP_NAME)) || SHIP_NAME === '長門改二') {
            bonusFp += 1;
        } else if (['比叡改二', '榛名改二', '陸奥改二'].includes(SHIP_NAME)) {
            bonusFp += 2;
        } else if (['金剛改二', '金剛改二丙', '比叡改二丙', '霧島改二'].includes(SHIP_NAME)) {
            bonusFp += 3;
        }
    }

    // 彗星一二型(六三四空/三号爆弾搭載機)=319
    if (num = itemNum(319)) {
        if (['伊勢改二', '日向改二'].includes(SHIP_NAME)) {
            bonusFp += 7 * num;
        }
    }

    // 彗星一二型(三一号光電管爆弾搭載機)=320
    if (num = itemNum(320)) {
        if (SHIP_NAME === '伊勢改二') {
            bonusFp += 2 * num;
        } else if (['蒼龍改二', '飛龍改二'].includes(SHIP_NAME)) {
            bonusFp += 3 * num;
        } else if (['日向改二', '鈴谷航改二', '熊野航改二'].includes(SHIP_NAME)) {
            bonusFp += 4 * num;
        }
    }

    // 35.6cm連装砲改=328
    if (num = itemNum(328)) {
        if (SHIP_CLASS === '金剛型') {
            if (/丙/.test(SHIP_NAME)) {
                bonusFp += 3 * num;
            } else if (/改二/.test(SHIP_NAME)) {
                bonusFp += 2 * num;
            } else {
                bonusFp += num;
            }
        } else if (['伊勢型', '扶桑型'].includes(SHIP_CLASS)) {
            bonusFp += num;
        }
    }

    // 35.6cm連装砲改二=329
    if (num = itemNum(329)) {
        if (SHIP_CLASS === '金剛型') {
            if (/丙/.test(SHIP_NAME)) {
                bonusFp += 4 * num;
            } else if (/改二/.test(SHIP_NAME)) {
                bonusFp += 3 * num;
            } else if (/改/.test(SHIP_NAME)) {
                bonusFp += 2 * num;
            } else {
                bonusFp += num;
            }
        } else if (['伊勢型', '扶桑型'].includes(SHIP_CLASS)) {
            bonusFp += num;
        }
    }

    // 16inch Mk.I連装砲=330
    if (num = itemNum(330)) {
        if (SHIP_NAME === 'Nelson改') {
            bonusFp += 2 * num;
        } else if (SHIP_CLASS === '長門型'){
            if (/改二/.test(SHIP_NAME)) {
                bonusFp += 2 * num;
            } else {
                bonusFp += num;
            }
        } else if (SHIP_YOMI === 'コロラド') {
            bonusFp += num;
        }
    }

    // 16inch Mk.V連装砲=331
    // 16inch Mk.VIII連装砲改=332
    if (num = itemNum(331) + itemNum(332)) {
        if (SHIP_CLASS === '長門型') {
            if (/改二/.test(SHIP_NAME)) {
                bonusFp += 2 * num;
            } else {
                bonusFp += num;
            }
        } else if (['コロラド', 'ネルソン'].includes(SHIP_YOMI)) {
            if (/改/.test(SHIP_NAME)) {
                bonusFp += 2 * num;
            } else {
                bonusFp += num;
            }
        }
    }

    // 烈風改二=336
    if (num = itemNum(336)) {
        if (['あかぎ', 'かが'].includes(SHIP_YOMI)) {
            if (/改/.test(SHIP_NAME)) {
                bonusFp += num;
            }
        }
    }

    // 烈風改二戊型=338
    if (num = itemNum(338)) {
        if (['あかぎ', 'かが'].includes(SHIP_YOMI)) {
            if (/改二戊/.test(SHIP_NAME)) {
                bonusFp += 4 * num;
            } else if (/改/.test(SHIP_NAME)) {
                bonusFp += num;
            }
        }
    }

    // 烈風改二戊型(一航戦/熟練)=339
    if (num = itemNum(339)) {
        if (['あかぎ', 'かが'].includes(SHIP_YOMI)) {
            if (/改二戊/.test(SHIP_NAME)) {
                bonusFp += 6 * num;
            } else if (/改/.test(SHIP_NAME)) {
                bonusFp += num;
            }
        }
    }

    // 152mm/55 三連装速射砲=340
    if (num = itemNum(340)) {
        if (SHIP_CLASS === 'L.d.S.D.d.Abruzzi級') {
            bonusFp += num;
        }
    }

    // 152mm/55 三連装速射砲改=341
    if (num = itemNum(341)) {
        if (SHIP_YOMI === 'ゴトランド') {
            bonusFp += num;
        } else if (SHIP_CLASS === 'L.d.S.D.d.Abruzzi級') {
            bonusFp += 2 * num;
        }
    }

    // 流星改(一航戦)=342
    if (num = itemNum(342)) {
        if (['あかぎ', 'かが'].includes(SHIP_YOMI)) {
            if (/改二戊/.test(SHIP_NAME)) {
                bonusFp += 3 * num;
            } else if (/改二/.test(SHIP_NAME)) {
                bonusFp += 2 * num;
            } else if (/改/.test(SHIP_NAME)) {
                bonusFp += num;
            }
        } else if (SHIP_CLASS === '翔鶴型' && /改二/.test(SHIP_NAME)) {
            bonusFp += num;
        }
    }

    // 流星改(一航戦/熟練)=343
    if (num = itemNum(343)) {
        if (['あかぎ', 'かが'].includes(SHIP_YOMI)) {
            if (/改二戊/.test(SHIP_NAME)) {
                bonusFp += 5 * num;
            } else if (/改二/.test(SHIP_NAME)) {
                bonusFp += 3 * num;
            } else if (/改/.test(SHIP_NAME)) {
                bonusFp += 2 * num;
            }
        } else if (SHIP_CLASS === '翔鶴型' && /改二/.test(SHIP_NAME)) {
            bonusFp += num;
        }
    }

    // 九七式艦攻改 試製三号戊型(空六号電探改装備機)=344
    if (num = itemNum(344)) {
        if (/(祥鳳改)|(瑞鳳改二)/.test(SHIP_NAME)) {
            bonusFp += 2 * num;
        } else if (['赤城改二戊', '加賀改二戊'].includes(SHIP_NAME)) {
            bonusFp += 3 * num;
        } else if (SHIP_NAME === '龍鳳改') {
            bonusFp += 4 * num;
        }
    }

    // 九七式艦攻改(熟練) 試製三号戊型(空六号電探改装備機)=345
    if (num = itemNum(345)) {
        if (['瑞鳳改二', '瑞鳳改二乙', '祥鳳改', '赤城改二戊', '加賀改二戊'].includes(SHIP_NAME)) {
            bonusFp += 3 * num;
        } else if (SHIP_NAME === '龍鳳改') {
            bonusFp += 5 * num;
        }
    }

    // 8inch三連装砲 Mk.9=356
    // 8inch三連装砲 Mk.9 mod.2=357
    if (num = itemNum(356) + itemNum(357)) {
        if (SHIP_CLASS === '最上型') {
            bonusFp += num;
        } else if (SHIP_YOMI === 'ヒューストン') {
            bonusFp += 2 * num;
        }
    }

    // 5inch 単装高角砲群=358
    if (num = itemNum(358)) {
        if (isIn(SHIP_YOMI, [US_SHIPS.BB, US_SHIPS.CV, US_SHIPS.CL, UK_SHIPS.BB, UK_SHIPS.CV])) {
            bonusFp += num;
        } else if (US_SHIPS.AC.includes(SHIP_YOMI)) {
            bonusFp += 2 * num;
        }
    }

    // 6inch 連装速射砲 Mk.XXI=359
    if (num = itemNum(359)) {
        if (SHIP_YOMI === 'パース') {
            bonusFp += 2 * num;
        } else if (SHIP_YOMI === 'ゆうばり') {
            if (/改二/.test(SHIP_NAME)) {
                bonusFp += 2 * num;
            } else {
                bonusFp += num;
            }
        }
    }

    // Bofors 15cm連装速射砲 Mk.9 Model 1938=360
    // Bofors 15cm連装速射砲 Mk.9改+単装速射砲 Mk.10改 Model 1938=361
    if (num = itemNum(360) + itemNum(361)) {
        if (SHIP_CLASS === '阿賀野型') {
            bonusFp += num;
        } else if (['ゴトランド', 'デ・ロイテル'].includes(SHIP_YOMI)) {
            bonusFp += 2 * num;
        }
    }

    // 5inch連装両用砲(集中配備)=362
    // GFCS Mk.37+5inch連装両用砲(集中配備)=363
    if (num = itemNum(362) + itemNum(363)) {
        if (['天龍型', '長良型', '球磨型', '川内型', '夕張型'].includes(SHIP_CLASS)) {
            bonusFp += -3 * num;
        } else if (['香取型', 'Gotland級'].includes(SHIP_CLASS)) {
            bonusFp += -2 * num;
        } else if (SHIP_YOMI === 'アトランタ') {
            bonusFp += num;
        }
    }

    // 甲標的 丁型改(蛟龍改)=364
    if (num = itemNum(364)) {
        if (SHIP_NAME === '夕張改二特') {
            bonusFp += num;
        } else if (!['北上改二', '大井改二', '球磨改二丁', '日進甲'].includes(SHIP_NAME)) {
            bonusFp += -1 * num;
        }
    }

    // 一式徹甲弾改=365
    if (itemNum(365)) {
        if (SHIP_CLASS === '金剛型') {
            if (/丙/.test(SHIP_NAME)) {
                bonusFp += 3;
            } else {
                bonusFp += 1;
            }
        } else if (['扶桑型', '伊勢型'].includes(SHIP_CLASS)) {
            bonusFp += 1;
        } else if (SHIP_CLASS === '長門型') {
            if (/改二/.test(SHIP_NAME)) {
                bonusFp += 2;
            } else {
                bonusFp += 1;
            }
        } else if (SHIP_CLASS === '大和型') {
            if (/改/.test(SHIP_NAME)) {
                bonusFp += 2;
            } else {
                bonusFp += 1;
            }
        }
    }

    // Swordfish(水上機型)=367
    if (num = itemNum(367)) {
        if (['みずほ', 'かもい', 'コマンダン・テスト'].includes(SHIP_YOMI)) {
            bonusFp += num;
        } else if (SHIP_YOMI === 'ゴトランド') {
            bonusFp += 2 * num;
        }
    }

    // Swordfish Mk.III改(水上機型)=368
    if (num = itemNum(368)) {
        if (['みずほ', 'かもい'].includes(SHIP_YOMI)) {
            bonusFp += num;
        } else if (SHIP_YOMI === 'コマンダン・テスト') {
            bonusFp += 2 * num;
        } else if (SHIP_YOMI === 'ゴトランド') {
            if(/Gotland$/.test(SHIP_NAME)) {
                bonusFp += 4 * num;
            } else {
                const limitBonus = [0, 6, 6+4, 6+4*2, 6+4*3, 6+4*4];
                bonusFp += limitBonus[num];
            }
        }
    }

    // Swordfish Mk.III改(水上機型/熟練)=369
    if (num = itemNum(369)) {
        if (['みずほ', 'かもい'].includes(SHIP_YOMI)) {
            bonusFp += 2 * num;
        } else if (SHIP_YOMI === 'コマンダン・テスト') {
            bonusFp += 3 * num;
        } else if (SHIP_YOMI === 'ゴトランド') {
            if (/andra/.test(SHIP_NAME)) {
                const limitBonus = [0, 8, 8+5, 8+5*2, 8+5*3, 8+5*4];
                bonusFp += limitBonus[num];
            } else {
                bonusFp += 5 * num;
            }
        }
    }

    // Swordfish Mk.II改(水偵型)=370
    if (num = itemNum(370)) {
        if (['みずほ', 'かもい', 'コマンダン・テスト', 'ゴトランド'].includes(SHIP_YOMI)) {
            bonusFp += num;
        } else if (['ネルソン', 'シェフィールド'].includes(SHIP_YOMI)) {
            bonusFp += 2 * num;
        } else if (SHIP_YOMI === 'ウォースパイト') {
            bonusFp += 6 * num;
        }
    }

    // Fairey Seafox改=371
    if (num = itemNum(371)) {
        if (['コマンダン・テスト', 'リシュリュー'].includes(SHIP_YOMI)) {
            bonusFp += 2 * num;
        } else if (['ウォースパイト', 'シェフィールド'].includes(SHIP_YOMI)) {
            bonusFp += 3 * num;
        } else if (SHIP_NAME === 'Gotland andra' || SHIP_YOMI === 'ネルソン') {
            const limitBonus = [0, 6, 6+3, 6+3*2, 6+3*3, 6+3*4];
            bonusFp += limitBonus[num];
        } else if (SHIP_YOMI === 'ゴトランド') {
            bonusFp += 4 * num;
        }
    }

    // 天山一二型甲=372
    if (num = itemNum(372)) { 
        if (['翔鶴型', '大鳳型', '飛鷹型', '千歳型'].includes(SHIP_CLASS) || ['瑞鳳改二', '瑞鳳改二乙', '龍鳳改'].includes(SHIP_NAME)) {
            bonusFp += num;
        } else if (/龍鳳改二/.test(SHIP_NAME)) {
            bonusFp += 2 * num;
        }
    }

    // 天山一二型甲改(空六号電探改装備機)=373
    if (num = itemNum(373)) {
        if (SHIP_YOMI === 'しょうかく' || SHIP_NAME === '龍鳳改二') {
            bonusFp += 2 * num;
        } else if (['ずいかく', 'たいほう', 'たいげい・りゅうほう'].includes(SHIP_YOMI) || ['飛鷹型', '千歳型', '最上型'].includes(SHIP_CLASS) || (SHIP_CLASS === '祥鳳型' && /改/.test(SHIP_NAME))) {
            bonusFp += num;
        }
    }

    // 天山一二型甲改(熟練/空六号電探改装備機)=374
    if (num = itemNum(374)) {
        if (['祥鳳改', '龍鳳改', '飛鷹改'].includes(SHIP_NAME)) {
            bonusFp += num;
        } else if (['隼鷹改二', '瑞鳳改二', '瑞鳳改二乙', '鈴谷航改二', '熊野航改二', '千歳航改二', '千代田航改二'].includes(SHIP_NAME)) {
            bonusFp += num;
        } else if (['瑞鶴改二', '瑞鶴改二甲', '大鳳改', '龍鳳改二戊'].includes(SHIP_NAME)) {
            bonusFp += 2 * num;
        } else if (['翔鶴改二', '翔鶴改二甲', '龍鳳改二'].includes(SHIP_NAME)) {
            bonusFp += 3 * num;
        }
    }

    // XF5U=375
    if (num = itemNum(375)) {
        if (SHIP_YOMI === 'かが') {
            bonusFp += num;
        } else if (US_SHIPS.CV.includes(SHIP_YOMI)) {
            bonusFp += 3 * num;
        }
    }

    // 533mm五連装魚雷(後期型)=376
    if (num = itemNum(376)) {
        if (isIn(SHIP_YOMI, [UK_SHIPS.CL, UK_SHIPS.DD, 'パース'])) {
            bonusFp += num;
        } else if (isIn(SHIP_YOMI, [US_SHIPS.AC, US_SHIPS.CL, US_SHIPS.DD])) {
            bonusFp += 2 * num;
        }
    }

    // 16inch三連装砲 Mk.6=381
    if (itemNum(381)) {
        rfs = itemRfs(381);
        if (SHIP_YOMI === 'サウスダコタ') {
            for (let i = 0; i < rfs.length; i++) {
                if (0 <= rfs[i] && rfs[i] <= 5) {
                    bonusFp += 2;
                } else if (rfs[i] >= 6) {
                    bonusFp += 3;
                }
            }
        } else if (US_SHIPS.BB.includes(SHIP_YOMI)) {
            for (let i = 0; i < rfs.length; i++) {
                if (0 <= rfs[i] && rfs[i] <= 5) {
                    bonusFp += 1;
                } else if (rfs[i] >= 6) {
                    bonusFp += 2;
                }
            }
        } 
    }

    // 16inch三連装砲 Mk.6 mod.2=385
    if (num = itemNum(385)) {
        rfs = itemRfs(385);
        if (['金剛型', 'V.Veneto級', 'Bismarck級', 'Richelieu級', 'Гангут級'].includes(SHIP_CLASS)) {
            bonusFp += num;
        } else if (['コロラド', 'アイオワ'].includes(SHIP_YOMI)) {
            for (let i = 0; i < rfs.length; i++) {
                if (0 <= rfs[i] && rfs[i] <= 5) {
                    bonusFp += 2;
                } else if (rfs[i] >= 6) {
                    bonusFp += 3;
                }
            }
        } else if (['ワシントン', 'サウスダコタ'].includes(SHIP_YOMI)) {
            for (let i = 0; i < rfs.length; i++) {
                if (0 <= rfs[i] && rfs[i] <= 5) {
                    bonusFp += 3;
                } else if (rfs[i] >= 6) {
                    bonusFp += 4;
                }
            }
        }
    }

    // 6inch三連装速射砲 Mk.16=386
    if (itemNum(386)) {
        rfs = itemRfs(386);
        if (isIn(SHIP_YOMI, ['コロラド', US_SHIPS.AC, US_SHIPS.CL])) {
            for (let i = 0; i < rfs.length; i++) {
                if (0 <= rfs[i] && rfs[i] <= 1) {
                    bonusFp += 1;
                } else if (2 <= rfs[i] && rfs[i] <= 6) {
                    bonusFp += 2;
                } else if (rfs[i] >= 7) {
                    bonusFp += 3;
                }
            }
        }
    }

    // 6inch三連装速射砲 Mk.16 mod.2=387
    if (itemNum(387)) {
        rfs = itemRfs(387);
        if (isIn(SHIP_YOMI, ['コロラド', US_SHIPS.AC, US_SHIPS.CL])) {
            for (let i = 0; i < rfs.length; i++) {
                if (0 <= rfs[i] && rfs[i] <= 1) {
                    bonusFp += 1;
                } else if (2 <= rfs[i] && rfs[i] <= 6) {
                    bonusFp += 2;
                } else if (rfs[i] >= 7) {
                    bonusFp += 3;
                }
            }
        }
    }

    // 16inch三連装砲 Mk.6+GFCS=390
    if (num = itemNum(390)) {
        rfs = itemRfs(390);
        if (['金剛型', 'V.Veneto級', 'Bismarck級', 'Richelieu級', 'Гангут級'].includes(SHIP_CLASS)) {
            bonusFp += num;
        } else if (['コロラド', 'アイオワ'].includes(SHIP_YOMI)) {
            for (let i = 0; i < rfs.length; i++) {
                if (0 <= rfs[i] && rfs[i] <= 2) {
                    bonusFp += 2;
                } else if (rfs[i] >= 3) {
                    bonusFp += 3;
                }
            }
        } else if (['ワシントン', 'サウスダコタ'].includes(SHIP_YOMI)) {
            for (let i = 0; i < rfs.length; i++) {
                if (0 <= rfs[i] && rfs[i] <= 2) {
                    bonusFp += 3;
                } else if (rfs[i] >= 3) {
                    bonusFp += 4;
                }
            }
        }
    }

    // 九九式艦爆二二型=391
    if (num = itemNum(391)) {
        if (['翔鶴型', '祥鳳型', '飛鷹型'].includes(SHIP_CLASS) || SHIP_NAME === '龍鳳改') {
            bonusFp +=  num;
        }
    }

    // 九九式艦爆二二型(熟練)=392
    if (num = itemNum(392)) {
        if (['飛鷹改', '隼鷹改二'].includes(SHIP_NAME)) {
            bonusFp += num;
        } else if ((SHIP_CLASS === '翔鶴型' && /改/.test(SHIP_NAME)) || ['瑞鳳', '瑞鳳改', '祥鳳改', '龍鳳', '龍鳳改'].includes(SHIP_NAME)) {
            bonusFp += 2 * num;
        } else if (/瑞鳳改二/.test(SHIP_NAME)) {
            bonusFp += 3 * num;
        }
    }

    // 120mm/50 連装砲 mod.1936=393
    // 120mm/50 連装砲改 A.mod.1937=394
    if(num = itemNum(393) + itemNum(394)) {
        if (SHIP_CLASS === 'Maestrale級') {
            bonusFp += 2 * num;
        }
    }

    // 6inch Mk.XXIII三連装砲=399
    if (itemNum(399)) {
        rfs = itemRfs(399);
        if (SHIP_YOMI === 'シェフィールド') {
            for (let i = 0; i < rfs.length; i++) {
                if (0 <= rfs[i] && rfs[i] <= 2) {
                    bonusFp += 1;
                } else if (3 <= rfs[i] && rfs[i] <= 4) {
                    bonusFp += 2;
                } else if (rfs[i] >= 5) {
                    bonusFp += 3;
                }
            }
        }
    }

    // 装甲艇(AB艇)=408
    if (num = itemNum(408)) {
        if (SHIP_TYPE === 'しんしゅうまる') {
            bonusFp += 2 * num;
        } else if (SHIP_YOMI === 'あきつまる' || SHIP_TYPE === '駆逐艦') {
            bonusFp += num;
        }
    }

    // 武装大発=409
    if (num = itemNum(409)) {
        if (['しんしゅうまる', 'あきつまる'].includes(SHIP_YOMI)) {
            bonusFp += num;
        }
    }

    // 21号対空電探改二=410
    if (itemNum(410)) {
        if (SHIP_CLASS === '秋月型') {
            bonusFp += 1;
        } else if (/最上改二/.test(SHIP_NAME)) {
            bonusFp += 1;
            // 20.3cm(3号)連装砲
        }
    }

    // 42号対空電探改二=411
    if (itemNum(411)) {
        rfs = itemRfs(411);
        if (['榛名改二', '扶桑改二', '山城改二'].includes(SHIP_NAME)) {
            for (let i = 0; i < rfs.length; i++) {
                if (0 <= rfs[i] && rfs[i] <= 3) {
                    bonusFp += 3;
                } else if (4 <= rfs[i] && rfs[i] <= 9) {
                    bonusFp += 4;
                } else if (rfs[i] >= 10) {
                    bonusFp += 5;
                }
            }
        } else if (['長門改二', '陸奥改二', '伊勢改二', '日向改二'].includes(SHIP_NAME)) {
            for (let i = 0; i < rfs.length; i++) {
                if (0 <= rfs[i] && rfs[i] <= 3) {
                    bonusFp += 2;
                } else if (4 <= rfs[i] && rfs[i] <= 9) {
                    bonusFp += 3;
                } else if (rfs[i] >= 10) {
                    bonusFp += 4;
                }
            }
        }
    }

    // 精鋭水雷戦隊 司令部=413
    if (SHIP_NAME === '神通改二') {
        bonusFp += 8;
    } else if (SHIP_NAME === '長波改二' || ['せんだい', 'じんつう'].includes(SHIP_YOMI)) {
        bonusFp += 6;
    } else if (['てるづき', 'なか'].includes(SHIP_YOMI) || ['球磨型', '長良型', '阿賀野型', '大淀型'].includes(SHIP_CLASS)) {
        bonusFp += 5;
    } else if (['夕雲型', '秋月型', '天龍型', '夕張型', '香取型'].includes(SHIP_CLASS)) {
        bonusFp += 4;
    } else if (SHIP_CLASS === '白露型' || ['霞改二', '不知火改二', '雪風改二'].includes(SHIP_NAME)) {
        bonusFp += 2;
    }

    // SOC Seagull=414
    if (itemNum(414)) {
        let rfMax = itemRfs(414).reduce(function(a, b) {
            return Math.max(a, b);
        });
        if (isIn(SHIP_YOMI, [US_SHIPS.AC, US_SHIPS.CL])) {
            bonusFp += 1;
            bonusFp += rfMax >= 10 ? 1 : 0;
        }
    }

    // SO3C Seamew改=415
    if (isIn(SHIP_YOMI, [US_SHIPS.AC, US_SHIPS.CL])) {
        bonusFp += 1;
    }

    // SBD-5=419
    if (num = itemNum(419)) {
        rfs = itemRfs(419);
        if(US_SHIPS.CV.includes(SHIP_YOMI)) {
            for (let i = 0; i < rfs.length; i++) {
                if (rfs[i] <= 1) {
                    bonusFp += 2;
                } else if (2 <= rfs[i] && rfs[i] <= 6) {
                    bonusFp += 3;
                } else if (7 <= rfs[i]) {
                    bonusFp += 4;
                } 
            }
        }
    }

    // SB2C-3=420
    
    if (num = itemNum(420)) {
        
        rfs = itemRfs(420);
        for (let i = 0; i < rfs.length; i++) {
            if (rfs[i] <= 2) {
                bonusFp += SHIP_YOMI === 'イントレピッド' ? 2 : 0;
                bonusFp += SHIP_YOMI === 'サラトガ' 　　　? 1 : 0;
                bonusFp += SHIP_YOMI === 'ホーネット' 　　? 1 : 0;
                // bonusFp += SHIP_YOMI === 'アークロイヤル' ? 0 : 0;
                bonusFp += SHIP_YOMI === 'ガンビア・ベイ' ? -1 : 0;
            } else if (3 <= rfs[i]) {
                bonusFp += SHIP_YOMI === 'イントレピッド' ? 3 : 0;
                bonusFp += SHIP_YOMI === 'サラトガ' 　　　? 2 : 0;
                bonusFp += SHIP_YOMI === 'ホーネット' 　　? 2 : 0;
                bonusFp += SHIP_YOMI === 'アークロイヤル' ? 1 : 0;
                // bonusFp += SHIP_YOMI === 'ガンビア・ベイ' ? 0 : 0;
            }
        }

        if (SHIP_TYPE === '軽空母' && SHIP_YOMI !== 'ガンビア・ベイ') {
            bonusFp += -2 * num;
        }
    }

    // SB2C-5=421
    if (num = itemNum(421)) {
        rfs = itemRfs(421);
        for (let i = 0; i < rfs.length; i++) {
            if (rfs[i] <= 4) {
                bonusFp += SHIP_YOMI === 'イントレピッド' ? 3 : 0;
                bonusFp += SHIP_YOMI === 'サラトガ' 　　　? 2 : 0;
                bonusFp += SHIP_YOMI === 'ホーネット' 　　? 2 : 0;
                bonusFp += SHIP_YOMI === 'アークロイヤル' ? 2 : 0;
                // bonusFp += SHIP_YOMI === 'ガンビア・ベイ' ? 0 : 0;
            } else if (5 <= rfs[i]) {
                bonusFp += SHIP_YOMI === 'イントレピッド' ? 4 : 0;
                bonusFp += SHIP_YOMI === 'サラトガ' 　　　? 3 : 0;
                bonusFp += SHIP_YOMI === 'ホーネット' 　　? 3 : 0;
                bonusFp += SHIP_YOMI === 'アークロイヤル' ? 2 : 0;
                bonusFp += SHIP_YOMI === 'ガンビア・ベイ' ? 1 : 0;
            }
        }

        if (SHIP_TYPE === '軽空母' && SHIP_YOMI !== 'ガンビア・ベイ') {
            bonusFp += -2 * num;
        }
    }

    // 対空電探
    if (isHaveX('air')) {
        if (['沖波改二', '秋雲改二'].includes(SHIP_NAME)) {
            bonusFp += 1;
        }
    }

    // 水上偵察機
    if (isHaveX('ReSea')) {
        if (SHIP_CLASS === '阿賀野型' && /改二/.test(SHIP_NAME)) {
            bonusFp += 2;
        } else if (/最上改二/.test(SHIP_NAME)) {
            bonusFp += 2;
        }
    }

    // 25mm系機銃
    if (num = itemNum(39) + itemNum(40) + itemNum(49) + itemNum(131)) {
        if (SHIP_CLASS === '香取型') {
            bonusFp += num;
        }
    }



    /* ここから相互シナジーを含む装備を扱う */



    // 水上爆撃機
    if (isHaveX('SeaBom')) {
        if ((SHIP_CLASS === '阿賀野型' && /改二/.test(SHIP_NAME)) || /最上改二/.test(SHIP_NAME)) {
            bonusFp += 1;
            // 弱日水爆
            bonusFp += isHaveX('SeaBomJp') ? 2 : 0;
            // 強日水爆: 瑞雲(六三四空/熟練)=237, 瑞雲改二(六三四空)=322, 瑞雲改二(六三四空/熟練)=323
            if (itemNum(237) + itemNum(322) + itemNum(323)) {
                bonusFp += 1+2;
            }
        }
    }

    // 20.3cm(3号)連装砲=50
    if (num = itemNum(50)) {
        if (/最上改二/.test(SHIP_NAME)) {
            const limitBonus = [0, 3, 8, 12, 16, 20];
            bonusFp += limitBonus[num];
            bonusFp += isHaveX('surface') ? 4 : 0;
            bonusFp += itemNum(30) ? 1 : 0; // 21号対空電探
            bonusFp += itemNum(410) ? 3 : 0; // 21号対空電探改二
        } else if (['古鷹型', '青葉型'].includes(SHIP_CLASS)) {
            bonusFp += num;
            if (!itemNum(90)) { // 20.3cm(2号)連装砲
                bonusFp += isHaveX('surface') ? 1 : 0;
            }
        } else if (['妙高型', '高雄型'].includes(SHIP_CLASS)) {
            bonusFp += 2 * num;
            bonusFp += isHaveX('surface') ? 3 : 0;
        } else if (['最上型', '利根型'].includes(SHIP_CLASS)) {
            const limitBonus = [0, 2, 6, 9, 12];
            bonusFp += limitBonus[num];
            bonusFp += isHaveX('surface') ? 3 : 0;
        }
    }

    // カ号観測機=69
    if (num = itemNum(69)) {
        if (['伊勢改二', '日向改二', '加賀改二護'].includes(SHIP_NAME)) {
            bonusFp += num;
        }
    }

    // 探照灯=74
    if (num = itemNum(74)) {
        if (SHIP_YOMI === 'ゆきかぜ') {
            bonusFp += num;
        } else if (SHIP_YOMI === 'あきぐも') {
            bonusFp += 2 * num;
        } else if (['ひえい', 'きりしま', 'ちょうかい', 'あかつき'].includes(SHIP_YOMI) || (SHIP_CLASS === '阿賀野型' && /改二/.test(SHIP_NAME))) {
            bonusFp += 4;
        } else if (SHIP_YOMI === 'じんつう') {
            bonusFp += 8;
        }
    }

    // 12.7cm単装砲=78
    if (num = itemNum(78)) {
        if (SHIP_CLASS === 'Z1型') {
            rfs = itemRfs(78);
            for (let i = 0; i < rfs.length; i++) {
                if (0 <= rfs[i] && rfs[i] <= 6) {
                    bonusFp += 1;
                } else if (rfs[i] >= 7) {
                    bonusFp += 2;
                }
            }
            bonusFp += isHaveX('surface') ? 2 : 0;
        }
    }

    // 新型高温高圧缶=87
    if (itemNum(87)) {
        let rfMax = itemRfs(87).reduce(function(a, b) {
            return Math.max(a, b);
        }); 
        if (SHIP_CLASS === '金剛型' && /改二丙/.test(SHIP_NAME)) {
            bonusFp += rfMax >= 10 ? 1 : 0;
        }
    }

    // 20.3cm(2号)連装砲=90
    if (num = itemNum(90)) {
        if (['古鷹改二', '加古改二', '青葉改', '衣笠改'].includes(SHIP_NAME)) {
            bonusFp += 2 * num;
        } else if (SHIP_NAME === '衣笠改二') {
            bonusFp += 3 * num;
        } else if (JP_SHIPS.AC.includes(SHIP_CLASS)) {
            bonusFp += num;
        }
        if (['古鷹型', '青葉型'].indexOf(SHIP_CLASS) >= 0) {
            bonusFp += isHaveX('surface') ? 3 : 0;
        }
    }

    // 10cm連装高角砲+高射装置=122
    if (num = itemNum(122)) {
        let countRf4 = 0;
        rfs = itemRfs(122);
        if (SHIP_CLASS === '秋月型') {
            bonusFp += num;
        } else if (SHIP_NAME === '雪風改二') {
            for (let i = 0; i < rfs.length; i++) {
                countRf4 += rfs[i] >= 4 ? 1 : 0;
            }
            if (countRf4) {
                bonusFp += 5 * countRf4;
                bonusFp += isHaveX('surface') ? 4 : 0;
            }
        }
    }

    // 熟練見張員=129
    if (num = itemNum(129)) {
        if (isIn(SHIP_CLASS, [JP_SHIPS.AC, JP_SHIPS.CL, JP_SHIPS.DD])) {
            bonusFp += num;
        }
    }

    // 96式150cm探照灯=140
    if (itemNum(140)) {
        if (SHIP_NAME === '比叡改二丙') {
            bonusFp += 9;
        } else if (SHIP_CLASS === '大和型') {
            bonusFp += 4;
        } else if (['ひえい', 'きりしま'].includes(SHIP_YOMI)) {
            bonusFp += 6;
        }
    }
    
    // 53cm連装魚雷=174
    if (num = itemNum(174)) {
        if (SHIP_NAME === '由良改二' || /夕張改二/.test(SHIP_NAME)) {
            bonusFp += 2 * num;
        }
    }

    // 12.7cm単装高角砲(後期型)=229
    if (num = itemNum(229)) {
        let countRf7 = 0;
        rfs = itemRfs(229);
        for (let i = 0; i < rfs.length; i++) {
            countRf7 += rfs[i] >= 7 ? 1 : 0;
        }
        if (/夕張改二/.test(SHIP_NAME)) {
            bonusFp += num;
            bonusFp += isHaveX('surface') ? 1 : 0;
        } else if (SHIP_NAME === '雪風改二') {
            bonusFp += 2 * num;
            bonusFp += isHaveX('surface') ? 2 : 0;
        } else if (SHIP_TYPE === '海防艦') {
            bonusFp += countRf7;
            bonusFp += isHaveX('surface') && countRf7 >= 1 ? 1 : 0;
        } else if (['神風型', '睦月型'].includes(SHIP_CLASS)) {
            bonusFp += countRf7;
            bonusFp += isHaveX('surface') && countRf7 >= 1 ? 2 : 0;
        } else if (['ゆら', 'きぬ', 'なか'].includes(SHIP_YOMI)) {
            bonusFp += 2 * countRf7;
        }
        if (['由良改二', '鬼怒改二', '那珂改二'].includes(SHIP_NAME)) {
            bonusFp += isHaveX('surface') && countRf7 >= 1 ? 3 : 0;
        }
    } 

    // 15.5cm三連装砲改=235
    if (num = itemNum(235)) {
        if (SHIP_CLASS === '最上型') {
            bonusFp += num;
        } else if (SHIP_YOMI === 'おおよど') {
            if (/改/.test(SHIP_NAME)) {
                bonusFp += 2 * num;
            } else {
                bonusFp += num;
            }
            bonusFp += isHaveX('surface') ? 3 : 0;
        }
    }

    // 瑞雲(六三四空/熟練)=237
    if (num = itemNum(237)) {
        if (SHIP_CLASS === '扶桑型' && /改/.test(SHIP_NAME)) {
            bonusFp += 2 * num;
        } else if (SHIP_CLASS === '伊勢型') {
            if (/改$/.test(SHIP_NAME)) {
                bonusFp += 3 * num;
            } else if (/改二/.test(SHIP_NAME)) {
                bonusFp += 4 * num;
            }
        }
    }

    // 12.7cm連装砲C型改二=266
    if (num = itemNum(266)) {
        if (['白露型', '朝潮型'].includes(SHIP_CLASS)) {
            bonusFp += num;
            bonusFp += isHaveX('surface') ? 1 : 0;
        } else if (SHIP_CLASS === '陽炎型') {
            if (/改二/.test(SHIP_NAME) && SHIP_NAME != '秋雲改二') {
                const limitBonus = [0, 2, 5, 6, 7];
                bonusFp += limitBonus[num];
            } else {
                bonusFp += num;
            }
            bonusFp += isHaveX('surface') ? 2 : 0;
        }
    }

    // 12.7cm連装砲D型改二=267
    if (num = itemNum(267)) {
        // 単体ボーナス
        if (SHIP_NAME === '高波改二') {
            bonusFp += 4 * num;
        } else if (SHIP_CLASS === '夕雲型' && /改二/.test(SHIP_NAME) || SHIP_NAME === '秋雲改二') {
            bonusFp += 3 * num;
        } else if (SHIP_CLASS === '夕雲型' || SHIP_YOMI === 'しまかぜ') {
            bonusFp += 2 * num;
        } else if (SHIP_CLASS === '陽炎型' && /改二/.test(SHIP_NAME)) {
            const limitBonus = [0, 2, 3, 4, 5];
            bonusFp += limitBonus[num];
        } else if (SHIP_CLASS === '陽炎型') {
            bonusFp += num;
        }

        // 水上電探とのシナジー
        if (isHaveX('surface')) {
            if (SHIP_CLASS === '夕雲型' && /改二/.test(SHIP_NAME) || SHIP_NAME === '秋雲改二') {
                bonusFp += 3;
            } else if (SHIP_CLASS === '夕雲型') {
                bonusFp += 2;
            } else if (SHIP_NAME === '島風改') {
                bonusFp += 1;
            }
        }

        // 秋雲改二のシナジー
        // 秋雲改二かつD改二かつ当装備によるシナジー加算のみ記述
        if (SHIP_NAME === '秋雲改二') {
            // 探照灯=74
            bonusFp += itemNum(74) ? 3 : 0;

            // 熟練見張員=129
            bonusFp += itemNum(129) ? 2 : 0;

            // 水雷戦隊 熟練見張員=412
            bonusFp += itemNum(412) ? 2 : 0;
        }
    }

    // 130mm B-13連装砲=282
    if (num = itemNum(282)) {
        if (['タシュケント', 'ゆうばり'].includes(SHIP_YOMI) || SHIP_NAME === 'Верный') {
            bonusFp += 2 * num;
        }
    }
    
    // 61cm三連装(酸素)魚雷後期型=285
    if (num = itemNum(285)) {
        let countRfMax = 0;
        rfs = itemRfs(285);
        if (['吹雪型', '綾波型', '暁型'].includes(SHIP_CLASS) && /(改二)|(Верный)/.test(SHIP_NAME)) {
            for (let i = 0; i < rfs.length; i++) {
                if (rfs[i] >= 10) {
                    countRfMax++;
                }
            }
            bonusFp += Math.min(countRfMax, 2);
        }
    }

    // 8cm高角砲改+増設機銃=220
    if (num = itemNum(220)) {
        if (SHIP_CLASS === '阿賀野型' && /改二/.test(SHIP_NAME)) {
            bonusFp += num;
        } else if (/最上改二/.test(SHIP_NAME)) {
            bonusFp += 2 * num;
        }
    }

    // 61cm四連装(酸素)魚雷後期型=286
    if (itemNum(286)) {
        if (['白露型', '朝潮型', '陽炎型', '夕雲型'].includes(SHIP_CLASS) && /(改二)|(丹陽)/.test(SHIP_NAME)) {
            let countRfMax = 0;
            rfs = itemRfs(286);
            for (let i = 0; i < rfs.length; i++) {
                countRfMax += rfs[i] >= 10 ? 1 : 0;
            }   
            bonusFp += Math.min(countRfMax, 2);
        }
        if (SHIP_CLASS === '白露型') {
            bonusFp += itemNum(296) ? 1 : 0; // 12.7cm連装砲B型改四(戦時改修)+高射装置=296
        }
    }

    // 35.6cm三連装砲改(ダズル迷彩仕様)=289
    if (num = itemNum(289)) {
        if (['金剛改二', '榛名改二'].includes(SHIP_NAME)) {
            bonusFp += 2 * num;
            bonusFp += isHaveX('surface') ? 2 : 0;
        } else if (['比叡改二', '霧島改二'].includes(SHIP_NAME)) {
            bonusFp += num;
        }
    }

    // 41cm三連装砲改二=290
    if (num = itemNum(290)) {
        if (['扶桑改二', '山城改二'].includes(SHIP_NAME)) {
            bonusFp += num;
        } else if (['伊勢改', '日向改'].includes(SHIP_NAME)) {
            bonusFp += 2 * num;
        } else if (['伊勢改二', '日向改二'].includes(SHIP_NAME)) {
            bonusFp += 3 * num;
        }
    }

    // 12cm単装砲改二=293
    if (num = itemNum(293)) {
        if (['占守型', '択捉型'].includes(SHIP_CLASS)) {
            bonusFp += num;
            bonusFp += isHaveX('surface') ? 2 : 0;
        } else if (['神風型', '睦月型'].includes(SHIP_CLASS)) {
            bonusFp += 2 * num;
            bonusFp += isHaveX('surface') ? 2 : 0;
            if (itemNum(174) === 1) { // 53cm連装魚雷=174
                bonusFp += 2;
            } else if (itemNum(174) >= 2) {
                bonusFp += 3;
            }
        }
    }

    // 12.7cm連装砲A型改二=294
    if (num = itemNum(294)) {
        if (['吹雪型', '綾波型', '暁型'].includes(SHIP_CLASS)) {
            bonusFp += num;
            bonusFp += isHaveX('surface') ? 3 : 0;          
            bonusFp += Math.min(itemNum(13) + itemNum(125) + itemNum(285), 2);
        }
    }

    // 12.7cm連装砲A型改三(戦時改修)+高射装置=295
    if (num = itemNum(295)) {
        if (['吹雪型', '綾波型', '暁型'].includes(SHIP_CLASS)) {
            bonusFp += 2 * num;
            bonusFp += isHaveX('surface') ? 3 : 0;
            bonusFp += Math.min(itemNum(13) + itemNum(125) + itemNum(285), 2);
        }
    }

    // 12.7cm連装砲B型改四(戦時改修)+高射装置=296
    if (num = itemNum(296)) {
        if (SHIP_NAME === '敷波改二') {
            bonusFp += 3 * num;
        } else if (['綾波型', '暁型', '初春型'].includes(SHIP_CLASS)) {
            bonusFp += num;
        } else if (['白露改二', '時雨改二', '夕立改二'].includes(SHIP_NAME)) {
            bonusFp += 2 * num;
        } else if (SHIP_CLASS === '白露型') {
            bonusFp += num;
        }
        if (['綾波型', '暁型', '初春型'].includes(SHIP_CLASS)) {
            bonusFp += isHaveX('surface') ? 1 : 0;
            bonusFp += Math.min(itemNum(125) + itemNum(285), 1);
        } else if (SHIP_CLASS === '白露型') {
            bonusFp += isHaveX('surface') ? 1 : 0;
            bonusFp += Math.min(itemNum(15) + itemNum(286), 1);
        }
    }

    // 14cm連装砲改=310
    if (num = itemNum(310)) {
        if (/夕張改二/.test(SHIP_NAME)) {
            rfs = itemRfs(310);
            for (let i = 0; i < rfs.length; i++) {
                if (0 <= rfs[i] && rfs[i] <= 7) {
                    bonusFp += 2;
                } else if (rfs[i] >= 8) {
                    bonusFp += 5;
                }
            }
            bonusFp += isHaveX('surface') ? 3 : 0;
        } else if (['香取型', '夕張型'].includes(SHIP_CLASS)) {
            bonusFp += 2 * num;
        } else if (SHIP_YOMI === 'にっしん') {
            bonusFp += 3 * num;
        }
    }

    // 41cm連装砲改二318
    if (num = itemNum(318)) {
        if (['扶桑改二', '山城改二'].includes(SHIP_NAME)) {
            bonusFp += num;
        } else if (['伊勢改', '伊勢改二', '日向'].includes(SHIP_NAME)) {
            bonusFp += 2 * num;
        } else if (SHIP_NAME === '日向改二') {
            bonusFp += 3 * num;
            bonusFp += itemNum(290) ? 1 : 0; // 41cm三連装砲改二=290
            // bonusFp += isHaveX('air') ? 1 : 0;
        } else if (['長門改二', '陸奥改二'].includes(SHIP_NAME)) {
            bonusFp += 3 * num;
            bonusFp += itemNum(290) ? 2 : 0; // 41cm三連装砲改二=290
        }
    }

    // 瑞雲改二(六三四空)=322
    if (num = itemNum(322)) {
        if (['伊勢改二', '日向改二'].includes(SHIP_NAME)) {
            bonusFp += 5 * num;
        }
    }

    // 瑞雲改二(六三四空/熟練)=323
    if (num = itemNum(323)) {
        if (['伊勢改二', '日向改二'].includes(SHIP_NAME)) {
            bonusFp += 6 * num;
        }
    }

    // オ号観測機改=324
    // オ号観測機改二=325
    if (num = itemNum(324) + itemNum(325)) {
        if (SHIP_NAME === '伊勢改二') {
            bonusFp += num;
        } else if (['日向改二', '加賀改二護'].includes(SHIP_NAME)) {
            bonusFp += 2 * num;
        }
    }

    // S-51J=326
    if (num = itemNum(326)) {
        if (SHIP_NAME === '伊勢改二') {
            bonusFp += num;
        } else if (['日向改二', '加賀改二護'].includes(SHIP_NAME)) {
            bonusFp += 3 * num;
        }
    }

    // S-51J改=327
    if (num = itemNum(327)) {
        if (SHIP_NAME === '伊勢改二') {
            bonusFp += 2 * num;
        } else if (SHIP_NAME === '日向改二') {
            bonusFp += 4 * num;
        } else if (SHIP_NAME === '加賀改二護') {
            bonusFp += 5 * num;
        }
    }

    // 12.7cm連装砲D型改三=366
    if (num = itemNum(366)) {
        // 単体ボーナス
        if (SHIP_NAME === '高波改二') {
            const limitBonus = [0, 4, 8, 12, 16];
            bonusFp += limitBonus[num];
        } else if (['秋雲改二', '沖波改二'].includes(SHIP_NAME)) {
            const limitBonus = [0, 4, 7, 10, 13];
            bonusFp += limitBonus[num];
        } else if (SHIP_CLASS === '夕雲型' && /改二/.test(SHIP_NAME)) {
            bonusFp += 3 * num;
        } else if (SHIP_CLASS === '夕雲型' || SHIP_YOMI === 'しまかぜ') {
            bonusFp += 2 * num;
        } else if (SHIP_CLASS === '陽炎型' && /改二/.test(SHIP_NAME)) {
            const limitBonus = [0, 2, 4, 5, 6];
            bonusFp += limitBonus[num];
        } else if (SHIP_CLASS === '陽炎型') {
            bonusFp += num;
        }

        // 水上電探とのシナジー
        if (isHaveX('surface')) {
            if (['秋雲改二', '島風改'].includes(SHIP_NAME) || SHIP_CLASS === '夕雲型' && /改二/.test(SHIP_NAME)) {
                bonusFp += 2;
            }
        }

        // 対空電探とのシナジー
        // 秋雲改二は対空電探とのシナジーがあり、これは重複する
        if (isHaveX('air')) {
            if (['秋雲改二', '島風改'].includes(SHIP_NAME) || SHIP_CLASS === '夕雲型' && /改二/.test(SHIP_NAME)) {
                bonusFp += 1;
            }
        }

        // 秋雲改二のシナジー
        // 秋雲改二かつD改三かつ当装備によるシナジー加算のみ記述
        if (SHIP_NAME === '秋雲改二') {
            // 探照灯=74
            bonusFp += itemNum(74) ? 3 : 0;

            // 熟練見張員=129
            bonusFp += itemNum(129) ? 2 : 0;

            // 水雷戦隊 熟練見張員=412
            bonusFp += itemNum(412) ? 2 : 0;
        }
    }

    // 12.7cm単装高角砲改二=379
    if (num = itemNum(379)) {
        if (SHIP_CLASS === '海防艦') {
            bonusFp += num;
            bonusFp += isHaveX('surface') ? 1 : 0;
        } else if (['神風型', '睦月型'].includes(SHIP_CLASS)) {
            bonusFp += num;
            bonusFp += isHaveX(shipItemId, 'surface') ? 2 : 0;
        } else if (['天龍型', '夕張型'].includes(SHIP_CLASS)) {
            bonusFp += num;
            bonusFp += isHaveX(shipItemId, 'surface') ? 3 : 0;
        } else if (['いすず', 'きぬ', 'なか', 'ゆら', 'きたかみ', 'おおい'].includes(SHIP_YOMI)|| /球磨改二/.test(SHIP_NAME)) {
            bonusFp += 2 * num;
            if (SHIP_NAME === '由良改二') {
                bonusFp += isHaveX('surface') ? 3 : 0;
            } else if (/改二/.test(SHIP_NAME)) {
                bonusFp += isHaveX('surface') ? 2 : 0;
            } 
        } else if (['丹陽', '雪風改二'].includes(SHIP_NAME)) {
            bonusFp += 3 * num;
            bonusFp += isHaveX('surface') ? 2 : 0;
        } else if (SHIP_CLASS === '松型') {
            const limitBonus = [0, 3, 4, 5, 6];
            bonusFp += limitBonus[num];
            bonusFp += isHaveX('surface') ? 4 : 0;
        } else if (['練習巡洋艦', '水上機母艦'].includes(SHIP_TYPE)) {
            bonusFp += num;
            bonusFp += isHaveX('surface') ? 1 : 0;
        } else if (['軽巡洋艦', '重雷装巡洋艦'].includes(SHIP_TYPE)) {
            bonusFp += isHaveX('surface') ? 1 : 0;
        }
    }

    // 12.7cm連装高角砲改二=380
    if (num = itemNum(380)) {
        if (['天龍型', '夕張型'].includes(SHIP_CLASS)) {
            bonusFp += num;
        } else if (['いすず', 'きぬ', 'なか', 'ゆら'].includes(SHIP_YOMI)) {
            bonusFp += 2 * num;
            if (/改二/.test(SHIP_NAME)) {
                bonusFp += isHaveX('surface') ? 3 : 0;
            }          
        } else if (['きたかみ', 'おおい'].includes(SHIP_YOMI) || /球磨改二/.test(SHIP_NAME)) {
            bonusFp += 3 * num;
            if (/改二/.test(SHIP_NAME)) {
                bonusFp += isHaveX('surface') ? 3 : 0;
            }
        } else if (['丹陽', '雪風改二'].includes(SHIP_NAME)) {
            bonusFp += 3 * num;
            bonusFp += isHaveX('surface') ? 1 : 0;
        } else if (SHIP_CLASS === '松型') {
            const limitBonus = [0, 3, 4, 5, 6];
            bonusFp += limitBonus[num];
            bonusFp += isHaveX('surface') ? 4 : 0;
        } else if (['曙改二', '潮改二'].includes(SHIP_NAME)) {
            const limitBonus = [0, 3, 5, 7, 9];
            bonusFp += limitBonus[num];
            bonusFp += isHaveX('AAA') ? 1 : 0;
        } else if (['練習巡洋艦', '水上機母艦'].includes(SHIP_TYPE)) {
            bonusFp += num;
            bonusFp += isHaveX('surface') ? 2 : 0;
        } else if (SHIP_NAME === '木曾改二') {
            bonusFp += 2;
            bonusFp += isHaveX('surface') ? 3 : 0;
        }
        else if (SHIP_TYPE === '軽巡洋艦') {
            bonusFp += isHaveX('surface') ? 2 : 0;
        }
    }

    // 12cm単装高角砲E型=382
    if (itemNum(382)) {
        if (['神風型', '睦月型', '松型'].includes(SHIP_CLASS) || ['鬼怒改二', '那珂改二', '由良改二'].includes(SHIP_NAME)) {
            bonusFp += isHaveX('surface') ? 1 : 0;
        } else if (SHIP_TYPE === '海防艦' || SHIP_NAME === '雪風改二') {
            bonusFp += isHaveX('surface') ? 2 : 0;
        }
    }

    // TBM-3W+3S=389
    if (num = itemNum(389)) {
        if (US_SHIPS.CV.includes(SHIP_YOMI) || /赤城改二/.test(SHIP_NAME)) {
            bonusFp += 2 * num;
        } else if (SHIP_NAME === '加賀改二護') {
            bonusFp += 4 * num;
            if (itemNum(326) + itemNum(327)) {
                bonusFp += 8;
            } else if (itemNum(69) + itemNum(324) + itemNum(325)) {
                bonusFp += 3;
            }
        } else if (/加賀改二/.test(SHIP_NAME)) {
            bonusFp += 3 * num;
        }
    }

    // 現地改装12.7cm連装高角砲=397
    if (num = itemNum(397)) {
        if (SHIP_NAME === '雪風改二') {
            bonusFp += 3 * num;
            bonusFp += isHaveX('surface') ? 3 : 0;
        } else if (SHIP_NAME === '丹陽') {
            rfs = itemRfs(397);
            for (let i = 0; i < rfs.length; i++) {
                if (0 <= rfs[i] && rfs[i] <= 3) {
                    bonusFp += 5;
                } else if (rfs[i] >= 4) {
                    bonusFp += 9;
                }
            }
            bonusFp += isHaveX('surface') ? 3 : 0;
        }              
    }

    // 現地改装10cm連装高角砲=398
    if (itemNum(398)) {
        rfs = itemRfs(398);
        if (SHIP_NAME === '雪風改二') {
            for (let i = 0; i < rfs.length; i++) {
                if (0 <= rfs[i] && rfs[i] <= 3) {
                    bonusFp += 3;
                } else if (rfs[i] >= 4) {
                    bonusFp += 5;
                }
            }
            bonusFp += isHaveX('surface') ? 3 : 0;
        } else if (SHIP_NAME === '丹陽') {
            for (let i = 0; i < rfs.length; i++) {
                if (0 <= rfs[i] && rfs[i] <= 3) {
                    bonusFp += 4;
                } else if (rfs[i] >= 4) {
                    bonusFp += 7;
                }
            }
            bonusFp += isHaveX('surface') ? 3 : 0;
        }
    }

    // 533mm 三連装魚雷(53-39型)=400
    if (num = itemNum(400)) {
        if (SHIP_YOMI ==='タシュケント' || SHIP_NAME === 'Верный') {
            bonusFp += num;
            bonusFp += itemNum(282) ? 2 : 0; // 130mm B-13連装砲=282
        }
    }

    // 15.2cm連装砲改二=407
    if (num = itemNum(407)) {
        if (['能代改二', '矢矧改二'].includes(SHIP_NAME)) {
            bonusFp += 4 * num;
            bonusFp += isHaveX('surface') ? 2 : 0;
        }
    }

    // 水雷戦隊 熟練見張員=412
    if (itemNum(412)) {
        let rfMax = itemRfs(412).reduce(function(a, b) {
            return Math.max(a, b);
        });
        if (JP_SHIPS.AC.includes(SHIP_CLASS)) {
            bonusFp += 1;
        } else if (JP_SHIPS.CL.includes(SHIP_CLASS)) {
            bonusFp += 3;
            bonusFp += rfMax >= 4 ? 1 : 0;
        } else if (JP_SHIPS.DD.includes(SHIP_CLASS)) {
            bonusFp += 2;
            bonusFp += rfMax >= 4 ? 1 : 0;
        }

        // 秋雲改二かつ(D改二またはD改三)かつ水雷戦隊 熟練見張員のシナジーD改二とD改三に個別に記述
    }

    console.log(`bonus: ${bonusFp}: ${ship.shipName}`);

    return bonusFp;
}
