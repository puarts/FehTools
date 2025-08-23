
const GraphElemId = "graph";
const cookieKey = "feRelationshipChartMakerGraph";

function __isInRectanble(x, y, rectX, rectY, rectWidth, rectHeight) {
    return rectX <= x && x <= (rectX + rectWidth)
        && rectY <= y && y <= (rectY + rectHeight);
}

function getAlignedPosX(targetNode, x, nodes, threshold = 10000) {
    let alignX = x;
    let minDiffX = 100000;
    for (const node of nodes) {
        if (node === targetNode) continue;

        let diffX = Math.abs(node.x - alignX);
        if (diffX < threshold) {
            if (diffX < minDiffX) {
                minDiffX = diffX;
                alignX = node.x;
            }
        }
    }
    return alignX;
}

function getAlignedPosY(targetNode, y, nodes, threshold = 10000) {
    let alignY = y;
    let minDiffY = 100000;
    for (const node of nodes) {
        if (node === targetNode) continue;

        let diffY = Math.abs(node.y - alignY);
        if (diffY < threshold) {
            if (diffY < minDiffY) {
                minDiffY = diffY;
                alignY = node.y;
            }
        }
    }
    return alignY;
}

/**
 * @param  {GraphNode} targetNode
 * @param  {GraphNode[]} nodes
 */
function getAlignedPos(targetNode, x, y, nodes, threshold = 10000) {
    return [getAlignedPosY(targetNode, x, nodes, threshold), getAlignedPosY(targetNode, y, nodes, threshold)];
}

function toDataURLAsync(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        var reader = new FileReader();
        reader.onloadend = function () {
            callback(reader.result);
        }
        reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
}

// Worker上でしか使えない
function toDataUrlSync(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);  // `false` で同期リクエストになる
    xhr.send();

    if (xhr.status !== 200) {
        // 失敗
        throw new Error(`${url}の取得に失敗`);
    }

    var reader = new FileReaderSync();
    return reader.readAsDataURL(xhr.response);
}

const g_imagePathToDataCache = {};


function convertImageElementUrlToDataUrl(rootElement, endCallback) {
    let convertTargetUrls = [];
    for (let elem of rootElement.querySelectorAll("image")) {
        let url = elem.getAttribute("href");
        if (url in g_imagePathToDataCache) {
            let dataUrl = g_imagePathToDataCache[url];
            elem.setAttribute("href", dataUrl);
            continue;
        }

        if (url.startsWith(ThumbRoot)) {
            convertTargetUrls.push([url, elem]);
        }
    }

    toDataURLAsyncRecursive(convertTargetUrls, endCallback);
}

function toDataURLAsyncRecursive(convertTargetUrls, endCallback) {
    if (convertTargetUrls.length == 0) {
        endCallback();
        return;
    }
    let url = convertTargetUrls[0][0];
    toDataURLAsync(url, dataUrl => {
        console.log(`converting ${url}`);
        g_imagePathToDataCache[url] = dataUrl;
        let elem = convertTargetUrls[0][1];
        elem.setAttribute("href", dataUrl);

        convertTargetUrls.splice(0, 1);
        toDataURLAsyncRecursive(convertTargetUrls, endCallback);
    });
}


function str_replace(search, replace, subject) {
    return subject.replaceAll(search, replace);
}


function urlExists(url) {
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status != 404;
}

class TagInfo {
    constructor(id, name, displayName) {
        this.id = id;
        this.name = name;
        this.displayName = displayName;
    }
}


class FilterCategory {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.charInfos = [];
    }
}

const AllTitleLabel = "全て";
const NoneValue = -1;
const AreaValue = -2;
const DragonValue = -3;
const MonsterValue = -4;
const PropDelim = "||";
const ClusterIdOffset = 10000;



const EditMode = {
    Normal: 0,
    Comment: 1,
    Cluster: 2,
};

function createCharInfo(id, name, englishName, imageName) {
    return new CharacterInfo(
        id,
        name,
        englishName,
        imageName,
        [],
        [],
        "",
        [],
        "",
        false);
}

class AppData extends SqliteDatabase {
    constructor() {
        super();

        this.dbPaths = [];
        this.db = null;

        /** @type {Object.<string, CharacterInfo} */
        this.characters = {
            "-1": createCharInfo(
                NoneValue,
                "なし",
                "None",
                "Unknown.png"),
            "-2": createCharInfo(
                AreaValue,
                "地域",
                "Area",
                "Area.jpg"),
            "-3": createCharInfo(
                DragonValue,
                "竜",
                "Dragon",
                "Medeus_ShadowDragon.png"),
            "-4": createCharInfo(
                MonsterValue,
                "魔物",
                "Monster",
                "Bigl_The_Sacred_Stones.png"),
        };

        this.defaultCharOptions = this.__getDefaultCharOptions();

        /** 編集用のグラフ @type {Graph} */
        this.graph = new Graph();
        this.graph.layout = "";

        /** 描画用のグラフ @type {Graph} */
        this.displayGraph = new Graph();

        this.canvasWidth = 400;
        this.canvasHeight = 400;
        this.graphScale = 1.0;
        this.graphOffsetX = 0;
        this.graphOffsetY = 0;
        this.svgManager = new SvgManager();

        this.charOptions = [];
        this.titleOptions = [];

        this.currentTitle = AllTitleLabel;

        this.titleToCharOptions = {};
        this.titleToCharOptions[AllTitleLabel] = [];

        // this.nodeOptions = [];

        this.dirOptions = [
            { id: "none", text: "|" },
            { id: "forward", text: "↓" },
            { id: "back", text: "↑" },
            { id: "both", text: "↓↑" },
        ];

        this.layoutOptions = [
            { id: "", text: "自由配置(グループ未対応)" },
            { id: "dot", text: "階層配置" },
            { id: "circo", text: "環状配置(グループ未対応)" },

            // 実用性がないのでコメントアウト
            // { id: "neato", text: "ばねモデル配置1" },
            // { id: "fdp", text: "ばねモデル配置2" },
            // // { id: "sfdp", text: "ばねモデル配置3" }, // サポートされてない
            // { id: "twopi", text: "放射状配置" },
            // { id: "osage", text: "整列配置" },
            // { id: "patchwork", text: "パッチワーク配置" },
        ];

        this.rankdirOptions = [
            { id: "TB", text: "下向き" },
            { id: "BT", text: "上向き" },
            { id: "LR", text: "右向き" },
            { id: "RL", text: "左向き" },
        ];

        this.layout = "dot";
        this.rankdir = "BT";

        /** @type {GraphNode[]} */
        this.filterCharacters = [new GraphNode(-1, NoneValue)];

        /** @type {GraphNode[]} */
        this.excludeNodes = [];

        /** @type {FilterCategory[]} */
        this.filterCategories = [];
        this.idToCategoryDict = {};
        this.filterCategoryOptions = [];

        this.selectedCategoryId = NoneValue;

        this.showsAllCharacters = false;


        this.graphObject = null;
        this.addedImagePathDict = {};
        this.isNodeImageDisabled = false;
        this.isAutoUpdateEnabled = true;

        this.showsCluster = false;

        this.showsIsolatedNodes = true;
        this.isCookieEnabled = true;

        this.isDebugModeEnabled = false;

        this.isUpdateGraphEnabled = true;
        this.generatesNodesFromEdges = true;

        this.message = "";
        this.errorMessage = "";
        this.log = "";
        this.exportSettingUrl = "";
        this.tweetUrl = "";
        this.debugImportUrl = "";

        /** @type {GraphNodeBase[]} */
        this.selectedNodes = [];


        /** @type {GraphEdge[]} */
        this.selectedEdges = [];

        /** @type {GraphCluster[]} */
        this.selectedClusters = [];

        /** @type {GraphComment[]} */
        this.selectedComments = [];

        /** @type {GraphNode} */
        this.selectedNode = null;

        /** @type {GraphEdge} */
        this.selectedEdge = null;

        /** @type {GraphCluster} */
        this.selectedCluster = null;

        /** @type {GraphComment} */
        this.selectedComment = null;

        this.isNodeLabelEditingOnGraph = false;
        this.isNodeLabelEditing = false;
        this.isEdgeLabelEditing = false;
        this.isCommentEditing = false;
        this.isClusterLabelEditing = false;

        this.graphSettingText = "";

        this.commands = new CommandQueue();
        this.tempSerializedGraph = null;
    }

    removeOptionCharacters() {
        for (const key in this.characters) {
            if (parseInt(key) <= -2) {
                delete this.characters[key];
            }
        }

        for (let i = 0; i < this.defaultCharOptions.length; i++) {
            if (this.defaultCharOptions[i].id <= -2) {
                this.defaultCharOptions.splice(i, 1);
                i--;
            }
        }
    }

    findNode(id) {
        return this.graph.nodes.find(x => x.id == id);
    }

    __createCommand(id, label, func, serializedDataForUndo = null, commandType = CommandType.Normal, metaData = null) {
        let serializedTurn = serializedDataForUndo ?? this.graph.toString();
        let self = this;
        let command = new Command(
            id,
            label,
            function (input) {
                input[1]();
            },
            function (input) {
                if (input[1] != null) {
                    self.graph.fromString(input[1]);
                }
            },
            [label, func],
            [label, serializedTurn],
            commandType
        );
        return command;
    }

    get isEditingText() {
        return this.isNodeLabelEditing
            || this.isEdgeLabelEditing
            || this.isCommentEditing
            || this.isClusterLabelEditing;
    }

    createNewFilterCharacter() {
        this.filterCharacters.push(new GraphNode(-1, NoneValue));
    }

    removeFilterCharacter(value) {
        let index = this.filterCharacters.indexOf(value);
        this.filterCharacters.splice(index, 1);
    }

    updateTweetUrl() {
        const url = encodeURIComponent(this.exportSettingUrl);
        const text = encodeURIComponent("#FE人物相関図メーカー");
        const originalReferer = encodeURIComponent("https://fire-emblem.fun/");
        const refSrc = encodeURIComponent("twsrc^tfw|twcamp^buttonembed|twterm^share|twgr^");
        const uri = "https://twitter.com/intent/tweet?"
            + "original_referer=" + originalReferer
            + "&ref_src=" + refSrc
            + "&text=" + text
            + "&url=" + url;

        this.tweetUrl = uri;
    }

    toString() {
        return this.currentTitle
            + PropDelim + this.graph.toString()
            + PropDelim + this.graphScale
            + PropDelim + this.graphOffsetX
            + PropDelim + this.graphOffsetY
            ;
    }

    /**
     * @param  {string} source
     */
    fromString(source, edgeSetDelayMilliseconds = 0) {
        this.clear();

        let elems = source.split(PropDelim);
        let i = 0;
        this.currentTitle = elems[i++];

        {
            const graphStr = elems[i++];
            this.graph.fromString(graphStr);
            for (const node of this.graph.nodes) {
                this.updateNodeInfo(node);
            }
        }

        if (i < elems.length) this.graphScale = Number(elems[i++]);
        if (i < elems.length) this.graphOffsetX = Number(elems[i++]);
        if (i < elems.length) this.graphOffsetY = Number(elems[i++]);

        // this.rankdir = elems[i++];
        // let dotSource = elems[i++];
        // let clusterString = elems[i++];
        // if (clusterString != undefined) {
        //     this.__parseClusterString(clusterString);
        // }
        // let nodesString = elems[i++];
        // if (nodesString != undefined) {
        //     let nodeId = 0;
        //     for (const nodeString of nodesString.split(";")) {
        //         if (nodeString == "") {
        //             continue;
        //         }

        //         const node = new GraphNode(++nodeId, "");
        //         node.fromString(nodeString);
        //         this.addNode(node);
        //     }
        // }

        // // エッジはクラスターの後に変換する
        // if (edgeSetDelayMilliseconds == 0) {
        //     this.__parseDotSource(dotSource);
        // }
        // else {
        //     setTimeout(() => {
        //         // selectのオプションがビューに同期された後に実行しないと値が消えてしまうので
        //         // 苦肉の策で500ms待つ(初回のインポートに関しては、バインドのグラフ更新が
        //         // 行われないため、待ってしまうと、グラフが中途半端な状態で更新されてしまうので待てない)
        //         this.__parseDotSource(dotSource);
        //     }, edgeSetDelayMilliseconds);
        // }
    }

    clear() {
        this.graph.clear();
    }

    clearNodes() {
        const layout = this.graph.layout;
        this.graph.clear();
        this.graph.layout = layout;
        this.clearSelection();
    }
    undoCommand() {
        const selectedNodes = Array.from(this.selectedNodes);
        // d3.js 側で node.id で同ノード判定をしている都合、
        // 一回クリアして 3d.js 側のノードをリセットしないと、
        // 古いノードが残って誤動作する
        this.clearNodes();
        this.updateGraph(GraphElemId);

        this.commands.undo();
        this.__updateAllNodeInfos();

        for (const node of selectedNodes) {
            const targetNode = this.graph.nodes.find(x => x.id == node.id);
            if (targetNode != null) {
                this.selectAddNode(targetNode);
            }
        }

        this.updateGraph(GraphElemId);
    }

    redoCommand() {
        this.commands.redo();
        this.__updateAllNodeInfos();

        this.updateGraph(GraphElemId);
    }
    addNode(node) {
        const self = this;
        this.__enqueueCommand(`addNode-${node.id}`, () => {
            self.__addNode(node);
        });
    }
    addPoint(node) {
        this.__enqueueCommand(`addPoint-${node.id}`, () => {
            this.graph.addPoint(node);
        });
    }
    __addNode(node) {
        this.graph.addNode(node);
        this.updateNodeInfo(node);
    }
    addEdge(edge) {
        const self = this;
        this.__enqueueCommand(`addEdge-${edge.id}`, () => {
            self.graph.addEdge(edge);
        });
    }
    addComment(comment) {
        const self = this;
        this.__enqueueCommand(`addComment-${comment.id}`, () => {
            self.graph.addComment(comment);
        });
    }

    /**
     * @param  {GraphCluster} cluster
     * @param  {GraphNode[]} nodes
     */
    addCluster(cluster, nodes, removeFronOldCluster = true) {
        this.__enqueueCommand(`addCluster-${cluster.id}`, () => {
            // 既にどこかのクラスターに所属していたら、そこから削除
            if (removeFronOldCluster) {
                for (const node of nodes) {
                    if (node.clusterName != "") {
                        const oldCluster = this.graph.clusters.find(x => x.name == node.clusterName);
                        if (oldCluster != null) {
                            oldCluster.removeNode(node);
                        }
                    }
                    node.clusterName = "";
                }
            }
            this.graph.addCluster(cluster, nodes);
        });
    }
    /**
     * @param  {GraphCluster} cluster
     */
    removeCluserCommand(cluster) {
        this.__enqueueCommand(`removeCluster-${cluster.id}`, () => {
            this.graph.removeCluster(cluster);
        });
    }

    /**
     * @param  {GraphNode} node
     * @param  {} x
     * @param  {} y
     */
    moveNode(node, x, y, tempSerializedGraph = null) {
        this.__enqueueCommand(`moveNode-${node.id}`, () => {
            node.x = x;
            node.y = y;
            this.graph.updateClusterTransform();
        }, tempSerializedGraph);
    }

    moveComment(comment, x, y, tempSerializedGraph = null) {
        this.__enqueueCommand(`moveComment-${comment.id}`, () => {
            comment.x = x;
            comment.y = y;
        }, tempSerializedGraph);
    }
    beginEditClusterLabel(cluster) {
        this.isClusterLabelEditing = true;
        this.__saveCurrentGraphTemporary();
    }
    __endEditClusterLabel(cluster) {
        this.__enqueueCommand(`editCluster-${cluster.id}`, () => {
            cluster.label = cluster.label;
        }, this.tempSerializedGraph);
        this.__executeAllCommands();
    }
    beginEditEdgeLabel(edge) {
        this.isEdgeLabelEditing = true;
        this.__saveCurrentGraphTemporary();
    }

    __endEditEdgeLabel(edge) {
        this.__enqueueCommand(`editEdge-${edge.id}`, () => {
            edge.label = edge.label;
        }, this.tempSerializedGraph);
        this.__executeAllCommands();
    }
    beginEditComment(comment) {
        this.isCommentEditing = true;
        this.__saveCurrentGraphTemporary();
    }
    /**
     * @param  {GraphComment} comment
     */
    __endEditComment(comment) {
        const commentId = comment.id;
        if (comment.text == "") {
            // コメント入力後にコメントが空の時は削除扱い
            this.__enqueueCommand(`removeComment-${commentId}`, () => {
                const targetComment = this.graph.comments.find(x => x.id == commentId);
                this.graph.removeComment(targetComment);
            }, this.tempSerializedGraph);
        }
        else {
            const commentText = comment.text;
            this.__enqueueCommand(`editComment-${commentId}`, () => {
                const targetComment = this.graph.comments.find(x => x.id == commentId);
                targetComment.text = commentText;
            }, this.tempSerializedGraph);
        }
        this.__executeAllCommands();
    }

    __saveCurrentGraphTemporary() {
        this.tempSerializedGraph = this.graph.toString();
    }
    __enqueueCommand(label, func, serializedDataForUndo = null, commandType = CommandType.Normal) {
        let command = this.__createCommand("", label, func, serializedDataForUndo, commandType);
        this.__enqueueCommandImpl(command);
    }
    __enqueueCommandImpl(command) {
        this.commands.enqueue(command);
    }
    __executeAllCommands() {
        while (this.commands.length > 0) {
            this.commands.execute();
        }

        this.updateExportSettingUrl();
    }
    /**
     * @param  {GraphNode} node
     */
    updateNodeInfo(node) {
        if (!(node instanceof GraphNode)) return;

        if (node.name in this.characters) {
            const charInfo = this.characters[node.name];
            node.displayName = charInfo.displayName;
            node.text = node.displayName;
            node.imagePath = charInfo.imagePath;
        }
    }

    __updateAllNodeInfos() {
        for (const node of this.graph.nodes) {
            this.updateNodeInfo(node);
        }
    }

    /**
     * @param  {string} dotSource
     */
    __parseDotSource(dotSource) {
        for (let edgeDotSourceElem of dotSource.split(";")) {
            let edgeDotSource = edgeDotSourceElem.trim();
            if (edgeDotSource == "") {
                continue;
            }

            let edge = new GraphEdge(-1, NoneValue, NoneValue, "");
            edge.fromDotSource(edgeDotSource);
            this.graph.edges.push(edge);
        }
    }
    /**
     * @param  {string} source
     */
    __parseClusterString(source) {
        for (let clusterString of source.split(";")) {
            if (clusterString == "") {
                continue;
            }

            let cluster = new GraphCluster(
                this.__getClusterId(),
                this.__getClusterDefaultName());
            cluster.fromString(clusterString);
            this.__addNewCluster(cluster);
        }
    }

    /**
     * idでなく、名前で定義されたエッジをセットします。
     * @param  {GraphEdge[]} edges
     */
    setEdgesDefinedByName(edges) {
        let charNameToCharDict = {};
        for (let id of Object.keys(this.characters)) {
            let char = this.characters[id];
            charNameToCharDict[char.name] = char.id;
        }
        for (let edge of edges) {
            if (edge.source in charNameToCharDict) {
                edge.source = charNameToCharDict[edge.source];
            }
            if (edge.destination in charNameToCharDict) {
                edge.destination = charNameToCharDict[edge.destination];
            }
        }
        this.graph.edges = edges;
    }

    writeLogLine(message) {
        this.writeLog(message + "\n");
    }
    writeLog(message) {
        this.log += message;
    }
    writeErrorLine(message) {
        this.writeLog(message + "\n");
    }
    writeError(message) {
        this.log += "Error: " + message;
    }
    clearLog() {
        this.log = "";
    }

    init(characters, dbPaths, createCharacterInfosFromDbFunc, postInitFunc = null) {
        if (characters == null) {
            this.dbPaths = dbPaths;
            this.initDatabase(() => {
                this.db = this.dbs[0];
                const createdCharacters = createCharacterInfosFromDbFunc(this.db);
                this.updateCharacterInfos(createdCharacters);
                if (postInitFunc != null) {
                    postInitFunc();
                }
            });
        }
        else {
            this.updateCharacterInfos(characters);
            if (postInitFunc != null) {
                postInitFunc();
            }
        }
    }

    __getDefaultCharOptions() {
        const noneOption = { id: NoneValue, text: "なし" };
        const areaOption = { id: AreaValue, text: "地域" };
        const dragonOption = { id: DragonValue, text: "竜" };
        const monsterOption = { id: MonsterValue, text: "魔物" };
        return [noneOption, areaOption, dragonOption, monsterOption];
    }

    /**
     * @param  {CharacterInfo[]} characters
     */
    updateCharacterInfos(characters) {
        this.titleToCharOptions[AllTitleLabel] = Array.from(this.defaultCharOptions);
        let idToCharOption = {};
        let nameToCharOption = {};
        let redaudantIds = {};
        for (let charInfo of characters) {
            this.characters[charInfo.id] = charInfo;
            let option = { id: charInfo.id, text: charInfo.name };
            this.titleToCharOptions[AllTitleLabel].push(option);
            idToCharOption[charInfo.id] = option;

            if (charInfo.name in nameToCharOption) {
                let redaudantOption = nameToCharOption[charInfo.name];
                redaudantIds[redaudantOption.id] = redaudantOption;
                redaudantIds[option.id] = option;
            }
            nameToCharOption[charInfo.name] = option;
        }

        // 冗長な名前にはタイトル名を付与
        for (let id of Object.keys(redaudantIds)) {
            let option = idToCharOption[id];
            let charInfo = this.characters[id];
            option.text = option.text + `(${charInfo.series[0]})`;
        }

        for (let char of Object.values(this.characters)) {
            for (let title of char.series) {
                if (!(title in this.titleToCharOptions)) {
                    this.titleToCharOptions[title] = Array.from(this.defaultCharOptions);
                }
                this.titleToCharOptions[title].push(
                    idToCharOption[char.id]
                );
            }
        }

        for (let title of Object.keys(this.titleToCharOptions)) {
            this.titleOptions.push({ id: title, text: title });
        }
    }

    /**
     * @param  {TagInfo[]} tagInfos
     */
    createCategories(tagInfos) {
        let maxId = 0;
        let tagDict = {};
        for (let tagInfo of tagInfos) {
            tagDict[tagInfo.name] = new FilterCategory(tagInfo.id, tagInfo.displayName);
            maxId = Math.max(maxId, tagInfo.id);
        }

        let id = maxId + 1;
        for (let charInfo of Object.values(this.characters)) {
            for (let tag of charInfo.tags) {
                if (!(tag in tagDict)) {
                    tagDict[tag] = new FilterCategory(id++, tag);
                }
                tagDict[tag].charInfos.push(charInfo);
            }
        }
        this.filterCategories = Object.values(tagDict);
        this.filterCategoryOptions = Array.from(this.defaultCharOptions);
        console.log(this.filterCategoryOptions);
        for (let category of this.filterCategories) {
            this.idToCategoryDict[category.id] = category;
            this.filterCategoryOptions.push({ id: category.id, text: category.name });
        }
        console.log(this.idToCategoryDict);
        console.log(this.filterCategoryOptions);
    }

    duplicateEdge(edge) {
        let newEdge = this.createNewEdge();
        newEdge.copyFrom(edge);
    }

    createNewEdge() {
        return this.createNewEdge(NoneValue, NoneValue);
    }

    createNewEdge(source, destination) {
        const edge = new GraphEdge(AppData.estimateEdgeId(this.graph), source, destination, "");
        this.addEdge(edge);
        return edge;
    }

    removeEdge(edge) {
        let index = this.graph.edges.indexOf(edge);
        this.graph.edges.splice(index, 1);
    }
    /**
     * @param  {GraphEdge} edge
     */
    swapEdgeDirection(edge) {
        edge.swapSourceAndDestination();
    }

    createCluster(label) {
        let cluster = new GraphCluster(
            this.__getClusterId(),
            label);
        return cluster;
    }

    createNewCluster() {
        let cluster = new GraphCluster(
            this.__getClusterId(),
            this.__getClusterDefaultName());
        this.addEmptyNodeToCluster(cluster);
        this.__addNewCluster(cluster);
        return cluster;
    }

    __addNewCluster(cluster) {
        this.graph.clusters.push(cluster);
        this.__addClusterToOptions(cluster);
    }

    createClustersByCategories() {
        const colors = [
            "#FADBD8",
            "#EBDEF0",
            // "#D4E6F1",
            "#D1F2EB",
            "#F9E79F",
            "#EDBB99",
        ]
        let index = 0;
        let nodeId = 0;
        for (let category of this.filterCategories) {
            let cluster = new GraphCluster(
                this.__getClusterId(),
                category.name);
            cluster.color = colors[index % colors.length];
            ++index;
            this.graph.clusters.push(cluster);

            for (let charInfo of Object.values(this.characters)) {
                if (charInfo.tags.some(x => x == category.name)) {
                    cluster.belongingNodes.push(new GraphNode(nodeId++, charInfo.id));
                }
            }
        }

        // this.setClusterNodeFromTags();
    }

    // setClusterNodeFromTags() {
    //     for (let cluster of this.graph.clusters) {
    //         for (let charInfo of Object.values(this.characters)) {
    //             if (charInfo.tags.some(x => x == cluster.name)) {
    //                 cluster.belongingNodes.push(new GraphNode(charInfo.id));
    //             }
    //         }
    //     }
    // }

    /**
     * @param  {GraphCluster} cluster
     */
    syncClusterLabelToOption(cluster) {
        let option = this.__getClusterOptionInCharOptions(cluster);

        // ラベルを書き換えるだけでは反映されなかったので、オプション配列を書き換える
        let newOption = { id: cluster.name, text: cluster.label };
        for (let options of Object.values(this.titleToCharOptions)) {
            let index = options.indexOf(option);
            options.splice(index, 1, newOption);
        }
    }

    __getClusterOptionInCharOptions(cluster) {
        // 同じインスタンスのオプションが各タイトルに追加されているので一つだけから取得すればいい
        let options = this.titleToCharOptions[AllTitleLabel];
        for (let i = options.length - 1; i >= 0; --i) {
            let option = options[i];
            if (option.id == cluster.name) {
                return option;
            }
        }
        return null;
    }

    __addClusterToOptions(cluster) {
        let option = { id: cluster.name, text: cluster.label };
        for (let options of Object.values(this.titleToCharOptions)) {
            options.push(option);
        }
    }
    __removeClusterFromOptions(cluster) {
        let option = this.__getClusterOptionInCharOptions(cluster);
        for (let options of Object.values(this.titleToCharOptions)) {
            let index = options.indexOf(option);
            options.splice(index, 1);
        }
    }
    removeCluster(cluster) {
        let index = this.graph.clusters.indexOf(cluster);
        this.graph.clusters.splice(index, 1);
        this.__removeClusterFromOptions(cluster);
    }

    removeSelectedItems() {
        const selectedNodeIds = Array.from(this.selectedNodes.filter(x => x instanceof GraphNode).map(x => x.id));
        const selectedPointIds = Array.from(this.selectedNodes.filter(x => x instanceof GraphPoint).map(x => x.id));
        const selectedEdgeIds = Array.from(this.selectedEdges.map(x => x.id));
        const selectedCommentIds = Array.from(this.selectedComments.map(x => x.id));
        const selectedClusterIds = Array.from(this.selectedClusters.map(x => x.id));
        this.__enqueueCommand(`removeSelected`, () => {
            for (const nodeId of selectedNodeIds) {
                const node = this.graph.nodes.find(x => x.id == nodeId);
                this.graph.removeNode(node);
            }
            for (const nodeId of selectedPointIds) {
                const node = this.graph.points.find(x => x.id == nodeId);
                this.graph.removePoint(node);
            }
            for (const edgeId of selectedEdgeIds) {
                const edge = this.graph.edges.find(x => x.id == edgeId);
                this.graph.removeEdge(edge);
            }
            for (const commentId of selectedCommentIds) {
                const comment = this.graph.comments.find(x => x.id == commentId);
                this.graph.removeComment(comment);
            }
            for (const clusterId of selectedClusterIds) {
                const cluster = this.graph.clusters.find(x => x.id == clusterId);
                this.graph.removeCluster(cluster);
            }

            this.graph.removeInvalidEdges();
            this.graph.removeEmptyClusters();
            this.graph.updateClusterTransform();
        });
        this.__executeAllCommands();
        this.clearSelection();
    }

    /**
     * @param  {GraphCluster} cluster
     */
    addEmptyNodeToCluster(cluster) {
        cluster.belongingNodes.push(new GraphNode(-1, NoneValue));
    }

    removeNodeFromCluster(node, cluster) {
        let index = cluster.belongingNodes.indexOf(node);
        cluster.belongingNodes.splice(index, 1);
        node.clusterName = "";
    }

    __getClusterId() {
        let id = ClusterIdOffset + this.graph.clusters.length;
        while (this.__hasSameIdCluster(id)) {
            ++id;
        }
        return id;
    }

    __getClusterDefaultName() {
        let index = this.graph.clusters.length;
        let name = `グループ${index}`;
        while (this.__hasSameNameCluster(name)) {
            name = `グループ${++index}`;
        }
        return name;
    }

    __hasSameNameCluster(name) {
        for (let cluster of this.graph.clusters) {
            if (cluster.name == name) {
                return true;
            }
        }
        return false;
    }

    __hasSameIdCluster(id) {
        for (let cluster of this.graph.clusters) {
            if (cluster.id == id) {
                return true;
            }
        }
        return false;
    }

    beginEditNodeLabelOnGraph() {
        this.isNodeLabelEditingOnGraph = true;
        this.beginEditNodeLabel();
    }

    beginEditNodeLabel() {
        this.isNodeLabelEditing = true;
    }
    endEditNodeLabel() {
        this.isNodeLabelEditing = false;
        this.isNodeLabelEditingOnGraph = false;
    }
    endEditPointText() {
        if (!(this.selectedNode instanceof GraphPoint)) return;

        const nodeId = this.selectedNode.id;
        const text = this.selectedNode.text;
        this.__enqueueCommand(`editPointText-${nodeId}`, () => {
            const node = this.graph.points.find(x => x.id == nodeId);
            node.text = text;
        }, this.tempSerializedGraph);
        this.__executeAllCommands();
    }

    clearNodeSelection() {
        this.selectedNodes = [];
        this.selectedNode = null;
        for (const n of this.graph.nodeBases) {
            n.isSelected = false;
        }
        this.endEditNodeLabel();
    }
    endEditEdgeLabel() {
        if (this.isEdgeLabelEditing) {
            this.__endEditEdgeLabel(this.selectedEdge);
            this.isEdgeLabelEditing = false;
        }
    }
    clearEdgeSelection() {
        this.endEditEdgeLabel();

        this.selectedEdges = [];
        this.selectedEdge = null;
        for (const n of this.graph.edges) {
            n.isSelected = false;
        }
    }
    endEditClusterLabel() {
        if (this.isClusterLabelEditing) {
            this.__endEditClusterLabel(this.selectedCluster);
            this.isClusterLabelEditing = false;
        }
    }

    clearClusterSelection() {
        this.endEditClusterLabel();

        this.selectedClusters = [];
        this.selectedCluster = null;
        for (const n of this.graph.clusters) {
            n.isSelected = false;
        }
    }
    endEditComment() {
        if (this.isCommentEditing) {
            this.__endEditComment(this.selectedComment);
            this.isCommentEditing = false;
        }
    }
    clearCommentSelection() {
        this.endEditComment();
        this.selectedComments = [];
        this.selectedComment = null;
        for (const n of this.graph.comments) {
            n.isSelected = false;
        }
    }
    clearSelection() {
        this.clearNodeSelection();
        this.clearEdgeSelection();
        this.clearClusterSelection();
        this.clearCommentSelection();
    }

    selectSingleNode(targetNode) {
        this.clearSelection();
        this.selectAddNode(targetNode);
    }
    selectAddNode(targetNode) {
        if (this.selectedNodes.some(x => x == targetNode)) {
            return;
        }
        this.selectedNodes.push(targetNode);
        this.selectedNode = targetNode;
        targetNode.isSelected = true;
    }
    /**
     * @param  {GraphNode} targetNode
     */
    selectToggleNode(targetNode) {
        if (targetNode.isSelected) {
            let index = this.selectedNodes.indexOf(targetNode);
            this.selectedNodes.splice(index, 1);
            if (this.selectedNodes.length > 0) {
                this.selectedNode = this.selectedNodes[this.selectedNodes.length - 1];
            }
            else {
                this.selectedNode = null;
            }
            targetNode.isSelected = false;
        }
        else {
            this.selectAddNode(targetNode);
        }
    }

    selectSingleComment(targetComment) {
        this.clearSelection();
        this.selectedComments = [targetComment];
        this.selectedComment = targetComment;
        targetComment.isSelected = true;
    }

    selectSingleEdge(targetEdge) {
        this.clearSelection();
        this.selectedEdges = [targetEdge];
        this.selectedEdge = targetEdge;
        targetEdge.isSelected = true;
    }
    selectSingleCluster(targetCluster) {
        this.clearSelection();
        this.selectedClusters = [targetCluster];
        this.selectedCluster = targetCluster;
        targetCluster.isSelected = true;
    }


    selectByRectangle(rectX, rectY, rectWidth, rectHeight) {
        this.clearSelection();
        for (const node of this.graph.nodeBases.filter(x => __isInRectanble(x.x, x.y, rectX, rectY, rectWidth, rectHeight))) {
            this.selectAddNode(node);
        }

        // todo: エッジやクラスターの選択
    }


    toggleSelectNode(targetNode) {
        for (const node of this.graph.nodes.filter(x => x != targetNode)) {
            node.isSelected = false;
        }
        targetNode.isSelected = !targetNode.isSelected;
        this.selectedNodes = targetNode.isSelected ? [targetNode] : [];
    }

    ungroupSelectedNodes() {
        this.__enqueueCommand(`ungroupSelected`, () => {
            for (const node of this.selectedNodes.filter(x => x instanceof GraphNode)) {
                if (node.clusterName != "") {
                    const cluster = this.graph.clusters.find(x => x.name == node.clusterName);
                    this.removeNodeFromCluster(node, cluster);
                }
            }
        });
        this.__executeAllCommands();
    }

    alignSelectedNodesVertical() {
        if (this.selectedNodes.length == 0) return;
        this.__enqueueCommand(`alignSelectedNodesVertical`, () => {
            let alignValue = this.selectedNodes[this.selectedNodes.length - 1].y;
            for (const node of this.selectedNodes) {
                node.y = alignValue;
            }
            this.graph.updateClusterTransform();
        });
        this.__executeAllCommands();
    }

    alignSelectedNodesHorizontal() {
        if (this.selectedNodes.length == 0) return;
        this.__enqueueCommand(`alignSelectedNodesHorizontal`, () => {
            let alighValue = this.selectedNodes[this.selectedNodes.length - 1].x;
            for (const node of this.selectedNodes) {
                node.x = alighValue;
            }
            this.graph.updateClusterTransform();
        });
        this.__executeAllCommands();
    }

    groupSelectedNodes(forceNewCluster = false) {
        const targetNodes = Array.from(this.selectedNodes.filter(x => x instanceof GraphNode));
        if (targetNodes.length == 0) return;

        let clusteredNode = targetNodes.find(x => x.clusterName != "");
        let clusterName = clusteredNode != null ? clusteredNode.clusterName : null;
        let cluster = null;
        if (forceNewCluster || clusterName == null) {
            cluster = this.createCluster("新規グループ");
            clusterName = cluster.name;
            this.addCluster(cluster, targetNodes, !forceNewCluster);
        }
        else {
            cluster = this.graph.clusters.find(x => x.name == clusterName);
            if (cluster == null) {
                throw new Error(`cluster was not found. "${clusterName}"`);
            }

            if (targetNodes.every(x => x.clusterName == clusterName) && targetNodes.length == cluster.belongingNodes.length) {
                // 選択ノードがグループ内の全ノードと一致するなら、グループ化を解除
                this.removeCluserCommand(cluster);
            }
            else {
                this.addCluster(cluster, targetNodes);
            }
        }

        this.__executeAllCommands();
    }

    writeError(message) {
        this.errorMessage = message;
    }

    /**
     * @param  {GraphEdge[]} edges
     */
    __createNodes(edges) {
        const nodeNameToIdDict = {};
        let nodeId = 0;
        for (const edge of edges) {
            if (!(edge.source in nodeNameToIdDict)) {
                nodeNameToIdDict[edge.source] = nodeId;
                ++nodeId;
            }
            if (!(edge.destination in nodeNameToIdDict)) {
                nodeNameToIdDict[edge.destination] = nodeId;
                ++nodeId;
            }
        }

        const nodes = [];
        if (this.showsAllCharacters
            && this.selectedCategoryId == NoneValue
            && !this.filterCharacters.some(x => x.name != NoneValue)
        ) {
            for (let char of Object.values(this.characters)) {
                let imagePath = // "https://puarts.com" +
                    char.imagePath;
                if (this.isNodeImageDisabled) {
                    imagePath = "";
                }
                let node = new GraphNode(nodeNameToIdDict[char.id] ?? -1, char.id, char.displayName, imagePath, char.url);

                if (this.showsCluster) {
                    node.clusterName = this.getClusterName(node);
                }
                nodes.push(node);
            }

        }
        else {
            const idToCharInfoDict = {};
            if (this.showsCluster) {
                for (let cluster of this.graph.clusters) {
                    for (let node of cluster.belongingNodes) {
                        let charId = node.name;
                        if (charId != NoneValue) {
                            idToCharInfoDict[charId] = this.characters[charId];
                        }
                    }
                }
            }
            for (const edge of edges) {
                if (edge.isSourceValid && !edge.usesSourceText) {
                    let charId = edge.source;
                    if (charId in this.characters) {
                        idToCharInfoDict[charId] = this.characters[charId];
                    }
                }
                if (edge.isDestinationValid && !edge.usesDestinationText) {
                    let charId = edge.destination;
                    if (charId in this.characters) {
                        idToCharInfoDict[charId] = this.characters[charId];
                    }
                }
            }
            for (let char of Object.values(idToCharInfoDict)) {
                let imagePath = // "https://puarts.com" +
                    char.imagePath;
                if (this.isNodeImageDisabled) {
                    imagePath = "";
                }
                const node = new GraphNode(nodeNameToIdDict[char.id] ?? -1, char.id, char.displayName, imagePath, char.url);
                if (this.showsCluster) {
                    node.clusterName = this.getClusterName(node);
                }
                nodes.push(node);
            }
        }

        const nodeNames = {}
        for (const edge of edges) {
            if (edge.isSourceValid && edge.usesSourceText) {
                nodeNames[edge.sourceText] = null;
            }
            if (edge.isDestinationValid && edge.usesDestinationText) {
                nodeNames[edge.destinationText] = null;
            }
        }
        for (const name in nodeNames) {
            const node = new GraphNode(nodeId, name, name);
            nodes.push(node);
            ++nodeId;
        }

        return nodes;
    }

    /**
     * @param  {GraphNode} node
     */
    getClusterName(node) {
        for (let cluster of this.graph.clusters) {
            for (let clusterNode of cluster.belongingNodes) {
                if (clusterNode.name == node.name) {
                    return cluster.name;
                }
            }
        }
        return "";
    }

    __createEdges(edges) {
        let validEdges = [];
        for (let edge of edges) {
            if (edge.isValid) {
                validEdges.push(edge);
            }
        }
        return validEdges;
    }

    __getFilteredEdges() {
        let edges = [];
        // 描画するエッジをフィルタリング
        let filterCharDict = {};

        if (this.selectedCategoryId != NoneValue) {
            const category = this.idToCategoryDict[this.selectedCategoryId];
            for (let charInfo of category.charInfos) {
                filterCharDict[charInfo.id] = null;
            }
        }

        for (let char of this.filterCharacters) {
            if (char.name != NoneValue) {
                filterCharDict[char.name] = null;
            }
        }

        const excludeNodeNameDict = {};
        for (const node of this.excludeNodes) {
            excludeNodeNameDict[node.name] = null;
        }

        let isFilterEnabled = Object.keys(filterCharDict).length > 0;
        for (let edge of this.graph.edges.filter(x => x.isVisible)) {
            if (isFilterEnabled) {
                if (this.generatesNodesFromEdges) {
                    if (!(edge.source in filterCharDict) && !(edge.destination in filterCharDict)) {
                        continue;
                    }
                }
                else {
                    if (!(edge.source in filterCharDict) || !(edge.destination in filterCharDict)) {
                        continue;
                    }

                }
            }

            if (edge.source in excludeNodeNameDict || edge.destination in excludeNodeNameDict) {
                continue;
            }

            if (edge.strokeWidth == 0) continue;
            edges.push(edge);
        }
        return edges;
    }

    /**
     *  @param {GraphEdge[]} edges
     *  @param {GraphNode[]} nodes
     */
    __getFilteredNodes(edges, nodes) {
        const visibleNodes = Array.from(nodes.filter(x => x.isVisible));
        if (this.showsIsolatedNodes) {
            return visibleNodes;
        }

        const result = [];
        const nodeIdDict = {};
        for (const edge of edges) {
            nodeIdDict[edge.source] = null;
            nodeIdDict[edge.destination] = null;
        }
        for (const node of visibleNodes) {
            if (node.id in nodeIdDict) result.push(node);
        }

        return result;
    }

    /**
     * @param  {GraphNode} sourceNode
     * @param  {GraphNode} targetNode
     */
    static copyD3jsProps(sourceNode, targetNode) {
        targetNode.x = sourceNode.x;
        targetNode.y = sourceNode.y;
    }
    /**
     * @param  {GraphEdge[]} edges
     */
    __createGraphNodes(edges) {
        const newNodes = this.__createNodes(edges);

        const isNodeCountChanged = newNodes.length != this.graph.nodes.length;

        const reusedNodeIds = {};

        // d3.js 用のノードプロパティ(位置座標など)を引き継ぐ
        for (const node of newNodes) {
            // キャラ名が一致してるノードで引き継ぎ
            if (node.name in this.graph.nameToNodes) {
                const oldNode = this.graph.nameToNodes[node.name];
                AppData.copyD3jsProps(oldNode, node);
                console.log(`${node.name}(${oldNode.id}->${node.id}): keep params by name. ${node.x}, ${node.y}`);
                reusedNodeIds[node.id] = null;
                continue;
            }

            // ノード数に変化がなければ、ノードのキャラを変更しただけなので、
            // ノードIDで位置を引き継ぐ
            if (!isNodeCountChanged && node.id in this.graph.idToNodes) {
                const oldNode = this.graph.idToNodes[node.id];
                AppData.copyD3jsProps(oldNode, node);
                console.log(`${node.id}(${oldNode.name}->${node.name}): keep params by id. ${node.x}, ${node.y}`);
                reusedNodeIds[node.id] = null;
                continue;
            }
        }

        const nameToNode = {};
        const idToNode = {};
        for (const node of newNodes) {
            nameToNode[node.name] = node;
            idToNode[node.id] = node;
        }

        for (const node of this.graph.nodes) {
            if (node.name in nameToNode) continue;
            if (node.id in idToNode) continue;

            newNodes.push(node);
        }

        return newNodes;
    }

    __updateDisplayGraph() {
        const displayGraph = this.displayGraph;
        displayGraph.layout = this.graph.layout;
        displayGraph.rankdir = this.graph.rankdir;

        if (this.graph.layout == "") {
            displayGraph.edges = this.__getFilteredEdges();
            displayGraph.nodes = this.__getFilteredNodes(displayGraph.edges, this.graph.nodes);
            // displayGraph.nodes = this.graph.nodes;
            displayGraph.comments = this.graph.comments;
            displayGraph.points = this.graph.points;
            displayGraph.nodeBases = this.graph.nodeBases;
        }
        else {
            const edges = this.__getFilteredEdges();
            displayGraph.edges = this.__createEdges(edges);
            displayGraph.nodes = Array.from(this.__createGraphNodes(edges).filter(x => x.name != "-1"));
            // this.graph.nodes = displayGraph.nodes;
            // this.graph.updateDictionaries();
        }

        {
            let labelPadding = "";
            if (displayGraph.rankdir == "TB" || displayGraph.rankdir == "BT") {
                labelPadding = "   ";
            }
            for (const edge of displayGraph.edges) {
                edge.labelPadding = labelPadding;
            }
        }

        if (this.showsCluster) {
            displayGraph.clusters = Array.from(this.graph.clusters.filter(x => x.belongingNodes.length > 0));
        }

        return displayGraph;
    }

    updateGraph(graphElementId) {
        const graph = this.__updateDisplayGraph();
        this.__updateGraphImpl(graphElementId, graph);
    }

    /**
     * @param  {string} graphElementId
     * @param  {Graph} graph
     */
    __updateGraphImpl(graphElementId, graph, imageSize = 100) {
        this.updateMessage("グラフ更新中..");

        if (graph.layout == "") {
            updateGraphByD3js(this, graphElementId, graph, this.canvasWidth, this.canvasHeight);
            this.updateMessage("");
        }
        else {
            const area = document.getElementById(`${graphElementId}`);
            for (const node of area.childNodes) {
                if (node.nodeName != "svg") continue;
                area.removeChild(node);
            }

            AppData.__updateGraphByGraphviz(this, graphElementId, graph, imageSize);
        }

        if (this.isDebugModeEnabled) {
            const serial = this.toString();
            this.writeLogLine(serial);
        }
    }
    /**
     * @param  {Graph} graph
     */
    static estimateNodeId(graph) {
        let id = 0;
        while (graph.nodeBases.some(x => x.id == id)) ++id;
        return id;
    }
    /**
     * @param  {Graph} graph
     */
    static estimateCommentId(graph) {
        let id = 0;
        while (graph.comments.some(x => x.id == id)) ++id;
        return id;
    }
    /**
     * @param  {Graph} graph
     */
    static estimateEdgeId(graph) {
        let id = 0;
        while (graph.edges.some(x => x.id == id)) ++id;
        return id;
    }

    /**
     * @param  {Graph} graph
     */
    static estimateNodeName(graph) {
        let name = 0;
        do {
            if (graph.nodes.some(x => x.name == name)) {
                --name;
                continue;
            }
        } while (false);
        return name;
    }


    /**
     * @param  {AppData} self
     * @param  {string} graphElementId
     * @param  {Graph} graph
     */
    static __updateGraphByGraphviz(self, graphElementId, graph, imageSize) {
        const startTime = performance.now();

        let dotSource = graph.toDotSource();
        self.writeLogLine(dotSource);

        if (self.graphObject == null) {
            self.graphObject = d3.select(`#${graphElementId}`)
                .graphviz()
                .fade(false)
                .zoom(false);
        }

        let graphObject = self.graphObject;
        for (let path of graph.enumerateImagePaths()) {
            if (path.startsWith("data:")) {
                continue;
            }

            if (path in self.addedImagePathDict) {
                continue;
            }

            self.addedImagePathDict[path] = null;
            graphObject = graphObject.addImage(path, `${imageSize}px`, `${imageSize}px`);
        }
        graphObject
            .renderDot(dotSource)
            .on("end", () => {
                // self.clearMessage();
                const endTime = performance.now();
                const diff = endTime - startTime;
                self.updateMessage(`グラフ更新時間:${Math.round((diff / 1000) * 100) / 100} 秒`);
            });
    }


    updateMessage(message) {
        this.message = message;
    }

    clearMessage() {
        this.message = "";
    }
    *__enumerateDbPaths() {
        for (let path of this.dbPaths) {
            yield path;
        }
    }
    __initDatabaseTable() {
    }

    updateExportSettingUrl() {
        let settingText = this.toString();
        this.exportSettingUrl = BaseUrl + "s="
            + LZString.compressToEncodedURIComponent(settingText) + `#app`;

        this.updateTweetUrl();
    }

    updateUrl() {
        this.writeLogLine(`■URLの更新`);
        this.updateExportSettingUrl();
        this.writeLogLine("Tweet URL:" + this.tweetUrl);
    }

    updateGraphWithoutClearLog() {
        this.updateGraph(GraphElemId);
        this.updateUrl();
    }

    importGraph(source) {
        // 一回クリアしてグラフを更新しないと、d3.js の層で同IDのノードが残ってしまう。
        // 古いノードの id と、インポート後の新しいノードの id が同じで、かつ、
        // d3.js の層で指定してるキー関数で id を指定しているため、古いノードが消えずに残る。
        this.clearNodes();
        this.updateGraphWithoutClearLog();

        this.fromString(source);
        this.updateGraphWithoutClearLog();
    }

    exportGraph() {
        const compressed = LZString.compressToEncodedURIComponent(this.toString())
        this.graphSettingText = compressed;
    }
    loadFromCookie() {
        const compressed = readFromCookie(cookieKey);
        if (compressed == null) return false;
        const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
        this.writeLogLine("decompressed:" + decompressed);
        this.isUpdateGraphEnabled = false;
        this.importGraph(decompressed);
        this.isUpdateGraphEnabled = true;
        return true;
    }

    importUrl(url, edgeInitDelay = 0) {
        if (url == "" || url == null) {
            return;
        }

        this.writeLogLine(`■URLから設定をインポート`);
        this.writeLogLine("url:" + url);
        let splited = url.split("s=");
        if (splited.length != 2) {
            this.writeErrorLine(`invalid url "${url}"`);
            return;
        }

        let settingText = splited[1];
        let decompressed = LZString.decompressFromEncodedURIComponent(settingText);
        this.writeLogLine("decompressed:" + decompressed);
        this.isUpdateGraphEnabled = false;
        this.importGraph(decompressed);
        this.isUpdateGraphEnabled = true;

        // バインドされているので自動で更新されるが、
        // 初回だけそうではないので、明示的にグラフを更新する
        this.updateGraphWithoutClearLog();
    }

    __updateGraph() {
        if (!this.isUpdateGraphEnabled) {
            return;
        }

        console.log("updateGraph");
        this.clearLog();
        this.writeLogLine(`■グラフ更新`);
        this.updateGraphWithoutClearLog();
    }

    updateGraphAuto() {
        if (!this.isAutoUpdateEnabled) {
            return;
        }

        this.__updateGraph();
    }
    saveToCookie() {
        const compressed = LZString.compressToEncodedURIComponent(this.toString())
        writeToCookie(cookieKey, compressed);
        this.writeLogLine(`save: ${compressed}`);
    }

    initMainImpl(
        characters,
        dbPaths,
        createCharInfoFunc,
        initGraphFunc
    ) {
        this.init(characters, dbPaths, createCharInfoFunc, () => {
            if (!location.search.includes("s=")) {
                // クッキーから読み込み
                if (!this.isCookieEnabled || !this.loadFromCookie()) {
                    // 読めなかったらサンプルのグラフを設定
                    initGraphFunc();
                }
            }
            else {
                this.importUrl(location.search);
            }
        });
    }
}

Vue.component('edge-detail', function (resolve, reject) {
    resolve({
        props: ['value'],
        template: "#edge-detail-template"
    })
});


// select2 を使うためのVueコンポーネント
Vue.component('select2', {
    template: '<select><slot></slot></select>',
    props: {
        options: Array,
        value: Number,
    },

    mounted: function () {
        $(this.$el)
            // init select2
            .select2({ data: this.options })
            .val(this.value)
            .trigger('change')
            .on('change', (event) =>
                this.$emit('input', parseInt(event.target.value, 10))
            )
            .on('select2:close', event => {
                this.$emit('close', parseInt(event.target.value, 10))
            })
    },
    watch: {
        value: function (val) {
            $(this.$el).val(val).trigger('change');
        },
        // update options
        options: function (options) {
            let value = this.value;
            $(this.$el)
                .empty()
                .select2({ data: options })
                .val(value)
                .trigger('change');
        }
    },
    destroyed: function () {
        $(this.$el).off().select2('destroy')
    },
});




function svg2imageData(svgElement, successCallback, errorCallback) {
    let canvas = document.createElement('canvas');
    canvas.width = svgElement.width.baseVal.value;
    canvas.height = svgElement.height.baseVal.value;
    let ctx = canvas.getContext('2d');
    let image = new Image();
    image.onload = () => {
        ctx.drawImage(image, 0, 0, image.width, image.height);
        successCallback(canvas.toDataURL());
    };
    image.onerror = (e) => {
        errorCallback(e);
    };

    convertImageElementUrlToDataUrl(svgElement, () => {
        console.log(`convert finished. serialize svg.`);
        let svgData = new XMLSerializer().serializeToString(svgElement);
        let srcUri = 'data:image/svg+xml;charset=utf-8;base64,' + window.btoa(unescape(encodeURIComponent(svgData)));
        console.log("svg data uri:");
        console.log(srcUri);
        image.src = srcUri;
    });
}

function isLocalhost() {
    return window.location.hostname === 'localhost';
}
let BaseUrl = "https://fire-emblem.fun/?pid=1779&";
if (isLocalhost()) {
    BaseUrl = "http://localhost:5501/FehTools/RelationshipChartMaker/RelationshipChartMaker.html?";
}

function copyUrl() {
    var textarea = $("#urlTextArea")[0];
    textarea.select();
    textarea.setSelectionRange(0, 99999); /*For mobile devices*/
    document.execCommand("copy");
}

function keyDownEventImpl(appData, event) {
    if (event.key === "Delete" && !appData.isEditingText) {
        event.preventDefault();
        appData.removeSelectedItems();
        appData.updateGraph(GraphElemId);
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
