


class BoolProp {
    constructor(id, domId, label, defaultValue) {
        this.id = String(id);
        this.domId = domId;
        /** @type {string} */
        this.label = label;
        /** @type {Boolean} */
        this.value = defaultValue;
    }
}
function createBoolProps(sourceEnum, idPrefix, enumToStrFunc) {
    const props = [];
    for (const key in sourceEnum) {
        let enumValue = sourceEnum[key];
        props.push(new BoolProp(enumValue, idPrefix + key, enumToStrFunc(enumValue), false));
    }
    return props;
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
function getOriginColor(shortOriginName) {
    switch (shortOriginName) {
        case "if": return "white";
        case "風": return "#afa";
        case "エ": return "#faa";
        case "覚": return "#aaf";
        case "幻": return "#aff";
        case "外": return "#FFFF60";
        case "暁": return "#FF6B6B";
        case "蒼": return "#6060FF";
        case "紋": return "#60FFFF";
        case "暗": return "#B060B0";
        case "ト": return "#FFC0CB";
        case "烈": return "#FFA560";
        case "封": return "#FF6060";
        case "聖": return "#60B0B0";
        default: return "white";
    }
}

/**
 * @param  {string} origin
 */
function abbreviateOrigin(origin) {
    if (origin == "if") {
        return origin;
    }
    if (origin == "新・紋章の謎") {
        return "紋";
    }
    if (origin == "新・暗黒竜と光の剣") {
        return "暗";
    }
    if (origin == "無双 風花雪月") {
        return "風";
    }
    return origin.substring(0, 1);
}


class VoteInfo {
    constructor(charInfo, voteCount, heroInfos, rank, rankSex) {
        /** @type {CharacterInfo} */
        this.charInfo = charInfo;
        /** @type {HeroInfo[]} */
        this.heroInfos = heroInfos;
        /** @type {number} */
        this.voteCount = voteCount;
        this.rank = rank;
        this.rankSex = rankSex;
        this.displayRank = 0;

        this.shortTitleName = abbreviateOrigin(this.title);
        this.titleColor = getOriginColor(this.shortTitleName);
    }

    get title() {
        return this.charInfo.series[0];
    }

    get isImplemented() {
        return this.heroInfos.length > 0;
    }
}

function getGroupDisplayName(groupName) {
    return "第" + groupName.replace("cyl", "") + "回 英雄総選挙";
}

const DisplayOrderType = {
    Total: 0,
    PerSex: 1,
    Display: 2,
};
const DisplayOrderTypeLabel = {};
DisplayOrderTypeLabel[DisplayOrderType.Total] = "総合順位";
DisplayOrderTypeLabel[DisplayOrderType.PerSex] = "性別毎順位";
DisplayOrderTypeLabel[DisplayOrderType.Display] = "表示中の順位";

const UntargetedKey = "投票対象外";

class AppData extends SqliteDatabase {
    constructor() {
        super();
        this.dbChar = null;
        this.dbCyl = null;
        this.dbHero = null;
        this.db = null;

        /** @type {CharacterInfo[]} */
        this.charInfos = [];

        /** @type {HeroInfo[]} */
        this.heroInfos = [];

        /** @type {{[key: String]: VoteInfo[]}} */
        this.voteInfos = {};

        this.groupNames = [];

        /** @type {VoteInfo[]} */
        this.filteredVoteInfos = [];

        /** @type {VoteInfo[]} */
        this.displayFilteredVoteInfos = [];

        this.accumulatedCylNames = [];

        // オプション
        this.showsUntargetedChars = false;
        this.showsImplementedChar = false;
        this.currentOrderType = DisplayOrderType.Display;
        this.displayTitles = [];
        this.displaySex = createBoolPropsFromStrArray(
            ["男", "女", "性別不詳"], "Sex");
        this.displayPlayable = createBoolProps(
            [true, false], "Playable", v => v ? "プレイアブル" : "ノンプレイアブル");
        this.displayCyl = [];
        this.searchName = "";
        this.isPerfectMatchingNameOnly = false;
    }

    getAccumulatedCylNameDescription() {
        if (this.accumulatedCylNames.length == 1) {
            const name = this.accumulatedCylNames[0];
            if (name == UntargetedKey) return "投票対象外のキャラ";

            const displayName = this.getLabelOfCyl(this.accumulatedCylNames[0]);
            return `${displayName}の投票数が多い順`;
        }

        return this.accumulatedCylNames
            .map(x => this.getLabelOfCyl(x))
            .join("、")
            + "の累計投票数が多い順";
    }

    getLabelOfCyl(name) {
        if (name == UntargetedKey) return name;
        return "第" + name.replace("cyl", "") + "回";
    }

    updateFilteredVoteInfos() {
        const enabledTitles = this.displayTitles.filter(x => x.value).map(x => x.id);
        const skipsTitles = enabledTitles.length == 0 || enabledTitles.length == this.displayTitles.length;

        const enabledSex = this.displaySex.filter(x => x.value).map(x => x.id);
        const skipsSex = enabledSex.length == 0 || enabledSex.length == this.displaySex.length;

        const enabledPlayable = this.displayPlayable.filter(x => x.value).map(x => x.id);
        const skipsPlayable = enabledPlayable.length == 0 || enabledPlayable.length == this.displayPlayable.length;

        const enabledTable = this.displayCyl.filter(x => x.value).map(x => x.id);
        const skipsTable = enabledTable.length == 0 || enabledTable.length == this.displayCyl.length;


        /** @type {VoteInfo[]} */
        const displayVoteInfos = {};

        this.accumulatedCylNames = Array.from(this.groupNames.filter(x => skipsTable || enabledTable.includes(x))).sort();
        const targetVoteInfosList = [];
        for (const groupName of this.accumulatedCylNames) {
            /** @type {VoteInfo[]} */
            const voteInfos = this.voteInfos[groupName];
            targetVoteInfosList.push(voteInfos);
        }

        for (const voteInfos of targetVoteInfosList) {
            for (const info of voteInfos) {
                const id = info.charInfo.id;
                if (!(id in displayVoteInfos)) {
                    displayVoteInfos[info.charInfo.id] = new VoteInfo(info.charInfo, 0, info.heroInfos, 0, 0);
                }

                const displayInfo = displayVoteInfos[info.charInfo.id];
                displayInfo.voteCount += info.voteCount;
                displayInfo.rank += info.rank;
                displayInfo.rankSex += info.rankSex;
            }
        }

        this.filteredVoteInfos = Array.from(
            Object.values(displayVoteInfos).filter(x => (this.showsImplementedChar || !x.isImplemented)
                && (skipsTitles || enabledTitles.some(t => x.charInfo.series.some(t1 => t1 == t)))
                && (skipsSex || enabledSex.includes(x.charInfo.sex))
                && (skipsPlayable || enabledPlayable.includes(String(x.charInfo.playable)))
            )).sort((a, b) => b.voteCount - a.voteCount);

        // 表示対象に順位をつける
        if (this.filteredVoteInfos.length > 0) {
            this.filteredVoteInfos[0].displayRank = 1;
            for (let i = 1, order = 1; i < this.filteredVoteInfos.length; ++i) {
                const prevInfo = this.filteredVoteInfos[i - 1];
                const info = this.filteredVoteInfos[i];
                if (info.voteCount < prevInfo.voteCount) {
                    ++order;
                }
                info.displayRank = order;
            }
        }

        this.updateDisplayFilteredVoteInfos();
    }

    updateDisplayFilteredVoteInfos() {
        const searchNames = this.searchName.split(" ").filter(x => x != "");
        if (searchNames.length == 0) {
            this.displayFilteredVoteInfos = this.filteredVoteInfos;
            return;
        }

        if (this.isPerfectMatchingNameOnly) {
            this.displayFilteredVoteInfos = Array.from(this.filteredVoteInfos.filter(info =>
                searchNames.some(name => info.charInfo.pureName == name)));
        }
        else {
            this.displayFilteredVoteInfos = Array.from(this.filteredVoteInfos.filter(info =>
                searchNames.some(name => info.charInfo.pureName.includes(name))));
        }
    }

    init(postInitFunc) {
        this.initDatabase(() => {
            this.dbChar = this.dbs[0];
            this.dbCyl = this.dbs[1];
            this.dbHero = this.dbs[2];
            this.db = this.dbs[3];

            this.charInfos = createCharacterInfoListFromDb(this.dbChar);
            this.heroInfos = createHeroInfos(this.dbHero);
            this.voteInfos = this.__createCylInfosAll();
            this.voteInfos[UntargetedKey] = this.__createUntargetedVoteInfos();
            this.displayCyl = createBoolPropsFromStrArray(Object.keys(this.voteInfos).sort(), "Table");
            this.displayTitles = this.__createDisplayTitleInfos();

            // 最新の総選挙の投票数をデフォルトでは表示しておく
            this.displayCyl[this.displayCyl.length - 2].value = true;
            this.displayCyl[this.displayCyl.length - 1].value = true;

            for (const tableName of Object.keys(this.voteInfos).sort().reverse()) {
                this.groupNames.push(tableName);
            }

            this.updateFilteredVoteInfos();

            if (postInitFunc != null) {
                postInitFunc();
            }
        });
    }

    __createDisplayTitleInfos() {
        const actualTitles = {};
        for (const key in this.voteInfos) {
            for (const voteInfo of this.voteInfos[key]) {
                actualTitles[voteInfo.title] = null;
            }
        }

        const titles = Array.from(this.__createTitleInfos().filter(x => x in actualTitles));
        return createBoolPropsFromStrArray(
            titles, "Title");
    }

    __createUntargetedVoteInfos() {
        const charIds = {}
        for (const key in this.voteInfos) {
            const voteInfos = this.voteInfos[key];
            for (const info of voteInfos) {
                charIds[info.charInfo.id] = null;
            }
        }

        const untargetedVoteInfos = [];
        for (const charInfo of this.charInfos.filter(x => !(x.id in charIds))) {
            const heroInfos = Array.from(this.__getSpecifiedCharHeroInfos(charInfo.pureName, charInfo.series));
            const voteInfo = new VoteInfo(charInfo, 0, heroInfos, -1, -1);
            untargetedVoteInfos.push(voteInfo);
        }
        return untargetedVoteInfos;
    }

    __findCharInfo(name, series) {
        return this.charInfos.find(
            info => (info.pureName === name || info.otherNames.some(otherName => otherName == name))
                // 「無双 風花雪月」を「風花雪月」で判定できるようにするため endsWith() してる
                && info.series.some(title => series.some(z => title.endsWith(z))));
    }

    __createCylInfosAll() {
        const sql = `SELECT name FROM sqlite_master`;
        const queryResult = this.dbCyl.exec(sql)[0];
        const allVoteInfos = {};

        for (const row of queryResult.values) {
            const tableName = row[0];
            const voteInfos = this.__createCylInfos(tableName);
            allVoteInfos[tableName] = voteInfos;
        }

        return allVoteInfos;
    }

    __createTitleInfos() {
        const sql = `select * from series`;
        const queryResult = this.db.exec(sql)[0];
        const keyToIndex = {};
        for (let i = 0; i < queryResult.columns.length; ++i) {
            keyToIndex[queryResult.columns[i]] = i;
        }
        const titles = {};
        for (const row of queryResult.values) {
            let title = row[keyToIndex["title"]];
            title = title.replace(" もうひとりの英雄王", "");
            const releaseDate = row[keyToIndex["release_date"]];
            titles[releaseDate + title] = title;
        }

        const sortedKeys = Object.keys(titles).sort();
        const values = sortedKeys.map(key => titles[key]);
        return values;
    }

    __createCylInfos(tableName) {
        const sql = `select * from ${tableName}`;
        const queryResult = this.dbCyl.exec(sql)[0];
        const keyToIndex = {};
        for (let i = 0; i < queryResult.columns.length; ++i) {
            keyToIndex[queryResult.columns[i]] = i;
        }
        const voteInfos = [];
        for (const row of queryResult.values) {
            const name = row[keyToIndex["name"]];
            let seriesSource = row[keyToIndex["series"]];
            if (isNullOrEmpty(seriesSource)) continue;
            seriesSource = seriesSource.replaceAll("／", "|");
            const series = parseSqlStringToArray(seriesSource);
            if (name == "シェズ男") {
                console.log();
            }
            const charInfo = this.__findCharInfo(name, series);
            if (charInfo == null) {
                console.error(`charInfo for ${name} was not found. ${seriesSource}`);
            }
            const rank = Number(row[keyToIndex["rank"]]);
            const rankSex = Number(row[keyToIndex["rank_sex"]]);
            const voteCount = Number(row[keyToIndex["vote_count"]]);
            const heroInfos = Array.from(this.__getSpecifiedCharHeroInfos(name, series));
            const voteInfo = new VoteInfo(charInfo, voteCount, heroInfos, rank, rankSex);
            voteInfos.push(voteInfo);
        }

        return voteInfos;
    }

    __getSpecifiedCharHeroInfos(name, series) {
        return this.heroInfos
            .filter(x => x.pureNames.some(pn => pn === name)
                // 無双風花雪月と風花雪月をマッチさせるためにendsWithしてる
                && x.sourceOrigins.some(o => series.some(s => s.endsWith(o))));
    }

    *__enumerateDbPaths() {
        yield "/db/feh-original_heroes.sqlite3";
        yield "/db/feh-cyl.sqlite3";
        yield "/db/feh-heroes.sqlite3";
        yield "/db/feh.sqlite3";
    }
}

function setPropValues(props, value) {
    for (const prop of props) {
        prop.value = value;
    }
}

const g_appData = new AppData();
const g_app = new Vue({
    el: "#app",
    data: g_appData,
    methods: {
        setBoolOptions(target, value) {
            setPropValues(target, value);
            g_appData.updateFilteredVoteInfos();
        },
    }
});

function initMain(postInitFunc) {
    g_appData.init(postInitFunc);
}
