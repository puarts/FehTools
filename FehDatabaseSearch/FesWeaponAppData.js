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
        super("weapons_ex");

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

        // weapons_ex テーブルを weapons テーブルから作成
        {
            // create empty weapons_ex with hp and atk as integer
            const queryResult = this.__execQuery("select * from weapons");
            if (queryResult == null || queryResult.length == 0) {
                // fallback: create table with hp and atk integer if weapons table absent
                let sql = "drop table if exists weapons_ex;";
                sql += "create table weapons_ex (" +
                    "name, type, rarity, hp integer, atk integer, slots, exclusive" +
                    ");";
                this.__execQuery(sql);
            } else {
                const result = queryResult[0];
                const cols = result.columns;
                const keyToIndex = {};
                for (let i = 0; i < cols.length; ++i) {
                    keyToIndex[cols[i]] = i;
                }

                // build create table statement with hp and atk as integer types
                const colDefs = cols.map(c => {
                    if (c === 'hp' || c === 'atk') {
                        return `${c} integer`;
                    }
                    return `${c}`;
                });

                let sql = "drop table if exists weapons_ex;";
                sql += `create table weapons_ex (${colDefs.join(',')});`;

                // start with empty table
                this.__execQuery(sql);

                // suffixes for splitted entries
                const suffixes = ['攻撃', '中庸', 'HP'];

                const rows = result.values;
                let insertQueries = '';

                for (const row of rows) {
                    const originalName = row[keyToIndex['name']];
                    const hpText = row[keyToIndex['hp']];
                    const atkText = row[keyToIndex['atk']];

                    const hpArray = convertTextToArray(hpText);
                    const atkArray = convertTextToArray(atkText);

                    const count = Math.min(hpArray.length, atkArray.length, suffixes.length);
                    const effectiveCount = count > 0 ? count : Math.max(hpArray.length, atkArray.length, suffixes.length);

                    for (let i = 0; i < effectiveCount; ++i) {
                        const hpVal = hpArray[i] ?? '';
                        const atkVal = atkArray[i] ?? '';
                        const suffix = suffixes[i] ?? '';
                        const newName = `${originalName} ${suffix}`;

                        // build insert values for all columns
                        const values = [];
                        for (const col of cols) {
                            let val = row[keyToIndex[col]];
                            if (col == 'name') {
                                val = newName;
                            } else if (col == 'hp') {
                                // use hpVal (from split) for weapons_ex; integer or NULL
                                if (hpVal === '' || hpVal == null) {
                                    values.push('NULL');
                                    continue;
                                } else {
                                    const num = Number(hpVal);
                                    if (Number.isNaN(num)) {
                                        values.push('NULL');
                                        continue;
                                    } else {
                                        values.push(String(num));
                                        continue;
                                    }
                                }
                            } else if (col == 'atk') {
                                if (atkVal === '' || atkVal == null) {
                                    values.push('NULL');
                                    continue;
                                } else {
                                    const num = Number(atkVal);
                                    if (Number.isNaN(num)) {
                                        values.push('NULL');
                                        continue;
                                    } else {
                                        values.push(String(num));
                                        continue;
                                    }
                                }
                            }
                            if (val == null) val = '';
                            // escape single quotes
                            const escaped = String(val).replace(/'/g, "''");
                            values.push(`'${escaped}'`);
                        }

                        insertQueries += `INSERT INTO weapons_ex (${cols.join(',')}) VALUES (${values.join(',')});`;
                    }
                }

                if (insertQueries !== '') {
                    this.__execQuery(insertQueries);
                }
            }
        }


        // ビューへの変換関数
        {
            this.convertCellFunc = (value, columnName, record) => {
                if (
                    columnName === this.__getColumnName(ColumnType.hp) ||
                    columnName === this.__getColumnName(ColumnType.atk)
                ) {
                    return `+${value}％`;
                }
                else if (columnName === this.__getColumnName(ColumnType.slots)) {
                    let result = '<ul>';
                    const slots = convertTextToArray(value);
                    for (const slot of slots) {
                        result += `<li>${slot}</li>`;
                    }
                    result += '</ul>';
                    return result;
                }
                return value;
            };
        }


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
        const queryResult = this.__execQuery(`select distinct ${columnName} from weapons_ex`)[0];
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
