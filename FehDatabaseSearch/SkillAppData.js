
const ColumnType = {
    name: "名前",
    how_to_read: "読み方",
    english_name: "英語名",
    description: "効果",
    type: "種類",
    weapon_type: "武器種",
    assist_type: "補助種",
    inheritable_weapon_type: "継承可能な武器種",
    inheritable_move_type: "継承可能な移動種",
    count: "奥義カウント",
    might: "威力",
    effective: "特効",
    sp: "SP",
    learnable_units: "習得ユニット",
    release_date: "リリース日",
    refined_date: "武器錬成日",
};

class AppData extends AppDataBase {
    constructor() {
        super("skills");
    }

    initUi() {
        let releaseDateCategory = this.__createSearchTextInfoCategory("リリース日",
            "release_date",
            [
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

        const spConditions = {};
        {
            const query = "select * from skills where sp!='' and sp is not null and sp>0 order by sp desc";
            const queryResult = this.db.exec(query)[0];
            const spIndex = queryResult.columns.indexOf("sp");
            for (const columnValues of queryResult.values) {
                const sp = columnValues[spIndex];
                spConditions[sp] = `=${sp}`;
            }
        }

        // 予めチェックボックスを用意して入力の手間を省くための検索文字列
        this.__addSearchTextInfoCategories([
            this.__createSearchTextInfoCategory("スキルの種類", "type", [
                "='武器'",
                "='サポート'",
                "='奥義'",
                "パッシブA",
                "パッシブB",
                "パッシブC",
                "聖印",
                "響心",
                "='隊長'",
            ], [
                this.__getCheckboxImgTag('/AetherRaidTacticsBoard/images/Weapon.png'),
                this.__getCheckboxImgTag('/AetherRaidTacticsBoard/images/Support.png'),
                this.__getCheckboxImgTag('/AetherRaidTacticsBoard/images/Special.png'),
                this.__getCheckboxImgTag('/AetherRaidTacticsBoard/images/A.png'),
                this.__getCheckboxImgTag('/AetherRaidTacticsBoard/images/B.png'),
                this.__getCheckboxImgTag('/AetherRaidTacticsBoard/images/C.png'),
                this.__getCheckboxImgTag('/AetherRaidTacticsBoard/images/S.png'),
                "響心",
                "隊長",
            ]),
            this.__createSearchTextInfoCategory("武器種", "weapon_type", [
                "='剣'",
                "='槍'",
                "='斧'",
                "='杖'",
                "='赤魔法'",
                "='青魔法'",
                "='緑魔法'",
                "='無魔法'",
                "='暗器'",
                "='弓'",
                "='竜石'",
                "='獣'",
            ], [
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Red_Sword.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Blue_Lance.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Green_Axe.png'),

                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Gray_Staff.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Red_Tome.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Blue_Tome.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Green_Tome.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Gray_Tome.png'),
                this.__getCheckboxImgTag('https://fire-emblem.fun/images/FehIcons/Icon_Class_Dagger_Bonus.webp'),
                this.__getCheckboxImgTag('https://fire-emblem.fun/images/FehIcons/Icon_Class_Bow_Bonus.webp'),
                this.__getCheckboxImgTag('https://fire-emblem.fun/images/FehIcons/Icon_Class_Dragonstone_Bonus.webp'),
                this.__getCheckboxImgTag('https://fire-emblem.fun/images/FehIcons/Icon_Class_Beast_Bonus.webp'),
            ]),
            this.__createSearchTextInfoCategory("補助種", "assist_type", [
                "='Rally'",
                "='Refresh'",
                "='Move'",
                "='Heal'",
                "='DonorHeal'",
                "='Restore'",
            ], [
                "応援",
                "再行動",
                "移動",
                "ヒール",
                "ドナーヒール",
                "レスト",
            ]),
            this.__createSearchTextInfoCategory("特効", "effective", [
                "重装",
                "騎馬",
                "飛行",
                "歩行",
                "竜",
                "獣",
                "魔法",
                "剣",
                "槍",
                "斧",
                "無属性弓",
            ], [
                this.__getCheckboxImgTag('/AetherRaidTacticsBoard/images/MoveType_Armor.png'),
                this.__getCheckboxImgTag('/AetherRaidTacticsBoard/images/MoveType_Cavarly.png'),
                this.__getCheckboxImgTag('/AetherRaidTacticsBoard/images/MoveType_Flier.png'),
                this.__getCheckboxImgTag('/AetherRaidTacticsBoard/images/MoveType_Infantry.png'),

                this.__getCheckboxImgTag('https://fire-emblem.fun/images/FehIcons/Icon_Class_Dragonstone_Bonus.webp'),
                this.__getCheckboxImgTag('https://fire-emblem.fun/images/FehIcons/Icon_Class_Beast_Bonus.webp'),
                this.__getCheckboxImgTag('https://fire-emblem.fun/images/FehIcons/Icon_Class_Magic_Bonus.webp'),

                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Red_Sword.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Blue_Lance.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Green_Axe.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Gray_Bow.png'),
            ]),
            this.__createSearchTextInfoCategory(ColumnType.inheritable_move_type, "inheritable_move_type", [
                "重装",
                "騎馬",
                "飛行",
                "歩行",
                "継承不可",
            ], [
                this.__getCheckboxImgTag('/AetherRaidTacticsBoard/images/MoveType_Armor.png'),
                this.__getCheckboxImgTag('/AetherRaidTacticsBoard/images/MoveType_Cavarly.png'),
                this.__getCheckboxImgTag('/AetherRaidTacticsBoard/images/MoveType_Flier.png'),
                this.__getCheckboxImgTag('/AetherRaidTacticsBoard/images/MoveType_Infantry.png'),
                "継承不可",
            ]),
            this.__createSearchTextInfoCategory(ColumnType.inheritable_weapon_type, "inheritable_weapon_type", [
                "剣",
                "槍",
                "斧",
                "杖",
                "赤竜",
                "青竜",
                "緑竜",
                "無竜",
                "赤獣",
                "青獣",
                "緑獣",
                "無獣",
                "赤魔",
                "青魔",
                "緑魔",
                "無魔",
                "赤暗器",
                "青暗器",
                "緑暗器",
                "無暗器",
                "赤弓",
                "青弓",
                "緑弓",
                "無弓",
                "継承不可",
            ], [
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Red_Sword.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Blue_Lance.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Green_Axe.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Gray_Staff.png'),

                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Red_Breath.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Blue_Breath.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Green_Breath.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Gray_Breath.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Red_Beast.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Blue_Beast.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Green_Beast.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Gray_Beast.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Red_Tome.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Blue_Tome.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Green_Tome.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Gray_Tome.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Red_Dagger.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Blue_Dagger.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Green_Dagger.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Gray_Dagger.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Red_Bow.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Blue_Bow.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Green_Bow.png'),
                this.__getCheckboxImgTag('/FehTools/FehIconMaker/images/Gray_Bow.png'),
                "継承不可",
            ]),
            this.__createSearchTextInfoCategory("武器錬成",
                "refined_date",
                [
                    "20",
                    `未登録`,
                ],
                [
                    "あり",
                    "なし",
                ]),
            this.__createSearchTextInfoCategory(ColumnType.sp, "sp", Object.values(spConditions).reverse(), Object.keys(spConditions).reverse()),
            releaseDateCategory,
        ]);

        this.__addColumns([
            this.__createColumnInfo(ColumnType.type, true),
            this.__createColumnInfo(ColumnType.weapon_type, false),
            this.__createColumnInfo(ColumnType.assist_type, false),
            this.__createColumnInfo(ColumnType.name, true, true, false),
            this.__createColumnInfo(ColumnType.english_name, false),
            this.__createColumnInfo(ColumnType.how_to_read, false),
            this.__createColumnInfo(ColumnType.description, true),
            this.__createColumnInfo(ColumnType.inheritable_weapon_type, false),
            this.__createColumnInfo(ColumnType.inheritable_move_type, false),
            this.__createColumnInfo(ColumnType.count, false),
            this.__createColumnInfo(ColumnType.might, false),
            this.__createColumnInfo(ColumnType.effective, false),
            this.__createColumnInfo(ColumnType.sp, false),
            this.__createColumnInfo(ColumnType.learnable_units, true),
            this.__createColumnInfo(ColumnType.release_date, false),
            this.__createColumnInfo(ColumnType.refined_date, false),
        ]);

        this.sortColumn = getDictKeyFromValue(ColumnType, ColumnType.release_date);
    }


    __getPageId() {
        return 1677;
    }

    __createColumnInfo(typeValue, isVisible = true, isAvailableOnDatabase = true, isKeyColumn = false) {
        return createColumnInfoFromDict(
            ColumnType, typeValue, typeValue, isVisible, isAvailableOnDatabase, isKeyColumn);
    }

    __isImageAvailableInTable() {
        let column = this.columnInfos.find(x => x.name == getDictKeyFromValue(ColumnType, ColumnType.learnable_units));
        return column.isVisible;
    }

    __createSkillToHeroDict() {
        let queryResult = this.__execQueryHeroes("select id,name,thumb,skills,release_date from heroes order by release_date");
        let rows = queryResult[0].values;
        let skillToHeroDict = [];
        for (let row of rows) {
            let skillNamesText = row[3];
            if (skillNamesText == null) {
                continue;
            }
            let skillNames = skillNamesText.split("|").filter(function (el) {
                return el != null && el != "";
            });
            for (let skillName of skillNames) {
                if (!(skillName in skillToHeroDict)) {
                    skillToHeroDict[skillName] = [];
                }
                skillToHeroDict[skillName].push(row);
            }
        }
        return skillToHeroDict;
    }

    __execQueryHeroes(query) {
        let db = this.dbs[1];
        return db.exec(query);
    }

    *__enumerateDbPaths() {
        yield g_dbRoot + "feh-skills.sqlite3";
        yield g_dbRoot + "feh-heroes.sqlite3";
    }

    __initDatabaseTable() {
        // todo: オフラインで検索用のヘッダーを事前に作れば高速化できる
        // if (this.__examinesColumnExistsInSqliteTable("skills", "learnable_units")) {
        //     // 既に存在する場合はスキップ
        //     return;
        // }


        // スキル検索用のテーブルを作成
        this.__execQuery(`alter table skills add column learnable_units;`);

        let skillNameToHeroDict = this.__createSkillToHeroDict();

        let queryResult = this.__execQuery("select id,name from skills where name||'+' not in (select name from skills where name is not null)");
        let queriesText = "";

        let skillRows = queryResult[0].values;
        for (let skillRow of skillRows) {
            let skillId = skillRow[0];
            let skillName = skillRow[1];
            if (this.__isExclusionTargetSkill(skillName)) {
                continue;
            }

            let heroRows = skillNameToHeroDict[skillName];
            if (!(skillName in skillNameToHeroDict)) {
                continue;
            }
            let learnableUnitsHtml = "";
            for (let row of heroRows) {
                let id = row[0];
                let heroName = row[1];
                let thumb = row[2];
                learnableUnitsHtml += this.__createHeroIcon(id, heroName, thumb);
            }

            queriesText += `update skills set learnable_units='${learnableUnitsHtml}' where id='${skillId}';`;

            let releaseDate = heroRows[0][4];
            queriesText += `update skills set release_date='${releaseDate}' where id='${skillId}' and release_date="";`;
        }

        // HP1、HP2等も消えてしまうので、一旦削除保留。速度的に問題になったら考える
        // queriesText += `DELETE FROM skills WHERE learnable_units is null and not (type="聖印" or type="隊長");`;
        this.__execQuery(queriesText);

        // 事前に変換しておくカラム
        {
            let query = "update skills set ";
            // query += `type=(case when weapon_type!="" then type||"("||weapon_type||")" else type end)`;
            query += `description="<span class='skillDescription'>"||(case when refine_description!="" then "<p>"||description||"</p><p><span style=\'color: blue\'><b>特殊錬成後:</b><br/>"||refine_description||"<br/>"||special_refine_description||"</span></p>" else description end)||"</span>"`;
            const urlBase = "https://fire-emblem.fun/";
            query += `,name="<a href=\'${urlBase}?fehskill="||id||"\' title=\'"||name||"の詳細情報\' >"||name||"</a>"`;
            query += `,inheritable_weapon_type=case when inherit="可" then (case when type="武器" then "|"||weapon_type||"|" `
                + `when inheritable_weapon_type is null or inheritable_weapon_type="" then "制限なし" `
                + `else inheritable_weapon_type end) else "継承"||inherit end`;
            query += `,inheritable_move_type=case when inherit=="可" then (case when inheritable_move_type is null or inheritable_move_type="" then "|歩行|重装|騎馬|飛行|" else inheritable_move_type end) else "継承"||inherit end`;
            query += `,how_to_read=case when how_to_read=="" or how_to_read is null then "未登録" else how_to_read end`;
            query += `,english_name=case when english_name=="" or english_name is null then "未登録" else english_name end`;
            query += `,refined_date=case when refined_date=="" or refined_date is null then "未登録" else refined_date end`;
            this.__execQuery(query);

            query = 'update skills set inheritable_weapon_type=replace('
                + 'replace('
                + 'replace('
                + 'replace('
                + 'replace('
                + 'replace('
                + 'replace(inheritable_weapon_type, "制限なし", "|剣|赤魔|赤暗器|赤弓|赤竜|赤獣|槍|青魔|青暗器|青弓|青竜|青獣|斧|緑魔|緑暗器|緑弓|緑竜|緑獣|杖|無魔|無竜|無獣|無暗器|無弓|"),'
                + ' "|魔法|", "|赤魔|青魔|緑魔|無魔|"),'
                + '"|弓|", "|赤弓|青弓|緑弓|無弓|"),'
                + '"|暗器|", "|赤暗器|青暗器|緑暗器|無暗器|"),'
                + '"|獣|", "|赤獣|青獣|緑獣|無獣|"),'
                + '"|竜|", "|赤竜|青竜|緑竜|無竜|"),'
                + '"|杖以外|", "|剣|赤魔|赤暗器|赤弓|赤竜|赤獣|槍|青魔|青暗器|青弓|青竜|青獣|斧|緑魔|緑暗器|緑弓|緑竜|緑獣|無魔|無竜|無獣|無暗器|無弓|")';
            this.__execQuery(query);

            query = `update skills set type=case when sacred_seal=="true" then type||" 聖印" else type end`;
            this.__execQuery(query);
        }
    }

    __isExclusionTargetSkill(skillName) {
        return skillName.endsWith("1")
            || skillName.startsWith("錬成の証")
            || skillName.includes("迷宮の覇者")
            || skillName.includes("盗賊の偶像")
            || skillName.includes("獣の化身・");
    }

    __createHeroIcon(id, name, thumb) {
        const urlBase = "https://fire-emblem.fun/";
        const url = `${urlBase}?fehhero=${id}`;
        const thumbUrl = `/images/FehHeroThumbs/${thumb}`;
        const iconSize = 50;
        const preTag = `<div style="float:left;"><a title="${name}の詳細情報" href="${url}" >`;
        const postTag = `</a></div>`;
        if (g_isLazyLoadImageEnabled) {
            return `${preTag}<img src="/images/dummy.png" class="lazy" data-src="${thumbUrl}" alt="${name}" style="max-width: ${iconSize}px" />${postTag}`;
        }
        else {
            return `${preTag}<img src="${thumbUrl}" alt="${name}" style="max-width: ${iconSize}px" />${postTag}`;
        }
    }
}
