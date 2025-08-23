

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
    HpAtkDefRes: tmp_i++,
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
GetStatusFuncs[EvalTarget.Hp] = (info, traitsType) => info.getHp(traitsType);
GetStatusFuncs[EvalTarget.Atk] = (info, traitsType) => info.getAtk(traitsType);
GetStatusFuncs[EvalTarget.Spd] = (info, traitsType) => info.getSpd(traitsType);
GetStatusFuncs[EvalTarget.Def] = (info, traitsType) => info.getDef(traitsType);
GetStatusFuncs[EvalTarget.Res] = (info, traitsType) => info.getRes(traitsType);
GetStatusFuncs[EvalTarget.HpAtk] = (info, traitsType) => info.getHp(traitsType) + info.getAtk(traitsType);
GetStatusFuncs[EvalTarget.HpSpd] = (info, traitsType) => info.getHp(traitsType) + info.getSpd(traitsType);
GetStatusFuncs[EvalTarget.HpDef] = (info, traitsType) => info.getHp(traitsType) + info.getDef(traitsType);
GetStatusFuncs[EvalTarget.HpRes] = (info, traitsType) => info.getHp(traitsType) + info.getRes(traitsType);
GetStatusFuncs[EvalTarget.AtkSpd] = (info, traitsType) => info.getAtk(traitsType) + info.getSpd(traitsType);
GetStatusFuncs[EvalTarget.AtkDef] = (info, traitsType) => info.getAtk(traitsType) + info.getDef(traitsType);
GetStatusFuncs[EvalTarget.AtkRes] = (info, traitsType) => info.getAtk(traitsType) + info.getRes(traitsType);
GetStatusFuncs[EvalTarget.SpdDef] = (info, traitsType) => info.getSpd(traitsType) + info.getDef(traitsType);
GetStatusFuncs[EvalTarget.SpdRes] = (info, traitsType) => info.getSpd(traitsType) + info.getRes(traitsType);
GetStatusFuncs[EvalTarget.DefRes] = (info, traitsType) => info.getDef(traitsType) + info.getRes(traitsType);
GetStatusFuncs[EvalTarget.HpAtkSpd] = (info, traitsType) => info.hp + info.atk + info.spd + (traitsType == TraitsType.Asset ? selectTop2AssetSum3(info.hpAssetAdd, info.atkAssetAdd, info.spdAssetAdd) : traitsType == TraitsType.Flaw ? -selectTop2AssetSum3(-info.hpFlawAdd, -info.atkFlawAdd, -info.spdFlawAdd) : 0);
GetStatusFuncs[EvalTarget.HpAtkDef] = (info, traitsType) => info.hp + info.atk + info.def + (traitsType == TraitsType.Asset ? selectTop2AssetSum3(info.hpAssetAdd, info.atkAssetAdd, info.defAssetAdd) : traitsType == TraitsType.Flaw ? -selectTop2AssetSum3(-info.hpFlawAdd, -info.atkFlawAdd, -info.defFlawAdd) : 0);
GetStatusFuncs[EvalTarget.HpAtkRes] = (info, traitsType) => info.hp + info.atk + info.res + (traitsType == TraitsType.Asset ? selectTop2AssetSum3(info.hpAssetAdd, info.atkAssetAdd, info.resAssetAdd) : traitsType == TraitsType.Flaw ? -selectTop2AssetSum3(-info.hpFlawAdd, -info.atkFlawAdd, -info.resFlawAdd) : 0);
GetStatusFuncs[EvalTarget.HpSpdDef] = (info, traitsType) => info.hp + info.spd + info.def + (traitsType == TraitsType.Asset ? selectTop2AssetSum3(info.hpAssetAdd, info.spdAssetAdd, info.defAssetAdd) : traitsType == TraitsType.Flaw ? -selectTop2AssetSum3(-info.hpFlawAdd, -info.spdFlawAdd, -info.defFlawAdd) : 0);
GetStatusFuncs[EvalTarget.HpSpdRes] = (info, traitsType) => info.hp + info.spd + info.res + (traitsType == TraitsType.Asset ? selectTop2AssetSum3(info.hpAssetAdd, info.spdAssetAdd, info.resAssetAdd) : traitsType == TraitsType.Flaw ? -selectTop2AssetSum3(-info.hpFlawAdd, -info.spdFlawAdd, -info.resFlawAdd) : 0);
GetStatusFuncs[EvalTarget.HpDefRes] = (info, traitsType) => info.hp + info.def + info.res + (traitsType == TraitsType.Asset ? selectTop2AssetSum3(info.hpAssetAdd, info.defAssetAdd, info.resAssetAdd) : traitsType == TraitsType.Flaw ? -selectTop2AssetSum3(-info.hpFlawAdd, -info.defFlawAdd, -info.resFlawAdd) : 0);
GetStatusFuncs[EvalTarget.AtkSpdDef] = (info, traitsType) => info.atk + info.spd + info.def + (traitsType == TraitsType.Asset ? selectTop2AssetSum3(info.atkAssetAdd, info.spdAssetAdd, info.defAssetAdd) : traitsType == TraitsType.Flaw ? -selectTop2AssetSum3(-info.atkFlawAdd, -info.spdFlawAdd, -info.defFlawAdd) : 0);
GetStatusFuncs[EvalTarget.AtkSpdRes] = (info, traitsType) => info.atk + info.spd + info.res + (traitsType == TraitsType.Asset ? selectTop2AssetSum3(info.atkAssetAdd, info.spdAssetAdd, info.resAssetAdd) : traitsType == TraitsType.Flaw ? -selectTop2AssetSum3(-info.atkFlawAdd, -info.spdFlawAdd, -info.resFlawAdd) : 0);
GetStatusFuncs[EvalTarget.AtkDefRes] = (info, traitsType) => info.atk + info.def + info.res + (traitsType == TraitsType.Asset ? selectTop2AssetSum3(info.atkAssetAdd, info.defAssetAdd, info.resAssetAdd) : traitsType == TraitsType.Flaw ? -selectTop2AssetSum3(-info.atkFlawAdd, -info.defFlawAdd, -info.resFlawAdd) : 0);
GetStatusFuncs[EvalTarget.SpdDefRes] = (info, traitsType) => info.spd + info.def + info.res + (traitsType == TraitsType.Asset ? selectTop2AssetSum3(info.spdAssetAdd, info.defAssetAdd, info.resAssetAdd) : traitsType == TraitsType.Flaw ? -selectTop2AssetSum3(-info.spdFlawAdd, -info.defFlawAdd, -info.resFlawAdd) : 0);
GetStatusFuncs[EvalTarget.HpAtkSpdDef] = (info, traitsType) => info.hp + info.atk + info.spd + info.def + (traitsType == TraitsType.Asset ? selectTop2AssetSum4(info.hpAssetAdd, info.atkAssetAdd, info.spdAssetAdd, info.defAssetAdd) : traitsType == TraitsType.Flaw ? -selectTop2AssetSum4(-info.hpFlawAdd, -info.atkFlawAdd, -info.spdFlawAdd, -info.defFlawAdd) : 0);
GetStatusFuncs[EvalTarget.HpAtkSpdRes] = (info, traitsType) => info.hp + info.atk + info.spd + info.res + (traitsType == TraitsType.Asset ? selectTop2AssetSum4(info.hpAssetAdd, info.atkAssetAdd, info.spdAssetAdd, info.resAssetAdd) : traitsType == TraitsType.Flaw ? -selectTop2AssetSum4(-info.hpFlawAdd, -info.atkFlawAdd, -info.spdFlawAdd, -info.resFlawAdd) : 0);
GetStatusFuncs[EvalTarget.HpAtkDefRes] = (info, traitsType) => info.hp + info.atk + info.def + info.res + (traitsType == TraitsType.Asset ? selectTop2AssetSum4(info.hpAssetAdd, info.atkAssetAdd, info.defAssetAdd, info.resAssetAdd) : traitsType == TraitsType.Flaw ? -selectTop2AssetSum4(-info.hpFlawAdd, -info.atkFlawAdd, -info.defFlawAdd, -info.resFlawAdd) : 0);
GetStatusFuncs[EvalTarget.HpSpdDefRes] = (info, traitsType) => info.hp + info.spd + info.def + info.res + (traitsType == TraitsType.Asset ? selectTop2AssetSum4(info.hpAssetAdd, info.spdAssetAdd, info.defAssetAdd, info.resAssetAdd) : traitsType == TraitsType.Flaw ? -selectTop2AssetSum4(-info.hpFlawAdd, -info.spdFlawAdd, -info.defFlawAdd, -info.resFlawAdd) : 0);
GetStatusFuncs[EvalTarget.AtkSpdDefRes] = (info, traitsType) => info.atk + info.spd + info.def + info.res + (traitsType == TraitsType.Asset ? selectTop2AssetSum4(info.atkAssetAdd, info.spdAssetAdd, info.defAssetAdd, info.resAssetAdd) : traitsType == TraitsType.Flaw ? -selectTop2AssetSum4(-info.atkFlawAdd, -info.spdFlawAdd, -info.defFlawAdd, -info.resFlawAdd) : 0);
GetStatusFuncs[EvalTarget.HpAtkSpdDefRes] = (info, traitsType) => info.hp + info.atk + info.spd + info.def + info.res + (traitsType == TraitsType.Asset ? selectTop2AssetSum5(info.hpAssetAdd, info.atkAssetAdd, info.spdAssetAdd, info.defAssetAdd, info.resAssetAdd) : traitsType == TraitsType.Flaw ? -selectTop2AssetSum5(-info.hpFlawAdd, -info.atkFlawAdd, -info.spdFlawAdd, -info.defFlawAdd, -info.resFlawAdd) : 0);


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

class AppData extends SqliteDatabase {
    constructor() {
        super();

        this.EvalTarget = EvalTarget;
        this.EvalTargetToLabel = EvalTargetToLabel;
        this.heroDb = null;
        this.rankGroups = [];

        /** @type {HeroInfo[]} */
        this.heroInfos = [];

        /** @type {SelectOption[]} */
        this.heroOptions = [];

        this.selectedHeroId = 11;

        this.selectedHeroOrders = [];

        this.displayColorTypes = createBoolProps(ColorType, "ColorType", v => ColorTypeToIconPath[v]);
        this.displayMoveTypes = createBoolProps(MoveType, "MoveType", v => MoveTypeToIconPath[v]);
        this.displayWeaponTypes = createBoolProps(WeaponType, "WeaponType", v => weaponIconRoot + WeaponTypeToPath[v]);
        this.displayHowToGet = createBoolPropsFromStrArray(
            ["比翼", "双界", ...new Set(Object.values(howToGetDict))], "HowToGet");
        this.displayBook = createBoolPropsFromStrArray(
            [1, 2, 3, 4, 5, 6, 7, 8, 9], "Book");
        this.displayBlessing = createBoolPropsFromStrArray(
            ["火", "水", "風", "地", "光", "闇", "天", "理", "なし"], "Blessing", v => v == "なし" ? "なし" : BlessingIcons[v]);
        this.displayRarity = createBoolPropsFromStrArray(
            ["5", "5/4", "4/3"], "Rarity");

        this.isDragonflowerEnabled = true;
        this.isResplendentEnabled = true;
        this.isAssetStatusEnabled = true;
        this.isAscendingOrder = false;

        this.targetStatus = EvalTarget.Hp;

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
            const targetStatus = EvalTarget[key];
            const rankGroups = this.__createRankGroups(targetStatus);
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
            selectedHeroOrders.push({ key: targetStatus, value: order });
        }

        selectedHeroOrders.sort((a, b) => a.value - b.value);
        this.selectedHeroOrders = selectedHeroOrders;
    }

    __createHeroInfos() {
        this.heroInfos = createHeroInfos(this.heroDb);
        for (const info of this.heroInfos.sort((a, b) => a.releaseDateAsNumber - b.releaseDateAsNumber)) {
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


        const heroes = this.heroInfos
            .filter(x =>
                (skipsMoveTypes || enabledMoveTypes.includes(x.moveType))
                && (skipsWeaponTypes || enabledWeaponTypes.includes(x.weaponType))
                && (skipsColorTypes || enabledColorTypes.includes(x.color))
                && (skipsHowToGet || enabledHowToGet.includes(x.howToGet))
                && (skipsBook || enabledBook.includes(x.book))
                && (skipsBlessing || enabledBlessing.includes(x.blessing))
                && (skipsRarity || enabledRarity.includes(x.rarityStr))
            );
        return heroes;
    }
    /**
     * @param  {Number} targetStatus
     * @returns {RankGroup[]}
     */
    __createRankGroups(targetStatus) {
        const statusValueToHeroes = {};
        const heroes = this.__getTargetHeros();
        this.filteredHeroCount = heroes.length;
        const traitsType = this.isAssetStatusEnabled ? (!this.isAscendingOrder ? TraitsType.Asset : TraitsType.Flaw) : TraitsType.None;
        for (const info of heroes) {
            const evalValue = info.evalStatus(
                GetStatusFuncs[targetStatus](info, traitsType),
                this.isDragonflowerEnabled,
                this.isResplendentEnabled,
                EvalTargetToStatusCount[targetStatus]);
            if (!statusValueToHeroes[evalValue]) {
                statusValueToHeroes[evalValue] = [];
            }
            statusValueToHeroes[evalValue].push(info);
        }

        const groups = [];
        for (const key in statusValueToHeroes) {
            /** @type {HeroInfo[]} */
            const heroes = statusValueToHeroes[key];
            // heroes.sort(
            groups.push(new RankGroup(key, heroes));
        }

        return this.isAscendingOrder ? groups : groups.reverse();
    }

    init(afterInitFunc = null) {
        this.initDatabase(() => {
            this.heroDb = this.dbs[0];
            this.__createHeroInfos();
            this.updateRankGroups();
            if (afterInitFunc != null) {
                afterInitFunc();
            }
        });
    }

    *__enumerateDbPaths() {
        yield "/db/feh-heroes.sqlite3";
    }
}
