const NodeAndEdgePropDelim = "|^";
const ClusterPropDelim = "^|";
const GraphPropDelim = "|~";

const ImageFilter = {
    None: 0,
    GrayScale: 1
};

function boolToStr(value) {
    return value ? "1" : "0";
}
function strToBool(value) {
    return value != "0";
}

class GraphNodeBase {
    constructor(id) {
        /** エッジの接続に使用するノードのID @type {Number} */
        this.id = id;

        // d3.js で直接位置を指定するための座標
        this.x = 0;
        this.y = 0;

        this.radius = 3;
        this.text = "";

        this.isSelected = false;
        this.mouseOver = false;
    }

    setPos(x, y) {
        this.x = x;
        this.y = y;
    }
}

class GraphPoint extends GraphNodeBase {
    constructor(id) {
        super(id);
        this.radius = 5;
        this.fontSize = 13;
        this.fontColor = "#000";
    }

    toString() {
        return this.id
            + NodeAndEdgePropDelim + this.x
            + NodeAndEdgePropDelim + this.y
            + NodeAndEdgePropDelim + this.text
            + NodeAndEdgePropDelim + this.fontSize
            + NodeAndEdgePropDelim + this.fontColor
            + NodeAndEdgePropDelim + this.radius
            ;
    }

    /**
     * @param  {string} source
     */
    fromString(source) {
        const elems = source.split(NodeAndEdgePropDelim);
        let i = 0;
        this.id = elems[i++];
        this.x = Number(elems[i++]);
        this.y = Number(elems[i++]);
        if (i < elems.length) this.text = elems[i++];
        if (i < elems.length) this.fontSize = Number(elems[i++]);
        if (i < elems.length) this.fontColor = elems[i++];
        if (i < elems.length) this.radius = Number(elems[i++]);
    }
}

class GraphNode extends GraphNodeBase {
    constructor(id, name, displayName = "", imagePath = null, url = "") {
        super(id)

        /** ノードの名前 @type {string} */
        this.name = name;

        /** ノードの表示名 @type {string} */
        this.displayName = displayName == "" ? name : displayName;
        this.imagePath = imagePath;
        this.url = url;
        this.clusterName = "";

        this.isVisible = true;

        // select2用
        this.text = displayName;

        this.overrideName = "";

        this.radius = 50;

        this.imageFilter = ImageFilter.None;
    }

    get isClustered() {
        return this.clusterName != "" && this.clusterName != null;
    }

    /**
     * @returns {boolean}
     */
    get hasImage() {
        return this.imagePath != "" && this.imagePath != null;
    }

    toString() {
        return this.id
            + NodeAndEdgePropDelim + this.name
            + NodeAndEdgePropDelim + this.x
            + NodeAndEdgePropDelim + this.y
            + NodeAndEdgePropDelim + this.overrideName
            + NodeAndEdgePropDelim + this.imageFilter;
    }

    /**
     * @param  {string} source
     */
    fromString(source) {
        let elems = source.split(NodeAndEdgePropDelim);
        let i = 0;
        this.id = elems[i++];
        this.name = elems[i++];
        this.x = Number(elems[i++]);
        this.y = Number(elems[i++]);
        this.overrideName = elems[i++];
        this.imageFilter = i < elems.length ? elems[i++] : ImageFilter.None;
    }


    /**
     * @returns {string}
     */
    toDotSource() {
        if (!this.hasImage) {
            return `\"${this.name}\"[URL=\"${this.url}\", label=\"${this.displayName}\"];`;
        }

        let displayNameHtml = this.displayName
            .replaceAll("\n", "<br/>")
            .replaceAll("&", "&amp;");

        let label = "<table cellspacing='0' border='0' cellborder='0' >";
        label += `<tr><td><img src='${this.imagePath}' /></td></tr>`;
        label += `<tr><td>&nbsp;&nbsp;${displayNameHtml}&nbsp;&nbsp;</td></tr></table>`;

        return `\"${this.name}\"[URL=\"${this.url}\", label=<${label}>];`;
    }
}

let g_edgeId = 0;

class GraphEdge {
    constructor(id, source, destination, label, dir = "forward", rank = "") {
        this.id = id;
        this.source = source; // ノードid
        /** @type {GraphNode} */
        this.sourceNode = null;
        this.destination = destination; // ノードid
        /** @type {GraphNode} */
        this.destinationNode = null;

        /** @type {string} */
        this.label = label;
        this.labelOffsetX = 0;
        this.labelOffsetY = 0;
        this.rank = rank;
        this.isRankSame = false;
        this.dir = dir;
        this.lhead = "";
        this.additionalAttrs = "";
        this.minlen = 1;
        this.usesHeadLabel = false;
        this.labelPadding = ""; // エッジ同士のラベルが繋がらないようにする隙間

        this.strokeWidth = 2;
        this.strokeColor = "gray";

        // 定義済みのノードを使わずにテキストを直接入力するための設定
        this.sourceText = "";
        this.destinationText = "";
        this.usesSourceText = false;
        this.usesDestinationText = false;

        this.isSelected = false;
        this.mouseOver = false;

        this.isVisible = true;

        this.userData = null;
    }

    toString() {
        return this.source
            + NodeAndEdgePropDelim + this.destination
            + NodeAndEdgePropDelim + this.dir
            + NodeAndEdgePropDelim + this.label
            + NodeAndEdgePropDelim + this.id
            + NodeAndEdgePropDelim + this.strokeWidth
            ;
    }
    /**
     * @param  {string} source
     */
    fromString(source) {
        const elems = source.split(NodeAndEdgePropDelim);
        let i = 0;
        this.source = elems[i++];
        this.destination = elems[i++];
        this.dir = elems[i++];
        this.label = elems[i++];
        if (i < elems.length) this.id = elems[i++];
        if (i < elems.length) this.strokeWidth = Number(elems[i++]);
    }

    swapSourceAndDestination() {
        let source = this.source;
        this.source = this.destination;
        this.destination = source;
        switch (this.dir) {
            case "forward":
                this.dir = "back";
                break;
            case "back":
                this.dir = "forward";
                break;
        }
        let sourceText = this.destinationText;
        this.sourceText = this.destinationText;
        this.destinationText = sourceText;
    }

    copyFrom(edge) {
        this.id = edge.id;
        this.source = edge.source;
        this.destination = edge.destination;
        this.isRankSame = edge.isRankSame;
        this.label = edge.label;
        this.rank = edge.rank;
        this.dir = edge.dir;
        this.sourceText = edge.sourceText;
        this.destinationText = edge.destinationText;
        this.usesSourceText = edge.usesSourceText;
        this.usesDestinationText = edge.usesDestinationText;
    }

    get actualSource() {
        return this.usesSourceText ? this.sourceText : this.source;
    }

    get actualDestination() {
        return this.usesDestinationText ? this.destinationText : this.destination;
    }

    get isValid() {
        return this.isSourceValid && this.isDestinationValid;
    }

    get isSourceValid() {
        let actualSource = this.actualSource;
        return actualSource != NoneValue && actualSource != "";
    }

    get isDestinationValid() {
        let actualDestination = this.actualDestination;
        return actualDestination != NoneValue && actualDestination != "";
    }

    /**
     * @param  {string} dotSource
     */
    fromDotSource(dotSource) {
        // todo: rank に対応できていない
        let splittedElems = dotSource.split("[");
        if (0 < splittedElems.length && splittedElems.length < 3) {
            this.__parseSourceAndDestinationFromDotSource(splittedElems[0]);
            if (splittedElems.length == 2) {
                let attrs = splittedElems[1].replace("]", "");
                for (let elem of attrs.split(",").filter(x => x != "")) {
                    let attr = elem.trim();
                    let splittedAttr = attr.split("=");
                    if (splittedAttr.length != 2) {
                        throw new Error(`Invalid attribute. ${attr}`);
                    }
                    let name = splittedAttr[0];
                    let value = splittedAttr[1];
                    switch (name) {
                        case "label":
                            this.label = this.__trimStartAndEndDoubleQuate(value.trim());
                            break;
                        case "dir":
                            this.dir = this.__trimStartAndEndDoubleQuate(value.trim());
                            break;
                    }
                }
            }
        }
        else {
            throw new Error(`Invalid dot source. ${dotSource}`);
        }
    }

    /**
     * @param  {string} input
     */
    __trimStartAndEndDoubleQuate(input) {
        let result = input;
        if (result[0] == '"') {
            result = result.substring(1);
        }
        if (result[result.length - 1] == '"') {
            result = result.substring(0, result.length - 1);
        }
        return result;
    }

    /**
     * @param  {string} dotSource
     */
    __parseSourceAndDestinationFromDotSource(dotSource) {
        let splittedElems = dotSource.split("->");
        if (splittedElems.length != 2) {
            throw new Error(`Invalid dot source. ${dotSource}`);
        }
        this.source = this.__trimStartAndEndDoubleQuate(splittedElems[0].trim());
        this.destination = this.__trimStartAndEndDoubleQuate(splittedElems[1].trim());
    }

    /**
     * @returns {string}
     */
    toDotSource() {
        let source = this.actualSource;
        let destination = this.actualDestination;
        let dir = this.dir == null || this.dir == "" ? "" : `,dir=${this.dir}`;
        const rank = this.isRankSame ? "same" : this.rank;
        let rankDot = rank == "" ? "" : `{rank=${rank};${this.source};${this.destination};}`;
        let labelType = "label";
        if (this.usesHeadLabel) {
            labelType = "headlabel";
        }
        let minlen = "";
        if (this.minlen != 1) {
            minlen = `,minlen=${this.minlen}`;
        }
        return `\"${source}\"->\"${destination}\"[${labelType}=\"${this.label}${this.labelPadding}\"${dir}${minlen}${this.additionalAttrs}];${rankDot}`;
    }
}


function darkenColor(hex, percent) {
    // 入力された16進数の色コードをRGBの値に変換する
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    // 暗くする割合を計算する
    let darkenAmount = 1 - percent / 100;

    // RGBの値を暗くする
    r = Math.floor(r * darkenAmount);
    g = Math.floor(g * darkenAmount);
    b = Math.floor(b * darkenAmount);

    // RGBの値を16進数の文字列に変換する
    r = (r < 16 ? '0' : '') + r.toString(16);
    g = (g < 16 ? '0' : '') + g.toString(16);
    b = (b < 16 ? '0' : '') + b.toString(16);

    // 新しい色を返す
    return `#${r}${g}${b}`;
}

function multiplyHsv(hexColor, hueFactor, saturationFactor, valueFactor) {
    const rgb = hexToRgb(hexColor);
    const hsv = rgbToHsv(rgb);
    const h = hsv[0];
    const s = hsv[1];
    const v = hsv[2];
    hsv[0] = Math.max(0, Math.min(1, h * hueFactor));
    hsv[1] = Math.max(0, Math.min(1, s * saturationFactor));
    hsv[2] = Math.max(0, Math.min(1, v * valueFactor));
    const newRgb = hsvToRgb(hsv);
    const newHex = rgbToHex(newRgb);
    return newHex;
}

function hexToRgb(hex) {
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);
    return [r, g, b];
}

function rgbToHex(color) {
    let r = color[0];
    let g = color[1];
    let b = color[2];
    r = (r < 16 ? '0' : '') + r.toString(16);
    g = (g < 16 ? '0' : '') + g.toString(16);
    b = (b < 16 ? '0' : '') + b.toString(16);

    // 新しい色を返す
    return `#${r}${g}${b}`;
}
function rgbToHsv(color) {
    let r = color[0] / 255;
    let g = color[1] / 255;
    let b = color[2] / 255;

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h, s, v = max;

    let d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
        h = 0; // achromatic
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, v];
}

function hsvToRgb(hsv) {
    let h = hsv[0];
    let s = hsv[1];
    let v = hsv[2];

    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);

    let mod = i % 6;
    let r = Math.floor([v, q, p, p, t, v][mod] * 255);
    let g = Math.floor([t, v, v, q, p, p][mod] * 255);
    let b = Math.floor([p, p, t, v, v, q][mod] * 255);

    return [r, g, b];
}

const ClusterLabelPosition = {
    Top: 0,
    Center: 1,
    Bottom: 3,
};

const ArrayElemDelim = "|,";
class GraphCluster {
    constructor(name, label) {
        this.name = String(name);
        /** @type {string} */
        this.label = label;
        this.labelPosition = ClusterLabelPosition.Bottom;
        this.color = "#ddddee";

        /** @type {GraphNode[]} */
        this.belongingNodes = [];

        /** @type {string[]} */
        this.belongingNodeIds = [];

        this.isSelected = false;

        // 描画用に設定するためのプロパティ(保存の必要なし)
        this.x = 0;
        this.y = 0;
        this.width = 1;
        this.height = 1;
        this.widthOffset = 0;
        this.heightOffset = 0;
        this.paddingTop = 30;
        this.paddingLeft = 10;
        this.paddingRight = 10;
        this.paddingBottom = 30;
        this.labelColor = "#fff";
        this.labelShadowColor = "#000";

        this.setColor(this.color);
    }

    getActualWidth() {
        return this.width + Number(this.widthOffset);
    }
    getActualHeight() {
        return this.height + Number(this.heightOffset);
    }
    getActualPosX() {
        return this.x - Number(this.widthOffset) / 2;
    }
    getActualPosY() {
        return this.y - Number(this.heightOffset) / 2;
    }

    setColor(color) {
        this.color = color;
        this.setLabelColorAuto();
    }

    setLabelColorAuto() {
        this.labelColor = multiplyHsv(this.color, 1, 2, 1);
        // this.labelShadowColor = darkenColor(this.labelColor, 90);
        this.labelShadowColor = "#000000";
    }

    get id() {
        return this.name;
    }

    get subgraphName() {
        // dot言語の中ではclusterプレフィックスが必要
        return "cluster" + this.name;
    }
    /**
     * @param  {GraphNode[]} nodes
     */
    addNodes(nodes) {
        for (const node of nodes) {
            node.clusterName = this.name;
            this.belongingNodes.push(node);
        }
        this.transformByBelongingNodes();
    }

    removeNode(node) {
        let index = this.belongingNodes.indexOf(node);
        this.belongingNodes.splice(index, 1);
    }

    clearBelongingNodes() {
        for (const node of this.belongingNodes) {
            node.clusterName = "";
        }
        this.belongingNodes = [];
        this.transformByBelongingNodes();
    }

    /**
     * @param  {string} source
     */
    fromString(source) {
        let elems = source.split(ClusterPropDelim);
        let i = 0;
        this.name = elems[i++];
        this.label = elems[i++];
        this.color = elems[i++];
        let nodesString = elems[i++];
        this.belongingNodes = [];
        this.belongingNodeIds = [];
        if (nodesString != undefined) {
            for (const nodeId of nodesString.split(ArrayElemDelim)) {
                this.belongingNodeIds.push(nodeId);
            }
        }
        if (i < elems.length) this.labelPosition = Number(elems[i++]);
        if (i < elems.length) this.widthOffset = Number(elems[i++]);
        if (i < elems.length) this.heightOffset = Number(elems[i++]);
        this.setLabelColorAuto();
    }

    /**
     * @returns {string}
     */
    toString() {
        let result = "";
        result += this.name + ClusterPropDelim;
        result += this.label + ClusterPropDelim;
        result += this.color + ClusterPropDelim;
        {
            for (let node of this.belongingNodes) {
                result += node.id + ArrayElemDelim;
            }
            result = result.substring(0, result.length - ArrayElemDelim.length) + ClusterPropDelim;
        }
        result += this.labelPosition + ClusterPropDelim;
        result += this.widthOffset + ClusterPropDelim;
        result += this.heightOffset;
        // 末尾に ClusterPropDelim を入れてしまうと、|| になってしまい、別の区切り文字と誤認される。
        // 本当は区切り文字を見直すべき
        return result;
    }

    transformByBelongingNodes() {
        let minPosX = 10000;
        let minPosY = 10000;
        let maxPosX = -10000;
        let maxPosY = -10000;
        for (const node of this.belongingNodes) {
            minPosX = Math.min(node.x - node.radius, minPosX);
            minPosY = Math.min(node.y - node.radius, minPosY);
            maxPosX = Math.max(node.x + node.radius, maxPosX);
            maxPosY = Math.max(node.y + node.radius, maxPosY);
        }

        this.x = minPosX - this.paddingLeft;
        this.y = minPosY - this.paddingTop;
        this.width = maxPosX - minPosX + this.paddingLeft + this.paddingRight;
        this.height = maxPosY - minPosY + this.paddingTop + this.paddingBottom;
    }
}

class GraphComment {
    constructor(id, text) {
        this.id = id;
        this.elemId = `GraphComment-${id}`;
        this.text = text;
        this.x = 0;
        this.y = 0;
        this.isSelected = false;
        this.fontSize = 13;
        this.padding = 5;
        this.fontColor = "#000";
        this.isBackgroundColorEnabled = true;
        this.backgroundColor = "#ffdbc2";
    }

    setPos(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * @returns {string}
     */
    toString() {
        return this.text
            + NodeAndEdgePropDelim + this.x
            + NodeAndEdgePropDelim + this.y
            + NodeAndEdgePropDelim + this.fontSize
            + NodeAndEdgePropDelim + this.fontColor
            + NodeAndEdgePropDelim + this.id
            + NodeAndEdgePropDelim + boolToStr(this.isBackgroundColorEnabled)
            + NodeAndEdgePropDelim + this.backgroundColor
            ;
    }

    /**
     * @param  {string} source
     */
    fromString(source) {
        let elems = source.split(NodeAndEdgePropDelim);
        let i = 0;
        this.text = elems[i++];
        this.x = Number(elems[i++]);
        this.y = Number(elems[i++]);
        if (i >= elems.length) return;
        this.fontSize = Number(elems[i++]);
        if (i >= elems.length) return;
        this.fontColor = elems[i++];
        if (i < elems.length) this.id = elems[i++];
        if (i < elems.length) this.isBackgroundColorEnabled = strToBool(elems[i++]);
        if (i < elems.length) this.backgroundColor = elems[i++];
    }
}

class Graph {
    constructor() {
        /** @type {GraphNode[]} */
        this.nodes = [];

        /** @type {GraphNodeBase[]} */
        this.nodeBases = [];

        /** @type {Map<Number, GraphNode>} */
        this.idToNodes = {};
        /** @type {Map<string, GraphNode>} */
        this.nameToNodes = {};

        /** @type {GraphEdge[]} */
        this.edges = [];

        /** @type {GraphComment[]} */
        this.comments = [];

        /** @type {GraphPoint[]} */
        this.points = [];

        /** @type {GraphCluster[]} */
        this.clusters = [];
        this.layout = "dot";
        this.rankdir = "BT";
    }

    clear() {
        this.nodes = [];
        this.nodeBases = [];
        this.edges = [];
        this.comments = [];
        this.points = [];
        this.clusters = [];
        this.idToNodes = {};
        this.nameToNodes = {};
        this.layout = "dot";
        this.rankdir = "BT";
    }

    toString() {
        return this.layout
            + GraphPropDelim + this.rankdir
            + GraphPropDelim + this.nodes.map(x => x.toString()).join(";")
            + GraphPropDelim + this.edges.map(x => x.toString()).join(";")
            + GraphPropDelim + this.clusters.map(x => x.toString()).join(";")
            + GraphPropDelim + this.comments.map(x => x.toString()).join(";")
            + GraphPropDelim + this.points.map(x => x.toString()).join(";")
            ;
    }

    /**
     * @param  {string} source
     */
    fromString(source) {
        this.clear();
        const elems = source.split(GraphPropDelim);
        let i = 0;
        this.layout = elems[i++];
        this.rankdir = elems[i++];
        const nodesStr = elems[i++];
        if (nodesStr != undefined && nodesStr != "") {
            for (const nodeStr of nodesStr.split(";")) {
                const node = new GraphNode(-1, "");
                node.fromString(nodeStr);
                this.addNode(node);
            }
        }
        const edgesStr = elems[i++];

        const clustersStr = elems[i++];
        if (clustersStr != undefined && clustersStr != "") {
            for (const clusterStr of clustersStr.split(";")) {
                const cluster = new GraphCluster("", "");
                cluster.fromString(clusterStr);
                this.clusters.push(cluster);
                for (const nodeId of cluster.belongingNodeIds) {
                    const node = this.nodes.find(x => x.id == nodeId);
                    if (node != null) {
                        cluster.belongingNodes.push(node);
                        node.clusterName = cluster.name;
                    }
                }

                cluster.transformByBelongingNodes();
            }
        }
        let commentId = 0;
        const commentsStr = elems[i++];
        if (commentsStr != undefined && commentsStr != "") {
            for (const commentStr of commentsStr.split(";")) {
                const comment = new GraphComment(commentId++, "");
                comment.fromString(commentStr);
                this.addComment(comment);
            }
        }
        const pointsStr = elems[i++];
        if (pointsStr != undefined && pointsStr != "") {
            for (const pointStr of pointsStr.split(";")) {
                const point = new GraphPoint(-1);
                point.fromString(pointStr);
                this.addPoint(point);
            }
        }

        // エッジは最後に作らないと接続ノードがまだ作られてなくて失敗する
        if (edgesStr != undefined && edgesStr != "") {
            for (const edgeStr of edgesStr.split(";")) {
                const edge = new GraphEdge(-1, "", "");
                edge.fromString(edgeStr);
                this.addEdge(edge);
            }
        }
    }

    /**
     * @param  {GraphNode} node
     */
    addNode(node) {
        this.nodes.push(node);
        this.nodeBases.push(node);
        this.idToNodes[node.id] = node;
        this.nameToNodes[node.name] = node;
    }

    /**
     * @param  {GraphEdge} edge
     */
    addEdge(edge) {
        edge.sourceNode = edge.source in this.idToNodes ? this.idToNodes[edge.source] : null;
        edge.destinationNode = edge.destination in this.idToNodes ? this.idToNodes[edge.destination] : null;
        if (edge.sourceNode == null) {
            edge.source = -1;
        }
        if (edge.destinationNode == null) {
            edge.destination = -1;
        }
        this.edges.push(edge);
    }

    addComment(comment) {
        this.comments.push(comment);
    }

    addPoint(node) {
        this.points.push(node);
        this.nodeBases.push(node);
        this.idToNodes[node.id] = node;
    }

    /**
     * @param  {GraphCluster} cluster
     * @param  {GraphNode[]} nodes
     */
    addCluster(cluster, nodes) {
        if (!this.clusters.includes(cluster)) {
            this.clusters.push(cluster);
        }

        for (const node of nodes) {
            if (!this.nodes.includes(node)) {
                throw new Error(`${node.name} is not added to graph`);
            }
        }

        cluster.addNodes(nodes);
    }

    removeNode(node) {
        this.nodes.splice(this.nodes.indexOf(node), 1);
        this.nodeBases.splice(this.nodeBases.indexOf(node), 1);
        delete this.idToNodes[node.id];
        delete this.nameToNodes[node.name];
        for (const cluster of this.clusters) {
            const index = cluster.belongingNodes.indexOf(node);
            if (index >= 0) {
                cluster.belongingNodes.splice(index, 1);
            }
        }
    }
    removePoint(node) {
        this.points.splice(this.points.indexOf(node), 1);
        this.nodeBases.splice(this.nodeBases.indexOf(node), 1);
        delete this.idToNodes[node.id];
    }
    removeEdge(edge) {
        this.edges.splice(this.edges.indexOf(edge), 1);
    }

    removeComment(comment) {
        this.comments.splice(this.comments.indexOf(comment), 1);
    }
    /**
     * @param  {GraphCluster} cluster
     */
    removeCluster(cluster) {
        for (const node of this.nodes) {
            if (node.clusterName == cluster.name) {
                node.clusterName = "";
            }
        }
        this.clusters.splice(this.clusters.indexOf(cluster), 1);
    }

    /**
     * 存在しないノードを参照するエッジを削除します
     */
    removeInvalidEdges() {
        const invalidEdges = Array.from(this.edges.filter(
            edge => !(edge.source in this.idToNodes) || !(edge.destination in this.idToNodes)));
        for (const edge of invalidEdges) {
            this.removeEdge(edge);
        }
    }

    removeEmptyClusters() {
        for (const cluster of this.clusters.filter(x => x.belongingNodes.length == 0)) {
            this.removeCluster(cluster);
        }
    }

    updateDictionaries() {
        this.idToNodes = {};
        this.nameToNodes = {};
        for (let node of this.nodeBases) {
            this.idToNodes[node.id] = node;
            if (node instanceof NodeGraph) {
                this.nameToNodes[node.name] = node;
            }
        }
    }

    updateClusterTransform() {
        for (const cluster of this.clusters) {
            cluster.transformByBelongingNodes();
        }
    }

    /**
     * @returns {string[]}
     */
    enumerateImagePaths() {
        return this.nodes.filter(x => x.hasImage).map(x => x.imagePath);
    }
    /**
     * @returns {Object.<string, GraphNodeBase[]>}
     */
    __getClusteredNodes() {
        let clusteredNodes = {};
        clusteredNodes[""] = [];
        for (let cluster of this.clusters) {
            clusteredNodes[cluster.name] = [];
        }

        for (let node of this.nodes) {
            if (node.clusterName in clusteredNodes) {
                clusteredNodes[node.clusterName].push(node);
            }
        }
        return clusteredNodes;
    }

    __getCluster(name) {
        for (let cluster of this.clusters) {
            if (cluster.name == name) {
                return cluster;
            }
        }
        return null;
    }


    /**
     * @returns {string}
     */
    toDotSource() {
        let dotSource = "";
        dotSource += "\n// ノード定義\n";

        // クラスターに定義された順番にするために最初にノード名だけ定義
        for (const cluster of this.clusters) {
            for (const node of cluster.belongingNodes) {
                if (node.name != NoneValue) {
                    dotSource += `"${node.name}";\n`;
                }
            }
        }

        const clusteredNodes = this.__getClusteredNodes();
        for (const clusterName of Object.keys(clusteredNodes)) {
            const nodes = clusteredNodes[clusterName];
            if (clusterName != "") {
                const cluster = this.__getCluster(clusterName);
                dotSource += `subgraph ${cluster.subgraphName} {\n`;
                dotSource += `label="${cluster.label}";\n`;
                dotSource += `bgcolor="${cluster.color}";\n`;
            }

            for (const node of nodes) {
                dotSource += node.toDotSource() + "\n";
            }

            if (clusterName != "") {
                dotSource += `}\n`;
            }
        }
        dotSource += "\n// エッジ定義\n";
        for (const sourceEdge of this.edges) {
            const edge = sourceEdge;

            // clusterへのエッジ用の対応
            {
                const sourceCluster = this.__getCluster(edge.actualSource);
                const destinationCluster = this.__getCluster(edge.actualDestination);
                if (sourceCluster != null || destinationCluster != null) {
                    edge = new GraphEdge(-1);
                    edge.copyFrom(sourceEdge);

                    // clusterだとラベルが見づらくなる問題の対策
                    // edge.usesHeadLabel = true;
                    edge.minlen = 2;
                }
                if (sourceCluster != null) {
                    edge.usesSourceText = false;
                    const centerIndex = Math.floor(sourceCluster.belongingNodes.length / 2);
                    edge.source = sourceCluster.belongingNodes[centerIndex].name;
                    edge.additionalAttrs += `,ltail="${sourceCluster.subgraphName}"`;
                }
                if (destinationCluster != null) {
                    edge.usesDestinationText = false;
                    const centerIndex = Math.floor(destinationCluster.belongingNodes.length / 2);
                    edge.destination = destinationCluster.belongingNodes[centerIndex].name;
                    edge.additionalAttrs += `,lhead="${destinationCluster.subgraphName}"`;
                }
            }

            const cluster = edge.isRankSame ? this.__getEdgeCluster(edge) : null;
            if (cluster != null) {
                dotSource += `subgraph ${cluster.subgraphName} {\n`;
            }
            dotSource += edge.toDotSource() + "\n";
            if (cluster != null) {
                dotSource += `}\n`;
            }
        }

        return `digraph  {
compound=true;
rankdir=\"${this.rankdir}\";
graph[layout=${this.layout}];
node [shape=rect,fontname=\"times\", fontsize=\"10\", fillcolor=\"2\",style=\"filled\",colorscheme=\"blues4\"];
edge [fontsize=\"12\"];
${dotSource}
}`;
    }
    /**
     * @param  {GraphEdge} edge
     * @returns {GraphCluster}
     */
    __getEdgeCluster(edge) {
        const sourceNode = this.nodes.find(x => x.name == edge.source);
        if (sourceNode != null && sourceNode.clusterName != "") {
            return this.__getCluster(sourceNode.clusterName);
        }
        const destNode = this.nodes.find(x => x.name == edge.destination);
        if (destNode != null && destNode.clusterName != "") {
            return this.__getCluster(destNode.clusterName);
        }
        return null;
    }
}



function initNodeLayout(nodes) {
    const xCount = 6;
    let nodeIndex = 0;
    for (const node of nodes) {
        const x = nodeIndex % xCount;
        const y = Math.floor(nodeIndex / xCount);
        const isXOdd = x % 2 == 0;
        const addY = isXOdd ? 65 : 0;
        node.setPos(100 + x * 130, 300 + y * 130 + addY);
        ++nodeIndex;
    }
}

class SpringLayoutArgument {
    constructor(iterations = 500, repulsionForce = 1000, springLength = 100, springStiffness = 0.18, damping = 0.5, resetsLayout = true) {
        this.iterations = iterations; // 計算回数
        this.repulsionForce = repulsionForce; // 斥力の強さ
        this.springLength = springLength;      // バネの理想長
        this.springStiffness = springStiffness;   // バネの強さ
        this.damping = damping;           // 収束のための減衰係数
        this.resetsLayout = resetsLayout;
    }
}


/**
 * 初期配置をした上でバネモデルによる配置を適用します
 *
 * @param {NodeGraph[]} nodes 
 * @param {*} edges 
 * @param {SpringLayoutArgument} arg 
 * @param {number} [initRandomWidth=500] 
 * @param {number} [initRandomHeight=800] 
 */
function applySpringLayoutWithInitLayout(nodes, edges, arg, initRandom = false, initRandomWidth = 500, initRandomHeight = 800) {
    // 初期配置
    if (initRandom) {
        if (arg.resetsLayout) {
            // ノードの初期位置をランダムに設定
            nodes.forEach(node => {
                node.x = Math.random() * initRandomWidth;
                node.y = Math.random() * initRandomHeight;
            });
        }

        applySpringLayout(nodes, edges, arg);

        if (arg.resetsLayout) {
            // 中心に再配置（中央揃え）
            const centerX = initRandomWidth / 2;
            const centerY = initRandomHeight / 2;
            // let minX = -999999;
            // let minY = -999999;
            let avgX = 0, avgY = 0;
            for (const node of nodes) {
                avgX += node.x;
                avgY += node.y;

                // minX = Math.max(minX, node.x);
                // minY = Math.max(minY, node.y);
            }
            avgX /= nodes.length;
            avgY /= nodes.length;

            for (const node of nodes) {
                node.x += centerX - avgX;
                node.y += centerY - avgY;
                // node.x -= minX;
                // node.y -= minY;
            }
        }
    }
    else {
        if (arg.resetsLayout) {
            initNodeLayout(nodes);
        }
        applySpringLayout(nodes, edges, arg);
    }
}


/**
 * バネモデルによる配置を適用します
 *
 * @param {NodeGraph[]} nodes 
 * @param {*} edges 
 * @param {SpringLayoutArgument} arg 
 */
function applySpringLayout(nodes, edges, arg) {
    const iterations = arg.iterations;
    const repulsionForce = arg.repulsionForce; // 斥力の強さ
    const springLength = arg.springLength;      // バネの理想長
    const springStiffness = arg.springStiffness;   // バネの強さ
    const damping = arg.damping;           // 収束のための減衰係数

    for (let i = 0; i < iterations; i++) {
        // 力の初期化
        const forces = new Map(nodes.map(node => [node, { x: 0, y: 0 }]));

        // 斥力の計算
        for (let j = 0; j < nodes.length; j++) {
            for (let k = j + 1; k < nodes.length; k++) {
                const n1 = nodes[j];
                const n2 = nodes[k];
                const dx = n1.x - n2.x;
                const dy = n1.y - n2.y;
                const distSq = dx * dx + dy * dy + 0.01; // 0除算防止
                const force = repulsionForce / distSq;

                const fx = force * dx;
                const fy = force * dy;

                forces.get(n1).x += fx;
                forces.get(n1).y += fy;
                forces.get(n2).x -= fx;
                forces.get(n2).y -= fy;
            }
        }

        // 引力（バネ）による力
        for (const [n1, n2] of edges) {
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const force = springStiffness * (dist - springLength);

            const fx = force * (dx / dist);
            const fy = force * (dy / dist);

            forces.get(n1).x += fx;
            forces.get(n1).y += fy;
            forces.get(n2).x -= fx;
            forces.get(n2).y -= fy;
        }

        // 座標の更新
        for (const node of nodes) {
            const force = forces.get(node);
            node.x += damping * force.x;
            node.y += damping * force.y;
        }
    }

    // エッジ同士の重なりを減らす
    resolveEdgeCrossings(nodes, edges);

    // ノード同士の重なりをなくす
    resolveNodeOverlaps(nodes);
}

// 重なってるノードを重ならないよう再配置する
function resolveNodeOverlaps(nodes, options = {}) {
    const maxIterations = options.maxIterations || 100;
    const repulsionStrength = options.repulsionStrength || 0.5;
    const damping = options.damping || 0.5;
    const epsilon = options.epsilon || 0.01;

    const radiusOffset = 20; // エッジが見えるようにしたいので半径を少し大きくする

    for (let iter = 0; iter < maxIterations; iter++) {
        let moved = false;

        const forces = new Map(nodes.map(n => [n, { x: 0, y: 0 }]));

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const n1 = nodes[i];
                const n2 = nodes[j];

                const dx = n2.x - n1.x;
                const dy = n2.y - n1.y;
                const distSq = dx * dx + dy * dy + epsilon;
                const dist = Math.sqrt(distSq);

                const minDist = (n1.radius + radiusOffset) + (n2.radius + radiusOffset);
                const overlap = minDist - dist;

                if (overlap > 0) {
                    // 重なっている → 強制反発
                    const force = repulsionStrength * overlap;

                    const fx = force * (dx / dist);
                    const fy = force * (dy / dist);

                    forces.get(n1).x -= fx;
                    forces.get(n1).y -= fy;
                    forces.get(n2).x += fx;
                    forces.get(n2).y += fy;

                    moved = true;
                }
            }
        }

        for (const node of nodes) {
            const f = forces.get(node);
            node.x += f.x * damping;
            node.y += f.y * damping;
        }

        if (!moved) break; // 収束
    }
}

// 重なってるエッジを検知して、エッジができるだけ重ならないようノードを再配置
function resolveEdgeCrossings(nodes, edges, options = {}) {
    if (nodes.length == 0) return;

    const node = nodes[0];

    const maxIterations = options.maxIterations || 10;
    const moveAmount = options.moveAmount || node.radius;
    const damping = options.damping || 0.3;
    const crossedEdgeCountLimit = 2;

    function edgesCross(e1, e2) {
        const [a, b] = e1;
        const [c, d] = e2;
        return edgesCrossImpl(a, b, c, d);
    }

    function edgesCrossImpl(a1, a2, b1, b2) {
        // 同じ端点を持つ場合は交差とみなさない（共有点）
        if (
            (a1 === b1 || a1 === b2 || a2 === b1 || a2 === b2)
        ) {
            return false;
        }

        // 2本の線分が交差しているかどうかをチェック（線分交差判定）
        function ccw(p1, p2, p3) {
            return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
        }

        return (
            ccw(a1, b1, b2) !== ccw(a2, b1, b2) &&
            ccw(a1, a2, b1) !== ccw(a1, a2, b2)
        );
    }

    function getCrossedEdgeCount(edges) {
        let count = 0;
        for (let i = 0; i < edges.length; i++) {
            for (let j = i + 1; j < edges.length; j++) {
                const e1 = edges[i];
                const e2 = edges[j];

                if (edgesCross(e1, e2)) {
                    ++count;
                }
            }
        }
        return count;
    }

    // 重なってるエッジがたくさんあるとどうしようもないので抜ける
    if (getCrossedEdgeCount(edges) > crossedEdgeCountLimit) return;

    for (let iter = 0; iter < maxIterations; iter++) {
        let moved = false;

        for (let i = 0; i < edges.length; i++) {
            for (let j = i + 1; j < edges.length; j++) {
                const e1 = edges[i];
                const e2 = edges[j];

                if (edgesCross(e1, e2)) {
                    const [a1, b1] = e1;
                    const [a2, b2] = e2;
                    console.log(`crossed: ${a1.displayName}-${b1.displayName}|${a2.displayName}-${b2.displayName}`);

                    // エッジの中点を求める
                    const mid1 = {
                        x: (a1.x + b1.x) / 2,
                        y: (a1.y + b1.y) / 2
                    };
                    const mid2 = {
                        x: (a2.x + b2.x) / 2,
                        y: (a2.y + b2.y) / 2
                    };

                    // 中点同士を引き離す方向にベクトルを求める
                    let dx = mid1.x - mid2.x;
                    let dy = mid1.y - mid2.y;
                    const dist = Math.hypot(dx, dy);

                    if (dist < 0.0001) continue; // 重なっている → 無視
                    dx /= dist;
                    dy /= dist;

                    // エッジの4つの端点をそれぞれ方向に動かす
                    const moveX = dx * moveAmount * damping;
                    const moveY = dy * moveAmount * damping;

                    a1.x += moveX;
                    a1.y += moveY;
                    b1.x += moveX;
                    b1.y += moveY;

                    a2.x -= moveX;
                    a2.y -= moveY;
                    b2.x -= moveX;
                    b2.y -= moveY;

                    moved = true;
                }
            }
        }

        if (!moved) break;
    }
}

