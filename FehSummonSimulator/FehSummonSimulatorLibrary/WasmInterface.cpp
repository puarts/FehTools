#include <emscripten.h>

#define FEHSUMMONSIMULATORLIBRARY_EMPTY
#include "FehSummonSimulator.cpp"

extern "C"
{
    EMSCRIPTEN_KEEPALIVE void deleteSummonAverageResultPointer(SummonAverageResult *result)
    {
        deleteSummonAverageResult(result);
    }

    EMSCRIPTEN_KEEPALIVE void freePointer(uint8_t *p)
    {
        free(p);
    }

    void PrintIntArray(int *array, int size, const char *label)
    {
        printf("%s = {", label);
        for (int i = 0; i < size; ++i)
        {
            printf("%d, ", array[i]);
        }
        printf("}\n");
    }
    void PrintFloatArray(float *array, int size, const char *label)
    {
        printf("%s = {", label);
        for (int i = 0; i < size; ++i)
        {
            printf("%f, ", array[i]);
        }
        printf("}\n");
    }

    EMSCRIPTEN_KEEPALIVE SummonAverageResult *SummonAverage(
        int randAlgorithm,
        int summonMode,
        int ownOrbCountOrSummonCount,
        int averageSampleCount,
        int targetPickupCount,
        int startTryCount,
        float *initRates,
        int *summonColorPriority,
        int *star3Counts, int *star4Counts,
        int *pickColors, int pickColorCount,
        int *star5PickupIds, int *star5PickupColors, int star5PickupCount,
        int *star5Ids, int *star5Colors, int star5Count,
        int *star4PickupIds, int *star4PickupColors, int star4PickupCount,
        int nonPickupDecrementCount)
    {
        printf("randAlgorithm=%d\n", randAlgorithm);
        printf("summonMode=%d\n", summonMode);
        printf("ownOrbCountOrSummonCount=%d\n", ownOrbCountOrSummonCount);
        printf("averageSampleCount=%d\n", averageSampleCount);
        printf("targetPickupCount=%d\n", targetPickupCount);
        printf("startTryCount=%d\n", startTryCount);
        printf("nonPickupDecrementCount=%d\n", nonPickupDecrementCount);
        PrintFloatArray(initRates, 4, "initRates");
        PrintIntArray(summonColorPriority, 4, "summonColorPriority");
        PrintIntArray(star3Counts, 4, "star3Counts");
        PrintIntArray(star4Counts, 4, "star4Counts");
        PrintIntArray(pickColors, pickColorCount, "pickColors");
        PrintIntArray(star4PickupIds, star4PickupCount, "star4PickupIds");
        PrintIntArray(star4PickupColors, star4PickupCount, "star4PickupColors");
        PrintIntArray(star5PickupIds, star5PickupCount, "star5PickupIds");
        PrintIntArray(star5PickupColors, star5PickupCount, "star5PickupColors");
        PrintIntArray(star5Ids, star5Count, "star5Ids");
        PrintIntArray(star5Colors, star5Count, "star5Colors");
        SummonRate initRate;
        initRate.star5PickupRate = initRates[0];
        initRate.star5Rate = initRates[1];
        initRate.star4PickupRate = initRates[2];
        initRate.star4Rate = initRates[3];

        std::vector<HeroInfo> star5HeroInfos;
        for (int i = 0; i < star5Count; ++i)
        {
            star5HeroInfos.push_back({star5Ids[i], (Color)star5Colors[i]});
        }

        std::vector<HeroInfo> star5PickupHeroInfos;
        for (int i = 0; i < star5PickupCount; ++i)
        {
            star5PickupHeroInfos.push_back({star5PickupIds[i], (Color)star5PickupColors[i]});
        }

        std::vector<HeroInfo> star4PickupHeroInfos;
        for (int i = 0; i < star4PickupCount; ++i)
        {
            star4PickupHeroInfos.push_back({star4PickupIds[i], (Color)star4PickupColors[i]});
        }

        FehSummonSimulator sim(
            initRate,
            star3Counts,
            star4Counts,
            star5PickupHeroInfos,
            star5HeroInfos,
            star4PickupHeroInfos,
            nonPickupDecrementCount);

        SummonArgument arg;
        arg.randAlgorithm = (RandomAlgorithm)randAlgorithm;
        arg.summonMode = (SummonMode)summonMode;
        arg.summonCount = ownOrbCountOrSummonCount;
        arg.ownOrbCount = ownOrbCountOrSummonCount;
        arg.summonStar5Count = ownOrbCountOrSummonCount;
        arg.startTryCount = startTryCount;
        for (int i = 0; i < pickColorCount; ++i)
        {
            arg.summonColors.push_back((Color)pickColors[i]);
        }
        for (int i = 0; i < 4; ++i)
        {
            arg.summonColorPriority.push_back((Color)summonColorPriority[i]);
        }

        // SummonRate initRate;
        // initRate.star5Rate = 0.03f;
        // initRate.star5PickupRate = 0.03f;
        // initRate.star4PickupRate = 0.03f;
        // initRate.star4Rate = 0.55f;

        // const int star5HeroIds[] = {191, 192, 194, 203, 204, 208, 210, 219, 220, 221, 224, 225, 233, 234, 235, 239, 241, 246, 247, 254, 256, 269, 270, 271, 278, 279, 280, 281, 284, 285, 289, 290, 291, 293, 294, 295, 303, 304, 305, 308, 309, 310, 311, 313, 314, 328, 329, 331, 344, 345, 346, 347, 350, 351, 353, 361, 362, 364, 372, 373, 374, 375, 383, 384, 385, 386, 399, 400, 401, 402, 403, 408, 409, 411, 413, 414, 415, 416, 424, 425, 427, 436, 438, 439, 444, 445, 446, 449, 450, 452, 456, 457, 458, 473, 474, 475, 476, 478, 479, 480, 481, 489, 490, 491, 492, 495, 496, 497, 498, 506, 507, 508, 509, 517, 518, 519, 520};
        // const int star5HeroColors[] = {2, 1, 0, 0, 1, 2, 0, 1, 2, 0, 0, 1, 2, 0, 0, 2, 3, 1, 0, 0, 2, 1, 0, 3, 2, 1, 0, 3, 1, 2, 1, 3, 0, 0, 2, 0, 0, 1, 3, 0, 1, 2, 3, 1, 2, 0, 3, 1, 0, 3, 2, 1, 2, 2, 0, 2, 0, 3, 0, 1, 3, 3, 2, 1, 3, 0, 2, 1, 3, 0, 0, 2, 0, 1, 3, 1, 2, 0, 0, 1, 2, 1, 3, 0, 2, 0, 1, 3, 1, 0, 0, 0, 2, 0, 1, 2, 0, 3, 2, 0, 1, 1, 2, 1, 3, 0, 1, 2, 3, 2, 1, 0, 3, 1, 2, 0, 0};
        // const int star5HeroCount = (int)(sizeof(star5HeroIds) / sizeof(int));

        // std::vector<HeroInfo> star5HeroInfos;
        // for (int i = 0; i < star5HeroCount; ++i)
        // {
        //     int id = star5HeroIds[i];
        //     Color color = (Color)star5HeroColors[i];
        //     star5HeroInfos.push_back({id, color});
        // }

        // const int star5PickupHeroIds[] = {535, 536, 534, 537};
        // const int star5PickupHeroColors[] = {0, 1, 2, 3};
        // const int star5PickupHeroCount = (int)(sizeof(star5PickupHeroIds) / sizeof(int));

        // std::vector<HeroInfo> star5PickupHeroInfos;
        // for (int i = 0; i < star5PickupHeroCount; ++i)
        // {
        //     int id = star5PickupHeroIds[i];
        //     Color color = (Color)star5PickupHeroColors[i];
        //     star5PickupHeroInfos.push_back({id, color});
        // }

        // const int star4PickupHeroIds[] = {536};
        // std::vector<HeroInfo> star4PickupHeroInfos;
        // star4PickupHeroInfos.push_back({536, (Color)1});

        // const int star3ColorCounts[] = {33, 33, 24, 35};
        // const int star4ColorCounts[] = {33, 34, 24, 36};
        // FehSummonSimulator sim(
        //     initRate,
        //     star3ColorCounts,
        //     star4ColorCounts,
        //     star5PickupHeroInfos,
        //     star5HeroInfos,
        //     star4PickupHeroInfos);

        // SummonArgument arg;
        // arg.ownOrbCount = 140;
        // arg.startTryCount = 0;
        // arg.summonColors.push_back(Color::Red);
        // arg.summonColors.push_back(Color::Blue);
        // arg.summonColors.push_back(Color::Green);
        // arg.summonColors.push_back(Color::Colorless);
        // arg.summonMode = SummonMode::OrbCount;
        // arg.summonCount = -1;
        // arg.summonColorPriority.push_back(Color::Red);
        // arg.summonColorPriority.push_back(Color::Blue);
        // arg.summonColorPriority.push_back(Color::Green);
        // arg.summonColorPriority.push_back(Color::Colorless);

        // SummonAverageResult *result = sim.SummonAverage(arg, averageSampleCount, targetPickupCount);
        // printf("averageStar3Count=%f\n", result->averageStar3Count);
        // printf("averageStar4Count=%f\n", result->averageStar4Count);
        // printf("averageStar4PickupCount=%f\n", result->averageStar4PickupCount);
        // printf("averageStar5Count=%f\n", result->averageStar5Count);
        // printf("averageStar5PickupCount=%f\n", result->averageStar5PickupCount);

        auto result = sim.SummonAverage(arg, averageSampleCount, targetPickupCount);
        printf("averageLostOrbCount = %f\n", result->averageLostOrbCount);
        printf("couldGetStar4PickupHeroCount = %d\n", result->couldGetStar4PickupHeroCount);
        printf("couldGetStar4AndStar5PickupHeroCount = %d\n", result->couldGetStar4AndStar5PickupHeroCount);
        printf("couldGetStar5HeroCount = %d\n", result->couldGetStar5HeroCount);
        printf("couldGetStar5PickupHeroCount = %d\n", result->couldGetStar5PickupHeroCount);

        for (int i = 0; i < result->couldGetStar5PickupHeroCountPerIdLength; ++i)
        {
            IdAndCount *idAndCount = &result->couldGetStar5PickupHeroCountPerId[i];
            printf("couldGetStar5PickupHeroCountPerId[%d]: %f\n", idAndCount->id, idAndCount->count);
        }
        return result;
    }
}
