// FehSummonSimulator.cpp : このファイルには 'main' 関数が含まれています。プログラム実行の開始と終了がそこで行われます。
//

#include <iostream>
#include "../FehSummonSimulatorLibrary/FehSummonSimulator.h"

int main()
{
    SummonRate initRate;
    initRate.star5Rate = 0.03f;
    initRate.star5PickupRate = 0.03f;
    initRate.star4PickupRate = 0.03f;
    initRate.star4Rate = 0.55f;

    const int star5HeroIds[] = { 191, 192, 194, 203, 204, 208, 210, 219, 220, 221, 224, 225, 233, 234, 235, 239, 241, 246, 247, 254, 256, 269, 270, 271, 278, 279, 280, 281, 284, 285, 289, 290, 291, 293, 294, 295, 303, 304, 305, 308, 309, 310, 311, 313, 314, 328, 329, 331, 344, 345, 346, 347, 350, 351, 353, 361, 362, 364, 372, 373, 374, 375, 383, 384, 385, 386, 399, 400, 401, 402, 403, 408, 409, 411, 413, 414, 415, 416, 424, 425, 427, 436, 438, 439, 444, 445, 446, 449, 450, 452, 456, 457, 458, 473, 474, 475, 476, 478, 479, 480, 481, 489, 490, 491, 492, 495, 496, 497, 498, 506, 507, 508, 509, 517, 518, 519, 520 };
    const int star5HeroColors[] = { 2, 1, 0, 0, 1, 2, 0, 1, 2, 0, 0, 1, 2, 0, 0, 2, 3, 1, 0, 0, 2, 1, 0, 3, 2, 1, 0, 3, 1, 2, 1, 3, 0, 0, 2, 0, 0, 1, 3, 0, 1, 2, 3, 1, 2, 0, 3, 1, 0, 3, 2, 1, 2, 2, 0, 2, 0, 3, 0, 1, 3, 3, 2, 1, 3, 0, 2, 1, 3, 0, 0, 2, 0, 1, 3, 1, 2, 0, 0, 1, 2, 1, 3, 0, 2, 0, 1, 3, 1, 0, 0, 0, 2, 0, 1, 2, 0, 3, 2, 0, 1, 1, 2, 1, 3, 0, 1, 2, 3, 2, 1, 0, 3, 1, 2, 0, 0 };
    const int star5HeroCount = (int)(sizeof(star5HeroIds) / sizeof(int));

    std::vector<HeroInfo> star5HeroInfos;
    for (int i = 0; i < star5HeroCount; ++i)
    {
        int id = star5HeroIds[i];
        Color color = (Color)star5HeroColors[i];
        star5HeroInfos.push_back({ id, color });
    }

    const int star5PickupHeroIds[] = { 535, 536, 534, 537 };
    const int star5PickupHeroColors[] = { 0, 1, 2, 3 };
    const int star5PickupHeroCount = (int)(sizeof(star5PickupHeroIds) / sizeof(int));

    std::vector<HeroInfo> star5PickupHeroInfos;
    for (int i = 0; i < star5PickupHeroCount; ++i)
    {
        int id = star5PickupHeroIds[i];
        Color color = (Color)star5PickupHeroColors[i];
        star5PickupHeroInfos.push_back({ id, color });
    }

    const int star4PickupHeroIds[] = { 536 };
    std::vector<HeroInfo> star4PickupHeroInfos;
    star4PickupHeroInfos.push_back({ 536, (Color)1 });

    const int star3ColorCounts[] = { 33, 33, 24, 35 };
    const int star4ColorCounts[] = { 33, 34, 24, 36 };
    FehSummonSimulator sim(
        initRate,
        star3ColorCounts,
        star4ColorCounts,
        star5PickupHeroInfos,
        star5HeroInfos,
        star4PickupHeroInfos,
        20);

    SummonArgument arg;
    arg.randAlgorithm = RandomAlgorithm::Xorshift;
    arg.ownOrbCount = 140;
    arg.startTryCount = 0;
    arg.summonColors.push_back(Color::Red);
    arg.summonColors.push_back(Color::Blue);
    arg.summonColors.push_back(Color::Green);
    arg.summonColors.push_back(Color::Colorless);
    arg.summonMode = SummonMode::OrbCount;
    arg.summonCount = -1;
    arg.summonColorPriority.push_back(Color::Red);
    arg.summonColorPriority.push_back(Color::Blue);
    arg.summonColorPriority.push_back(Color::Green);
    arg.summonColorPriority.push_back(Color::Colorless);

    auto result = sim.SummonAverage(arg, 10000, 1);
    printf("averageLostOrbCount = %f\n", result->averageLostOrbCount);
    printf("couldGetStar4PickupHeroCount = %d\n", result->couldGetStar4PickupHeroCount);
    printf("couldGetStar4AndStar5PickupHeroCount = %d\n", result->couldGetStar4AndStar5PickupHeroCount);
    printf("couldGetStar5HeroCount = %d\n", result->couldGetStar5HeroCount);
    printf("couldGetStar5PickupHeroCount = %d\n", result->couldGetStar5PickupHeroCount);

    for (int i = 0; i < result->couldGetStar5PickupHeroCountPerIdLength; ++i)
    {
        IdAndCount* idAndCount = &result->couldGetStar5PickupHeroCountPerId[i];
        printf("couldGetStar5PickupHeroCountPerId[%d]: %f\n", idAndCount->id, idAndCount->count);
    }
}

