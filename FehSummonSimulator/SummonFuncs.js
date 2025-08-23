const orbIconSize = 18;
const redOrbIcon = "<img src='/images/feh/feh_orb_red.png' width='" + orbIconSize + "' alt='赤オーブの画像' />";
const blueOrbIcon = "<img src='/images/feh/feh_orb_blue.png' width='" + orbIconSize + "' alt='青オーブの画像' />";
const greenOrbIcon = "<img src='/images/feh/feh_orb_green.png' width='" + orbIconSize + "' alt='緑オーブの画像' />";
const colorlessOrbIcon = "<img src='/images/feh/feh_orb_colorless.png' width='" + orbIconSize + "' alt='無オーブの画像' />";

const Color = {
    Red: 0,
    Green: 1,
    Blue: 2,
    Colorless: 3,
};
const GachaResultKind = {
    Star3: 0,
    Star4: 1,
    Star5: 2,
    Pickup: 3,
    Star4Pickup: 4,
    Star4Special: 5,
    SpecialHeroStar4Special: 6,
};
const SummonMode = {
    OrbCount: 0,
    SummonCount: 1,
    UntilSummonStar5: 2,
    UntilRateResets: 3,
};

class SummonParam {
    constructor() {
        this.averageSampleCount = 1;
        this.targetPickupCount = 1;
        this.ownOrbCount = 170;
        this.summonMode = SummonMode.OrbCount;
        this.summonCountThresholdToCount = 0;
        this.isPickupChargeEnabled = false;
    }
}

class SummonResult {
    constructor() {
        /** @type {SummonHistory} */
        this.history = null;
        this.lostOrbCountStdDev = 0;
        this.star3CountStdDev = 0;
        this.star4CountStdDev = 0;
        this.star4SpecialCountStdDev = 0;
        this.specialHeroStar4SpecialCountStdDev = 0;
        this.star5CountStdDev = 0;
        this.star5AndPickupCountStdDev = 0;
        this.star4PickupCountStdDev = 0;
        this.pickupCountStdDev = 0;
        this.pickupCountStdDevs = {};

        this.lostOrbCountMin = 0;
        this.lostOrbCountMax = 0;
        this.star4PickupWorstCount = 0;
        this.star4PickupBestCount = 0;
        this.star4SpecialWorstCount = 0;
        this.star4SpecialBestCount = 0;
        this.specialHeroStar4SpecialWorstCount = 0;
        this.specialHeroStar4SpecialBestCount = 0;
        this.pickupWorstCount = 0;
        this.pickupBestCount = 0;
        this.star5WorstCount = 0;
        this.star5BestCount = 0;
        this.star5AndPickupWorstCount = 0;
        this.star5AndPickupBestCount = 0;
        this.pickupBestCounts = {};
        this.pickupWorstCounts = {};

        this.totalSummonCount = 0;
        this.totalSummonCountMin = 0;
        this.totalSummonCountMax = 0;
        this.lostOrbCount = 0;
        this.pickupCount = 0;
        this.star5Count = 0;
        this.star4Count = 0;
        this.star4SpecialCount = 0;
        this.specialHeroStar4SpecialCount = 0;
        this.star4PickupCount = 0;
        this.star3Count = 0;
        this.pickupHeroes = {};
        this.star4PickupHeroes = {};
        this.couldGetPickupHeroCount = {};
        this.couldGetStar4PickupHeroCount = 0;
        this.couldGetStar4AndStar5PickupHeroCount = 0;
        this.couldGetStar5HeroCount = 0;
        this.couldGetStar5PickupHeroCount = 0;

        this.countOverSpecfiedSummonCount = -1;
        this.maxTryCountUntilRateResets = 0;

        this.pickupChargeActivatedCount = 0; // ピックアップチャージの発動回数
    }
}

class GachaRate {
    constructor() {
        this.pickupRate = 0;
        this.star5Rate = 0;
        this.star4Rate = 0;
        this.star4PickupRate = 0;
        this.star4SpecialRate = 0;
        this.specialHeroStar4SpecialRate = 0;
        this.star3Rate = 0;
    }
}


const IndividualValueType = {
    Hp: 0,
    Attack: 1,
    Speed: 2,
    Defence: 3,
    Resist: 4,
    None: 5,
};

const IndividualValueTable = [
    IndividualValueType.None, IndividualValueType.None,
    IndividualValueType.Hp, IndividualValueType.Attack,
    IndividualValueType.Hp, IndividualValueType.Speed,
    IndividualValueType.Hp, IndividualValueType.Defence,
    IndividualValueType.Hp, IndividualValueType.Resist,
    IndividualValueType.Attack, IndividualValueType.Hp,
    IndividualValueType.Attack, IndividualValueType.Speed,
    IndividualValueType.Attack, IndividualValueType.Defence,
    IndividualValueType.Attack, IndividualValueType.Resist,
    IndividualValueType.Speed, IndividualValueType.Hp,
    IndividualValueType.Speed, IndividualValueType.Attack,
    IndividualValueType.Speed, IndividualValueType.Defence,
    IndividualValueType.Speed, IndividualValueType.Resist,
    IndividualValueType.Defence, IndividualValueType.Hp,
    IndividualValueType.Defence, IndividualValueType.Attack,
    IndividualValueType.Defence, IndividualValueType.Speed,
    IndividualValueType.Defence, IndividualValueType.Resist,
    IndividualValueType.Resist, IndividualValueType.Hp,
    IndividualValueType.Resist, IndividualValueType.Attack,
    IndividualValueType.Resist, IndividualValueType.Speed,
    IndividualValueType.Resist, IndividualValueType.Defence,
];
const IndividualValuePatternCount = IndividualValueTable.length / 2;


class PickedHero {
    constructor() {
        this.rarity = GachaResultKind.Star3;
        this.heroId = 0;
        this.color = Color.Red;
        this.index = 0;
        this.strength = IndividualValueType.None;
        this.weekness = IndividualValueType.None;
    }

    setTraitsRandom() {
        let randValIndiv = Math.random();
        let individualPatternIndex = Math.trunc(randValIndiv * IndividualValuePatternCount) * 2;
        this.strength = IndividualValueTable[individualPatternIndex];
        this.weekness = IndividualValueTable[individualPatternIndex + 1];
    }
}



function round(value) {
    return Math.round(value * 10000) / 10000;
}

function colorToString(color) {
    switch (color) {
        case Color.Red: return redOrbIcon;
        case Color.Blue: return blueOrbIcon;
        case Color.Green: return greenOrbIcon;
        case Color.Colorless: return colorlessOrbIcon;
        default: return `不明(${color})`;
    }
}


/**
 * 現在の試行回数から確率上昇した確率を求めます
 * @param  {number} currentTryCount
 * @returns {GachaRate}
 */
function calcCurrentRate(sim, currentTryCount, isPickupChargeEnabled) {
    let rateUpCount = Math.floor(currentTryCount / 5);
    let result = new GachaRate();
    if (sim._initStar5Rate != 0.0) {
        if (isPickupChargeEnabled) {
            let basePickupRate = isPickupChargeEnabled ? sim._initPickRate + sim._initStar5Rate : sim._initPickRate;
            result.pickupRate = round((basePickupRate + rateUpCount * 0.005));
            result.star5Rate = 0.0;
        }
        else {
            let pickUpRate = 0.005 * sim._initPickRate / (sim._initPickRate + sim._initStar5Rate);
            let star5UpRate = 0.005 * sim._initStar5Rate / (sim._initPickRate + sim._initStar5Rate);
            result.pickupRate = round((sim._initPickRate + rateUpCount * pickUpRate));
            result.star5Rate = round((sim._initStar5Rate + rateUpCount * star5UpRate));
        }
    }
    else {
        result.pickupRate = round((sim._initPickRate + rateUpCount * 0.005));
        result.star5Rate = 0.0;
    }
    let initPickAndStar5Rate = sim._initStar5Rate + sim._initPickRate;
    let star4Weight = sim._initStar4Rate / (1.0 - initPickAndStar5Rate);
    let star4PickupWeight = sim._initStar4PickRate / (1.0 - initPickAndStar5Rate);
    let star4SpecialWeight = sim._initStar4SpecialRate / (1.0 - initPickAndStar5Rate);
    let specialHeroStar4SpecialWeight = sim._initSpecialHeroStar4SpecialRate / (1.0 - initPickAndStar5Rate);
    let currentPickAndStar5Rate = result.star5Rate + result.pickupRate;
    result.star4Rate = round((1.0 - currentPickAndStar5Rate) * star4Weight);
    result.star4PickupRate = round((1.0 - currentPickAndStar5Rate) * star4PickupWeight);
    result.star4SpecialRate = round((1.0 - currentPickAndStar5Rate) * star4SpecialWeight);
    result.specialHeroStar4SpecialRate = round((1.0 - currentPickAndStar5Rate) * specialHeroStar4SpecialWeight);
    result.star3Rate = round((1.0 - currentPickAndStar5Rate - result.star4Rate - result.star4PickupRate - result.star4SpecialRate - result.specialHeroStar4SpecialRate));
    return result;
}

function selectHeroIndex(randVal, beginRate, rateWidth, heroeIds) {
    let offset = rateWidth / heroeIds.length;
    for (let i = 0; i < heroeIds.length; ++i) {
        if (randVal < beginRate + offset * (i + 1)) {
            return i;
        }
    }
    return -1;
}

function selectColor(randVal, beginRate, rateWidth, colorCounts) {
    let totalCount = colorCounts[Color.Red] + colorCounts[Color.Blue] + colorCounts[Color.Green] + colorCounts[Color.Colorless];
    let weights = [
        colorCounts[Color.Red] / totalCount,
        colorCounts[Color.Blue] / totalCount,
        colorCounts[Color.Green] / totalCount,
        colorCounts[Color.Colorless] / totalCount,
    ];
    if (randVal < beginRate + rateWidth * weights[Color.Red]) {
        return Color.Red;
    }
    else if (randVal < beginRate + rateWidth * (weights[Color.Red] + weights[Color.Blue])) {
        return Color.Blue;
    }
    else if (randVal < beginRate + rateWidth * (weights[Color.Red] + weights[Color.Blue] + weights[Color.Green])) {
        return Color.Green;
    }
    else {
        return Color.Colorless;
    }
}

function getPickupHeroIndex(sim, heroId) {
    for (let i = 0; i < sim._star5PickupHeroIds.length; ++i) {
        if (sim._star5PickupHeroIds[i] == heroId) {
            return i;
        }
    }
    return -1;
}

/**
 * ガチャの抽選を英雄1体分行います。
 * @param  {number} currentTryCount
 * @returns {PickedHero}
 */
function pickOrb(sim, currentTryCount, isPickupChargeActivated) {
    let rates = calcCurrentRate(sim, currentTryCount, isPickupChargeActivated);
    let result = new PickedHero();
    result.setTraitsRandom();
    let randVal = Math.random();
    let threshold = rates.pickupRate;
    if (randVal < threshold) {
        // ピックアップ
        result.rarity = GachaResultKind.Pickup;
        let index = selectHeroIndex(randVal, 0, rates.pickupRate, sim._star5PickupHeroIds);
        result.heroId = sim._star5PickupHeroIds[index];
        result.color = sim._heroColors[index];
        result.index = index;
        return result;
    }

    threshold += rates.star5Rate;
    if (randVal < threshold) {
        // 星5 すり抜け
        let index = selectHeroIndex(randVal, rates.pickupRate, rates.star5Rate, sim._star5HeroIds);
        result.heroId = sim._star5HeroIds[index];
        result.color = sim._star5HeroColors[index];
        let pickupHeroIndex = getPickupHeroIndex(sim, result.heroId);
        if (pickupHeroIndex < 0) {
            result.rarity = GachaResultKind.Star5;
            result.index = index;
        }
        else {
            // すり抜け枠からピックアップが出た場合はピックアップとして扱う
            result.rarity = GachaResultKind.Pickup;
            result.index = pickupHeroIndex;
        }
        return result;
    }

    threshold += rates.star4Rate;
    if (randVal < threshold) {
        // 星4
        result.rarity = GachaResultKind.Star4;
        result.color = selectColor(randVal, rates.pickupRate + rates.star5Rate, rates.star4Rate, sim._star4ColorCounts);
        return result;
    }

    threshold += rates.star4PickupRate;
    if (randVal < threshold) {
        // 星4ピックアップ
        result.rarity = GachaResultKind.Star4Pickup;
        let index = selectHeroIndex(
            randVal, rates.pickupRate + rates.star5Rate + rates.star4Rate,
            rates.star4PickupRate,
            sim._star4PickupHeroIds);
        result.heroId = sim._star4PickupHeroIds[index];
        let pickupHeroIndex = getPickupHeroIndex(sim, result.heroId);
        result.color = sim._heroColors[pickupHeroIndex];
        result.index = pickupHeroIndex;
        return result;
    }

    threshold += rates.star4SpecialRate;
    if (randVal < threshold) {
        // 星4特別チャンス
        let index = selectHeroIndex(randVal,
            rates.pickupRate + rates.star5Rate + rates.star4Rate + rates.star4PickupRate,
            rates.star4SpecialRate,
            sim._star4SpecialHeroIds);
        result.heroId = sim._star4SpecialHeroIds[index];
        result.color = sim._star4SpecialHeroColors[index];
        let pickupHeroIndex = getPickupHeroIndex(sim, result.heroId);
        if (pickupHeroIndex < 0) {
            result.rarity = GachaResultKind.Star4Special;
            result.index = index;
        }
        else {
            // ★4特別チャンスからピックアップが出た場合はピックアップとして扱う
            result.rarity = GachaResultKind.Pickup;
            result.index = pickupHeroIndex;
        }

        return result;
    }

    threshold += rates.specialHeroStar4SpecialRate;
    if (randVal < threshold) {
        // 超星4特別チャンス
        let index = selectHeroIndex(randVal,
            rates.pickupRate + rates.star5Rate + rates.star4Rate + rates.star4PickupRate + rates.star4SpecialRate,
            rates.specialHeroStar4SpecialRate,
            sim._specialHeroStar4SpecialHeroIds);
        result.heroId = sim._specialHeroStar4SpecialHeroIds[index];
        result.color = sim._specialHeroStar4SpecialHeroColors[index];
        let pickupHeroIndex = getPickupHeroIndex(sim, result.heroId);
        if (pickupHeroIndex < 0) {
            result.rarity = GachaResultKind.SpecialHeroStar4Special;
            result.index = index;
        }
        else {
            // 超★4特別チャンスからピックアップが出た場合はピックアップとして扱う
            result.rarity = GachaResultKind.Pickup;
            result.index = pickupHeroIndex;
        }

        return result;
    }

    // 星3
    result.rarity = GachaResultKind.Star3;
    result.color = selectColor(randVal,
        rates.pickupRate + rates.star5Rate + rates.star4Rate + rates.star4PickupRate,
        rates.star3Rate, sim._star3ColorCounts);
    return result;
}

class OneEnterSummonResult {
    constructor(pickupRate, isPickupChargeActivated, currentTryCount) {
        this.pickupRate = pickupRate;
        this.isPickupChargeActivated = isPickupChargeActivated;
        this.currentTryCount = currentTryCount;

        /** @type {PickedHero[]} */
        this.pickedHeroes = [];

        /** @type {Number[]} */
        this.summonIndices = [];
    }
}

class SummonHistory {
    constructor() {
        /** @type {OneEnterSummonResult[]} */
        this.enters = [];
        // 確率がリセットされるまでの最大試行回数
        this.maxTryCountUntilRateResets = 0;

        this.pickupHeroes = {};
    }
}

function addResult(array, index, result) {
    if (array[index]) {
        array[index].push(result);
    }
    else {
        array[index] = [result];
    }
}

const SummonCountToRequiredObs = [
    5, 9, 13, 17, 20
];

/**
 * @param  {FehSummonSimulator} sim
 * @param  {SummonParam} arg
 * @returns {SummonHistory}
 */
function summonImpl(sim, arg) {
    let summonColors = arg.summonColors;
    let ownOrbCount = arg.ownOrbCount;
    let endSummonCount = arg.summonCount;
    let endSummonStar5Count = Number(arg.summonStar5Count);
    let targetPickupIndex = -1;
    let maxTryCount = 0;
    let pickupChargeCount = 0;
    let isPickupChargeActivated = false;
    let pickupHeroes = {};
    const isPickupChargeEnabled = arg.isPickupChargeEnabled;
    switch (Number(arg.summonMode)) {
        case SummonMode.OrbCount:
            endSummonCount = 100000000;
            endSummonStar5Count = 100000000;
            break;
        case SummonMode.SummonCount:
            ownOrbCount = 100000000;
            endSummonStar5Count = 100000000;
            break;
        case SummonMode.UntilSummonStar5:
            ownOrbCount = 100000000;
            endSummonCount = 100000000;
            targetPickupIndex = arg.targetPickupIndex;
            break;
        case SummonMode.UntilRateResets:
            endSummonCount = 100000000;
            ownOrbCount = 100000000;
            endSummonStar5Count = 100000000;
            break;
        default:
            console.error(`unexpected SummonMode ${arg.summonMode} `);
            break;
    }

    let star5AndStar5PickupCount = 0;
    let totalSummonCount = 0;
    let lostOrbCount = 0;
    const history = new SummonHistory();
    let currentTryCount = arg.startTryCount;
    for (let enterCount = 0; enterCount < 1000000; ++enterCount) {
        if (lostOrbCount + 5 > ownOrbCount) {
            break;
        }

        maxTryCount = Math.max(maxTryCount, currentTryCount);

        let rates = calcCurrentRate(sim, currentTryCount, isPickupChargeActivated);

        const enterResult = new OneEnterSummonResult(
            rates.pickupRate, isPickupChargeActivated, currentTryCount);
        history.enters.push(enterResult);

        // 5個オーブを取得
        let summonCount = 0;
        for (let pickCount = 0; pickCount < 5; ++pickCount) {
            let result = pickOrb(sim, currentTryCount, isPickupChargeActivated);
            enterResult.pickedHeroes.push(result);
        }
        const results = enterResult.pickedHeroes;

        // 召喚したい色だけ召喚
        for (let pickCount = 0; pickCount < 5; ++pickCount) {
            let result = results[pickCount];
            for (let summonColorIndex = 0; summonColorIndex < summonColors.length; ++summonColorIndex) {
                let summonColor = summonColors[summonColorIndex];
                if (result.color == summonColor) {
                    enterResult.summonIndices.push(pickCount);
                    break;
                }
            }
        }

        // 召喚したい色がなかったら優先色から1つだけ引く
        if (enterResult.summonIndices.length == 0) {
            for (let color of arg.colorPriorities) {
                let filtered = results.filter(x => x.color == color);
                if (filtered.length > 0) {
                    let index = results.indexOf(filtered[0]);
                    enterResult.summonIndices.push(index);
                    break;
                }
            }
        }
        let obtainsPickup = false;

        const summonIndices = enterResult.summonIndices;

        for (let i = 0; i < summonIndices.length; ++i) {
            let pickIndex = summonIndices[i];
            let result = results[pickIndex];
            let requiredOrbCount = summonCount == 0 ? 5 : summonCount < 4 ? 4 : 3;
            if (ownOrbCount - lostOrbCount - requiredOrbCount < 0) {
                break;
            }

            lostOrbCount += requiredOrbCount;
            ++totalSummonCount;

            switch (result.rarity) {
                case GachaResultKind.Pickup:
                    addResult(pickupHeroes, result.index, result);
                    ++star5AndStar5PickupCount;
                    obtainsPickup = true;
                    currentTryCount = 0;
                    break;
                case GachaResultKind.Star5:
                    ++star5AndStar5PickupCount;
                    currentTryCount -= sim.nonPickupDecrementCount;
                    if (pickupChargeCount < 3) {
                        ++pickupChargeCount;
                    }
                    break;
                case GachaResultKind.Star4Special:
                case GachaResultKind.SpecialHeroStar4Special:
                case GachaResultKind.Star4Pickup:
                case GachaResultKind.Star4:
                case GachaResultKind.Star3:
                    ++currentTryCount;
                    break;
            }

            ++summonCount;
            if (totalSummonCount >= endSummonCount
            ) {
                break;
            }

            if (!arg.summonAllOrbsIfSummonedStar5) {
                if (targetPickupIndex >= 0) {
                    if (targetPickupIndex in pickupHeroes
                        && pickupHeroes[targetPickupIndex].length >= endSummonStar5Count
                    ) {
                        break;
                    }
                }
                else if (star5AndStar5PickupCount >= endSummonStar5Count) {
                    break;
                }

            }
        }

        if (obtainsPickup) {
            currentTryCount = 0;
            if (isPickupChargeActivated) {
                isPickupChargeActivated = false;
            }
        }

        if (isPickupChargeEnabled && pickupChargeCount == 3) {
            isPickupChargeActivated = true;
            pickupChargeCount = 0;
        }

        currentTryCount = Math.max(0, currentTryCount);



        if (targetPickupIndex >= 0) {
            if (targetPickupIndex in pickupHeroes
                && pickupHeroes[targetPickupIndex].length >= endSummonStar5Count) {
                break;
            }
        }
        else if (star5AndStar5PickupCount >= endSummonStar5Count) {
            break;
        }

        if (totalSummonCount >= endSummonCount) {
            break;
        }

        if (arg.summonMode == SummonMode.UntilRateResets && currentTryCount == 0) {
            break;
        }
    }

    history.maxTryCountUntilRateResets = maxTryCount;
    history.pickupHeroes = pickupHeroes;
    return history;
}
/**
 * @param  {FehSummonSimulator} sim
 * @param  {SummonHistory} history
 */
function analyseSummonResult(sim, history) {
    let pickupChargeActivatedCount = 0;
    let pickupCount = 0;
    let star5Count = 0;
    let star4SpecialCount = 0;
    let specialHeroStar4SpecialCount = 0;
    let star4Count = 0;
    let star4PickupCount = 0;
    let star3Count = 0;
    let star5Heroes = "";
    let star4SpecialHeroes = "";
    let specialHeroStar4SpecialHeroes = "";
    let star4PickupHeroes = {};
    let totalSummonCount = 0;
    let lostOrbCount = 0;

    for (let enterResult of history.enters) {
        const summonIndices = enterResult.summonIndices;
        lostOrbCount += SummonCountToRequiredObs[summonIndices.length - 1];
        let obtainsPickup = false;
        for (let i = 0; i < summonIndices.length; ++i) {
            let pickIndex = summonIndices[i];
            let result = enterResult.pickedHeroes[pickIndex];
            ++totalSummonCount;
            switch (result.rarity) {
                case GachaResultKind.Pickup:
                    obtainsPickup = true;
                    ++pickupCount;
                    break;
                case GachaResultKind.Star5:
                    star5Heroes += sim._star5Icons[result.index] + " ";
                    ++star5Count;
                    break;
                case GachaResultKind.Star4Special:
                    {
                        star4SpecialHeroes += sim._star4SpecialIcons[result.index] + " ";
                        ++star4SpecialCount;
                    }
                    break;
                case GachaResultKind.SpecialHeroStar4Special:
                    {
                        specialHeroStar4SpecialHeroes += sim._specialHeroStar4SpecialIcons[result.index] + " ";
                        ++specialHeroStar4SpecialCount;
                    }
                    break;
                case GachaResultKind.Star4Pickup:
                    {
                        addResult(star4PickupHeroes, result.index, result);
                        ++star4PickupCount;
                    }
                    break;
                case GachaResultKind.Star4:
                    ++star4Count;
                    break;
                case GachaResultKind.Star3:
                    ++star3Count;
                    break;
            }
        }

        if (enterResult.isPickupChargeActivated && obtainsPickup) {
            pickupChargeActivatedCount++;
        }
    }

    const summonResult = new SummonResult();
    summonResult.history = history;
    summonResult.maxTryCountUntilRateResets = history.maxTryCountUntilRateResets;
    summonResult.totalSummonCount = totalSummonCount;
    summonResult.lostOrbCount = lostOrbCount;

    summonResult.pickupHeroes = history.pickupHeroes;
    summonResult.star5Heroes = star5Heroes;
    summonResult.star4SpecialHeroes = star4SpecialHeroes;
    summonResult.specialHeroStar4SpecialHeroes = specialHeroStar4SpecialHeroes;
    summonResult.star4PickupHeroes = star4PickupHeroes;

    summonResult.pickupCount = pickupCount;
    summonResult.star5Count = star5Count;
    summonResult.star4SpecialCount = star4SpecialCount;
    summonResult.specialHeroStar4SpecialCount = specialHeroStar4SpecialCount;
    summonResult.star4Count = star4Count;
    summonResult.star4PickupCount = star4PickupCount;
    summonResult.star3Count = star3Count;
    summonResult.pickupChargeActivatedCount = pickupChargeActivatedCount;
    return summonResult;
}

/**
 * @param  {FehSummonSimulator} sim
 * @param  {SummonParam} arg
 * @returns {SummonResult}
 */
function summon(sim, arg) {
    const histroy = summonImpl(sim, arg);
    return analyseSummonResult(sim, histroy);
}