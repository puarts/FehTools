const SimMode = {
    Normal: 0,
    Average: 1,
    Graph: 2,
    CoeffOfVariationGraph: 3, // 確率変動グラフ
    ColorPatternProbability: 4, // 色の組み合わせ
};
const extraGraphStyle = "height:500px;position:relative";
class AppData {
    constructor() {
        this.targetPickupIndex = -1;
        this.isSpecialStar4Enabled = true;
        this.summonAllOrbsIfSummonedStar5 = false;
        this.summonMode = SummonMode.SummonCount;
        this.samplingOffset = 0;
        this.ownOrbCount = 156;
        this.summonCount = 40;
        this.summonStar5Count = 1;
        this.summonColors = ["red", "blue", "green", "colorless"];
        this.colorPrirorities = ["red", "blue", "green", "colorless"];
        this.averageSampleCount = 10000;
        this.targetPickupCount = 1;
        this.graphEnabledValues = [
        ];
        this.summonOutput = "<b>結果概要はここに表示されます</b>";
        this.summonLog = "<b>詳細結果はここに表示されます</b>";
        this.progressLog = "";
        this.mode = SimMode.Normal;
        this.modeOptions = [
            { text: "通常", value: SimMode.Normal },
            { text: "平均", value: SimMode.Average },
            { text: "召喚色毎の☆5期待値計算", value: SimMode.ColorPatternProbability },
            { text: "確率グラフ", value: SimMode.Graph },
            { text: "変動係数グラフ", value: SimMode.CoeffOfVariationGraph },
            { text: "消費オーブ分布グラフ", value: SimMode.LostOrbDistribution },
        ];
        this.graphSampleCount = 10;
        this.isGraphCreated = false;
        this.stopsSamplingIfGraphIsConsistent = true;
        this.showsGraphModeAdvancedSettings = false;
        this.showMaxDeviationGraph = false;
        this.graphWidth = 300;
        this.graphHeight = 300;
        this.graphStyle = "width:300px;" + extraGraphStyle;
        this.graphCanvasStyle = "width:300px;" + extraGraphStyle;
        this.startTryCount = 0;
        this.startStar5PickupRate = 0;
        this.useWasm = false;
        this.randAlgorithm = RandomAlgorithm.Xoroshiro128aa;
        this.isDebugModeEnabled = false;
        // 平均モードの時にカウントする召喚回数の閾値(80だったら80回以上召喚した試行だけをカウント)
        this.summonCountThresholdToCount = 0;
        this.isPickupChargeEnabled = true;
        this.pickupHeroNames = null;

        this.isWebWorkerEnabled = false;
        this.webWorkerCount = 4;
    }
}

const dataObj = new AppData();

/** @type {FehSummonSimulator} */
let g_sim = null;
let g_pickupIcons = null;
function createSummonParam() {
    let param = new SummonParam();
    param.useWasm = dataObj.useWasm;
    param.ownOrbCount = dataObj.ownOrbCount;
    param.summonCount = dataObj.summonCount;
    param.summonStar5Count = dataObj.summonStar5Count;
    param.summonMode = dataObj.summonMode;
    param.summonColors = [];
    for (let index in dataObj.summonColors) {
        switch (dataObj.summonColors[index]) {
            case "red":
                param.summonColors.push(Color.Red);
                break;
            case "blue":
                param.summonColors.push(Color.Blue);
                break;
            case "green":
                param.summonColors.push(Color.Green);
                break;
            case "colorless":
                param.summonColors.push(Color.Colorless);
                break;
            default:
                break;
        }
    }
    param.colorPriorities = getSummonColorPriorities();

    param.averageSampleCount = Number(dataObj.averageSampleCount);
    param.targetPickupCount = Number(dataObj.targetPickupCount);
    param.graphSampleCount = Number(dataObj.graphSampleCount);
    param.samplingOffset = Number(dataObj.samplingOffset);
    param.showMaxDeviationGraph = dataObj.showMaxDeviationGraph;

    if (dataObj.stopsSamplingIfGraphIsConsistent) {
        param.increaseRateThresholdToStopSample = 0.005;
    }
    else {
        param.increaseRateThresholdToStopSample = 0.0;
    }
    param.graphWidth = dataObj.graphWidth;
    param.graphHeight = dataObj.graphHeight;
    param.startTryCount = dataObj.startTryCount;
    param.randAlgorithm = dataObj.randAlgorithm;
    param.targetPickupIndex = dataObj.targetPickupIndex;
    param.summonCountThresholdToCount = dataObj.summonCountThresholdToCount;
    param.isPickupChargeEnabled = dataObj.isPickupChargeEnabled
    return param;
}

let vm = new Vue({
    el: "#app",
    data: dataObj,
    methods: {
        colorPrioritySorted: function (event) {
            let slotOrder = 0;
            for (let elem of event.to.childNodes) {
                let colorName = lem.classList[0];
                console.log(colorName);
            }
        },
        graphWidthChanged: function () {
            // const widthStyle = `width:${dataObj.graphWidth};`;
            // dataObj.graphStyle = widthStyle + extraGraphStyle;
            // dataObj.graphCanvasStyle = widthStyle + extraGraphStyle;
            this.enabledGraphChanged();
        },
        summon: function (event) {
            let param = createSummonParam();
            switch (dataObj.mode) {
                case SimMode.Normal:
                    {
                        g_sim.enableLog();
                        if (dataObj.isWebWorkerEnabled && window.Worker) {
                            const summonWorker = new Worker('/FehSummonSimulator/SummonWorker.js');
                            summonWorker.onmessage = (e) => {
                                const results = e.data;
                                const result = results[0];
                                console.log('Message received from worker');
                                dataObj.summonOutput = createSummonResultHtml(g_sim, result, g_pickupIcons);
                                dataObj.summonLog = g_sim.log;

                                summonWorker.terminate();
                            }

                            summonWorker.postMessage([g_sim, param, 1]);
                        }
                        else {
                            const result = g_sim.summon(param);
                            dataObj.summonOutput = createSummonResultHtml(g_sim, result, g_pickupIcons);
                            dataObj.summonLog = g_sim.log;
                        }
                    }
                    break;
                case SimMode.Average:
                    {
                        // 平均モード
                        if (dataObj.useWasm) {
                            let result;
                            using(new ScopedStopwatch(() => { }, time => console.log(time)), () => {
                                result = g_sim.summonAverage(param);
                            });
                            // console.log(result);
                            dataObj.summonOutput = createSummonAverageResultHtml(g_sim, result, param, g_pickupIcons);
                            dataObj.summonLog = "平均計算時は詳細結果は表示されません。";
                        }
                        else {
                            if (dataObj.isWebWorkerEnabled && window.Worker) {
                                const startTime = Date.now();
                                const workerCount = dataObj.webWorkerCount;
                                const results = [];
                                const workers = [];
                                for (let workerIndex = 0; workerIndex < workerCount; workerIndex++) {
                                    const worker = new Worker('/FehSummonSimulator/SummonWorker.js');
                                    workers.push(worker);
                                    worker.onmessage = (e) => {
                                        const workerResult = e.data;
                                        results.push(workerResult);

                                        {
                                            const endTime = Date.now();
                                            let diff = endTime - startTime;
                                            console.log(diff + " ms");

                                            const progressLog = `received message from worker ${workerIndex}(${workerResult.length} samples): ${diff} ms`;
                                            console.log(progressLog);
                                            dataObj.progressLog = progressLog;
                                        }

                                        // 全てのスレッドの処理が完了したら結果を結合して表示
                                        if (results.length === workerCount) {
                                            let summonHistory = [];
                                            for (let i = 0; i < workerCount; ++i) {
                                                summonHistory = summonHistory.concat(results[i]);
                                            }
                                            let result = g_sim.__createSummonAverateResult(param, summonHistory);

                                            const endTime = Date.now();
                                            let diff = endTime - startTime;
                                            console.log(diff + " ms");

                                            dataObj.summonOutput = createSummonAverageResultHtml(g_sim, result, param, g_pickupIcons);
                                            dataObj.summonLog = "平均計算時は詳細結果は表示されません。";
                                            dataObj.progressLog = "";
                                            for (let w of workers) {
                                                w.terminate();
                                            }
                                        }
                                    }
                                }

                                const sampleCountPerWorker = param.averageSampleCount / workerCount;
                                for (let workerIndex = 0; workerIndex < workerCount; workerIndex++) {
                                    const worker = workers[workerIndex];
                                    let samples = sampleCountPerWorker;
                                    if (workerIndex == 0) {
                                        const restSampleCount = param.averageSampleCount % workerCount;
                                        samples += restSampleCount;
                                    }
                                    worker.postMessage([g_sim, param, samples]);
                                }
                            } else {
                                g_sim.summonAverageProgressive(
                                    param,
                                    log => {
                                        console.log(log);
                                        dataObj.progressLog = log;
                                    },
                                    result => {
                                        dataObj.summonOutput = createSummonAverageResultHtml(g_sim, result, param, g_pickupIcons);
                                        dataObj.summonLog = "平均計算時は詳細結果は表示されません。";
                                    });
                            }
                        }
                    }
                    break;
                case SimMode.Graph:
                    {
                        let param = createSummonParam();
                        let enabledList = [];
                        for (let elem of this.graphEnabledValues) {
                            enabledList.push(elem.value);
                        }
                        g_sim.showSummonRateLineChart("graphCanvas", param, enabledList, log => {
                            dataObj.progressLog = log;
                        });
                        dataObj.isGraphCreated = true;
                    }
                    break;
                case SimMode.CoeffOfVariationGraph:
                    {
                        let param = createSummonParam();
                        g_sim.showCoeffOfVariationLineChart("graphCanvas", param, log => {
                            dataObj.progressLog = log;
                        });
                        dataObj.isGraphCreated = true;
                        enabledGraphChanged();
                    }
                    break;
                case SimMode.ColorPatternProbability:
                    {
                        g_sim.calcColorPatternProbability(
                            param,
                            g_pickupIcons,
                            log => {
                                console.log(log);
                                dataObj.progressLog = log;
                            },
                            result => {
                                dataObj.summonOutput = result;
                                dataObj.summonLog = "通常モード以外は詳細結果は表示されません。";
                            });
                    }
                    break;
            }
            g_sim.clearLog();
        },
        enabledGraphChanged: function (event) {
            let enabledList = [];
            for (let elem of this.graphEnabledValues) {
                enabledList.push(elem.value);
            }
            g_sim.redrawGraph("graphCanvas", enabledList, this.graphWidth, this.graphHeight);
        },
    }
});



function getOrbImgSrcUrl(item) {
    return "/images/feh/feh_orb_" + item + ".png";
}

function calcCurrentStar5PickupRate() {
    let rates = calcCurrentRate(g_sim, dataObj.startTryCount);
    dataObj.startStar5PickupRate = round(rates.pickupRate * 100);
}

function specialStar4Changed() {
    if (dataObj.isSpecialStar4Enabled) {
        g_sim.enableStar4SpecialRate();
    }
    else {
        g_sim.disableStar4SpecialRate();
    }
}

function getSummonColorPriorities() {
    let result = [];
    for (let color of dataObj.colorPrirorities) {
        switch (color) {
            case "red":
                result.push(Color.Red);
                break;
            case "blue":
                result.push(Color.Blue);
                break;
            case "green":
                result.push(Color.Green);
                break;
            case "colorless":
                result.push(Color.Colorless);
                break;
            default:
                break;
        }
    }
    return result;
}

function initSummonSimulatorAppData(sim, pickupIcons, pickupHeroNames) {
    g_sim = sim;
    g_pickupIcons = pickupIcons;
    dataObj.pickupHeroNames = pickupHeroNames;
    calcCurrentStar5PickupRate();
}
