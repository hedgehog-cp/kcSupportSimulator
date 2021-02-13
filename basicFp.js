/**
 * 入力されたデッキビルダー形式のJSONから6隻の艦娘の基本攻撃力を返す。
 * @param {JSON} FLEET 入力されたデッキビルダー形式のJSON
 * @param {Array} I_N itemsの各要素のキー名
 * @param {Array} shipItemId その艦娘が持つ装備のidをすべて格納する。未所持の場合は0とする。
 * @param {Array} shipFp 表示火力
 * @param {Array} shipTop 雷装 ただし空母系のみ
 * @param {Array} shipBom 爆装 ただし空母系のみ
 * @returns {Array} basicFp これを返す。
 */
function getBasicFp(FLEET) {
    const SHIP_NUM = Object.keys(FLEET.f1).length
    
    let shipFp;
    let shipTop;
    let shipBom;
    let basicFp = new Array(SHIP_NUM);

    let shipId;
    let shipItemId = new Array(I_N.length);
    let shipItemRf = new Array(I_N.length);

    for (let i = 0; i < SHIP_NUM; i++) {

        // 艦娘FLEET.f1[i]の素火力を格納
        shipId = getShipvalue(i, 'id', FLEET, 'f1');
        shipFp = id2value(shipId, 'fp', SHIPS);

        // この艦娘の装備の合計火力、雷装、爆装を加算する。
        shipTop = 0;
        shipBom = 0;
        shipItemId = getShipItemValue(i, 'id', I_N, FLEET);
        shipItemRf = getShipItemValue(i, 'rf', I_N, FLEET);
        for (let j = 0; j < I_N.length; j++) {
            shipFp += id2value(shipItemId[j], 'fp', EQUIPS);
            // 艦爆か艦攻を搭載しているならば雷装と爆装を加算
            if (ATTACK_or_BOMMER_PLANE.indexOf(shipItemId[j]) >= 0) {
                shipTop += id2value(shipItemId[j], 'top', EQUIPS);
                shipBom += id2value(shipItemId[j], 'bom', EQUIPS);
            }
        }

        // 装備ボーナスを加算する
        shipFp += getBonusFp(shipId, shipItemId, shipItemRf);

        // 基本攻撃力にする
        basicFp[i] = calcBasicFp(shipId, shipFp, shipTop, shipBom);
    }
    return basicFp;
}

/**
 * その艦娘の所持装備を配列で返す。
 * @param {number} index 編成[index]
 * @param {Array} I_N
 * @param {JSON} FLEET
 */
function getShipItemValue(index, value, I_N, FLEET) {
    let shipKey = 's' + (index + 1);
    let item = new Array(I_N.length);
    for (let i = 0; i < I_N.length; i++) {
        try {
            item[i] = FLEET.f1[shipKey].items[I_N[i]][value];
        } catch(e) {
            item[i] = 0;
        }
    }

    return item;
}

/**
 * 装備ボーナスを返す
 */
function getBonusFp(shipId, shipItemId, shipItemRf) {
    const SHIP_TYPE = id2value(shipId, 'type', SHIPS);
    const SHIP_CLASS = id2value(shipId, 'class', SHIPS);
    const SHIP_YOMI = id2value(shipId, 'yomi', SHIPS);

    let bonusFp = 0;
    let num = 0;
    let rfs = new Array(shipItemRf.length);



    // 流星=18
    // 流星改=52
    if (num = howManyEquips(18, shipItemId) + howManyEquips(52, shipItemId)) {
        /**
         * 赤城改=277, 加賀改=278, 大鳳改=156
         * 赤城改二=594, 加賀改二=698, 加賀改二護=646
         * 赤城改二戊=599, 加賀改二戊=610
         */
        if ([277, 278, 156].indexOf(shipId) >= 0) {
            bonusFp += 1 * num;
        } else if ([594, 698, 648].indexOf(shipId) >= 0) {
            bonusFp += 1 * num;
        } else if ([599, 610].indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
        }
    }

    // 九六式艦戦=19
    if (num = howManyEquips(19, shipItemId)) {
        if (SHIP_YOMI === 'ほうしょう') {
            bonusFp += 2 * num;
        } else if (SHIP_YOMI === 'たいよう') {
            bonusFp += 2 * num;
        } else if (SHIP_YOMI === 'しんよう') {
            bonusFp += 2 * num;
        }
    }

    // 彗星=24
    // 彗星一二型甲=57
    // 彗星(六〇一空)=111
    if (num = howManyEquips(24, shipItemId) + howManyEquips(57, shipItemId) + howManyEquips(111, shipItemId)) {
        /**
         * 伊勢改二=553, 日向改二=554
         */
        if ([553, 554].indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
        }
    }

    // 三式弾=35
    if (howManyEquips(35, shipItemId)) {
        /**
         * 金剛改二=149, 金剛改二丙=591,
         * 比叡改二丙=592
         * 霧島改二=152
         */
        if ([149, 591].indexOf(shipId) >= 0) {
            bonusFp += 1;
        } else if (shipId === 592) {
            bonusFp += 1;
        } else if (shipId === 152) {
            bonusFp += 1;
        }
    }

    // 三式水中探信儀=47
    if (num = howManyEquips(47, shipItemId)) {
        if (SHIP_YOMI === 'かみかぜ') {
            bonusFp += 1 * num;
        } else if (SHIP_YOMI === 'はるかぜ') {
            bonusFp += 1 * num;
        } else if (SHIP_YOMI === 'しぐれ') {
            bonusFp += 1 * num;
        } else if (SHIP_YOMI === 'やまかぜ') {
            bonusFp += 1 * num;
        } else if (SHIP_YOMI === 'まいかぜ') {
            bonusFp += 1 * num;
        } else if (SHIP_YOMI === 'あさしも') {
            bonusFp += 1 * num;
        }
    }

    // 二式艦上偵察機=61
    if (howManyEquips(61, shipItemId)) {
        let rfMax = rfOfItemId(61, shipItemId, shipItemRf).reduce(function(a, b) {
            return Math.max(a, b);
        });
        /**
         * 基本改修効果
         * 4 <= rf <= 9 : +1
         * rf = 10      : +2
         */
        if (4 <= rfMax && rfMax <= 9) {
            bonusFp += 1;
        } else if (rfMax >= 10) {
            bonusFp += 2;
        }

        /** 
         * 艦娘+改修効果
         * 伊勢改二=553, 日向改二=554
         * 蒼龍=90, 蒼龍改=279, 蒼龍改二=197
         * 飛龍=91, 飛龍改=280, 飛龍改二=196
         * 瑞鳳改二乙=560, 鈴谷航改二=508, 熊野航改二=509
         */
        if ([553, 554].indexOf(shipId) >= 0) {
            bonusFp += 3;
        } else if ([90, 279, 197].indexOf(shipId) >= 0) {
            if (1 <= rfMax && rfMax <= 7) {
                bonusFp += 3;
            } else if (rfMax >= 8) {
                bonusFp += 4;
            }
        } else if ([91, 280, 196].indexOf(shipId) >= 0) {
            if (rfMax >= 1) {
                bonusFp += 2;
            }
        } else if ([560, 508, 509].indexOf(shipId) >= 0) {
            if (rfMax >= 1) {
                bonusFp += 1;
            }
        }
    }

    // 12.7cm連装砲B型改二=63
    if (num = howManyEquips(63, shipItemId)) {
        /**
         * 敷波改二=627
         * 時雨改二=145
         * 夕立改=245, 夕立改二=144
         */
        if (shipId === 627) {
            bonusFp += 1 * num;
        } else if (shipId === 145) {
            bonusFp += 1 * num;
        } else if ([245, 144].indexOf(shipId) >= 0) {
            bonusFp += 1 * num;
        }
    }

    // 瑞雲(六三四空)=79
    // 瑞雲12型(六三四空)=81
    if (num = howManyEquips(79, shipItemId) + howManyEquips(81, shipItemId)) {
        /**
         * 扶桑改=286, 扶桑改二=411
         * 山城改=287, 山城改二=412
         * 伊勢改=82, 日向改=88
         * 伊勢改二=553, 日向改二=554
         */
        if ([286, 411].indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
        } else if ([287, 412].indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
        } else if ([82, 88].indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
        } else if ([553, 554].indexOf(shipId) >= 0) {
            bonusFp += 3 * num;
        }
    }

    // 九七式艦攻(友永隊)=93
    if (howManyEquips(93, shipItemId)) {
        if (SHIP_YOMI === 'そうりゅう') {
            bonusFp += 1;
        } else if (SHIP_YOMI === 'ひりゅう') {
            bonusFp += 3;
        }
    }

    // 天山一二型(友永隊)=94
    if (howManyEquips(94, shipItemId)) {
        /** 
         * 蒼龍改二=197
         * 飛龍改二=196
         */
        if (shipId === 197) {
            bonusFp += 3;
        } else if (shipId === 196) {
            bonusFp += 7;
        }
    }

    // 九九式艦爆(江草隊)=99
    if (howManyEquips(99, shipItemId)) {
        if (SHIP_YOMI === 'そうりゅう') {
            bonusFp += 4;
        } else if (SHIP_YOMI === 'ひりゅう') {
            bonusFp += 1;
        }
    }

    // 彗星(江草隊)=100
    if (howManyEquips(100, shipItemId)) {
        /** 
         * 蒼龍改二=197
         * 飛龍改二=196
         * 伊勢改二=553, 日向改二=554
         */
        if (shipId === 197) {
            bonusFp += 6;
        } else if (shipId === 196) {
            bonusFp += 3;
        } else if ([553, 554].indexOf(shipId) >= 0) {
            bonusFp += 4;
        }
    }

    // 35.6cm連装砲(ダズル迷彩)=104
    if (num = howManyEquips(104, shipItemId)) {
        /**
         * 金剛改二=149, 榛名改二=151
         * 比叡改二=150, 霧島改二=152
         */        
        if ([149, 151].indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
        } else if ([150, 152].indexOf(shipId) >= 0) {
            bonusFp += 1 * num;
        }
    }

    // 13号対空電探改=106
    if (num = howManyEquips(106, shipItemId)) {
        /**
         * 潮改二=407, 時雨改二=145, 初霜改二=419, 榛名改二=151, 長門改二=541
         * (沖波改二=569, 秋雲改二=648 これらについては, 全ての対空電探に補正があるため, 別で扱う)
         */
        if ([407, 145, 419, 151, 541].indexOf(shipId) >= 0) {
            bonusFp += 1 * num;
        }
    }

    // 14cm連装砲=119
    if (num = howManyEquips(119, shipItemId)) {
        if (SHIP_YOMI === 'ゆうばり') {
            bonusFp += 1 * num;
        } else if (SHIP_YOMI === 'かとり') {
            bonusFp += 1 * num;
        } else if (SHIP_YOMI === 'かしま') {
            bonusFp += 1 * num;
        } else if (SHIP_YOMI === 'にっしん') {
            bonusFp += 2 * num;
        }
    }

    // 15.2cm連装砲改=139
    if (num = howManyEquips(139, shipItemId)) {
        // 能代改二=662
        if (shipId === 662) {
            bonusFp += 2 * num;
        }
    }

    // 九七式艦攻(村田隊)=143
    if (howManyEquips(143, shipItemId)) {
        /** 
         * 赤城改=277, 赤城改二=594, 赤城改二戊=599
         * 加賀改=278, 加賀改二=698, 加賀改二戊=610, 加賀改二護=646
         * 翔鶴=110, 翔鶴改=288, 翔鶴改二=461, 翔鶴改二甲=466
         * 瑞鶴=111, 瑞鶴改=112, 瑞鶴改二=462, 瑞鶴改二甲=467
         * 龍驤改=281, 龍驤改二=157
         */
        if ([277, 594, 599].indexOf(shipId) >= 0) {
            bonusFp += 3;
        } else if ([278, 698, 610, 646].indexOf(shipId) >= 0) {
            bonusFp += 2;
        } else if (SHIP_YOMI === 'しょうかく') {
            bonusFp += 2;
        } else if (SHIP_YOMI === 'ずいかく') {
            bonusFp += 1;
        } else if (SHIP_YOMI === 'りゅうじょう') {
            bonusFp += 1;
        }
    }

    // 天山一二型(村田隊)=144
    if (howManyEquips(144, shipItemId)) {
        /** 
         * 赤城改=277, 赤城改二=594, 赤城改二戊=599
         * 加賀改=278, 加賀改二=698, 加賀改二戊=610, 加賀改二護=646
         * 翔鶴=110, 翔鶴改=288, 
         * 翔鶴改二=461, 翔鶴改二甲=466
         * 瑞鶴=111, 瑞鶴改=112, 
         * 瑞鶴改二=462, 瑞鶴改二甲=467
         * 龍驤=76, 龍驤改=281, 龍驤改二=157
         */
        if ([277, 594, 599].indexOf(shipId) >= 0) {
            bonusFp += 3;
        } else if ([278, 698, 610, 646].indexOf(shipId) >= 0) {
            bonusFp += 2;
        } else if ([110, 288].indexOf(shipId) >= 0) {
            bonusFp += 2;
        } else if ([461, 466].indexOf(shipId) >= 0) {
            bonusFp += 4;
        } else if ([111, 112].indexOf(shipId) >= 0) {
            bonusFp += 1;
        } else if ([462, 467].indexOf(shipId) >= 0) {
            bonusFp += 2;
        } else if (SHIP_YOMI === 'りゅうじょう') {
            bonusFp += 1;
        }
    }

    // 120mm/50 連装砲=147
    if(num = howManyEquips(147, shipItemId)) {
        if (SHIP_CLASS === 'Maestrale級') {
            bonusFp += 1 * num;
        }
    }

    // 試製景雲(艦偵型)=151
    if (howManyEquips(151, shipItemId)) {
        let rfMax = rfOfItemId(151, shipItemId, shipItemRf).reduce(function(a, b) {
            return Math.max(a, b);
        });
        /**
         * 基本改修効果
         * 4 <= rf <= 9 : +1
         * rf = 10      : +2
         */
        if (4 <= rfMax && rfMax <= 9) {
            bonusFp += 1;
        } else if (rfMax >= 10) {
            bonusFp += 2;
        }
    }

    // OS2U=171
    if (howManyEquips(171, shipItemId)) {
        let rfMax = rfOfItemId(171, shipItemId, shipItemRf).reduce(function(a, b) {
            return Math.max(a, b);
        });
        const US_SHIPS = ['コロラド', 'ワシントン', 'サウスダコタ', 'アイオワ', 'ヒューストン', 'ヘレナ', 'アトランタ'];
        if (US_SHIPS.indexOf(SHIP_YOMI) >= 0) {
            if (rfMax >= 10) {
                bonusFp += 1;
            }
        }
    }

    // Re.2001 OR改=184
    if (num = howManyEquips(184, shipItemId)) {
        if (SHIP_YOMI === 'アクィラ') {
            bonusFp += 1 * num;
        }
    }

    // Re.2001 G改=188
    if (num = howManyEquips(188, shipItemId)) {
        if (SHIP_YOMI === 'アクィラ') {
            bonusFp += 3 * num;
        }
    }

    // Late 298B=194
    if (num = howManyEquips(194, shipItemId)) {
        /**
         * リシュリュー改=392
         * コマンダン･テスト=491, コマンダン･テスト改=372
         */
        if (shipId === 392) {
            bonusFp += 1 * num;
        } else if (SHIP_YOMI === 'コマンダン・テスト') {
            bonusFp += 3 * num;
        }
    }

    // 8cm高角砲改+増設機銃=220
    if (num = howManyEquips(220, shipItemId)) {
        // 能代改二=662
        if (shipId === 662) {
            bonusFp += 1 * num;
        }
    }

    // 九六式艦戦改=228
    if (num = howManyEquips(228, shipItemId)) {
        if (SHIP_YOMI === 'ほうしょう') {
            bonusFp += 3 * num;
        } else if (SHIP_YOMI === 'たいよう') {
            bonusFp += 2 * num;
        } else if (SHIP_YOMI === 'しんよう') {
            bonusFp += 2 * num;
        }
    }

    // SK+SG レーダー=279
    if (howManyEquips(279, shipItemId)) {
        let rfMax = rfOfItemId(279, shipItemId, shipItemRf).reduce(function(a, b) {
            return Math.max(a, b);
        });
        const US_SHIPS = [
            'コロラド', 'ワシントン', 'サウスダコタ', 'アイオワ',
            'サラトガ', 'ホーネット', 'イントレピッド', 'ガンビア・ベイ',
            'ヒューストン',
            'ヘレナ', 'アトランタ'
        ];
        const UK_SHIPS = [
            'ウォースパイト', 'ネルソン',
            'アークロイヤル',
            'シェフィールド',
            'パース'
        ];
        if (US_SHIPS.indexOf(SHIP_YOMI) >= 0) {
            if (rfMax >= 10) {
                bonusFp += 2;
            }
        } else if (UK_SHIPS.indexOf(SHIP_YOMI) >= 0) {
            bonusFp += 1;
        }
        
    }

    // 533mm 三連装魚雷=283
    if (num = howManyEquips(283, shipItemId)) {
        /**
         * タシュケント=516, タシュケント改=395
         * ベールヌイ=147
         */
        if (SHIP_YOMI === 'タシュケント') {
            bonusFp += 1 * num;
        } else if (shipId === 147) {
            bonusFp += 1 * num;
        }
    }

    // 試製15cm9連装対潜噴進砲=288
    if (num = howManyEquips(288, shipItemId)) {
        // 夕張改二丁=624
        if (shipId === 624) {
            bonusFp += 1 * num;
        }
    }

    // 彗星二二型(六三四空)=291
    if (num = howManyEquips(291, shipItemId)) {
        /**
         * 伊勢改二=553, 日向改二=554
         */
        if ([553, 554].indexOf(shipId) >= 0) {
            bonusFp += 6 * num;
        }
    }

    // 彗星二二型(六三四空/熟練)=292
    if (num = howManyEquips(292, shipItemId)) {
        /**
         * 伊勢改二=553, 日向改二=554
         */
        if ([553, 554].indexOf(shipId) >= 0) {
            bonusFp += 8 * num;
        }
    }

    // 16inch Mk.I三連装砲=298
    // 16inch Mk.I三連装砲+AFCT改=299
    // 16inch Mk.I三連装砲改+FCR type284=300
    if (num = howManyEquips(298, shipItemId) + howManyEquips(299, shipItemId) + howManyEquips(300, shipItemId)) {
        /**
         * ネルソン=571, ネルソン改=576
         * ウォースパイト=439, ウォースパイト改=364
         * 金剛改二=149, 比叡改二=150, 榛名改二=151, 霧島改二=152
         */
        if (SHIP_YOMI === 'ネルソン') {
            bonusFp += 2 * num;
        } else if (SHIP_YOMI === 'ウォースパイト') {
            bonusFp += 2;
        } else if ([149, 150, 151, 152].indexOf(shipId) >= 0) {
            bonusFp += 1 * num;
        }
    }

    // Bofors 15.2cm連装砲 Model 1930=303
    // S9 Osprey=304
    if (num = howManyEquips(303, shipItemId) + howManyEquips(304, shipItemId)) {
        if (['球磨型', '長良型', '川内型', '阿賀野型'].indexOf(SHIP_CLASS) >= 0) {
            bonusFp += 1 * num;
        } else if (SHIP_YOMI === 'ゴトランド') {
            bonusFp += 1 * num;
        }
    }

    // Ju87C改二(KMX搭載機)=305
    // Ju87C改二(KMX搭載機/熟練)=306
    if (num = howManyEquips(305, shipItemId) + howManyEquips(306, shipItemId)) {
        if (SHIP_YOMI === 'グラーフ・ツェッペリン') {
            bonusFp += 1 * num;
        } else if (SHIP_YOMI === 'アクィラ') {
            bonusFp += 1 * num;
        }
    }

    // GFCS Mk.37=307
    if (num = howManyEquips(307, shipItemId)) {
        const US_SHIPS = [
            'コロラド', 'ワシントン', 'サウスダコタ', 'アイオワ',
            'サラトガ', 'ホーネット', 'イントレピッド', 'ガンビア・ベイ',
            'ヒューストン',
            'ヘレナ', 'アトランタ',
            'フレッチャー', 'ジョンストン', 'サミュエル・B・ロバーツ'
        ];
        if (US_SHIPS.indexOf(SHIP_YOMI) >= 0) {
            bonusFp += 1 * num;
        }
    }

    // 5inch単装砲 Mk.30改+GFCS Mk.37=308
    if (num = howManyEquips(308, shipItemId)) {
        // 丹陽=651, 雪風改二=656
        const US_DD_SHIPS = ['フレッチャー', 'ジョンストン', 'サミュエル・B・ロバーツ'];
        const US_CL_SHIPS = ['ヘレナ', 'アトランタ'];
        
        if (US_DD_SHIPS.indexOf(SHIP_YOMI) >= 0) {
            bonusFp += 2 * num;
        } else if ([651, 656].indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
        } else if (US_CL_SHIPS.indexOf(SHIP_YOMI) >= 0) {
            bonusFp += 1 * num;
        } else if (SHIP_TYPE === '駆逐艦') {
            bonusFp += 1 * num;
        }        
    }

    // 5inch単装砲 Mk.30改=313
    if (num = howManyEquips(313, shipItemId)) {
        // 丹陽=651, 雪風改二=656
        const US_DD_SHIPS = ['フレッチャー', 'ジョンストン', 'サミュエル・B・ロバーツ'];

        if (US_DD_SHIPS.indexOf(SHIP_YOMI) >= 0) {
            bonusFp += 2 * num;
        } else if ([651, 656].indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
        }        
    }

    // 533mm五連装魚雷(初期型)=314
    if (num = howManyEquips(314, shipItemId)) {
        const US_DD_SHIPS = ['フレッチャー', 'ジョンストン', 'サミュエル・B・ロバーツ'];

        if (US_DD_SHIPS.indexOf(SHIP_YOMI) >= 0) {
            bonusFp += 1 * num;
        }        
    }

    // SG レーダー(初期型)=315
    if (num = howManyEquips(315, shipItemId)) {
        // 丹陽=651, 雪風改二=656
        const US_DD_SHIPS = ['フレッチャー', 'ジョンストン', 'サミュエル・B・ロバーツ'];
        const US_SHIPS = [
            'コロラド', 'ワシントン', 'サウスダコタ', 'アイオワ',
            'サラトガ', 'ホーネット', 'イントレピッド', 'ガンビア・ベイ',
            'ヒューストン',
            'ヘレナ', 'アトランタ',
        ];

        if (US_DD_SHIPS.indexOf(SHIP_YOMI) >= 0) {
            bonusFp += 3 * num;
        } else if (US_SHIPS.indexOf(SHIP_YOMI) >= 0) {
            bonusFp += 2 * num;
        } else if ([651, 656].indexOf(shipId) >= 0) {
            bonusFp += 2;
        }
    }

    // Re.2001 CB改=316
    if (num = howManyEquips(316, shipItemId)) {
        if (SHIP_YOMI === 'アクィラ') {
            bonusFp += 4 * num;
        }
    }

    // 三式弾改=317
    if (howManyEquips(317, shipItemId)) {
        /**
         * +1:
         * 金剛=78, 金剛改=209
         * 比叡=86, 比叡改=210
         * 榛名=79, 榛名改=211
         * 霧島=85, 霧島改=212
         * 長門改二=541
         * 
         * +2:
         * 比叡改二=150,
         * 榛名改二=151
         * 陸奥改二=573
         * 
         * +3:
         * 金剛改二=149, 金剛改二丙=591,
         * 比叡改二丙=592
         * 霧島改二=152
         */
        let add1 = [
            78, 209,
            86, 210,
            79, 211,
            85, 212,
            541
        ];

        let add2 = [
            120,
            151,
            573
        ];

        let add3 = [
            149, 591,
            592,
            152
        ];
        if (add1.indexOf(shipId) >= 0) {
            bonusFp += 1;
        } else if (add2.indexOf(shipId) >= 0) {
            bonusFp += 2;
        } else if (add3.indexOf(shipId) >= 0) {
            bonusFp += 3;
        }
    }

    // 彗星一二型(六三四空/三号爆弾搭載機)=319
    if (num = howManyEquips(319, shipItemId)) {
        /**
         * 伊勢改二=553, 日向改二=554
         */
        if ([553, 554].indexOf(shipId) >= 0) {
            bonusFp += 7 * num;
        }
    }

    // 彗星一二型(三一号光電管爆弾搭載機)=320
    if (num = howManyEquips(320, shipItemId)) {
        /** 
         * 2+:
         * 伊勢改二=553
         * 
         * 3+:
         * 蒼龍改二=197
         * 飛龍改二=196
         * 
         * +4:
         * 日向改二=554
         * 鈴谷航改二=508
         * 熊野航改二=509,
         */
        if (shipId === 553) {
            bonusFp += 2 * num;
        } else if ([197, 196].indexOf(shipId) >= 0) {
            bonusFp += 3 * num;
        } else if ([554, 508, 509].indexOf(shipId) >= 0) {
            bonusFp += 4 * num;
        }
    }

    // 35.6cm連装砲改=328
    if (num = howManyEquips(328, shipItemId)) {
        /**
         * +1:
         * 伊勢型, 扶桑型
         * 金剛=78, 比叡=86, 榛名=79, 霧島=85
         * 
         * +2:
         * 金剛改=209, 金剛改二=149
         * 比叡改=210, 比叡改二=150
         * 榛名改=211, 榛名改二=151
         * 霧島改=212, 霧島改二=152
         * 
         * +3:
         * 金剛改二丙=591, 比叡改二丙=592
         */

        let add1 = [ 78, 86, 79, 85];
        let add2 = [
            209, 149,
            210, 150,
            211, 151,
            212, 152,
        ];
        let add3 = [
            591,
            592
        ];
        if (['伊勢型', '扶桑型'].indexOf(SHIP_CLASS) >= 0) {
            bonusFp += 1 * num;
        } else if (add1.indexOf(shipId) >= 0) {
            bonusFp += 1 * num;
        } else if (add2.indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
        } else if (add3.indexOf(shipId) >= 0) {
            bonusFp += 3 * num;
        }
    }

    // 35.6cm連装砲改二=329
    if (num = howManyEquips(329, shipItemId)) {
        /**
         * +1:
         * 金剛=78, 比叡=86, 榛名=79, 霧島=85
         * 伊勢型, 扶桑型
         * 
         * +2:
         * 金剛改=209, 比叡改=210, 榛名改=211, 霧島改=212
         * 
         * +3:
         * 金剛改二=149, 比叡改二=150, 榛名改二=151, 霧島改二=152
         * 
         * +4:
         * 金剛改二丙=591, 比叡改二丙=592
         */
        let add1 = [78, 86, 79, 85];
        if (['伊勢型', '扶桑型'].indexOf(SHIP_CLASS) >= 0) {
            bonusFp += 1 * num;
        } else if (add1.indexOf(shipId) >= 0) {
            bonusFp += 1 * num;
        } else if ([209, 210, 211, 212].indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
        } else if ([149, 150, 151, 152].indexOf(shipId) >= 0) {
            bonusFp += 3 * num;
        } else if ([591, 592].indexOf(shipId) >= 0) {
            bonusFp += 4 * num;
        }
    }

    // 16inch Mk.I連装砲=330
    if (num = howManyEquips(330, shipItemId)) {
        /**
         * +1:
         * 長門=80, 長門改=275
         * 陸奥=81, 陸奥改=276
         * コロラド=601, コロラド改=1496
         * 
         * +2:
         * 長門改二=541
         * 陸奥改二=573
         * ネルソン改=576
         */
        let add1 = [
            80, 275,
            81, 276,
            601, 1496
        ];
        if (add1.indexOf(shipId) >= 0) {
            bonusFp += 1 * num;
        } else if ([541, 573, 576].indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
        }
    }

    // 16inch Mk.V連装砲=331
    // 16inch Mk.VIII連装砲改=332
    if (num = howManyEquips(331, shipItemId) + howManyEquips(332, shipItemId)) {
        /**
         * +1:
         * 長門=80, 長門改=275
         * 陸奥=81, 陸奥改=276
         * ネルソン=571
         * コロラド=601
         * 
         * +2:
         * 長門改二=541
         * 陸奥改二=573
         * ネルソン改=576
         * コロラド改=1496
         */
        let add1 = [
            80, 275,
            81, 276,
            571,
            601
        ];
        if (add1.indexOf(shipId) >= 0) {
            bonusFp += 1 * num;
        } else if ([541, 573, 576, 1496].indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
        }
    }

    // 烈風改二=336
    if (num = howManyEquips(336, shipItemId)) {
        /**
         * 赤城改=277, 加賀改=278
         * 赤城改二=594, 赤城改二戊=599
         * 加賀改二=698, 加賀改二戊=610, 加賀改二護=646 
         */
        if ([277, 278].indexOf(shipId) >= 0) {
            bonusFp += 1 * num;
        } else if ([594, 599].indexOf(shipId) >= 0) {
            bonusFp += 1 * num;
        } else if ([698, 610, 646].indexOf(shipId) >= 0) {
            bonusFp += 1 * num;
        }
    }

    // 烈風改二戊型=338
    if (num = howManyEquips(338, shipItemId)) {
        /**
         * +1:
         * 赤城改=277, 加賀改=278
         * 赤城改二=594, 加賀改二=698, 賀改二護=646 
         * 
         * +4:
         * 赤城改二戊=599
         * 加賀改二戊=610
         */
        if ([277, 278].indexOf(shipId) >= 0) {
            bonusFp += 1 * num;
        } else if ([594, 698, 646].indexOf(shipId) >= 0) {
            bonusFp += 1 * num;
        } else if ([599, 610].indexOf(shipId) >= 0) {
            bonusFp += 4 * num;
        }
    }

    // 烈風改二戊型(一航戦/熟練)=339
    if (num = howManyEquips(339, shipItemId)) {
        /**
         * +1:
         * 赤城改=277, 加賀改=278
         * 赤城改二=594, 加賀改二=698, 賀改二護=646 
         * 
         * +6:
         * 赤城改二戊=599
         * 加賀改二戊=610
         */
        if ([277, 278].indexOf(shipId) >= 0) {
            bonusFp += 1 * num;
        } else if ([594, 698, 646].indexOf(shipId) >= 0) {
            bonusFp += 1 * num;
        } else if ([599, 610].indexOf(shipId) >= 0) {
            bonusFp += 6 * num;
        }
    }

    // 152mm/55 三連装速射砲=340
    if (num = howManyEquips(340, shipItemId)) {
        if (SHIP_CLASS === 'L.d.S.D.d.Abruzzi級') {
            bonusFp += 1 * num;
        }
    }

    // 152mm/55 三連装速射砲改=341
    if (num = howManyEquips(341, shipItemId)) {
        if (SHIP_YOMI === 'ゴトランド') {
            bonusFp += 1 * num;
        } else if (SHIP_CLASS === 'L.d.S.D.d.Abruzzi級') {
            bonusFp += 2 * num;
        }
    }

    // 流星改(一航戦)=342
    if (num = howManyEquips(342, shipItemId)) {
        /**
         * +1:
         * 赤城改=277, 加賀改=278
         * 翔鶴改二=461, 翔鶴改二甲=466
         * 瑞鶴改二=462,瑞鶴改二甲=467
         *  
         * +2:
         * 赤城改二=594, 加賀改二=698, 賀改二護=646
         * 
         * +3:
         * 赤城改二戊=599
         * 加賀改二戊=610
         */
        let add1 = [
            277, 278,
            461, 466,
            462, 467
        ];
        if (add1.indexOf(shipId) >= 0) {
            bonusFp += 1 * num;
        } else if ([594, 698, 646].indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
        } else if ([599, 610].indexOf(shipId) >= 0) {
            bonusFp += 3 * num;
        }
    }

    // 流星改(一航戦/熟練)=343
    if (num = howManyEquips(343, shipItemId)) {
        /**
         * +1:
         * 翔鶴改二=461, 翔鶴改二甲=466
         * 瑞鶴改二=462,瑞鶴改二甲=467
         *  
         * +2:
         * 赤城改=277, 加賀改=278
         * 
         * +3:
         * 赤城改二=594, 加賀改二=698, 賀改二護=646
         * 
         * +5:
         * 赤城改二戊=599
         * 加賀改二戊=610
         */
        if ([461, 466, 462, 467].indexOf(shipId) >= 0) {
            bonusFp += 1 * num;
        } else if ([277, 278].indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
        } else if ([594, 698, 646].indexOf(shipId) >= 0) {
            bonusFp += 3 * num;
        } else if ([599, 610].indexOf(shipId) >= 0) {
            bonusFp += 5 * num;
        }
    }

    // 九七式艦攻改 試製三号戊型(空六号電探改装備機)=344
    if (num = howManyEquips(344, shipItemId)) {
        /**
         * +2:
         * 祥鳳改=282
         * 瑞鳳改二=555, 瑞鳳改二乙=560
         * 
         * +3:
         * 赤城改二戊=599
         * 加賀改二戊=610
         * 
         * +4:
         * 龍鳳改=318
         */
        if ([282, 555, 560].indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
        } else if ([599, 610].indexOf(shipId) >= 0) {
            bonusFp += 3 * num;
        } else if (shipId === 318) {
            bonusFp += 4 * num;
        }
    }

    // 九七式艦攻改(熟練) 試製三号戊型(空六号電探改装備機)=345
    if (num = howManyEquips(345, shipItemId)) {
        /**
         * +3:
         * 祥鳳改=282
         * 瑞鳳改二=555, 瑞鳳改二乙=560
         * 赤城改二戊=599
         * 加賀改二戊=610
         * 
         * +5:
         * 龍鳳改=318
         */
        if ([282, 555, 560, 599, 610].indexOf(shipId) >= 0) {
            bonusFp += 3 * num;
        } else if (shipId === 318) {
            bonusFp += 5 * num;
        }
    }

    // 8inch三連装砲 Mk.9=356
    // 8inch三連装砲 Mk.9 mod.2=357
    if (num = howManyEquips(356, shipItemId) + howManyEquips(357, shipItemId)) {
        if (SHIP_CLASS === '最上型') {
            bonusFp += 1 * num;
        } else if (SHIP_YOMI === 'ヒューストン') {
            bonusFp += 2 * num;
        }
    }

    // 5inch 単装高角砲群=358
    if (num = howManyEquips(358, shipItemId)) {
        const US_SHIPS = [
            'コロラド', 'ワシントン', 'サウスダコタ', 'アイオワ',
            'サラトガ', 'ホーネット', 'イントレピッド', 'ガンビア・ベイ',
            'ヘレナ', 'アトランタ',
        ];
        const UK_SHIPS = ['ウォースパイト', 'ネルソン', 'アークロイヤル'];

        if (US_SHIPS.indexOf(SHIP_YOMI) >= 0) {
            bonusFp += 1 * num;
        } else if (UK_SHIPS.indexOf(SHIP_YOMI) >= 0) {
            bonusFp += 1 * num;
        } else if (SHIP_YOMI === 'ヒューストン') {
            bonusFp += 2 * num;
        }
    }

    // 6inch 連装速射砲 Mk.XXI=359
    if (num = howManyEquips(359, shipItemId)) {
        /**
         * +1:
         * 夕張=115, 夕張改=293
         * 
         * +2:
         * 夕張改二=622, 夕張改二特=623, 夕張改二丁=624
         * パース=613, パース改=618
         */
        if ([115, 293].indexOf(shipId) >= 0) {
            bonusFp += 1 * num;
        } else if ([622, 623, 624].indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
        } else if (SHIP_YOMI === 'パース') {
            bonusFp += 2 * num;
        }
    }

    // Bofors 15cm連装速射砲 Mk.9 Model 1938=360
    // Bofors 15cm連装速射砲 Mk.9改+単装速射砲 Mk.10改 Model 1938=361
    if (num = howManyEquips(360, shipItemId) + howManyEquips(361, shipItemId)) {
        if (SHIP_CLASS === '阿賀野型') {
            bonusFp += 1 * num;
        } else if (SHIP_YOMI === 'ゴトランド') {
            bonusFp += 2 * num;
        } else if (SHIP_YOMI === 'デ・ロイテル') {
            bonusFp += 2 * num;
        }
    }

    // 5inch連装両用砲(集中配備)=362
    // GFCS Mk.37+5inch連装両用砲(集中配備)=363
    if (num = howManyEquips(362, shipItemId) + howManyEquips(363, shipItemId)) {
        if (['天龍型', '長良型', '球磨型', '川内型'].indexOf(SHIP_CLASS) >= 0) {
            bonusFp += -3 * num;
        } else if (SHIP_YOMI === 'ゆうばり') {
            bonusFp += -3 * num;
        } else if (SHIP_CLASS === '香取型') {
            bonusFp += -2 * num;
        } else if (SHIP_YOMI === 'ゴトランド') {
            bonusFp += -2 * num;
        } else if (SHIP_YOMI === 'アトランタ') {
            bonusFp += 1 * num;
        }
    }

    // 甲標的 丁型改(蛟龍改)=364
    if (num = howManyEquips(364, shipItemId)) {
        /**
         * -1:
         * 木曾改二=146, 阿武隈改二=200, 由良改二=488
         * 千歳型, 
         * 瑞穂=451, 瑞穂改=348, 神威改=499
         * 潜水艦, 潜水空母
         * 
         * +1:
         * 夕張改二特=623
         */

        if ([146, 200, 488].indexOf(shipId) >= 0) {
            bonusFp += -1 * num;
        } else if (SHIP_CLASS === '千歳型') {
            bonusFp += -1 * num;
        } else if ([451, 348, 499].indexOf(shipId) >= 0) {
            bonusFp += -1 * num;
        } else if (['潜水艦', '潜水空母'].indexOf(SHIP_CLASS) >= 0) {
            bonusFp += -1 * num;
        } else if (shipId === 623) {
            bonusFp += 1 * num;
        }        
    }

    // 一式徹甲弾改=365
    if (howManyEquips(365, shipItemId)) {
        /**
         * +1:
         * 金剛=78, 金剛改=209, 金剛改二=149
         * 比叡=86, 比叡改=210, 比叡改二=150
         * 榛名=79, 榛名改=211, 榛名改二=151
         * 霧島=85, 霧島改=212, 霧島改二=152
         * 
         * 扶桑型, 伊勢型
         * 
         * 長門=80, 長門改=275
         * 陸奥=81, 陸奥改=276
         * 
         * 大和=131
         * 武蔵=143
         */
        let add1 = [
            78, 209, 149,
            86, 210, 150,
            79, 211, 151,
            85, 212, 152,

            80, 275, 
            81, 276,

            131,
            143
        ];

        /**
         * +2:
         * 長門改二=541
         * 陸奥改二=573
         * 大和改=136
         * 武蔵改=148, 武蔵改二=546
         */
        let add2 = [
            541,
            573,
            136,
            148, 546
        ];

        /**
         * +3:
         * 金剛改二丙=591, 比叡改二丙=592
         */
        let add3 = [591, 592];
        if (['扶桑型', '伊勢型'].indexOf(SHIP_CLASS) >= 0) {
            bonusFp += 1;
        } else if (add1.indexOf(shipId) >= 0) {
            bonusFp += 1;
        } else if (add2.indexOf(shipId) >= 0) {
            bonusFp += 2;
        } else if (add3.indexOf(shipId) >= 0) {
            bonusFp += 3;
        }
    }

    // Swordfish(水上機型)=367
    if (num = howManyEquips(367, shipItemId)) {
        if (['みずほ', 'かもい', 'コマンダン・テスト'].indexOf(SHIP_YOMI) >= 0) {
            bonusFp += 1 * num;
        } else if (SHIP_YOMI === 'ゴトランド') {
            bonusFp += 2 * num;
        }
    }

    // Swordfish Mk.III改(水上機型)=368
    if (num = howManyEquips(368, shipItemId)) {
        /**
         * +1:
         * 瑞穂=451, 瑞穂改=348
         * 神威=162, 神威改=499, 神威改母=500
         * 
         * +2:
         * コマンダン・テスト=491, コマンダン・テスト改=372
         * 
         * +4:
         * Gotland=574,
         *  
         * +n:
         * Gotland改=579, Gotland andra=630
         */
        if (['みずほ', 'かもい'].indexOf(SHIP_YOMI) >= 0) {
            bonusFp += 1 * num;
        } else if (SHIP_YOMI === 'コマンダン・テスト') {
            bonusFp += 1 * num;
        } else if (shipId === 574) {
            bonusFp += 4 * num;
        } else if ([579, 630].indexOf(shipId) >= 0) {
            if (num === 1) {
                bonusFp += 6;
            } else if (num >= 2) {
                bonusFp += 6 + 4 * (num - 1);
            }
        }
    }

    // Swordfish Mk.III改(水上機型/熟練)=369
    if (num = howManyEquips(369, shipItemId)) {        
        /**
         * +2:
         * 瑞穂=451, 瑞穂改=348
         * 神威=162, 神威改=499, 神威改母=500
         * 
         * +3:
         * コマンダン・テスト=491, コマンダン・テスト改=372
         * 
         * +5:
         * Gotland=574, Gotland改=579
         *  
         * +n:
         * Gotland andra=630
         */
        if (['みずほ', 'かもい'].indexOf(SHIP_YOMI) >= 0) {
            bonusFp += 2 * num;
        } else if (SHIP_YOMI === 'コマンダン・テスト') {
            bonusFp += 2 * num;
        } else if ([574, 579].indexOf(shipId) >= 0) {
            bonusFp += 5 * num;
        } else if (shipId === 630) {
            if (num === 1) {
                bonusFp += 8;
            } else if (num >= 2) {
                bonusFp += 8 + 5 * (num - 1);
            }
        }
    }
    // Swordfish Mk.II改(水偵型)=370
    if (num = howManyEquips(370, shipItemId)) {
        if (['みずほ', 'かもい', 'コマンダン・テスト', 'ゴトランド'].indexOf(SHIP_YOMI) >= 0) {
            bonusFp += 1 * num;
        } else if (['ネルソン', 'シェフィールド'].indexOf(SHIP_YOMI) >= 0) {
            bonusFp += 2 * num;
        } else if (SHIP_YOMI === 'ウォースパイト') {
            bonusFp += 6 * num;
        }
    }

    // Fairey Seafox改=371
    if (num = howManyEquips(371, shipItemId)) {
        /**
         * +4:
         * Gotland=574, Gotland改=579
         * 
         * +6:
         * Gotland andra=630
         * ネルソン=571, ネルソン改=576
         */
        if (['コマンダン・テスト', 'リシュリュー'].indexOf(SHIP_YOMI) >= 0) {
            bonusFp += 2 * num;
        } else if (['ウォースパイト', 'シェフィールド'].indexOf(SHIP_YOMI) >= 0) {
            bonusFp += 3 * num;
        } else if ([574, 579].indexOf(shipId) >= 0) {
            bonusFp += 4 * num;
        } else if (shipId === 630 || SHIP_YOMI === 'ネルソン') {
            if (num === 1) {
                bonusFp += 6;
            } else if (num >= 2) {
                bonusFp += 6 + 3 * (num - 1);
            }            
        }
    }

    // 天山一二型甲=372
    if (num = howManyEquips(372, shipItemId)) {
        // 瑞鳳改二=555, 瑞鳳改二乙=560, 龍鳳改=318
        if (['翔鶴型', '大鳳型', '飛鷹型', '千歳型'].indexOf(SHIP_CLASS) >= 0) {
            bonusFp += 1 * num;
        } else if ([555, 560, 318].indexOf(shipId) >= 0) {
            bonusFp += 1 * num;
        }
    }

    // 天山一二型甲改(空六号電探改装備機)=373
    if (num = howManyEquips(373, shipItemId)) {
        // +1: 瑞鳳改=117, 瑞鳳改二=555, 瑞鳳改二乙=560, 祥鳳改=282
        if (['ずいかく', 'たいほう', 'たいげい・りゅうほう'].indexOf(SHIP_CLASS) >= 0) {
            bonusFp += 1 * num;
        } else if (['飛鷹型', '千歳型', '最上型'].indexOf(SHIP_CLASS) >= 0) {
            bonusFp += 1 * num;
        } else if ([117, 555, 560, 282].indexOf(shipId) >= 0) {
            bonusFp += 1 * num;
        } else if (SHIP_YOMI === 'しょうかく') {
            bonusFp += 2 * num;
        }
    }

    // 天山一二型甲改(熟練/空六号電探改装備機)=374
    if (num = howManyEquips(374, shipItemId)) {
        /**
         * +1:
         * 鈴谷航改二=508, 熊野航改二=509
         * 祥鳳改=282, 
         * 瑞鳳改二=555, 瑞鳳改二乙=560
         * 龍鳳改=318
         * 飛鷹改=283
         * 隼鷹改二=408
         * 千歳航改二=296, 千代田航改二=297 
         * 
         * +2:
         * 瑞鶴改二=462, 瑞鶴改二甲=467 
         * 大鳳改=156
         * 
         * +3:
         * 翔鶴改二=461, 翔鶴改二甲=466
         */
        let cv = [
            508, 509,
            282,
            555, 560,
            318,
            283,
            408,
            296, 297
        ];
        if (cv.indexOf(shipId) >= 0) {
            bonusFp += 1 * num;
        } else if ([462, 467].indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
        } else if ([156].indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
        } else if ([461, 466].indexOf(shipId) >= 0) {
            bonusFp += 3 * num;
        }
    }

    // XF5U=375
    if (num = howManyEquips(375, shipItemId)) {
        if (SHIP_YOMI === 'かが') {
            bonusFp += 1 * num;
        } else if (['サラトガ', 'ホーネット', 'イントレピッド', 'ガンビア・ベイ'].indexOf(SHIP_YOMI) >= 0) {
            bonusFp += 3 * num;
        }
    }

    // 533mm五連装魚雷(後期型)=376
    if (num = howManyEquips(315, shipItemId)) {
        if (['シェフィールド', 'ジャーヴィス', 'ジェーナス', 'パース'].indexOf(SHIP_YOMI) >= 0) {
            bonusFp += 1 * num;
        } else if (['ヒューストン', 'ヘレナ', 'アトランタ', 'フレッチャー', 'ジョンストン', 'サミュエル・B・ロバーツ'].indexOf(SHIP_YOMI) >= 0) {
            bonusFp += 2 * num;
        }
    }

    // 16inch三連装砲 Mk.6=381
    if (howManyEquips(381, shipItemId)) {
        rfs = rfOfItemId(381, shipItemId, shipItemRf);
        if (['コロラド', 'ワシントン', 'アイオワ'].indexOf(SHIP_YOMI) >= 0) {
            for (let i = 0; i < rfs.length; i++) {
                if (0 <= rfs[i] && rfs[i] <= 5) {
                    bonusFp += 1;
                } else if (rfs[i] >= 6) {
                    bonusFp += 2;
                }
            }
        } else if (SHIP_YOMI === 'サウスダコタ') {
            for (let i = 0; i < rfs.length; i++) {
                if (0 <= rfs[i] && rfs[i] <= 5) {
                    bonusFp += 2;
                } else if (rfs[i] >= 6) {
                    bonusFp += 3;
                }
            }
        }
    }

    // 16inch三連装砲 Mk.6 mod.2=385
    if (num = howManyEquips(385, shipItemId)) {
        rfs = rfOfItemId(381, shipItemId, shipItemRf);
        if (['金剛型', 'V.Veneto級', 'Bismarck級', 'Richelieu級', 'Гангут級'].indexOf(SHIP_CLASS) >= 0) {
            bonusFp += 1 * num;
        } else if (['コロラド', 'アイオワ'].indexOf(SHIP_YOMI) >= 0) {
            for (let i = 0; i < rfs.length; i++) {
                if (0 <= rfs[i] && rfs[i] <= 5) {
                    bonusFp += 2;
                } else if (rfs[i] >= 6) {
                    bonusFp += 3;
                }
            }
        } else if (['ワシントン', 'サウスダコタ'].indexOf(SHIP_YOMI) >= 0) {
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
    // 6inch三連装速射砲 Mk.16 mod.2=387
    if (howManyEquips(386, shipItemId) + howManyEquips(387, shipItemId)) {
        rfs = rfOfItemId(386, shipItemId, shipItemRf);
        if (['コロラド', 'ヒューストン', 'ヘレナ', 'アトランタ'].indexOf(SHIP_YOMI) >= 0) {
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
    if (num = howManyEquips(390, shipItemId)) {
        rfs = rfOfItemId(390, shipItemId, shipItemRf);
        if (['金剛型', 'V.Veneto級', 'Bismarck級', 'Richelieu級', 'Гангут級'].indexOf(SHIP_CLASS) >= 0) {
            bonusFp += 1 * num;
        } else if (['コロラド', 'アイオワ'].indexOf(SHIP_YOMI) >= 0) {
            for (let i = 0; i < rfs.length; i++) {
                if (0 <= rfs[i] && rfs[i] <= 2) {
                    bonusFp += 2;
                } else if (rfs[i] >= 3) {
                    bonusFp += 3;
                }
            }
        } else if (['ワシントン', 'サウスダコタ'].indexOf(SHIP_YOMI) >= 0) {
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
    if (num = howManyEquips(391, shipItemId)) {
        // 龍鳳改=318
        if (['翔鶴型', '祥鳳型', '飛鷹型'].indexOf(SHIP_CLASS) >= 0) {
            bonusFp += 1 * num;
        } else if (shipId === 318) {
            bonusFp += 1 * num;
        }
    }

    // 九九式艦爆二二型(熟練)=392
    if (num = howManyEquips(392, shipItemId)) {
        /**
         * +1:
         * 飛鷹改=283
         * 隼鷹改二=408
         * 
         * +2:
         * 翔鶴改=288, 翔鶴改二=461, 翔鶴改二甲=466
         * 瑞鶴改=112, 瑞鶴改二=462, 瑞鶴改二甲=467 
         * 瑞鳳=116, 瑞鳳改=117
         * 祥鳳改=282
         * 龍鳳=185, 龍鳳改=318
         * 
         * +3:
         * 瑞鳳改二=555, 瑞鳳改二乙=560
         */
        let add2 = [
            288, 461, 466,
            112, 462, 467,
            116, 117,
            282,
            185, 318
        ];
        if ([283, 408].indexOf(shipId) >= 0) {
            bonusFp += 1 * num;
        } else if (add2.indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
        } else if ([555, 560].indexOf(shipId) >= 0) {
            bonusFp += 3 * num;
        }
    }

    // 120mm/50 連装砲 mod.1936=393
    // 120mm/50 連装砲改 A.mod.1937=394
    if(num = howManyEquips(393, shipItemId) + howManyEquips(394, shipItemId)) {
        if (SHIP_CLASS === 'Maestrale級') {
            bonusFp += 2 * num;
        }
    }

    // 6inch Mk.XXIII三連装砲=399
    if (howManyEquips(399, shipItemId)) {
        rfs = rfOfItemId(399, shipItemId, shipItemRf);
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

    // 対空電探
    if (isHaveX(shipItemId, 'air')) {
        // 沖波改二=569, 秋雲改二=648
        if ([569, 648].indexOf(shipId) >= 0) {
            bonusFp += 1;
        }
    }

    // 水上偵察機
    if (isHaveX(shipItemId, 'ReSea')) {
        // 能代改二=662
        if (shipId == 662) {
            bonusFp += 2;
        }
    }


    
    /* ここから相互シナジーを含む装備を扱う */



    // 水上爆撃機
    if (isHaveX(shipItemId, 'SeaBom')) {
        // 能代改二=662
        if (shipId === 662) {
            bonusFp += 1;
            if (isHaveX(shipItemId, 'SeaBomJp')) {
                bonusFp += 2;
            }
            // 瑞雲(六三四空/熟練)=237, 瑞雲改二(六三四空)=322, 瑞雲改二(六三四空/熟練)=323
            if (howManyEquips(237, shipItemId) + howManyEquips(322, shipItemId) + howManyEquips(323, shipItemId)) {
                bonusFp += 1+2;           
            }
        }
    }

    // 瑞雲(六三四空/熟練)=237
    if (num = howManyEquips(237, shipItemId)) {
        /**
         * 扶桑改=286, 扶桑改二=411
         * 山城改=287, 山城改二=412
         * 伊勢改=82, 日向改=88
         * 伊勢改二=553, 日向改二=554
         */
        if ([286, 411].indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
        } else if ([287, 412].indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
        } else if ([82, 88].indexOf(shipId) >= 0) {
            bonusFp += 3 * num;
        } else if ([553, 554].indexOf(shipId) >= 0) {
            bonusFp += 4 * num;
        }
    }

    // 瑞雲改二(六三四空)=322
    if (num = howManyEquips(322, shipItemId)) {
        /**
         * 伊勢改二=553, 日向改二=554
         */
        if ([553, 554].indexOf(shipId) >= 0) {
            bonusFp += 5 * num;
        }
    }

    // 瑞雲改二(六三四空/熟練)=323
    if (num = howManyEquips(323, shipItemId)) {
        /**
         * 伊勢改二=553, 日向改二=554
         */
        if ([553, 554].indexOf(shipId) >= 0) {
            bonusFp += 6 * num;
        }
    }

    // 12.7cm連装砲A型改二=294
    if (num = howManyEquips(294, shipItemId)) {
        if (['吹雪型', '綾波型', '暁型'].indexOf(SHIP_CLASS) >= 0) {
            bonusFp += 1 * num;
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 3;
            }
            const temp = howManyEquips(13, shipItemId) + howManyEquips(125, shipItemId) + howManyEquips(285, shipItemId);
            if (temp === 1) {
                bonusFp += 1;
            } else if (temp >= 2) {
                bonusFp += 2;
            }
        }
    }

    // 12.7cm連装砲A型改三(戦時改修)+高射装置=295
    if (num = howManyEquips(295, shipItemId)) {
        if (['吹雪型', '綾波型', '暁型'].indexOf(SHIP_CLASS) >= 0) {
            bonusFp += 2 * num;
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 3;                
            }
            const temp = howManyEquips(13, shipItemId) + howManyEquips(125, shipItemId) + howManyEquips(285, shipItemId);
            if (temp === 1) {
                bonusFp += 1 ;
            } else if (temp >= 2) {
                bonusFp += 2;
            }
        }
    }

    // 12.7cm連装砲B型改四(戦時改修)+高射装置=296
    if (num = howManyEquips(296, shipItemId)) {
        /**
         * +2: 白露改二=497, 時雨改二=145, 夕立改二=144
         * +3: 敷波改二=627
         */
        if (shipId === 627) {
            bonusFp += 3 * num;
        } else if (['綾波型', '暁型', '初春型'].indexOf(SHIP_CLASS) >= 0) {
            bonusFp += 1 * num;
        } else if ([497, 145, 144].indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
        } else if (SHIP_CLASS === '白露型') {
            bonusFp += 1 * num;
        }
        if (['綾波型', '暁型', '初春型'].indexOf(SHIP_CLASS) >= 0) {
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 1;
            }
            if (howManyEquips(125, shipItemId) + howManyEquips(285, shipItemId) >= 1) {
                bonusFp += 1;
            }
        } else if (SHIP_CLASS === '白露型') {
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 1;
            }
            if (howManyEquips(15, shipItemId) + howManyEquips(286, shipItemId) >= 1) {
                bonusFp += 1;
            }
        }
    }

    // 61cm三連装(酸素)魚雷後期型=285
    if (num = howManyEquips(285, shipItemId)) {
        /**
         * 特型と初春型の改二
         * 吹雪改二=226, 叢雲改二=220, 
         * 綾波改二=195, 敷波改二=427, 潮改二=207, 
         * 暁改二=237, Верный=147, 
         * 初春改二=204, 初霜改二=219
         */
        const kai2 = [226, 220, 195, 427, 207, 237, 147, 204, 219];
        let countRfMax = 0;
        rfs = rfOfItemId(285, shipItemId, shipItemRf);
        if (kai2.indexOf(shipItemId) >= 0) {
            for (let i = 0; i < rfs.length; i++) {
                if (rfs[i] >= 10) {
                    countRfMax++;
                }
            }
            bonusFp += 1 * Math.min(countRfMax, 2);
        } 
    }

    // 20.3cm(3号)連装砲=50
    if (num = howManyEquips(50, shipItemId)) {
        if (['古鷹型', '青葉型'].indexOf(SHIP_CLASS) >= 0) {
            bonusFp += 1 * num;
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 1;
            }
        } else if (['妙高型', '高雄型'].indexOf(SHIP_CLASS) >= 0) {
            bonusFp += 2 * num;
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 3;
            }
        } else if (['最上型', '利根型'].indexOf(SHIP_CLASS) >= 0) {
            const limitBonus = [0, 2, 6, 9, 12];
            bonusFp += limitBonus[num];
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 3;
            }
        }        
    }

    // カ号観測機=69
    if (num = howManyEquips(69, shipItemId)) {
        // 伊勢改二=553, 日向改二=554, 加賀改二護=646
        if ([553, 554, 646].indexOf(shipId) >= 0) {
            bonusFp += 1 * num;
        }
    }

    // オ号観測機改=324
    // オ号観測機改二=325
    if (num = howManyEquips(324, shipItemId) + howManyEquips(325, shipItemId)) {
        // 伊勢改二=553, 日向改二=554, 加賀改二護=646
        if (shipId === 553) {
            bonusFp += 1 * num;
        } else if ([554, 646].indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
        }
    }

    // S-51J=326
    if (num = howManyEquips(326, shipItemId)) {
        // 伊勢改二=553, 日向改二=554, 加賀改二護=646
        if (shipId = 553) {
            bonusFp += 1 * num;
        } else if ([554, 646].indexOf(shipId) >= 0) {
            bonusFp += 3 * num;
        }
    }

    // S-51J改=327
    if (num = howManyEquips(326, shipItemId)) {
        // 伊勢改二=553, 日向改二=554, 加賀改二護=646
        if (shipId === 553) {
            bonusFp += 2 * num;
        } else if (shipId === 554) {
            bonusFp += 4 * num;
        } else if (shipId === 646) {
            bonusFp += 5 * num;
        }
    }

    // TBM-3W+3S=389
    if (num = howManyEquips(389, shipItemId)) {
        /**
         * 赤城改二=594, 赤城改二戊=599
         * 加賀改二=698, 加賀改二戊=610
         * 加賀改二護=646
         */

        const S51J = howManyEquips(326, shipItemId) + howManyEquips(327, shipItemId);
        const KA_O = howManyEquips(69, shipItemId) + howManyEquips(324, shipItemId) + howManyEquips(325, shipItemId);        

        if (['サラトガ', 'ホーネット', 'イントレピッド', 'ガンビア・ベイ'].indexOf(SHIP_YOMI) >= 0) {
            bonusFp += 2 * num;
        } else if ([594, 599].indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
        } else if ([698, 610].indexOf(shipId) >= 0) {
            bonusFp += 3 * num;
        } else if (shipId === 646) {
            bonusFp += 4 * num;
            if (S51J >= 1) {
                bonusFp += 8;
            } else if (KA_O >= 1) {
                bonusFp += 3;
            }
        }
    }

    // 10cm連装高角砲+高射装置=122
    if (num = howManyEquips(122, shipItemId)) {
        // 雪風改二=656
        let countRf4 = 0;
        rfs = rfOfItemId(122, shipItemId, shipItemRf);
        if (shipId === 656) {
            for (let i = 0; i < rfs.length; i++) {
                if (rfs[i] >= 4) {
                    countRf4++;
                }
            }
            if (countRf4 >= 1) {
                bonusFp += 5 * countRf4;
                if (isHaveX(shipItemId, 'surface')) {
                    bonusFp += 4;
                }
            }
        }
    }

    // 12.7cm単装高角砲(後期型)=229
    if (num = howManyEquips(229, shipItemId)) {
        /**
         * (夕張改二,特,丁)=(622,623,624)
         * 雪風改二=656
         * 由良改二=488, 鬼怒改二=487, 那珂改二=160
         */
        rfs = rfOfItemId(381, shipItemId, shipItemRf);
        let countRf7 = 0;
        for (let i = 0; i < rfs.length; i++) {
            if (rfs[i] >= 7) {
                countRf7++;
            }
        }
        if ([622, 623, 624].indexOf(shipId) >= 0) {
            bonusFp += 1 * num;
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 1;
            }
        } else if (shipId === 656) {
            bonusFp += 2 * num;
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 2;
            }
        } else if (SHIP_TYPE === '海防艦') {
            bonusFp += 1 * countRf7;
            if (isHaveX(shipItemId, 'surface') && countRf7 >= 1) {
                bonusFp += 1;
            }
        } else if (['神風型', '睦月型'].indexOf(SHIP_CLASS) >= 0) {
            bonusFp += 1 * countRf7;
            if (isHaveX(shipItemId, 'surface' && countRf7 >= 1)) {
                bonusFp += 2;
            }
        } else if (['ゆら', 'きぬ', 'なか'].indexOf(SHIP_YOMI) >= 0) {
            bonusFp += 2 * countRf7;
        }
        if ([488, 487, 160].indexOf(shipId) >= 0) {
            if (isHaveX(shipItemId, 'surface') && countRf7 >= 1) {
                bonusFp += 3;
            }
        }
        
    }

    // 探照灯=74
    if (num = howManyEquips(74, shipItemId)) {
        // 能代改二=662
        if (SHIP_YOMI === 'ゆきかぜ') {
            bonusFp += 1 * num;
        } else if (SHIP_YOMI === 'あきぐも') {
            bonusFp += 2 * num;
        } else if (['ひえい', 'きりしま', 'ちょうかい', 'あかつき'].indexOf(SHIP_YOMI) >= 0) {
            bonusFp += 4;
        } else if (shipId === 662) {
            bonusFp += 4;
        } else if (SHIP_YOMI === 'じんつう') {
            bonusFp += 8;
        }
    }

    // 12.7cm連装砲D型改二=267
    if (num = howManyEquips(267, shipItemId)) {
        /**
         * 秋雲改二=648
         * 夕雲改二=542, 長波改二=543, 巻雲改二=563, 風雲改二=564, 沖波改二=569, 朝霜改二=578
         * 島風改=229
         * 陽炎改二=566, 不知火改二=567, 黒潮改二=568, 雪風改二=656
         */
        if (shipId === 648) {
            bonusFp += 3 * num;
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 3;
            }
            if (howManyEquips(74,shipItemId)) {
                bonusFp += 3;
            }
            if (howManyEquips(129, shipItemId)) {
                bonusFp += 2;
            }
        }
        if ([542, 543, 563, 564, 569, 578].indexOf(shipId) >= 0) {
            bonusFp += 3 * num;
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 3;
            }
        } else if (SHIP_CLASS === '夕雲型') {
            bonusFp += 2 * num;
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 2;
            }
        } else if (SHIP_YOMI === 'しまかぜ') {
            bonusFp += 2 * num;
            if (isHaveX(shipItemId, 'surface')) {
                if (shipId === 229) {
                    bonusFp += 1;
                }
            }
        } else if ([566, 567, 568, 656].indexOf(shipId) >= 0) {
            const limitBonus = [0, 2, 3, 4];
            bonusFp += limitBonus[num];
        } else if (SHIP_CLASS === '陽炎型') {
            bonusFp += 1 * num;
        }
    }

    // 12.7cm連装砲C型改二=266
    if (num = howManyEquips(266, shipItemId)) {
        // 陽炎改二=566, 不知火改二=567, 黒潮改二=568, 雪風改二=656
        if (['白露型', '朝潮型'].indexOf(SHIP_CLASS) >= 0) {
            bonusFp += 1 * num;
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 1;
            }
        } else if ([566, 567, 568, 656].indexOf(shipId) >= 0) {
            const limitBonus = [0, 2, 5, 6, 7];
            bonusFp += limitBonus[num];
        } else if (SHIP_CLASS === '陽炎型') {
            bonusFp += 1 * num;
        }
        if (SHIP_CLASS === '陽炎型') {
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 2;
            }
        }
    }

    // 12.7cm連装砲D型改三=366
    if (num = howManyEquips(366, shipItemId)) {
        /**
         * 秋雲改二=648, 沖波改二=569
         * 夕雲改二=542, 長波改二=543, 巻雲改二=563, 風雲改二=564, 朝霜改二=578
         * 島風改=229
         * 陽炎改二=566, 不知火改二=567, 黒潮改二=568, 雪風改二=656
         */
        if ([648, 569].indexOf(shipId) >= 0) {
            const limitBonus = [0, 4, 7, 10, 13];
            bonusFp += limitBonus[num];
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 2;
            }
            if (isHaveX(shipItemId, 'air')) {
                bonusFp += 1;
            }
            if (shipId === 648) {
                if (howManyEquips(74, shipItemId) >= 1) {
                    bonusFp += 3;
                }
                if (howManyEquips(129, shipItemId) >= 1) {
                    bonusFp += 2;
                }
            }
        } else if ([542, 543, 563, 564, 578].indexOf(shipId) >= 0) {
            bonusFp += 3 * num;
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 2;
            }
            if (isHaveX(shipItemId, 'air')) {
                bonusFp += 1;
            }
        } else if (SHIP_CLASS === '夕雲型') {
            bonusFp += 2 * num;
        } else if (SHIP_YOMI === 'しまかぜ') {
            bonusFp += 2 * num;
            if (shipId === 229) {
                if (isHaveX(shipItemId, 'surface')) {
                    bonusFp += 2;
                }
                if (isHaveX(shipItemId, 'air')) {
                    bonusFp += 1;
                }
            }
        } else if ([566, 567, 568, 656].indexOf(shipId) >= 0) {
            const limitBonus = [0, 2, 4, 5, 6];
            bonusFp += limitBonus[num];
        } else if (SHIP_CLASS === '陽炎型') {
            bonusFp += 1 * num;
        }
    }

    // 熟練見張員=129
    if (num = howManyEquips(129, shipItemId)) {
        const JapanDD = ['神風型', '睦月型', '吹雪型', '綾波型', '暁型', '初春型', '白露型', '朝潮型', '陽炎型', '秋月型', '夕雲型', '島風型', '松型'];
        const JapanCL = ['天龍型', '長良型', '球磨型', '川内型', '夕張型', '阿賀野型', '香取型', '大淀型'];
        const JapanAC = ['古鷹型', '青葉型', '妙高型', '高雄型', '最上型', '利根型'];
        if (JapanDD.indexOf(SHIP_CLASS) >= 0 || JapanCL.indexOf(SHIP_CLASS) >= 0 || JapanAC.indexOf(SHIP_CLASS) >= 0) {
            bonusFp += 1 * num;
        }
    }

    // 12.7cm単装砲=78
    if (num = howManyEquips(78, shipItemId)) {
        rfs = rfOfItemId(78, shipItemId, shipItemRf);
        if (SHIP_CLASS === 'Z1型') {
            for (let i = 0; i < rfs.length; i++) {
                if (0 <= rfs[i] && rfs[i] <= 6) {
                    bonusFp += 1;
                } else if (rfs[i] >= 7) {
                    bonusFp += 2;
                }
            }
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 2;
            }
        }
    }

    // 新型高温高圧缶=87
    if (howManyEquips(87, shipItemId)) {        
        if ([591, 592].indexOf(shipId) >= 0) {
            let rfMax = rfOfItemId(61, shipItemId, shipItemRf).reduce(function(a, b) {
                        return Math.max(a, b);
            });
            if (rfMax >= 10) {
                bonusFp += 1;
            }
        }
    }

    // 20.3cm(2号)連装砲=90
    if (num = howManyEquips(90, shipItemId)) {
        /**
         * +1: 日本重巡
         * +2: 古鷹改二=416, 加古改二=417, 青葉改=264, 衣笠改=295
         * +3: 衣笠改二=142
         */
        const JapanAC = ['古鷹型', '青葉型', '妙高型', '高雄型', '最上型', '利根型'];
        if ([416, 417, 264, 295].indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
        } else if (shipId === 142) {
            bonusFp += 3 * num;
        } else if (JapanAC.indexOf(SHIP_CLASS) >= 0) {
            bonusFp += 1 * num;
        }
        if (['古鷹型', '青葉型'].indexOf(SHIP_CLASS) >= 0) {
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 3;
            }
        }        
    }
    
    // 96式150cm探照灯=140
    if (howManyEquips(140, shipItemId)) {
        // 比叡改二丙=592
        if (shipId === 592) {
            bonusFp += 9;
        } else if (SHIP_CLASS === '大和型') {
            bonusFp += 4;
        } else if (['ひえい', 'きりしま'].indexOf(SHIP_YOMI) >= 0) {
            bonusFp += 6;
        }
    }

    // 53cm連装魚雷=174
    if (num = howManyEquips(174, shipItemId)) {
        /**
         * 由良改二=488
         * 夕張改二=622, 夕張改二特=623, 夕張改二丁=624
         */
        if ([488, 622, 623, 624].indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
        }
        // if(12cm単装砲改二){}
    }

    // 12cm単装砲改二=293
    if (num = howManyEquips(293, shipItemId)) {
        const temp = howManyEquips(174, shipItemId);
        if (['占守型', '択捉型'].indexOf(SHIP_CLASS) >= 0) {
            bonusFp += 1 * num;
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 2;
            }            
        } else if (['神風型', '睦月型'].indexOf(SHIP_CLASS) >= 0) {
            bonusFp += 2 * num;
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 2;
            }
            if (temp === 1) {
                bonusFp += 2;
            } else if (temp >= 2) {
                bonusFp +- 3;
            }
        }
    }

    // 130mm B-13連装砲=282
    if (num = howManyEquips(282, shipItemId) >= 0) {
        // ベールヌイ=147
        if (['タシュケント', 'ゆうばり'].indexOf(SHIP_YOMI) >= 0) {
            bonusFp += 2 * num;
        } else if (shipId === 147) {
            bonusFp += 2 * num;
        }
        // if (533mm 三連装魚雷(53-39型)){}
    }

    // 533mm 三連装魚雷(53-39型)=400
    if (num = howManyEquips(400, shipItemId)) {
        // ベールヌイ=147
        if (SHIP_YOMI ==='タシュケント' || shipId === 147) {
            bonusFp += 1 * num;
            // 130mm B-13連装砲=282
            if (howManyEquips(282, shipItemId)) {
                bonusFp += 2;
            }
        }
    }

    // 61cm四連装(酸素)魚雷後期型=286
    if (num = howManyEquips(286, shipItemId)) {
        /**
         * 白露型改二:
         * 白露改二=497, 時雨改二=145, 村雨改二=498, 夕立改二=144, 海風改二=587, 江風改二=469
         * 
         * 朝潮型改二:
         * 朝潮改二=463, 朝潮改二丁=468, 大潮改二=199, 満潮改二=489, 荒潮改二=490, 霰改二=198, 霞改二=464, 霞改二乙=470
         * 
         * 陽炎型改二:
         * 陽炎改二=566, 不知火改二=567, 黒潮改二=568, 秋雲改二=648, 丹陽=651, 雪風改二=656
         * 
         * 夕雲型改二:
         * 夕雲改二=542, 長波改二=543, 巻雲改二=563, 風雲改二=564, 沖波改二=569, 朝霜改二=578
         */
        const siratuyuKai2 = [497, 145, 498, 144, 587, 469];
        const asasioKai2 = [463, 468, 199, 489, 490, 198, 464, 470];
        const kageroKai2 = [566, 567, 568, 648, 651, 656];
        const yugumoKai2 = [542, 543, 563, 564, 569, 578];
        const kai2 = siratuyuKai2.concat(asasioKai2, kageroKai2, yugumoKai2);
        rfs = rfOfItemId(286, shipItemId, shipItemRf);
        if (kai2.indexOf(shipId) >= 0) {
            let countRfMax = 0;
            for (let i = 0; i < rfs.length; i++) {
                if (rfs[i] >= 10) {
                    countRfMax++;
                }
            }
            bonusFp += 1 * Math.min(countRfMax, 2);
        }
        if (SHIP_CLASS === '白露型') {
            // 12.7cm連装砲B型改四(戦時改修)+高射装置=296
            if (howManyEquips(296, shipItemId) >= 1) {
                bonusFp += 1;
            }
        }
    }

    // 35.6cm三連装砲改(ダズル迷彩仕様)=289
    if (num = howManyEquips(289, shipItemId)) {
        /**
         * 金剛改二=149, 榛名改二=151
         * 比叡改二=150, 霧島改二=152
         */        
        if ([149, 151].indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 2;
            }
        } else if ([150, 152].indexOf(shipId) >= 0) {
            bonusFp += 1 * num;
        }
    }

    // 41cm三連装砲改二=290
    if (num = howManyEquips(290, shipItemId)) {
        /**
         * +1: 扶桑改二=411, 山城改二=412
         * +2: 伊勢改=82, 日向=87
         * +3: 伊勢改二=553, 日向改二=554
         */
        if ([411, 412].indexOf(shipId) >= 0) {
            bonusFp += 1 * num;
        } else if ([82, 87].indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
        } else if ([553, 554].indexOf(shipId) >= 0) {
            bonusFp += 3 * num;
        }
    }

    // 41cm連装砲改二318
    if (num = howManyEquips(318, shipItemId)) {
        /**
         * +1: 扶桑改二=411, 山城改二=412
         * +2: 伊勢改=82, 伊勢改二=553, 日向=87
         * +3: 日向改二=554, 長門改二=541, 陸奥改二=573
         * 41cm三連装砲改二=290
         */
        if ([411, 412].indexOf(shipId) >= 0) {
            bonusFp += 1 * num;
        } else if ([82, 553, 87].indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
        } else if (shipId === 554) {
            bonusFp += 3 * num;
            // if (isHaveX(shipItemId, 'surface')) {}
            if (howManyEquips(290, shipItemId)) {
                bonusFp += 1;
            }
        } else if ([541, 573].indexOf(shipId) >= 0) {
            bonusFp += 3 * num;
            if (howManyEquips(290, shipItemId)) {
                bonusFp += 2;
            }
        }
    }

    // 14cm連装砲改=310
    if (num = howManyEquips(310, shipItemId)) {
        // 夕張改二=622, 夕張改二特=623, 夕張改二丁=624
        rfs = rfOfItemId(381, shipItemId, shipItemRf);
        if ([622, 623, 624].indexOf(shipId) >= 0) {
            for (let i = 0; i < rfs.length; i++) {
                if (0 <= rfs[i] && rfs[i] <= 7) {
                    bonusFp += 2;
                } else if (rfs[i] >= 8) {
                    bonusFp += 5;
                }
            }
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 3;
            }
        } else if (['ゆうばり', 'かとり', 'かしま'].indexOf(SHIP_YOMI) >= 0) {
            bonusFp += 2 * num;
        } else if (SHIP_YOMI === 'にっしん') {
            bonusFp += 3 * num;
        }
    }

    // 12.7cm単装高角砲改二=379
    if (num = howManyEquips(379, shipItemId)) {
        /**
         * 五十鈴改二=141, 鬼怒改二=487, 那珂改二=160, 由良改二=488
         * 球磨改二=652, 球磨改二丁=657, 北上改二=119, 大井改二=118
         * 丹陽=651, 雪風改二=656
         */
        if (SHIP_CLASS === '海防艦') {
            bonusFp += 1 * num;
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 1;
            }
        } else if (['神風型', '睦月型'].indexOf(SHIP_CLASS) >= 0) {
            bonusFp += 1 * num;
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 2;
            }
        } else if (SHIP_CLASS === '天龍型' || SHIP_YOMI === 'ゆうばり') {
            bonusFp += 1 * num;
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 3;
            }
        } else if (['いすず', 'きぬ', 'なか', 'ゆら'].indexOf(SHIP_YOMI) >= 0) {
            bonusFp += 2 * num;
            if (isHaveX(shipItemId, 'surface')) {
                if ([141, 487, 160].indexOf(shipId) >= 0) {
                    bonusFp += 2;
                } else if (shipId === 488) {
                    bonusFp += 3;
                }
            }            
        } else if (['きたかみ', 'おおい'].indexOf(SHIP_YOMI) >= 0 || [652, 657].indexOf(shipId) >= 0) {
            bonusFp += 2 * num;
            if (isHaveX(shipItemId, 'surface')) {
                if ([652, 657, 119, 118].indexOf(shipId) >= 0) {   
                    bonusFp += 2;
                }
            }
        } else if ([651, 656].indexOf(shipId) >= 0) {
            bonusFp += 3 * num;
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 2;
            }
        } else if (SHIP_CLASS === '松型') {
            const limitBonus = [0, 3, 4, 5, 6];
            bonusFp += limitBonus[num];
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 4;
            }
        } else if (['練習巡洋艦', '水上機母艦'].indexOf(SHIP_TYPE >= 0)) {
            bonusFp += 1 * num;
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 1;
            }
        } else if (['軽巡洋艦', '重雷装巡洋艦'].indexOf(SHIP_TYPE) >= 0) {
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 1;
            }
        }
    }

    // 12.7cm連装高角砲改二=380
    if (num = howManyEquips(380, shipItemId)) {
        /**
         * 五十鈴改二=141, 鬼怒改二=487, 那珂改二=160, 由良改二=488
         * 球磨改二=652, 球磨改二丁=657, 北上改二=119, 大井改二=118
         * 丹陽=651, 雪風改二=656
         * 木曾改二=146
         */
        if (SHIP_CLASS === '天龍型' || SHIP_YOMI === 'ゆうばり') {
            bonusFp += 1 * num;
        } else if (['いすず', 'きぬ', 'なか', 'ゆら'].indexOf(SHIP_YOMI) >= 0) {
            bonusFp += 2 * num;
            if (isHaveX(shipItemId, 'surface')) {
                if ([141, 487, 160, 488].indexOf(shipId) >= 0) {
                    bonusFp += 3;
                }
            }            
        } else if (['きたかみ', 'おおい'].indexOf(SHIP_YOMI) >= 0 || [652, 657].indexOf(shipId) >= 0) {
            bonusFp += 3 * num;
            if (isHaveX(shipItemId, 'surface')) {
                if ([652, 657, 119, 118].indexOf(shipId) >= 0) {   
                    bonusFp += 3;
                }
            }
        } else if ([651, 656].indexOf(shipId) >= 0) {
            bonusFp += 3 * num;
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 1;
            }
        } else if (SHIP_CLASS === '松型') {
            const limitBonus = [0, 3, 4, 5, 6];
            bonusFp += limitBonus[num];
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 4;
            }
        } else if (['練習巡洋艦', '水上機母艦'].indexOf(SHIP_TYPE >= 0)) {
            bonusFp += 1 * num;
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 2;
            }
        } else if (shipId === 146) {
            bonusFp += 2;
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 3;
            }
        }
        else if (SHIP_TYPE === '軽巡洋艦') {
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 2;
            }
        }
    }

    // 12cm単装高角砲E型=382
    if (howManyEquips(382, shipItemId)) {
        /**
         * 鬼怒改二=487, 那珂改二=160, 由良改二=488
         * 雪風改二=656
         */
        if (isHaveX(shipItemId, 'surface')) {
            if (['神風型', '睦月型', '松型'].indexOf(SHIP_CLASS) >= 0 || [487, 160, 488].indexOf(shipId) >= 0) {
                bonusFp += 1;
            } else if (SHIP_TYPE === '海防艦' || shipId === 656) {
                bonusFp += 2;
            }
        }
    }

    // 現地改装12.7cm連装高角砲=397
    if (num = howManyEquips(397, shipItemId)) {
        // 丹陽=651, 雪風改二=656
        rfs = rfOfItemId(397, shipItemId, shipItemRf);
        if (shipId === 656) {
            bonusFp += 3 * num;
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 3;
            }
        } else if (shipId === 651) {
            for (let i = 0; i < rfs.length; i++) {
                if (0 <= rfs[i] && rfs[i] <= 3) {
                    bonusFp += 5;
                } else if (rfs[i] >= 4) {
                    bonusFp += 9;
                }
            }
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 3;
            }
        }              
    }

    // 現地改装10cm連装高角砲=398
    if (howManyEquips(398, shipItemId)) {
        // 丹陽=651, 雪風改二=656
        rfs = rfOfItemId(398, shipItemId, shipItemRf);
        if (shipId === 656) {
            for (let i = 0; i < rfs.length; i++) {
                if (0 <= rfs[i] && rfs[i] <= 3) {
                    bonusFp += 3;
                } else if (rfs[i] >= 4) {
                    bonusFp += 5;
                }
            }
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 3;
            }
        } else if (shipId === 651) {
            for (let i = 0; i < rfs.length; i++) {
                if (0 <= rfs[i] && rfs[i] <= 3) {
                    bonusFp += 4;
                } else if (rfs[i] >= 4) {
                    bonusFp += 7;
                }
            }
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 3;
            }
        }
    }

    // 15.2cm連装砲改二=407
    if (num = howManyEquips(407, shipItemId)) {
        // 能代改二=662
        if (shipId === 662) {
            bonusFp += 4 * num;
            if (isHaveX(shipItemId, 'surface')) {
                bonusFp += 2;
            }
        }
    }
      






    
        



    return bonusFp;
}

/**
 * その装備種を装備しているか
 * @param {Array} itemId その艦娘が装備している全ての装備id
 * @param {'surface'|'air'|'ReSea'|'SeaBom'|'SeaBomJp'} kind 水上電探|対空電探|水上偵察機|水上爆撃機|水上爆撃機日本機
 * @returns {boolean} t/f
 */
function isHaveX(itemId, kind) {
    const kindList = ['surface', 'air', 'ReSea', 'SeaBom', 'SeaBomJp'];
    const equipList = [SURFACE_RADAR, AIR_RADAR, RECONNAISSANCE_SEAPLANE, SEAPLANE_BOMBER, SEAPLANE_BOMBER_JAPAN];
    let equip = equipList[kindList.indexOf(kind)];

    for (let i = 0; i < itemId.length; i++) {
        if (equip.indexOf(itemId[i]) >= 0) {
            return true;
        }
    }
    return false;
}

/**
 * この装備idの装備を何個装備しているかを返す
 * @param {number} searchId 検索する装備id
 * @param {Array} items その艦娘が装備しているすべての装備
 * @returns {Number} 装備個数
 */
function howManyEquips(searchId, items) {
    let count = 0;
    for (let i = 0; i < items.length; i++) {
        if (items[i] === searchId)  count++;
    }
    return count;
}

function rfOfItemId (searchId, itemIds, itemRfs) {
    let rfs = new Array(itemRfs.length);

    for (let i = 0; i < itemRfs.length; i++) {
        if (itemIds[i] === searchId) {
            rfs[i] = itemRfs[i];
        } else {
            rfs[i] = -1;
        }
    }

    return rfs;
}

/**
 * 基本攻撃力を返す
 * @param {number} shipId 艦娘ID
 * @param {number} fp 素火力 + Σ装備火力 + Σ装備ボーナス
 * @param {number} top 艦攻などの、装備ボーナスを含まない雷装
 * @param {number} bom 艦爆などの、装備ボーナスを含まない爆装
 * @returns {number} 基本攻撃力
 */
function calcBasicFp(shipId, fp, top, bom) {
    let basicFp;
    let shipType = id2value(shipId, 'type', SHIPS);
    if (shipType === '軽空母' || shipType === '正規空母' || shipType === '装甲空母') {
        basicFp = Math.floor((fp + top + Math.floor(1.3 * bom) - 1) * 1.5) + 55;
    } else {
        basicFp = fp + 4;
    }
    return basicFp;
}