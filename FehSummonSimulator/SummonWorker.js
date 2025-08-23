importScripts('/FehSummonSimulator/SummonFuncs.js');

onmessage = function (e) {
    /** @type {FehSummonSimulator} */
    const sim = e.data[0];
    const param = e.data[1];
    const sampleCount = e.data[2];

    // SummonResult.history は1回引くとき以外はGUIに出さないので
    // 通信負荷を減らすために消す
    const isHistoryEnabled = sampleCount == 1;

    const summonHistory = [];
    for (let i = 0; i < sampleCount; ++i) {
        const result = summon(sim, param);
        if (!isHistoryEnabled) {
            result.history = null;
        }
        summonHistory.push(result);
    }
    postMessage(summonHistory);
}
