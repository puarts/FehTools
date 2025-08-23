

const ColumnType = {
    date: "日付",
    month: "月",
    type: "種類",
    detail: "詳細",
};

const HtmlColumnSuffix = "_html";

function getDayOfWeek(dateString) {
    const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];
    const date = new Date(dateString);
    const dayOfWeekIndex = date.getDay(); // 曜日を表す数値（0が日曜、1が月曜...）を取得
    return daysOfWeek[dayOfWeekIndex]; // 曜日を表す文字列を取得して返す
}

class AppData extends AppDataBase {
    constructor() {
        super("history");

        for (let key in ColumnType) {
            let label = ColumnType[key];
            this.columnInfos.push(this.__createColumnInfo(label));
        }

        // 標準で表示しておく列
        {
            let column = this.__findColumnInfoByType(ColumnType.date)
            column.isKeyColumn = true;
            let visibleColumns = [
                ColumnType.date,
                ColumnType.type,
                ColumnType.detail,
            ];
            for (let columnType of visibleColumns) {
                this.__findColumnInfoByType(columnType).isVisible = true;
            }
        }
        this.sortColumn = "date";
        this.yearToColor = {};
    }

    __createColumnInfo(typeValue, isVisible = false, isAvailableOnDatabase = true, isKeyColumn = false) {
        return createColumnInfoFromDict(
            ColumnType, typeValue, typeValue, isVisible, isAvailableOnDatabase, isKeyColumn);
    }

    __initDatabaseTable() {
        // 新規列の追加
        {
            const addColumns = [
                "detail",
                "month",
            ];

            let query = "";
            for (let column of addColumns) {
                query += `alter table history add column ${column};`;
            }
            this.__execQuery(query);
        }

        // アプデ日を武器錬成日から追加
        {
            let updateQuery = "";
            const queryResult = this.dbs[2].exec("select distinct refined_date from skills where refined_date is not null")[0];
            const rows = queryResult.values;
            for (const row of rows) {
                const date = row[0];
                updateQuery += `INSERT INTO history (date, type, thumb, url) VALUES ('${date}', 'アップデート', '', '');`
            }

            this.__execQuery(updateQuery);
        }

        // ガチャ情報を追加
        {
            let updateQuery = "";
            const queryResult = this.dbs[1].exec("select name,type,begin_date from gacha where type='新英雄' or type='超英雄' or type='伝承英雄' or type='神階英雄' or type='英雄祭' or type='W超英雄' or type='伝承英雄Remix'")[0];
            const rows = queryResult.values;
            for (const row of rows) {
                const name = row[0];
                const type = row[1];
                const date = row[2];
                updateQuery += `INSERT INTO history (date, type, thumb, url, detail) VALUES ('${date}', '${type}', '', '', '${name}');`
            }

            this.__execQuery(updateQuery);
        }

        // 月を設定
        {
            const query = `update history set month=SUBSTR(date, 6, 2)`;
            this.__execQuery(query);
        }

        {
            const query = `update history set type='|'||type||'|'`;
            this.__execQuery(query);
        }

        // ビューへの変換関数
        {
            this.convertCellFunc = (value, columnName) => {
                if (columnName == "date") {
                    const dayOfWeek = getDayOfWeek(value);
                    return `${value} (${dayOfWeek})`;
                }
                return value;
            };

            this.convertRowFunc = this.__convertTr;

            {
                const queryResult = this.dbs[0].exec("select distinct SUBSTR(date, 0, 5) from history")[0];
                const rows = queryResult.values;
                const years = [];
                for (const row of rows) {
                    const year = row[0];
                    years.push(year);
                }
                const colors = [
                    "#fff",
                    "#ffe",
                    "#fee",
                    "#fef",
                    "#eee",
                    "#eef",
                    "#eff",
                    "#efe",
                ];
                for (let i = 0; i < years.length; ++i) {
                    const year = years[i];
                    const color = colors[i % colors.length];
                    this.yearToColor[year] = color;
                }
            }
        }


        // 検索条件の絞り込みUIの設定
        {
            const typeCategory = this.__createTypeCatetory();
            this.__addSearchTextInfoCategories([
                typeCategory,
                this.__createMonthCatetory(),
            ]);

            // for (const info of typeCategory.searchTextInfos) {
            //     info.isEnabled = true;
            // }
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
            if (columnNames[index] == "date") {
                break;
            }
        }
        if (index == -1) return;

        const date = values[index];
        const year = date.substring(0, 4);
        if (year in this.yearToColor) {
            tr.style.background = this.yearToColor[year];
        }
    }
    __createMonthCatetory() {
        const months = [];
        for (let i = 1; i <= 12; ++i) {
            months.push(i.toString().padStart(2, '0'));
        }

        const categ = this.__createSearchTextInfoCategory("月", this.__getColumnName(ColumnType.month), months);
        categ.isBulkControlEnabled = true;
        return categ;
    }
    __createTypeCatetory() {
        const queryResult = this.__execQuery("select distinct type from history")[0];
        const keyToIndex = {};
        for (let i = 0; i < queryResult.columns.length; ++i) {
            keyToIndex[queryResult.columns[i]] = i;
        }
        const rows = queryResult.values;
        const types = [];
        for (const row of rows) {
            const type = row[keyToIndex["type"]];
            types.push(type);
        }

        const categ = this.__createSearchTextInfoCategory(
            "種類",
            this.__getColumnName(ColumnType.type),
            types,
            types.map(x => x.substring(1, x.length - 1))
        );
        categ.isBulkControlEnabled = true;
        return categ;
    }

    __getColumnName(type) {
        return getDictKeyFromValue(ColumnType, type);
    }
    __findColumnInfoByType(type) {
        return this.__findColumnInfo(this.__getColumnName(type));
    }
    *__enumerateDbPaths() {
        yield g_dbRoot + "feh.sqlite3";
        yield g_dbRoot + "feh-gacha.sqlite3";
        yield g_dbRoot + "feh-skills.sqlite3";
    }
}
