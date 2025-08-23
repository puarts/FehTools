




const RandomAlgorithm = {
    LinearCongruentialGenerators: 0,
    MersenneTwister: 1,
    Xorshift: 2,
    Xoroshiro128aa: 3,
};

const RandAlgorithmOptions = [
    { text: "線形合同法", value: RandomAlgorithm.LinearCongruentialGenerators },
    { text: "MT19937", value: RandomAlgorithm.MersenneTwister },
    { text: "Xorshift128", value: RandomAlgorithm.Xorshift },
    { text: "Xoroshiro128**", value: RandomAlgorithm.Xoroshiro128aa },
];



/**
 * @param  {Number} lostOrbCount
 */
function getLostYenAsString(lostOrbCount) {
    let lostYen = (lostOrbCount / 156.0) * 9800;
    return `${lostYen.toFixed()}円`;
}

function getOrbIconHtml(color) {
    switch (color) {
        case Color.Red: return redOrbIcon;
        case Color.Blue: return blueOrbIcon;
        case Color.Green: return greenOrbIcon;
        case Color.Colorless: return colorlessOrbIcon;
        default:
            throw new Error("invalid color " + color);
    }
}

function individualValueToString(value) {
    switch (value) {
        case IndividualValueType.Hp: return "HP";
        case IndividualValueType.Attack: return "攻";
        case IndividualValueType.Speed: return "速";
        case IndividualValueType.Defence: return "守";
        case IndividualValueType.Resist: return "魔";
        case IndividualValueType.None: return "なし";
        default: return `不明な個性(${value})`;
    }
}

/**
 * @param  {OneEnterSummonResult} enterResult
 * @param  {} pickupIcons
 * @param  {} star5Icons
 * @param  {} star4SpecialIcons
 * @param  {} specialHeroStar4SpecialIcons
 */
function oneEnterSummonResultToHtml(enterResult, pickupIcons, star5Icons, star4SpecialIcons, specialHeroStar4SpecialIcons) {
    let html = "";
    let trStyle = ``;
    let pucharge = "";
    if (enterResult.isPickupChargeActivated) {
        trStyle = `style="background-color:#eef"`;
        pucharge = "<br/><b>PUチャージ</b>";
    }
    html += `<tr ${trStyle}>`;
    html += "<td>" + round(enterResult.pickupRate * 100) + `％(${enterResult.currentTryCount}回)${pucharge}</td>`;
    html += "<td>";
    for (const hero of enterResult.pickedHeroes) {
        html += colorToString(hero.color);
    }
    html += "</td>";
    html += "<td>";
    for (const summonIndex of enterResult.summonIndices) {
        const result = enterResult.pickedHeroes[summonIndex];
        html += __pickedHeroToHtml(result, pickupIcons, star5Icons, star4SpecialIcons, specialHeroStar4SpecialIcons) + " ";
    }
    html += "</td>";
    html += `</tr>`;
    return html;
}

/**
 * @param  {PickedHero} pickedHero
 */
function __pickedHeroToHtml(pickedHero, pickupIcons, star5Icons, star4SpecialIcons, specialHeroStar4SpecialIcons) {
    switch (pickedHero.rarity) {
        case GachaResultKind.Pickup:
            return pickupIcons[pickedHero.index] + "<span style='color:red'><b>(☆5PU)</b></span>";
        case GachaResultKind.Star5:
            return star5Icons[pickedHero.index] + "<span style='color:red'><b>(☆5)</b></span>";
        case GachaResultKind.Star4Special:
            return star4SpecialIcons[pickedHero.index] + "<span style='color:red'><b>(☆4特)</b></span>";
        case GachaResultKind.SpecialHeroStar4Special:
            return specialHeroStar4SpecialIcons[pickedHero.index] + "<span style='color:red'><b>(超☆4特)</b></span>";
        case GachaResultKind.Star4Pickup:
            return pickupIcons[pickedHero.index] + "<span style='color:red'><b>(☆4PU)</b></span>";
        case GachaResultKind.Star4:
            return colorToString(pickedHero.color) + "(☆4)";
        case GachaResultKind.Star3:
            return colorToString(pickedHero.color) + "(☆3)";
    }
}
function summonHistoryToHtml(history, tableHeaderStyle, pickupIcons, star5Icons, star4SpecialIcons, specialHeroStar4SpecialIcons) {
    let html = "";
    html += `<p>シミュレーション時の個別の召喚結果です。</p>`;
    html += "<table border='1'><tr><th style='" + tableHeaderStyle + "'>ピックアップ<br/>提供割合</th>"
        + "<th style='" + tableHeaderStyle + "'>出現色</th>"
        + "<th style='" + tableHeaderStyle + "'>召喚結果</th></tr>";
    for (let enter of history.enters) {
        html += oneEnterSummonResultToHtml(enter, pickupIcons, star5Icons, star4SpecialIcons, specialHeroStar4SpecialIcons);
    }
    html += "</table>";
    return html;
}


/**
 * @param  {FehSummonSimulator} sim
 * @param  {SummonResult} summonResult
 * @param  {{Number, String}} pickupIcons
 */
function createSummonResultHtml(sim, summonResult, pickupIcons) {
    let tableHeaderStyle = "font-size:14px;";
    let resultOutput = "<table border='1' style='table-layout: fixed;width:300px'>";
    resultOutput += "<tbody>";
    resultOutput += "<tr><th style='" + tableHeaderStyle + "'>召喚回数</th><td>" + summonResult.totalSummonCount
        + `<br/><span style='font-size:10px'>(確率上昇の最大回数=${summonResult.maxTryCountUntilRateResets}回)</span>` + "</td></tr>";
    resultOutput += "<tr><th style='" + tableHeaderStyle + "'>消費オーブ数</th><td>" + summonResult.lostOrbCount + `<br/>(${getLostYenAsString(summonResult.lostOrbCount)})</td></tr>`;
    resultOutput += "<tr><th style='" + tableHeaderStyle + "'>☆5ピックアップ数(割合)</th><td>" + summonResult.pickupCount;
    if (summonResult.pickupCount > 0) {
        resultOutput += "(" + round(100.0 * summonResult.pickupCount / summonResult.totalSummonCount) + "％)<br/>";
        for (let key in summonResult.pickupHeroes) {
            let count = summonResult.pickupHeroes[key].length;
            let icon = pickupIcons[key];

            resultOutput += icon + "×" + count + "(" + round(100.0 * count / summonResult.totalSummonCount) + "％)<br/>";

            let heroes = summonResult.pickupHeroes[key];
            resultOutput += "<span style='font-size:10px'>(個性: ";
            for (let index in heroes) {
                let hero = heroes[index];
                resultOutput += "<span style='color:blue'>" + individualValueToString(hero.strength) + "</span>";
                resultOutput += "<span style='color:red'>" + individualValueToString(hero.weekness) + "</span>";
                if (index < heroes.length - 1) {
                    resultOutput += "、";
                }
            }
            resultOutput += ")</span><br/>";
        }
    }
    resultOutput += "</td></tr>";

    resultOutput += `<tr><th style='${tableHeaderStyle}'>PUチャージ発動回数</th><td>${summonResult.pickupChargeActivatedCount}</td></tr>`;

    resultOutput += "<tr><th style='" + tableHeaderStyle + "'>☆4ピックアップ数(割合)</th><td>" + summonResult.star4PickupCount;
    if (summonResult.star4PickupCount > 0) {
        resultOutput += "(" + round(100.0 * summonResult.star4PickupCount / summonResult.totalSummonCount) + "％)<br/>";
        for (let key in summonResult.star4PickupHeroes) {
            let count = summonResult.star4PickupHeroes[key].length;
            let icon = pickupIcons[key];

            resultOutput += icon + "×" + count + "(" + round(100.0 * count / summonResult.totalSummonCount) + "％)<br/>";

            let heroes = summonResult.star4PickupHeroes[key];
            resultOutput += "<span style='font-size:10px'>(個体値: ";
            for (let index in heroes) {
                let hero = heroes[index];
                resultOutput += "<span style='color:blue'>" + individualValueToString(hero.strength) + "</span>";
                resultOutput += "<span style='color:red'>" + individualValueToString(hero.weekness) + "</span>";
                if (index < heroes.length - 1) {
                    resultOutput += "、";
                }
            }
            resultOutput += ")</span><br/>";
        }
    }

    resultOutput += "<tr><th style='" + tableHeaderStyle + "'>☆5すり抜け数(割合)</th><td>" + summonResult.star5Count;
    if (summonResult.star5Count > 0) {
        resultOutput += "(" + round(100.0 * summonResult.star5Count / summonResult.totalSummonCount) + "％)<br/>" + summonResult.star5Heroes.trim() + "";
    }
    resultOutput += "</td></tr>";

    resultOutput += "<tr><th style='" + tableHeaderStyle + "'>☆4特別チャンス数(割合)</th><td>" + summonResult.star4SpecialCount;
    if (summonResult.star4SpecialCount > 0) {
        resultOutput += "(" + round(100.0 * summonResult.star4SpecialCount / summonResult.totalSummonCount) + "％)<br/>" + summonResult.star4SpecialHeroes.trim() + "";
    }
    resultOutput += "</td></tr>";

    if (sim._star4SpecialHeroIds.length > 0) {
        resultOutput += "<tr><th style='" + tableHeaderStyle + "'>超☆4特別チャンス数(割合)</th><td>" + summonResult.specialHeroStar4SpecialCount;
        if (summonResult.specialHeroStar4SpecialCount > 0) {
            resultOutput += "(" + round(100.0 * summonResult.specialHeroStar4SpecialCount / summonResult.totalSummonCount) + "％)<br/>" + summonResult.specialHeroStar4SpecialHeroes.trim() + "";
        }
        resultOutput += "</td></tr>";
    }


    resultOutput += "<tr><th style='" + tableHeaderStyle + "'>☆5、☆4特別チャンス合計(割合)</th><td>" + (summonResult.pickupCount + summonResult.star5Count + summonResult.star4SpecialCount) + "(" + round(100.0 * (summonResult.pickupCount + summonResult.star5Count + summonResult.star4SpecialCount) / summonResult.totalSummonCount) + "％)</td></tr>";

    resultOutput += "</td></tr>";
    resultOutput += "<tr><th style='" + tableHeaderStyle + "'>☆4すり抜け数(割合)</th><td>" + summonResult.star4Count + "(" + round(100.0 * (summonResult.star4Count) / summonResult.totalSummonCount) + "％)</td></tr>";
    resultOutput += "<tr><th style='" + tableHeaderStyle + "'>☆3数(割合)</th><td>" + summonResult.star3Count + "(" + round(100.0 * (summonResult.star3Count) / summonResult.totalSummonCount) + "％)</td></tr>";
    resultOutput += "</tbody>";
    resultOutput += "</table>";


    resultOutput += summonHistoryToHtml(summonResult.history, sim._tableHeaderStyle, sim._pickupIcons, sim._star5Icons, sim._star4SpecialIcons, sim._specialHeroStar4SpecialIcons);
    resultOutput += `<p>(すり抜け出現時の提供割合減少の召喚数=${sim.nonPickupDecrementCount})</p>`;

    return resultOutput;
}

function __getCoeffOfVariation(stdDev, total, sampleCount) {
    if (total == 0) {
        return 0;
    }

    let average = total / sampleCount;
    return stdDev / average;
}
/**
 * @param  {FehSummonSimulator} sim
 * @param  {SummonResult} summonResult
 * @param  {SummonParam} summonParam
 * @param  {{Number, String}} pickupIcons
 * @returns {String}
 */
function createSummonAverageResultHtml(sim, summonResult, summonParam, pickupIcons) {
    let tableHeaderStyle = "font-size:14px;";
    let star3CountStdDev = summonResult.star3CountStdDev;
    let star4CountStdDev = summonResult.star4CountStdDev;
    let star5CountStdDev = summonResult.star5CountStdDev;
    let star5AndPickupCountStdDev = summonResult.star5AndPickupCountStdDev;
    let star4PickupCountStdDev = summonResult.star4PickupCountStdDev;
    let pickupCountStdDev = summonResult.pickupCountStdDev;
    let totalSummonCount = summonResult.totalSummonCount;
    let lostOrbCount = summonResult.lostOrbCount;
    let pickupCount = summonResult.pickupCount;
    let star5Count = summonResult.star5Count;
    let star4Count = summonResult.star4Count;
    let star4PickupCount = summonResult.star4PickupCount;
    let star3Count = summonResult.star3Count;
    let pickupHeroes = summonResult.pickupHeroes;
    let couldGetPickupHeroCount = summonResult.couldGetPickupHeroCount;
    let averageSampleCount = summonParam.averageSampleCount;

    let pickupChargeActivatedCount = round((summonResult.pickupChargeActivatedCount / averageSampleCount));
    totalSummonCount = round((totalSummonCount / averageSampleCount));
    lostOrbCount = round((lostOrbCount / averageSampleCount));
    let pickupCountAvg = round((pickupCount / averageSampleCount));
    star5Count = round((star5Count / averageSampleCount));
    let star4SpecialCount = round((summonResult.star4SpecialCount / averageSampleCount));
    let specialHeroStar4SpecialCount = round((summonResult.specialHeroStar4SpecialCount / averageSampleCount));
    star4PickupCount = round((star4PickupCount / averageSampleCount));
    star4Count = round((star4Count / averageSampleCount));
    star3Count = round((star3Count / averageSampleCount));
    let star5TotalCount = round((pickupCountAvg + star5Count + star4SpecialCount + specialHeroStar4SpecialCount));

    let resultOutput = "<table border='1'>";
    resultOutput += "<tr><th style='" + tableHeaderStyle + "'>平均召喚回数</th><td>" + totalSummonCount + "<br/>";
    resultOutput += "<span style='font-size:10px'>";
    resultOutput += `(最大=${summonResult.totalSummonCountMax}, 最小=${summonResult.totalSummonCountMin})`;
    if (summonParam.summonCountThresholdToCount > 0) {
        resultOutput += `<br/>(指定確率上昇を超えた試行数=${summonResult.countOverSpecfiedSummonCount}(${100 * summonResult.countOverSpecfiedSummonCount / averageSampleCount}%、最大数=${summonResult.maxTryCountUntilRateResets})`;
    }
    resultOutput += "</span>";
    resultOutput += "</td></tr>";

    resultOutput += "<tr><th style='" + tableHeaderStyle + "'>平均消費オーブ数</th><td>" + lostOrbCount + `<br/>(平均${getLostYenAsString(lostOrbCount)}、${getLostYenAsString(summonResult.lostOrbCountMin)}~${getLostYenAsString(summonResult.lostOrbCountMax)})<br/>`;
    resultOutput += "<span style='font-size:10px'>";
    resultOutput += `<br/> 標準偏差=${round(summonResult.lostOrbCountStdDev)} (${round(100.0 * summonResult.lostOrbCountStdDev / totalSummonCount)}%), `;
    resultOutput += `変動係数 = ${round(100 * summonResult.lostOrbCountStdDev / lostOrbCount)}% `;
    resultOutput += `<br/> 最大=${summonResult.lostOrbCountMax} (${round(100.0 * summonResult.lostOrbCountMax / totalSummonCount)}%), 最小 = ${summonResult.lostOrbCountMin} (${round(100.0 * summonResult.lostOrbCountMin / totalSummonCount)}%)`;
    resultOutput += "</span>";
    resultOutput += "</td></tr>";

    resultOutput += "<tr><th style='" + tableHeaderStyle + "'>平均☆5ピックアップ数(割合)</th><td>" + pickupCountAvg + "(" + round(100.0 * pickupCountAvg / totalSummonCount) + "％)<br/>";
    for (let key in pickupHeroes) {
        let icon = pickupIcons[key];
        let count = pickupHeroes[key];
        let averageCount = round((count / averageSampleCount));
        resultOutput += icon + "×" + averageCount + "(" + round(100.0 * averageCount / totalSummonCount) + "%)<br/>";
    }
    resultOutput += "<span style='font-size:10px'>";
    resultOutput += `<br/> 標準偏差=${round(pickupCountStdDev)} (${round(100.0 * pickupCountStdDev / totalSummonCount)}%), `;
    resultOutput += `変動係数 = ${round(100 * pickupCountStdDev / pickupCountAvg)}% `;
    resultOutput += `<br/> 最大=${summonResult.pickupBestCount} (${round(100.0 * summonResult.pickupBestCount / totalSummonCount)}%), 最小 = ${summonResult.pickupWorstCount} (${round(100.0 * summonResult.pickupWorstCount / totalSummonCount)}%)`;
    resultOutput += "</span>";
    resultOutput += "</td></tr>";
    resultOutput += "<tr><th style='" + tableHeaderStyle + "'>☆5ピックアップが<br/>目標数引けた試行数(割合)</th><td>";
    for (let key in couldGetPickupHeroCount) {
        let icon = pickupIcons[key];
        let count = couldGetPickupHeroCount[key];
        let averageCount = round((count / averageSampleCount));
        resultOutput += icon + " " + averageSampleCount + "回中" + count + "回(" + round(100.0 * averageCount) + "%)<br/>";
    }
    resultOutput += "</td></tr>";

    resultOutput += `<tr><th style='${tableHeaderStyle}'>PUチャージ発動回数</th><td>${pickupChargeActivatedCount}</td></tr>`;

    resultOutput += "<tr><th style='" + tableHeaderStyle + "'>平均☆4ピックアップ数(割合)</th><td>" + star4PickupCount + "(" + round(100.0 * star4PickupCount / totalSummonCount) + "％)<br/>";
    for (let key in summonResult.star4PickupHeroes) {
        let icon = pickupIcons[key];
        let count = summonResult.star4PickupHeroes[key];
        let averageCount = round((count / averageSampleCount));
        resultOutput += icon + "×" + averageCount + "(" + round(100.0 * averageCount / totalSummonCount) + "%)<br/>";
    }
    resultOutput += "<span style='font-size:10px'>";
    resultOutput += `<br/> 標準偏差=${round(star4PickupCountStdDev)} (${round(100.0 * star4PickupCountStdDev / totalSummonCount)}%), `;
    resultOutput += `変動係数 = ${round(100 * star4PickupCountStdDev / star4PickupCount)}% `;
    resultOutput += `<br/> 最大=${summonResult.star4PickupBestCount} (${round(100.0 * summonResult.star4PickupBestCount / totalSummonCount)}%), 最小 = ${summonResult.star4PickupWorstCount} (${round(100.0 * summonResult.star4PickupWorstCount / totalSummonCount)}%)`;
    resultOutput += "</span>";
    resultOutput += "</td></tr>";


    resultOutput += "<tr><th style='" + tableHeaderStyle + "'>平均☆5すり抜け数(割合)</th><td>" + star5Count + "(" + round(100.0 * star5Count / totalSummonCount) + "％)";
    resultOutput += "<span style='font-size:10px'>";
    resultOutput += `<br/> 標準偏差=${round(star5CountStdDev)} (${round(100.0 * star5CountStdDev / totalSummonCount)}%), `;
    resultOutput += `変動係数 = ${round(100 * star5CountStdDev / star5Count)}% `;
    resultOutput += `<br/> 最大=${summonResult.star5BestCount} (${round(100.0 * summonResult.star5BestCount / totalSummonCount)}%), 最小 = ${summonResult.star5WorstCount} (${round(100.0 * summonResult.star5WorstCount / totalSummonCount)}%)`;
    resultOutput += "</span>";
    resultOutput += "</td></tr>";


    resultOutput += "<tr><th style='" + tableHeaderStyle + "'>平均☆4特別チャンス数(割合)</th><td>" + star4SpecialCount + "(" + round(100.0 * star4SpecialCount / totalSummonCount) + "％)";
    resultOutput += "<span style='font-size:10px'>";
    resultOutput += `<br/> 標準偏差=${round(summonResult.star4SpecialCountStdDev)} (${round(100.0 * summonResult.star4SpecialCountStdDev / totalSummonCount)}%), `;
    resultOutput += `変動係数 = ${round(100 * summonResult.star4SpecialCountStdDev / star4SpecialCount)}% `;
    resultOutput += `<br/> 最大=${summonResult.star4SpecialBestCount} (${round(100.0 * summonResult.star4SpecialBestCount / totalSummonCount)}%), 最小 = ${summonResult.star4SpecialWorstCount} (${round(100.0 * summonResult.star4SpecialWorstCount / totalSummonCount)}%)`;
    resultOutput += "</span>";
    resultOutput += "</td></tr>";

    if (sim._star4SpecialHeroIds.length > 0) {
        resultOutput += "<tr><th style='" + tableHeaderStyle + "'>平均超☆4特別チャンス数(割合)</th><td>" + specialHeroStar4SpecialCount + "(" + round(100.0 * specialHeroStar4SpecialCount / totalSummonCount) + "％)";
        resultOutput += "<span style='font-size:10px'>";
        resultOutput += `<br/> 標準偏差=${round(summonResult.specialHeroStar4SpecialCountStdDev)} (${round(100.0 * summonResult.specialHeroStar4SpecialCountStdDev / totalSummonCount)}%), `;
        resultOutput += `変動係数 = ${round(100 * summonResult.specialHeroStar4SpecialCountStdDev / specialHeroStar4SpecialCount)}% `;
        resultOutput += `<br/> 最大=${summonResult.specialHeroStar4SpecialBestCount} (${round(100.0 * summonResult.specialHeroStar4SpecialBestCount / totalSummonCount)}%), 最小 = ${summonResult.specialHeroStar4SpecialWorstCount} (${round(100.0 * summonResult.specialHeroStar4SpecialWorstCount / totalSummonCount)}%)`;
        resultOutput += "</span>";
        resultOutput += "</td></tr>";
    }

    resultOutput += "<tr><th style='" + tableHeaderStyle + "'>平均☆5、☆4特別チャンス合計(割合)</th><td>" + star5TotalCount + "(" + round(100.0 * star5TotalCount / totalSummonCount) + "％)";
    resultOutput += "<span style='font-size:10px'>";
    resultOutput += `<br/> 標準偏差=${round(star5AndPickupCountStdDev)} (${round(100.0 * star5AndPickupCountStdDev / totalSummonCount)}%), `;
    resultOutput += `変動係数 = ${round(100 * star5AndPickupCountStdDev / star5TotalCount)}% `;
    resultOutput += `<br/> 最大=${summonResult.star5AndPickupBestCount} (${round(100.0 * summonResult.star5AndPickupBestCount / totalSummonCount)}%), 最小 = ${summonResult.star5AndPickupWorstCount} (${round(100.0 * summonResult.star5AndPickupWorstCount / totalSummonCount)}%)`;
    resultOutput += "</span>";
    resultOutput += "</td></tr>";


    resultOutput += "<tr><th style='" + tableHeaderStyle + "'>☆5が<br/>目標数引けた試行数(割合)</th><td>";
    {
        let count = summonResult.couldGetStar5HeroCount;
        let averageCount = round((count / averageSampleCount));
        resultOutput += averageSampleCount + "回中" + count + "回(" + round(100.0 * averageCount) + "%)<br/>";
    }
    resultOutput += "</td></tr>";



    resultOutput += "<tr><th style='" + tableHeaderStyle + "'>平均☆4すり抜け数(割合)</th><td>";
    resultOutput += star4Count + "(" + round(100.0 * star4Count / totalSummonCount) + "％)";
    resultOutput += "<span style='font-size:10px'>";
    resultOutput += `<br/> 標準偏差=${round(star4CountStdDev)} (${round(100.0 * star4CountStdDev / totalSummonCount)}%), `;
    resultOutput += `変動係数 = ${round(100 * star4CountStdDev / star4Count)}% `;
    resultOutput += "</span>";
    resultOutput += "</td></tr>";
    resultOutput += "<tr><th style='" + tableHeaderStyle + "'>平均☆3数(割合)</th><td>" + star3Count + "(" + round(100.0 * star3Count / totalSummonCount) + "％)";
    resultOutput += "<span style='font-size:10px'>";
    resultOutput += `<br/> 標準偏差=${round(star3CountStdDev)} (${round(100.0 * star3CountStdDev / totalSummonCount)}%), `;
    resultOutput += `変動係数 = ${round(100 * star3CountStdDev / star3Count)}% `;
    resultOutput += "</span>";
    resultOutput += "</td></tr>";
    resultOutput += "</table>";
    return resultOutput;
}

class ScopedStopwatch {
    constructor(initFunc, logFunc) {
        initFunc();
        this._logFunc = logFunc;
        this._startTime = Date.now();
    }

    dispose() {
        const endTime = Date.now();
        let diff = endTime - this._startTime;
        this._logFunc(diff + " ms");
    }
}

function using(disposable, func) {
    const result = func();
    disposable.dispose();
    return result;
}



function startProgressiveProcess(
    iterMax, // 繰り返し回数
    mainProcess, // メイン処理
    showProgress, // 進捗表示処理
    onProcessFinished = null, // 終了処理,
    waitMilliseconds = 0,
    breakLoopFunc = null,
) {
    if (iterMax == 0) {
        return;
    }

    let iter = 0;
    let endProcess = false;
    showProgress(iter, iterMax);
    setTimeout(function tmp() {
        if (iter > 0 && waitMilliseconds > 0) {
            // 処理の実行間隔を制御
            sleep(waitMilliseconds);
        }
        mainProcess(iter);
        ++iter;
        showProgress(iter, iterMax);

        let breakLoop = true;
        if (breakLoopFunc != null) {
            breakLoop = breakLoopFunc();
        }
        else {
            breakLoop = iter >= iterMax;
        }

        if (!breakLoop) {
            setTimeout(tmp, 0);
        }
        else if (!endProcess) {
            if (onProcessFinished != null) {
                onProcessFinished();
            }
            endProcess = true;
        }
    }, 0);
}


class FehSummonSimulator {
    constructor(
        initPickRate,
        initStar4Rate,
        initStar4SpecialRate,
        initSpecialHeroStar4SpecialRate,
        initStar4PickRate,
        initStar5Rate,
        star3ColorCounts,
        star4ColorCounts,
        star4SpecialColorCounts,
        specialHeroStar4SpecialColorCounts,
        star5ColorCounts,
        star4PickupHeroIds,
        pickupIcons,
        pickColorCounts,
        heroIds,
        heroColors,
        star4SpecialIcons,
        star4SpecialHeroIds,
        star4SpecialHeroColors,
        specialHeroStar4SpecialIcons,
        specialHeroStar4SpecialHeroIds,
        specialHeroStar4SpecialHeroColors,
        star5Icons,
        star5HeroIds,
        star5HeroColors,
        pickupHeroNames,
        nonPickupDecrementCount, // すり抜け時の確率低下の試行回数 0 or 20
    ) {
        // 設定 ----------------------
        this._initPickRate = initPickRate;
        this._initStar4Rate = initStar4Rate;
        this._initStar4SpecialRate = initStar4SpecialRate;
        this._initSpecialHeroStar4SpecialRate = initSpecialHeroStar4SpecialRate;
        this._originalInitStar4SpecialRate = initStar4SpecialRate;
        this._initStar4PickRate = initStar4PickRate;
        this._initStar5Rate = initStar5Rate;
        this._star3ColorCounts = star3ColorCounts;
        this._star4ColorCounts = star4ColorCounts;
        this._star4SpecialColorCounts = star4SpecialColorCounts;
        this._specialHeroStar4SpecialColorCounts = specialHeroStar4SpecialColorCounts;
        this._star5ColorCounts = star5ColorCounts;
        this._pickupIcons = pickupIcons;
        this._pickColorCounts = pickColorCounts;
        this._star5PickupHeroIds = heroIds;
        this._star4PickupHeroIds = star4PickupHeroIds;
        this._heroColors = heroColors;
        this._star4SpecialIcons = star4SpecialIcons;

        /** @type {Number[]} */
        this._star4SpecialHeroIds = star4SpecialHeroIds;
        this._star4SpecialHeroColors = star4SpecialHeroColors;
        this._specialHeroStar4SpecialIcons = specialHeroStar4SpecialIcons;
        this._specialHeroStar4SpecialHeroIds = specialHeroStar4SpecialHeroIds;
        this._specialHeroStar4SpecialHeroColors = specialHeroStar4SpecialHeroColors;
        this._star5Icons = star5Icons;
        this._star5HeroIds = star5HeroIds;
        this._star5HeroColors = star5HeroColors;
        this._pickupHeroNames = pickupHeroNames

        this._star4PickupHeroColors = [];
        for (let id of this._star4PickupHeroIds) {
            let index = this._star5PickupHeroIds.indexOf(id);
            let color = this._heroColors[index];
            this._star4PickupHeroColors.push(color);
        }
        this.nonPickupDecrementCount = nonPickupDecrementCount;
        // ---------------------------

        this._log = "";
        this._isLogDisabled = false;
        this._logIndent = "";
        this._tableHeaderStyle = "font-size:14px;";

        this._graphAverageRates = null;
        this._graphXLabels = null;
        this._graph = null;
    }

    enableStar4SpecialRate() {
        if (this._initStar4SpecialRate != this._originalInitStar4SpecialRate) {
            return;
        }
        this._initStar4SpecialRate = 0;
        this._initStar4Rate += this._originalInitStar4SpecialRate;
    }

    disableStar4SpecialRate() {
        if (this._initStar4SpecialRate == this._originalInitStar4SpecialRate) {
            return;
        }
        this._initStar4SpecialRate = this._originalInitStar4SpecialRate;
        this._initStar4Rate -= this._originalInitStar4SpecialRate;
    }

    get log() {
        return this._log;
    }

    writeLog(message) {
        if (this._isLogDisabled) {
            return;
        }
        this._log += message;
    }

    clearLog() {
        this._log = "";
    }

    _selectIndividualValueType() {
        let randVal = Math.random();
        const increment = 1.0 / 6.0;
        let threshold = increment;
        if (randVal < threshold) {
            return IndividualValueType.Hp;
        }
        threshold += increment;
        if (randVal < threshold) {
            return IndividualValueType.Attack;
        }
        threshold += increment;
        if (randVal < threshold) {
            return IndividualValueType.Speed;
        }
        threshold += increment;
        if (randVal < threshold) {
            return IndividualValueType.Defence;
        }
        threshold += increment;
        if (randVal < threshold) {
            return IndividualValueType.Resist;
        }

        return IndividualValueType.None;
    }

    /**
     * @param  {SummonParam} arg
     * @returns {SummonResult}
     */
    summon(arg) {
        return using(this.createStopwatch("summon body"), () => {
            return summon(this, arg, msg => this.writeLog(msg));
        });
    }

    writeDebugLog(message) {
        // console.log(this._logIndent + message);
    }

    createStopwatch(title) {
        return new ScopedStopwatch(
            () => {
                this._logIndent += "  ";
            },
            milliSeconds => {
                this._logIndent = this._logIndent.slice(0, -2);
                this.writeDebugLog(title + ": " + milliSeconds + " ms");
            }
        );
    }

    enableLog() {
        this._isLogDisabled = false;
    }

    calcColorPatternProbability(arg, pickupIcons, progressFunc = null, showResultFunc = null) {
        let averageSampleCount = arg.averageSampleCount;
        if (averageSampleCount > 1) {
            this._isLogDisabled = true;
        }

        let self = this;
        let colorPatterns = [
            [Color.Red],
            [Color.Green],
            [Color.Blue],
            [Color.Colorless],
            [Color.Red, Color.Blue],
            [Color.Red, Color.Green],
            [Color.Red, Color.Colorless],
            [Color.Blue, Color.Green],
            [Color.Blue, Color.Colorless],
            [Color.Green, Color.Colorless],
            [Color.Red, Color.Blue, Color.Green],
            [Color.Red, Color.Blue, Color.Colorless],
            [Color.Red, Color.Green, Color.Colorless],
            [Color.Blue, Color.Green, Color.Colorless],
            [Color.Red, Color.Blue, Color.Green, Color.Colorless],
        ];

        let resultsPerSummonColor = [];
        startProgressiveProcess(
            colorPatterns.length,
            function (iter) {
                let summonColors = colorPatterns[iter];
                arg.summonColors = summonColors;
                let summonHistory = [];
                for (let i = 0; i < averageSampleCount; ++i) {
                    let result = self.summon(arg);
                    summonHistory.push(result);
                }

                let averageResult = self.__createSummonAverateResult(arg, summonHistory);

                let averageStar5Count = 0;
                let minCount = Number.MAX_VALUE;
                let maxCount = 0;
                for (let result of summonHistory) {
                    let totalStar5Count = result.star5Count + result.pickupCount;
                    averageStar5Count += totalStar5Count;
                    if (totalStar5Count > maxCount) {
                        maxCount = totalStar5Count;
                    }
                    if (totalStar5Count < minCount) {
                        minCount = totalStar5Count;
                    }
                }

                averageStar5Count = averageStar5Count / summonHistory.length;
                resultsPerSummonColor.push([summonColors, averageStar5Count, minCount, maxCount, averageResult]);
            },
            function (iter, iterMax) {
                if (progressFunc != null) {
                    progressFunc(`計算中 ${iter} / ${iterMax}`);
                }
            },
            function () {
                if (progressFunc != null) {
                    progressFunc("");
                }

                resultsPerSummonColor.sort(function (a, b) {
                    return b[1] - a[1];
                });

                let result = "<table border='1'>";
                result += "<tr><th>順位</th><th>召喚する色</th><th>平均☆5数<br/>(最小～最大)</th><th>平均ピックアップ☆5数</th></tr>";
                let order = 1;
                for (let resultPerSummonColor of resultsPerSummonColor) {
                    result += "<tr>";
                    let orbIconHtml = "";
                    for (let color of resultPerSummonColor[0]) {
                        orbIconHtml += getOrbIconHtml(color);
                    }
                    result += "<td>";
                    result += order;
                    ++order;
                    result += "</td>";

                    result += "<td>";
                    result += orbIconHtml;
                    result += "</td>";

                    result += "<td>";
                    result += resultPerSummonColor[1] + "<br/>";
                    result += "(" + resultPerSummonColor[2] + "～" + resultPerSummonColor[3] + ")";
                    result += "</td>";

                    result += "<td>";

                    let averageResult = resultPerSummonColor[4];
                    let pickupCount = round(averageResult.pickupCount / arg.averageSampleCount);
                    result += `${pickupCount}<br/>(`;
                    for (let key in averageResult.pickupHeroes) {
                        let icon = pickupIcons[key];
                        let count = averageResult.pickupHeroes[key];
                        let averageCount = round(count / arg.averageSampleCount);
                        result += icon + "×" + averageCount + " ";
                    }
                    result += ")</td>";

                    result += "</tr>";
                }
                result += "</table>";

                // let result = self.__createSummonAverateResult(arg, summonHistory);
                if (showResultFunc != null) {
                    showResultFunc(result);
                }
            }
        );
    }

    summonAverageProgressive(arg, progressFunc = null, showResultFunc = null) {
        let averageSampleCount = arg.averageSampleCount;
        if (averageSampleCount > 1) {
            this._isLogDisabled = true;
        }

        let self = this;
        let summonHistory = [];
        let processCount = 100;
        let perProcessCount = Math.ceil(averageSampleCount / processCount);
        let sample = 0;

        const startTime = Date.now();
        startProgressiveProcess(
            processCount,
            function (iter) {
                for (let i = 0; i < perProcessCount && sample < averageSampleCount; ++i, ++sample) {
                    let result = self.summon(arg);
                    summonHistory.push(result);
                }
            },
            function (iter, iterMax) {
                if (progressFunc != null) {
                    progressFunc(`計算中 ${iter} / ${iterMax}`);
                }
            },
            function () {
                if (progressFunc != null) {
                    progressFunc("");
                }
                let result = self.__createSummonAverateResult(arg, summonHistory);

                const endTime = Date.now();
                let diff = endTime - startTime;
                console.log(diff + " ms");

                if (showResultFunc != null) {
                    showResultFunc(result);
                }
            }
        );
    }

    drawLostOrbDistributionGraph(arg) {
        let averageSampleCount = arg.averageSampleCount;
        let summonHistory = [];
        this._isLogDisabled = true;
        using(this.createStopwatch("summon total"), () => {
            for (let i = 0; i < averageSampleCount; ++i) {
                let result = this.summon(arg);
                summonHistory.push(result);
            }
        });

        let maxLostOrbCount = 0;
        let multipleStar5Count = 0;
        for (let result of summonHistory) {
            if (result.lostOrbCount > maxLostOrbCount) {
                maxLostOrbCount = result.lostOrbCount;
            }

            let star5Count = result.star5Count + result.pickupCount;
            if (star5Count > 4) {
                ++multipleStar5Count;
            }
        }

        // 一旦決め打ち
        maxLostOrbCount = 500;

        let multipleStar5CountPercentage = multipleStar5Count / summonHistory.length;
        console.log(`複数引けた割合: ${multipleStar5CountPercentage}%`);

        let lostOrbCountGraph = [];
        for (let i = 0; i <= maxLostOrbCount; ++i) {
            lostOrbCountGraph.push(0);
        }
        for (let result of summonHistory) {
            ++lostOrbCountGraph[result.lostOrbCount];
        }
        for (let i = 0; i <= maxLostOrbCount; ++i) {
            console.log(`${i}\t${lostOrbCountGraph[i]}`);
        }
    }
    /**
     * @param  {} arg
     * @returns {SummonResult}
     */
    summonAverage(arg) {
        let canSummon = (arg.ownOrbCount > 5 && arg.summonMode == SummonMode.OrbCount)
            || (arg.summonCount > 0 && arg.summonMode == SummonMode.SummonCount);
        if (arg.useWasm && canSummon) {
            return summonAverageWithArgByWasm(
                arg,
                [this._initPickRate, this._initStar5Rate, this._initStar4PickRate, this._initStar4Rate],
                this._star3ColorCounts,
                this._star4ColorCounts,
                this._star5PickupHeroIds,
                this._heroColors,
                this._star5HeroIds,
                this._star5HeroColors,
                this._star4PickupHeroIds,
                this._star4PickupHeroColors,
                this.nonPickupDecrementCount
            );
        }
        else {
            let averageSampleCount = arg.averageSampleCount;
            if (averageSampleCount > 1) {
                this._isLogDisabled = true;
            }

            /** @type {SummonResult[]} */
            let summonHistory = [];

            using(this.createStopwatch("summon total"), () => {
                for (let i = 0; i < averageSampleCount; ++i) {
                    let result = this.summon(arg);
                    summonHistory.push(result);
                }
            });

            return this.__createSummonAverateResult(arg, summonHistory);
        }
    }

    /**
     * @param  {SummonParam} arg
     * @param  {SummonResult[]} summonHistory
     * @returns {SummonResult}
     */
    __createSummonAverateResult(arg, summonHistory) {
        let targetHeroCount = arg.targetPickupCount;
        let totalSummonCount = 0;
        let lostOrbCount = 0;
        let star5AndPickupCount = 0;
        let pickupCount = 0;
        let star5Count = 0;
        let star4SpecialCount = 0;
        let specialHeroStar4SpecialCount = 0;
        let star4Count = 0;
        let star4PickupCount = 0;
        let star3Count = 0;
        let pickupHeroes = {};
        let star4PickupHeroes = {};

        let star3CountStdDev = 0;
        let star4CountStdDev = 0;
        let star5CountStdDev = 0;
        let star4SpecialCountStdDev = 0;
        let specialHeroStar4SpecialCountStdDev = 0;
        let star4PickupCountStdDev = 0;
        let pickupCountStdDev = 0;
        let star5AndPickupCountStdDev = 0;
        let pickupCountStdDevs = {};
        let lostOrbCountStdDev = 0;

        let star4PickupWorstCount = 1000000;
        let star4PickupBestCount = 0;
        let pickupWorstCount = 1000000;
        let pickupBestCount = 0;
        let star5WorstCount = 1000000;
        let star5BestCount = 0;
        let star4SpecialWorstCount = 1000000;
        let star4SpecialBestCount = 0;
        let specialHeroStar4SpecialWorstCount = 1000000;
        let specialHeroStar4SpecialBestCount = 0;
        let star5AndPickupWorstCount = 1000000;
        let star5AndPickupBestCount = 0;
        let minLostOrbCount = 10000000;
        let maxLostOrbCount = 0;
        let totalSummonCountMin = 10000000;
        let totalSummonCountMax = 0;
        let countOverSpecfiedSummonCount = 0;

        let pickupBestCounts = {};
        let pickupWorstCounts = {};

        // ピックアップが引けた試行数
        let couldGetPickupHeroCount = {};
        let couldGetStar4PickupHeroCount = 0;
        let couldGetStar4AndStar5PickupHeroCount = 0;
        let couldGetStar5PickupHeroCount = 0;
        let couldGetStar5HeroCount = 0;

        let maxTryCountUntilRateResets = 0;

        let pickupChargeActivatedCount = 0;

        for (let result of summonHistory) {
            star3Count += result.star3Count;
            star4Count += result.star4Count;
            star5Count += result.star5Count;
            star4SpecialCount += result.star4SpecialCount;
            specialHeroStar4SpecialCount += result.specialHeroStar4SpecialCount;
            lostOrbCount += result.lostOrbCount;

            pickupChargeActivatedCount += result.pickupChargeActivatedCount;

            star4PickupCount += result.star4PickupCount;
            pickupCount += result.pickupCount;

            let star5AndPickupCountCurrent = result.star5Count + result.pickupCount + result.star4SpecialCount + result.specialHeroStar4SpecialCount;
            star5AndPickupCount += star5AndPickupCountCurrent;

            if (result.totalSummonCount < totalSummonCountMin) {
                totalSummonCountMin = result.totalSummonCount;
            }
            totalSummonCountMax = Math.max(result.totalSummonCount, totalSummonCountMax);
            maxTryCountUntilRateResets = Math.max(result.maxTryCountUntilRateResets, maxTryCountUntilRateResets);

            if (result.lostOrbCount < minLostOrbCount) {
                minLostOrbCount = result.lostOrbCount;
            }
            if (result.lostOrbCount > maxLostOrbCount) {
                maxLostOrbCount = result.lostOrbCount;
            }

            if (result.star4PickupCount < star4PickupWorstCount) {
                star4PickupWorstCount = result.star4PickupCount;
            }
            else if (result.star4PickupCount > star4PickupBestCount) {
                star4PickupBestCount = result.star4PickupCount;
            }

            if (result.pickupCount < pickupWorstCount) {
                pickupWorstCount = result.pickupCount;
            }
            else if (result.pickupCount > pickupBestCount) {
                pickupBestCount = result.pickupCount;
            }

            if (result.star5Count < star5WorstCount) {
                star5WorstCount = result.star5Count;
            }
            else if (result.star5Count > star5BestCount) {
                star5BestCount = result.star5Count;
            }

            star4SpecialWorstCount = Math.min(result.star4SpecialCount, star4SpecialWorstCount);
            star4SpecialBestCount = Math.max(result.star4SpecialCount, star4SpecialBestCount);

            specialHeroStar4SpecialWorstCount = Math.min(result.specialHeroStar4SpecialCount, specialHeroStar4SpecialWorstCount);
            specialHeroStar4SpecialBestCount = Math.max(result.specialHeroStar4SpecialCount, specialHeroStar4SpecialBestCount);

            if (star5AndPickupCountCurrent < star5AndPickupWorstCount) {
                star5AndPickupWorstCount = star5AndPickupCountCurrent;
            }
            else if (star5AndPickupCountCurrent > star5AndPickupBestCount) {
                star5AndPickupBestCount = star5AndPickupCountCurrent;
            }

            for (let key in result.pickupHeroes) {
                let obtainedHeroCount = result.pickupHeroes[key].length;

                if (pickupHeroes[key]) {
                    pickupHeroes[key] += obtainedHeroCount;
                }
                else {
                    pickupHeroes[key] = obtainedHeroCount;
                }
            }
        }
        let lostOrbCountAverage = lostOrbCount / summonHistory.length;
        let star3CountAverage = star3Count / summonHistory.length;
        let star4CountAverage = star4Count / summonHistory.length;
        let star5CountAverage = star5Count / summonHistory.length;
        let star4SpecialCountAverage = star4SpecialCount / summonHistory.length;
        let specialHeroStar4SpecialCountAverage = specialHeroStar4SpecialCount / summonHistory.length;
        let star4PickupCountAverage = star4PickupCount / summonHistory.length;
        let pickupCountAverage = pickupCount / summonHistory.length;
        let star5AndPickupCountAverage = star5AndPickupCount / summonHistory.length;

        let pickupCountAverages = {};
        for (let key in pickupHeroes) {
            pickupCountAverages[key] = pickupHeroes[key] / summonHistory.length;
        }

        for (let result of summonHistory) {
            totalSummonCount += result.totalSummonCount;
            if (arg.summonCountThresholdToCount != 0 && result.maxTryCountUntilRateResets >= arg.summonCountThresholdToCount) {
                ++countOverSpecfiedSummonCount;
            }

            lostOrbCountStdDev += Math.abs(result.lostOrbCount - lostOrbCountAverage);

            star3CountStdDev += Math.abs(result.star3Count - star3CountAverage);
            star4CountStdDev += Math.abs(result.star4Count - star4CountAverage);
            star5CountStdDev += Math.abs(result.star5Count - star5CountAverage);
            star4SpecialCountStdDev += Math.abs(result.star4SpecialCount - star4SpecialCountAverage);
            specialHeroStar4SpecialCountStdDev += Math.abs(result.specialHeroStar4SpecialCount - specialHeroStar4SpecialCountAverage);
            star4PickupCountStdDev += Math.abs(result.star4PickupCount - star4PickupCountAverage);
            pickupCountStdDev += Math.abs(result.pickupCount - pickupCountAverage);
            let totalStar5Count = result.star5Count + result.pickupCount + result.star4SpecialCount + result.specialHeroStar4SpecialCount;
            star5AndPickupCountStdDev += Math.abs(totalStar5Count - star5AndPickupCountAverage);

            let star4PickedHeroObtainedCount = 0;
            for (let key in result.pickupHeroes) {
                let obtainedHeroCount = result.pickupHeroes[key].length;
                let heroId = this._star5PickupHeroIds[key];
                if (this._star4PickupHeroIds.includes(heroId)) {
                    // ☆4排出の☆5キャラ
                    star4PickedHeroObtainedCount += obtainedHeroCount;
                }

                let diff = Math.abs(obtainedHeroCount - pickupCountAverages[key]);
                if (pickupCountStdDevs[key]) {
                    pickupCountStdDevs[key] += diff;
                }
                else {
                    pickupCountStdDevs[key] = diff;
                }

                if (obtainedHeroCount >= targetHeroCount) {
                    if (couldGetPickupHeroCount[key]) {
                        couldGetPickupHeroCount[key] += 1;
                    }
                    else {
                        couldGetPickupHeroCount[key] = 1;
                    }
                }

                if (pickupBestCounts[key]) {
                    if (obtainedHeroCount > pickupBestCounts[key]) {
                        pickupBestCounts[key] = obtainedHeroCount;
                    }
                } else {
                    pickupBestCounts[key] = obtainedHeroCount;
                }
                if (pickupWorstCounts[key]) {
                    if (obtainedHeroCount < pickupWorstCounts[key]) {
                        pickupWorstCounts[key] = obtainedHeroCount;
                    }
                } else {
                    pickupWorstCounts[key] = obtainedHeroCount;
                }
            }

            for (let key in result.star4PickupHeroes) {
                let obtainedHeroCount = result.star4PickupHeroes[key].length;
                if (star4PickupHeroes[key]) {
                    star4PickupHeroes[key] += obtainedHeroCount;
                }
                else {
                    star4PickupHeroes[key] = obtainedHeroCount;
                }
            }

            // 星4ピックが引けた数
            {
                if (result.star4PickupCount >= targetHeroCount) {
                    couldGetStar4PickupHeroCount += 1;
                }
            }

            // 星4ピック+星5ピックが引けた数
            {
                if ((result.star4PickupCount + star4PickedHeroObtainedCount) >= targetHeroCount) {
                    couldGetStar4AndStar5PickupHeroCount += 1;
                }
            }

            // ☆5ピックアップが引けた数
            {
                if (result.pickupCount >= targetHeroCount) {
                    couldGetStar5PickupHeroCount += 1;
                }
            }

            // ☆5が引けた数
            {
                if (totalStar5Count >= targetHeroCount) {
                    couldGetStar5HeroCount += 1;
                }
            }
        }

        lostOrbCountStdDev = lostOrbCountStdDev / summonHistory.length;
        star3CountStdDev = star3CountStdDev / summonHistory.length;
        star4CountStdDev = star4CountStdDev / summonHistory.length;
        star5CountStdDev = star5CountStdDev / summonHistory.length;
        star4SpecialCountStdDev = star4SpecialCountStdDev / summonHistory.length;
        specialHeroStar4SpecialCountStdDev = specialHeroStar4SpecialCountStdDev / summonHistory.length;
        star4PickupCountStdDev = star4PickupCountStdDev / summonHistory.length;
        pickupCountStdDev = pickupCountStdDev / summonHistory.length;
        star5AndPickupCountStdDev = star5AndPickupCountStdDev / summonHistory.length;

        for (let key in pickupHeroes) {
            pickupCountStdDevs[key] = pickupCountStdDevs[key] / summonHistory.length;
        }

        let summonResult = new SummonResult();
        summonResult.lostOrbCountStdDev = lostOrbCountStdDev;
        summonResult.star3CountStdDev = star3CountStdDev;
        summonResult.star4CountStdDev = star4CountStdDev;
        summonResult.star4SpecialCountStdDev = star4SpecialCountStdDev;
        summonResult.specialHeroStar4SpecialCountStdDev = specialHeroStar4SpecialCountStdDev;
        summonResult.star5CountStdDev = star5CountStdDev;
        summonResult.star5AndPickupCountStdDev = star5AndPickupCountStdDev;
        summonResult.star4PickupCountStdDev = star4PickupCountStdDev;
        summonResult.pickupCountStdDev = pickupCountStdDev;
        summonResult.pickupCountStdDevs = pickupCountStdDevs;

        summonResult.lostOrbCountMin = minLostOrbCount;
        summonResult.lostOrbCountMax = maxLostOrbCount;
        summonResult.star4PickupWorstCount = star4PickupWorstCount;
        summonResult.star4PickupBestCount = star4PickupBestCount;
        summonResult.star4SpecialWorstCount = star4SpecialWorstCount;
        summonResult.star4SpecialBestCount = star4SpecialBestCount;
        summonResult.specialHeroStar4SpecialWorstCount = specialHeroStar4SpecialWorstCount;
        summonResult.specialHeroStar4SpecialBestCount = specialHeroStar4SpecialBestCount;
        summonResult.pickupWorstCount = pickupWorstCount;
        summonResult.pickupBestCount = pickupBestCount;
        summonResult.star5WorstCount = star5WorstCount;
        summonResult.star5BestCount = star5BestCount;
        summonResult.star5AndPickupWorstCount = star5AndPickupWorstCount;
        summonResult.star5AndPickupBestCount = star5AndPickupBestCount;
        summonResult.pickupBestCounts = pickupBestCounts;
        summonResult.pickupWorstCounts = pickupWorstCounts;
        // star5AndPickupCountAverage - star5AndPickupCountAverage;

        summonResult.totalSummonCountMin = totalSummonCountMin;
        summonResult.totalSummonCountMax = totalSummonCountMax;
        summonResult.maxTryCountUntilRateResets = maxTryCountUntilRateResets;
        summonResult.totalSummonCount = totalSummonCount;
        summonResult.lostOrbCount = lostOrbCount;
        summonResult.pickupCount = pickupCount;
        summonResult.star5Count = star5Count;
        summonResult.star4Count = star4Count;
        summonResult.star4SpecialCount = star4SpecialCount;
        summonResult.specialHeroStar4SpecialCount = specialHeroStar4SpecialCount;
        summonResult.star4PickupCount = star4PickupCount;
        summonResult.star3Count = star3Count;
        summonResult.pickupHeroes = pickupHeroes;
        summonResult.star4PickupHeroes = star4PickupHeroes;
        summonResult.couldGetPickupHeroCount = couldGetPickupHeroCount;
        summonResult.couldGetStar4PickupHeroCount = couldGetStar4PickupHeroCount;
        summonResult.couldGetStar4AndStar5PickupHeroCount = couldGetStar4AndStar5PickupHeroCount;
        summonResult.couldGetStar5HeroCount = couldGetStar5HeroCount;
        summonResult.couldGetStar5PickupHeroCount = couldGetStar5PickupHeroCount;
        summonResult.pickupChargeActivatedCount = pickupChargeActivatedCount;

        if (arg.summonCountThresholdToCount > 0) {
            summonResult.countOverSpecfiedSummonCount = countOverSpecfiedSummonCount;
        }
        return summonResult;
    }

    showCoeffOfVariationLineChart(
        canvasId,
        arg,
        progressFunc = null
    ) {
        // 設定 --------------
        let summonColors = arg.summonColors;
        let ownOrbCount = arg.ownOrbCount;
        let samplingOffset = arg.samplingOffset;
        let tryCount = arg.graphSampleCount - samplingOffset;
        let orbInterval = ownOrbCount / arg.graphSampleCount;
        let averageSampleCount = arg.averageSampleCount;
        let targetPickupCount = arg.targetPickupCount;

        console.log(`summonColors = ${summonColors}`);
        console.log(`ownOrbCount = ${ownOrbCount}`);
        console.log(`averageSampleCount = ${averageSampleCount}`);
        console.log(`targetPickupCount = ${targetPickupCount}`);
        // -------------------

        let self = this;
        let coeffOfVariations = {};
        // let key = 0;
        for (let i = 0; i < this._star5PickupHeroIds.length; ++i) {
            coeffOfVariations[i] = [];
        }
        let xLabels = [];
        let currentOrbCount = 0;
        startProgressiveProcess(
            tryCount + 1,
            function (i) {
                let iter = i + samplingOffset;
                let ownOrbCount = Math.floor(iter * orbInterval);
                if (ownOrbCount == 0) {
                    ownOrbCount = 5;
                }
                currentOrbCount = ownOrbCount;

                xLabels.push(ownOrbCount);
                let param = new SummonParam();
                param.ownOrbCount = ownOrbCount;
                param.summonColors = summonColors;
                param.averageSampleCount = averageSampleCount;
                param.targetPickupCount = targetPickupCount;
                param.summonMode = SummonMode.OrbCount;
                param.summonCount = 0;
                param.startTryCount = arg.startTryCount;

                // todo: wasm版がピックアップ毎のベスト、ワースト取得に未対応なので対応する
                // param.useWasm = arg.useWasm;
                param.useWasm = false;

                param.colorPriorities = arg.colorPriorities;
                param.randAlgorithm = arg.randAlgorithm;
                param.targetPickupIndex = arg.targetPickupIndex;

                let summonResult = self.summonAverage(param);
                {
                    let total = summonResult.star5Count + summonResult.pickupCount;
                    let inputValue = summonResult.star5AndPickupCountStdDev;
                    if (arg.showMaxDeviationGraph) {
                        let average = total / averageSampleCount;
                        let worstDeviation = Math.abs(summonResult.star5AndPickupWorstCount - average);
                        let bestDeviation = Math.abs(summonResult.star5AndPickupBestCount - average);
                        let maxDeviation = Math.max(worstDeviation, bestDeviation);
                        inputValue = maxDeviation;
                        console.log(`ownOrbCount=${ownOrbCount}: maxDeviation=${maxDeviation}(${summonResult.star5AndPickupWorstCount}-${average} or ${summonResult.star5AndPickupBestCount}-${average})`);
                    }
                    {
                        let cv = __getCoeffOfVariation(
                            inputValue,
                            total,
                            averageSampleCount);
                        // coeffOfVariations[key].push(cv);
                    }
                }

                for (let key in coeffOfVariations) {
                    let total = summonResult.pickupHeroes[key];
                    let inputValue = summonResult.pickupCountStdDevs[key];
                    let cv = __getCoeffOfVariation(
                        inputValue,
                        total,
                        averageSampleCount);
                    coeffOfVariations[key].push(cv);
                }
            },
            function (iter, iterMax) {
                if (progressFunc != null) {
                    progressFunc(`計算中 ${iter} / ${iterMax} (${currentOrbCount}オーブの平均を計算中)`);
                }
            },
            function () {
                if (progressFunc != null) {
                    progressFunc("");
                }
                self._graphAverageRates = coeffOfVariations;
                self._graphXLabels = xLabels;

                for (let key in coeffOfVariations) {
                    for (let i = 0; i < coeffOfVariations[key].length; ++i) {
                        let cv = coeffOfVariations[key][i];
                        let label = xLabels[i];
                        console.log(`${label}: ${cv}`);
                    }
                }

                let enabledGraphElems = [];
                enabledGraphElems.push(true);
                let labels = [];
                labels.push("☆5");
                self.__drawGraphImpl(canvasId, xLabels, coeffOfVariations, labels, enabledGraphElems, arg.graphWidth, arg.graphHeight);
            }
        );
    }

    /**
     * @param  {string} canvasId
     * @param  {SummonParam} arg
     * @param  {boolean[]} enabledGraphElems
     * @param  {Function} progressFunc=null
     */
    showSummonRateLineChart(
        canvasId,
        arg,
        enabledGraphElems,
        progressFunc = null
    ) {
        // 設定 --------------
        let summonColors = arg.summonColors;
        let ownOrbCount = arg.ownOrbCount;
        let samplingOffset = arg.samplingOffset;
        let tryCount = arg.graphSampleCount - samplingOffset;
        let orbInterval = ownOrbCount / tryCount;
        let averageSampleCount = arg.averageSampleCount;
        let targetPickupCount = arg.targetPickupCount;

        console.log(`summonColors = ${summonColors}`);
        console.log(`ownOrbCount = ${ownOrbCount}`);
        console.log(`averageSampleCount = ${averageSampleCount}`);
        console.log(`targetPickupCount = ${targetPickupCount}`);
        // -------------------

        let averageRates = {};
        let xLabels = [];
        let prevAverageRate = 0;

        let averageRateLength = this._pickupHeroNames.length + this._star4PickupHeroIds.length * 2 + 2;
        {
            for (let j = 0; j < averageRateLength; ++j) {
                let key = j.toString();
                averageRates[key] = [];
            }
        }

        let self = this;
        let isBroken = false;
        startProgressiveProcess(
            tryCount + 1,
            function (i) {
                let iter = i + samplingOffset;
                let ownOrbCount = Math.floor(iter * orbInterval);
                let param = new SummonParam();
                param.ownOrbCount = ownOrbCount;
                param.summonColors = summonColors;
                param.averageSampleCount = averageSampleCount;
                param.targetPickupCount = targetPickupCount;
                param.summonMode = SummonMode.OrbCount;
                param.summonCount = 0;
                param.startTryCount = arg.startTryCount;
                param.useWasm = arg.useWasm;
                param.colorPriorities = arg.colorPriorities;
                param.randAlgorithm = arg.randAlgorithm;
                param.targetPickupIndex = arg.targetPickupIndex;
                param.isPickupChargeEnabled = arg.isPickupChargeEnabled;
                let summonResult = self.summonAverage(param);
                console.log(`${ownOrbCount}: `);
                console.log(summonResult);
                let maxRate = 0;
                xLabels.push(ownOrbCount);

                // カウント0で初期化
                {
                    for (let j = 0; j < averageRateLength; ++j) {
                        let key = j.toString();
                        averageRates[key].push(0);
                    }
                }

                // 召喚できたものは上書き
                {
                    let j = 0;
                    for (; j < self._pickupHeroNames.length; ++j) {
                        let key = j.toString();
                        let count = summonResult.couldGetPickupHeroCount[key];
                        let averageRate = 0;
                        if (param.averageSampleCount > 0 && count != undefined) {
                            averageRate = round((count / param.averageSampleCount));
                        }
                        maxRate = Math.max(averageRate, maxRate);
                        averageRates[key][i] = averageRate;
                    }

                    if (self._star4PickupHeroIds.length > 0) {
                        // ☆4 ピックアップ
                        {
                            let key = j.toString();
                            ++j;
                            let averageRate = 0;
                            let count = summonResult.couldGetStar4PickupHeroCount;
                            if (param.averageSampleCount > 0 && count != undefined) {
                                averageRate = round((count / param.averageSampleCount));
                            }
                            averageRates[key][i] = averageRate;
                        }

                        // ☆4 + ☆5ピックアップ
                        {
                            let key = j.toString();
                            ++j;
                            let averageRate = 0;
                            let count = summonResult.couldGetStar4AndStar5PickupHeroCount;
                            if (param.averageSampleCount > 0 && count != undefined) {
                                averageRate = round((count / param.averageSampleCount));
                            }
                            averageRates[key][i] = averageRate;
                        }
                    }

                    // ☆5ピックアップ
                    {
                        let key = j.toString();
                        ++j;
                        let averageRate = 0;
                        let count = summonResult.couldGetStar5PickupHeroCount;
                        if (param.averageSampleCount > 0 && count != undefined) {
                            averageRate = round((count / param.averageSampleCount));
                        }
                        averageRates[key][i] = averageRate;
                    }

                    // ☆5
                    {
                        let key = j.toString();
                        ++j;
                        let averageRate = 0;
                        let count = summonResult.couldGetStar5HeroCount;
                        if (param.averageSampleCount > 0 && count != undefined) {
                            averageRate = round((count / param.averageSampleCount));
                        }
                        averageRates[key][i] = averageRate;
                    }

                    let maxIncreasedRate = maxRate - prevAverageRate;
                    prevAverageRate = maxRate;
                    if (arg.increaseRateThresholdToStopSample != 0.0
                        && maxRate > 0.1 && maxIncreasedRate < arg.increaseRateThresholdToStopSample) {
                        isBroken = true;
                        console.log("break");
                    }
                }
            },
            function (iter, iterMax) {
                if (progressFunc != null) {
                    progressFunc(`計算中 ${iter} / ${iterMax}`);
                }
                if (!isBroken) {
                    isBroken = iter == iterMax;
                }
            },
            function () {
                if (progressFunc != null) {
                    progressFunc("");
                }
                self._graphAverageRates = averageRates;
                self._graphXLabels = xLabels;

                let labels = self.__createRateGraphGraphDataLabels();
                self.__drawGraphImpl(canvasId, xLabels, averageRates, labels, enabledGraphElems, arg.graphWidth, arg.graphHeight);
            },
            0,
            function () {
                return isBroken;
            }
        );
    }

    redrawGraph(canvasId, enabledGraphElems, graphWidth, graphHeight) {
        if (this._graphAverageRates == null) {
            return;
        }
        let labels = this.__createRateGraphGraphDataLabels();
        this.__drawGraphImpl(canvasId, this._graphXLabels, this._graphAverageRates, labels, enabledGraphElems, graphWidth, graphHeight);
    }

    __getPickupHeroNameById(id) {
        for (let j = 0; j < this._star5PickupHeroIds.length; ++j) {
            let heroId = this._star5PickupHeroIds[j];
            if (id == heroId) {
                return this._pickupHeroNames[j];
            }
        }
        return `不明(${id})`;
    }

    __createRateGraphGraphDataLabels() {
        let labels = [];
        {
            for (let j = 0; j < this._pickupHeroNames.length; ++j) {
                labels.push(this._pickupHeroNames[j] + "(☆5)");
            }
            for (let j = 0; j < this._star4PickupHeroIds.length; ++j) {
                let key = this._star4PickupHeroIds[j];
                let name = this.__getPickupHeroNameById(key);
                labels.push(name + "(☆4)");
                labels.push(name + "(☆4+☆5)");
            }
            labels.push("(☆5ピックアップ)");
            labels.push("(☆5)");
        }
        return labels;
    }

    __drawGraphImpl(canvasId, xLabels, graphData, graphDataLabels, enabledGraphElems, graphWidth, graphHeight) {
        const colors = [
            '#0000ff',
            '#ff7f50',
            '#008000',

            '#ffa500',
            '#ba55d3',
            'rgb(235, 62, 35)',

            '#87ceeb',
            '#9acd32',
            '#1e90ff',

            '#f0e68c',
            '#a9a9a9',
            '#ffc0cb',

            '#9a9a9a',
            '#c0cbff',
        ];
        const bgAlpha = 1.0;
        let datasets = [];
        const pointRadius = 0;
        {
            let i = 0;
            for (let key in graphData) {
                if (!enabledGraphElems[i]) {
                    ++i;
                    continue;
                }
                let color = colors[i];
                datasets.push(
                    {
                        label: graphDataLabels[key],
                        fill: false,
                        pointRadius: pointRadius,
                        backgroundColor: Chart.helpers.color(color).alpha(bgAlpha).rgbString(),
                        borderColor: color,
                        data: graphData[key]
                    }
                );
                ++i;
            }
        }


        let maxValue = 1.0;
        {
            for (let key in graphData) {
                for (let value of graphData[key]) {
                    if (value > maxValue) {
                        maxValue = Number(value);
                    }
                }
            }
        }

        // 最大値を10%でスナップ
        maxValue = Math.ceil(maxValue * 10) * 0.1;
        let stepSize = 0.1;
        if (maxValue > 2) {
            stepSize = maxValue / 20;
        }

        let options = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    display: true,
                    ticks: {
                        // Include a dollar sign in the ticks
                        callback: function (value, index, values) {
                            return Math.round(value * 100) + '%';
                        },
                        beginAtZero: true,
                        stepSize: stepSize,
                        min: 0,
                        max: maxValue,
                    }
                }]
            },
            elements: {
                line: {
                    tension: 0, // disables bezier curves
                }
            },
            animation: {
                duration: 0, // general animation time
            },
            hover: {
                animationDuration: 0, // duration of animations when hovering an item
            },
            responsiveAnimationDuration: 0, // animation duration after a resize
        };

        if (this._graph == null) {
            let ctx = document.getElementById(canvasId).getContext('2d');
            ctx.canvas.height = graphHeight;
            ctx.canvas.width = graphWidth;
            let data = {
                labels: xLabels,
                datasets: datasets
            };

            this._graph = new Chart(ctx, {
                type: 'line',
                data: data,
                options: options
            });
        }
        else {
            this._graph.data.labels = xLabels;
            this._graph.data.datasets = datasets;
            this._graph.options.scales.yAxes[0].ticks.max = maxValue;
            this._graph.options.scales.yAxes[0].ticks.stepSize = stepSize;
            this._graph.update();
        }
    }
}
