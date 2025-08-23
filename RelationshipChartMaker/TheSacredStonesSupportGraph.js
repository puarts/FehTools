
class BoolOption {
    constructor(label, defaultValue = false) {
        this.label = label;
        this.isEnabled = defaultValue;
    }
}

/**
 * 指定された中心座標、角度、半径から円周上の点の座標を計算します。
 *
 * @param {number} centerX - 円の中心のX座標
 * @param {number} centerY - 円の中心のY座標
 * @param {number} angular - 度数法での角度（時計回り）
 * @param {number} radius - 円の半径
 * @returns {{x: number, y: number}} 円周上の点の座標
 */
function getPositionOnCircleBoundary(centerX, centerY, angular, radius) {
    // 度をラジアンに変換
    const radians = (angular * Math.PI) / 180;
    // 円周上の点の座標を計算
    const x = centerX + radius * Math.cos(radians);
    const y = centerY + radius * Math.sin(radians);
    return { x, y };
}

/**
 * ノードのリストから重心座標を計算します。
 * @param {Array<{x: number, y: number}>} nodes - x, y の座標を持つノードのリスト
 * @returns {{x: number, y: number}} 重心座標
 */
function calculateCentroid(nodes) {
    if (nodes.length === 0) {
        throw new Error("ノードリストが空です。");
    }

    const total = nodes.reduce(
        (acc, node) => {
            acc.x += node.x;
            acc.y += node.y;
            return acc;
        },
        { x: 0, y: 0 }
    );

    const count = nodes.length;
    return {
        x: total.x / count,
        y: total.y / count,
    };
}

class AppDataEx extends AppData {
    constructor() {
        super();
        this.isCookieEnabled = false;
        this.showsIsolatedNodes = false;
        this.showsPairEndOnly = false;

        /** @type {BoolOption[]} */
        this.charFilterOptions = [];

        /** @type {BoolOption[]} */
        this.charExcludeOptions = [];

        this.nameToNodeDict = {};

        /** @type {SupportPair[]} */
        this.pairs = [];

        this.selectedCount = 0;
    }

    setAllFilterOptions(isEnabled) {
        for (const option of this.charFilterOptions) {
            option.isEnabled = isEnabled;
        }
        this.updateCharFilter();
    }
    setAllExcludeOptions(isEnabled) {
        for (const option of this.charExcludeOptions) {
            option.isEnabled = isEnabled;
        }
        this.updateCharFilter();
    }
    updateCharFilter() {
        this.showsIsolatedNodes = !this.generatesNodesFromEdges;
        this.filterCharacters = Array.from(this.charFilterOptions.filter(x => x.isEnabled).map(option => this.nameToNodeDict[option.label]));
        this.__updateEdgeVisibilities();
        this.__updateNodeVisibilities();

        this.layoutVisibleGraphs();
        this.updateGraphAuto();
    }

    __updateEdgeVisibilities() {
        if (this.showsPairEndOnly) {
            for (let edge of this.graph.edges) {
                const pair = edge.userData;
                edge.isVisible = pair.pairEnd;
            }
        }
        else {
            for (let edge of this.graph.edges) {
                edge.isVisible = true;
            }
        }
    }

    __updateNodeVisibilities() {
        this.selectedCount = this.filterCharacters.length;
        if (this.filterCharacters.length > 0) {
            const filterCharDict = {};
            for (const char of this.filterCharacters) {
                if (char.name != NoneValue) {
                    filterCharDict[char.name] = null;
                }
            }
            for (const node of this.graph.nodes) {
                node.imageFilter = node.name in filterCharDict ? ImageFilter.None : ImageFilter.GrayScale;
            }


            if (!this.generatesNodesFromEdges) {
                for (const node of this.graph.nodes) {
                    node.isVisible = node.name in filterCharDict;
                }
            }
            else {
                for (const node of this.graph.nodes) {
                    node.isVisible = true;
                }
            }
        }
        else {
            for (const node of this.graph.nodes) {
                node.imageFilter = ImageFilter.None;
                node.isVisible = true;
            }
        }
    }
    updateCharExcludeFilter() {
        this.excludeNodes = Array.from(this.charExcludeOptions.filter(x => x.isEnabled).map(option => this.nameToNodeDict[option.label]));
        this.layoutVisibleGraphs();
        this.updateGraphAuto();
    }

    registerSelectedNodesToExcludeNodes() {
        const selectedNodeIds = Array.from(this.selectedNodes.filter(x => x instanceof GraphNode).map(x => x.id));
        for (const nodeId of selectedNodeIds) {
            const node = this.graph.nodes.find(x => x.id == nodeId);
            const option = this.charExcludeOptions.find(x => x.label == node.displayName);
            option.isEnabled = true;
        }

        this.updateCharExcludeFilter();
    }

    _getPairs() {
        return this.showsPairEndOnly ?
            Array.from(this.pairs.filter(x => x.pairEnd))
            : this.pairs;
    }

    layoutVisibleGraphs() {
        const mainNodes = this.filterCharacters;
        const isFiltered = mainNodes.length > 1; // フィルタリングされてないときは空ノードが1つ入ってる

        let isSpringAlgorithmEnabled = true;

        const actualPairs = this._getPairs();

        if (isSpringAlgorithmEnabled) {
            if (!isFiltered) {
                const nodes = Object.values(this.nameToNodeDict);
                this.layoutNodes(nodes);
                return;
            }
            if (!this.generatesNodesFromEdges) {
                this.layoutNodes(mainNodes);
                return;
            }

            const layoutedNodeNames = [];
            const filterNodeNameToNodeDict = {};
            for (const mainNode of mainNodes) {
                filterNodeNameToNodeDict[mainNode.displayName] = mainNode;

                const pairs = actualPairs.filter(x => x.name1 == mainNode.displayName || x.name2 == mainNode.displayName);
                const names = Array.from(enumerateNames(pairs).filter(x => layoutedNodeNames.every(node => x != node)));
                for (const name of names) {
                    /** @type {GraphNode} */
                    const node = this.nameToNodeDict[name];
                    layoutedNodeNames.push(node.displayName);
                    filterNodeNameToNodeDict[node.displayName] = node;
                }
            }
            this.layoutNodes(Object.values(filterNodeNameToNodeDict));
        }
        else {
            const centerPos = calculateCentroid(mainNodes);

            const isAnyNodeSelected = this.selectedNodes.length > 0;

            // メインノードを配置
            const layoutedNodeNames = [];
            {
                const arroundNodeCount = mainNodes.length;
                const unitAngular = 360 / arroundNodeCount;
                const radius = 300;
                let index = 0;
                for (const node of mainNodes) {
                    if (!isAnyNodeSelected) {
                        // メインノードは選択された対象がないときだけ移動する
                        const pos = getPositionOnCircleBoundary(centerPos.x, centerPos.y, unitAngular * index, radius);
                        node.x = pos.x;
                        node.y = pos.y;
                    }

                    // layoutedNodeNames[node.name] = null;
                    layoutedNodeNames.push(node.displayName);
                    ++index;
                }
            }

            // メインノードの周囲のノードを配置
            for (const mainNode of mainNodes) {
                const pairs = actualPairs.filter(x => x.name1 == mainNode.displayName || x.name2 == mainNode.displayName);
                const names = Array.from(enumerateNames(pairs).filter(x => layoutedNodeNames.every(node => x != node)));

                if (isAnyNodeSelected && !this.selectedNodes.some(x => x == mainNode)) {
                    continue;
                }

                const arroundNodeCount = names.length;
                const unitAngular = 360 / arroundNodeCount;
                let index = 0;
                const radius = 150;

                for (const name of names) {
                    /** @type {GraphNode} */
                    const node = this.nameToNodeDict[name];

                    const pos = getPositionOnCircleBoundary(mainNode.x, mainNode.y, unitAngular * index, radius);
                    node.x = pos.x;
                    node.y = pos.y;
                    console.log(node.displayName);
                    // layoutedNodeNames[node.name] = null;
                    layoutedNodeNames.push(node.displayName);
                    ++index;
                }
            }
        }

        this.__updateGraph();
    }

    initGraph() {
        const pairs = createBlazingBladeSupportPairList(this.dbs[1]);
        this.pairs = pairs;
        const names = enumerateNames(pairs).sort();
        this.charFilterOptions = Array.from(names.map(x => new BoolOption(x, false)));
        console.log(this.charFilterOptions);
        this.charExcludeOptions = Array.from(names.map(x => new BoolOption(x, false)));

        /** @type {CharacterInfo[]} */
        const charInfos = names.map(x =>
            findCharInfoByName(this.characters, x, "聖魔の光石"));

        const nameToNodeDict = {};
        for (const info of charInfos) {
            const nodeId = info.id;
            const node = new GraphNode(nodeId, info.id);
            this.addNode(node);
            this.__executeAllCommands();
            nameToNodeDict[info.name] = node;
        }

        this.nameToNodeDict = nameToNodeDict;

        // console.log(nameToNodeDict);
        let edgeIndex = 0;
        for (const pair of pairs) {
            const edgeId = edgeIndex + 1;
            console.log(`${pair.name1} - ${pair.name2}`);
            let node1 = nameToNodeDict[pair.name1];
            if (node1 == null) {
                console.error(`node ${pair.name1} was not found`);
                continue;
            }
            let node2 = nameToNodeDict[pair.name2];
            if (node2 == null) {
                console.error(`node ${pair.name2} was not found`);
                continue;
            }
            console.log(`edge ${edgeId}: ${node1.id}(${pair.name1}) - ${node2.id}(${pair.name2})`);
            const edge = new GraphEdge(edgeId, node1.id, node2.id, `+${pair.increment}`, "none");
            edge.strokeWidth = pair.pairEnd ? 3 : 1;
            edge.strokeColor = pair.pairEnd ? "#f9d" : "#666";
            edge.userData = pair;
            this.addEdge(edge);
            this.__executeAllCommands();
            ++edgeIndex;
        }

        const nodes = Object.values(this.nameToNodeDict);
        this.layoutNodes(nodes);
    }

    layoutNodes(nodes) {
        if (nodes.length > 0) {
            const node = nodes[0];
            const radius = node.radius;
            console.log("layout!");
            layoutNodesBySpringModel(
                nodes,
                this._getPairs(),
                new SpringLayoutArgument(200, 200, radius * 2, 0.18, 0.5),
                true);
        }
    }
}

const g_appData = new AppDataEx();
const g_app = new Vue({
    el: "#app",
    data: g_appData,
});


/**
 * @return  {SupportPair[]}
 */
function createBlazingBladeSupportPairList(db) {
    const sql = `select * from support`;
    const queryResult = db.exec(sql)[0];
    const name1Index = queryResult.columns.indexOf("name1");
    const name2Index = queryResult.columns.indexOf("name2");
    const pairEndIndex = queryResult.columns.indexOf("pair_end");
    const incrementPointIndex = queryResult.columns.indexOf("increment_point");

    const result = [];
    for (const columnValues of queryResult.values) {
        const name1 = columnValues[name1Index];
        const name2 = columnValues[name2Index];
        const pairEnd = columnValues[pairEndIndex] == "true" ? true : false;
        const incrementPoint = columnValues[incrementPointIndex];
        const info = new SupportPair(
            name1, name2, pairEnd, incrementPoint
        );
        result.push(info);
    }
    return result;
}
/**
 * @param  {SupportPair[]} pairs
 */
function enumerateNames(pairs) {
    return [...new Set(Array.from(enumerateNamesImpl(pairs)))];
}

function* enumerateNamesImpl(pairs) {
    for (const pair of pairs) {
        yield pair.name1;
        yield pair.name2;
    }
}
/**
 * @param  {CharacterInfo[]} characters
 */
function findCharInfoByName(characters, targetName, titleName) {
    return Object.values(characters).find(charInfo => charInfo.name === targetName && charInfo.series.includes(titleName));
}
/**
 * @param  {CharacterInfo[]} characters
 */
function initMain(characters) {
    g_appData.initMainImpl(
        characters,
        [
            "/db/feh-original_heroes.sqlite3",
            "/db/fe-the-sacred-stones.sqlite3"
        ],
        db => {
            return createCharacterInfoListFromDb(db);
        },
        () => {
            g_appData.initGraph();
            g_appData.graphScale = 0.276;
            g_appData.__executeAllCommands();
            g_appData.__updateGraph();
        });
    document.addEventListener("keydown", e => keyDownEventBlazingBladeSupportGraph(g_appData, e));
}

/**
 * @param  {AppDataEx} appData
 */
function keyDownEventBlazingBladeSupportGraph(appData, event) {
    if (event.key === "Delete" && !appData.isEditingText) {
        event.preventDefault();
        appData.registerSelectedNodesToExcludeNodes();
    }
    else if (event.ctrlKey && event.key === 'z') {
        event.preventDefault();
        appData.undoCommand();
    }
    else if (event.ctrlKey && event.key === 'y') {
        event.preventDefault();
        appData.redoCommand();
    }
    else if (event.ctrlKey && event.key === 'g') {
        event.preventDefault();
        appData.groupSelectedNodes();
        appData.updateGraph(GraphElemId);
    }
    else if (event.ctrlKey && event.key === 'G') {
        event.preventDefault();
        appData.groupSelectedNodes(true);
        appData.updateGraph(GraphElemId);
    }
    else if (event.ctrlKey && event.key === 'u') {
        event.preventDefault();
        appData.ungroupSelectedNodes();
        appData.updateGraph(GraphElemId);
    }
    else if (event.ctrlKey && event.key === 'v') {
        event.preventDefault();
        appData.alignSelectedNodesVertical();
        appData.updateGraph(GraphElemId);
    }
    else if (event.ctrlKey && event.key === 'h') {
        event.preventDefault();
        appData.alignSelectedNodesHorizontal();
        appData.updateGraph(GraphElemId);
    }
}




