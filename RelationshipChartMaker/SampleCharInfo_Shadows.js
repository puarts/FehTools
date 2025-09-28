const charList = [
    new CharacterInfo(1505, 'メメ', 'Lumi', 'Lumi_Shadows.png', ['シャドウズ'], [], '', []),
    // new CharacterInfo(1506, 'ナーガ', 'Naga', '', ['シャドウズ'], [], '', []),
    // new CharacterInfo(1507, 'クルト', 'Kurt', 'Kurt_Shadows.png', ['シャドウズ'], ['アスト王国'], '光', []),
    // new CharacterInfo(1508, 'アルベルタ', 'Alberta', 'Aruberuta_Shadows.png', ['シャドウズ'], ['アスト王国'], '光', []),
    // new CharacterInfo(1509, 'サイ', 'Sai', 'Sai_Shadows.png', ['シャドウズ'], ['ナーガの眷属'], '光', []),
    new CharacterInfo(1510, 'ハティ', 'Hati', 'Hathi_Shadows.png', ['シャドウズ'], ['フェンリルの眷属'], '光', []),
    // new CharacterInfo(1511, 'ゴットホルト', 'Gotthold', 'Gothoruto_Shadows.png', ['シャドウズ'], ['アスト王国'], '光', []),
    // new CharacterInfo(1512, 'カリーナ', 'Carina', 'Karina_Shadows.png', ['シャドウズ'], ['アスト王国'], '光', []),
    // new CharacterInfo(1513, 'ザシャ', 'Zasha', 'Zasha_Shadows.png', ['シャドウズ'], ['アスト王国'], '光', []),
    // new CharacterInfo(1514, 'ローゼ', 'Rose', 'Roze_Shadows.png', ['シャドウズ'], ['ホルツ王国'], '光', []),
    // new CharacterInfo(1515, 'シア', 'Shea', 'Sia_Shadows.png', ['シャドウズ'], ['ナーガの眷属'], '光', []),
    new CharacterInfo(1516, 'スコル', 'Skoll', 'Scoru_Shadows.png', ['シャドウズ'], ['フェンリルの眷属'], '光', []),
    // new CharacterInfo(1517, 'タマモ', 'Tamamo', 'Tamamo_Shadows.png', ['シャドウズ'], ['キュウビの眷属'], '光', []),
    // new CharacterInfo(1518, 'バルトロメウス', 'Bartolomeus', 'Barutoromeusu_Shadows.png', ['シャドウズ'], ['帝国'], '光', []),
    // new CharacterInfo(1519, 'フェンリル', 'Fenris', '', ['シャドウズ'], [], '', []),
    // new CharacterInfo(1532, 'リン', 'Lyn', 'Lyn_Shadows.png', ['シャドウズ'], [], '光', []),
    // new CharacterInfo(1534, 'ディミトリ', 'Dimitri', 'Dimitri_Shadows.png', ['シャドウズ'], [], '光', []),
    // new CharacterInfo(1536, 'ウカ', '', '', ['シャドウズ'], ['キュウビの眷属'], '', [])
];
const edges = [
    // new GraphEdge(-1, 'リン', 'マデリン', '母'), new GraphEdge(-1, 'リン', 'ハサル', '父'), new GraphEdge(-1, 'フロリーナ', 'リン', '友人', 'none'), new GraphEdge(-1, 'エリウッド', 'リン', '盟友', 'none'), new GraphEdge(-1, 'リン', 'ラングレン', '命を狙う', 'back'), new GraphEdge(-1, 'ズグ', 'リン', '襲う'), new GraphEdge(-1, 'バッタ', 'リン', '襲う'),
    new GraphEdge(-1, 'メメ', 'ナーガ', '使い魔', 'back'),
    new GraphEdge(-1, 'ハティ', 'スコル', '兄'),
    // new GraphEdge(-1, 'シア', 'サイ', '兄'),
    // new GraphEdge(-1, 'タマモ', 'ウカ', '妹', 'back')
];
const tagList = [];