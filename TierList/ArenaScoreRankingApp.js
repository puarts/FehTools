

let tmp_i = 0;
const EvalTarget = {
    ArenaScore: tmp_i++,
    MaxSp: tmp_i++,
    StatusScore: tmp_i++,
};

const EvalTargetToLabel = {};
EvalTargetToLabel[EvalTarget.ArenaScore] = "闘技場スコア";
EvalTargetToLabel[EvalTarget.MaxSp] = "最大SP";
EvalTargetToLabel[EvalTarget.StatusScore] = "査定総合値";

function selectTop2AssetSum3(a, b, c) {
    return Math.max(Math.max(a + b, a + c), b + c);
}
function selectTop2AssetSum4(a, b, c, d) {
    return Math.max(Math.max(Math.max(Math.max(Math.max(a + b, a + c), a + d), b + c), b + d), c + d);
}
function selectTop2AssetSum5(a, b, c, d, e) {
    return Math.max(Math.max(Math.max(Math.max(Math.max(Math.max(Math.max(Math.max(Math.max(a + b, a + c), a + d), a + e), b + c), b + d), b + e), c + d), c + e), d + e);
}


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


class AppData extends SqliteDatabase {
    constructor() {
        super();

        this.EvalTarget = EvalTarget;
        this.EvalTargetToLabel = EvalTargetToLabel;
        this.heroDb = null;
        this.skillDb = null;
        this.rankGroups = [];

        this.skillNameToRowDict = {};

        /** @type {HeroInfo[]} */
        this.heroInfos = [];

        this.selectedHeroId = 11;

        this.selectedHeroOrders = [];

        this.displayColorTypes = createBoolProps(ColorType, "ColorType", v => ColorTypeToIconPath[v]);
        this.displayMoveTypes = createBoolProps(MoveType, "MoveType", v => MoveTypeToIconPath[v]);
        this.displayWeaponTypes = createBoolProps(WeaponType, "WeaponType", v => weaponIconRoot + WeaponTypeToPath[v]);
        this.displayHowToGet = createBoolPropsFromStrArray(
            ["比翼", "双界", ...new Set(Object.values(howToGetDict))], "HowToGet");

        const dateNumber = getCurrentDateAsNumber();
        this.displayBook = createBoolPropsFromStrArray(
            getBooks(), "Book");
        this.displayBlessing = createBoolPropsFromStrArray(
            ["火", "水", "風", "地", "光", "闇", "天", "理", "なし"], "Blessing", v => v == "なし" ? "なし" : BlessingIcons[v]);
        this.displayRarity = createBoolPropsFromStrArray(
            ["5", "5/4", "4/3"], "Rarity");
        this.displayDancerTypes = createBoolPropsFromStrArray([true, false], "Dancer", v => v ? "踊り子" : "踊り子以外");

        this.isDuelSkillEnabled = true;
        this.treatsSacredSeal240 = false;
        this.treatsPassiveB300 = false;
        this.isAscendingOrder = false;
        this.treatsDancerAsDancer = true;

        this.evalTarget = EvalTarget.ArenaScore;
        this.displaysDoubledScore = true;

        this.showsNew = true;
        this.showsSp = false;

        this.message = "";
        this.filteredHeroCount = 0;
    }

    /**
     * @param  {ColorType} color
     */
    syncWeaponsFromColors(color, isEnabled) {
        for (const weaponProp of this.__enumerateWeaponPropsWhereSpecifiedColor(color)) {
            weaponProp.value = isEnabled;
        }
    }

    /**
     * @param  {ColorType} color
     * @returns {BoolProp[]}
     */
    *__enumerateWeaponPropsWhereSpecifiedColor(color) {
        switch (color) {
            case ColorType.Red:
                for (let weaponProp of this.displayWeaponTypes.filter(x => x.id == WeaponType.Sword
                    || x.id == WeaponType.RedBow
                    || x.id == WeaponType.RedDagger
                    || x.id == WeaponType.RedTome
                    || x.id == WeaponType.RedBreath
                    || x.id == WeaponType.RedBeast)
                ) {
                    yield weaponProp;
                }
                break;
            case ColorType.Blue:
                for (let weaponProp of this.displayWeaponTypes.filter(x => x.id == WeaponType.Lance
                    || x.id == WeaponType.BlueBow
                    || x.id == WeaponType.BlueDagger
                    || x.id == WeaponType.BlueTome
                    || x.id == WeaponType.BlueBreath
                    || x.id == WeaponType.BlueBeast)
                ) {
                    yield weaponProp;
                }
                break;
            case ColorType.Green:
                for (let weaponProp of this.displayWeaponTypes.filter(x => x.id == WeaponType.Axe
                    || x.id == WeaponType.GreenBow
                    || x.id == WeaponType.GreenDagger
                    || x.id == WeaponType.GreenTome
                    || x.id == WeaponType.GreenBreath
                    || x.id == WeaponType.GreenBeast)
                ) {
                    yield weaponProp;
                }
                break;
            case ColorType.Colorless:
                for (let weaponProp of this.displayWeaponTypes.filter(x => x.id == WeaponType.Staff
                    || x.id == WeaponType.ColorlessBow
                    || x.id == WeaponType.ColorlessDagger
                    || x.id == WeaponType.ColorlessTome
                    || x.id == WeaponType.ColorlessBreath
                    || x.id == WeaponType.ColorlessBeast)
                ) {
                    yield weaponProp;
                }
                break;
        }
    }

    calcStatusRankForSelectedHero() {
        const targetHeroInfo = this.heroInfos.find(x => x.id == this.selectedHeroId);
        let selectedHeroOrders = [];
        for (const key in EvalTarget) {
            const evalTarget = EvalTarget[key];
            const rankGroups = this.__createRankGroups(evalTarget);
            let order = 1;
            for (const group of rankGroups) {
                /** @type {HeroInfo[]} */
                const heroes = group.children;
                const index = heroes.indexOf(targetHeroInfo);
                if (index >= 0) {
                    break;
                }

                order += heroes.length;
            }
            selectedHeroOrders.push({ key: evalTarget, value: order });
        }

        selectedHeroOrders.sort((a, b) => a.value - b.value);
        this.selectedHeroOrders = selectedHeroOrders;
    }

    __createHeroInfos() {
        this.heroInfos = createHeroInfos(this.heroDb, ["エクラ"]);
        for (const heroInfo of this.heroInfos) {
            const isDancer = this.__examinesIsDancer(heroInfo);
            heroInfo.isDancer = isDancer;
        }
    }

    __examinesIsDancer(heroInfo) {
        for (const skillName of heroInfo.skillNames) {
            const rowData = this.skillNameToRowDict[skillName];
            if (rowData != null && rowData[4] == "Refresh") {
                return true;
            }
        }
        return false;
    }

    __evalValue(heroInfo, evalTarget) {
        switch (evalTarget) {
            case EvalTarget.ArenaScore:
                {
                    const score = this.__calcArenaScore(heroInfo);
                    return this.displaysDoubledScore ? score * 2 : score;
                }
            case EvalTarget.MaxSp:
                return calcMaxSp(
                    WeaponTypeToStr[heroInfo.weaponType], heroInfo.skillNames, this.skillNameToRowDict,
                    this.treatsDancerAsDancer && heroInfo.isDancer, this.treatsSacredSeal240);
            case EvalTarget.StatusScore:
                return this.__calcStatusScore(heroInfo);
            default:
                throw new Error("invalid evalTarget");
        }
    }

    __calcStatusScore(heroInfo) {
        const statusScore = calcStatusArenaScore(heroInfo.totalStatus, heroInfo.hasAsset4, heroInfo.duelScore,
            this.isDuelSkillEnabled ? getDuelRatingCache(ColorTypeToStr[heroInfo.color], MoveTypeToStr[heroInfo.moveType], heroInfo.isLegendOrMythic) : 0);
        return statusScore;
    }

    __calcArenaScore(heroInfo) {
        const statusScore = this.__calcStatusScore(heroInfo);
        const maxSp = calcMaxSp(
            WeaponTypeToStr[heroInfo.weaponType], heroInfo.skillNames, this.skillNameToRowDict,
            this.treatsDancerAsDancer && heroInfo.isDancer, this.treatsSacredSeal240, this.treatsPassiveB300);
        heroInfo.maxSp = maxSp;
        const arenaScore = calcArenaScore(statusScore, maxSp, heroInfo.isOrderOfHeros ? 0 : 10, 5, 40);
        return arenaScore;
    }

    updateRankGroups() {
        let self = this;
        using(new ScopedStopwatch(x => this.message = `検索: ${x} ms`), () => {
            self.__updateRankGroups();
        });
    }

    __updateRankGroups() {
        this.rankGroups = this.__createRankGroups(this.evalTarget);
        for (let i = 0; i < this.rankGroups.length; ++i) {
            this.rankGroups[i].color = getTierListColor(i);
        }
    }

    __getTargetHeros() {
        const enabledMoveTypes = this.displayMoveTypes.filter(x => x.value).map(x => x.id);
        const skipsMoveTypes = enabledMoveTypes.length == 0 || enabledMoveTypes.length == this.displayMoveTypes.length;

        const enabledWeaponTypes = this.displayWeaponTypes.filter(x => x.value).map(x => x.id);
        const skipsWeaponTypes = enabledWeaponTypes.length == 0 || enabledWeaponTypes.length == this.displayWeaponTypes.length;

        const enabledColorTypes = this.displayColorTypes.filter(x => x.value).map(x => x.id);
        const skipsColorTypes = enabledColorTypes.length == 0 || enabledColorTypes.length == this.displayColorTypes.length;

        const enabledHowToGet = this.displayHowToGet.filter(x => x.value).map(x => x.id);
        const skipsHowToGet = enabledHowToGet.length == 0 || enabledHowToGet.length == this.displayHowToGet.length;

        const enabledBook = this.displayBook.filter(x => x.value).map(x => x.id);
        const skipsBook = enabledBook.length == 0 || enabledBook.length == this.displayBook.length;

        const enabledBlessing = this.displayBlessing.filter(x => x.value).map(x => x.id);
        const skipsBlessing = enabledBlessing.length == 0 || enabledBlessing.length == this.displayBlessing.length;

        const enabledRarity = this.displayRarity.filter(x => x.value).map(x => x.id);
        const skipsRarity = enabledRarity.length == 0 || enabledRarity.length == this.displayRarity.length;

        const enabledDancer = this.displayDancerTypes.filter(x => x.value).map(x => x.id);
        const skipsDancer = enabledDancer.length == 0 || enabledDancer.length == this.displayDancerTypes.length;



        const heroes = this.heroInfos
            .filter(x =>
                (skipsMoveTypes || enabledMoveTypes.includes(x.moveType))
                && (skipsWeaponTypes || enabledWeaponTypes.includes(x.weaponType))
                && (skipsColorTypes || enabledColorTypes.includes(x.color))
                && (skipsHowToGet || enabledHowToGet.includes(x.howToGet))
                && (skipsBook || enabledBook.includes(x.book))
                && (skipsBlessing || enabledBlessing.includes(x.blessing))
                && (skipsRarity || enabledRarity.includes(x.rarityStr))
                && (skipsDancer || enabledDancer.includes(x.isDancer))
            );
        return heroes;
    }
    /**
     * @param  {Number} evalTarget
     * @returns {RankGroup[]}
     */
    __createRankGroups(evalTarget) {
        const evalValueToHeroes = {};
        const heroes = this.__getTargetHeros();
        this.filteredHeroCount = heroes.length;
        for (const info of heroes) {
            const evalValue = this.__evalValue(info, evalTarget);
            if (!evalValueToHeroes[evalValue]) {
                evalValueToHeroes[evalValue] = [];
            }
            evalValueToHeroes[evalValue].push(info);
        }

        const groups = [];
        for (const key in evalValueToHeroes) {
            /** @type {HeroInfo[]} */
            const heroes = evalValueToHeroes[key];
            // heroes.sort(
            groups.push(new RankGroup(key, heroes));
        }

        return this.isAscendingOrder ? groups : groups.reverse();
    }

    __querySkill(query) {
        let result = null;
        try {
            result = this.skillDb.exec(query);
        } catch (e) {
            console.error(`failed to execute: ${query}\n${e.message}\n${e.stack}`);
        }
        return result;

    }

    __createSkillDict() {
        let skillQueryResult = this.__querySkill("select id,name,sp,type,assist_type from skills");
        let skillRows = skillQueryResult[0].values;
        let nameToRowDict = {};
        for (let row of skillRows) {
            let name = row[1];
            nameToRowDict[name] = row;
        }
        return nameToRowDict;
    }

    init(afterInitFunc = null) {
        this.initDatabase(() => {
            this.heroDb = this.dbs[0];
            this.skillDb = this.dbs[1];
            this.skillNameToRowDict = this.__createSkillDict();

            createInheritableDuelDict(query => this.__querySkill(query));

            this.__createHeroInfos();
            this.updateRankGroups();
            if (afterInitFunc != null) {
                afterInitFunc();
            }
        });
    }

    *__enumerateDbPaths() {
        yield "/db/feh-heroes.sqlite3";
        yield "/db/feh-skills.sqlite3";
    }
}
