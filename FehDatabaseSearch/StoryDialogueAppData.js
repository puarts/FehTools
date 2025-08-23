

const ColumnType = {
    title: "部章節",
    book: "部",
    chapter: "章",
    part: "節",
    scene: "タイミング",
    speaker: "話者",
    dialogue: "台詞",
};

const HtmlColumnSuffix = "_html";


class AppData extends AppDataBase {
    constructor() {
        super("story_dialogues");

        for (let key in ColumnType) {
            let label = ColumnType[key];
            this.columnInfos.push(this.__createColumnInfo(label));
        }

        // 標準で表示しておく列
        {
            let column = this.__findColumnInfoByType(ColumnType.book)
            column.isKeyColumn = true;
            let visibleColumns = [
                ColumnType.title,
                ColumnType.speaker,
                ColumnType.dialogue,
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
        // 新規列の追加
        {
            const addColumns = [
                "title",
            ];

            let query = "";
            for (let column of addColumns) {
                query += `alter table story_dialogues add column ${column};`;
            }
            query += `UPDATE story_dialogues SET title = book || '部<br/>' || (CASE WHEN chapter = '戦渦' THEN '戦渦<br>' ELSE chapter || '章<br>' END) || part || '節';`;
            this.__execQuery(query);
        }

        // 話者のキャラクター情報の辞書作成
        const speakers = [];
        {
            const queryResult = this.dbs[0].exec("select distinct speaker from story_dialogues")[0];
            const rows = queryResult.values;
            for (const row of rows) {
                const speaker = row[0];
                speakers.push(speaker);
            }

            const names = speakers.join("\" or name=\"");
            const condition = `(name="${names}") and series="|ヒーローズ|"`;
            const charInfos = createCharacterInfoListFromDb(this.dbs[1], `where ${condition}`);
            for (const charInfo of charInfos) {
                this.speakerNameToCharInfo[charInfo.name] = charInfo;
            }
        }

        // ビューへの変換関数
        {
            this.convertCellFunc = (value, columnName) => {
                if (columnName == "title") {
                    return `<div style='text-align:center;padding:5px;min-width:50px'>${value}</div>`;
                }
                else if (columnName == "speaker") {
                    let result = `<div style='font-size:12px;text-align:center;min-width:72px'>`;
                    if (value in this.speakerNameToCharInfo) {
                        /** @type {CharacterInfo} */
                        const charInfo = this.speakerNameToCharInfo[value];
                        const thumbSize = 50;
                        result += `<img src="${charInfo.imagePath}" width="${thumbSize}" height="${thumbSize}"><br/>`;
                    }
                    return result + `${value}</div>`;
                }
                else if (columnName == "dialogue") {
                    return `<div class="dialogue">${value}</div>`;
                }
                return value;
            };

            this.convertRowFunc = this.__convertTr;
            {
                const queryResult = this.dbs[0].exec("select distinct title from story_dialogues")[0];
                const rows = queryResult.values;
                const titles = [];
                for (const row of rows) {
                    const title = row[0];
                    titles.push(title);
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
                for (let i = 0; i < titles.length; ++i) {
                    const title = titles[i];
                    const color = colors[i % colors.length];
                    this.titleToColor[title] = color;
                }
            }
        }

        // 検索条件の絞り込みUIの設定
        {
            const queryResult = this.__execQuery("select distinct book from story_dialogues")[0];
            const keyToIndex = {};
            for (let i = 0; i < queryResult.columns.length; ++i) {
                keyToIndex[queryResult.columns[i]] = i;
            }
            const rows = queryResult.values;
            const bookValues = [];
            const bookLabels = [];
            for (const row of rows) {
                const book = row[keyToIndex["book"]];
                bookValues.push(book);
                bookLabels.push(`${book}部`);
            }

            const bookCategory = this.__createSearchTextInfoCategory(
                "部",
                this.__getColumnName(ColumnType.book),
                bookValues,
                bookLabels,
                true);
            this.__addSearchTextInfoCategories([
                bookCategory,
                this.__createSearchTextInfoCategory("章", this.__getColumnName(ColumnType.chapter),
                    ["Preface", "Prologue", "='1'", "='2'", "='3'", "='4'", "='5'", "='6'", "='7'", "='8'", "='9'", "='10'", "='11'", "='12'", "='13'", "='戦渦'"],
                    ["プロローグ", "序章", "1章", "2章", "3章", "4章", "5章", "6章", "7章", "8章", "9章", "10章", "11章", "12章", "13章", "戦渦"],
                    true
                ),
                this.__createSearchTextInfoCategory("節", this.__getColumnName(ColumnType.part),
                    ["='1'", "='2'", "='3'", "='4'", "='5'"],
                    ["1節", "2節", "3節", "4節", "5節"],
                    true
                ),
            ]);

            // bookCategory.searchTextInfos[bookCategory.searchTextInfos.length - 1].isEnabled = true;
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
            if (columnNames[index] == "title") {
                break;
            }
        }
        if (index == -1) return;

        const title = values[index];
        if (title in this.titleToColor) {
            tr.style.background = this.titleToColor[title];
        }
    }
    __getColumnName(type) {
        return getDictKeyFromValue(ColumnType, type);
    }
    __findColumnInfoByType(type) {
        return this.__findColumnInfo(this.__getColumnName(type));
    }
    *__enumerateDbPaths() {
        yield g_dbRoot + "feh-story.sqlite3";
        yield g_dbRoot + "feh-original_heroes.sqlite3";
    }
}
