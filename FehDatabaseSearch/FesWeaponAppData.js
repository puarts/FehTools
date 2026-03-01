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
                ColumnType.hp,
                ColumnType.atk,
                ColumnType.slots,
            ];
            for (let columnType of visibleColumns) {
                this.__findColumnInfoByType(columnType).isVisible = true;
            }
        }

        this.nameToCharInfo = {};
        this.nameToDiscipleInfo = {};
        this.magicNameToMagiInfo = {};

        this.defaultSortCondition = "rarity desc, type";
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
        this.__initDict();

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
                this.nameToDiscipleInfo[name] = new DiscipleInfo(name, weaponType, classType);
            }
        }


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

                    // Replace slots entries that match weapon_skills.name with weapon_skills.description
                    const wsQueryResult = this.__execQuery("select name,description from weapon_skills");
                    if (wsQueryResult != null && wsQueryResult.length > 0) {
                        const wsResult0 = wsQueryResult[0];
                        const wsKeyToIndex = {};
                        for (let i = 0; i < wsResult0.columns.length; ++i) {
                            wsKeyToIndex[wsResult0.columns[i]] = i;
                        }

                        const nameToDesc = {};
                        for (const wsRow of wsResult0.values) {
                            const wsName = wsRow[wsKeyToIndex['name']];
                            const wsDesc = wsRow[wsKeyToIndex['description']];
                            nameToDesc[wsName] = wsDesc;
                        }

                        const weQuery = this.__execQuery("select name,slots from weapons_ex");
                        if (weQuery != null && weQuery.length > 0) {
                            const weResult0 = weQuery[0];
                            const weKeyToIndex = {};
                            for (let i = 0; i < weResult0.columns.length; ++i) {
                                weKeyToIndex[weResult0.columns[i]] = i;
                            }

                            let updateQueries = '';
                            for (const weRow of weResult0.values) {
                                const weName = weRow[weKeyToIndex['name']];
                                const slotsText = weRow[weKeyToIndex['slots']];
                                const parts = convertTextToArray(slotsText);
                                const newParts = parts.map(p => (p in nameToDesc) ? nameToDesc[p] : p);
                                const newSlots = '|' + newParts.join('|') + '|';
                                const escapedSlots = String(newSlots).replace(/'/g, "''");
                                const escapedName = String(weName).replace(/'/g, "''");
                                updateQueries += `update weapons_ex set slots='${escapedSlots}' where name='${escapedName}';`;
                            }

                            if (updateQueries !== '') {
                                this.__execQuery(updateQueries);
                            }
                        }
                    }
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
                else if (columnName === this.__getColumnName(ColumnType.exclusive)) {
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
                    const weaponIcon = getWeaponIconPath(discipleInfo.weaponType);
                    result += `<img src="${weaponIcon}" style='position: absolute; top:0;left:0;width:15px;height:15px'>`;
                    const classIcon = getClassIconPath(discipleInfo.class);
                    result += `<img src="${classIcon}" style='position: absolute; bottom:0;left:0;width:15px;height:15px'>`;
                    result += "</div>";
                    return result + `<div>${value}</div></div></a>`;
                }
                return value;
            };
        }

        const rarityCategory = this.__createSearchTextInfoCategoryByExistingValues(ColumnType.rarity, true);

        // まだ少ないのでデフォルトで全表示しておく
        for (const info of rarityCategory.searchTextInfos) {
            info.isEnabled = true;
        }

        this.__addSearchTextInfoCategories([
            this.__createSearchTextInfoCategoryByExistingValues(ColumnType.type, true),
            rarityCategory,
            this.__createSearchTextInfoCategory(
                "補正",
                this.__getColumnName(ColumnType.name),
                ['攻撃', '中庸', 'HP'],
                null,
                true),
        ]);

    }

    updateTableHeader() {
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
