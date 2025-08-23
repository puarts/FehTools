
#include "FehSummonSimulator.h"

#include <cmath>
#include <random>
#include <stdint.h>
#include <stdio.h>
#include <time.h>
#include <map>
#include <pthread.h>
#include <thread>

#ifdef __EMSCRIPTEN_PTHREADS__
#include <emscripten.h>
#endif

//#define __EMSCRIPTEN_PTHREADS__
#define THREAD_COUNT (4)

#define RANDALGORITHM_RAND (0)
#define RANDALGORITHM_MT (1)
#define RANDALGORITHM_XORSHIFT (2)

#define RANDOM_ALGORITHM (RANDALGORITHM_XORSHIFT)

namespace
{
    struct ThreadArgument
    {
        FehSummonSimulator* pSimulator = nullptr;
        const SummonArgument* pArgument = nullptr;
        int averageSampleCount = 0;
        std::vector<SummonResult*> summonHistory;
    };

    const IndividualValueType IndividualValueTable[] = {
        IndividualValueType::None,
        IndividualValueType::None,
        IndividualValueType::Hp,
        IndividualValueType::Attack,
        IndividualValueType::Hp,
        IndividualValueType::Speed,
        IndividualValueType::Hp,
        IndividualValueType::Defence,
        IndividualValueType::Hp,
        IndividualValueType::Resist,
        IndividualValueType::Attack,
        IndividualValueType::Hp,
        IndividualValueType::Attack,
        IndividualValueType::Speed,
        IndividualValueType::Attack,
        IndividualValueType::Defence,
        IndividualValueType::Attack,
        IndividualValueType::Resist,
        IndividualValueType::Speed,
        IndividualValueType::Hp,
        IndividualValueType::Speed,
        IndividualValueType::Attack,
        IndividualValueType::Speed,
        IndividualValueType::Defence,
        IndividualValueType::Speed,
        IndividualValueType::Resist,
        IndividualValueType::Defence,
        IndividualValueType::Hp,
        IndividualValueType::Defence,
        IndividualValueType::Attack,
        IndividualValueType::Defence,
        IndividualValueType::Speed,
        IndividualValueType::Defence,
        IndividualValueType::Resist,
        IndividualValueType::Resist,
        IndividualValueType::Hp,
        IndividualValueType::Resist,
        IndividualValueType::Attack,
        IndividualValueType::Resist,
        IndividualValueType::Speed,
        IndividualValueType::Resist,
        IndividualValueType::Defence,
    };
    const int IndividualValueTableSize = (int)(sizeof(IndividualValueTable) / sizeof(IndividualValueType));
    const int IndividualValuePatternCount = IndividualValueTableSize / 2;

    const float RoundRateMult = 1.0f / 10000.0f;
    inline float RoundRate(float value)
    {
        return (int)(value * 10000 + 0.5f) * RoundRateMult;
    }

    std::random_device rnd;     // 非決定的な乱数生成器でシード生成機を生成
    std::mt19937 engine(rnd()); //  メルセンヌツイスターの32ビット版、引数は初期シード

    // http://kobayashi.hub.hit-u.ac.jp/topics/rand.html
    static uint32_t xorsft_x = 123456789;
    static uint32_t xorsft_y = 362436069;
    static uint32_t xorsft_z = 521288629;
    static uint32_t xorsft_w = 88675123;

    inline void initrand(uint32_t seed)
    {
        do
        {
            seed = seed * 1812433253 + 1;
            seed ^= seed << 13;
            seed ^= seed >> 17;
            xorsft_x = 123464980 ^ seed;
            seed = seed * 1812433253 + 1;
            seed ^= seed << 13;
            seed ^= seed >> 17;
            xorsft_y = 3447902351 ^ seed;
            seed = seed * 1812433253 + 1;
            seed ^= seed << 13;
            seed ^= seed >> 17;
            xorsft_z = 2859490775 ^ seed;
            seed = seed * 1812433253 + 1;
            seed ^= seed << 13;
            seed ^= seed >> 17;
            xorsft_w = 47621719 ^ seed;
        } while (xorsft_x == 0 && xorsft_y == 0 && xorsft_z == 0 && xorsft_w == 0);
    }

    inline double urand()
    {
        uint32_t t;
        t = xorsft_x ^ (xorsft_x << 11);
        xorsft_x = xorsft_y;
        xorsft_y = xorsft_z;
        xorsft_z = xorsft_w;
        xorsft_w ^= t ^ (t >> 8) ^ (xorsft_w >> 19);
        return ((xorsft_x + 0.5) / 4294967296.0 + xorsft_w) / 4294967296.0;
    }

    inline double NormalizeRandomUintByXorshift(uint32_t t)
    {
        return (t / 4294967296.0);
    }

    inline double NormalizeRandomUintByXoroshiro128aa(uint32_t t)
    {
        return (t / 4294967296.0);
    }

    inline unsigned int GetRandomUintByXorshift()
    {
        uint32_t t;
        t = xorsft_x ^ (xorsft_x << 11);
        xorsft_x = xorsft_y;
        xorsft_y = xorsft_z;
        xorsft_z = xorsft_w;
        xorsft_w ^= t ^ (t >> 8) ^ (xorsft_w >> 19);
        return (unsigned int)((xorsft_x + 0.5) / 4294967296.0 + xorsft_w);
    }

    inline unsigned int GetRandomUintByXoroshiro128aa()
    {
        uint32_t t, r;
        t = xorsft_y << 9, r = xorsft_x * 5;
        r = (r << 7 | r >> 25) * 9;
        xorsft_z ^= xorsft_x;
        xorsft_w ^= xorsft_y;
        xorsft_y ^= xorsft_z;
        xorsft_x ^= xorsft_w;
        xorsft_z ^= t;
        xorsft_w = xorsft_w << 11 | xorsft_w >> 21;
        return (r >> 0);
    }

    inline unsigned int GetRandomUintByRand()
    {
        return (unsigned int)rand();
    }

    inline float  NormalizeRandomUintByRand(unsigned int value)
    {
        return (float)((float)value / (float)RAND_MAX);
    }

    inline unsigned int GetRandomUintByMt()
    {
        unsigned int value = engine();
        return value;
    }

    inline float NormalizeRandomUintByMt(unsigned int value)
    {
        return (float)((double)value / engine.max());
    }

    //inline float GetRandomByXorshift()
    //{
    //    return (float)urand();
    //}

    //inline float GetRandom()
    //{
    //    return GetRandomByXorshift();
    //}

    inline unsigned int GetRandomUint(RandomAlgorithm randAlgorithm)
    {
        switch (randAlgorithm)
        {
        case RandomAlgorithm::LinearCongruentialGenerators:
            return GetRandomUintByRand();
        case RandomAlgorithm::MersenneTwister:
            return GetRandomUintByMt();
        case RandomAlgorithm::Xorshift:
            return GetRandomUintByXorshift();
        case RandomAlgorithm::Xoroshiro128aa:
            return GetRandomUintByXoroshiro128aa();
        default:
            return GetRandomUintByXorshift();
        }
    }

    inline float NormalizeRandom(unsigned int rand, RandomAlgorithm randAlgorithm)
    {
        switch (randAlgorithm)
        {
        case RandomAlgorithm::LinearCongruentialGenerators:
            return NormalizeRandomUintByRand(rand);
        case RandomAlgorithm::MersenneTwister:
            return NormalizeRandomUintByMt(rand);
        case RandomAlgorithm::Xorshift:
            return (float)NormalizeRandomUintByXorshift(rand);
        case RandomAlgorithm::Xoroshiro128aa:
            return (float)NormalizeRandomUintByXoroshiro128aa(rand);
        default:
            return (float)NormalizeRandomUintByXorshift(rand);
        }
    }

    inline int SelectHeroIndex(
        float randVal,
        float beginRate,
        float rateWidth,
        int heroCount)
    {
        int length = heroCount;
        float offset = rateWidth / (float)length;
        for (int i = 0; i < length; ++i)
        {
            if (randVal < beginRate + offset * ((float)i + 1))
            {
                return i;
            }
        }
        return -1;
    }

    inline Color SelectColor2(
        uint32_t randVal,
        int totalCount,
        const int *colorCounts)
    {
        int normRandVal = randVal % totalCount;

        int threshold = colorCounts[(int)Color::Red];
        if (normRandVal < threshold)
        {
            return Color::Red;
        }
        threshold += colorCounts[(int)Color::Blue];
        if (normRandVal < threshold)
        {
            return Color::Blue;
        }
        threshold += colorCounts[(int)Color::Green];
        if (normRandVal < threshold)
        {
            return Color::Green;
        }
        else
        {
            return Color::Colorless;
        }
    }

    inline Color SelectColor(
        float randVal,
        float beginRate,
        float rateWidth,
        const int *colorCounts)
    {
        int totalCount = 0;
        for (int i = 0; i < 4; ++i)
        {
            totalCount += colorCounts[i];
        }

        float weights[4];
        for (int i = 0; i < 4; ++i)
        {
            weights[i] = colorCounts[i] / (float)totalCount;
        }

        if (randVal < beginRate + rateWidth * weights[(int)Color::Red])
        {
            return Color::Red;
        }
        else if (randVal < beginRate + rateWidth * (weights[(int)Color::Red] + weights[(int)Color::Blue]))
        {
            return Color::Blue;
        }
        else if (randVal < beginRate + rateWidth * (weights[(int)Color::Red] + weights[(int)Color::Blue] + weights[(int)Color::Green]))
        {
            return Color::Green;
        }
        else
        {
            return Color::Colorless;
        }
    }


    template<typename TValue>
    inline void IncreaseHeroCount(std::map<int, TValue>& idAndCountMap, int id, TValue amount)
    {
        if (idAndCountMap.find(id) == idAndCountMap.end())
        {
            idAndCountMap[id] = amount;
        }
        else
        {
            idAndCountMap[id] += amount;
        }
    }

    template<typename TValue>
    inline void IncreaseHeroCountOne(std::map<int, TValue>& idAndCountMap, int id)
    {
        IncreaseHeroCount<TValue>(idAndCountMap, id, 1);
    }


    SummonAverageResult *createSummonAverateResult(
        int averageSampleCount,
        int targetPickupCount,
        std::vector<SummonResult *> &summonHistory)
    {
        auto targetHeroCount = targetPickupCount;
        auto totalSummonCount = 0;
        auto lostOrbCount = 0;
        auto star5AndPickupCount = 0;
        auto star5PickupCount = 0;
        auto star5Count = 0;
        auto star4Count = 0;
        auto star4PickupCount = 0;
        auto star3Count = 0;
        //auto pickupHeroes = {};
        //auto star4PickupHeroes = {};

        float star3CountStdDev = 0;
        float star4CountStdDev = 0;
        float star5CountStdDev = 0;
        float star4PickupCountStdDev = 0;
        float pickupCountStdDev = 0;
        float star5AndPickupCountStdDev = 0;
        float lostOrbCountStdDev = 0;
        int lostOrbCountMin = 100000000;
        int lostOrbCountMax = 0;

        auto star4PickupWorstCount = 1000000;
        auto star4PickupBestCount = 0;
        auto pickupWorstCount = 1000000;
        auto pickupBestCount = 0;
        auto star5WorstCount = 1000000;
        auto star5BestCount = 0;
        auto star5AndPickupWorstCount = 1000000;
        auto star5AndPickupBestCount = 0;

        float summonHistorySizeAsFloat = (float)summonHistory.size();

        // ピックアップが引けた試行数
        std::map<int, int> couldGetStar5PickupHeroCountPerId;
        std::map<int, int> couldGetStar4PickupHeroCountPerId;
        auto couldGetStar4PickupHeroCount = 0;
        auto couldGetStar4AndStar5PickupHeroCount = 0;
        auto couldGetStar5PickupHeroCount = 0;
        auto couldGetStar5HeroCount = 0;

        std::map<int, float> star5PickupIdAndCounts;
        std::map<int, float> star4PickupIdAndCounts;
        std::map<int, float> star5IdAndCounts;

        std::map<int, float> star5PickupCountStdDevsPerId;
        std::map<int, int> star5PickupBestCountPerId;
        std::map<int, int> star5PickupWorstCountPerId;

        int summonHistoryCount = (int)summonHistory.size();
        for (int historyIndex = 0; historyIndex < summonHistoryCount; ++historyIndex)
        {
            auto &result = *summonHistory[historyIndex];
            star3Count += result.star3Count;
            star4Count += result.star4Count;
            star5Count += result.star5Count;
            lostOrbCount += result.lostOrbCount;

            if (result.lostOrbCount < lostOrbCountMin)
            {
                lostOrbCountMin = result.lostOrbCount;
            }
            if (result.lostOrbCount > lostOrbCountMax)
            {
                lostOrbCountMax = result.lostOrbCount;
            }

            star4PickupCount += result.star4PickupCount;
            star5PickupCount += result.star5PickupCount;

            std::map<int, int> star5PickupCountPerHero;
            std::map<int, int> star4PickupCountPerHero;

            for (int unitIndex = 0, end = (int)result.summonedUnits.size(); unitIndex < end; ++unitIndex)
            {
                auto *unit = &result.summonedUnits[unitIndex];
                switch (unit->rarity)
                {
                case GachaResultKind::Star3:
                    break;
                case GachaResultKind::Star4:
                    break;
                case GachaResultKind::Star5:
                    IncreaseHeroCountOne(star5IdAndCounts, unit->heroInfo.id);
                    break;
                case GachaResultKind::Star4Pickup:
                    IncreaseHeroCountOne(star4PickupIdAndCounts, unit->heroInfo.id);
                    IncreaseHeroCountOne(star4PickupCountPerHero, unit->heroInfo.id);
                    break;
                case GachaResultKind::Star5Pickup:
                    IncreaseHeroCountOne(star5PickupIdAndCounts, unit->heroInfo.id);
                    IncreaseHeroCountOne(star5PickupCountPerHero, unit->heroInfo.id);
                    break;
                }
            }

            for (const auto& iter : star5PickupCountPerHero)
            {
                int key = iter.first;
                int obtainedHeroCount = iter.second;
                if (obtainedHeroCount >= targetHeroCount) {
                    IncreaseHeroCountOne(couldGetStar5PickupHeroCountPerId, key);
                }
            }
            for (const auto& iter : star4PickupCountPerHero)
            {
                int key = iter.first;
                int obtainedHeroCount = iter.second;
                if (obtainedHeroCount >= targetHeroCount) {
                    IncreaseHeroCountOne(couldGetStar4PickupHeroCountPerId, key);
                }
            }



            auto star5AndPickupCountCurrent = result.star5Count + result.star5PickupCount;
            star5AndPickupCount += star5AndPickupCountCurrent;

            if (result.star4PickupCount < star4PickupWorstCount)
            {
                star4PickupWorstCount = result.star4PickupCount;
            }
            if (result.star4PickupCount > star4PickupBestCount)
            {
                star4PickupBestCount = result.star4PickupCount;
            }

            if (result.star5PickupCount < pickupWorstCount)
            {
                pickupWorstCount = result.star5PickupCount;
            }
            if (result.star5PickupCount > pickupBestCount)
            {
                pickupBestCount = result.star5PickupCount;
            }

            if (result.star5Count < star5WorstCount)
            {
                star5WorstCount = result.star5Count;
            }
            if (result.star5Count > star5BestCount)
            {
                star5BestCount = result.star5Count;
            }

            if (star5AndPickupCountCurrent < star5AndPickupWorstCount)
            {
                star5AndPickupWorstCount = star5AndPickupCountCurrent;
            }
            if (star5AndPickupCountCurrent > star5AndPickupBestCount)
            {
                star5AndPickupBestCount = star5AndPickupCountCurrent;
            }
        }
        float lostOrbCountAverage = lostOrbCount / summonHistorySizeAsFloat;
        float star3CountAverage = star3Count / summonHistorySizeAsFloat;
        float star4CountAverage = star4Count / summonHistorySizeAsFloat;
        float star5CountAverage = star5Count / summonHistorySizeAsFloat;
        float star4PickupCountAverage = star4PickupCount / summonHistorySizeAsFloat;
        float star5PickupCountAverage = star5PickupCount / summonHistorySizeAsFloat;
        float star5AndPickupCountAverage = star5AndPickupCount / summonHistorySizeAsFloat;

        std::map<int, float> star5PickupIdAndCountAverages;
        for (const auto& elem : star5PickupIdAndCounts)
        {
            auto id = (int)elem.first;
            auto count = (float)elem.second;
            star5PickupIdAndCountAverages[id] = count / summonHistorySizeAsFloat;
        }


        for (int historyIndex = 0; historyIndex < summonHistoryCount; ++historyIndex)
        {
            auto &result = *summonHistory[historyIndex];
            totalSummonCount += result.totalSummonCount;

            lostOrbCountStdDev += abs(result.lostOrbCount - lostOrbCountAverage);
            star3CountStdDev += abs(result.star3Count - star3CountAverage);
            star4CountStdDev += abs(result.star4Count - star4CountAverage);
            star5CountStdDev += abs(result.star5Count - star5CountAverage);
            star4PickupCountStdDev += abs(result.star4PickupCount - star4PickupCountAverage);
            pickupCountStdDev += abs(result.star5PickupCount - star5PickupCountAverage);
            star5AndPickupCountStdDev += abs(((float)result.star5Count + (float)result.star5PickupCount) - star5AndPickupCountAverage);

            std::map<int, int> star5PickupCountPerHero;
            for (int unitIndex = 0, end = (int)result.summonedUnits.size(); unitIndex < end; ++unitIndex)
            {
                auto* unit = &result.summonedUnits[unitIndex];
                if (unit->rarity != GachaResultKind::Star5Pickup)
                {
                    continue;
                }

                IncreaseHeroCountOne(star5PickupCountPerHero, unit->heroInfo.id);
            }

            for (const auto& iter : star5PickupCountPerHero)
            {
                int id = iter.first;
                float diff = abs(star5PickupCountPerHero[id] - star5PickupIdAndCountAverages[id]);
                IncreaseHeroCount(star5PickupCountStdDevsPerId, id, diff);
            }

            auto star4PickedHeroObtainedCount = 0;
            //for (auto key in result.pickupHeroes) {
            //    auto obtainedHeroCount = result.pickupHeroes[key].length;

            //    if (this._star4PickupHeroIds.includes(parseInt(key))) {
            //        // ☆4排出の☆5キャラ
            //        star4PickedHeroObtainedCount = obtainedHeroCount;
            //    }

            //    if (pickupHeroes[key]) {
            //        pickupHeroes[key] += obtainedHeroCount;
            //    }
            //    else {
            //        pickupHeroes[key] = obtainedHeroCount;
            //    }

            //    if (obtainedHeroCount >= targetHeroCount) {
            //        if (couldGetPickupHeroCount[key]) {
            //            couldGetPickupHeroCount[key] += 1;
            //        }
            //        else {
            //            couldGetPickupHeroCount[key] = 1;
            //        }
            //    }
            //}

            //for (auto key in result.star4PickupHeroes) {
            //    auto obtainedHeroCount = result.star4PickupHeroes[key].length;
            //    if (star4PickupHeroes[key]) {
            //        star4PickupHeroes[key] += obtainedHeroCount;
            //    }
            //    else {
            //        star4PickupHeroes[key] = obtainedHeroCount;
            //    }
            //}

            // 星4ピックが引けた数
            {
                if (result.star4PickupCount >= targetHeroCount)
                {
                    couldGetStar4PickupHeroCount += 1;
                }
            }

            // 星4ピック+星5ピックが引けた数
            {
                if ((result.star4PickupCount + star4PickedHeroObtainedCount) >= targetHeroCount)
                {
                    couldGetStar4AndStar5PickupHeroCount += 1;
                }
            }

            // ☆5ピックアップが引けた数
            {
                if (result.star5PickupCount >= targetHeroCount)
                {
                    couldGetStar5PickupHeroCount += 1;
                }
            }

            // ☆5が引けた数
            {
                if ((result.star5Count + result.star5PickupCount) >= targetHeroCount)
                {
                    couldGetStar5HeroCount += 1;
                }
            }
        }

        for (const auto& iter : star5PickupCountStdDevsPerId)
        {
            int id = iter.first;
            float value = iter.second;
            star5PickupCountStdDevsPerId[id] = value / summonHistorySizeAsFloat;
        }

        lostOrbCountStdDev = lostOrbCountStdDev / summonHistorySizeAsFloat;
        star3CountStdDev = star3CountStdDev / summonHistorySizeAsFloat;
        star4CountStdDev = star4CountStdDev / summonHistorySizeAsFloat;
        star5CountStdDev = star5CountStdDev / summonHistorySizeAsFloat;
        star4PickupCountStdDev = star4PickupCountStdDev / summonHistorySizeAsFloat;
        pickupCountStdDev = pickupCountStdDev / summonHistorySizeAsFloat;
        star5AndPickupCountStdDev = star5AndPickupCountStdDev / summonHistorySizeAsFloat;

        auto summonResult = newSummonAverageResult();
        summonResult->lostOrbCountStdDev = (float)lostOrbCountStdDev;
        summonResult->star3CountStdDev = (float)star3CountStdDev;
        summonResult->star4CountStdDev = (float)star4CountStdDev;
        summonResult->star4PickupCountStdDev = (float)star4PickupCountStdDev;
        summonResult->star5CountStdDev = (float)star5CountStdDev;
        summonResult->star5PickupCountStdDev = (float)pickupCountStdDev;
        summonResult->star5AndPickupCountStdDev = (float)star5AndPickupCountStdDev;

        summonResult->lostOrbCountMin = lostOrbCountMin;
        summonResult->lostOrbCountMax = lostOrbCountMax;
        summonResult->star4PickupWorstCount = star4PickupWorstCount;
        summonResult->star4PickupBestCount = star4PickupBestCount;
        summonResult->star5PickupWorstCount = pickupWorstCount;
        summonResult->star5PickupBestCount = pickupBestCount;
        summonResult->star5WorstCount = star5WorstCount;
        summonResult->star5BestCount = star5BestCount;
        summonResult->star5AndStar5PickupWorstCount = star5AndPickupWorstCount;
        summonResult->star5AndStar5PickupBestCount = star5AndPickupBestCount;
        // star5AndPickupCountAverage - star5AndPickupCountAverage;

        summonResult->averageSummonCount = totalSummonCount / (float)averageSampleCount;
        summonResult->averageLostOrbCount = lostOrbCount / (float)averageSampleCount;
        summonResult->averageStar5PickupCount = star5PickupCountAverage;
        summonResult->averageStar5Count = star5Count / (float)averageSampleCount;
        summonResult->averageStar4Count = star4Count / (float)averageSampleCount;
        summonResult->averageStar4PickupCount = star4PickupCount / (float)averageSampleCount;
        summonResult->averageStar3Count = star3Count / (float)averageSampleCount;
        summonResult->averageStar5AndStar5PickupCount = star5AndPickupCount / (float)averageSampleCount;
        //summonResult->pickupHeroes = pickupHeroes;
        //summonResult->star4PickupHeroes = star4PickupHeroes;
        //summonResult->couldGetPickupHeroCount = couldGetPickupHeroCount;
        summonResult->couldGetStar4PickupHeroCount = couldGetStar4PickupHeroCount;
        summonResult->couldGetStar4AndStar5PickupHeroCount = couldGetStar4AndStar5PickupHeroCount;
        summonResult->couldGetStar5HeroCount = couldGetStar5HeroCount;
        summonResult->couldGetStar5PickupHeroCount = couldGetStar5PickupHeroCount;

        {
            summonResult->star5PickupCountStdDevsPerIdLength = (int)star5PickupCountStdDevsPerId.size();
            summonResult->star5PickupCountStdDevsPerId = new IdAndCount[summonResult->star5PickupCountStdDevsPerIdLength];
            int i = 0;
            for (const auto& elem : star5PickupCountStdDevsPerId)
            {
                auto* idAndCount = &summonResult->star5PickupCountStdDevsPerId[i];
                idAndCount->id = elem.first;
                idAndCount->count = (float)elem.second;
                ++i;
            }
        }

        {
            summonResult->couldGetStar5PickupHeroCountPerIdLength = (int)couldGetStar5PickupHeroCountPerId.size();
            summonResult->couldGetStar5PickupHeroCountPerId = new IdAndCount[summonResult->couldGetStar5PickupHeroCountPerIdLength];
            int i = 0;
            for (const auto& elem : couldGetStar5PickupHeroCountPerId)
            {
                auto* idAndCount = &summonResult->couldGetStar5PickupHeroCountPerId[i];
                idAndCount->id = elem.first;
                idAndCount->count = (float)elem.second;
                ++i;
            }
        }

        {
            summonResult->couldGetStar4PickupHeroCountPerIdLength = (int)couldGetStar4PickupHeroCountPerId.size();
            summonResult->couldGetStar4PickupHeroCountPerId = new IdAndCount[summonResult->couldGetStar4PickupHeroCountPerIdLength];
            int i = 0;
            for (const auto& elem : couldGetStar4PickupHeroCountPerId)
            {
                auto* idAndCount = &summonResult->couldGetStar4PickupHeroCountPerId[i];
                idAndCount->id = elem.first;
                idAndCount->count = (float)elem.second;
                ++i;
            }
        }


        {
            summonResult->star5PickupIdAndCountLength = (int)star5PickupIdAndCounts.size();
            summonResult->star5PickupIdAndCounts = new IdAndCount[summonResult->star5PickupIdAndCountLength];
            int i = 0;
            for (const auto &elem : star5PickupIdAndCounts)
            {
                auto* idAndCount = &summonResult->star5PickupIdAndCounts[i];
                idAndCount->id = elem.first;
                idAndCount->count = elem.second / summonHistorySizeAsFloat;
                ++i;
            }
        }

        {
            summonResult->star5IdAndCountLength = (int)star5IdAndCounts.size();
            summonResult->star5IdAndCounts = new IdAndCount[summonResult->star5IdAndCountLength];
            int i = 0;
            for (const auto& elem : star5IdAndCounts)
            {
                auto* idAndCount = &summonResult->star5IdAndCounts[i];
                idAndCount->id = elem.first;
                idAndCount->count = elem.second / summonHistorySizeAsFloat;
                ++i;
            }
        }

        {
            summonResult->star4PickupIdAndCountLength = (int)star4PickupIdAndCounts.size();
            summonResult->star4PickupIdAndCounts = new IdAndCount[summonResult->star4PickupIdAndCountLength];
            int i = 0;
            for (const auto& elem : star4PickupIdAndCounts)
            {
                auto* idAndCount = &summonResult->star4PickupIdAndCounts[i];
                idAndCount->id = elem.first;
                idAndCount->count = elem.second / summonHistorySizeAsFloat;
                ++i;
            }
        }

        return summonResult;
    }
} // namespace

class FehSummonSimulator::Impl
{
public:
    Impl(const SummonRate &initRate,
         const int *star3ColorCounts,
         const int *star4ColorCounts,
         const std::vector<HeroInfo> &star5PickupHeroInfos,
         const std::vector<HeroInfo> &star5HeroInfos,
         const std::vector<HeroInfo> &star4PickupHeroInfos,
         int nonPickupDecrementCount)
        : m_initRate(initRate),
          m_star3ColorCounts(star3ColorCounts),
          m_star4ColorCounts(star4ColorCounts),
          m_star5PickupHeroInfos(star5PickupHeroInfos),
          m_star5HeroInfos(star5HeroInfos),
          m_star4PickupHeroInfos(star4PickupHeroInfos),
          m_star4TotalCount(0),
          m_star3TotalCount(0),
          m_nonPickupDecrementCount(nonPickupDecrementCount)
    {
        float initStar5PickRate = initRate.star5PickupRate;
        float initStar5Rate = initRate.star5Rate;
        float initStar4PickRate = initRate.star4PickupRate;
        float initStar4Rate = initRate.star4Rate;
        m_star5PickupIncreaseRate = 0.005f * initStar5PickRate / (initStar5PickRate + initStar5Rate);
        m_star5IncreaseRate = 0.005f * initStar5Rate / (initStar5PickRate + initStar5Rate);
        m_star4PickupWeight = initStar4PickRate / (1.0f - initStar5Rate - initStar5PickRate);
        m_star4Weight = initStar4Rate / (1.0f - initStar5Rate - initStar5PickRate);

        for (int i = 0; i < 4; ++i)
        {
            m_star3TotalCount += star3ColorCounts[i];
            m_star4TotalCount += star4ColorCounts[i];
        }
        m_star3Colors.reserve(m_star3TotalCount);
        m_star4Colors.reserve(m_star4TotalCount);
        for (int i = 0; i < 4; ++i)
        {
            int star3Count = star3ColorCounts[i];
            for (int j = 0; j < star3Count; ++j)
            {
                m_star3Colors.push_back((Color)i);
            }
            int star4Count = star4ColorCounts[i];
            for (int j = 0; j < star4Count; ++j)
            {
                m_star4Colors.push_back((Color)i);
            }
        }
    }

    SummonUnit PickOrbImpl(
        RandomAlgorithm randAlgorithm,
        unsigned int rand,
        int currentTryCount,
        const SummonRate &rates,
        const int *star3ColorCounts,
        const int *star4ColorCounts,
        const std::vector<HeroInfo> &star5PickupHeroInfos,
        const std::vector<HeroInfo> &star5HeroInfos,
        const std::vector<HeroInfo> &star4PickupHeroInfos)
    {
        float randVal = NormalizeRandom(rand, randAlgorithm);

        //printf("randVal = %f\n", randVal);
        SummonUnit result;
        float threshold = rates.star5PickupRate;
        if (randVal < threshold)
        {
            // 星5 ピックアップ
            result.rarity = GachaResultKind::Star5Pickup;
            int index = SelectHeroIndex(randVal, 0, rates.star5PickupRate, (int)star5PickupHeroInfos.size());
            result.heroInfo = star5PickupHeroInfos[index];
            result.color = result.heroInfo.color;
            return result;
        }

        threshold += rates.star5Rate;
        if (randVal < threshold)
        {
            // 星5 すり抜け
            auto index = SelectHeroIndex(randVal, rates.star5PickupRate, rates.star5Rate, (int)star5HeroInfos.size());
            result.rarity = GachaResultKind::Star5;
            result.heroInfo = star5HeroInfos[index];
            result.color = result.heroInfo.color;
            auto itr = std::find_if(
                star5PickupHeroInfos.begin(),
                star5PickupHeroInfos.end(),
                [&](const HeroInfo &val) { return val.id == result.heroInfo.id; });
            if (itr != star5PickupHeroInfos.end())
            {
                // すり抜け枠からピックアップが出た場合はピックアップとして扱う
                result.rarity = GachaResultKind::Star5Pickup;
            }
            return result;
        }

        threshold += rates.star4Rate;
        if (randVal < threshold)
        {
            // 星4
            result.rarity = GachaResultKind::Star4;
            int normRandVal = rand % this->m_star4TotalCount;
            result.color = this->m_star4Colors[normRandVal];
            return result;
        }

        threshold += rates.star4PickupRate;
        if (randVal < threshold)
        {
            // 星4ピックアップ
            result.rarity = GachaResultKind::Star4Pickup;
            auto index = SelectHeroIndex(randVal, rates.star5PickupRate + rates.star5Rate + rates.star4Rate, rates.star4PickupRate, (int)star4PickupHeroInfos.size());
            result.heroInfo = star4PickupHeroInfos[index];
            result.color = result.heroInfo.color;
            return result;
        }

        {
            // 星3
            result.rarity = GachaResultKind::Star3;
            int normRandVal = rand % this->m_star3TotalCount;
            result.color = this->m_star3Colors[normRandVal];
            return result;
        }
    }

    SummonRate m_initRate;
    const int *m_star3ColorCounts;
    const int *m_star4ColorCounts;
    const std::vector<HeroInfo> m_star5PickupHeroInfos;
    const std::vector<HeroInfo> m_star5HeroInfos;
    const std::vector<HeroInfo> m_star4PickupHeroInfos;
    float m_star5PickupIncreaseRate;
    float m_star5IncreaseRate;
    float m_star4PickupWeight;
    float m_star4Weight;
    int m_star4TotalCount;
    int m_star3TotalCount;
    std::vector<Color> m_star4Colors;
    std::vector<Color> m_star3Colors;
    int m_nonPickupDecrementCount;
};

FehSummonSimulator::FehSummonSimulator(const SummonRate &initRate,
                                       const int *star3ColorCounts,
                                       const int *star4ColorCounts,
                                       const std::vector<HeroInfo> &star5PickupHeroInfos,
                                       const std::vector<HeroInfo> &star5HeroInfos,
                                       const std::vector<HeroInfo> &star4PickupHeroInfos,
                                       int nonPickupDecrementCount)
    : m_pImpl(nullptr)
{
    m_pImpl = new Impl(initRate, star3ColorCounts, star4ColorCounts,
                       star5PickupHeroInfos,
                       star5HeroInfos,
                       star4PickupHeroInfos,
                       nonPickupDecrementCount);
    initrand((unsigned int)time(NULL));
}
FehSummonSimulator::~FehSummonSimulator()
{
    delete m_pImpl;
}

SummonRate FehSummonSimulator::CalcCurrentRate(
    int currentTryCount,
    const SummonRate &initRate)
{
    float initStar5PickRate = initRate.star5PickupRate;
    float initStar5Rate = initRate.star5Rate;
    int rateUpCount = currentTryCount / 5;
    SummonRate result;
    if (initStar5Rate > 0.0)
    {
        result.star5PickupRate = RoundRate((initStar5PickRate + rateUpCount * m_pImpl->m_star5PickupIncreaseRate));
        result.star5Rate = RoundRate((initStar5Rate + rateUpCount * m_pImpl->m_star5IncreaseRate));
    }
    else
    {
        result.star5PickupRate = RoundRate((initStar5PickRate + rateUpCount * 0.005f));
        result.star5Rate = 0;
    }

    float rateExceptStar5 = 1.0f - result.star5Rate - result.star5PickupRate;
    result.star4Rate = RoundRate(rateExceptStar5 * m_pImpl->m_star4Weight);
    result.star4PickupRate = RoundRate(rateExceptStar5 * m_pImpl->m_star4PickupWeight);
    result.star3Rate = rateExceptStar5 - result.star4Rate;
    return result;
}

SummonUnit FehSummonSimulator::PickOrb(
    RandomAlgorithm randAlgorithm,
    int currentTryCount,
    const SummonRate &rates,
    const int *star3ColorCounts,
    const int *star4ColorCounts,
    const std::vector<HeroInfo> &star5PickupHeroInfos,
    const std::vector<HeroInfo> &star5HeroInfos,
    const std::vector<HeroInfo> &star4PickupHeroInfos)
{
    unsigned int rand = GetRandomUint(randAlgorithm);
    auto result = m_pImpl->PickOrbImpl(
        randAlgorithm,
        rand,
        currentTryCount,
        rates,
        star3ColorCounts,
        star4ColorCounts,
        star5PickupHeroInfos,
        star5HeroInfos,
        star4PickupHeroInfos);

    int individualPatternIndex = rand % IndividualValuePatternCount;
    result.strength = IndividualValueTable[individualPatternIndex * 2];
    result.weekness = IndividualValueTable[individualPatternIndex * 2 + 1];
    return result;
}

SummonResult *FehSummonSimulator::Summon(const SummonArgument &arg)
{
    SummonResult *summonResult = new SummonResult();
    auto totalSummonCount = 0;
    auto star5PickupCount = 0;
    auto star5Count = 0;
    auto star4Count = 0;
    auto star4PickupCount = 0;
    auto star3Count = 0;
    auto lostOrbCount = 0;

    auto ownOrbCount = arg.ownOrbCount;
    auto summonColors = arg.summonColors;
    int summonColorSize = (int)summonColors.size();
    //auto pickupColors = {};
    //auto star5Heroes = "";
    //auto star4PickupHeroes = {};
    auto endSummonCount = arg.summonCount;
    int endSummonStar5Count = arg.summonStar5Count;
    int expectedSummonCount = endSummonCount;
    switch (arg.summonMode)
    {
    case SummonMode::OrbCount:
        endSummonCount = 100000000;
        expectedSummonCount = (ownOrbCount / 20) * 5;
        break;
    case SummonMode::SummonCount:
        ownOrbCount = 100000000;
        endSummonStar5Count = 100000000;
        break;
    case SummonMode::SummonStar5Count:
        endSummonCount = 100000000;
        ownOrbCount = 100000000;
        break;
    default:
        break;
    }
    summonResult->summonedUnits.reserve(expectedSummonCount);

    SummonUnit pickedUnits[5];
    int summonIndices[5];
    int summonColorPrioritySize = (int)arg.summonColorPriority.size();
    for (auto currentTryCount = arg.startTryCount, enterCount = 0; enterCount < 1000000; ++enterCount)
    {
        if (lostOrbCount + 5 > ownOrbCount)
        {
            break;
        }

        SummonRate rates = CalcCurrentRate(currentTryCount, m_pImpl->m_initRate);

        // 5個オーブを取得
        auto summonCount = 0;
        for (auto pickCount = 0; pickCount < 5; ++pickCount)
        {
            auto result = PickOrb(
                arg.randAlgorithm,
                currentTryCount,
                rates,
                m_pImpl->m_star3ColorCounts,
                m_pImpl->m_star4ColorCounts,
                m_pImpl->m_star5PickupHeroInfos,
                m_pImpl->m_star5HeroInfos,
                m_pImpl->m_star4PickupHeroInfos);
            pickedUnits[pickCount] = result;
        }

        // 召喚したい色だけ召喚
        int summonReserveCount = 0;
        for (auto pickCount = 0; pickCount < 5; ++pickCount)
        {
            const auto *result = &pickedUnits[pickCount];
            for (auto summonColorIndex = 0; summonColorIndex < summonColorSize; ++summonColorIndex)
            {
                auto summonColor = summonColors[summonColorIndex];
                if (result->color == summonColor)
                {
                    summonIndices[summonReserveCount] = pickCount;
                    ++summonReserveCount;
                    break;
                }
            }
        }

        if (summonReserveCount == 0)
        {
            // 召喚したい色がない場合は色優先度順
            for (int i = 0; i < summonColorPrioritySize; ++i)
            {
                auto color = arg.summonColorPriority[i];
                int unitIndex = -1;
                for (int j = 0; j < 5; ++j)
                {
                    if (pickedUnits[j].color == color)
                    {
                        unitIndex = j;
                        break;
                    }
                }
                if (unitIndex >= 0)
                {
                    summonIndices[0] = unitIndex;
                    ++summonReserveCount;
                    break;
                }
            }
            if (summonReserveCount == 0)
            {
                // 優先度が設定されていない場合は先頭を採用
                summonIndices[0] = 0;
                ++summonReserveCount;
            }
        }

        for (int i = 0; i < summonReserveCount; ++i)
        {
            auto pickIndex = summonIndices[i];
            const auto *result = &pickedUnits[pickIndex];
            int requiredOrbCount = 0;
            if (summonCount == 0)
            {
                requiredOrbCount = 5;
            }
            else if (summonCount < 4)
            {
                requiredOrbCount = 4;
            }
            else
            {
                requiredOrbCount = 3;
            }
            if (ownOrbCount - lostOrbCount - requiredOrbCount < 0)
            {
                break;
            }

            lostOrbCount += requiredOrbCount;
            ++totalSummonCount;

            summonResult->summonedUnits.push_back(*result);

            switch (result->rarity)
            {
            case GachaResultKind::Star5Pickup:
                currentTryCount = 0;
                ++star5PickupCount;
                break;
            case GachaResultKind::Star5:
                currentTryCount = 0;
                currentTryCount = currentTryCount - m_pImpl->m_nonPickupDecrementCount;
                if (currentTryCount < 0) {
                    currentTryCount = 0;
                }
                ++star5Count;
                break;
            case GachaResultKind::Star4Pickup:
            {
                ++currentTryCount;
                ++star4PickupCount;
            }
            break;
            case GachaResultKind::Star4:
                ++currentTryCount;
                ++star4Count;
                break;
            case GachaResultKind::Star3:
                ++currentTryCount;
                ++star3Count;
                break;
            }

            ++summonCount;
            if (totalSummonCount == endSummonCount)
            {
                break;
            }
            if (star5PickupCount + star5Count == endSummonStar5Count)
            {
                break;
            }
        }

        if (totalSummonCount == endSummonCount)
        {
            break;
        }
        if (star5PickupCount + star5Count == endSummonStar5Count)
        {
            break;
        }
    }

    summonResult->totalSummonCount = totalSummonCount;
    summonResult->lostOrbCount = lostOrbCount;
    summonResult->star3Count = star3Count;
    summonResult->star4Count = star4Count;
    summonResult->star4PickupCount = star4PickupCount;
    summonResult->star5Count = star5Count;
    summonResult->star5PickupCount = star5PickupCount;

    return summonResult;
}

SummonAverageResult *FehSummonSimulator::SummonAverage(
    const SummonArgument &arg, int averageSampleCount, int targetPickCount)
{
    std::vector<SummonResult *> summonHistory;
    summonHistory.reserve(averageSampleCount);

#ifdef __EMSCRIPTEN_PTHREADS__
#if THREAD_COUNT == 1
    for (int i = 0; i < averageSampleCount; ++i)
    {
        auto result = this->Summon(arg);
        //printf("[%d]totalSummonCount = %d\n", i, result->totalSummonCount);
        //printf("[%d]star3Count = %d\n", i, result->star3Count);
        //printf("[%d]star4Count = %d\n", i, result->star4Count);
        //printf("[%d]star5Count = %d\n", i, result->star5Count);
        //printf("[%d]star5PickupCount = %d\n", i, result->star5PickupCount);
        summonHistory.push_back(result);
    }
#else
    bool success = SummonAverageParallel(
        &summonHistory,
        arg,
        averageSampleCount);
    if (!success)
    {
        return nullptr;
    }
#endif
#else
    for (int i = 0; i < averageSampleCount; ++i)
    {
        auto result = this->Summon(arg);
        //printf("[%d]totalSummonCount = %d\n", i, result->totalSummonCount);
        //printf("[%d]star3Count = %d\n", i, result->star3Count);
        //printf("[%d]star4Count = %d\n", i, result->star4Count);
        //printf("[%d]star5Count = %d\n", i, result->star5Count);
        //printf("[%d]star5PickupCount = %d\n", i, result->star5PickupCount);
        summonHistory.push_back(result);
    }
#endif

    auto averageResult = createSummonAverateResult(averageSampleCount, targetPickCount, summonHistory);

    for (int i = 0, count = (int)summonHistory.size(); i < count; ++i)
    {
        SummonResult *result = summonHistory[i];
        deleteSummonResult(result);
    }

    return averageResult;
}

bool FehSummonSimulator::SummonAverageParallel(
    std::vector<SummonResult*>* pSummonHistory,
    const SummonArgument& arg,
    int averageSampleCount)
{
    const int ThreadCount = THREAD_COUNT;
    pthread_t threads[ThreadCount];
    ThreadArgument threadArgs[ThreadCount];
    int unitThreadSampleCount = averageSampleCount / ThreadCount;
    for (int threadIndex = 0; threadIndex < ThreadCount; ++threadIndex)
    {
        pthread_t* pThread = &threads[threadIndex];

        int threadSampleCount = unitThreadSampleCount;
        if (threadIndex == ThreadCount - 1)
        {
            threadSampleCount += averageSampleCount % ThreadCount;
        }

        ThreadArgument* pThreadArg = &threadArgs[threadIndex];
        pThreadArg->pSimulator = this;
        pThreadArg->pArgument = &arg;
        pThreadArg->averageSampleCount = threadSampleCount;

        int result = pthread_create(pThread, nullptr, ThreadFunc, (void*)pThreadArg);
        if (result != 0) {
            return false;
        }
    }

    for (int threadIndex = 0; threadIndex < ThreadCount; ++threadIndex)
    {
        pthread_t* pThread = &threads[threadIndex];
        void* pResult;

        while (pthread_tryjoin_np(*pThread, &pResult) != 0)
        {
#ifdef __EMSCRIPTEN__
            emscripten_sleep(10);
#else
            std::this_thread::sleep_for(std::chrono::microseconds(10));
#endif
        };

        ThreadArgument* pThreadArg =
            reinterpret_cast<ThreadArgument*>(pResult);
        for (int i = 0, count = (int)pThreadArg->summonHistory.size(); i < count; ++i)
        {
            pSummonHistory->push_back(pThreadArg->summonHistory[i]);
        }

        printf("[%d] summonHistory->size = %zu\n", threadIndex, pThreadArg->summonHistory.size());
    }

    return true;
}

void* FehSummonSimulator::ThreadFunc(void* param)
{
    auto pArgument = reinterpret_cast<ThreadArgument*>(param);
    int averageSampleCount = pArgument->averageSampleCount;
    pArgument->summonHistory.reserve(averageSampleCount);

    for (int i = 0; i < averageSampleCount; ++i)
    {
        auto result = pArgument->pSimulator->Summon(*pArgument->pArgument);
        //printf("[%d]totalSummonCount = %d\n", i, result->totalSummonCount);
        //printf("[%d]star3Count = %d\n", i, result->star3Count);
        //printf("[%d]star4Count = %d\n", i, result->star4Count);
        //printf("[%d]star5Count = %d\n", i, result->star5Count);
        //printf("[%d]star5PickupCount = %d\n", i, result->star5PickupCount);
        pArgument->summonHistory.push_back(result);
    }

    return pArgument;
}
