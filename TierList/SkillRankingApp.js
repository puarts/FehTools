
const SkillType = {
    Unknown: -1,
    Support: 0,
    Special: 1,
    PassiveA: 2,
    PassiveB: 3,
    PassiveC: 4,
}
function getSkillTypeName(type) {
    switch (type) {
        case SkillType.PassiveA: return "パッシブA";
        case SkillType.PassiveB: return "パッシブB";
        case SkillType.PassiveC: return "パッシブC";
        case SkillType.Special: return "奥義";
        case SkillType.Support: return "サポート";
        default: return "";
    }
}
function getSkillType(typeName) {
    switch (typeName) {
        case "パッシブA": return SkillType.PassiveA;
        case "パッシブB": return SkillType.PassiveB;
        case "パッシブC": return SkillType.PassiveC;
        case "サポート": return SkillType.Support;
        case "奥義": return SkillType.Special;
        default: return SkillType.Unknown;
    }
}
function getTypeClassName(typeName) {
    switch (typeName) {
        case "パッシブA":
            return "passiveA";
        case "パッシブB":
            return "passiveB";
        case "パッシブC":
            return "passiveC";
        case "奥義":
            return "special";
        case "サポート":
            return "support";
        default:
            return "";
    }
}

const g_iconRoot = "https://fire-emblem.fun/images/FehSkillIcons/";
const g_extensionCandidates = [".png", ".webp"];
function* enumerateSkillIconCandidates(type, englishName) {
    switch (type) {
        case "奥義":
            yield g_iconRoot + "Special.png";
        case "武器":
            yield iconName = g_iconRoot + "Weapon.png";
        case "サポート":
            yield g_iconRoot + "Support.png";
        default:
            for (const iconName of enumerateSkillIconNamesByEnglishName(type, englishName)) {
                for (const ext of g_extensionCandidates) {
                    yield getSkillIconPathImpl(type, iconName, ext);
                }
            }
    }
}

/**
 * @param  {string} type
 * @param  {string} englishName
 */
function* enumerateSkillIconNamesByEnglishName(type, englishName) {
    if (englishName !== null && englishName !== "") {
        let iconName = englishName
            .replace(/ /g, "_")
            .replace(/\//g, "_")
            .replace(/'/g, "")
            .replace(/!/g, "")
            .replace(/Ⅱ/g, "II")
            .replace(/ð/g, "d");

        if (englishName.endsWith("+")) {
            iconName = iconName.replace("+", "_Plus");
        } else {
            iconName = iconName.replace("+", "Plus_");
        }

        yield iconName;
        yield iconName.replace("-", "_");
    }
}

function getSkillIconPathImpl(type, iconName, ext) {
    if (type === "パッシブA") {
        return g_iconRoot + "PassiveA/" + iconName + ext;
    } else if (type === "パッシブB") {
        return g_iconRoot + "PassiveB/" + iconName + ext;
    } else if (type === "パッシブC") {
        return g_iconRoot + "PassiveC/" + iconName + ext;
    } else if (type === "聖印") {
        return g_iconRoot + "SacredSeal/" + iconName + ext;
    } else if (type === "隊長") {
        return g_iconRoot + "Captain/" + iconName + ext;
    }

    return null;
}


function getScoreLabel(score) {
    switch (score) {
        case 0:
            return "恒常★4、★4習得";
        case 5:
            return "恒常★4、★5習得";
        case 10:
            return "聖印あり";
        case 20:
            return "聖杯";
        case 30:
            return "★4特別チャンス";
        case 40:
            return "恒常★5";
        case 50:
            return "旧伝承神階";
        case 60:
            return "伝承神階";
        case 65:
            return "攻撃神階";
        case 70:
            return "超英雄★4";
        case 80:
            return "超英雄★5";
        case 90:
            return "魔器";
        default:
            return score;
    }
}

class SkillInfo {
    constructor(id, type, name, sp, iconCandidates, releaseDate, isCombatManualAvailable) {
        this.id = id;
        this.type = type;
        this.typeValue = getSkillType(type);
        this.name = name;
        this.sp = sp
        this.iconIndex = 0;
        this.iconCandidates = iconCandidates;
        this.releaseDate = "";
        this.releaseDateValue = 0;
        this.__setReleaseDate(releaseDate);

        /** @type {boolean} */
        this.isCombatManualAvailable = isCombatManualAvailable;

        this.score = 0;

        this.totalCount = 0;
        this.heroicGrailHeroCount = 0;
        this.normal5HeroCount = 0;
        this.normal4HeroCount = 0;
        this.normal4HeroLearn4Count = 0;
        this.normal4SpecialHeroCount = 0;
        this.special5HeroCount = 0;
        this.special4HeroCount = 0;
        this.rearmedHeroCount = 0;
        this.mythicHeroCount = 0;
        this.atkMythicHeroCount = 0;
        this.legendaryHeroCount = 0;
        this.legendaryRemixHeroCount = 0;
        this.isSacredSealAvailable = false;
    }

    getUrl() {
        return `https://fire-emblem.fun/?fehskill=${this.id}`;
    }

    getIconPath() {
        if (this.iconIndex < this.iconCandidates.length) {
            return this.iconCandidates[this.iconIndex];
        }
        else {
            return "";
        }
    }

    updateIconPath() {
        ++this.iconIndex;
    }

    __estimateReleaseDate(heroQueryResult) {
        const releaseDateIndex = heroQueryResult.columns.indexOf("release_date");
        const releaseDates = Array.from(heroQueryResult.values.map(x => x[releaseDateIndex]).sort());
        if (releaseDates.length > 0) {
            this.__setReleaseDate(releaseDates[0]);
        }
    }

    __setReleaseDate(releaseDate) {
        if (releaseDate == null) return;
        this.releaseDate = releaseDate;
        this.releaseDateValue = Number(releaseDate.replace(/-/g, ''));
    }

    analyze(heroQueryResult) {
        if (this.releaseDate == null || this.releaseDate == "") {
            // スキルDBに未登録のケースがあるので、ついでに習得キャラから推定する
            this.__estimateReleaseDate(heroQueryResult);
        }

        const howToGetIndex = heroQueryResult.columns.indexOf("how_to_get");
        const rarityIndex = heroQueryResult.columns.indexOf("rarity3");
        const skillRarityIndex = heroQueryResult.columns.indexOf("skill_rarity");
        const specialTypeIndex = heroQueryResult.columns.indexOf("special_type");
        for (const heroRowData of heroQueryResult.values) {
            const howToGet = heroRowData[howToGetIndex];
            if (isNullOrEmpty(howToGet)) {
                continue;
            }

            this.totalCount++;
            const rarity = heroRowData[rarityIndex];
            const isStar4 = rarity.includes("4");
            switch (howToGet) {
                case "魔器英雄":
                    ++this.rearmedHeroCount;
                    break;
                case "超英雄":
                    if (isStar4) {
                        ++this.special4HeroCount;
                    }
                    else {
                        ++this.special5HeroCount;
                    }
                    break;
                case "伝承英雄ガチャ":
                    ++this.legendaryHeroCount;
                    break;
                case "神階英雄ガチャ":
                    const specialType = heroRowData[specialTypeIndex];
                    if (mb_strpos(specialType, "光") !== false || mb_strpos(specialType, "天") !== false) {
                        ++this.atkMythicHeroCount;
                    }
                    else {
                        ++this.mythicHeroCount;
                    }
                    break;
                case "大英雄戦":
                case "戦渦の連戦":
                    ++this.heroicGrailHeroCount;
                    break;
                case "ガチャ":
                    if (isStar4) {
                        const name = this.name;
                        const raritiesSource = heroRowData[skillRarityIndex];
                        let skillRarity = 5;
                        if (!isNullOrEmpty(raritiesSource)) {
                            const skillRarities = parseSqlStringToArray(raritiesSource);
                            for (let skillRarityItem of skillRarities) {
                                const skillNameAndRarity = explode(":", skillRarityItem);
                                const skillName = skillNameAndRarity[0];
                                if (skillName == name) {
                                    skillRarity = intval(skillNameAndRarity[1]);
                                }
                            }
                        }

                        if (skillRarity < 5) {
                            ++this.normal4HeroLearn4Count;
                        }
                        else {
                            ++this.normal4HeroCount;
                        }
                    }
                    else {
                        ++this.normal5HeroCount;
                    }
                    break;
                default:
                    break;
            }
        }
    }

    updateScore() {
        this.score = this.calcScore();
    }


    calcScore() {
        const score = this.getBaseScore();
        return score;
    }

    getBaseScore() {
        // 以下で大きくランク付けする
        // 魔器英雄限定
        // 超英雄★5限定
        // 超英雄★4限定
        // 神階、伝承限定
        // 伝承Remix限定
        // ★5限定
        // ★4特別チャンス限定
        // 聖杯限定
        // 聖印ある
        // ★4以下排出
        if (this.normal4HeroLearn4Count > 0) {
            return 0;
        }
        if (this.normal4HeroCount > 0) {
            return 5;
        }
        if (this.isSacredSealAvailable) {
            return 10;
        }
        if (this.heroicGrailHeroCount > 0) {
            return 20;
        }
        if (this.normal4SpecialHeroCount > 0) {
            return 30;
        }
        if (this.normal5HeroCount > 0) {
            return 40;
        }
        if (this.legendaryRemixHeroCount > 0) {
            return 50;
        }
        if (this.mythicHeroCount > 0 || this.legendaryHeroCount > 0) {
            return 60;
        }
        if (this.atkMythicHeroCount > 0) {
            return 65;
        }
        if (this.special4HeroCount > 0) {
            return 70;
        }
        if (this.special5HeroCount > 0) {
            return 80;
        }
        if (this.rearmedHeroCount > 0) {
            return 90;
        }
        else {
            // 入手不可
            return -100;
        }
    }
}
class RankGroup {
    constructor(label, subgroups) {
        this.label = label;
        /** @type {RankSubGroup[]} */
        this.subgroups = subgroups;
        this.color = "#fff";
    }
}

class RankSubGroup {
    constructor(value, label, typeGroups) {
        this.value = value;
        this.label = label;
        /** @type {TypeGroup[]} */
        this.typeGroups = typeGroups;
        /** @type {boolean} */
        this.isVisible = true;

        /** @type {boolean} */
        this.isVisibleBySetting = true;
    }

    filterSKills(typeGroupFilterFunc, skillFilterFunc, sortSkillFunc) {
        for (const typeGroup of this.typeGroups) {
            typeGroup.isVisible = typeGroupFilterFunc(typeGroup);
            if (typeGroup.isVisible) {
                typeGroup.filterSKills(skillFilterFunc, sortSkillFunc);
            }
        }
        this.isVisible = this.isVisibleBySetting && this.typeGroups.some(x => x.isVisible);
    }
}

class TypeGroup {
    constructor(type, skills) {
        this.type = type;
        this.label = getSkillTypeName(type);
        /** @type {SkillInfo[]} */
        this.skills = skills;
        /** @type {SkillInfo[]} */
        this.filteredSkills = skills;
        this.isVisible = true;
    }
    filterSKills(filterFunc, sortFunc) {
        this.filteredSkills = Array.from(this.skills.filter(filterFunc).sort(sortFunc));
        this.isVisible = this.filteredSkills.length > 0;
    }
}


class LabeledBool {
    constructor(label, defaultValue) {
        this.label = label;
        this.value = defaultValue;
    }
}

function isNullOrEmpty(str) {
    return str == null || str == "";
}

const SortMethod = {
    LearnCount: 0,
    ReleaseDate: 1,
};
const SortMethodValues = Object.values(SortMethod);
function getSortMethodLabel(method) {
    switch (method) {
        case SortMethod.LearnCount: return "習得キャラ数少ない順";
        case SortMethod.ReleaseDate: return "リリース日新しい順";
    }
}

class AppData extends SqliteDatabase {
    constructor() {
        super();
        this.skillDb = null;
        this.heroDb = null;

        /** @type {RankGroup[]} */
        this.skillGroups = [];

        /** @type {SkillInfo[]} */
        this.skills = [];

        /** @type {RankSubGroup[]} */
        this.spGroups = [];

        /** @type {LabeledBool[]} */
        this.spVisibilities = [];

        this.sortMethod = SortMethod.LearnCount;

        // フィルタリング設定
        this.showPassiveA = true;
        this.showPassiveB = true;
        this.showPassiveC = true;
        this.showSupport = true;
        this.showSpecial = true;
        this.showReleaseDate = false;
        this.showLearnCount = true;
        this.showSkillsInCombatManual = true;
        this.skillNameFilterText = "";
    }

    clearSKillNameFilter() {
        this.skillNameFilterText = "";
        this.filterSkills();
    }

    filterSpGroups() {
        for (const spGroup of this.spGroups) {
            const visibility = this.spVisibilities[spGroup.value];
            spGroup.isVisibleBySetting = visibility.value;
        }
        this.filterSkills();
    }

    filterSkills() {
        let filterTexts = Array.from(this.skillNameFilterText.split(' ').filter(x => x.length > 0));

        let sortFunc = this.getSkillSortFunc();

        for (const group of this.skillGroups) {
            for (const subgroup of group.subgroups) {
                subgroup.filterSKills(
                    x => this.filterTypeGroup(x),
                    x => this.filter(x, filterTexts),
                    sortFunc);
            }
        }
    }

    getSkillSortFunc() {
        switch (this.sortMethod) {
            case SortMethod.LearnCount: return (a, b) => {
                let diff = a.totalCount - b.totalCount;
                if (diff == 0) {
                    // 同じ習得キャラ数ならリリース日新しい順
                    return b.releaseDateValue - a.releaseDateValue;
                }
                return diff;
            };
            case SortMethod.ReleaseDate: return (a, b) => b.releaseDateValue - a.releaseDateValue;
        }
        return null;
    }

    /**
     * @param  {TypeGroup} typeGroup
     */
    filterTypeGroup(typeGroup) {
        switch (typeGroup.type) {
            case SkillType.PassiveA:
                if (!this.showPassiveA) return false;
                break;
            case SkillType.PassiveB:
                if (!this.showPassiveB) return false;
                break;
            case SkillType.PassiveC:
                if (!this.showPassiveC) return false;
                break;
            case SkillType.Support:
                if (!this.showSupport) return false;
                break;
            case SkillType.Special:
                if (!this.showSpecial) return false;
                break;
        }
        return true;
    }
    /**
     * @param  {SkillInfo} skill
     * @param  {string[]} filterTexts
     */
    filter(skill, filterTexts) {
        if (!this.showSkillsInCombatManual) {
            if (skill.isCombatManualAvailable) {
                return false;
            }
        }
        return filterTexts.length == 0 || filterTexts.some(x => skill.name.includes(x));
    }

    initSkillGroups() {
        let scoreToRowList = {}
        for (const skill of this.skills) {
            const result = this.querySkillLearnableHeroes(skill.name);
            skill.analyze(result);
            skill.updateScore();

            const score = skill.score;
            const sp = skill.sp;
            const type = skill.typeValue;

            if (!scoreToRowList[score]) {
                scoreToRowList[score] = {};
            }
            if (!scoreToRowList[score][sp]) {
                scoreToRowList[score][sp] = {};
            }
            if (!scoreToRowList[score][sp][type]) {
                scoreToRowList[score][sp][type] = [];
            }
            scoreToRowList[score][sp][type].push(skill);
        }

        for (const score in scoreToRowList) {
            const spAndValues = scoreToRowList[score];
            const sps = Object.keys(spAndValues);
            const spGroups = sps.reverse().map(sp => {
                const typeAndValues = spAndValues[sp];
                const types = Object.keys(typeAndValues);
                const typeGroups = Array.from(types.map(type => new TypeGroup(Number(type), typeAndValues[type])));
                return new RankSubGroup(sp, 'SP' + sp, typeGroups);
            });

            for (let spGroup of spGroups) {
                this.spGroups.push(spGroup);
            }

            this.skillGroups.push(new RankGroup(getScoreLabel(Number(score)), Array.from(spGroups)));
        }

        const spValues = this.spGroups.reduce((accumulator, currentValue) => {
            if (!accumulator.includes(currentValue.value)) {
                accumulator.push(currentValue.value);
            }
            return accumulator;
        }, []);
        this.spVisibilities = {};
        for (let spVisibility of spValues.map(sp => new LabeledBool(sp, true))) {
            this.spVisibilities[spVisibility.label] = spVisibility;
        }

        this.skillGroups = this.skillGroups.reverse();
        for (let i = 0; i < this.skillGroups.length; ++i) {
            this.skillGroups[i].color = getTierListColor(i);
        }
    }

    initSkills() {
        const skills = [];
        const query = "select * from skills where inherit='可' and (type like 'パッシブ%' or type='奥義' or type='サポート') and '|'||name||'|' not in (select must_learn from skills where must_learn is not null) order by type, sp desc";
        const queryResult = this.skillDb.exec(query)[0];
        const idIndex = queryResult.columns.indexOf("id");
        const nameIndex = queryResult.columns.indexOf("name");
        const englishNameIndex = queryResult.columns.indexOf("english_name");
        const typeIndex = queryResult.columns.indexOf("type");
        const spIndex = queryResult.columns.indexOf("sp");
        const releaseDateIndex = queryResult.columns.indexOf("release_date");
        for (const columnValues of queryResult.values) {
            const name = columnValues[nameIndex];
            const englishName = columnValues[englishNameIndex];
            const type = columnValues[typeIndex];
            const sp = columnValues[spIndex];
            const icons = Array.from(enumerateSkillIconCandidates(type, englishName));
            let releaseDate = columnValues[releaseDateIndex];

            const queryResultCombatManual = this.heroDb.exec(`select * from combat_manual where hero_id in (select id from heroes where skills like '%|${name}|%')`);
            const isCombatManualAvailable = queryResultCombatManual.length > 0 && queryResultCombatManual[0].values.length > 0;

            skills.push(
                new SkillInfo(
                    columnValues[idIndex], type, name, sp, icons, releaseDate, isCombatManualAvailable)
            );
        }

        this.skills = skills;
    }

    init(initFunc = null) {
        this.initDatabase(() => {
            this.skillDb = this.dbs[0];
            this.heroDb = this.dbs[1];
            this.initSkills();
            this.initSkillGroups();
            this.filterSkills();
            if (initFunc != null) {
                initFunc();
            }
        });
    }

    /**
     * @param  {string} skillName
     */
    querySkillLearnableHeroes(skillName) {
        let query = `skills like '%|${skillName}|%'`;

        const lastIndex = skillName.length - 1;
        const lastChar = skillName[lastIndex];
        const num = parseInt(lastChar);
        if (!isNaN(num)) {
            const upperNumber = num + 1;
            const withoutLastChar = skillName.substring(0, lastIndex);
            for (let i = upperNumber; i <= 4; ++i) {
                query += ` or skills like '%|${withoutLastChar}${i}|%'`;
            }
        }

        const sql = `select * from heroes where ${query}`;
        const heroQueryResult = this.heroDb.exec(sql)[0];
        return heroQueryResult;
    }

    *__enumerateDbPaths() {
        yield "/db/feh-skills.sqlite3";
        yield "/db/feh-heroes.sqlite3";
    }
    __initDatabaseTable() {
    }
}


