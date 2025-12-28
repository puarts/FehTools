class MagicInfo {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
    get url() {
        return `https://fire-emblem.fun/?fesmagic=${this.id}`;
    }
}
