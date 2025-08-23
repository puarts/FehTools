

const ColumnType = {
    name1: "名前",
    name2: "相手",
    init_point: "初期値",
    increment_point: "増加値",
    pair_end: "ペアエンド",
};

const HtmlColumnSuffix = "_html";

class AppData extends AppDataBase {
    constructor() {
        super("support_autogen");

        this.showsAllRowsDefault = true;

        for (let key in ColumnType) {
            let label = ColumnType[key];
            this.columnInfos.push(this.__createColumnInfo(label));
        }

        // 標準で表示しておく列
        {
            let column = this.__findColumnInfoByType(ColumnType.name1)
            column.isKeyColumn = true;
            let visibleColumns = [
                ColumnType.name1,
                ColumnType.name2,
                ColumnType.init_point,
                ColumnType.increment_point,
                ColumnType.pair_end,
            ];
            for (let columnType of visibleColumns) {
                this.__findColumnInfoByType(columnType).isVisible = true;
            }
        }
        this.sortColumn = "";
        this.speakerNameToCharInfo = {};
        this.titleToColor = {};
    }

    __createColumnInfo(typeValue, isVisible = false, isAvailableOnDatabase = true, isKeyColumn = false) {
        return createColumnInfoFromDict(
            ColumnType, typeValue, typeValue, isVisible, isAvailableOnDatabase, isKeyColumn);
    }

    __initDatabaseTable() {
        const charNames = [];
        {
            const queryResult = this.__execQuery("select name from char")[0];
            const keyToIndex = {};
            for (let i = 0; i < queryResult.columns.length; ++i) {
                keyToIndex[queryResult.columns[i]] = i;
            }
            const rows = queryResult.values;
            for (const row of rows) {
                const name = row[keyToIndex["name"]];
                charNames.push(name);
            }

            console.log(`${charNames.map(x => `name1="${x}"`).reverse().join(",")}`);
        }

        this.convertRowFunc = this.__convertTr;

        // 事前変換
        {
            let query = `update support_autogen set pair_end=case WHEN pair_end = 'true' THEN 'あり' ELSE 'なし' end;`;
            this.__execQuery(query);
        }

        // 検索条件の絞り込みUIの設定
        {

            const nameCategory = this.__createSearchTextInfoCategory("名前", this.__getColumnName(ColumnType.name1), charNames, null, true);

            let initPointCategory = this.__createSearchTextInfoCategory("初期値", this.__getColumnName(ColumnType.init_point), [
                "",
                `=0`,
                `>=1`,
                `>=10`,
                `>=20`,
                `>=30`,
            ],
                [
                    "指定なし",
                    "0",
                    "1以上",
                    "10以上",
                    "20以上",
                    "30以上",
                ]);
            initPointCategory.uiType = UiType.Radio;

            this.__addSearchTextInfoCategories([
                this.__createSearchTextInfoCategory("増加値", this.__getColumnName(ColumnType.increment_point),
                    ["0", "1", "2", "3", "4"]),
                initPointCategory,
                this.__createSearchTextInfoCategory("ペアエンド", this.__getColumnName(ColumnType.pair_end),
                    ["あり", "なし"]),
                nameCategory,
            ]);

        }
    }
    /**
     * @param  {HTMLElement} tr
     * @param  {string[]} values
     * @param  {string[]} columnNames
     */
    __convertTr(tr, values, columnNames) {
        let index = -1;
        for (; index < columnNames.length; ++index) {
            if (columnNames[index] == "pair_end") {
                break;
            }
        }
        if (index == -1) return;
        const pair_end = values[index];
        if (pair_end == "あり") {
            tr.style.background = "#ffeedd";
        }
    }
    __getColumnName(type) {
        return getDictKeyFromValue(ColumnType, type);
    }
    __findColumnInfoByType(type) {
        return this.__findColumnInfo(this.__getColumnName(type));
    }
    *__enumerateDbPaths() {
        yield g_dbRoot + "fe-blazing-blade.sqlite3";
    }
}
