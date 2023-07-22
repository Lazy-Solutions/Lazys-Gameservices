import MatchManager from "./Cores/shared/services/MatchManager.js";
import Match from "./Cores/shared/models/Match.js";

MatchManager.addMatch(new Match('asd', '144444', true));

let asd = MatchManager.getMatchById('asd');

console.log(asd);

asd.id = 'aaaa';

let aaaa = MatchManager.getMatchById('aaaa');

console.log(aaaa);