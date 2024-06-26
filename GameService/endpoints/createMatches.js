import { keys } from "../../shared/globals.js";
import { genMatchKey } from "../../shared/utils/utils.js";
import { matches, matchCodes } from '../store.js';
import { Match } from "../models/Match.js";
import { GenerateUniqueCode } from "../../core/common.js";

const { SECRET_KEY } = keys;

//TODO: add limitations, so the event returns the amount of matches it can host.
//and perhaps other things

export const createMatches = async (req, res) =>
{
    console.log("match request...");

    // count of the requested matches
    const { matchCount, gameMode } = req.body;


    if (!matchCount)
    {
        res.status(400).send("Matches missing");
        return;
    }

    const matchIds = [];

    for (let i = 0; i < matchCount; i++)
    {
        // match codes are { matchkey: matchId } so we currently use this to store all used match keys.

        const matchId = GenerateUniqueCode(Object.values(matchCodes));

        const key = genMatchKey(matchId, SECRET_KEY);

        matchCodes[key] = matchId;
        matches.addMatch(new Match(matchId, 2, gameMode));

        // send the match ids, matchmaker will generate the key aswell, the keys will just generate extra kost
        matchIds.push(matchId);
    }

    res.status(201).send(matchIds); // return the keys to MM
};