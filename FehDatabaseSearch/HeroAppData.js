
const g_imageRoot = "https://fire-emblem.fun/images/";

const ColumnType = {
    name: "名前",
    english_name: "英語名",
    type: "属性",
    weapon_type: "武器種",
    move_type: "移動種",
    rarity3: "レアリティ",
    how_to_get: "入手法",
    // is_distributed: "配布",
    hp_5_lv1: "HP (LV1)",
    atk_5_lv1: "攻撃(LV1)",
    spd_5_lv1: "速さ(LV1)",
    def_5_lv1: "守備(LV1)",
    res_5_lv1: "魔防(LV1)",
    hp_5: "HP (LV40)",
    atk_5: "攻撃(LV40)",
    spd_5: "速さ(LV40)",
    def_5: "守備(LV40)",
    res_5: "魔防(LV40)",
    rating_5: "総合値(LV40)",
    hp_5_df: "HP (花込)",
    atk_5_df: "攻撃(花込)",
    spd_5_df: "速さ(花込)",
    def_5_df: "守備(花込)",
    res_5_df: "魔防(花込)",
    rating_5_df: "総合値(花込)",
    release_date: "リリース日",
    skills: "習得スキル",
    origin: "出典",
    sex: "性別",
    special_type: "特別効果",
    illustrator: "イラスト",
    cv: "CV",
    epithet: "称号",
    duo_skill: "比翼双界スキル",
    book: "バージョン(部)",
    official_url: "公式ページ",
    combat_manual: "秘伝書生成",
    max_sp: "最大SP",
    score_rating: "査定総合値",
    arena_score: "闘技場スコア",
    description: "概要",
    sex: "性別",
    dancer: "踊り子",
    id: "ID(開発者用)",
};

const HtmlColumnSuffix = "_html";


class AppData extends AppDataBase {
    constructor() {
        super("heroes");

        this.isSkillListHorizontal = false;
        this.disableHeroThumbnail = false;
    }

    setHeroThumbStyle() {
        let self = this;
        const heroThumbs = document.querySelectorAll('.heroThumb');
        heroThumbs.forEach(function (elem) {
            if (self.disableHeroThumbnail) {
                elem.style.display = 'none';
            } else {
                elem.style.display = '';
            }
        });
    }

    setSkillListStyle() {
        let self = this;
        let skillLists = document.querySelectorAll('.skillList');
        skillLists.forEach(function (elem) {
            if (self.isSkillListHorizontal) {
                elem.style.display = 'inline';
                elem.style.paddingRight = '10px';
            } else {
                elem.style.display = '';
                elem.style.paddingRight = '';
            }
        });
    }

    __findColumnInfoByType(type) {
        return this.__findColumnInfo(this.__getColumnName(type));
    }

    __getColumnName(type) {
        return getDictKeyFromValue(ColumnType, type);
    }

    __createColumnInfo(typeValue, isVisible = false, isAvailableOnDatabase = true, isKeyColumn = false) {
        return createColumnInfoFromDict(
            ColumnType, typeValue, typeValue, isVisible, isAvailableOnDatabase, isKeyColumn);
    }

    __isImageAvailableInTable() {
        return true;
    }

    __createSkillDict() {
        let skillQueryResult = this.__execQuerySkills("select id,name,sp,type,assist_type from skills");
        let skillRows = skillQueryResult[0].values;
        let nameToRowDict = [];
        for (let row of skillRows) {
            let name = row[1];
            nameToRowDict[name] = row;
        }
        return nameToRowDict;
    }

    __getPageId() {
        return 1678;
    }

    *__enumerateDbPaths() {
        yield g_dbRoot + "feh-heroes.sqlite3";
        yield g_dbRoot + "feh-skills.sqlite3";
    }

    __execQuerySkills(query) {
        let dbSkills = this.dbs[1];
        return dbSkills.exec(query);
    }

    __getHeroIconMetaInfoImgTag(path) {
        return `<img src='${path}' style='width:20px;height:20px;position: absolute;right: 0;top:0;'>`;
    }

    __initDatabaseTable() {
        createInheritableDuelDict(query => this.__execQuerySkills(query));

        const statusColumns = [
            this.__getColumnName(ColumnType.hp_5),
            this.__getColumnName(ColumnType.atk_5),
            this.__getColumnName(ColumnType.spd_5),
            this.__getColumnName(ColumnType.def_5),
            this.__getColumnName(ColumnType.res_5),
        ];
        {
            const addColumns = [
                "rating_5",
                "max_dragonflower",
                "rating_5_df",
                "book",
                "max_sp",
                "score_rating",
                "arena_score",
                "dancer",
            ];

            let query = "";
            for (let column of addColumns) {
                query += `alter table heroes add column ${column};`;
            }
            for (let column of statusColumns) {
                query += `alter table heroes add column ${column}${HtmlColumnSuffix};`;
                query += `alter table heroes add column ${column}_df;`;
                query += `alter table heroes add column ${column}_df${HtmlColumnSuffix};`;
            }
            const otherHtmlColumns = [
                "name",
                "skills",
                "rating_5",
                "official_url",
            ];
            for (let column of otherHtmlColumns) {
                query += `alter table heroes add column ${column}${HtmlColumnSuffix};`;
            }
            this.__execQuery(query);
        }

        const urlBase = "https://fire-emblem.fun/";

        // 事前に変換しておくカラム
        {
            const iconRoot = g_imageRoot + "FehHeroThumbs/";
            let query = `update heroes set rating_5=case resplendent when 'true' then hp_5+atk_5+spd_5+def_5+res_5+10 else hp_5+atk_5+spd_5+def_5+res_5 end;`;

            // 神竜の花の加算値
            {
                let dfQuery = 'update heroes set max_dragonflower=(case';

                const baseYear = 2025;

                const baseMonthDay = '08-14';
                const baseValue = 5;
                const untilYear = 2020;

                let i = 0;
                let currentYear = baseYear;
                for (; currentYear >= untilYear; --currentYear, ++i) {
                    const date = `${currentYear}-${baseMonthDay}`;
                    const value = baseValue + i * 5;
                    dfQuery += ` when release_date > "${date}" then ${value}`;
                }

                {
                    const value1 = baseValue + i * 5;
                    ++i;
                    const value2 = baseValue + i * 5;
                    dfQuery += ` else (case when move_type in ("重装", "騎馬", "飛行") or release_date >= "2019-02-20" then ${value1} else ${value2} end) end);`;
                }

                console.log(dfQuery);

                query += dfQuery;
            }


            // query += `update heroes set max_dragonflower=(case when release_date>"2024-08-15" then 5 when release_date>"2023-08-15" then 10 when release_date>"2022-08-16" then 15 when release_date>"2021-08-16" then 20 when release_date>"2020-08-17" then 25 else (case when move_type="重装" or move_type="騎馬" or move_type="飛行" or release_date>="2019-02-20" then 30 else 35 end) end);`;
            query += `update heroes set rarity3=case when rarity3="星5" then (case when (release_date<"2022-03-01" and how_to_get="ガチャ") or (release_date<"2021-02-01" and how_to_get="超英雄") then "星4特別チャンス" else "星5限定" end) else rarity3 end;`;
            query += `update heroes set how_to_get="期間限定ガチャ" where (how_to_get="ガチャ" and (special_type like "%比翼%" or special_type like "%双界%")) or how_to_get="魔器英雄" or how_to_get="響心英雄" or how_to_get="お供英雄" or how_to_get="つながり";`;
            query += `update heroes set how_to_get="恒常ガチャ" where how_to_get="ガチャ";`;
            query += `update heroes set how_to_get="超英雄ガチャ" where how_to_get="超英雄";`;
            query += `update heroes set how_to_get="紋章士英雄ガチャ" where how_to_get="紋章士英雄";`;
            query += `update heroes set how_to_get="大英雄戦(聖杯)" where how_to_get="大英雄戦";`;
            query += `update heroes set how_to_get="戦渦の連戦(聖杯)" where how_to_get="戦渦の連戦";`;
            query += `update heroes set how_to_get="入手不可" where how_to_get is null or how_to_get="";`;

            let metaInfoCase = "case";
            const blessingImageRoot = "/AetherRaidTacticsBoard/images/";
            const fehIconImageRoot = "/images/FehIcons/";
            const seasonNameToFileName = {
                "光": blessingImageRoot + "Season_Light.png",
                "闇": blessingImageRoot + "Season_Dark.png",
                "天": blessingImageRoot + "Season_Astra.png",
                "理": blessingImageRoot + "Season_Anima.png",
                "火": blessingImageRoot + "Season_Fire.png",
                "水": blessingImageRoot + "Season_Water.png",
                "風": blessingImageRoot + "Season_Wind.png",
                "地": blessingImageRoot + "Season_Earth.png",
                "比翼": fehIconImageRoot + "SpecialType-Duo.png",
                "双界": fehIconImageRoot + "SpecialType-Harmonized.png",
                "魔器": fehIconImageRoot + "Rearmed_Hero_icon.png",
                "響心": fehIconImageRoot + "Icon_Attuned_Skill.webp",
                "開花": fehIconImageRoot + "AscendedFloret.png",
                "紋章士": fehIconImageRoot + "Icon_Hero_Type_Emblem.webp",
            };
            for (let seasonName in seasonNameToFileName) {
                let filePath = seasonNameToFileName[seasonName];
                metaInfoCase += ` when special_type like "%${seasonName}%" then "${this.__getHeroIconMetaInfoImgTag(filePath)}"`;
            }
            metaInfoCase += " else \"\" end";

            // heroThumb の style はインラインで書かないとラスタライズする時に style が含まれなくなるので、直指定が必要
            query += `update heroes set name${HtmlColumnSuffix}="<a href=\'${urlBase}?fehhero="||id||"\' title=\'"||name||"の詳細情報\' style='font-size:11px'>"||"<div class=\'heroThumb\' style='position: relative;width:50px;height:50px;margin: 0 auto'><img src=\'${iconRoot}"||thumb||"\' style=\'position:absolute;top:0;left:0;max-width:50px\' width='50' height='50'>"||(${metaInfoCase})||"</div>"||name||"</a>";`;
            query += `update heroes set name="|"||name||(case when pure_name is null then "" else pure_name end)||(case when internal_id is null then "" else internal_id end)||"|";`;
            query += `update heroes set english_name=english_name||"<br>("||english_epithet||")";`;
            for (let column of statusColumns) {
                query += `update heroes set ${column}${HtmlColumnSuffix}=(case resplendent when "true" then (${column}+2)||"<br>("||${column}||")" else ${column} end);`;
                query += `update heroes set ${column}_df=(case resplendent when "true" then ${column}+2+(max_dragonflower/5) else ${column}+(max_dragonflower/5) end);`;
                query += `update heroes set ${column}_df${HtmlColumnSuffix}=(case resplendent when "true" then ${column}+2+(max_dragonflower/5) else ${column}+(max_dragonflower/5) end);`;
            }
            query += `update heroes set rating_5${HtmlColumnSuffix}=(case resplendent when "true" then rating_5||"<br>("||(rating_5-10)||")" else rating_5 end);`;
            query += `update heroes set rating_5_df=rating_5+max_dragonflower;`;
            query += `update heroes set special_type=case resplendent when "true" then special_type||"|神装|" else special_type end;`;
            query += `update heroes set official_url${HtmlColumnSuffix}=case when official_url is null or official_url="" then "なし" else "<a href=\'"||official_url||"\' title=\'"||name||"の英雄紹介\'>英雄紹介</a>" end;`;
            query += `update heroes set official_url=case when official_url is null or official_url="" then "なし" else official_url end;`;
            query += `update heroes set book=case when release_date<'2017-11-28' then 1 when release_date<'2018-12-11' then 2 when release_date<'2019-12-05' then 3 when release_date<'2020-12-08' then 4 when release_date<'2021-12-06' then 5 when release_date<'2022-12-01' then 6 when release_date<'2023-12-01' then 7 when release_date<'2024-12-01' then 8 when release_date<'2025-12-01' then 9 when release_date<'2026-12-01' then 10 else -1 end;`;
            query += `create table heroes_tmp as select *,(case when part is null or part='' then 'なし' else '紙片'||devine_code||'<br>('||part||' '||replace(origins,'|',' ')||')' end) as combat_manual from heroes left outer join combat_manual on heroes.id=combat_manual.hero_id;`;
            query += `drop table heroes;`;
            query += `create table heroes as select * from heroes_tmp;`;
            query += `drop table heroes_tmp;`;
            this.__execQuery(query);
        }

        let skillNameToRowDict = this.__createSkillDict();
        let queryResult = this.__execQuery("select id,skills,hp_5,atk_5,spd_5,def_5,res_5,hp_5_lv1,atk_5_lv1,spd_5_lv1,def_5_lv1,res_5_lv1,skill_rarity,weapon_type,special_type,type,move_type from heroes");
        let queriesText = "";
        const dancers = [];
        let heroRows = queryResult[0].values;
        for (let heroRow of heroRows) {
            let heroId = heroRow[0];
            let skillNamesText = heroRow[1];
            let skillRarity = heroRow[12];
            let skillRarities = convertTextToArray(skillRarity);
            let skillNames = convertTextToArray(skillNamesText);
            let weaponType = heroRow[13];
            let specialType = heroRow[14];
            let color = heroRow[15];
            let moveType = heroRow[16];
            let specialTypes = [];
            if (specialType != null) {
                specialTypes = specialType.split("|");
            }
            let duelRating = 0;
            let isLegendOrMythic = false;
            for (let type of specialTypes) {
                if (type.startsWith("死闘")) {
                    duelRating = Number(type.replace("死闘", ""));
                }
                else if (type.startsWith("伝承") || type.startsWith("神階")) {
                    isLegendOrMythic = true;
                }
            }

            let isDancer = false;
            if (skillNames.length > 0) {
                let newSkillsValue = "<ul style=\"text-align:left;padding-left:20px\">";
                for (let name of skillNames) {
                    if (!(name in skillNameToRowDict)) {
                        console.error(`skill "${name}" was not found.`);
                        continue;
                    }
                    let rarityText = skillRarities.find(x => x.startsWith(name));
                    let rarity = 5;
                    if (rarityText != null) {
                        let skillAndRarity = rarityText.split(":");
                        if (skillAndRarity.length > 1) {
                            rarity = Number(skillAndRarity[1]);
                        }
                    }

                    let row = skillNameToRowDict[name];
                    let id = row[0];

                    if (!isDancer) {
                        const assistType = row[4];
                        isDancer = assistType === "Refresh";
                    }

                    const url = `${urlBase}?fehskill=${id}`;
                    newSkillsValue += `<li class="skillList" style="font-size: 10pt"><a href="${url}" title="${name}の詳細情報">${name}(★${rarity})</a></li>`;
                }
                newSkillsValue += "</ul>";
                queriesText += `update heroes set skills${HtmlColumnSuffix}='${newSkillsValue}' where id=${heroId};`;
            }

            let statusUpdateQuery = "";
            let statusSets = [
                ["hp_5", Number(heroRow[2]), Number(heroRow[7])],
                ["atk_5", Number(heroRow[3]), Number(heroRow[8])],
                ["spd_5", Number(heroRow[4]), Number(heroRow[9])],
                ["def_5", Number(heroRow[5]), Number(heroRow[10])],
                ["res_5", Number(heroRow[6]), Number(heroRow[11])],
            ];

            let rating = 0;
            let hasAsset4 = false;
            for (let statusSet of statusSets) {
                let colName = statusSet[0];
                let lv40 = statusSet[1];
                let lv1 = statusSet[2];
                if (lv1 == 0) {
                    continue;
                }
                let highLow = calcFlowAndAssetValue(lv40, lv1);
                rating += lv40;
                if (highLow[0] == 4) {
                    hasAsset4 = true;
                    statusUpdateQuery += `,${colName}${HtmlColumnSuffix}="<span style=\'color:blue\'>"||${colName}${HtmlColumnSuffix}||"</span>"`;
                    statusUpdateQuery += `,${colName}_df${HtmlColumnSuffix}="<span style=\'color:blue\'>"||${colName}_df${HtmlColumnSuffix}||"</span>"`;
                }
                else if (highLow[1] == -4) {
                    statusUpdateQuery += `,${colName}${HtmlColumnSuffix}="<span style=\'color:red\'>"||${colName}${HtmlColumnSuffix}||"</span>"`;
                    statusUpdateQuery += `,${colName}_df${HtmlColumnSuffix}="<span style=\'color:red\'>"||${colName}_df${HtmlColumnSuffix}||"</span>"`;
                }
            }

            {
                const inheritableDuelRating = getDuelRatingCache(color, moveType, isLegendOrMythic);
                const statusScore = calcStatusArenaScore(rating, hasAsset4, duelRating, inheritableDuelRating);
                const maxSp = calcMaxSp(weaponType, skillNames, skillNameToRowDict);
                const arenaScore = calcArenaScore(statusScore, maxSp, 10, 5, 40);
                queriesText += `update heroes set score_rating='${rating}',max_sp='${maxSp}',arena_score='${arenaScore}',dancer="${isDancer ? 'yes' : 'no'}" where id=${heroId};`;
            }

            if (statusUpdateQuery != "") {
                queriesText += `update heroes set ${statusUpdateQuery.substr(1)} where id=${heroId};`;
            }
        }

        for (let column of statusColumns) {
            queriesText += `update heroes set ${column}=(case resplendent when "true" then ${column}+2 else ${column} end);`;
        }

        this.__execQuery(queriesText);

        // 検索条件の絞り込みUIの設定
        {
            let releaseDateCategory = this.__createSearchTextInfoCategory("リリース日", this.__getColumnName(ColumnType.release_date), [
                "",
                `>="${getDateStringAnyDaysAgo(30)}"`,
                `>="${getDateStringAnyDaysAgo(90)}"`,
                `>="${getDateStringAnyDaysAgo(180)}"`,
                `>="${getDateStringAnyDaysAgo(365)}"`,
            ],
                [
                    "指定なし",
                    "30日以内",
                    "90日以内",
                    "180日以内",
                    "365日以内",
                ]);
            releaseDateCategory.uiType = UiType.Radio;

            const variations = [
                "正月",
                "温泉",
                "ペレジア",
                "ハタリ",
                "カダイン",
                "ナバタ",
                "ジャハナ",
                "バレンタイン",
                "春",
                "子供",
                "闇",
                "ピクニック",
                "花嫁",
                "花婿",
                "立会人",
                "水着",
                "海賊",
                "怪盗",
                "お茶会",
                "総選挙",
                "浴衣",
                "舞踏祭",
                "聖祭",
                "炎部族",
                "風部族",
                "氷部族",
                "ハロウィン",
                "忍者",
                "クリスマス",
            ];
            const variationQueries = Array.from(variations.map(x => `|${x}`));


            // 予めチェックボックスを用意して入力の手間を省くための検索文字列
            this.__addSearchTextInfoCategories([
                this.__createSearchTextInfoCategory("属性", this.__getColumnName(ColumnType.type), [
                    "赤", "青", "緑", "無",
                ], [
                    this.__getCheckboxImgTag('https://fire-emblem.fun/images/feh/ColorRed.png'),
                    this.__getCheckboxImgTag('https://fire-emblem.fun/images/feh/ColorBlue.png'),
                    this.__getCheckboxImgTag('https://fire-emblem.fun/images/feh/ColorGreen.png'),
                    this.__getCheckboxImgTag('https://fire-emblem.fun/images/feh/ColorColorless.png'),
                ]),
                this.__createSearchTextInfoCategory("武器種", this.__getColumnName(ColumnType.weapon_type), [
                    "剣",
                    "槍",
                    "斧",
                    "竜",
                    "獣",
                    "弓",
                    "暗器",
                    "魔",
                    "杖",
                ], [
                    this.__getCheckboxImgTag(g_imageRoot + 'FehIcons/Icon_Class_Sword_Bonus.webp'),
                    this.__getCheckboxImgTag(g_imageRoot + 'FehIcons/Icon_Class_Lance_Bonus.webp'),
                    this.__getCheckboxImgTag(g_imageRoot + 'FehIcons/Icon_Class_Axe_Bonus.webp'),
                    this.__getCheckboxImgTag(g_imageRoot + 'FehIcons/Icon_Class_Dragonstone_Bonus.webp'),
                    this.__getCheckboxImgTag(g_imageRoot + 'FehIcons/Icon_Class_Beast_Bonus.webp'),
                    this.__getCheckboxImgTag(g_imageRoot + 'FehIcons/Icon_Class_Bow_Bonus.webp'),
                    this.__getCheckboxImgTag(g_imageRoot + 'FehIcons/Icon_Class_Dagger_Bonus.webp'),
                    this.__getCheckboxImgTag(g_imageRoot + 'FehIcons/Icon_Class_Magic_Bonus.webp'),
                    this.__getCheckboxImgTag(g_imageRoot + 'FehIcons/Icon_Class_Staff_Bonus.webp'),

                ]),
                this.__createSearchTextInfoCategory("移動タイプ", this.__getColumnName(ColumnType.move_type), [
                    "重装",
                    "歩行",
                    "騎馬",
                    "飛行",
                ], [
                    this.__getCheckboxImgTag('/AetherRaidTacticsBoard/images/MoveType_Armor.png'),
                    this.__getCheckboxImgTag('/AetherRaidTacticsBoard/images/MoveType_Infantry.png'),
                    this.__getCheckboxImgTag('/AetherRaidTacticsBoard/images/MoveType_Cavarly.png'),
                    this.__getCheckboxImgTag('/AetherRaidTacticsBoard/images/MoveType_Flier.png'),
                ]),
                this.__createSearchTextInfoCategory("入手法", this.__getColumnName(ColumnType.how_to_get), [
                    "恒常",
                    "超英雄",
                    "伝承",
                    "神階",
                    "紋章士",
                    "期間限定",
                    "戦渦の連戦",
                    "大英雄戦",
                    "特務機関",
                    "入手不可",
                ]),
                this.__createSearchTextInfoCategory("排出レアリティ", this.__getColumnName(ColumnType.rarity3), [
                    "星5限定",
                    "星4特別チャンス",
                    "星5|星4",
                    "星4|星3",
                ]),
                this.__createSearchTextInfoCategory("英雄の種類", this.__getColumnName(ColumnType.special_type), [
                    "伝承",
                    "神階",
                    "比翼",
                    "双界",
                    "開花",
                    "魔器",
                    "響心",
                    "お供",
                    "紋章士",
                    "つながり",
                ]),
                this.__createSearchTextInfoCategory("踊り子(再行動補助持ち)", this.__getColumnName(ColumnType.dancer), [
                    "yes",
                    "no",
                ],
                    [
                        "はい",
                        "いいえ",
                    ]),

                this.__createSearchTextInfoCategory("祝福", this.__getColumnName(ColumnType.special_type), [
                    "火",
                    "水",
                    "風",
                    "地",
                    "光",
                    "闇",
                    "天",
                    "理",
                ], [
                    this.__getCheckboxImgTag('/AetherRaidTacticsBoard/images/Season_Fire.png'),
                    this.__getCheckboxImgTag('/AetherRaidTacticsBoard/images/Season_Water.png'),
                    this.__getCheckboxImgTag('/AetherRaidTacticsBoard/images/Season_Wind.png'),
                    this.__getCheckboxImgTag('/AetherRaidTacticsBoard/images/Season_Earth.png'),
                    this.__getCheckboxImgTag('/AetherRaidTacticsBoard/images/Season_Light.png'),
                    this.__getCheckboxImgTag('/AetherRaidTacticsBoard/images/Season_Dark.png'),
                    this.__getCheckboxImgTag('/AetherRaidTacticsBoard/images/Season_Astra.png'),
                    this.__getCheckboxImgTag('/AetherRaidTacticsBoard/images/Season_Anima.png'),
                ]),
                this.__createSearchTextInfoCategory("出典", this.__getColumnName(ColumnType.origin), [
                    "ヒーローズ",
                    "暗黒竜と光の剣 紋章の謎",
                    "Echoes",
                    "聖戦の系譜",
                    "トラキア776",
                    "封印の剣",
                    "烈火の剣",
                    "聖魔の光石",
                    "蒼炎の軌跡",
                    "暁の女神",
                    "覚醒",
                    "if",
                    "風花雪月",
                    "♯FE",
                    "エンゲージ",
                ], [
                    this.__getCheckboxImgTag(g_imageRoot + 'FehIcons/Icon_MiniUnit_Head_0.webp', "ヒーローズ"),
                    this.__getCheckboxImgTag(g_imageRoot + 'FehIcons/Icon_MiniUnit_Head_1.webp', "暗黒竜と光の剣 紋章の謎"),
                    this.__getCheckboxImgTag(g_imageRoot + 'FehIcons/Icon_MiniUnit_Head_2.webp', "Echoes"),
                    this.__getCheckboxImgTag(g_imageRoot + 'FehIcons/Icon_MiniUnit_Head_3.webp', "聖戦の系譜"),
                    this.__getCheckboxImgTag(g_imageRoot + 'FehIcons/Icon_MiniUnit_Head_4.webp', "トラキア776"),
                    this.__getCheckboxImgTag(g_imageRoot + 'FehIcons/Icon_MiniUnit_Head_5.webp', "封印の剣"),
                    this.__getCheckboxImgTag(g_imageRoot + 'FehIcons/Icon_MiniUnit_Head_6.webp', "烈火の剣"),
                    this.__getCheckboxImgTag(g_imageRoot + 'FehIcons/Icon_MiniUnit_Head_7.webp', "聖魔の光石"),
                    this.__getCheckboxImgTag(g_imageRoot + 'FehIcons/Icon_MiniUnit_Head_8.webp', "蒼炎の軌跡"),
                    this.__getCheckboxImgTag(g_imageRoot + 'FehIcons/Icon_MiniUnit_Head_9.webp', "暁の女神"),
                    this.__getCheckboxImgTag(g_imageRoot + 'FehIcons/Icon_MiniUnit_Head_10.webp', "覚醒"),
                    this.__getCheckboxImgTag(g_imageRoot + 'FehIcons/Icon_MiniUnit_Head_11.webp', "if"),
                    this.__getCheckboxImgTag(g_imageRoot + 'FehIcons/Icon_MiniUnit_Head_12.webp', "風花雪月"),
                    this.__getCheckboxImgTag(g_imageRoot + 'FehIcons/Icon_MiniUnit_Head_13.webp', "♯FE"),
                    this.__getCheckboxImgTag(g_imageRoot + 'FehIcons/Icon_MiniUnit_Head_14.webp', "エンゲージ"),
                ]),
                this.__createVersionCategory(),
                this.__createSearchTextInfoCategory("性別", this.__getColumnName(ColumnType.sex), [
                    "男",
                    "女",
                    "性別不詳",
                ]),
                this.__createSearchTextInfoCategory("衣装", this.__getColumnName(ColumnType.name),
                    variationQueries, variations),
                releaseDateCategory,
            ]);
        }

        {

            for (let key in ColumnType) {
                let label = ColumnType[key];
                this.columnInfos.push(this.__createColumnInfo(label));
            }

            // 標準で表示しておく列
            {
                let column = this.__findColumnInfoByType(ColumnType.name)
                column.isKeyColumn = true;
                let visibleColumns = [
                    ColumnType.name,
                    ColumnType.hp_5,
                    ColumnType.atk_5,
                    ColumnType.spd_5,
                    ColumnType.def_5,
                    ColumnType.res_5,
                    ColumnType.rating_5,
                ];
                for (let columnType of visibleColumns) {
                    this.__findColumnInfoByType(columnType).isVisible = true;
                }
            }

            // 表示用の列と検索用列が異なる列
            {
                let htmlColumns = [
                    ColumnType.name,
                    ColumnType.hp_5,
                    ColumnType.atk_5,
                    ColumnType.spd_5,
                    ColumnType.def_5,
                    ColumnType.res_5,
                    ColumnType.skills,
                    ColumnType.rating_5,
                    ColumnType.official_url,
                    ColumnType.hp_5_df,
                    ColumnType.atk_5_df,
                    ColumnType.spd_5_df,
                    ColumnType.def_5_df,
                    ColumnType.res_5_df,
                ];
                for (let columnType of htmlColumns) {
                    this.__findColumnInfoByType(columnType).displayColumnName = this.__getColumnName(columnType) + HtmlColumnSuffix;
                }
            }

            this.sortColumn = this.__getColumnName(ColumnType.release_date);
        }
    }

    __createVersionCategory() {
        const queryResult = this.__execQuery("select distinct book from heroes")[0];
        const keyToIndex = {};
        for (let i = 0; i < queryResult.columns.length; ++i) {
            keyToIndex[queryResult.columns[i]] = i;
        }
        const rows = queryResult.values;
        const bookValues = [];
        for (const row of rows) {
            const book = row[keyToIndex["book"]];
            bookValues.push(book);
        }
        return this.__createSearchTextInfoCategory(
            "バージョン(登場した部)", this.__getColumnName(ColumnType.book), bookValues)
    }
}
