#pragma once

#include "FehSummonSimulatorLibrary.h"

#include <vector>

enum class RandomAlgorithm
{
    LinearCongruentialGenerators = 0,
    MersenneTwister = 1,
    Xorshift = 2,
    Xoroshiro128aa = 3,
};

enum class Color
{
    Red = 0,
    Green = 1,
    Blue = 2,
    Colorless = 3
};

enum class GachaResultKind
{
    Star3 = 0,
    Star4 = 1,
    Star5 = 2,
    Star5Pickup = 3,
    Star4Pickup = 4
};

enum class IndividualValueType
{
    Hp = 0,
    Attack = 1,
    Speed = 2,
    Defence = 3,
    Resist = 4,
    None = 5,
};

enum class SummonMode
{
    OrbCount = 0,
    SummonCount = 1,
    SummonStar5Count = 2,
};

struct SummonRate
{
    float star5PickupRate;
    float star5Rate;
    float star4PickupRate;
    float star4Rate;
    float star3Rate;
};

struct HeroInfo
{
    int id;
    Color color;
};

struct SummonUnit
{
    GachaResultKind rarity;
    HeroInfo heroInfo;
    Color color;
    IndividualValueType strength;
    IndividualValueType weekness;
};

struct SummonArgument
{
    int ownOrbCount;
    std::vector<Color> summonColors;
    std::vector<Color> summonColorPriority;
    SummonMode summonMode;
    int summonCount;
    int summonStar5Count;
    int startTryCount;
    RandomAlgorithm randAlgorithm;
};

struct SummonResult
{
    int totalSummonCount = 0;
    int lostOrbCount = 0;
    int star3Count = 0;
    int star4Count = 0;
    int star4PickupCount = 0;
    int star5Count = 0;
    int star5PickupCount = 0;
    std::vector<SummonUnit> summonedUnits;
};

void deleteSummonResult(SummonResult* result)
{
    delete result;
}

struct IdAndCount
{
    int id;
    float count;
};

struct SummonAverageResult
{
    float averageSummonCount;
    float averageLostOrbCount;
    float averageStar5PickupCount;
    float averageStar5Count;
    float averageStar5AndStar5PickupCount;
    float averageStar4PickupCount;
    float averageStar4Count;
    float averageStar3Count;

    float star3CountStdDev;
    float star4CountStdDev;
    float star5CountStdDev;
    float star5AndPickupCountStdDev;
    float star4PickupCountStdDev;
    float star5PickupCountStdDev;

    int star4PickupWorstCount;
    int star4PickupBestCount;
    int star5PickupWorstCount;
    int star5PickupBestCount;
    int star5WorstCount;
    int star5BestCount;
    int star5AndStar5PickupWorstCount;
    int star5AndStar5PickupBestCount;

    IdAndCount* star5PickupIdAndCounts;
    int star5PickupIdAndCountLength;
    IdAndCount* star5IdAndCounts;
    int star5IdAndCountLength;
    IdAndCount* star4PickupIdAndCounts;
    int star4PickupIdAndCountLength;

    int couldGetStar4PickupHeroCount;
    int couldGetStar4AndStar5PickupHeroCount;
    int couldGetStar5HeroCount;
    int couldGetStar5PickupHeroCount;

    IdAndCount* couldGetStar5PickupHeroCountPerId;
    int couldGetStar5PickupHeroCountPerIdLength;
    IdAndCount* couldGetStar4PickupHeroCountPerId;
    int couldGetStar4PickupHeroCountPerIdLength;

    float lostOrbCountStdDev;
    int lostOrbCountMin;
    int lostOrbCountMax;

    IdAndCount* star5PickupCountStdDevsPerId;
    int star5PickupCountStdDevsPerIdLength;
};

SummonAverageResult *newSummonAverageResult()
{
    auto *result = new SummonAverageResult();
    result->star5PickupIdAndCounts = nullptr;
    result->star5IdAndCounts = nullptr;
    result->star4PickupIdAndCounts = nullptr;
    return result;
}

void deleteSummonAverageResult(SummonAverageResult *result)
{
    delete[] result->star5PickupIdAndCounts;
    delete[] result->star5IdAndCounts;
    delete[] result->star4PickupIdAndCounts;
    delete[] result->couldGetStar5PickupHeroCountPerId;
    delete[] result->couldGetStar4PickupHeroCountPerId;
    delete result;
}

class FEHSUMMONSIMULATORLIBRARY_API FehSummonSimulator
{
public:
    FehSummonSimulator(
        const SummonRate &initRate,
        const int *star3ColorCounts,
        const int *star4ColorCounts,
        const std::vector<HeroInfo> &star5PickupHeroInfos,
        const std::vector<HeroInfo> &star5HeroInfos,
        const std::vector<HeroInfo> &star4PickupHeroInfos,
        int nonPickupDecrementCount);
    ~FehSummonSimulator();

    SummonResult *Summon(const SummonArgument &arg);

    SummonAverageResult *SummonAverage(
        const SummonArgument &arg,
        int averageSampleCount,
        int targetPickupCount);

    SummonRate CalcCurrentRate(
        int currentTryCount,
        const SummonRate &initRate);

    SummonUnit PickOrb(
        RandomAlgorithm randAlgorithm,
        int currentTryCount,
        const SummonRate &initRate,
        const int *star3ColorCounts,
        const int *star4ColorCounts,
        const std::vector<HeroInfo> &star5PickupHeroInfos,
        const std::vector<HeroInfo> &star5HeroInfos,
        const std::vector<HeroInfo> &star4PickupHeroInfos);

private:
    bool SummonAverageParallel(
        std::vector<SummonResult*>* pSummonHistory, const SummonArgument& arg, int averageSampleCount);
    static void* ThreadFunc(void* param);

    class Impl;
    Impl *m_pImpl;
};
