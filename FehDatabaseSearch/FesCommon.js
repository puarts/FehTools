
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

function getClassIconPath(classType) {
    switch (classType) {
        case "攻撃": return '/images/fe-shadows/icons/type-infantry.png';
        case "耐久": return '/images/fe-shadows/icons/type-armored.png';
        case "騎馬": return '/images/fe-shadows/icons/type-cavalry.png';
        case "飛行": return '/images/fe-shadows/icons/type-flying.png';
        default: return '';
    }
}

function getWeaponIconPath(weaponType) {
    switch (weaponType) {
        case "剣": return '/images/fe-shadows/icons/weapon-sword.png';
        case "槍": return '/images/fe-shadows/icons/weapon-lance.png';
        case "斧": return '/images/fe-shadows/icons/weapon-axe.png';
        case "竜": return '/images/fe-shadows/icons/weapon-stone.png';
        case "爪": return '/images/fe-shadows/icons/weapon-claws.png';
        case "書": return '/images/fe-shadows/icons/weapon-tome.png';
        case "杖": return '/images/fe-shadows/icons/weapon-staff.png';
        case "弓": return '/images/fe-shadows/icons/weapon-bow.png';
        default: return "";
    }
}