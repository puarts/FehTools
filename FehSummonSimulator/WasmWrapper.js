
let wasmModule;
let SummonAverage;

fetch('/FehTools/FehSummonSimulator/WasmInterface.wasm')
    .then(response => response.arrayBuffer())
    .then(buffer => new Uint8Array(buffer))
    .then(binary => {
        let promise = Module({
            wasmBinary: binary,
            onRuntimeInitialized: () => {
                promise.then(result => {
                    wasmModule = result;
                    SummonAverage = wasmModule.cwrap(
                        'SummonAverage',
                        'number',
                        [
                            'number',
                            'number',
                            'number',
                            'number',
                            'number',
                            'number',
                            'number',
                            'number', 'number', 'number',
                            'number', 'number',
                            'number', 'number', 'number',
                            'number', 'number', 'number',
                            'number', 'number', 'number',
                            'number'
                        ]
                    );
                });
            }
        });
    });

function pointerToSummonAverageResult(
    pointer, averageSampleCount,
    star5PickupIds,
    star4PickupIds
) {
    // for (let i = 0; i < 13; ++i) {
    //     console.log(`wasmModule.HEAPF32[${pointer / 4 + i}] = ${wasmModule.HEAPF32[pointer / 4 + i]}`);
    // }

    let result = {};
    result.averageSummonCount = wasmModule.HEAPF32[pointer / 4];
    result.averageLostOrbCount = wasmModule.HEAPF32[pointer / 4 + 1];
    result.averageStar5PickupCount = wasmModule.HEAPF32[pointer / 4 + 2];
    result.averageStar5Count = wasmModule.HEAPF32[pointer / 4 + 3];
    result.averageStar5AndStar5PickupCount = wasmModule.HEAPF32[pointer / 4 + 4];
    result.averageStar4PickupCount = wasmModule.HEAPF32[pointer / 4 + 5];
    result.averageStar4Count = wasmModule.HEAPF32[pointer / 4 + 6];
    result.averageStar3Count = wasmModule.HEAPF32[pointer / 4 + 7];

    result.star3CountStdDev = wasmModule.HEAPF32[pointer / 4 + 8];
    result.star4CountStdDev = wasmModule.HEAPF32[pointer / 4 + 9];
    result.star5CountStdDev = wasmModule.HEAPF32[pointer / 4 + 10];
    result.star5AndPickupCountStdDev = wasmModule.HEAPF32[pointer / 4 + 11];
    result.star4PickupCountStdDev = wasmModule.HEAPF32[pointer / 4 + 12];
    result.star5PickupCountStdDev = wasmModule.HEAPF32[pointer / 4 + 13];


    result.star4PickupWorstCount = wasmModule.HEAP32[pointer / 4 + 14];
    result.star4PickupBestCount = wasmModule.HEAP32[pointer / 4 + 15];
    result.star5PickupWorstCount = wasmModule.HEAP32[pointer / 4 + 16];
    result.star5PickupBestCount = wasmModule.HEAP32[pointer / 4 + 17];
    result.star5WorstCount = wasmModule.HEAP32[pointer / 4 + 18];
    result.star5BestCount = wasmModule.HEAP32[pointer / 4 + 19];
    result.star5AndStar5PickupWorstCount = wasmModule.HEAP32[pointer / 4 + 20];
    result.star5AndStar5PickupBestCount = wasmModule.HEAP32[pointer / 4 + 21];

    let sizeOfIdAndCount = 2;

    let offset = 22;
    {
        let star5PickupIdAndCountsPtr = wasmModule.HEAP32[pointer / 4 + offset];
        ++offset;
        let star5PickupIdAndCountsLength = wasmModule.HEAP32[pointer / 4 + offset];
        ++offset;
        result.star5PickupIdAndCounts = {};
        for (let i = 0; i < star5PickupIdAndCountsLength; ++i) {
            let id = wasmModule.HEAP32[star5PickupIdAndCountsPtr / 4 + i * sizeOfIdAndCount];
            let count = wasmModule.HEAPF32[star5PickupIdAndCountsPtr / 4 + i * sizeOfIdAndCount + 1];
            result.star5PickupIdAndCounts[id] = count;
        }
    }

    {
        let star5IdAndCountsPtr = wasmModule.HEAP32[pointer / 4 + offset];
        ++offset;
        let star5IdAndCountsLength = wasmModule.HEAP32[pointer / 4 + offset];
        ++offset;
        result.star5IdAndCounts = {};
        for (let i = 0; i < star5IdAndCountsLength; ++i) {
            let id = wasmModule.HEAP32[star5IdAndCountsPtr / 4 + i * sizeOfIdAndCount];
            let count = wasmModule.HEAPF32[star5IdAndCountsPtr / 4 + i * sizeOfIdAndCount + 1];
            result.star5IdAndCounts[id] = count;
        }
    }

    {
        let star4PickupIdAndCountsPtr = wasmModule.HEAP32[pointer / 4 + offset];
        ++offset;
        let star4PickupIdAndCountsLength = wasmModule.HEAP32[pointer / 4 + offset];
        ++offset;
        result.star4PickupIdAndCounts = {};
        for (let i = 0; i < star4PickupIdAndCountsLength; ++i) {
            let id = wasmModule.HEAP32[star4PickupIdAndCountsPtr / 4 + i * sizeOfIdAndCount];
            let count = wasmModule.HEAPF32[star4PickupIdAndCountsPtr / 4 + i * sizeOfIdAndCount + 1];
            result.star4PickupIdAndCounts[id] = count;
        }
    }

    result.couldGetStar4PickupHeroCount = wasmModule.HEAP32[pointer / 4 + offset];
    ++offset;
    result.couldGetStar4AndStar5PickupHeroCount = wasmModule.HEAP32[pointer / 4 + offset];
    ++offset;
    result.couldGetStar5HeroCount = wasmModule.HEAP32[pointer / 4 + offset];
    ++offset;
    result.couldGetStar5PickupHeroCount = wasmModule.HEAP32[pointer / 4 + offset];
    ++offset;

    {
        let arrayPtr = wasmModule.HEAP32[pointer / 4 + offset];
        ++offset;
        let arrayLength = wasmModule.HEAP32[pointer / 4 + offset];
        ++offset;

        result.couldGetPickupHeroCount = {};
        for (let i = 0; i < arrayLength; ++i) {
            let id = wasmModule.HEAP32[arrayPtr / 4 + i * sizeOfIdAndCount];
            let count = wasmModule.HEAPF32[arrayPtr / 4 + i * sizeOfIdAndCount + 1];
            let index = star5PickupIds.indexOf(Number(id));
            result.couldGetPickupHeroCount[index] = count;
        }
    }

    result.lostOrbCountStdDev = wasmModule.HEAPF32[pointer / 4 + offset];
    ++offset;
    result.lostOrbCountMin = wasmModule.HEAP32[pointer / 4 + offset];
    ++offset;
    result.lostOrbCountMax = wasmModule.HEAP32[pointer / 4 + offset];
    ++offset;

    {
        let ptr = wasmModule.HEAP32[pointer / 4 + offset];
        ++offset;
        let length = wasmModule.HEAP32[pointer / 4 + offset];
        ++offset;
        result.pickupCountStdDevs = {};
        for (let i = 0; i < length; ++i) {
            let id = wasmModule.HEAP32[ptr / 4 + i * sizeOfIdAndCount];
            let value = wasmModule.HEAPF32[ptr / 4 + i * sizeOfIdAndCount + 1];
            result.pickupCountStdDevs[id] = value;
        }
    }


    // 互換用
    {
        result.pickupCountStdDev = result.star5PickupCountStdDev;
        result.pickupWorstCount = result.star5PickupWorstCount;
        result.pickupBestCount = result.star5PickupBestCount;

        result.totalSummonCount = result.averageSummonCount * averageSampleCount;
        result.lostOrbCount = result.averageLostOrbCount * averageSampleCount;

        result.pickupCount = result.averageStar5PickupCount * averageSampleCount;
        result.star5Count = result.averageStar5Count * averageSampleCount;
        result.star4Count = result.averageStar4Count * averageSampleCount;
        result.star4PickupCount = result.averageStar4PickupCount * averageSampleCount;
        result.star3Count = result.averageStar3Count * averageSampleCount;

        result.pickupHeroes = {};
        for (let key in result.star5PickupIdAndCounts) {
            let index = star5PickupIds.indexOf(Number(key));
            result.pickupHeroes[index] = result.star5PickupIdAndCounts[key] * averageSampleCount;
        }

        result.star4PickupHeroes = {};
        for (let key in result.star4PickupIdAndCounts) {
            let index = star5PickupIds.indexOf(Number(key)); // js側と実装を合わせるために敢えてstar4PickupIdsを使っていない
            result.star4PickupHeroes[index] = result.star4PickupIdAndCounts[key] * averageSampleCount;
        }

        // result.couldGetPickupHeroCount = couldGetPickupHeroCount;
        // result.couldGetStar4PickupHeroCount = couldGetStar4PickupHeroCount;
        // result.couldGetStar4AndStar5PickupHeroCount = couldGetStar4AndStar5PickupHeroCount;
        // result.couldGetPickupHeroCount = couldGetPickupHeroCount;
        // result.couldGetStar5HeroCount = couldGetStar5HeroCount;
        // result.couldGetStar5PickupHeroCount = couldGetStar5PickupHeroCount;
    }

    return result;
}

function deleteSummonAverageResult(buffer) {
    if (buffer == null) {
        return;
    }

    var funcPointer = wasmModule.cwrap('deleteSummonAverageResultPointer', null, ['number']);
    funcPointer(buffer);
}

function allocFloatArray(floatArray) {
    if (floatArray.length == 0) {
        return null;
    }
    var pointer = wasmModule._malloc(floatArray.length * 4);
    var offset = pointer / 4;
    wasmModule.HEAPF32.set(floatArray, offset);
    return pointer;
}

function allocIntArray(int32Array) {
    if (int32Array.length == 0) {
        return null;
    }
    var pointer = wasmModule._malloc(int32Array.length * 4);
    var offset = pointer / 4;
    wasmModule.HEAP32.set(int32Array, offset);
    return pointer;
}
function freeBuffer(buffer) {
    if (buffer == null) {
        return;
    }

    var freePointer = wasmModule.cwrap('freePointer', null, ['number']);
    freePointer(buffer);
}

function summonAverageWithArgByWasm(
    param,
    in_initRates,
    in_star3Counts,
    in_star4Counts,
    in_star5PickupIds, in_star5PickupColors,
    in_star5Ids, in_star5Colors,
    in_star4PickupIds, in_star4PickupColors,
    nonPickupDecrementCount
) {
    let orbCountOrSummonCount = 0;
    switch (param.summonMode) {
        case SummonMode.OrbCount:
            orbCountOrSummonCount = param.ownOrbCount;
            break;
        case SummonMode.SummonCount:
            orbCountOrSummonCount = param.summonCount;
            break;
        case SummonMode.UntilSummonStar5:
            orbCountOrSummonCount = param.summonStar5Count;
            break;
    }
    return summonAverageByWasm(
        param.randAlgorithm,
        param.summonMode,
        orbCountOrSummonCount,
        param.averageSampleCount,
        param.targetPickupCount,
        param.startTryCount,
        param.colorPriorities,
        in_initRates,
        param.summonColors,
        in_star3Counts,
        in_star4Counts,
        in_star5PickupIds, in_star5PickupColors,
        in_star5Ids, in_star5Colors,
        in_star4PickupIds, in_star4PickupColors,
        nonPickupDecrementCount
    );
}

function summonAverageByWasm(
    randAlgorithm,
    summonMode,
    orbCountOrSummonCount,
    averageSampleCount,
    targetPickCount,
    startTryCount,
    in_summonColorPriority,
    in_initRates,
    in_pickColors,
    in_star3Counts,
    in_star4Counts,
    in_star5PickupIds, in_star5PickupColors,
    in_star5Ids, in_star5Colors,
    in_star4PickupIds, in_star4PickupColors,
    nonPickupDecrementCount
) {
    let initRates = allocFloatArray(in_initRates);
    let star3Counts = allocIntArray(in_star3Counts);
    let star4Counts = allocIntArray(in_star4Counts);
    let pickColors = allocIntArray(in_pickColors);
    let star5PickupIds = allocIntArray(in_star5PickupIds);
    let star5PickupColors = allocIntArray(in_star5PickupColors);
    let star5Ids = allocIntArray(in_star5Ids);
    let star5Colors = allocIntArray(in_star5Colors);
    let summonColorPriority = allocIntArray(in_summonColorPriority);
    let star4PickupIds = allocIntArray(in_star4PickupIds);
    let star4PickupColors = allocIntArray(in_star4PickupColors);
    resultPointer = SummonAverage(
        randAlgorithm,
        summonMode,
        orbCountOrSummonCount,
        averageSampleCount,
        targetPickCount,
        startTryCount,
        initRates,
        summonColorPriority,
        star3Counts,
        star4Counts,
        pickColors, in_pickColors.length,
        star5PickupIds, star5PickupColors, in_star5PickupIds.length,
        star5Ids, star5Colors, in_star5Ids.length,
        star4PickupIds, star4PickupColors, in_star4PickupIds.length,
        nonPickupDecrementCount
    );
    let summonAverageResult = pointerToSummonAverageResult(
        resultPointer, averageSampleCount,
        in_star5PickupIds,
        in_star4PickupIds
    );
    // console.log(summonAverageResult);
    freeBuffer(initRates);
    freeBuffer(star3Counts);
    freeBuffer(star4Counts);
    freeBuffer(pickColors);
    freeBuffer(star5PickupIds);
    freeBuffer(star5PickupColors);
    freeBuffer(star5Ids);
    freeBuffer(star5Colors);
    freeBuffer(star4PickupIds);
    freeBuffer(star4PickupColors);
    freeBuffer(summonColorPriority);
    deleteSummonAverageResult(resultPointer);
    return summonAverageResult;
}

