

const ColumnType = {
    name: "名前",
    english_name: "英語名",
    color: "属性",
    weapon_type: "武器種",
    class: "タイプ",
    hp_lv1: "HP(光 LV1)",
    atk_lv1: "攻撃(光 LV1)",
    hp_shadow_lv1: "HP(闇 LV1)",
    magics: "所持魔法",
    release_date: "リリース日",
    sex: "性別",
};

const HtmlColumnSuffix = "_html";

class AppData extends AppDataBase {
    constructor() {
        super("disciples");

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
                ColumnType.hp_lv1,
                ColumnType.atk_lv1,
                ColumnType.magics,
            ];
            for (let columnType of visibleColumns) {
                this.__findColumnInfoByType(columnType).isVisible = true;
            }
        }

        this.nameToCharInfo = {};
        this.nameToDiscipleInfo = {};
        this.magicNameToMagiInfo = {};

        this.currentLevel = 1;
        this.hpBonus = 0;
        this.atkBonus = 0;

        this.defaultSortCondition = "release_date desc";
    }

    updateTableHeader() {
        {
            const columnName = this.__getColumnName(ColumnType.hp_lv1);
            let info = this.columnInfos.find(x => x.displayColumnName == columnName);
            info.label = `HP<br>(LV${this.currentLevel}+${this.hpBonus * 100}%)`;
        }
        {
            const columnName = this.__getColumnName(ColumnType.atk_lv1);
            let info = this.columnInfos.find(x => x.displayColumnName == columnName);
            info.label = `攻撃<br>(LV${this.currentLevel}+${this.atkBonus * 100}%)`;
        }
        {
            const columnName = this.__getColumnName(ColumnType.hp_shadow_lv1);
            let info = this.columnInfos.find(x => x.displayColumnName == columnName);
            info.label = `HP<br>(闇LV${this.currentLevel}+${this.hpBonus * 100}%)`;
        }
    }
    __initDict() {
        const discipleNames = [];
        {
            const queryResult = this.dbs[0].exec("select * from disciples")[0];
            const rows = queryResult.values;
            const nameIndex = queryResult.columns.indexOf("name");
            const weaponIndex = queryResult.columns.indexOf("weapon_type");
            const classIndex = queryResult.columns.indexOf("class");
            for (const row of rows) {
                const name = row[nameIndex];
                const weaponType = row[weaponIndex];
                const classType = row[classIndex];
                discipleNames.push(name);
                this.nameToDiscipleInfo[name] = new DiscipleInfo(name, weaponType, classType);
            }
        }

        {
            const namesText = discipleNames.join("\" or name=\"");
            const condition = `(name="${namesText}") and series="|シャドウズ|" and variation="光"`;

            /** @type {CharacterInfo[]} */
            const charInfos = createCharacterInfoListFromDb(this.dbs[1], `where ${condition}`);
            for (const charInfo of charInfos) {
                this.nameToCharInfo[charInfo.pureName] = charInfo;
            }
        }

        {
            const queryResult = this.dbs[0].exec("select * from magics")[0];
            const rows = queryResult.values;
            const nameIndex = queryResult.columns.indexOf("name");
            const idIndex = queryResult.columns.indexOf("id");
            const effectTypeIndex = queryResult.columns.indexOf("effect_type");
            for (const row of rows) {
                const name = row[nameIndex];
                const id = row[idIndex];
                const effectType = row[effectTypeIndex];
                this.magicNameToMagiInfo[name] = new MagicInfo(id, name, effectType);
            }
        }
    }

    __initDatabaseTable() {
        // キャラクター情報の辞書作成
        this.__initDict();

        // 列の追加
        {
            const addColumns = [
                "english_name",
                "sex",
            ];

            let query = "";
            for (let column of addColumns) {
                query += `alter table disciples add column ${column};`;
            }

            /** @type {CharacterInfo[]} */
            const charInfos = Object.values(this.nameToCharInfo);
            if (charInfos.length > 0) {
                query += `
    UPDATE disciples
    SET sex = CASE name
        ${charInfos.map(info => `WHEN '${info.pureName}' THEN '${info.sex}'`).join("\n")}
        ELSE sex
    END;
    UPDATE disciples
    SET english_name = CASE name
        ${charInfos.map(info => `WHEN '${info.pureName}' THEN '${info.englishName}'`).join("\n")}
        ELSE english_name
    END;
    `;
            }

            console.log(query);
            this.__execQuery(query);
        }


        // ビューへの変換関数
        {
            this.convertCellFunc = (value, columnName, record) => {
                if (columnName == "name") {
                    // 名前の上にキャラアイコン表示
                    if (!(value in this.nameToCharInfo)) {
                        return value;
                    }

                    /** @type {CharacterInfo} */
                    const charInfo = this.nameToCharInfo[value];
                    const thumbSize = 50;
                    let result = `<a href='${charInfo.url}'><div style='font-size:12px;text-align:center;min-width:72px;'>`;
                    result += "<div style='position:relative;display:inline-block;'>";
                    result += `<img src="${charInfo.imagePath}" width="${thumbSize}" height="${thumbSize}"><br/>`;

                    const discipleInfo = this.nameToDiscipleInfo[value];
                    const weaponIcon = this.__getWeaponIconPath(discipleInfo.weaponType);
                    result += `<img src="${weaponIcon}" style='position: absolute; top:0;left:0;width:15px;height:15px'>`;
                    const classIcon = this.__getClassIconPath(discipleInfo.class);
                    result += `<img src="${classIcon}" style='position: absolute; bottom:0;left:0;width:15px;height:15px'>`;
                    result += "</div>";
                    return result + `<div>${value}</div></div></a>`;
                }
                else if (columnName == "magics") {
                    let result = '<ul>';
                    for (const magicName of value.split('|').filter(x => x != "")) {
                        if (magicName in this.magicNameToMagiInfo) {
                            const info = this.magicNameToMagiInfo[magicName];
                            result += `<li><a href='${info.url}'>${magicName}</a></li>`;
                        }
                        else {
                            result += `<li>${magicName}</li>`;
                        }
                    }
                    return result + '</ul>';
                }
                else if (columnName == "hp_lv1" || columnName == "hp_shadow_lv1") {
                    const valueForCurrentLevel = calcValueForSpecifiedLevel(value, this.currentLevel);
                    return Math.floor(valueForCurrentLevel + valueForCurrentLevel * this.hpBonus);
                }
                else if (columnName == "atk_lv1") {
                    const valueForCurrentLevel = calcValueForSpecifiedLevel(value, this.currentLevel);
                    return Math.floor(valueForCurrentLevel + valueForCurrentLevel * this.atkBonus);
                }
                return value;
            };
        }

        // 検索条件の絞り込みUIの設定
        {
            const weaponTypes = [
                "剣", "槍", "斧",
                "書",
                "竜",
                "爪",
                "杖",
                "弓",
            ];
            const weaponIcons = Array.from(weaponTypes.map(x => this.__getCheckboxImgTag(this.__getWeaponIconPath(x))));

            const classTypes = [
                "攻撃", "耐久", "騎馬", "飛行",
            ];
            const classIcons = Array.from(classTypes.map(x => this.__getCheckboxImgTag(this.__getClassIconPath(x))));

            const colorCategory = this.__createSearchTextInfoCategory("属性", this.__getColumnName(ColumnType.color), [
                "赤", "青", "緑",
            ], [
                this.__getCheckboxImgTag('/images/fe-shadows/icons/ColorRed.png'),
                this.__getCheckboxImgTag('/images/fe-shadows/icons/ColorBlue.png'),
                this.__getCheckboxImgTag('/images/fe-shadows/icons/ColorGreen.png'),
            ]);
            // まだ少ないのでデフォルトで全表示しておく
            for (const info of colorCategory.searchTextInfos) {
                info.isEnabled = true;
            }
            this.__addSearchTextInfoCategories([
                colorCategory,

                this.__createSearchTextInfoCategory("武器種", this.__getColumnName(ColumnType.weapon_type), weaponTypes, weaponIcons, true),
                this.__createSearchTextInfoCategory("タイプ", this.__getColumnName(ColumnType.class), classTypes, classIcons, true),
                this.__createSearchTextInfoCategoryByExistingValues(ColumnType.sex, false),
            ]);
        }
    }

    __getClassIconPath(classType) {
        switch (classType) {
            case "攻撃": return '/images/fe-shadows/icons/type-infantry.png';
            case "耐久": return '/images/fe-shadows/icons/type-armored.png';
            case "騎馬": return '/images/fe-shadows/icons/type-cavalry.png';
            case "飛行": return '/images/fe-shadows/icons/type-flying.png';
            default: return '';
        }
    }

    __getWeaponIconPath(weaponType) {
        switch (weaponType) {
            case "剣": return '/images/fe-shadows/icons/weapon-sword.png';
            case "槍": return '/images/fe-shadows/icons/weapon-lance.png';
            case "斧": return '/images/fe-shadows/icons/weapon-axe.png';
            case "竜": return '/images/fe-shadows/icons/weapon-stone.png';
            case "爪": return '/images/fe-shadows/icons/weapon-claws.png';
            case "書": return '/images/fe-shadows/icons/weapon-tome.png';
            case "杖": return '/images/fe-shadows/icons/weapon-staff.png';
            case "弓": return '/images/fe-shadows/icons/weapon-bow.png';
            default: return "";
        }
    }

    __createSearchTextInfoCategoryByExistingValues(columnLabel, isBulkControlEnabled) {
        const columnName = this.__getColumnName(columnLabel);
        const queryResult = this.__execQuery(`select distinct ${columnName} from disciples`)[0];
        const keyToIndex = {};
        for (let i = 0; i < queryResult.columns.length; ++i) {
            keyToIndex[queryResult.columns[i]] = i;
        }
        const rows = queryResult.values;
        const values = [];
        for (const row of rows) {
            const value = row[keyToIndex[columnName]];
            values.push(value);
        }

        const category = this.__createSearchTextInfoCategory(
            columnLabel,
            columnName,
            values,
            null,
            isBulkControlEnabled);
        return category;
    }

    __createColumnInfo(typeValue, isVisible = false, isAvailableOnDatabase = true, isKeyColumn = false) {
        return createColumnInfoFromDict(
            ColumnType, typeValue, typeValue, isVisible, isAvailableOnDatabase, isKeyColumn);
    }

    __getColumnName(type) {
        return getDictKeyFromValue(ColumnType, type);
    }
    __findColumnInfoByType(type) {
        return this.__findColumnInfo(this.__getColumnName(type));
    }
    *__enumerateDbPaths() {
        yield g_dbRoot + "fe-shadows.sqlite3";
        yield g_dbRoot + "feh-original_heroes.sqlite3";
    }
}
