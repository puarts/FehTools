
const g_appData = new AppData();
const g_app = new Vue({
    el: "#app",
    data: g_appData,
});

/**
 * @param  {CharacterInfo[]} characters
 */
function initMain(characters) {
    g_appData.initMainImpl(
        characters,
        ["/db/feh-original_heroes.sqlite3"],
        db => {
            return createCharacterInfoListFromDb(db);
        },
        () => {
            // g_appData.currentTitle = "風花雪月";
            g_appData.currentTitle = AllTitleLabel;

            // フェリクス
            const node0 = new GraphNode(1, 851);
            node0.setPos(100, 300);

            // ロドリグ
            const node1 = new GraphNode(2, 880);
            node1.setPos(100, 100);

            // ディミトリ
            const node2 = new GraphNode(3, 844);
            node2.setPos(300, 300);

            // ランベール
            const node3 = new GraphNode(4, 891);
            node3.setPos(300, 100);

            const node4 = new GraphNode(5, 849);
            node4.setPos(200, 500);

            const point = new GraphPoint(6);
            point.setPos(200, 350);

            g_appData.addPoint(point);
            g_appData.addNode(node0);
            g_appData.addNode(node1);
            g_appData.addNode(node2);
            g_appData.addNode(node3);
            g_appData.addNode(node4);
            g_appData.addEdge(new GraphEdge(0, node0.id, node1.id, "父"));
            g_appData.addEdge(new GraphEdge(1, node2.id, node3.id, "父"));
            g_appData.addEdge(new GraphEdge(2, node0.id, node2.id, "幼馴染", "both"));
            {
                const comment = new GraphComment(AppData.estimateCommentId(g_appData.graph),
                    "これはコメントです\n複数行書けます");
                comment.setPos(100, 10);
                g_appData.addComment(comment);
            }
            g_appData.addEdge(new GraphEdge(3, point.id, node0.id, "", "none"));
            g_appData.addEdge(new GraphEdge(4, point.id, node2.id, "", "none"));
            g_appData.addEdge(new GraphEdge(5, point.id, node4.id, "先生"));
            {

                const cluster1 = g_appData.createCluster("子世代");
                cluster1.setColor("#ddddee");
                cluster1.labelPosition = ClusterLabelPosition.Top;
                g_appData.addCluster(cluster1, [node0, node2]);

                // ここで追加を実行しないとidがインクリメントしない
                g_appData.__executeAllCommands();

                const cluster2 = g_appData.createCluster("親世代");
                cluster2.setColor("#eedddd");
                g_appData.addCluster(cluster2, [node1, node3]);
            }

            g_appData.graphScale = 0.676;
            g_appData.__executeAllCommands();
            g_appData.updateGraph(GraphElemId);
        });
    document.addEventListener("keydown", e => keyDownEventImpl(g_appData, e));
}

