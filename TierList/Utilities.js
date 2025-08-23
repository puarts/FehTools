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
function mb_strpos(str1, str2) {
    return str1.includes(str2);
}
function parseSqlStringToArray(str) {
    if (str == null) return [];
    return str.split('|').filter(x => x != "");
}
function explode(sep, str) {
    return str.split(sep);
}
function intval(str) {
    return Number(str);
}



class SqliteDatabase {
    constructor() {
        this.dbs = [];
        this.initMessage = "初期化中..";
    }

    *__enumerateDbPaths() {
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

        this.__initDatabaseTable();
        if (postInitCallback != null) {
            postInitCallback();
        }
        const endTime = Date.now();
        const initMilliseconds = endTime - startTime;
        this.initMessage = `初期化が完了しました。使用できます。(初期化${initMilliseconds / 1000}秒)`;
    }

    __initDatabaseTable() {
    }
}

const g_colorList = [
    "#ff7174",
    "#feb776",
    "#fedc7a",
    "#fdfe7c",
    "#b8ff7c",
    "#74ff7c",
    "#72fffd",
    "#75b5fd",
    "#5d90ca",
    "#456b96",
];
function getTierListColors() {
    return g_colorList;
}
function getTierListColor(rankIndex) {
    let colorList = getTierListColors();
    return rankIndex < colorList.length ? colorList[rankIndex] : colorList[colorList.length - 1];
}

class BoolProp {
    constructor(id, domId, label, defaultValue) {
        this.id = id;
        this.domId = domId;
        /** @type {string} */
        this.label = label;
        /** @type {Boolean} */
        this.value = defaultValue;
    }
}
function setPropValues(props, value) {
    for (const prop of props) {
        prop.value = value;
    }
}

class SelectOption {
    constructor(label, value) {
        this.text = label;
        this.id = value;
    }
}

function getCurrentDateAsNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const formattedMonth = month < 10 ? '0' + month : '' + month;
    const yearMonthString = `${year}${formattedMonth}`;
    const yearMonthNumber = Number(yearMonthString);
    return yearMonthNumber;
}

function getCurrentBook() {
    const yearMonthNumber = getCurrentDateAsNumber();
    const startYear = 2017;
    const startScore = 1;

    const year = Math.floor(yearMonthNumber / 100);
    const month = yearMonthNumber % 100;

    let currentYearScore = 0;

    if (month >= 12) {
        currentYearScore = year + 1;
    } else {
        currentYearScore = year;
    }

    const yearDifference = currentYearScore - startYear;
    return startScore + yearDifference;
}

function getBooks() {
    const currentBook = getCurrentBook();
    return Array.from({ length: currentBook }, (_, i) => i + 1);
}