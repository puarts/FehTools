#include "pch.h"
#include "FehSummonSimulator.h"
#include <chrono>

TEST(TestCaseName, SummonAveragePerf) {
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
        0);

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

    for (int alg = 0; alg < 4; ++alg)
    {
        arg.randAlgorithm = (RandomAlgorithm)alg;
        double totalTime = 0.0;
        int tryCount = 100;
        for (int i = 0; i < tryCount; ++i)
        {
            std::chrono::system_clock::time_point start, end;
            start = std::chrono::system_clock::now();

            auto result = sim.SummonAverage(arg, 10000, 1);

            end = std::chrono::system_clock::now();

            double time = static_cast<double>(std::chrono::duration_cast<std::chrono::microseconds>(end - start).count() / 1000.0);
            totalTime += time;
            deleteSummonAverageResult(result);
        }

        EXPECT_TRUE(false) << "average of "<< alg<<": " << totalTime / tryCount << std::endl;
    }
}
TEST(TestCaseName, SummonAverage) {

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
    star4PickupHeroInfos.push_back({ 536, (Color)1});

    const int star3ColorCounts[] = { 33, 33, 24, 35 };
    const int star4ColorCounts[] = { 33, 34, 24, 36 };
    FehSummonSimulator sim(
        initRate,
        star3ColorCounts,
        star4ColorCounts,
        star5PickupHeroInfos,
        star5HeroInfos,
        star4PickupHeroInfos,
        0);

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

    // 標準出力を文字列として記録する
    //std::stringstream buffer;
    //std::streambuf* sbuf = std::cout.rdbuf();
    //std::cout.rdbuf(buffer.rdbuf());

    for (int alg = 0; alg < 4; ++alg)
    {
        arg.randAlgorithm = (RandomAlgorithm)alg;
        auto result = sim.SummonAverage(arg, 10000, 1);

        // When done redirect cout to its old self
        //std::cout.rdbuf(sbuf);

        EXPECT_GT(result->couldGetStar5PickupHeroCountPerId[0].count, 100.0f);
        auto star5PickupRatio = result->averageStar5PickupCount / result->averageSummonCount;
        EXPECT_GT(star5PickupRatio, 0.03);
        EXPECT_LT(star5PickupRatio, 0.05);

        auto star5Ratio = result->averageStar5Count / result->averageSummonCount;
        EXPECT_GT(star5Ratio, 0.03);
        EXPECT_LT(star5Ratio, 0.05);

        auto star4Ratio = result->averageStar4Count / result->averageSummonCount;
        const float tolerance = 0.5f;
        EXPECT_GT(star4Ratio, initRate.star4Rate - tolerance);
        EXPECT_LT(star4Ratio, initRate.star4Rate + tolerance);

        EXPECT_GT(result->averageStar3Count, 1);
        EXPECT_GT(result->averageStar5PickupCount, 0);
        EXPECT_GT(result->star5PickupIdAndCountLength, 0);
        deleteSummonAverageResult(result);
    }
}

TEST(TestCaseName, SummonAverageUntilGetStar5) {

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
        0);

    SummonArgument arg;
    arg.randAlgorithm = RandomAlgorithm::Xorshift;
    arg.ownOrbCount = 140;
    arg.startTryCount = 0;
    arg.summonColors.push_back(Color::Red);
    arg.summonColors.push_back(Color::Blue);
    arg.summonColors.push_back(Color::Green);
    arg.summonColors.push_back(Color::Colorless);
    arg.summonMode = SummonMode::SummonStar5Count;
    arg.summonStar5Count = 40;
    arg.summonColorPriority.push_back(Color::Red);
    arg.summonColorPriority.push_back(Color::Blue);
    arg.summonColorPriority.push_back(Color::Green);
    arg.summonColorPriority.push_back(Color::Colorless);

    // 標準出力を文字列として記録する
    //std::stringstream buffer;
    //std::streambuf* sbuf = std::cout.rdbuf();
    //std::cout.rdbuf(buffer.rdbuf());

    {
        arg.randAlgorithm = (RandomAlgorithm)3;
        auto result = sim.SummonAverage(arg, 10000, 1);

        EXPECT_GE(arg.summonStar5Count, result->star5AndStar5PickupBestCount);
        EXPECT_LT(result->star5AndStar5PickupBestCount, arg.summonStar5Count + 5);
        EXPECT_EQ(arg.summonStar5Count, result->star5AndStar5PickupWorstCount);
        deleteSummonAverageResult(result);
    }
}

TEST(TestCaseName, Summon) {
    SummonRate initRate;
    initRate.star5Rate = 0.03f;
    initRate.star5PickupRate = 0.03f;
    initRate.star4PickupRate = 0;
    initRate.star4Rate = 0.58f;

    std::vector<HeroInfo> star5HeroInfos;
    star5HeroInfos.push_back({ 13, Color::Blue });

    std::vector<HeroInfo> star5PickupHeroInfos;
    star5PickupHeroInfos.push_back({ 11, Color::Red });

    const int star3ColorCounts[] = { 0, 0, 0, 1 };
    const int star4ColorCounts[] = { 0, 1, 0, 0 };
    FehSummonSimulator sim(
        initRate,
        star3ColorCounts,
        star4ColorCounts,
        star5PickupHeroInfos,
        star5HeroInfos,
        std::vector<HeroInfo>{},
        0);

    SummonArgument arg;
    arg.randAlgorithm = RandomAlgorithm::Xorshift;
    arg.ownOrbCount = 140;
    arg.summonColors.push_back(Color::Red);
    arg.summonMode = SummonMode::OrbCount;
    arg.summonCount = -1;
    auto result = sim.Summon(arg);
    EXPECT_LE(
        result->lostOrbCount, arg.ownOrbCount);
    EXPECT_GT(
        result->lostOrbCount, arg.ownOrbCount - 5);
    EXPECT_GE(result->totalSummonCount, arg.ownOrbCount / 5);
    EXPECT_LE(result->totalSummonCount, arg.ownOrbCount / 4);
    EXPECT_EQ(result->totalSummonCount, (int)result->summonedUnits.size());
    for (auto iter = result->summonedUnits.begin(), end = result->summonedUnits.end();
        iter != end; ++iter)
    {
        const SummonUnit& unit = *iter;
        switch (unit.rarity)
        {
        case GachaResultKind::Star3:
            EXPECT_EQ(Color::Colorless, unit.color);
            break;
        case GachaResultKind::Star4:
            EXPECT_EQ(Color::Green, unit.color);
            break;
        case GachaResultKind::Star5:
            ASSERT_EQ(Color::Blue, unit.color);
            ASSERT_EQ(13, unit.heroInfo.id);
            break;
        case GachaResultKind::Star5Pickup:
            ASSERT_EQ(Color::Red, unit.color);
            ASSERT_EQ(11, unit.heroInfo.id);
            break;
        default:
            FAIL();
        }
    }
    deleteSummonResult(result);
}

TEST(TestCaseName, CurrentRateCalculation) {
    SummonRate initRate;
    initRate.star5Rate = 0.03f;
    initRate.star5PickupRate = 0.03f;
    initRate.star4PickupRate = 0;
    initRate.star4Rate = 0.58f;

    std::vector<HeroInfo> star5HeroInfos;
    std::vector<HeroInfo> star5PickupHeroInfos;
    const int star3ColorCounts[] = { 0, 0, 0, 1 };
    const int star4ColorCounts[] = { 0, 1, 0, 0 };
    FehSummonSimulator sim(
        initRate,
        star3ColorCounts,
        star4ColorCounts,
        star5PickupHeroInfos,
        star5HeroInfos,
        std::vector<HeroInfo>{},
        0);
    {
        auto result = sim.CalcCurrentRate(9, initRate);
        EXPECT_EQ(0.0325, result.star5PickupRate);
        EXPECT_EQ(0.0325, result.star5Rate);
    }
    {
        auto result = sim.CalcCurrentRate(10, initRate);
        EXPECT_EQ(0.035, result.star5PickupRate);
        EXPECT_EQ(0.035, result.star5Rate);
    }
}

TEST(TestCaseName, PickOrb) {
    SummonRate initRate;
    initRate.star5Rate = 0.03f;
    initRate.star5PickupRate = 0.03f;
    initRate.star4PickupRate = 0;
    initRate.star4Rate = 0.58f;

    std::vector<HeroInfo> star5HeroInfos;
    star5HeroInfos.push_back({ 13, Color::Blue });

    std::vector<HeroInfo> star5PickupHeroInfos;
    star5PickupHeroInfos.push_back({ 11, Color::Red });

    const int star3ColorCounts[] = { 0, 0, 0, 1 };
    const int star4ColorCounts[] = { 0, 1, 0, 0 };

    FehSummonSimulator sim(
        initRate,
        star3ColorCounts,
        star4ColorCounts,
        star5PickupHeroInfos,
        star5HeroInfos,
        std::vector<HeroInfo>{},
        0);

    for (int i = 0; i < 1000; ++i)
    {
        auto result = sim.PickOrb(
            RandomAlgorithm::Xorshift,
            0, initRate,
            star3ColorCounts,
            star4ColorCounts,
            star5PickupHeroInfos,
            star5HeroInfos,
            std::vector<HeroInfo>{});
        switch (result.rarity)
        {
        case GachaResultKind::Star3:
            EXPECT_EQ(Color::Colorless, result.color);
            break;
        case GachaResultKind::Star4:
            EXPECT_EQ(Color::Green, result.color);
            break;
        case GachaResultKind::Star5:
            ASSERT_EQ(Color::Blue, result.color);
            ASSERT_EQ(13, result.heroInfo.id);
            break;
        case GachaResultKind::Star5Pickup:
            ASSERT_EQ(Color::Red, result.color);
            ASSERT_EQ(11, result.heroInfo.id);
            break;
        default:
            FAIL();
        }
    }
}
