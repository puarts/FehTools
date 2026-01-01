
const ColumnType = {
    name: "名前",
    english_name: "英語名",
    description: "効果(LV1)",
    type: "カテゴリ",
    effect_type: "種類",
    color: "属性",
    disciples: "所持使徒",
    cool_time: "クールタイム",
    release_date: "リリース日",
};

const HtmlColumnSuffix = "_html";

class AppData extends AppDataBase {
    constructor() {
        super("magics");

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
                ColumnType.description,
                ColumnType.disciples,
            ];
            for (let columnType of visibleColumns) {
                this.__findColumnInfoByType(columnType).isVisible = true;
            }
        }

        this.nameToCharInfo = {};
        this.nameToDiscipleInfo = {};
        this.magicNamesToDiscipleNames = {};
        this.magicNameToMagiInfo = {};

        this.currentLevel = 1;
        this.advantage = 'なし';

        this.defaultSortCondition = "release_date desc,type='闇',type='光',type='専用',effect_type like '%攻撃%' desc,effect_type like '%回復%' desc,effect_type like '%化%' desc,effect_type like '%移動%' desc,effect_type like '%召喚%' desc,disciples='なし'";
    }

    updateDescriptionHeader() {
        const columnName = this.__getColumnName(ColumnType.description);
        let info = this.columnInfos.find(x => x.displayColumnName == columnName);
        info.label = `効果(LV${this.currentLevel})`;
    }

    __initDict() {
        const discipleNames = [];
        {
            const queryResult = this.dbs[0].exec("select * from disciples")[0];
            const rows = queryResult.values;
            const nameIndex = queryResult.columns.indexOf("name");
            const weaponIndex = queryResult.columns.indexOf("weapon_type");
            const classIndex = queryResult.columns.indexOf("class");
            const magicsIndex = queryResult.columns.indexOf("magics");
            for (const row of rows) {
                const name = row[nameIndex];
                const weaponType = row[weaponIndex];
                const classType = row[classIndex];
                const magics = row[magicsIndex];
                discipleNames.push(name);
                const info = new DiscipleInfo(name, weaponType, classType, magics);
                this.nameToDiscipleInfo[name] = info;

                for (const magicName of info.magics) {
                    if (!(magicName in this.magicNamesToDiscipleNames)) {
                        this.magicNamesToDiscipleNames[magicName] = [];
                    }
                    this.magicNamesToDiscipleNames[magicName].push(name);
                }
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
                "disciples",
            ];

            let query = "";
            for (let column of addColumns) {
                query += `alter table magics add column ${column};`;
            }

            query += `
    UPDATE magics
    SET disciples = CASE name\n`;
            for (const magiName of Object.keys(this.magicNamesToDiscipleNames)) {

                /** @type {string[]} */
                const discipleNames = this.magicNamesToDiscipleNames[magiName];
                console.log(`${magiName}: ${discipleNames.length}`);
                const disciplesText = discipleNames.join("|");
                query += `WHEN '${magiName}' THEN '${disciplesText}'\n`;
            }
            query += `ELSE 'なし'
    END;`;
            console.log(query);
            this.__execQuery(query);
        }


        // ビューへの変換関数
        {
            this.convertCellFunc = (value, columnName, record) => {
                if (columnName == "name") {
                    /** @type {MagicInfo} */
                    const info = this.magicNameToMagiInfo[value];
                    let html = "<div style='font-size:12px;text-align:center;min-width:50px;'>";
                    html += `<a href='${info.url}'><img src='${info.iconUrl}' onerror="this.onerror=null; this.src='${info.altIconUrl}';" height='66'><br>${value}</a>`;
                    html += "</div>";
                    return html;
                } else if (columnName == "description") {
                    const magicName = record[0];
                    const info = this.magicNameToMagiInfo[magicName];
                    const replaced = this.__updateMagicDescriptionByCurrentLevel(value, info);
                    return replaced
                        .replaceAll("【", "")
                        .replaceAll("】", "")
                        .replaceAll("\n", "<br>");
                } else if (columnName == "disciples") {
                    let discipleHtml = '';
                    for (const discipleName of value.split("|")) {
                        // 名前の上にキャラアイコン表示
                        if (!(discipleName in this.nameToCharInfo)) {
                            discipleHtml += `<div>${discipleName}</div>`;
                            continue;
                        }

                        /** @type {CharacterInfo} */
                        const charInfo = this.nameToCharInfo[discipleName];
                        const thumbSize = 50;
                        let result = `<div style='font-size:12px;text-align:center;min-width:50px;'><a href='${charInfo.url}'>`;
                        result += "<div style='position:relative;display:inline-block;'>";
                        result += `<img src="${charInfo.imagePath}" width="${thumbSize}" height="${thumbSize}">`;

                        const discipleInfo = this.nameToDiscipleInfo[discipleName];
                        const weaponIcon = this.__getWeaponIconPath(discipleInfo.weaponType);
                        result += `<img src="${weaponIcon}" style='position: absolute; top:0;left:0;width:15px;height:15px'>`;
                        const classIcon = this.__getClassIconPath(discipleInfo.class);
                        result += `<img src="${classIcon}" style='position: absolute; bottom:0;left:0;width:15px;height:15px'>`;
                        result += "</div>";
                        result += `<div>${discipleName}</div></a></div>`;
                        discipleHtml += result;
                    }
                    return discipleHtml;
                } else if (columnName == "cool_time") {
                    return `${value == '' ? 5 : value}秒`;
                }
                return value;
            };
        }

        // 検索条件の絞り込みUIの設定
        {
            const typeCategory = this.__createSearchTextInfoCategoryByExistingValues(ColumnType.type, true);

            // まだ少ないのでデフォルトで全表示しておく
            for (const info of typeCategory.searchTextInfos) {
                info.isEnabled = true;
            }

            this.__addSearchTextInfoCategories([
                typeCategory,
                this.__createSearchTextInfoCategory(
                    ColumnType.effect_type,
                    this.__getColumnName(ColumnType.effect_type),
                    ["攻撃", "攻撃|移動", "攻撃|回復", "回復", "回復|移動", "強化", "弱化", "移動", "召喚"],
                    null,
                    true),
            ]);
        }
    }

    __getAdvantageRate() {
        switch (this.advantage) {
            case '有利': return 0.2;
            case '不利': return -0.2;
            case 'なし':
            default:
                return 0;
        }
    }

    __updateMagicDescriptionByCurrentLevel(description, info) {
        let numbers = extractBracketedNumbers(description);

        const advRate = this.__getAdvantageRate();

        if (info.name == "イーサーEX") {
            numbers[0] = calcValueForSpecifiedLevel(numbers[0], this.currentLevel, 1.0);
            numbers[0] = numbers[0] + Math.trunc(numbers[0] * advRate);
            numbers[1] = calcValueForSpecifiedLevel(numbers[1], this.currentLevel, 2.0 / 3.0);
        }
        else {
            switch (info.effectTypes[0]) {
                case "攻撃":
                    numbers = numbers.map(x => {
                        const baseVal = calcValueForSpecifiedLevel(x, this.currentLevel, 1.0);
                        return baseVal + Math.trunc(baseVal * advRate);
                    });
                    break;
                case "回復":
                    numbers = numbers.map(x => calcValueForSpecifiedLevel(x, this.currentLevel, 1.0));
                    break;
                case "強化":
                case "弱化":
                    numbers = numbers.map(x => calcValueForSpecifiedLevel(x, this.currentLevel, 0.5));
                    break;
                case "召喚":
                    numbers[0] = calcValueForSpecifiedLevel(numbers[0], this.currentLevel, 1.0);
                    numbers[1] = calcValueForSpecifiedLevel(numbers[1], this.currentLevel, 2.0);
                    break;
            }
        }


        const replaced = replaceBracketedNumbers(description, numbers);
        return replaced;
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
        const queryResult = this.__execQuery(`select distinct ${columnName} from magics`)[0];
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
