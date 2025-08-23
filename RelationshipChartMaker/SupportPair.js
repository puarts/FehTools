class SupportPair {
    constructor(name1, name2, pairEnd, increment) {
        this.name1 = name1;
        this.name2 = name2;
        this.pairEnd = pairEnd;
        this.increment = increment;
    }
}
/**
 * 初期配置をした上でバネモデルによる配置を適用します
 *
 * @param {NodeGraph[]} nodes 
 * @param {*} pairs 
 * @param {SpringLayoutArgument} arg 
 * @param {number} [initRandomWidth=500] 
 * @param {number} [initRandomHeight=800] 
 */
function layoutNodesBySpringModel(filterCharacters, pairs, arg, initRandom = false, initRandomWidth = 500, initRandomHeight = 800) {
    const nodes = filterCharacters;
    const nodeMap = new Map(nodes.map(node => [node.displayName, node]));
    const edges = [];

    // エッジの生成
    for (const pair of pairs) {
        const node1 = nodeMap.get(pair.name1);
        const node2 = nodeMap.get(pair.name2);
        if (node1 && node2) {
            edges.push([node1, node2]);
        }
    }
    applySpringLayoutWithInitLayout(nodes, edges, arg, initRandom, initRandomWidth, initRandomHeight);
}
