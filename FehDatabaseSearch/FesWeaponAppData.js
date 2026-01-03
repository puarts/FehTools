

const ColumnType = {
    name: "名前",
    type: "種類",
    rarity: "レアリティ",
    hp: "HP",
    atk: "攻撃",
    slots: "スロット",
    exclusive: "装備制限",
};

const HtmlColumnSuffix = "_html";

class AppData extends AppDataBase {
    constructor() {
        super("weapons");

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
                ColumnType.rarity,
                ColumnType.hp,
                ColumnType.atk,
                ColumnType.slots,
                ColumnType.exclusive,
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

        this.defaultSortCondition = "type desc";
    }

    __initDatabaseTable() {

        this.__addSearchTextInfoCategories([
            this.__createSearchTextInfoCategoryByExistingValues(ColumnType.type, false),
            this.__createSearchTextInfoCategoryByExistingValues(ColumnType.rarity, false),
        ]);

    }

    updateTableHeader() {
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
        const queryResult = this.__execQuery(`select distinct ${columnName} from weapons`)[0];
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
