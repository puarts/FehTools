// 遅延読み込みしない方がパフォーマンス有利だった(多分遅延読み込みするための監視イベント付与が重い)
const g_isLazyLoadImageEnabled = false;
const g_dbRoot = "/db/";

function drawElementToCanvas(sourceElem, canvas) {
    let serialized = new XMLSerializer().serializeToString(sourceElem);

    const xmlns = serialized.match(/xmlns="(.+?)"/)[1];
    serialized = serialized.replace(new RegExp(`xmlns="${xmlns}"`), "");

    serialized = serialized.replaceAll("https://fire-emblem.fun", "")
    serialized = `<html><head><link rel=\"stylesheet\" href=\"/css/main.css\"></head><body>${serialized}</body></html>`;

    // レンダリング時に上下左右に隙間が入ってしまうので、その分をcanvasサイズに加味
    const paddingW = 10;
    const paddingH = 15;
    const style = getComputedStyle(sourceElem);

    canvas.width = Number(style.width.replace("px", "")) + paddingW * 2;
    canvas.height = Number(style.height.replace("px", "")) + paddingH * 2;
    console.log(serialized);

    return rasterizeHTML.drawHTML(serialized, canvas);
}

function saveCanvasAsPng(sourceElem, canvas, saveImageFileName) {
    drawElementToCanvas(sourceElem, canvas).then(function (result) {
        console.log(result);
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function () {
            const a = document.createElement('a');
            a.href = window.URL.createObjectURL(xhr.response);
            a.download = saveImageFileName;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            a.remove();
        };

        const canvasImage = canvas.toDataURL('image/png');

        xhr.open('GET', canvasImage); // This is to download the canvas Image
        xhr.send();
    }, function (e) {
        console.log('An error occured:', e);
    });
}

function saveAsImage(id) {
    const sourceElem = document.getElementById(id);
    const canvas = document.createElement('canvas');
    saveCanvasAsPng(sourceElem, canvas, 'result.png');
}

class ScopedStopwatch {
    constructor(logFunc) {
        this._logFunc = logFunc;
        this._startTime = Date.now();
    }

    dispose() {
        const endTime = Date.now();
        var diff = endTime - this._startTime;
        this._logFunc(diff);
    }
}
function using(disposable, func) {
    const result = func();
    disposable.dispose();
    return result;
}
function getDictKeyFromValue(dict, value) {
    return Object.keys(dict).find(key => dict[key] === value);
}

function convertTextToArray(input) {
    if (input == null) {
        return [];
    }

    return input.split("|").filter(function (el) {
        return el != null && el != "";
    });
}

function getDateStringAnyDaysAgo(goBackDays) {
    let date = new Date();
    date.setDate(date.getDate() - goBackDays);
    return date.getFullYear()
        + '-' + ('0' + (date.getMonth() + 1)).slice(-2)
        + '-' + ('0' + date.getDate()).slice(-2);
}

class RangeInfo {
    constructor(beginIndex) {
        this.beginIndex = beginIndex;
    }
}

class ColumnInfo {
    constructor(
        name,
        label,
        isVisible = true,
        isAvailableOnDatabase = true, isKeyColumn = false
    ) {
        this.name = name;
        this.displayColumnName = name;
        this.label = label;
        this.isAvailableOnDatabase = isAvailableOnDatabase;
        this.isVisible = isVisible;
        this.isKeyColumn = isKeyColumn;
    }
}

function createColumnInfoFromDict(
    typeDict, columnType,
    label, isVisible = true, isAvailableOnDatabase = true, isKeyColumn = false
) {
    return new ColumnInfo(
        getDictKeyFromValue(typeDict, columnType),
        label, isVisible, isAvailableOnDatabase, isKeyColumn);
}


function removeAllChildElements(elem) {
    while (elem.firstChild) {
        elem.removeChild(elem.lastChild);
    }
}

function boolToInt(value) {
    if (value) {
        return 1;
    }
    else {
        return 0;
    }
}

function intToBool(value) {
    if (value == 0) {
        return false;
    }
    else {
        return true;
    }
}

const SearchType = {
    Include: 0,
    Exclude: 1,
};

const UiType = {
    Checkbox: 0,
    Radio: 1,
};

const SearchTypeOptions = [
    { id: SearchType.Include, label: "含む" },
    { id: SearchType.Exclude, label: "含まない" },
];

const LogicalOperationType = {
    and: 0,
    or: 1,
};

const LogicalOperationTypeOptions = [
    { id: LogicalOperationType.and, label: "かつ" },
    { id: LogicalOperationType.or, label: "または" },
];

const ValueDelimiter = '|';
const ValueDelimiter2 = '^';
const ElemDelimiter = ':';
const ColumnTypeAll = "all";

class SearchTextInfo {
    constructor() {
        this.label = "";
        this.searchText = "";
        this.targetColumn = ColumnTypeAll;
        this.searchType = SearchType.Include;
        this.logicalOperationType = LogicalOperationType.and;
        this.isEnabled = true;
    }

    fromString(value) {
        let splited = value.split(ValueDelimiter);
        let i = 0;
        if (splited[i] != undefined) { this.searchText = splited[i]; ++i; }
        if (splited[i] != undefined) { this.targetColumn = splited[i]; ++i; }
        if (Number.isInteger(Number(splited[i]))) { this.searchType = Number(splited[i]); ++i; }
        if (Number.isInteger(Number(splited[i]))) { this.logicalOperationType = Number(splited[i]); ++i; }
    }

    toString() {
        return this.searchText
            + ValueDelimiter + this.targetColumn
            + ValueDelimiter + this.searchType
            + ValueDelimiter + this.logicalOperationType
            // カテゴリを復元しないので、isEnabled は一旦無視しておく
            ;
    }

    get isEmpty() {
        return this.trimmedSearchText.length == 0;
    }

    /**
     * @returns {string}
     */
    get trimmedSearchText() {
        return this.searchText.trim();
    }

    /**
     * @returns {boolean}
     */
    get isValid() {
        return this.isEnabled && !this.isEmpty;
    }

    /**
     * @returns {string[]}
     */
    parseToWords() {
        return this.trimmedSearchText.split(" ");
    }
}

class SearchCategory {
    constructor(label, isBulkControlEnabled = true) {
        this.label = label;
        this.uiType = UiType.Checkbox;
        this.searchTextInfos = [];
        this.isBulkControlEnabled = isBulkControlEnabled;
        this.selectedSearchTextInfoIndex = 0;
    }

    addSearchTextInfo(info) {
        this.searchTextInfos.push(info);
    }
}

class AppDataBase {
    constructor(tableName) {
        this.tableName = tableName;
        this.initMessage = "初期化中です。お待ち下さい。";
        this.queryMilliseconds = 0;
        this.db = null;
        this.dbs = [];
        this.queryResult = null;
        this.isCustomOrderEnabled = false;
        this.showsAllRowsDefault = false;

        /** @type {SearchTextInfo[]} */
        this.searchTextInfos = [
            new SearchTextInfo(),
        ];
        if (this.searchTextInfos.length > 1) {
            this.searchTextInfos[1].searchType = SearchType.Exclude;
        }
        this.sortOrder = "desc";

        this.isRemoveConditionButtonDisabled = true;
        this.isAutoSearchEnabled = true;
        this.sortColumn = ColumnTypeAll;

        this.columnInfos = [
            new ColumnInfo(ColumnTypeAll, "全て", false, false)
        ];
        this.searchTextInfoCategories = [];

        this.currentQuery = "";
        this.currentSetting = "";
        this.currentUrl = "";

        this.convertCellFunc = null;
        this.convertRowFunc = null;

        this.__updateRemoveConditionButtonDisabled();
    }

    toString() {
        let searchTextInfoString = this.__searchTextInfosToString();
        let columnVisString = this.__columnVisibilitiesToString();
        return searchTextInfoString
            + ValueDelimiter2 + columnVisString
            + ValueDelimiter2 + this.sortColumn
            + ValueDelimiter2 + this.sortOrder;
    }

    __searchTextInfosToString() {
        let infoTextList = [];
        for (let info of this.searchTextInfos) {
            infoTextList.push(info.toString());
        }

        // カテゴリは面倒なので searchTextInfos に変換する
        for (let categ of this.searchTextInfoCategories) {
            let searchTextInfo = new SearchTextInfo();
            searchTextInfo.fromString(categ.searchTextInfos[0].toString());
            searchTextInfo.logicalOperationType = LogicalOperationType.and;
            searchTextInfo.searchText = "";
            for (let info of categ.searchTextInfos) {
                if (info.isEnabled) {
                    searchTextInfo.searchText += info.searchText + " ";
                }
            }
            if (searchTextInfo.searchText.length > 0) {
                infoTextList.push(searchTextInfo.toString());
            }
        }
        return infoTextList.join(ElemDelimiter);
    }

    __searchTextInfosFromString(value) {
        let searchTextInfoStringElems = value.split(ElemDelimiter);
        this.__addSearchTextInfos(searchTextInfoStringElems.length);
        for (let i = 0; i < searchTextInfoStringElems.length; ++i) {
            let elem = searchTextInfoStringElems[i];
            this.searchTextInfos[i].fromString(elem);
        }
    }

    __columnVisibilitiesToString() {
        let columnVisibilities = [];
        for (let info of this.columnInfos) {
            columnVisibilities.push(boolToInt(info.isVisible));
        }

        return columnVisibilities.join(ElemDelimiter);
    }

    __columnVisibilitiesFromString(value) {
        let elems = value.split(ElemDelimiter);
        for (let i = 0; i < elems.length; ++i) {
            this.columnInfos[i].isVisible = intToBool(Number(elems[i]));
        }
    }

    fromString(value) {
        let splited = value.split(ValueDelimiter2);
        this.__searchTextInfosFromString(splited[0]);
        this.__columnVisibilitiesFromString(splited[1]);
        this.sortColumn = splited[2];
        this.sortOrder = splited[3];
    }

    toCompressedString() {
        return LZString.compressToEncodedURIComponent(this.toString());
    }

    fromCompressedString(value) {
        // this.fromString(LZString.decompressFromEncodedURIComponent(value));
    }

    __findColumnInfoByDisplayColumnName(columnName) {
        for (let info of this.columnInfos) {
            if (info.displayColumnName == columnName) {
                return info;
            }
        }
        return null;
    }

    __findColumnInfo(columnName) {
        for (let info of this.columnInfos) {
            if (info.name == columnName) {
                return info;
            }
        }
        return null;
    }

    isSearchTextEmpty() {
        for (let info of this.searchTextInfos) {
            if (info.isValid) {
                return false;
            }
        }

        for (let category of this.searchTextInfoCategories) {
            switch (category.uiType) {
                case UiType.Checkbox:
                    for (let info of category.searchTextInfos) {
                        if (info.isValid) {
                            return false;
                        }
                    }
                    break;
                case UiType.Radio:
                    var info = category.searchTextInfos[category.selectedSearchTextInfoIndex];
                    if (!info.isEmpty) {
                        return false;
                    }
                    break;
                default:
                    throw new Error("Unexpected UiType");
            }
        }

        return true;
    }

    __parseColumnNameToLabel(columnName) {
        let info = this.columnInfos.find(x => x.displayColumnName == columnName);
        if (info == null) {
            return columnName;
        }

        return info.label;
    }

    setAllTextSearchInfoEnabledInCategory(category, isEnabled) {
        for (let info of category.searchTextInfos) {
            info.isEnabled = isEnabled;
        }
    }

    showAllColumns() {
        for (let columnInfo of this.__enumerateColumnInfos(x => !x.isKeyColumn)) {
            columnInfo.isVisible = true;
        }
    }

    hideAllColumns() {
        for (let columnInfo of this.__enumerateColumnInfos(x => !x.isKeyColumn)) {
            columnInfo.isVisible = false;
        }
    }

    clearSearchTexts() {
        for (let info of this.searchTextInfos) {
            info.searchText = "";
        }
    }

    __switchSortOrder() {
        if (this.sortOrder == "desc") {
            this.sortOrder = "asc";
        }
        else {
            this.sortOrder = "desc";
        }
    }
    __setSortColumn(columnName) {
        if (this.sortColumn == columnName) {
            this.__switchSortOrder();
        }
        else {
            this.sortColumn = columnName;
        }
    }

    __createSearchTextInfoCategory(label, targetColumn, searchTexts, labels = null, isBulkControlEnabled = false) {
        const category = new SearchCategory(label, isBulkControlEnabled);
        for (const searchText of searchTexts) {
            let searchTextInfo = new SearchTextInfo();
            searchTextInfo.targetColumn = targetColumn;
            searchTextInfo.searchText = String(searchText);
            searchTextInfo.label = String(searchText);
            if (labels != null) {
                let index = searchTexts.indexOf(searchText);
                searchTextInfo.label = labels[index];
            }
            searchTextInfo.isEnabled = false;
            searchTextInfo.logicalOperationType = LogicalOperationType.or;
            category.addSearchTextInfo(searchTextInfo);
        }
        return category;
    }

    __addSearchTextInfoCategories(categories) {
        for (let category of categories) {
            this.searchTextInfoCategories.push(category);
        }
    }

    __addColumns(columns) {
        for (let columnInfo of columns) {
            this.columnInfos.push(columnInfo);
        }
    }
    __updateRemoveConditionButtonDisabled() {
        if (this.searchTextInfos.length == 1) {
            this.isRemoveConditionButtonDisabled = true;
        }
        else {
            this.isRemoveConditionButtonDisabled = false;
        }
    }
    __clearInitMessage() {
        this.initMessage = "初期化が完了しました。使用できます。";
    }

    setInitMessage(initMilliseconds) {
        this.__clearInitMessage();
        this.initMessage += `(初期化${initMilliseconds / 1000}秒)`;
    }

    __addSearchTextInfos(minLength) {
        while (this.searchTextInfos.length < minLength) {
            this.searchTextInfos.push(new SearchTextInfo());
        }
        this.__updateRemoveConditionButtonDisabled();
    }

    addSearchTextInfo() {
        this.searchTextInfos.push(new SearchTextInfo());
        this.__updateRemoveConditionButtonDisabled();
    }

    removeSearchTextInfo() {
        this.searchTextInfos.pop();
        this.__updateRemoveConditionButtonDisabled();
    }


    __isTargetColumnAvailableOnDatabase(searchTextInfo) {
        let info = this.__findColumnInfo(searchTextInfo.targetColumn);
        return info.isAvailableOnDatabase;
    }

    updateQueryResultTable(table) {
        using(new ScopedStopwatch(x => this.queryMilliseconds = x), () => {
            if (!this.showsAllRowsDefault && this.isSearchTextEmpty()) {
                this.clearQueryResult();
            }
            else {
                let query = this.createQuery();
                console.log(query);
                this.currentQuery = query;
                let result = this.execQuery(query);
            }

            this.__updateUrl(table.id);
            this.rebuildTableFromQueryResult(table);
        });
    }

    __updateUrl(tableId) {
        this.currentSetting = this.toString();
        this.currentUrl = `https://fire-emblem.fun/?pid=${this.__getPageId()}&s=`
            + LZString.compressToEncodedURIComponent(this.currentSetting) + `#${tableId}`;
    }

    rebuildTableFromQueryResult(table) {
        removeAllChildElements(table);
        if (this.queryResult == null || this.queryResult.length == 0) {
            let row = document.createElement("tr");
            table.appendChild(row);
            let td = document.createElement("td");
            row.appendChild(td);
            td.innerHTML = "ここに検索結果が表示されます。";
            return;
        }

        let headerRow = document.createElement("tr");
        headerRow.setAttribute("style", "text-align:center");
        table.appendChild(headerRow);
        const columns = this.queryResult[0].columns;
        const records = this.queryResult[0].values;
        for (let column of columns) {
            let th = document.createElement("th");
            th.setAttribute("style", "padding:0;");
            this.__createTableHeaderToButton(column, th, table);
            // let sortButton = this.__createTableHeaderButton(column, table);
            // th.appendChild(sortButton);
            headerRow.appendChild(th);
        }

        for (let i = 0; i < records.length; ++i) {
            const record = records[i];
            const tr = document.createElement("tr");
            if (this.convertRowFunc != null) {
                this.convertRowFunc(tr, record, columns);
            }

            table.appendChild(tr);
            for (let j = 0; j < record.length; ++j) {
                const cell = record[j];
                const column = columns[j];
                const td = document.createElement("td");
                tr.appendChild(td);
                td.innerHTML = this.convertCellFunc != null ? this.convertCellFunc(cell, column) : cell;
            }
        }

        if (g_isLazyLoadImageEnabled && this.__isImageAvailableInTable()) {
            this.__loadLazyImages(table);
        }
    }

    __createTableHeaderToButton(columnName, th, table) {
        let label = this.__parseColumnNameToLabel(columnName);
        th.textContent = label;
        th.addEventListener("mouseout", () => {
            th.style.background = '';
        });
        th.addEventListener("mouseover", () => {
            th.style.background = 'white';
            th.style.cursor = 'default';
        });
        this.__addClickSortEvent(th, columnName, table);
    }
    __createTableHeaderButton(columnName, table) {
        let label = this.__parseColumnNameToLabel(columnName);
        let input = document.createElement("input");
        input.type = "button";
        input.value = label;
        input.setAttribute("style", "width:100%;height:100%;white-space:normal");
        this.__addClickSortEvent(input, columnName, table);
        return input;
    }

    __addClickSortEvent(elem, columnName, table) {
        elem.addEventListener("click", () => {
            let info = this.columnInfos.find(x => x.displayColumnName == columnName);
            if (info == null) {
                return;
            }
            this.__setSortColumn(info.name);
            this.updateQueryResultTable(table);
        });
    }

    /// オーバーライドする用
    __isImageAvailableInTable() {
        return false;
    }


    __loadLazyImages(rootElem) {
        let lazyImages = [].slice.call(rootElem.querySelectorAll("img.lazy"));
        if ("IntersectionObserver" in window) {
            let lazyImageObserver = new IntersectionObserver(function (entries, observer) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        let lazyImage = entry.target;
                        if (lazyImage.tagName === "IMG") {
                            lazyImage.src = lazyImage.dataset.src;
                            if (typeof lazyImage.dataset.srcset === "undefined") { } else {
                                lazyImage.srcset = lazyImage.dataset.srcset;
                            }
                        }
                        lazyImage.classList.remove("lazy");
                        lazyImageObserver.unobserve(lazyImage);
                    }
                });
            });

            lazyImages.forEach(function (lazyImage) {
                lazyImageObserver.observe(lazyImage);
            });
        } else {
            // Possibly fall back to a more compatible method here
        }
    }

    get isResultEmpty() {
        return this.queryResult == null || this.queryResult.length == 0;
    }

    clearQueryResult() {
        this.queryResult = null;
    }

    __createTextOfQueryColumnNames() {
        let names = [];
        for (let info of this.__enumerateColumnInfos(x => x.isAvailableOnDatabase && x.isVisible)) {
            names.push(info.displayColumnName);
        }
        return names.join(",");
    }

    createQuery() {
        let columnNameText = this.__createTextOfQueryColumnNames();
        let query = `select ${columnNameText} from ${this.tableName}`;
        let isFirstCondition = true;
        let customOrderCondition = "";

        let conditionsText = "";
        for (let info of this.searchTextInfos) {
            if (!info.isValid) {
                continue;
            }
            if (this.isCustomOrderEnabled && customOrderCondition === "") {
                if (info.targetColumn !== ColumnTypeAll) {
                    let columnInfo = this.columnInfos.find(x => x.name == info.targetColumn);
                    let searchTexts = info.parseToWords();
                    customOrderCondition = this.__getOrderBySpecifiedOrderCondtion(columnInfo.name, searchTexts);
                }
            }

            let condition = this.__createConditionFromSearchTextInfo(info);

            if (!isFirstCondition) {
                let op = getDictKeyFromValue(LogicalOperationType, info.logicalOperationType);
                condition = ` ${op} ${condition}`;
            }

            conditionsText += condition;
            isFirstCondition = false;
        }



        for (let category of this.searchTextInfoCategories) {
            let categoryCondition = "";
            switch (category.uiType) {
                case UiType.Checkbox:
                    let isCategoryFirstCondition = true;
                    for (let info of category.searchTextInfos) {
                        if (!info.isValid) {
                            continue;
                        }
                        let condition = this.__createConditionFromSearchTextInfo(info);

                        if (!isCategoryFirstCondition) {
                            let op = getDictKeyFromValue(LogicalOperationType, info.logicalOperationType);
                            condition = ` ${op} ${condition}`;
                        }

                        categoryCondition += condition;
                        isCategoryFirstCondition = false;
                    }
                    break;
                case UiType.Radio:
                    var info = category.searchTextInfos[category.selectedSearchTextInfoIndex];
                    if (!info.isEmpty) {
                        categoryCondition = this.__createConditionFromSearchTextInfo(info);
                    }
                    break;
                default:
                    throw new Error("Unexpected UiType");
            }

            if (categoryCondition != "") {
                categoryCondition = `(${categoryCondition})`;
                if (!isFirstCondition) {
                    let op = getDictKeyFromValue(LogicalOperationType, LogicalOperationType.and);
                    categoryCondition = ` ${op} ${categoryCondition}`;
                }
                conditionsText += `${categoryCondition}`;
                isFirstCondition = false;
            }
        }

        if (conditionsText != "") {
            query += ` where ${conditionsText}`;
        }

        if (customOrderCondition != "") {
            query = query + ` order by ${customOrderCondition}`;
        }
        else if (this.sortColumn != "") {
            const sortColumnInfo = this.__getSortColumnInfo();
            if (sortColumnInfo != null) {
                query = query + ` order by ${sortColumnInfo.name} ${this.sortOrder}`;
            }
        }

        return this.__createQueryPostProcess(query);
    }

    /// クエリ生成のポスト処理。派生クラスでオーバーライドします。
    __createQueryPostProcess(query) {
        return query;
    }

    __getSortColumnInfo() {
        return this.columnInfos.find(x => x.name == this.sortColumn);
    }

    /**
     * @param  {SearchTextInfo} searchTextInfo
     * @returns {string}
     */
    __createConditionFromSearchTextInfo(searchTextInfo) {
        let notOperation = "";
        if (searchTextInfo.searchType == SearchType.Exclude) {
            notOperation = "not ";
        }

        if (this.__isTargetColumnAvailableOnDatabase(searchTextInfo)) {
            let columnInfo = this.columnInfos.find(x => x.name == searchTextInfo.targetColumn);
            let searchTexts = searchTextInfo.parseToWords();
            let condition = this.__getQueryCondition(columnInfo.name, searchTexts);
            return `${notOperation} (${condition})`;
        }
        else {
            if (searchTextInfo.targetColumn == ColumnTypeAll) {
                return `${notOperation} (${this.__createConditionToSearchAllColumns(searchTextInfo.parseToWords())})`;
            }
            else {
                throw new Error("Unexpected else.");
            }
        }
    }

    execQuery(query) {
        this.queryResult = this.__execQuery(query);
        return this.queryResult;
    }

    __execQuery(query) {
        if (this.db == null) {
            return null;
        }

        const isQueryLogEnabled = false;
        if (isQueryLogEnabled) {
            const maxDisplayQueryLength = 200;
            console.log(query.substr(0, query.length > maxDisplayQueryLength ? maxDisplayQueryLength : query.length));
        }
        let result = null;
        try {
            result = this.db.exec(query);
        } catch (e) {
            console.error(`failed to execute: ${query}\n${e.message}\n${e.stack}`);
        }
        return result;
    }
    *__enumerateDbPaths() {
        yield g_dbRoot + "feh.sqlite3";
    }
    async initDatabase(postInitCallback = null) {
        const startTime = Date.now();
        let useCdn = false;
        const sqlPromise = initSqlJs({
            locateFile: file =>
                useCdn ? `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.5.0/${file}` : `/js/sql.js/dist/${file}`
        });

        for (let sqlFilePath of this.__enumerateDbPaths()) {
            const dataPromise = fetch(sqlFilePath).then(res => res.arrayBuffer());
            const [SQL, buf] = await Promise.all([sqlPromise, dataPromise]);
            this.dbs.push(new SQL.Database(new Uint8Array(buf)));
        }

        this.db = this.dbs[0];

        this.__initDatabaseTable();

        if (postInitCallback != null) {
            postInitCallback();
        }

        const endTime = Date.now();
        const initMilliseconds = endTime - startTime;
        this.setInitMessage(initMilliseconds);
    }

    /// URLのページIDを取得します。派生クラスでオーバーライドします。
    __getPageId() {
        return 0;
    }

    /// 派生クラスでオーバーライドします。
    __initDatabaseTable() {
    }


    __createConditionToSearchAllColumns(searchTexts) {
        let conditions = [];
        for (let columnInfo of this.__enumerateColumnInfos(x => x.isAvailableOnDatabase)) {
            let condition = this.__getQueryCondition(columnInfo.name, searchTexts);
            conditions.push(`(${condition})`);
        }
        return conditions.join(" or ");
    }

    /**
     * @param  {string} columnName
     * @param  {string[]} searchTexts
     */
    __getQueryCondition(columnName, searchTexts) {
        let conditions = [];
        for (const word of searchTexts) {
            let condition = this.__getCondition(word, columnName);
            conditions.push(condition);
        }
        return conditions.join(" or ");
    }

    /**
     * @param  {string} columnName
     * @param  {string[]} searchTexts
     */
    __getOrderBySpecifiedOrderCondtion(columnName, searchTexts) {
        let conditions = [];
        let i = 0;
        for (let word of searchTexts) {
            // nameにnicknameやinternal_idを付け加えてるせいでこういう条件にしないといけない
            conditions.push(`when ${columnName} like "${word}|%" then ${i}`);
            ++i;
        }
        return `case ` + conditions.join(" ") + " end";
    }

    /**
     * @param  {string} word
     * @param  {string} columnName
     */
    __getCondition(word, columnName) {
        if (word.startsWith("<")
            || word.startsWith(">")
            || word.startsWith("<=")
            || word.startsWith(">=")
            || word.startsWith("=")
        ) {
            return `${columnName}${word}`;
        }
        else {
            if (this.isCustomOrderEnabled) {
                return `(${columnName} is not null and ${columnName} like "${word}"||"|%")`;
            }
            else {
                return `(${columnName} is not null and ${columnName} like "%${word}%")`;
            }
        }
    }

    * __enumerateColumnInfos(predicateFunc) {
        for (let info of this.columnInfos) {
            if (predicateFunc(info)) {
                yield info;
            }
        }
    }

    __examinesColumnExistsInSqliteTable(tableName, columnName) {
        let result = this.__execQuery(`PRAGMA table_info(${tableName})`);
        let nameIndex = result[0].columns.indexOf("name");
        let column = result[0].values.find(x => x[nameIndex] == columnName);
        return column != null;
    }

    __getCheckboxImgTag(url, alt = "") {
        const CheckboxIconSize = 25;
        let altAttr = alt == "" ? "" : `alt='${alt}' title='${alt}'`;
        return `<img src='${url}' width='${CheckboxIconSize}' height='${CheckboxIconSize}' ${altAttr} >`;
    }
}

