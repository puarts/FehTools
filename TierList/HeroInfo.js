const simulatorImageRoot = "/AetherRaidTacticsBoard/images/";

const TraitsType = {
    None: 0,
    Asset: 1,
    Flaw: 2
};

const ColorType = {
    Red: 0,
    Blue: 1,
    Green: 2,
    Colorless: 3,
};
const ColorTypeToStr = {}
ColorTypeToStr[ColorType.Red] = "赤";
ColorTypeToStr[ColorType.Blue] = "青";
ColorTypeToStr[ColorType.Green] = "緑";
ColorTypeToStr[ColorType.Colorless] = "無";
const strToColorType = {}
for (let key in ColorTypeToStr) {
    strToColorType[ColorTypeToStr[key]] = Number(key);
}
function getColorTypeFromStr(colorTypeStr) {
    return strToColorType[colorTypeStr];
}

const ColorTypeToIconPath = {}
ColorTypeToIconPath[ColorType.Red] = '/images/feh/ColorRed.png';
ColorTypeToIconPath[ColorType.Blue] = '/images/feh/ColorBlue.png';
ColorTypeToIconPath[ColorType.Green] = '/images/feh/ColorGreen.png';
ColorTypeToIconPath[ColorType.Colorless] = '/images/feh/ColorColorless.png';

const StatusType = {
    None: -1,
    Hp: 0,
    Atk: 1,
    Spd: 2,
    Def: 3,
    Res: 4,
};

const MoveType = {
    Infantry: 0,
    Flying: 1,
    Cavalry: 2,
    Armor: 3,
};

const MoveTypeToStr = {}
MoveTypeToStr[MoveType.Infantry] = "歩行";
MoveTypeToStr[MoveType.Flying] = "飛行";
MoveTypeToStr[MoveType.Cavalry] = "騎馬";
MoveTypeToStr[MoveType.Armor] = "重装";
const strToMoveType = {}
for (let key in MoveTypeToStr) {
    strToMoveType[MoveTypeToStr[key]] = Number(key);
}
function getMoveTypeFromStr(moveTypeStr) {
    return strToMoveType[moveTypeStr];
}

const MoveTypeToIconPath = {}
MoveTypeToIconPath[MoveType.Infantry] = simulatorImageRoot + "MoveType_Infantry.png";
MoveTypeToIconPath[MoveType.Flying] = simulatorImageRoot + "MoveType_Flier.png";
MoveTypeToIconPath[MoveType.Cavalry] = simulatorImageRoot + "MoveType_Cavarly.png";
MoveTypeToIconPath[MoveType.Armor] = simulatorImageRoot + "MoveType_Armor.png";
function getMoveTypeIcon(moveType) {
    return MoveTypeToIconPath[moveType];
}

const WeaponType = {
    Sword: 0,
    Lance: 1,
    Axe: 2,
    Staff: 14,

    RedBow: 6,
    BlueBow: 7,
    GreenBow: 8,
    ColorlessBow: 9,

    RedDagger: 10,
    BlueDagger: 11,
    GreenDagger: 12,
    ColorlessDagger: 13,

    RedTome: 3,
    BlueTome: 4,
    GreenTome: 5,
    ColorlessTome: 23,

    RedBreath: 15,
    BlueBreath: 16,
    GreenBreath: 17,
    ColorlessBreath: 18,

    RedBeast: 19,
    BlueBeast: 20,
    GreenBeast: 21,
    ColorlessBeast: 22,
};

const WeaponTypeToStr = {}
WeaponTypeToStr[WeaponType.Sword] = "剣";
WeaponTypeToStr[WeaponType.Lance] = "槍";
WeaponTypeToStr[WeaponType.Axe] = "斧";
WeaponTypeToStr[WeaponType.Staff] = "杖";
WeaponTypeToStr[WeaponType.RedTome] = "赤魔";
WeaponTypeToStr[WeaponType.BlueTome] = "青魔";
WeaponTypeToStr[WeaponType.GreenTome] = "緑魔";
WeaponTypeToStr[WeaponType.ColorlessTome] = "無魔";
WeaponTypeToStr[WeaponType.RedBreath] = "赤竜";
WeaponTypeToStr[WeaponType.BlueBreath] = "青竜";
WeaponTypeToStr[WeaponType.GreenBreath] = "緑竜";
WeaponTypeToStr[WeaponType.ColorlessBreath] = "無竜";
WeaponTypeToStr[WeaponType.RedBeast] = "赤獣";
WeaponTypeToStr[WeaponType.BlueBeast] = "青獣";
WeaponTypeToStr[WeaponType.GreenBeast] = "緑獣";
WeaponTypeToStr[WeaponType.ColorlessBeast] = "獣";
WeaponTypeToStr[WeaponType.RedDagger] = "赤暗器";
WeaponTypeToStr[WeaponType.BlueDagger] = "青暗器";
WeaponTypeToStr[WeaponType.GreenDagger] = "緑暗器";
WeaponTypeToStr[WeaponType.ColorlessDagger] = "暗器";
WeaponTypeToStr[WeaponType.RedBow] = "赤弓";
WeaponTypeToStr[WeaponType.BlueBow] = "青弓";
WeaponTypeToStr[WeaponType.GreenBow] = "緑弓";
WeaponTypeToStr[WeaponType.ColorlessBow] = "弓";
const strToWeaponType = {}
for (let key in WeaponTypeToStr) {
    strToWeaponType[WeaponTypeToStr[key]] = Number(key);
}
function getWeaponTypeFromStr(weaponTypeStr) {
    return strToWeaponType[weaponTypeStr];
}

const weaponIconRoot = "/FehTools/FehIconMaker/images/";
const WeaponTypeToPath = {}
WeaponTypeToPath[WeaponType.Sword] = "Red_Sword.png";
WeaponTypeToPath[WeaponType.Lance] = "Blue_Lance.png";
WeaponTypeToPath[WeaponType.Axe] = "Green_Axe.png";
WeaponTypeToPath[WeaponType.Staff] = "Gray_Staff.png";
WeaponTypeToPath[WeaponType.RedTome] = "Red_Tome.png";
WeaponTypeToPath[WeaponType.BlueTome] = "Blue_Tome.png";
WeaponTypeToPath[WeaponType.GreenTome] = "Green_Tome.png";
WeaponTypeToPath[WeaponType.ColorlessTome] = "Gray_Tome.png";
WeaponTypeToPath[WeaponType.RedBreath] = "Red_Breath.png";
WeaponTypeToPath[WeaponType.BlueBreath] = "Blue_Breath.png";
WeaponTypeToPath[WeaponType.GreenBreath] = "Green_Breath.png"
WeaponTypeToPath[WeaponType.ColorlessBreath] = "Gray_Breath.png";
WeaponTypeToPath[WeaponType.RedBeast] = "Red_Beast.png";
WeaponTypeToPath[WeaponType.BlueBeast] = "Blue_Beast.png";
WeaponTypeToPath[WeaponType.GreenBeast] = "Green_Beast.png"
WeaponTypeToPath[WeaponType.ColorlessBeast] = "Gray_Beast.png";
WeaponTypeToPath[WeaponType.RedDagger] = "Red_Dagger.png";
WeaponTypeToPath[WeaponType.BlueDagger] = "Blue_Dagger.png";
WeaponTypeToPath[WeaponType.GreenDagger] = "Green_Dagger.png"
WeaponTypeToPath[WeaponType.ColorlessDagger] = "Gray_Dagger.png";
WeaponTypeToPath[WeaponType.RedBow] = "Red_Bow.png";
WeaponTypeToPath[WeaponType.BlueBow] = "Blue_Bow.png";
WeaponTypeToPath[WeaponType.GreenBow] = "Green_Bow.png"
WeaponTypeToPath[WeaponType.ColorlessBow] = "Gray_Bow.png";

const howToGetDict = {};
howToGetDict["ガチャ"] = "恒常排出";
howToGetDict["超英雄"] = "超英雄";
howToGetDict["戦渦の連戦"] = "聖杯";
howToGetDict["大英雄戦"] = "聖杯";
howToGetDict["伝承英雄ガチャ"] = "伝承";
howToGetDict["神階英雄ガチャ"] = "神階";
howToGetDict["魔器英雄"] = "魔器";
howToGetDict["響心英雄"] = "響心";
howToGetDict["特務機関"] = "特務機関";
const howToGetInvDict = {};
for (const key in howToGetDict) {
    howToGetInvDict[howToGetDict[key]] = key;
}

const seasonNameToFileName = {
    "光": "Season_Light.png",
    "闇": "Season_Dark.png",
    "天": "Season_Astra.png",
    "理": "Season_Anima.png",
    "火": "Season_Fire.png",
    "水": "Season_Water.png",
    "風": "Season_Wind.png",
    "地": "Season_Earth.png",
};

const BlessingIcons = {};
for (const key in seasonNameToFileName) {
    BlessingIcons[key] = simulatorImageRoot + seasonNameToFileName[key];
}
BlessingIcons["なし"] = null;

const GrowthRateOfStar5 = {};
GrowthRateOfStar5[8] = 0.2;
GrowthRateOfStar5[10] = 0.25;
GrowthRateOfStar5[13] = 0.30;
GrowthRateOfStar5[15] = 0.35;
GrowthRateOfStar5[17] = 0.40;
GrowthRateOfStar5[19] = 0.45;
GrowthRateOfStar5[22] = 0.50;
GrowthRateOfStar5[24] = 0.55;
GrowthRateOfStar5[26] = 0.60;
GrowthRateOfStar5[28] = 0.65;
GrowthRateOfStar5[30] = 0.70;
GrowthRateOfStar5[33] = 0.75;
GrowthRateOfStar5[35] = 0.80;
GrowthRateOfStar5[37] = 0.85;
GrowthRateOfStar5[39] = 0.90;
GrowthRateOfStar5[42] = 0.95;

const InverseGrowthRateOfStar5 = {};
for (const key in GrowthRateOfStar5) {
    InverseGrowthRateOfStar5[GrowthRateOfStar5[key]] = key;
}

/// ☆5の成長量から純粋成長率を計算します。
function getGrowthRateOfStar5(growthAmount) {
    let growthRate = GrowthRateOfStar5[growthAmount];
    if (growthRate) {
        return growthRate;
    }

    throw new Error("Invalid growth amount " + growthAmount);
}


const AppliedGrowthRateCoef = {};
AppliedGrowthRateCoef[5] = (0.79 + (0.07 * 5)) * 100;
AppliedGrowthRateCoef[4] = (0.79 + (0.07 * 4)) * 100;
AppliedGrowthRateCoef[3] = (0.79 + (0.07 * 3)) * 100;
AppliedGrowthRateCoef[2] = (0.79 + (0.07 * 2)) * 100;
AppliedGrowthRateCoef[1] = (0.79 + (0.07 * 1)) * 100;
/**
 * @param  {Number} growthRate
 * @param  {Number} rarity
 */
function calcAppliedGrowthRate_Optimized(growthRate, rarity) {
    let rate = Math.floor(growthRate * AppliedGrowthRateCoef[rarity]) * 0.01;
    return rate;
}
/**
 * @param  {Number} growthRate
 * @param  {Number} rarity
 * @param  {Number} level
 */
function calcGrowthValue(growthRate, rarity, level) {
    let rate = calcAppliedGrowthRate_Optimized(growthRate, rarity);
    return Math.floor((level - 1) * rate);
}

function getStatusAssetAddValue(standardValueLv40, standardValueLv1) {
    try {
        const growthValue = standardValueLv40 - standardValueLv1;
        const growthRate = getGrowthRateOfStar5(growthValue);
        const assetGrowthRate = String(Math.round((growthRate + 0.05) * 100) / 100);
        const assetGrowthValue = Number(InverseGrowthRateOfStar5[assetGrowthRate]);
        return assetGrowthValue - growthValue + 1;
    }
    catch (e) {
        console.error(e);
        return 0;
    }
}

function getStatusFlawAddValue(standardValueLv40, standardValueLv1) {
    try {
        const growthValue = standardValueLv40 - standardValueLv1;
        const growthRate = getGrowthRateOfStar5(growthValue);
        const flawGrowthRate = String(Math.round((growthRate - 0.05) * 100) / 100);
        const flawGrowthValue = Number(InverseGrowthRateOfStar5[flawGrowthRate]);
        return flawGrowthValue - growthValue - 1;
    }
    catch (e) {
        console.error(e);
        return 0;
    }
}

function getMoveWeaponTypeId(moveType, weaponType) {
    return moveType + weaponType * 4;
}
function __getMoveTypeAndWeaponTypeFromTypeId(typeId) {
    const moveType = typeId % 4;
    const weaponType = (typeId - moveType) / 4;
    return [moveType, weaponType];
}
function typeIdToStr(typeId) {
    const result = __getMoveTypeAndWeaponTypeFromTypeId(typeId);
    const moveType = result[0];
    const weaponType = result[1];
    return `${MoveTypeToStr[moveType]}/${WeaponTypeToStr[weaponType]}`;
}


/**
 * @param  {StatusType} ivHighStat
 * @param  {StatusType} ivLowStat
 * @param  {StatusType} ascendedAsset
 * @param  {Number} merge
 * @param  {Number} dragonflower
 * @param  {Number} hpLv1
 * @param  {Number} atkLv1
 * @param  {Number} spdLv1
 * @param  {Number} defLv1
 * @param  {Number} resLv1
 */
function calcStatusAddValuesByMergeAndDragonFlower(
    ivHighStat, ivLowStat, ascendedAsset, merge, dragonflower,
    hpLv1,
    atkLv1,
    spdLv1,
    defLv1,
    resLv1
) {
    let hpLv1IvChange = 0;
    let atkLv1IvChange = 0;
    let spdLv1IvChange = 0;
    let defLv1IvChange = 0;
    let resLv1IvChange = 0;
    switch (ivHighStat) {
        case StatusType.None: break;
        case StatusType.Hp: hpLv1IvChange = 1; break;
        case StatusType.Atk: atkLv1IvChange = 1; break;
        case StatusType.Spd: spdLv1IvChange = 1; break;
        case StatusType.Def: defLv1IvChange = 1; break;
        case StatusType.Res: resLv1IvChange = 1; break;
    }

    // 開花得意は順序に影響しない
    // switch (ascendedAsset) {
    //     case StatusType.None: break;
    //     case StatusType.Hp: hpLv1IvChange = 1; break;
    //     case StatusType.Atk: atkLv1IvChange = 1; break;
    //     case StatusType.Spd: spdLv1IvChange = 1; break;
    //     case StatusType.Def: defLv1IvChange = 1; break;
    //     case StatusType.Res: resLv1IvChange = 1; break;
    // }

    switch (ivLowStat) {
        case StatusType.None: break;
        case StatusType.Hp: hpLv1IvChange = -1; break;
        case StatusType.Atk: atkLv1IvChange = -1; break;
        case StatusType.Spd: spdLv1IvChange = -1; break;
        case StatusType.Def: defLv1IvChange = -1; break;
        case StatusType.Res: resLv1IvChange = -1; break;
    }

    const addValues = [0, 0, 0, 0, 0];

    // 限界突破によるステータス上昇
    if (merge > 0 || dragonflower > 0) {
        const statusList = [
            { type: StatusType.Hp, value: hpLv1 + hpLv1IvChange },
            { type: StatusType.Atk, value: atkLv1 + atkLv1IvChange },
            { type: StatusType.Spd, value: spdLv1 + spdLv1IvChange },
            { type: StatusType.Def, value: defLv1 + defLv1IvChange },
            { type: StatusType.Res, value: resLv1 + resLv1IvChange },
        ];
        statusList.sort((a, b) => {
            return b.value - a.value;
        });
        const updateStatus = (statItr) => {
            let statIndex = statItr % 5;
            switch (statusList[statIndex].type) {
                case StatusType.Hp: addValues[0] += 1; break;
                case StatusType.Atk: addValues[1] += 1; break;
                case StatusType.Spd: addValues[2] += 1; break;
                case StatusType.Def: addValues[3] += 1; break;
                case StatusType.Res: addValues[4] += 1; break;
            }
        };

        if (merge > 0 && ivHighStat == StatusType.None) {
            // 基準値で限界突破済みの場合
            let updatedCount = 0;
            let statIndex = 0;
            do {
                let targetStatus = statusList[statIndex].type;
                if (targetStatus !== ascendedAsset) {
                    // 開花得意は基準値の上昇ステータスから除外
                    switch (targetStatus) {
                        case StatusType.Hp: addValues[0] += 1; break;
                        case StatusType.Atk: addValues[1] += 1; break;
                        case StatusType.Spd: addValues[2] += 1; break;
                        case StatusType.Def: addValues[3] += 1; break;
                        case StatusType.Res: addValues[4] += 1; break;
                    }
                    ++updatedCount;
                }
                ++statIndex;
            } while (updatedCount !== 3);
        }

        // 限界突破
        for (let mergeItr = 0, statItr = 0; mergeItr < merge; ++mergeItr) {
            updateStatus(statItr);
            statItr += 1;
            updateStatus(statItr);
            statItr += 1;
        }

        // 神竜の花
        for (let i = 0; i < dragonflower; ++i) {
            updateStatus(i);
        }
    }

    return addValues;
}

function calcGrowthValue(growthRate, rarity, level) {
    let rate = Math.floor(100 * growthRate * (0.79 + (0.07 * rarity))) * 0.01;
    return Math.floor((level - 1) * rate);
}


function __isDuelAvailable(type, moveType, duelNumber, execQuerySkillsFunc) {
    let query = `select name from skills where name="${type}の死闘・${moveType}${duelNumber}"`;
    console.log(query);
    let queryResult = execQuerySkillsFunc(query);
    if (queryResult == null || queryResult.length == 0) {
        return false;
    }

    let rows = queryResult[0].values;
    return rows.length > 0;
}

/**
 * @param  {string} type
 * @param  {string} moveType
 * @param  {boolean} isLegendOrMythic
 */
function __getDuelRating(type, moveType, isLegendOrMythic, execQuerySkillsFunc) {
    if (__isDuelAvailable(type, moveType, 4, execQuerySkillsFunc)) {
        return isLegendOrMythic ? 175 : 180;
    }
    if (__isDuelAvailable(type, moveType, 3, execQuerySkillsFunc)) {
        return 170;
    }
    return 0;
}

const g_duelDict = {};
function createInheritableDuelDict(execQuerySkillsFunc) {
    let types = ["赤", "青", "緑", "無"];
    let moveTypes = ["重装", "騎馬", "飛行", "歩行"];
    let isLegendOrMythicValues = [true, false];
    for (let type of types) {
        for (let moveType of moveTypes) {
            for (let isLegendOrMythic of isLegendOrMythicValues) {
                let rating = __getDuelRating(type, moveType, isLegendOrMythic, execQuerySkillsFunc);
                g_duelDict[type + moveType + isLegendOrMythic] = rating;
                console.log(`${type} ${moveType} ${isLegendOrMythic}: ${rating}`);
            }
        }
    }
    return g_duelDict;
}


function getDuelRatingCache(type, moveType, isLegendOrMythic) {
    return g_duelDict[type + moveType + isLegendOrMythic];
}

function getGrowthRateOfStar5(growthAmount) {
    switch (growthAmount) {
        case 8:
            return 0.2;
        case 10:
            return 0.25;
        case 13:
            return 0.30;
        case 15:
            return 0.35;
        case 17:
            return 0.40;
        case 19:
            return 0.45;
        case 22:
            return 0.50;
        case 24:
            return 0.55;
        case 26:
            return 0.60;
        case 28:
            return 0.65;
        case 30:
            return 0.70;
        case 33:
            return 0.75;
        case 35:
            return 0.80;
        case 37:
            return 0.85;
        case 39:
            return 0.90;
        default:
            // 例外にすると止まってしまうので0にしておく
            console.log("Invalid growth amount " + growthAmount);
            return 0;
    }
}

function calcFlowAndAssetValue(statusLv40, statusLv1) {
    let growthValue = statusLv40 - statusLv1;
    let growthRate = getGrowthRateOfStar5(growthValue);
    let high = statusLv1 + 1 + calcGrowthValue(growthRate + 0.05, 5, 40) - statusLv40;
    let low = statusLv1 - 1 + calcGrowthValue(growthRate - 0.05, 5, 40) - statusLv40;
    return [high, low];
}

function calcStatusArenaScore(totalStatLv40, hasAsset4, duelRating, inheritableDuelRating) {
    let rating = totalStatLv40;
    const actualDuelRating = duelRating < inheritableDuelRating ? inheritableDuelRating : duelRating;
    rating += hasAsset4 ? 4 : 3;
    if (rating < actualDuelRating) {
        rating = actualDuelRating;
    }

    return rating - (rating % 5);
}


function calcMaxSp(
    weaponType, skillNames, skillNameToRowDict, isDancer = false,
    treatsSacredSeal240 = false,
    treatsPassiveB300 = false
) {
    let weaponSp = 350;
    let supportSp = isDancer ? 150 : 400;
    let specialSp = 500;
    let passiveASp = 300;
    let passiveBSp = 300;
    let passiveCSp = 300;
    if (weaponType === "杖") {
        supportSp = 300;
    }
    let passiveSSp = 240;
    if (!treatsSacredSeal240) {
        if (weaponType.endsWith("竜") || weaponType == "剣" || weaponType == "槍" || weaponType == "斧") {
            passiveSSp = 300;
        }
    }
    if (weaponType.endsWith("竜")) {
        passiveBSp = 400;
    }

    for (let name of skillNames) {
        if (!(name in skillNameToRowDict)) {
            console.error(`skill "${name}" was not found.`);
            continue;
        }

        let row = skillNameToRowDict[name];
        let skillSp = Number(row[2]);
        let type = row[3];
        switch (type) {
            case "武器":
                if (skillSp > weaponSp) {
                    weaponSp = 400;
                }
                break;
            case "サポート":
                if (skillSp > supportSp) {
                    supportSp = skillSp;
                }
                break;
            case "奥義":
                if (skillSp > specialSp) {
                    specialSp = skillSp;
                }
                break;
            case "パッシブA":
                if (skillSp > passiveASp) {
                    passiveASp = skillSp;
                }
                break;
            case "パッシブB":
                if (skillSp > passiveBSp) {
                    passiveBSp = skillSp;
                }
                break;
            case "パッシブC":
                if (skillSp > passiveCSp) {
                    passiveCSp = skillSp;
                }
                break;
        }
    }
    if (treatsPassiveB300) {
        if (passiveBSp > 300) {
            passiveBSp = 300;
        }
    }
    let maxSp = weaponSp + supportSp + specialSp + passiveASp + passiveBSp + passiveCSp + passiveSSp;
    return maxSp;
}

function calcArenaLevelScore(level, rarity) {
    let levelScore = 0;
    switch (rarity) {
        case 5:
            levelScore = Math.floor(level * 2.33);
            break;
        case 4:
            levelScore = Math.floor(level * 2.15);
            break;
        case 3:
            levelScore = Math.floor(level * 2.03);
            break;
        case 2:
            levelScore = Math.floor(level * 1.87);
            break;
        case 1:
            levelScore = Math.floor(level * 1.74);
            break;
    }
    return levelScore;
}

function calcArenaRarityBaseScore(rarity) {
    return rarity * 2 + 45;
}

function calcArenaScore(rating, totalSp, rebirthCount = 10, rarity = 5, level = 40) {
    let base = 150;
    let rarityBase = calcArenaRarityBaseScore(rarity);
    let levelScore = calcArenaLevelScore(level, rarity);
    return base + levelScore + rarityBase + Math.floor(rating / 5) + Math.floor((totalSp) / 100) + (rebirthCount * 2);
}

function getDateAsNumber(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return Number(`${year}${month}${day}`);
}

const g_twoWeekAgoDateAsNumber = getDateAsNumber(new Date((new Date()).getTime() - 14 * 24 * 60 * 60 * 1000));

class HeroInfo {
    constructor(id, name, thumb,
        hp, atk, spd, def, res,
        hpLv1, atkLv1, spdLv1, defLv1, resLv1,
        resplendent,
        releaseDate,
        moveType,
        weaponType,
        color,
        specialTypes,
        howToGet,
        skillNames,
        origin,
        rarities,
        cvs,
        illustrators,
        resplendentCostume,
        pureNames
    ) {
        /** @type {Number} */
        this.id = id;
        this.name = name;
        this.iconPath = `https://fire-emblem.fun/images/FehHeroThumbs/${thumb}`;
        this.hp = hp;
        this.atk = atk;
        this.spd = spd;
        this.def = def;
        this.res = res;
        this.totalStatus = this.hp + this.atk + this.spd + this.def + this.res;
        this.hpLv1 = hpLv1;
        this.atkLv1 = atkLv1;
        this.spdLv1 = spdLv1;
        this.defLv1 = defLv1;
        this.resLv1 = resLv1;
        this.hpAssetAdd = getStatusAssetAddValue(this.hp, this.hpLv1);
        this.atkAssetAdd = getStatusAssetAddValue(this.atk, this.atkLv1);
        this.spdAssetAdd = getStatusAssetAddValue(this.spd, this.spdLv1);
        this.defAssetAdd = getStatusAssetAddValue(this.def, this.defLv1);
        this.resAssetAdd = getStatusAssetAddValue(this.res, this.resLv1);
        this.hpFlawAdd = getStatusFlawAddValue(this.hp, this.hpLv1);
        this.atkFlawAdd = getStatusFlawAddValue(this.atk, this.atkLv1);
        this.spdFlawAdd = getStatusFlawAddValue(this.spd, this.spdLv1);
        this.defFlawAdd = getStatusFlawAddValue(this.def, this.defLv1);
        this.resFlawAdd = getStatusFlawAddValue(this.res, this.resLv1);
        this.hasAsset4 = this.hpAssetAdd == 4
            || this.atkAssetAdd == 4
            || this.spdAssetAdd == 4
            || this.defAssetAdd == 4
            || this.resAssetAdd == 4;
        this.url = `https://fire-emblem.fun/?fehhero=${this.id}`;

        /** @type {boolean} */
        this.resplendent = resplendent;

        this.releaseDate = releaseDate;
        this.releaseDateAsNumber = releaseDate != null ? Number(releaseDate.replace(/-/g, "")) : 0;
        this.skillNames = skillNames;
        this.sourceOrigins = origin.split('|');
        this.origin = this.__convertOrigin(origin);
        this.origins = this.origin.split('|');
        this.rarities = rarities ?? [];
        this.rarityStr = rarities.join("/");
        this.cvs = cvs;
        this.illustrators = illustrators;
        this.resplendentCostume = resplendentCostume != "" ? resplendentCostume : null;

        this.pureNames = pureNames;

        /** @type {MoveType} */
        this.moveType = moveType;

        /** @type {WeaponType} */
        this.weaponType = weaponType;

        /** @type {ColorType} */
        this.color = color;

        /** @type {string[]} */
        this.specialTypes = specialTypes;
        this.blessing = this.getBlessing(specialTypes);
        this.blessingIconPath = BlessingIcons[this.blessing];
        this.howToGet = this.getHowToGet(howToGet, specialTypes);
        this.howToGetSource = howToGet;

        this.isOrderOfHeros = this.howToGet == "特務機関";

        this.maxDragonflowerPerStatus = this.calcMaxDragonflowerPerStatus();
        this.maxDragonflowers = this.maxDragonflowerPerStatus * 5;
        this.book = this.getBookVersion();
        this.hasRefreshSkill = this.skillNames.some(x => x == "歌う" || x == "踊る" || x == "奏でる");
        this.hasOriginalWeapon = this.__examinesHasOriginalWeapon();
        this.weaponSkillName = this.skillNames.length > 0 ? this.skillNames[0] : "武器なし";

        this.duelScore = this.__getDuelScore(specialTypes);

        /** 必要な時に代入する */
        this.isDancer = false;
    }

    get isNew() {
        return this.releaseDateAsNumber >= g_twoWeekAgoDateAsNumber;
    }

    get isLegendOrMythic() {
        return this.blessing != "なし";
    }

    __getDuelScore(specialTypes) {
        for (let type of specialTypes) {
            if (type.startsWith("死闘")) {
                return Number(type.replace("死闘", ""));
            }
        }
        return 0;
    }

    calcStatusAddValuesByMergeAndDragonFlower(ivHighStat, ivLowStat, ascendedAsset, merge, dragonflower) {
        return calcStatusAddValuesByMergeAndDragonFlower(
            ivHighStat, ivLowStat, ascendedAsset, merge, dragonflower,
            this.hpLv1, this.atkLv1, this.spdLv1, this.defLv1, this.resLv1);
    }

    /**
     * @param  {String} origin
     */
    __convertOrigin(origin) {
        return origin
            .replace(/新・/g, "")
            .replace(/暗黒竜と光の剣/g, "紋章の謎")
            .replace(/幻影異聞録♯FE Encore/g, "♯FE");
    }

    __examinesHasOriginalWeapon() {
        if (this.skillNames.length == 0) return false;
        if (!this.skillNames[0].endsWith("+")) return true;
        return this.hasRefreshSkill;
    }

    getUnitTypeId() {
        return getMoveWeaponTypeId(this.moveType, this.weaponType);
    }

    getHp(traitsType) {
        return this.hp + (traitsType == TraitsType.Asset ? this.hpAssetAdd
            : traitsType == TraitsType.Flaw ? this.hpFlawAdd : 0);
    }
    getAtk(traitsType) {
        return this.atk + (traitsType == TraitsType.Asset ? this.atkAssetAdd
            : traitsType == TraitsType.Flaw ? this.atkFlawAdd : 0);
    }
    getSpd(traitsType) {
        return this.spd + (traitsType == TraitsType.Asset ? this.spdAssetAdd
            : traitsType == TraitsType.Flaw ? this.spdFlawAdd : 0);
    }
    getDef(traitsType) {
        return this.def + (traitsType == TraitsType.Asset ? this.defAssetAdd
            : traitsType == TraitsType.Flaw ? this.defFlawAdd : 0);
    }
    getRes(traitsType) {
        return this.res + (traitsType == TraitsType.Asset ? this.resAssetAdd
            : traitsType == TraitsType.Flaw ? this.resFlawAdd : 0);
    }

    getBookVersion() {
        let release_date = this.releaseDateAsNumber;
        if (release_date < 20171128) return 1;
        if (release_date < 20181211) return 2;
        if (release_date < 20191205) return 3;
        if (release_date < 20201208) return 4;
        if (release_date < 20211206) return 5;
        if (release_date < 20221201) return 6;
        if (release_date < 20231201) return 7;
        if (release_date < 20241201) return 8;
        if (release_date < 20251201) return 9;
        if (release_date < 20261201) return 10;
        return -1;
    }

    getHowToGet(howToGet, specialTypes) {
        const type = specialTypes.find(x => x == "比翼" || x == "双界");
        if (type != null) return type;
        return howToGet;
    }

    get hasBlessing() {
        return this.blessing != "";
    }

    getBlessing(specialTypes) {
        const blessingSource = specialTypes.find(x => x.startsWith("伝承") || x.startsWith("神階"));
        if (blessingSource == null) return "なし";
        return blessingSource.substr(2, 1);
    }

    *enumerateStatuses(isDragonflowerEnabled, isResplendentEnabled) {
        yield this.evalOneStatus(this.hp, isDragonflowerEnabled, isResplendentEnabled);
        yield this.evalOneStatus(this.atk, isDragonflowerEnabled, isResplendentEnabled);
        yield this.evalOneStatus(this.spd, isDragonflowerEnabled, isResplendentEnabled);
        yield this.evalOneStatus(this.def, isDragonflowerEnabled, isResplendentEnabled);
        yield this.evalOneStatus(this.res, isDragonflowerEnabled, isResplendentEnabled);
    }

    calcMaxDragonflowerPerStatus() {
        let releaseDate = this.releaseDateAsNumber;
        let i = 1;
        for (let year = 2024; year >= 2020; --year) {
            let date = year * 10000 + 812; // 8/12に総選挙がリリースされたことはないので12固定にしておく
            if (releaseDate > date) {
                return i;
            }

            ++i;
        }

        switch (this.moveType) {
            case MoveType.Infantry:
                if (releaseDate < 20190220) {
                    // 第2世代と第3世代が境界
                    return (i + 1);
                }
                else {
                    return i;
                }
            case MoveType.Flying:
            case MoveType.Armor:
            case MoveType.Cavalry:
            default:
                return i;
        }
    }

    evalOneStatus(baseValue, isDragonflowerEnabled, isResplendentEnabled) {
        let result = baseValue;
        if (isDragonflowerEnabled) {
            result += this.maxDragonflowerPerStatus;
        }
        if (isResplendentEnabled) {
            result += this.resplendent ? 2 : 0;
        }

        return result;
    }

    evalStatus(baseValue, isDragonflowerEnabled, isResplendentEnabled, statusCount) {
        let result = baseValue;
        if (isDragonflowerEnabled) {
            result += this.maxDragonflowerPerStatus * statusCount;
        }
        if (isResplendentEnabled) {
            result += this.resplendent ? 2 * statusCount : 0;
        }

        return result;
    }
}

function createHeroInfos(heroDb, excludeNames = null) {
    const query = "select * from heroes where how_to_get!='' and how_to_get is not null order by type='赤' desc,type='青' desc,type='緑' desc,type='無' desc, weapon_type, move_type";
    const queryResult = heroDb.exec(query)[0];
    const keyToIndex = {};
    for (let i = 0; i < queryResult.columns.length; ++i) {
        keyToIndex[queryResult.columns[i]] = i;
    }

    const heroInfos = [];
    for (const row of queryResult.values) {
        const id = row[keyToIndex["id"]];
        const name = row[keyToIndex["name"]];
        if (excludeNames != null && excludeNames.includes(name)) {
            continue;
        }
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
            row[keyToIndex["resplendent_costume"]],
            parseSqlStringToArray(row[keyToIndex["pure_name"]])
        );

        heroInfos.push(info);
    }

    return heroInfos;
}