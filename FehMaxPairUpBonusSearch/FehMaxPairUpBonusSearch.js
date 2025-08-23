class SkillInfo {
    constructor(name, atkAdd, spdAdd, defAdd, resAdd) {
        this.name = name;
        this.atkAdd = atkAdd;
        this.spdAdd = spdAdd;
        this.defAdd = defAdd;
        this.resAdd = resAdd;
    }
}

const g_heroIdToStatusAdd = {
    931: new SkillInfo("夢想の翼槍", 16 + 5, 5, 5, 5), // クロエ
    1162: new SkillInfo("意気軒昂の夏祭の斧", 16 + 5, 5, 5, 5), // 浴衣ワユ
};

const g_aSkills = {
    "獅子奮迅4": [4, 4, 4, 4],
    "獅子奮迅3": [3, 3, 3, 3],
    "堅牢城塞": [-3, 0, 7, 7],
    "野戦築城": [-5, 0, 7, 7],
    "守備魔防の城塞3": [-2, 0, 6, 6],
    "守備魔防の城塞2": [-3, 0, 4, 4],
    "限界死線": [8, 8, -8, -8],
    "死線4": [7, 7, -5, -5],
    "死線3": [5, 5, -5, -5],
    "止水4": [7, 0, -5, 7],
    "止水3": [5, 0, -5, 5],
    "不壊4": [7, 0, 7, -5],
    "不壊3": [5, 0, 5, -5],
    "死闘4": [2, 2, 2, 2],
    "攻撃速さ2": [2, 2, 0, 0],
    "攻撃守備2": [2, 0, 2, 0],
    "攻撃魔防2": [2, 0, 0, 2],
    "速さ守備2": [0, 2, 2, 0],
    "速さ魔防2": [0, 2, 0, 2],
    "守備魔防2": [0, 0, 2, 2],
    "攻撃3": [3, 0, 0, 0],
    "速さ3": [0, 3, 0, 0],
    "守備3": [0, 0, 3, 0],
    "魔防3": [0, 0, 0, 3],
};
const g_sacredSeals = {
    "なし": [0, 0, 0, 0],
    "獅子奮迅3": [3, 3, 3, 3],
    "守備魔防の城塞2": [-3, 0, 4, 4],
    "死線3": [5, 5, -5, -5],
    "止水3": [5, 0, -5, 5],
    "攻撃速さ2": [2, 2, 0, 0],
    "攻撃守備2": [2, 0, 2, 0],
    "攻撃魔防2": [2, 0, 0, 2],
    "速さ守備2": [0, 2, 2, 0],
    "速さ魔防2": [0, 2, 0, 2],
    "守備魔防2": [0, 0, 2, 2],
    "攻撃3": [3, 0, 0, 0],
    "速さ3": [0, 3, 0, 0],
    "守備3": [0, 0, 3, 0],
    "魔防3": [0, 0, 0, 3],
    "第71迷宮の覇者3": [3, 3, 0, 0],
    "第72迷宮の覇者3": [3, 0, 3, 0],
    "第73迷宮の覇者3": [3, 0, 0, 3],
    "第74迷宮の覇者3": [0, 3, 3, 0],
    "第75迷宮の覇者3": [0, 3, 0, 3],
    "第76迷宮の覇者3": [0, 0, 3, 3],
    "第77迷宮の覇者3": [3, 3, 3, 0],
    "第78迷宮の覇者3": [3, 3, 0, 3],
    "第79迷宮の覇者3": [3, 0, 3, 3],
    "第80迷宮の覇者3": [0, 3, 3, 3],
};

/**
 * @param  {HeroInfo} heroInfo
 * @param  {string} skillName
 */
function canEquip(heroInfo, skillName) {
    return canWeaponTypeEquip(heroInfo.weaponType, skillName)
        && canMoveTypeEquip(heroInfo.moveType, skillName);
}
/**
 * @param  {WeaponType} weaponType
 * @param  {sring} skillName
 */
function canWeaponTypeEquip(weaponType, skillName) {
    if (weaponType == WeaponType.Staff) {
        return !skillName.startsWith("獅子奮迅")
            && !skillName.startsWith("死線")
    }
    return true;
}
/**
 * @param  {MoveType} moveType
 * @param  {string} skillName
 */
function canMoveTypeEquip(moveType, skillName) {
    if (moveType == MoveType.Armor) {
        return skillName != "死闘";
    }
    return true;
}

/**
 * @param  {HeroInfo} heroInfo
 */
function extractStatusPlusValues(heroInfo) {
    const plusValues = {};
    plusValues["HP"] = heroInfo.hpLv1;
    plusValues["攻撃"] = heroInfo.atkLv1;
    plusValues["速さ"] = heroInfo.spdLv1;
    plusValues["守備"] = heroInfo.defLv1;
    plusValues["魔防"] = heroInfo.resLv1;

    const sortedPlusValues = Object.entries(plusValues).sort((a, b) => b[1] - a[1]);
    const top5Keys = sortedPlusValues.slice(0, 5).map(entry => entry[0]);

    const result = {};
    top5Keys.forEach((key, index) => {
        result[key] = index < 3 ? 1 : 0;
    });

    return result;
}

class HeroStatusInfo {
    constructor(
        heroInfo,
        assetAdds,
        weaponRefineAdds,
        skillAdds,
        dragonflowerAdds,
        neutralTraitsMergeAdds
    ) {
        /** @type {HeroInfo} */
        this.heroInfo = heroInfo;
        this.assetAdds = assetAdds;
        this.weaponRefineAdds = weaponRefineAdds;
        this.skillAdds = skillAdds;
        this.dragonflowerAdds = dragonflowerAdds;
        this.neutralTraitsMergeAdds = neutralTraitsMergeAdds;

        this.weaponName = this.getWeaponName();
    }

    getWeaponName() {
        const wt = WeaponTypeToStr[this.heroInfo.weaponType];
        if (this.heroInfo.id in g_heroIdToStatusAdd) {
            const statusAdds = g_heroIdToStatusAdd[this.heroInfo.id];
            return statusAdds.name;
        }
        if (wt.includes("弓")) {
            return "ロウソクの弓+";
        }
        if (wt.includes("暗器")) {
            return "びっくり箱+";
        }
        if (wt.includes("竜")) {
            return "灼熱のブレス+";
        }
        if (wt.includes("獣")) {
            if (this.heroInfo.moveType == MoveType.Cavalry) {
                return "魔器・虚無の角";
            }
            return "専用武器";
        }
        switch (wt) {
            case "剣": return "銀の剣+";
            case "斧": return "銀の斧+";
            case "槍": return "銀の槍+";
            case "青魔": return "カボチャの行灯+";
            case "緑魔": return "フラスコ+";
            case "赤魔": return "ノスフェラート+";
            case "無魔": return "アトラース+";
            case "杖": return "フィアー+";
        }
    }

    /**
     * @param  {HeroInfo} heroInfo
     */
    static createHeroStatusInfo(heroInfo) {
        const atkH = heroInfo.atkAssetAdd;
        const spdH = heroInfo.spdAssetAdd;
        const defH = heroInfo.defAssetAdd;
        const resH = heroInfo.resAssetAdd;

        const wt = WeaponTypeToStr[heroInfo.weaponType];
        let refineAtkAdd = 2;
        let refineSpdAdd = 3;
        let refineDefAdd = 4;
        let refineResAdd = 4;
        if (wt.includes("弓") || wt.includes("暗器") || wt.includes("魔")) {
            refineAtkAdd = 1;
            refineSpdAdd = 2;
            refineDefAdd = 3;
            refineResAdd = 3;
        }

        let atkAdd = 0;
        let spdAdd = 0;
        let defAdd = 0;
        let resAdd = 0;
        if (heroInfo.id in g_heroIdToStatusAdd) {
            const statusAdds = g_heroIdToStatusAdd[heroInfo.id];
            atkAdd += statusAdds.atkAdd;
            spdAdd += statusAdds.spdAdd;
            defAdd += statusAdds.defAdd;
            resAdd += statusAdds.resAdd;
            refineAtkAdd = 0;
            refineSpdAdd = 0;
            refineDefAdd = 0;
            refineResAdd = 0;
        }
        else if (wt.includes("弓") || wt.includes("暗器") || wt === "緑魔" || wt === "青魔") {
            atkAdd += 12 + 3;
            spdAdd += 3;
            defAdd += 3;
            resAdd += 3;
        } else if (wt.includes("魔")) {
            atkAdd += 14;
        } else if (wt.includes("獣")) {
            atkAdd += 14;
            if (heroInfo.moveType != MoveType.Cavalry) {
                // todo: 専用武器が武器錬成済みかどうか

                // if (!canRefineWeapon(heroInfo)) {
                //     refineAtkAdd = 0;
                //     refineSpdAdd = 0;
                //     refineDefAdd = 0;
                //     refineResAdd = 0;
                // }
            }
        } else if (wt === "杖") {
            // todo: 専用武器持ちは14
            atkAdd += 12;
        } else {
            atkAdd += 16;
        }

        const statusPlusValues = extractStatusPlusValues(heroInfo);
        return new HeroStatusInfo(
            heroInfo,
            [atkH, spdH, defH, resH],
            [refineAtkAdd, refineSpdAdd, refineDefAdd, refineResAdd],
            [atkAdd, spdAdd, defAdd, resAdd],
            [
                heroInfo.maxDragonflowerPerStatus,
                heroInfo.maxDragonflowerPerStatus,
                heroInfo.maxDragonflowerPerStatus,
                heroInfo.maxDragonflowerPerStatus
            ],
            [statusPlusValues["攻撃"], statusPlusValues["速さ"], statusPlusValues["守備"], statusPlusValues["魔防"]]
        );
    }

}

class MaxPairUpBonusSearchResult {
    constructor(heroStatusInfo) {
        /** @type {HeroStatusInfo} */
        this.heroStatusInfo = heroStatusInfo;
        this.heroInfo = heroStatusInfo.heroInfo;
        this.isSummonerSupportEnabled = false;
        this.isAscendedTraitsEnabled = false;
        this.atk = 0;
        this.spd = 0;
        this.def = 0;
        this.res = 0;
        this.refineIndex = -1;
        this.asset1Index = -1;
        this.asset2Index = -1;
        this.passiveA = "";
        this.sacredSeal = "";
        this.weapon = "";
    }

    get atkClass() {
        return this.isAtkAsset ? "asset" : "";
    }
    get spdClass() {
        return this.isSpdAsset ? "asset" : "";
    }
    get defClass() {
        return this.isDefAsset ? "asset" : "";
    }
    get resClass() {
        return this.isResAsset ? "asset" : "";
    }

    get isAtkAsset() {
        return this.asset1Index === 0 || this.asset2Index === 0;
    }
    get isSpdAsset() {
        return this.asset1Index === 1 || this.asset2Index === 1;
    }
    get isDefAsset() {
        return this.asset1Index === 2 || this.asset2Index === 2;
    }
    get isResAsset() {
        return this.asset1Index === 3 || this.asset2Index === 3;
    }
}


function enumerateMaxDoubleBonusStatus(
    thresholds,
    baseStatuses,
    refineAdds,
    ascendedAssetAdds,
    assetAdds,
    isAscendedTraitsEnabled
) {
    const results = {};

    function getKey(asset1Index, asset2Index) {
        return asset1Index + '' + asset2Index;
    }

    for (const statusInfo of enumerateStatuses(baseStatuses, refineAdds, ascendedAssetAdds, assetAdds, isAscendedTraitsEnabled)) {
        const [a, s, d, r] = statusInfo;
        if (a >= thresholds[0] && s >= thresholds[1] && d >= thresholds[2] && r >= thresholds[3]) {
            const refineIndex = statusInfo[4];
            const asset1Index = statusInfo[5];
            const asset2Index = statusInfo[6];
            const key = getKey(asset1Index, asset2Index);

            const refineAdd = refineAdds[refineIndex];
            const a_nr = a - refineAdd[0];
            const s_nr = s - refineAdd[1];
            const d_nr = d - refineAdd[2];
            const r_nr = r - refineAdd[3];
            const result = [a, s, d, r, refineIndex, asset1Index, asset2Index];

            if (a_nr >= thresholds[0] && s_nr >= thresholds[1] && d_nr >= thresholds[2] && r_nr >= thresholds[3]) {
                result[0] = a_nr;
                result[1] = s_nr;
                result[2] = d_nr;
                result[3] = r_nr;
                const newKey = getKey(asset1Index, asset2Index) + '-1';
                if (results[newKey]) {
                    continue;
                }
            } else {
                const newKey = getKey(asset1Index, asset2Index) + refineIndex;
                if (results[newKey]) {
                    continue;
                }
            }

            results[key] = result;
        }
    }

    return results;
}


function* enumerateStatuses(baseStatuses, refineAdds, ascendedAssetAdds, assetAdds, isAscendedTraitsEnabled) {
    const refineCount = refineAdds.length;
    for (let refineIndex = 0; refineIndex < refineCount; ++refineIndex) {
        const refineAdd = refineAdds[refineIndex];
        yield* enumerateStatusesImpl(baseStatuses, refineIndex, refineAdd, ascendedAssetAdds, assetAdds, isAscendedTraitsEnabled);
    }
}

function* enumerateStatusesImpl(baseStatuses, refineIndex, refineAdd, ascendedAssetAdds, assetAdds, isAscendedTraitsEnabled) {
    const base = [
        baseStatuses[0] + refineAdd[0],
        baseStatuses[1] + refineAdd[1],
        baseStatuses[2] + refineAdd[2],
        baseStatuses[3] + refineAdd[3]
    ];
    const count = assetAdds.length;
    const ascendedAssetCount = ascendedAssetAdds.length;

    for (let i = 0; i < count; ++i) {
        const assetAdd1 = assetAdds[i];
        if (isAscendedTraitsEnabled) {
            for (let j = i + 1; j < ascendedAssetCount; ++j) {
                const ascendedAssetAdd = ascendedAssetAdds[j];
                const result = [0, 0, 0, 0, refineIndex, i, j];
                for (let k = 0; k < 4; ++k) {
                    result[k] = base[k] + assetAdd1[k] + ascendedAssetAdd[k];
                }
                yield result;
            }
        } else {
            const result = [0, 0, 0, 0, refineIndex, i, -1];
            for (let k = 0; k < 4; ++k) {
                result[k] = base[k] + assetAdd1[k];
            }
            yield result;
        }
    }
}

/**
 * @param  {HeroStatusInfo} heroStatusInfo
 * @param  {} thresholds
 * @param  {} passiveSkillAdds
 * @param  {} isSummonerSupportEnabled
 * @param  {} isAscendedTraitsEnabled
 * @returns {MaxPairUpBonusSearchResult[]}
 */
function* enumerateStatusRowIfMaxDoubleBonusStatus(
    statusAddValuesPerAssets,
    heroStatusInfo,
    thresholds,
    passiveSkillAdds,
    isSummonerSupportEnabled,
    isAscendedTraitsEnabled,
    merges,
    dragonflowers
) {
    const assetAdds = heroStatusInfo.assetAdds;
    const weaponRefineAdds = heroStatusInfo.weaponRefineAdds;
    const weaponSkillAdds = heroStatusInfo.skillAdds;
    const statusBase = [
        heroStatusInfo.heroInfo.atk,
        heroStatusInfo.heroInfo.spd,
        heroStatusInfo.heroInfo.def,
        heroStatusInfo.heroInfo.res,
    ];
    // const dfAdds = heroStatusInfo.dragonflowerAdds;
    // const statusPlusValues = heroStatusInfo.neutralTraitsMergeAdds;

    let allStatusAdd = 0;
    // allStatusAdd += 4; // 限界突破分
    if (isSummonerSupportEnabled) {
        allStatusAdd += 2;
    }
    if (heroStatusInfo.heroInfo.resplendent) {
        allStatusAdd += 2;
    }
    const baseStatuses = [0, 0, 0, 0];

    const mergeAdd = merges * 2 / 5;
    const dragonflowerAdd = dragonflowers / 5 + 1;
    for (let i = 0; i < 4; ++i) {
        const baseStatus = statusBase[i] + allStatusAdd
            //+ dfAdds[i]
            + passiveSkillAdds[i]
            + weaponSkillAdds[i];
        baseStatuses[i] = baseStatus;
        if (baseStatus + assetAdds[i] + weaponRefineAdds[i] + mergeAdd + dragonflowerAdd < thresholds[i]) {
            return;
        }
    }

    const refineAddsPattern = [
        [weaponRefineAdds[0], 0, 0, 0],
        [0, weaponRefineAdds[1], 0, 0],
        [0, 0, weaponRefineAdds[2], 0],
        [0, 0, 0, weaponRefineAdds[3]],
    ];
    const assetAddsPattern = [
        [heroStatusInfo.assetAdds[0], 0, 0, 0],
        [0, heroStatusInfo.assetAdds[1], 0, 0],
        [0, 0, heroStatusInfo.assetAdds[2], 0],
        [0, 0, 0, heroStatusInfo.assetAdds[3]],
        // [statusPlusValues[0], statusPlusValues[1], statusPlusValues[2], statusPlusValues[3]],
    ];

    const statuses = enumerateMaxDoubleBonusStatus(
        thresholds,
        baseStatuses,
        refineAddsPattern,
        assetAddsPattern,
        statusAddValuesPerAssets,
        isAscendedTraitsEnabled
    );

    for (const status in statuses) {
        const values = statuses[status];
        const result = new MaxPairUpBonusSearchResult(heroStatusInfo);
        result.isSummonerSupportEnabled = isSummonerSupportEnabled;
        result.isAscendedTraitsEnabled = isAscendedTraitsEnabled;
        result.atk = values[0];
        result.spd = values[1];
        result.def = values[2];
        result.res = values[3];
        result.refineIndex = values[4];
        result.asset1Index = values[5];
        result.asset2Index = values[6];
        if (result.asset2Index == 4) {
            // 基本はasset1が個性、asset2が開花だが、計算上、asset2が基準値になってる。
            // 開花が基準値はあり得ないので、個性と開花得意を入れ替えて、辻褄を合わせておく。
            result.asset2Index = result.asset1Index;
            result.asset1Index = 4;
        }
        yield result;
    }
}

const AssetIndexToLabel = {
    0: "攻",
    1: "速",
    2: "守",
    3: "魔",
    4: "無",
};
AssetIndexToLabel[-1] = "-";
/**
 * @param  {HeroStatusInfo} heroStatusInfo
 * @param  {Number} dragonflowers
 * @param {Number} merges
 * @returns {MaxPairUpBonusSearchResult[]}
 */
function enumerateMaxPairUpBonusSearchResults(
    heroStatusInfo,
    aSkills,
    sacredSeals,
    isSummonerSupportEnabledPatterns,
    isAscendedTraitsEnabledPatterns,
    dragonflowers,
    merges
) {
    const thresholds = [65, 50, 50, 50];

    const ivStatusList = [
        StatusType.Atk,
        StatusType.Spd,
        StatusType.Def,
        StatusType.Res,
        StatusType.None,
    ];

    const assetAddsPattern = [
        [0, 0, 0, 0], // インデックスを StatusType で引けるようにするためのダミー
        [heroStatusInfo.assetAdds[0], 0, 0, 0],
        [0, heroStatusInfo.assetAdds[1], 0, 0],
        [0, 0, heroStatusInfo.assetAdds[2], 0],
        [0, 0, 0, heroStatusInfo.assetAdds[3]],
    ];

    // 個性ごとに限界突破、神竜の花加味で計算
    const statusAddValuesPerAssets = [];
    for (let i = 0; i < ivStatusList.length; ++i) {
        const ivHigh = ivStatusList[i];

        // 苦手は影響のないHPにしておく
        const ivLow = ivHigh == StatusType.None ? StatusType.None : StatusType.Hp;

        const addValues = heroStatusInfo.heroInfo.calcStatusAddValuesByMergeAndDragonFlower(
            ivHigh, ivLow, StatusType.None, merges, dragonflowers);
        addValues.splice(0, 1);
        const assetAdds = assetAddsPattern[ivHigh];

        if (ivHigh != StatusType.None) {
            for (let j = 0; j < 4; ++j) {
                addValues[j] += assetAdds[j];
            }
        }

        statusAddValuesPerAssets.push(addValues);
    }


    let results = [];
    for (const skillLabelA in aSkills) {
        const aSkillAdds = aSkills[skillLabelA];

        for (const skillLabelSS in sacredSeals) {
            const sacredSealAdds = sacredSeals[skillLabelSS];

            const adds = [
                aSkillAdds[0] + sacredSealAdds[0],
                aSkillAdds[1] + sacredSealAdds[1],
                aSkillAdds[2] + sacredSealAdds[2],
                aSkillAdds[3] + sacredSealAdds[3]
            ];

            for (const isSummonerSupportEnabled of isSummonerSupportEnabledPatterns) {
                for (const isAscendedTraitsEnabled of isAscendedTraitsEnabledPatterns) {
                    const statusResults = enumerateStatusRowIfMaxDoubleBonusStatus(
                        statusAddValuesPerAssets,
                        heroStatusInfo,
                        thresholds,
                        adds,
                        isSummonerSupportEnabled,
                        isAscendedTraitsEnabled,
                        merges,
                        dragonflowers
                    );

                    for (const result of statusResults) {
                        result.passiveA = skillLabelA;
                        result.sacredSeal = skillLabelSS;
                        result.weapon = heroStatusInfo.weaponName;
                        results.push(result);
                    }
                }
            }
        }
    }
    return results;
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

        /** @type {HeroStatusInfo[]} */
        this.heroStatusInfos = [];

        /** @type {SelectOption[]} */
        this.heroOptions = [];

        /** @type {MaxPairUpBonusSearchResult[]} */
        this.results = [];

        this.isAscendedTraitsEnabled = false;
        this.isSummonerSupportEnabled = false;

        this.displayASkill = createBoolPropsFromStrArray(
            Object.keys(g_aSkills), "ASkill");
        this.displayASkill[1].value = true;

        this.displaySacredSeal = createBoolPropsFromStrArray(
            Object.keys(g_sacredSeals), "SacredSeal");

        this.displayColumns = createBoolPropsFromStrArray(
            ["排出レアリティ", "入手法", "限界突破", "神竜の花", "個性", "開花", "絆"], "Column");
        this.displayColumns[5].value = true;
        this.displayColumns[6].value = true;

        this.displayHowToGet = createBoolPropsFromStrArray(
            ["比翼", "双界", ...new Set(Object.values(howToGetDict))], "HowToGet");
        // this.displayHowToGet[2].value = true;
        // this.displayHowToGet[4].value = true;

        this.displayRarity = createBoolPropsFromStrArray(
            ["5", "5/4", "4/3"], "Rarity", x => `★${x}`);
        this.displayRarity[1].value = true;
        this.displayRarity[2].value = true;

        this.displayAscendedTraitsEnabled = createBoolPropsFromStrArray(
            ["true", "false"], "AscendedTraitsEnabled", x => x == "true" ? "あり" : "なし");
        this.displayAscendedTraitsEnabled[1].value = true;

        this.displaySummonerSupportEnabled = createBoolPropsFromStrArray(
            ["true", "false"], "SummonerSupportEnabled", x => x == "true" ? "あり" : "なし");
        this.displaySummonerSupportEnabled[1].value = true;

        this.searchHeroName = "";
        this.excludeHeroName = "";

        /** @type {Number} */
        this.dragonflowerOffset = 0;

        /** @type {Number} */
        this.dragonflowers = 0;

        /** @type {Number} */
        this.merges = 10;

        this.searchMessage = "";
    }

    get useSpecifiedDragonflower() {
        return this.dragonflowerOffset == -1;
    }

    updateResults() {
        this.searchMessage = "検索中..";
        this.__updateResults();
    }

    __updateResults() {
        const startTime = Date.now();

        let results = [];

        const enabledASkill = this.displayASkill.filter(x => x.value).map(x => x.id);
        const skipsASkill = enabledASkill.length == 0 || enabledASkill.length == this.displayASkill.length;
        const filteredASkills = skipsASkill ? g_aSkills : Object.fromEntries(Object.entries(g_aSkills).filter(([k, v]) => enabledASkill.includes(k)));


        const enabledSacredSeal = this.displaySacredSeal.filter(x => x.value).map(x => x.id);
        const skipsSacredSeal = enabledSacredSeal.length == 0 || enabledSacredSeal.length == this.displaySacredSeal.length;
        const filteredSacredSeals = skipsSacredSeal ? g_sacredSeals : Object.fromEntries(Object.entries(g_sacredSeals).filter(([k, v]) => enabledSacredSeal.includes(k)));

        const enabledHowToGet = this.displayHowToGet.filter(x => x.value).map(x => x.id);
        const skipsHowToGet = enabledHowToGet.length == 0 || enabledHowToGet.length == this.displayHowToGet.length;

        const enabledRarity = this.displayRarity.filter(x => x.value).map(x => x.id);
        const skipsRarity = enabledRarity.length == 0 || enabledRarity.length == this.displayRarity.length;

        let isAscendedTraitsEnabled = [];
        {
            for (let value of this.displayAscendedTraitsEnabled.filter(x => x.value).map(x => x.id)) {
                isAscendedTraitsEnabled.push(value == "true" ? true : false);
            }
            if (isAscendedTraitsEnabled.length == 0) {
                isAscendedTraitsEnabled = [true, false];
            }
        }

        let isSummonerSupportEnabled = [];
        {
            for (let value of this.displaySummonerSupportEnabled.filter(x => x.value).map(x => x.id)) {
                isSummonerSupportEnabled.push(value == "true" ? true : false);
            }
            if (isSummonerSupportEnabled.length == 0) {
                isSummonerSupportEnabled = [true, false];
            }
        }


        let filteredInfos = this.heroStatusInfos;
        const filterNames = Array.from(this.searchHeroName.split(" ").filter(x => x != ""));
        const filtersByName = filterNames.length > 0;

        const excludeNames = Array.from(this.excludeHeroName.split(" ").filter(x => x != ""));
        const excludesByName = excludeNames.length > 0;

        filteredInfos = filteredInfos.filter(x =>
            (!filtersByName || filterNames.some(y => x.heroInfo.name.includes(y)))
            && (!excludesByName || !excludeNames.some(y => x.heroInfo.name.includes(y)))
            && (skipsHowToGet || enabledHowToGet.includes(x.heroInfo.howToGet))
            && (skipsRarity || enabledRarity.includes(x.heroInfo.rarityStr))
        );

        const offsetDragonflowers = Number(this.dragonflowerOffset) * 5;
        const merges = Number(this.merges);

        let doneCount = 0;
        this.searchMessage = `${doneCount}`;
        const total = filteredInfos.length;
        const maxProcessCount = 100;
        const threadCount = total / maxProcessCount;
        for (let threadIndex = 0; threadIndex < threadCount; ++threadIndex) {
            setTimeout((args) => {
                const threadIndex = args[0];
                const offset = threadIndex * maxProcessCount;
                const threadProcessCount = offset + maxProcessCount >= total ? total % maxProcessCount : maxProcessCount;
                const end = offset + threadProcessCount;
                for (let heroIndex = offset; heroIndex < end; ++heroIndex) {
                    const info = filteredInfos[heroIndex];
                    const dragonflowers = this.useSpecifiedDragonflower ?
                        (Number(this.dragonflowers) > info.heroInfo.maxDragonflowers ? info.heroInfo.maxDragonflowers : Number(this.dragonflowers))
                        : (info.heroInfo.maxDragonflowers + offsetDragonflowers);
                    const equippableASkills = Object.fromEntries(Object.entries(filteredASkills).filter(([k, v]) => canEquip(info.heroInfo, k)));
                    const equippableSacredSeals = Object.fromEntries(Object.entries(filteredSacredSeals).filter(([k, v]) => canEquip(info.heroInfo, k)));
                    // try {
                    const tmpResults = enumerateMaxPairUpBonusSearchResults(
                        info,
                        equippableASkills,
                        equippableSacredSeals,
                        isSummonerSupportEnabled,
                        isAscendedTraitsEnabled,
                        dragonflowers,
                        merges
                    );
                    for (const result of tmpResults) {
                        result.merges = merges;
                        result.dragonflowers = dragonflowers;
                        results.push(result);
                    }
                    // } catch (error) {
                    //     // 例外が発生した場合の処理
                    //     const errorMessage = `"${info.heroInfo.name}"の評価でエラーが発生しました:`;
                    //     console.error(errorMessage, error.message);
                    //     this.searchMessage = errorMessage;
                    //     this.results = [];
                    //     return;
                    // }
                }
                doneCount += threadProcessCount;

                this.searchMessage = `検索中.. (${doneCount}/${total})`;
                if (doneCount == total) {
                    this.results = results;
                    const endTime = Date.now();
                    const diffMilliseconds = endTime - startTime;
                    this.searchMessage = `${this.results.length}件の結果(${diffMilliseconds}ミリ秒)`;
                }
            }, 0, [threadIndex]);
        }
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
                parseSqlStringToArray((row[keyToIndex["rarity3"]] ?? "").replaceAll('星', ''))
            );

            this.heroInfos.push(info);
            this.heroOptions.push(
                new SelectOption(info.name, info.id)
            );

            this.heroStatusInfos.push(HeroStatusInfo.createHeroStatusInfo(info));
        }
    }

    init(afterInitFunc = null) {
        this.initDatabase(() => {
            this.heroDb = this.dbs[0];
            this.__createHeroInfos();
            this.__updateResults();
            if (afterInitFunc != null) {
                afterInitFunc();
            }
        });
    }

    *__enumerateDbPaths() {
        yield "/db/feh-heroes.sqlite3";
    }
}