
function createBoolPropsFromStrArray(sourceArray, idPrefix, valueToStrFunc = null) {
    const props = [];
    let i = 0;
    for (const item of sourceArray) {
        const label = valueToStrFunc != null ? valueToStrFunc(item) : item;
        props.push(new BoolProp(item, idPrefix + i, label, false));
        ++i;
    }
    return props;
}

class AppData extends SqliteDatabase {
    constructor() {
        super();

        this.heroDb = null;

        /** @type {HeroInfo[]} */
        this.heroInfos = [];
        this.heroIdToInfo = {};

        this.showsBackwordList = true;
        this.targetMoveType = MoveType.Infantry;
        this.targetWeaponType = WeaponType.Sword;

        this.isDragonflowerEnabled = true;
        this.isResplendentEnabled = true;
        this.excludesOriginalWeapon = false;
        this.excluedsRefreshSkill = false;
        this.comparesSameOriginOnly = false;
        this.showsHierarchy = false;
        this.showsMetaInfo = true;

        this.backwordStatHeroIdList = {};
        this.forwardStatHeroIdList = {};
        this.heroInfoToStatuses = {};
        this.groupedHeroInfos = {};

        this.hitCount = 0;

        this.targetHowToGet = createBoolPropsFromStrArray(
            ["比翼", "双界", ...new Set(Object.values(howToGetDict))], "HowToGet");
        this.targetBook = createBoolPropsFromStrArray(
            getBooks(), "Book");
    }

    init(afterInitFunc = null) {
        this.initDatabase(() => {
            this.heroDb = this.dbs[0];
            this.__createHeroInfos();
            this.updateBackworkStatHeroes();
            if (afterInitFunc != null) {
                afterInitFunc();
            }
        });
    }

    getBackwordOrForwardList() {
        return this.showsBackwordList ? this.backwordStatHeroIdList : this.forwardStatHeroIdList;
    }

    updateBackworkStatHeroes() {
        const groupedBackwordStatHeroIdList = {};
        const groupedForwardStatHeroIdList = {};
        const heroInfoToStatuses = {};

        const enabledHowToGet = this.targetHowToGet.filter(x => x.value).map(x => x.id);
        const skipsHowToGet = enabledHowToGet.length == 0 || enabledHowToGet.length == this.targetHowToGet.length;

        const enabledBook = this.targetBook.filter(x => x.value).map(x => x.id);
        const skipsBook = enabledBook.length == 0 || enabledBook.length == this.targetBook.length;

        let hitCount = 0;

        // let typeId = getMoveWeaponTypeId(this.targetMoveType, this.targetWeaponType);
        for (const typeId in this.groupedHeroInfos) {
            /** @type {HeroInfo[]} */
            const infos = this.groupedHeroInfos[typeId];
            const backwordStatHeroIdList = {};
            const forwardStatHeroIdList = {};
            if (infos != null) {
                const targetInfos = Array.from(infos.filter(x =>
                    (this.excludesOriginalWeapon ? !x.hasOriginalWeapon : true)
                    && (this.excluedsRefreshSkill ? !x.hasRefreshSkill : true)
                    && (skipsHowToGet || enabledHowToGet.includes(x.howToGet))
                    && (skipsBook || enabledBook.includes(x.book))));
                const compareTargetInfos = Array.from(infos.filter(x => x));
                for (let info of infos) {
                    const statArray = Array.from(info.enumerateStatuses(this.isDragonflowerEnabled, this.isResplendentEnabled));
                    heroInfoToStatuses[info.id] = statArray;
                }

                for (const infoA of targetInfos) {
                    const statA = heroInfoToStatuses[infoA.id];
                    heroInfoToStatuses[infoA.id] = statA;
                    for (const infoB of compareTargetInfos.filter(x => x.id != infoA.id)) {
                        if (this.comparesSameOriginOnly && infoA.origin != infoB.origin) continue;

                        const statB = heroInfoToStatuses[infoB.id];
                        if ((!this.excludesOriginalWeapon || (this.excludesOriginalWeapon && !infoA.hasOriginalWeapon))
                            && this.__isBackwordStatus(statA, statB)
                        ) {
                            if (!backwordStatHeroIdList[infoA.id]) backwordStatHeroIdList[infoA.id] = [];
                            backwordStatHeroIdList[infoA.id].push(infoB);
                            if (!forwardStatHeroIdList[infoB.id]) forwardStatHeroIdList[infoB.id] = [];
                            forwardStatHeroIdList[infoB.id].push(infoA);
                        }
                    }
                }

                const length = Object.keys(backwordStatHeroIdList).length;
                hitCount += length;
                if (length > 0) {
                    groupedBackwordStatHeroIdList[typeId] = backwordStatHeroIdList;
                    groupedForwardStatHeroIdList[typeId] = forwardStatHeroIdList;
                }
            }
        }

        this.backwordStatHeroIdList = groupedBackwordStatHeroIdList;
        this.forwardStatHeroIdList = groupedForwardStatHeroIdList;
        this.heroInfoToStatuses = heroInfoToStatuses;

        this.hitCount = hitCount;
    }

    __isBackwordStatus(statA, statB) {
        return statA[0] <= statB[0]
            && statA[1] <= statB[1]
            && statA[2] <= statB[2]
            && statA[3] <= statB[3]
            && statA[4] <= statB[4];
    }

    __createHeroInfos() {
        const query = "select * from heroes where how_to_get!='' and how_to_get is not null order by type='赤' desc,type='青' desc,type='緑' desc,type='無' desc, weapon_type, move_type";
        const queryResult = this.heroDb.exec(query)[0];
        const keyToIndex = {};
        for (let i = 0; i < queryResult.columns.length; ++i) {
            keyToIndex[queryResult.columns[i]] = i;
        }

        for (const row of queryResult.values) {
            const atk1 = row[keyToIndex["atk_5_lv1"]];
            if (atk1 == null) {
                continue;
            }

            const id = row[keyToIndex["id"]];
            const name = row[keyToIndex["name"]];
            const specialTypeSource = row[keyToIndex["special_type"]];
            const specialTypes = parseSqlStringToArray(specialTypeSource);
            const info = new HeroInfo(
                id,
                name,
                row[keyToIndex["thumb"]],
                Number(row[keyToIndex["hp_5"]]),
                Number(row[keyToIndex["atk_5"]]),
                Number(row[keyToIndex["spd_5"]]),
                Number(row[keyToIndex["def_5"]]),
                Number(row[keyToIndex["res_5"]]),
                Number(row[keyToIndex["hp_5_lv1"]]),
                Number(row[keyToIndex["atk_5_lv1"]]),
                Number(row[keyToIndex["spd_5_lv1"]]),
                Number(row[keyToIndex["def_5_lv1"]]),
                Number(row[keyToIndex["res_5_lv1"]]),
                row[keyToIndex["resplendent"]] == "true" ? true : false,
                row[keyToIndex["release_date"]],
                getMoveTypeFromStr(row[keyToIndex["move_type"]]),
                getWeaponTypeFromStr(row[keyToIndex["weapon_type"]]),
                getColorTypeFromStr(row[keyToIndex["type"]]),
                specialTypes,
                howToGetDict[row[keyToIndex["how_to_get"]]],
                parseSqlStringToArray(row[keyToIndex["skills"]]),
                row[keyToIndex["origin"]],
                parseSqlStringToArray((row[keyToIndex["rarity3"]] ?? "").replaceAll('星', '★'))
            );

            this.heroInfos.push(info);
            this.heroIdToInfo[info.id] = info;
        }

        const groupedHeroInfos = this.heroInfos.reduce((result, item) => {
            const category = item.getUnitTypeId();
            if (!result[category]) {
                result[category] = [];
            }
            result[category].push(item);
            return result;
        }, {});

        this.groupedHeroInfos = groupedHeroInfos;
    }

    * __enumerateDbPaths() {
        yield "/db/feh-heroes.sqlite3?20230810";
    }
}