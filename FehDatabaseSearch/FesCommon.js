
class DiscipleInfo {
    constructor(name, weaponType, classType, magics = null) {
        this.name = name;
        this.weaponType = weaponType;
        this.class = classType;
        this.magics = magics != null ? Array.from(magics.split("|").filter(x => x != "")) : [];
    }
}
class MagicInfo {
    constructor(id, name, effectType) {
        this.id = id;
        this.name = name;
        this.effectTypes = effectType?.split('|') ?? [];
    }
    get url() {
        return `https://fire-emblem.fun/?fesmagic=${this.id}`;
    }

    get iconUrl() {
        return `/images/fe-shadows/icons/magics/${this.name}.png`;
    }

    get altIconUrl() {
        return `/images/fe-shadows/icons/magics/${this.name}.webp`;
    }
}

function calcValueForSpecifiedLevel(initValue, currentLevel, incrementMultiply = 1) {
    return Math.floor(initValue + ((initValue * incrementMultiply) * 0.1) * (currentLevel - 1));
}

function extractBracketedNumbers(text) {
    const matches = text.match(/【(\d+)】/g);
    if (!matches) return [];
    return matches.map(match => parseInt(match.replace(/[【】]/g, ''), 10));
}

function replaceBracketedNumbers(text, replacements) {
    let index = 0;
    return text.replace(/【(\d+)】/g, () => {
        const newValue = replacements[index];
        index++;
        return typeof newValue !== 'undefined' ? `【${newValue}】` : '【?】';
    });
}