
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

class ChartData {
    constructor(name, value, displayName, color, imageUrl1, imageUrl2) {
        this.name = name;
        this.displayName = displayName;
        this.value = value;
        this.color = color;
        this.imageUrl1 = imageUrl1;
        this.imageUrl2 = imageUrl2;
    }
}

class ChartDataSet {
    constructor(date) {
        this.date = date;

        /** @type {ChartData[]} */
        this.dataSet = [];
    }
}

function createDateObject(dateString) {
    const parts = dateString.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 月は0から11の数値で表現されるため、1を引きます
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
}

const DisplayTarget = {
    Origin: 0,
    Color: 1,
    WeaponType: 2,
    MoveType: 3,
    HowToGet: 4,
    UnitType: 5,
    Sex: 6,
    Cv: 7,
    Illustrator: 8,
    ResplendentCostume: 9,
    PureName: 10,
};
function getDisplayTargetLabel(value) {
    switch (value) {
        case DisplayTarget.Origin: return "出典";
        case DisplayTarget.Color: return "色";
        case DisplayTarget.WeaponType: return "武器種";
        case DisplayTarget.MoveType: return "移動タイプ";
        case DisplayTarget.HowToGet: return "入手法";
        case DisplayTarget.UnitType: return "兵種";
        case DisplayTarget.Sex: return "性別";
        case DisplayTarget.Cv: return "声優";
        case DisplayTarget.Illustrator: return "絵師";
        case DisplayTarget.ResplendentCostume: return "神装衣装";
        case DisplayTarget.PureName: return "キャラ";
    }
}
const DisplayMode = {
    TableVertical: 0,
    TableHorizontal: 1,
    BarChart: 2,
};

function getDisplayModeLabel(value) {
    switch (value) {
        case DisplayMode.TableVertical: return "表(縦向き)";
        case DisplayMode.TableHorizontal: return "表(横向き)";
        case DisplayMode.BarChart: return "棒グラフ";
    }
}

function dateToString(dateObject, monthOffset = 0) {
    const year = dateObject.getFullYear();
    const month = dateObject.getMonth() + 1 + monthOffset; // 月は0から11の数値で表現されるため、1を足します
    const day = dateObject.getDate();
    const dateString = year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day);
    return dateString;
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

class AppData extends SqliteDatabase {
    constructor() {
        super();

        this.heroDb = null;

        /** @type {HeroInfo[]} */
        this.heroInfos = [];

        /** @type {ChartDataSet[]} */
        this.chartDataset = [];

        this.columnCount = 0;

        this.currentTimeIndex = 0;

        this.columnNames = [];

        this.origins = [];
        this.originToSourceOrigins = {};
        this.weaponTypes = [];
        this.howToGetItems = [];
        this.unitTypes = [];
        this.cvs = [];
        this.illustrators = [];
        this.resplendentCostumes = [];
        this.pureNames = [];

        this.displayMode = DisplayMode.BarChart;
        this.displayTarget = DisplayTarget.Origin;

        this.isPlaying = false;
        this.showsZeroColumn = true;

        this.dateMin = new Date(2017, 1, 1);
        this.dateMax = new Date();
        this.beginDate = new Date(2017, 1, 1);
        this.endDate = new Date();

        this.displayHowToGet = createBoolPropsFromStrArray(
            [...new Set(Object.values(howToGetDict))], "HowToGet");
        this.queryHeroAdditionalCondition = "";


        this.message = "";
    }

    getGraphTitle() {

        return `${getDisplayTargetLabel(g_appData.displayTarget)}毎の実装数の推移`;
    }

    getGraphSubtitle() {
        const howToGetLabel = this.displayHowToGet
            .filter(x => x.value).map(x => x.id).join("/");
        return howToGetLabel;
    }

    __updateQueryHeroCondition() {
        const enabledHowToGet = this.displayHowToGet
            .filter(x => x.value).map(x => `how_to_get='${howToGetInvDict[x.id]}'`);
        this.queryHeroAdditionalCondition = enabledHowToGet.join(" or ");
    }

    updateStatistics() {
        this.__updateStatisticsImpl(
            // カラムリスト
            () => {
                switch (this.displayTarget) {
                    case DisplayTarget.Origin: return this.origins;
                    case DisplayTarget.Color: return ["赤", "青", "緑", "無"];
                    case DisplayTarget.WeaponType: return this.weaponTypes;
                    case DisplayTarget.MoveType: return ["重装", "歩行", "騎馬", "飛行"];
                    case DisplayTarget.HowToGet: return this.howToGetItems;
                    case DisplayTarget.UnitType: return this.unitTypes;
                    case DisplayTarget.Sex: return ["男", "女", "性別不詳"];
                    case DisplayTarget.Cv: return this.cvs;
                    case DisplayTarget.Illustrator: return this.illustrators;
                    case DisplayTarget.ResplendentCostume: return this.resplendentCostumes;
                    case DisplayTarget.PureName: return this.pureNames;
                }
            },
            // 表示名
            name => {
                switch (this.displayTarget) {
                    case DisplayTarget.HowToGet:
                        switch (name) {
                            case "ガチャ": return "恒常排出";
                            case "伝承英雄ガチャ": return "伝承英雄";
                            case "神階英雄ガチャ": return "神階英雄";
                            default: return name;
                        }
                    case DisplayTarget.Sex:
                        switch (name) {
                            case "男": return "Male";
                            case "女": return "Female";
                            case "性別不詳": return "Genderless";
                        }
                    case DisplayTarget.WeaponType:
                    case DisplayTarget.MoveType:
                    case DisplayTarget.UnitType:
                    case DisplayTarget.Color:
                        return "";
                    default: return name;
                }
            },
            // データベースの検索クエリ
            name => {
                switch (this.displayTarget) {
                    case DisplayTarget.Origin:
                        {
                            const condition = this.originToSourceOrigins[name]
                                .map(x => `origin like '%${x}%'`).join(" or ");
                            const additionalCondition = this.queryHeroAdditionalCondition == "" ? "" : ` and (${this.queryHeroAdditionalCondition})`;
                            return `(${condition})` + additionalCondition;
                        }
                    case DisplayTarget.Color: return `type='${name}'`;
                    case DisplayTarget.WeaponType: return `weapon_type='${name}'`;
                    case DisplayTarget.MoveType: return `move_type='${name}'`;
                    case DisplayTarget.HowToGet: return `how_to_get='${name}'`;
                    case DisplayTarget.Cv: return `cv like '%|${name}|%'`;
                    case DisplayTarget.Illustrator: return `illustrator like '%|${name}|%'`;
                    case DisplayTarget.ResplendentCostume: return `resplendent_costume='${name}'`;
                    case DisplayTarget.UnitType:
                        {
                            const split = name.split('/');
                            const moveType = split[0];
                            const weaponType = split[1];
                            return `move_type='${moveType}' and weapon_type='${weaponType}'`;
                        }
                    case DisplayTarget.Sex: return `sex like '${name}%'`;
                    case DisplayTarget.PureName: return `pure_name like '%|${name}|%'`;
                }
            },
            // 画像の指定
            name => {
                switch (this.displayTarget) {
                    case DisplayTarget.Color: return [this.__getColorIcon(name), null];
                    case DisplayTarget.WeaponType: return [this.__getWeaponTypeIcon(name), null];
                    case DisplayTarget.MoveType: return [this.__getMoveTypeIcon(name), null];
                    case DisplayTarget.UnitType:
                        {
                            const split = name.split('/');
                            const moveType = split[0];
                            const weaponType = split[1];
                            return [this.__getWeaponTypeIcon(weaponType), this.__getMoveTypeIcon(moveType)];
                        }
                    case DisplayTarget.Origin:
                    case DisplayTarget.HowToGet:
                    default:
                        return [null, null];
                }
            },
            // 色の指定
            name => {
                switch (this.displayTarget) {
                    case DisplayTarget.Sex:
                        switch (name) {
                            case "男": return "#aaf";
                            case "女": return "#faa";
                            case "性別不詳": return "#aaa";
                            default:
                                return null;
                        }
                    case DisplayTarget.Color:
                        switch (name) {
                            case "赤": return "#faa";
                            case "青": return "#aaf";
                            case "緑": return "#afa";
                            case "無": return "#aaa";
                            default: return null;
                        }
                    case DisplayTarget.UnitType:
                        {
                            const split = name.split('/');
                            const moveType = split[0];
                            const weaponType = split[1];
                            return this.__getWeaponNameToColor(weaponType);
                        }
                    default: return null;
                }
            });
    }

    __getWeaponNameToColor(weaponType) {
        if (weaponType == "剣" || weaponType.includes("赤")) {
            return "#faa";
        }
        if (weaponType == "槍" || weaponType.includes("青")) {
            return "#aaf";
        }
        if (weaponType == "斧" || weaponType.includes("緑")) {
            return "#afa";
        }
        if (weaponType == "杖"
            || weaponType == "暗器"
            || weaponType == "弓"
            || weaponType.includes("無")) {
            return "#aaa";
        }
        return null;
    }

    __getWeaponTypeIcon(name) {
        return weaponIconRoot + WeaponTypeToPath[strToWeaponType[name]];
    }

    __getColorIcon(name) {
        switch (name) {
            case "赤": return "https://fire-emblem.fun/images/feh/ColorRed.png";
            case "青": return "https://fire-emblem.fun/images/feh/ColorBlue.png";
            case "緑": return "https://fire-emblem.fun/images/feh/ColorGreen.png";
            case "無": return "https://fire-emblem.fun/images/feh/ColorColorless.png";
            default: return null;
        }
    }

    __getMoveTypeIcon(name) {
        switch (name) {
            case "重装": return "/AetherRaidTacticsBoard/images/MoveType_Armor.png";
            case "歩行": return "/AetherRaidTacticsBoard/images/MoveType_Infantry.png";
            case "騎馬": return "/AetherRaidTacticsBoard/images/MoveType_Cavarly.png";
            case "飛行": return "/AetherRaidTacticsBoard/images/MoveType_Flier.png";
            default: return null;
        }
    }

    __updateStatisticsImpl(getNamesFunc, getDisplayName, getConditionFunc, getImageUrlFunc, getColorFunc) {
        this.__updateQueryHeroCondition();
        const statistics = [];
        const beginDate = dateToString(this.beginDate);
        const currentDate = createDateObject(beginDate);
        const endDate = new Date(this.endDate);
        const columnNames = getNamesFunc();
        endDate.setMonth(endDate.getMonth() + 1);
        while (currentDate < endDate) {
            const displayDateString = dateToString(currentDate, 0);
            const dateString = dateToString(currentDate, 1);
            const item = new ChartDataSet(displayDateString.substring(0, displayDateString.length - 3).replace("-", "/"));
            for (const name of columnNames) {
                const cond = getConditionFunc(name);
                const query = `select count(*) as count from heroes where (${cond}) and how_to_get!="" and how_to_get is not null and '${beginDate}'<= release_date and release_date<='${dateString}'`;
                const queryResult = this.heroDb.exec(query)[0];
                const row = queryResult.values[0];
                const heroCount = row[0];
                const imageUrls = getImageUrlFunc(name);
                const displayName = getDisplayName(name);
                const color = getColorFunc(name);
                if (!this.showsZeroColumn && heroCount == 0) {
                    continue;
                }
                item.dataSet.push(new ChartData(name, heroCount, displayName, color, imageUrls[0], imageUrls[1]));
            }
            statistics.push(item);

            // 1ヶ月を加算
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        this.columnNames = columnNames;
        this.chartDataset = statistics;
        this.columnCount = columnNames.length;
    }


    __createHeroInfos() {
        const query = "select * from heroes where how_to_get!='' and how_to_get is not null order by release_date asc";
        const queryResult = this.heroDb.exec(query)[0];
        const keyToIndex = {};
        for (let i = 0; i < queryResult.columns.length; ++i) {
            keyToIndex[queryResult.columns[i]] = i;
        }

        for (const row of queryResult.values) {
            const atk1 = row[keyToIndex["atk_5_lv1"]];
            if (atk1 == null) {
                continue;
            }
            const id = row[keyToIndex["id"]];
            const name = row[keyToIndex["name"]];
            const specialTypeSource = row[keyToIndex["special_type"]];
            const specialTypes = parseSqlStringToArray(specialTypeSource);
            const info = new HeroInfo(
                id,
                name,
                row[keyToIndex["thumb"]],
                Number(row[keyToIndex["hp_5"]]),
                Number(row[keyToIndex["atk_5"]]),
                Number(row[keyToIndex["spd_5"]]),
                Number(row[keyToIndex["def_5"]]),
                Number(row[keyToIndex["res_5"]]),
                Number(row[keyToIndex["hp_5_lv1"]]),
                Number(row[keyToIndex["atk_5_lv1"]]),
                Number(row[keyToIndex["spd_5_lv1"]]),
                Number(row[keyToIndex["def_5_lv1"]]),
                Number(row[keyToIndex["res_5_lv1"]]),
                row[keyToIndex["resplendent"]] == "true" ? true : false,
                row[keyToIndex["release_date"]],
                getMoveTypeFromStr(row[keyToIndex["move_type"]]),
                getWeaponTypeFromStr(row[keyToIndex["weapon_type"]]),
                getColorTypeFromStr(row[keyToIndex["type"]]),
                specialTypes,
                row[keyToIndex["how_to_get"]],
                parseSqlStringToArray(row[keyToIndex["skills"]]),
                row[keyToIndex["origin"]],
                parseSqlStringToArray((row[keyToIndex["rarity3"]] ?? "").replaceAll('星', '')),
                parseSqlStringToArray((row[keyToIndex["cv"]] ?? "")),
                parseSqlStringToArray((row[keyToIndex["illustrator"]] ?? "")),
                row[keyToIndex["resplendent_costume"]],
                parseSqlStringToArray((row[keyToIndex["pure_name"]] ?? ""))
            );

            this.heroInfos.push(info);
        }

        let origins = {};
        let weaponTypes = {};
        let howToGet = {};
        let unitType = {};
        let cvs = [];
        let illustrators = [];
        let costumes = [];
        const pureNames = [];
        for (const heroInfo of this.heroInfos) {
            let i = 0;
            for (const origin of heroInfo.origins) {
                if (origins[origin] == null) {
                    origins[origin] = [];
                }
                if (!origins[origin].some(x => x == heroInfo.sourceOrigins[i])) {
                    origins[origin].push(heroInfo.sourceOrigins[i]);
                }
                ++i;
            }
            weaponTypes[WeaponTypeToStr[heroInfo.weaponType]] = null;
            howToGet[heroInfo.howToGetSource] = null;
            unitType[`${MoveTypeToStr[heroInfo.moveType]}/${WeaponTypeToStr[heroInfo.weaponType]}`] = null;
            if (heroInfo.resplendentCostume != null) {
                costumes[heroInfo.resplendentCostume] = null;
            }
            for (let cv of heroInfo.cvs) {
                cvs[cv] = null;
            }
            for (let x of heroInfo.illustrators) {
                illustrators[x] = null;
            }
            for (const x of heroInfo.pureNames) {
                pureNames[x] = null;
            }
        }
        this.originToSourceOrigins = origins;
        this.origins = Object.keys(origins);
        this.weaponTypes = Object.keys(weaponTypes);
        this.howToGetItems = Object.keys(howToGet);
        this.unitTypes = Object.keys(unitType);
        this.cvs = Object.keys(cvs);
        this.illustrators = Object.keys(illustrators);
        this.resplendentCostumes = Object.keys(costumes);
        this.pureNames = Object.keys(pureNames);
    }


    init(afterInitFunc = null) {
        this.initDatabase(() => {
            this.heroDb = this.dbs[0];
            this.__createHeroInfos();
            this.updateStatistics();
            if (afterInitFunc != null) {
                afterInitFunc();
            }
        });
    }

    *__enumerateDbPaths() {
        yield "/db/feh-heroes.sqlite3";
    }
}
