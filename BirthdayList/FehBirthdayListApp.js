
function getOriginColor(shortOriginName) {
    switch (shortOriginName) {
        case "if": return "white";
        case "風": return "#afa";
        case "エ": return "#faa";
        case "覚": return "#aaf";
        case "幻": return "#aff";
        default: return "white";
    }
}
function getTitleImageUrl(id) {
    return `https://fire-emblem.fun/images/FeTitleImages/Package-${id}.jpg`;
}

/**
 * @param  {string} origin
 */
function abbreviateOrigin(origin) {
    if (origin == "if") {
        return origin;
    }
    if (origin == "FEタイトル") {
        return "";
    }
    return origin.substring(0, 1);
}

function replaceExtension(path, newExt) {
    // パスから最後の拡張子を探す
    const lastDotIndex = path.lastIndexOf('.');

    if (lastDotIndex >= 0) {
        // ドットが見つかった場合、新しい拡張子を含めて新しいパスを作成
        return path.substring(0, lastDotIndex) + '.' + newExt;
    } else {
        // ドットが見つからない場合、新しい拡張子を単純に追加
        return path + '.' + newExt;
    }
}
class CharacterInfo {
    /**
     * @param  {string} id
     * @param  {string} name
     * @param  {string} thumbName
     * @param  {string} birthday
     * @param  {string} origin
     * @param  {string} tags
     */
    constructor(id, name, thumbUrl, birthday, origin, tags, queryParamName = "fechar") {
        this.id = id;
        this.name = name;
        this.birthday = birthday;
        this.thumbUrl = thumbUrl;
        this.alterThumbUrl = replaceExtension(thumbUrl, thumbUrl.endsWith("jpg") ? "png" : "jpg");
        this.origin = origin;
        this.shortOriginName = abbreviateOrigin(origin);
        this.tags = tags;

        this.url = `https://fire-emblem.fun/?${queryParamName}=${id}#main-content`;

        this.month = -1;
        this.day = -1;
        const monthAndDay = birthday.split('/');
        if (monthAndDay.length === 2) {
            this.month = parseInt(monthAndDay[0], 10);
            this.day = parseInt(monthAndDay[1], 10);
        }

        this.birthdayNumber = this.month * 100 + this.day;
    }
}
function createBoolPropsFromStrArray(sourceArray, idPrefix, valueToStrFunc = null) {
    const props = [];
    let i = 0;
    for (const item of sourceArray) {
        const label = valueToStrFunc != null ? valueToStrFunc(item) : item;
        props.push(new BoolProp(item, idPrefix + i, label, false));
        ++i;
    }
    return props;
}

class AppData extends SqliteDatabase {
    constructor() {
        super();

        this.charDb = null;
        this.titleDb = null;

        /** @type {CharacterInfo[]} */
        this.charInfos = [];

        this.monthToCharInfos = {};
        this.monthToDisplayCharInfos = {};

        this.showsName = false;

        this.displayOrigin = [];

        this.message = "";
    }

    updateDisplayIcons() {
        const enabledOrigin = this.displayOrigin.filter(x => x.value).map(x => x.id);
        const skipsOrigin = enabledOrigin.length == 0 || enabledOrigin.length == this.displayOrigin.length;
        const displayInfos = this.charInfos
            .filter(x =>
                (skipsOrigin || enabledOrigin.includes(x.origin))
            );

        const monthToCharInfos = {};
        for (const info of displayInfos) {
            if (!(info.month in monthToCharInfos)) {
                monthToCharInfos[info.month] = [];
            }
            monthToCharInfos[info.month].push(info);
        }

        this.monthToCharInfos = monthToCharInfos;
    }

    __createCharacterInfosFromTitleDb() {
        const query = "select *,replace(SUBSTR(release_date, 6),'-','/') as birthday from series where birthday!='' and birthday is not null order by birthday asc";
        const queryResult = this.titleDb.exec(query)[0];
        const keyToIndex = {};
        for (let i = 0; i < queryResult.columns.length; ++i) {
            keyToIndex[queryResult.columns[i]] = i;
        }

        for (const row of queryResult.values) {
            const id = row[keyToIndex["id"]];
            const name = row[keyToIndex["title"]];
            const englishName = row[keyToIndex["english_title"]];
            let origin = "FEタイトル";
            let thumb = getTitleImageUrl(id);
            const info = new CharacterInfo(
                id,
                name,
                thumb,
                row[keyToIndex["birthday"]],
                origin,
                "",
                "fetitle"
            );

            this.charInfos.push(info);
        }
    }


    __createCharacterInfosFromCharDb() {
        const query = "select * from original_heroes where birthday!='' and birthday is not null order by birthday asc";
        const queryResult = this.charDb.exec(query)[0];
        const keyToIndex = {};
        for (let i = 0; i < queryResult.columns.length; ++i) {
            keyToIndex[queryResult.columns[i]] = i;
        }

        for (const row of queryResult.values) {
            const id = row[keyToIndex["id"]];
            const name = row[keyToIndex["name"]];
            const englishName = row[keyToIndex["english_name"]];

            const series = row[keyToIndex["series"]];
            const playable = row[keyToIndex["playable"]];
            const seriesArray = isNullOrEmpty(series) ? [] : parseSqlStringToArray(series);
            const variation = row[keyToIndex["variation"]];
            const origins = Array.from(series.split('|').filter(x => x != ""));
            let origin = "不明";
            if (origins.length > 0) {
                origin = origins[0];
            }
            let thumb = row[keyToIndex["thumb"]];
            if (thumb == "" || thumb == null) {
                thumb = getOriginalCharacterImageNameFromEnglishName(
                    name, englishName, seriesArray, variation, playable);
            }
            const info = new CharacterInfo(
                id,
                name,
                `https://fire-emblem.fun/images/FehCylPortraits/${thumb}`,
                row[keyToIndex["birthday"]],
                origin,
                row[keyToIndex["tags"]]
            );

            this.charInfos.push(info);
        }
    }

    __createCharacterInfos() {
        this.__createCharacterInfosFromCharDb();
        this.__createCharacterInfosFromTitleDb();

        this.charInfos = this.charInfos.sort((a, b) => a.birthdayNumber - b.birthdayNumber);

        const allOriginDict = {};
        for (let info of this.charInfos) {
            allOriginDict[info.origin] = null;
        }
        const allOrigins = Object.keys(allOriginDict).sort((a, b) => {
            if (a == b) return 0;
            if (a == "FEタイトル") {
                return 1;
            }
            if (b == "FEタイトル") {
                return -1;
            }
            return 0;
        });
        this.displayOrigin = createBoolPropsFromStrArray(allOrigins, "Origin");
    }


    init(afterInitFunc = null) {
        this.initDatabase(() => {
            this.charDb = this.dbs[0];
            this.titleDb = this.dbs[1];
            this.__createCharacterInfos();
            this.updateDisplayIcons();
            if (afterInitFunc != null) {
                afterInitFunc();
            }
        });
    }

    *__enumerateDbPaths() {
        yield "/db/feh-original_heroes.sqlite3?20231120";
        yield "/db/feh.sqlite3";
    }
}
