

let tmp_i = 0;
const EvalTarget = {
    Hp: tmp_i++,
    Atk: tmp_i++,
    Spd: tmp_i++,
    Def: tmp_i++,
    Res: tmp_i++,
    HpAtk: tmp_i++,
    HpSpd: tmp_i++,
    HpDef: tmp_i++,
    HpRes: tmp_i++,
    AtkSpd: tmp_i++,
    AtkDef: tmp_i++,
    AtkRes: tmp_i++,
    SpdDef: tmp_i++,
    SpdRes: tmp_i++,
    DefRes: tmp_i++,
    HpAtkSpd: tmp_i++,
    HpAtkDef: tmp_i++,
    HpAtkRes: tmp_i++,
    HpSpdDef: tmp_i++,
    HpSpdRes: tmp_i++,
    HpDefRes: tmp_i++,
    AtkSpdDef: tmp_i++,
    AtkSpdRes: tmp_i++,
    AtkDefRes: tmp_i++,
    SpdDefRes: tmp_i++,
    HpAtkSpdDef: tmp_i++,
    HpAtkSpdRes: tmp_i++,
    HpSpdDefRes: tmp_i++,
    AtkSpdDefRes: tmp_i++,
    HpAtkSpdDefRes: tmp_i++,
};

const EvalTargetToLabel = {};
EvalTargetToLabel[EvalTarget.Hp] = "HP";
EvalTargetToLabel[EvalTarget.Atk] = "攻撃";
EvalTargetToLabel[EvalTarget.Spd] = "速さ";
EvalTargetToLabel[EvalTarget.Def] = "守備";
EvalTargetToLabel[EvalTarget.Res] = "魔防";
EvalTargetToLabel[EvalTarget.HpAtk] = "HP+攻撃";
EvalTargetToLabel[EvalTarget.HpSpd] = "HP+速さ";
EvalTargetToLabel[EvalTarget.HpDef] = "HP+守備";
EvalTargetToLabel[EvalTarget.HpRes] = "HP+魔防";
EvalTargetToLabel[EvalTarget.AtkSpd] = "攻撃+速さ";
EvalTargetToLabel[EvalTarget.AtkDef] = "攻撃+守備";
EvalTargetToLabel[EvalTarget.AtkRes] = "攻撃+魔防";
EvalTargetToLabel[EvalTarget.SpdDef] = "速さ+守備";
EvalTargetToLabel[EvalTarget.SpdRes] = "速さ+魔防";
EvalTargetToLabel[EvalTarget.DefRes] = "守備+魔防";
EvalTargetToLabel[EvalTarget.HpAtkSpd] = "HP+攻撃+速さ";
EvalTargetToLabel[EvalTarget.HpAtkDef] = "HP+攻撃+守備";
EvalTargetToLabel[EvalTarget.HpAtkRes] = "HP+攻撃+魔防";
EvalTargetToLabel[EvalTarget.HpSpdDef] = "HP+速さ+守備";
EvalTargetToLabel[EvalTarget.HpSpdRes] = "HP+速さ+魔防";
EvalTargetToLabel[EvalTarget.HpDefRes] = "HP+守備+魔防";
EvalTargetToLabel[EvalTarget.AtkSpdDef] = "攻撃+速さ+守備";
EvalTargetToLabel[EvalTarget.AtkSpdRes] = "攻撃+速さ+魔防";
EvalTargetToLabel[EvalTarget.AtkDefRes] = "攻撃+守備+魔防";
EvalTargetToLabel[EvalTarget.SpdDefRes] = "速さ+守備+魔防";
EvalTargetToLabel[EvalTarget.HpAtkSpdDef] = "HP+攻撃+速さ+守備";
EvalTargetToLabel[EvalTarget.HpAtkSpdRes] = "HP+攻撃+速さ+魔防";
EvalTargetToLabel[EvalTarget.HpAtkDefRes] = "HP+攻撃+守備+魔防";
EvalTargetToLabel[EvalTarget.HpSpdDefRes] = "HP+速さ+守備+魔防";
EvalTargetToLabel[EvalTarget.AtkSpdDefRes] = "攻撃+速さ+守備+魔防";
EvalTargetToLabel[EvalTarget.HpAtkSpdDefRes] = "HP+攻撃+速さ+守備+魔防";

function selectTop2AssetSum3(a, b, c) {
    return Math.max(Math.max(a + b, a + c), b + c);
}
function selectTop2AssetSum4(a, b, c, d) {
    return Math.max(Math.max(Math.max(Math.max(Math.max(a + b, a + c), a + d), b + c), b + d), c + d);
}
function selectTop2AssetSum5(a, b, c, d, e) {
    return Math.max(Math.max(Math.max(Math.max(Math.max(Math.max(Math.max(Math.max(Math.max(a + b, a + c), a + d), a + e), b + c), b + d), b + e), c + d), c + e), d + e);
}

const GetStatusFuncs = {};
GetStatusFuncs[EvalTarget.Hp] = (info, isAssetEnabled) => info.getHp(isAssetEnabled);
GetStatusFuncs[EvalTarget.Atk] = (info, isAssetEnabled) => info.getAtk(isAssetEnabled);
GetStatusFuncs[EvalTarget.Spd] = (info, isAssetEnabled) => info.getSpd(isAssetEnabled);
GetStatusFuncs[EvalTarget.Def] = (info, isAssetEnabled) => info.getDef(isAssetEnabled);
GetStatusFuncs[EvalTarget.Res] = (info, isAssetEnabled) => info.getRes(isAssetEnabled);
GetStatusFuncs[EvalTarget.HpAtk] = (info, isAssetEnabled) => info.getHp(isAssetEnabled) + info.getAtk(isAssetEnabled);
GetStatusFuncs[EvalTarget.HpSpd] = (info, isAssetEnabled) => info.getHp(isAssetEnabled) + info.getSpd(isAssetEnabled);
GetStatusFuncs[EvalTarget.HpDef] = (info, isAssetEnabled) => info.getHp(isAssetEnabled) + info.getDef(isAssetEnabled);
GetStatusFuncs[EvalTarget.HpRes] = (info, isAssetEnabled) => info.getHp(isAssetEnabled) + info.getRes(isAssetEnabled);
GetStatusFuncs[EvalTarget.AtkSpd] = (info, isAssetEnabled) => info.getAtk(isAssetEnabled) + info.getSpd(isAssetEnabled);
GetStatusFuncs[EvalTarget.AtkDef] = (info, isAssetEnabled) => info.getAtk(isAssetEnabled) + info.getDef(isAssetEnabled);
GetStatusFuncs[EvalTarget.AtkRes] = (info, isAssetEnabled) => info.getAtk(isAssetEnabled) + info.getRes(isAssetEnabled);
GetStatusFuncs[EvalTarget.SpdDef] = (info, isAssetEnabled) => info.getSpd(isAssetEnabled) + info.getDef(isAssetEnabled);
GetStatusFuncs[EvalTarget.SpdRes] = (info, isAssetEnabled) => info.getSpd(isAssetEnabled) + info.getRes(isAssetEnabled);
GetStatusFuncs[EvalTarget.DefRes] = (info, isAssetEnabled) => info.getDef(isAssetEnabled) + info.getRes(isAssetEnabled);
GetStatusFuncs[EvalTarget.HpAtkSpd] = (info, isAssetEnabled) => info.hp + info.atk + info.spd + (isAssetEnabled ? selectTop2AssetSum3(info.hpAssetAdd, info.atkAssetAdd, info.spdAssetAdd) : 0);
GetStatusFuncs[EvalTarget.HpAtkDef] = (info, isAssetEnabled) => info.hp + info.atk + info.def + (isAssetEnabled ? selectTop2AssetSum3(info.hpAssetAdd, info.atkAssetAdd, info.defAssetAdd) : 0);
GetStatusFuncs[EvalTarget.HpAtkRes] = (info, isAssetEnabled) => info.hp + info.atk + info.res + (isAssetEnabled ? selectTop2AssetSum3(info.hpAssetAdd, info.atkAssetAdd, info.resAssetAdd) : 0);
GetStatusFuncs[EvalTarget.HpSpdDef] = (info, isAssetEnabled) => info.hp + info.spd + info.def + (isAssetEnabled ? selectTop2AssetSum3(info.hpAssetAdd, info.spdAssetAdd, info.defAssetAdd) : 0);
GetStatusFuncs[EvalTarget.HpSpdRes] = (info, isAssetEnabled) => info.hp + info.spd + info.res + (isAssetEnabled ? selectTop2AssetSum3(info.hpAssetAdd, info.spdAssetAdd, info.resAssetAdd) : 0);
GetStatusFuncs[EvalTarget.HpDefRes] = (info, isAssetEnabled) => info.hp + info.def + info.res + (isAssetEnabled ? selectTop2AssetSum3(info.hpAssetAdd, info.defAssetAdd, info.resAssetAdd) : 0);
GetStatusFuncs[EvalTarget.AtkSpdDef] = (info, isAssetEnabled) => info.atk + info.spd + info.def + (isAssetEnabled ? selectTop2AssetSum3(info.atkAssetAdd, info.spdAssetAdd, info.defAssetAdd) : 0);
GetStatusFuncs[EvalTarget.AtkSpdRes] = (info, isAssetEnabled) => info.atk + info.spd + info.res + (isAssetEnabled ? selectTop2AssetSum3(info.atkAssetAdd, info.spdAssetAdd, info.resAssetAdd) : 0);
GetStatusFuncs[EvalTarget.AtkDefRes] = (info, isAssetEnabled) => info.atk + info.def + info.res + (isAssetEnabled ? selectTop2AssetSum3(info.atkAssetAdd, info.defAssetAdd, info.resAssetAdd) : 0);
GetStatusFuncs[EvalTarget.SpdDefRes] = (info, isAssetEnabled) => info.spd + info.def + info.res + (isAssetEnabled ? selectTop2AssetSum3(info.spdAssetAdd, info.defAssetAdd, info.resAssetAdd) : 0);
GetStatusFuncs[EvalTarget.HpAtkSpdDef] = (info, isAssetEnabled) => info.hp + info.atk + info.spd + info.def + (isAssetEnabled ? selectTop2AssetSum4(info.hpAssetAdd, info.atkAssetAdd, info.spdAssetAdd, info.defAssetAdd) : 0);
GetStatusFuncs[EvalTarget.HpAtkSpdRes] = (info, isAssetEnabled) => info.hp + info.atk + info.spd + info.res + (isAssetEnabled ? selectTop2AssetSum4(info.hpAssetAdd, info.atkAssetAdd, info.spdAssetAdd, info.resAssetAdd) : 0);
GetStatusFuncs[EvalTarget.HpAtkDefRes] = (info, isAssetEnabled) => info.hp + info.atk + info.def + info.res + (isAssetEnabled ? selectTop2AssetSum4(info.hpAssetAdd, info.atkAssetAdd, info.defAssetAdd, info.resAssetAdd) : 0);
GetStatusFuncs[EvalTarget.HpSpdDefRes] = (info, isAssetEnabled) => info.hp + info.spd + info.def + info.res + (isAssetEnabled ? selectTop2AssetSum4(info.hpAssetAdd, info.spdAssetAdd, info.defAssetAdd, info.resAssetAdd) : 0);
GetStatusFuncs[EvalTarget.AtkSpdDefRes] = (info, isAssetEnabled) => info.atk + info.spd + info.def + info.res + (isAssetEnabled ? selectTop2AssetSum4(info.atkAssetAdd, info.spdAssetAdd, info.defAssetAdd, info.resAssetAdd) : 0);
GetStatusFuncs[EvalTarget.HpAtkSpdDefRes] = (info, isAssetEnabled) => info.hp + info.atk + info.spd + info.def + info.res + (isAssetEnabled ? selectTop2AssetSum5(info.hpAssetAdd, info.atkAssetAdd, info.spdAssetAdd, info.defAssetAdd, info.resAssetAdd) : 0);


const EvalTargetToStatusCount = {};
EvalTargetToStatusCount[EvalTarget.Hp] = 1;
EvalTargetToStatusCount[EvalTarget.Atk] = 1;
EvalTargetToStatusCount[EvalTarget.Spd] = 1;
EvalTargetToStatusCount[EvalTarget.Def] = 1;
EvalTargetToStatusCount[EvalTarget.Res] = 1;
EvalTargetToStatusCount[EvalTarget.HpAtk] = 2;
EvalTargetToStatusCount[EvalTarget.HpSpd] = 2;
EvalTargetToStatusCount[EvalTarget.HpDef] = 2;
EvalTargetToStatusCount[EvalTarget.HpRes] = 2;
EvalTargetToStatusCount[EvalTarget.AtkSpd] = 2;
EvalTargetToStatusCount[EvalTarget.AtkDef] = 2;
EvalTargetToStatusCount[EvalTarget.AtkRes] = 2;
EvalTargetToStatusCount[EvalTarget.SpdDef] = 2;
EvalTargetToStatusCount[EvalTarget.SpdRes] = 2;
EvalTargetToStatusCount[EvalTarget.DefRes] = 2;
EvalTargetToStatusCount[EvalTarget.HpAtkSpd] = 3;
EvalTargetToStatusCount[EvalTarget.HpAtkDef] = 3;
EvalTargetToStatusCount[EvalTarget.HpAtkRes] = 3;
EvalTargetToStatusCount[EvalTarget.HpSpdDef] = 3;
EvalTargetToStatusCount[EvalTarget.HpSpdRes] = 3;
EvalTargetToStatusCount[EvalTarget.HpDefRes] = 3;
EvalTargetToStatusCount[EvalTarget.AtkSpdDef] = 3;
EvalTargetToStatusCount[EvalTarget.AtkSpdRes] = 3;
EvalTargetToStatusCount[EvalTarget.AtkDefRes] = 3;
EvalTargetToStatusCount[EvalTarget.SpdDefRes] = 3;
EvalTargetToStatusCount[EvalTarget.HpAtkSpdDef] = 4;
EvalTargetToStatusCount[EvalTarget.HpAtkSpdRes] = 4;
EvalTargetToStatusCount[EvalTarget.HpAtkDefRes] = 4;
EvalTargetToStatusCount[EvalTarget.HpSpdDefRes] = 4;
EvalTargetToStatusCount[EvalTarget.AtkSpdDefRes] = 4;
EvalTargetToStatusCount[EvalTarget.HpAtkSpdDefRes] = 5;


class RankGroup {
    constructor(label, children) {
        this.label = label;
        /** @type {RankSubGroup[]} */
        this.children = children;
        this.color = "#fff";
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

class StaffInfo {
    constructor(id, name, heroCount, heroPureCount, latestHeroInfo) {
        this.name = name;
        this.id = id;
        this.heroCount = heroCount;
        this.heroPureCount = heroPureCount;
        this.url = `https://fire-emblem.fun/?staff=${id}#main-content`;
        this.latestHeroInfo = latestHeroInfo;
    }
}

class AppData extends SqliteDatabase {
    constructor() {
        super();

        this.heroDb = null;
        this.staffDb = null;
        this.rankGroups = [];

        /** @type {HeroInfo[]} */
        this.heroInfos = [];
        /** @type {StaffInfo[]} */
        this.staffInfos = [];

        /** @type {SelectOption[]} */
        this.heroOptions = [];

        this.countsUniqueNames = false;

        this.message = "";
    }
    __createHeroInfos() {
        const query = "select * from heroes where how_to_get!='' and how_to_get is not null order by type='赤' desc,type='青' desc,type='緑' desc,type='無' desc, weapon_type, move_type";
        const queryResult = this.heroDb.exec(query)[0];
        const keyToIndex = {};
        for (let i = 0; i < queryResult.columns.length; ++i) {
            keyToIndex[queryResult.columns[i]] = i;
        }

        for (const row of queryResult.values) {
            const id = row[keyToIndex["id"]];
            const name = row[keyToIndex["name"]];
            const specialTypeSource = row[keyToIndex["special_type"]];
            const specialTypes = parseSqlStringToArray(specialTypeSource);
            const releaseDate = row[keyToIndex["release_date"]];
            const atkLv1 = Number(row[keyToIndex["atk_5_lv1"]]);
            if (atkLv1 == 0 || atkLv1 == NaN) {
                continue;
            }
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
                atkLv1,
                Number(row[keyToIndex["spd_5_lv1"]]),
                Number(row[keyToIndex["def_5_lv1"]]),
                Number(row[keyToIndex["res_5_lv1"]]),
                row[keyToIndex["resplendent"]] == "true" ? true : false,
                releaseDate,
                getMoveTypeFromStr(row[keyToIndex["move_type"]]),
                getWeaponTypeFromStr(row[keyToIndex["weapon_type"]]),
                getColorTypeFromStr(row[keyToIndex["type"]]),
                specialTypes,
                howToGetDict[row[keyToIndex["how_to_get"]]],
                parseSqlStringToArray(row[keyToIndex["skills"]]),
                row[keyToIndex["origin"]],
                parseSqlStringToArray((row[keyToIndex["rarity3"]] ?? "").replaceAll('星', '')),
                parseSqlStringToArray((row[keyToIndex["cv"]] ?? "")),
                parseSqlStringToArray((row[keyToIndex["illustrator"]] ?? "")),
                row[keyToIndex["resplendent_costume"]]
            );

            this.heroInfos.push(info);
            this.heroOptions.push(
                new SelectOption(info.name, info.id)
            );
        }
    }

    updateRankGroups() {
        let self = this;
        using(new ScopedStopwatch(x => this.message = `検索: ${x} ms`), () => {
            self.__updateRankGroups();
        });
    }

    __updateRankGroups() {
        this.rankGroups = this.__createRankGroups(this.targetStatus);
        for (let i = 0; i < this.rankGroups.length; ++i) {
            this.rankGroups[i].color = getTierListColor(i);
        }
    }

    /**
     * @param  {Number} targetStatus
     * @returns {RankGroup[]}
     */
    __createRankGroups(targetStatus) {
        const evalValueToInfos = {};
        const staffs = this.staffInfos;
        for (const staffInfo of staffs) {
            const evalValue = this.countsUniqueNames ? staffInfo.heroPureCount : staffInfo.heroCount;
            if (!evalValueToInfos[evalValue]) {
                evalValueToInfos[evalValue] = [];
            }
            evalValueToInfos[evalValue].push(staffInfo);
        }

        const groups = [];
        for (const key in evalValueToInfos) {
            /** @type {StaffInfo[]} */
            const infos = evalValueToInfos[key];
            groups.push(new RankGroup(key, infos));
        }
        return groups.reverse();
    }

    __createStaffInfos(charge, heroTableColumnName) {
        const query = `select * from staff where charge like '%|${charge}|%'`;
        const queryResult = this.staffDb.exec(query)[0];
        const keyToIndex = {};
        for (let i = 0; i < queryResult.columns.length; ++i) {
            keyToIndex[queryResult.columns[i]] = i;
        }

        for (const row of queryResult.values) {
            const id = row[keyToIndex["id"]];
            let name = row[keyToIndex["name"]];
            const jpName = row[keyToIndex["name_jp"]];
            if (jpName != "" && jpName != null) {
                name = jpName;
            }

            let count = 0;
            let pureCount = 0;
            {
                const heroQuery = `select count(*) as count,count(distinct pure_name) as uniqueCount from heroes where how_to_get!='' and  how_to_get is not null and ${heroTableColumnName} like '%|${name}|%' order by release_date asc`;
                const heroQueryResult = this.heroDb.exec(heroQuery)[0];
                const resultRow = heroQueryResult.values[0];
                count = resultRow[0];
                pureCount = resultRow[1];
            }
            if (count == 0) {
                continue;
            }
            let latestHeroName = null;
            {
                const heroQuery = `select name from heroes where how_to_get!='' and  how_to_get is not null and ${heroTableColumnName} like '%|${name}|%' order by release_date desc`;
                const heroQueryResult = this.heroDb.exec(heroQuery)[0];
                const resultRow = heroQueryResult.values[0];
                latestHeroName = resultRow[0];
            }
            const latestHeroInfo = this.heroInfos.find(x => x.name == latestHeroName);
            if (latestHeroInfo == null) {
                console.error(`HeroInfo of "${latestHeroName}" was not found.`);
                continue;
            }
            const info = new StaffInfo(
                id,
                name,
                count,
                pureCount,
                latestHeroInfo
            );

            this.staffInfos.push(info);
        }
    }

    init(charge, heroTableColumnName, afterInitFunc = null) {
        this.initDatabase(() => {
            this.heroDb = this.dbs[0];
            this.staffDb = this.dbs[1];
            this.__createHeroInfos();
            this.__createStaffInfos(charge, heroTableColumnName);
            this.updateRankGroups();
            if (afterInitFunc != null) {
                afterInitFunc();
            }
        });
    }

    *__enumerateDbPaths() {
        yield "/db/feh-heroes.sqlite3";
        yield "/db/feh-staff.sqlite3";
    }
}
