export class MatchManager {
    constructor() {
        this.matches = {};
    }

    addMatch(match) {
        this.matches[match.id] = match;
    }

    addMatches(matches) {
        for (const match of matches) {
            this.addMatch(match);
        }
    }

    removeMatch(match) {
        delete this.matches[match.id];
    }

    removeMatches(matches) {
        for (const match of matches) {
            this.removeMatch(match);
        }
    }

    findMatchById(match_id) {
        return this.matches[match_id];
    }

    count() {
        return Object.keys(this.matches).length;
    }
}
