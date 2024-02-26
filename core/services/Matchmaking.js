import AsyncLooper from "../utilities/AsyncLooper.js";

export class Matchmaking extends AsyncLooper
{
    constructor({ playersToMatchAction, matchingLogicFunction, matchedResultsCallback, onError, interval = 2000, maxMatchesPerInterval = 10, initState = {} })
    {
        super(
            async () => await this.event(),
            async (error) => await this.error(error)
        );

        this.playersToMatchAction = playersToMatchAction;
        this.matchingLogicFunction = matchingLogicFunction;
        this.matchedResultsCallback = matchedResultsCallback;
        this.onError = onError;
        this.interval = interval;
        this.maxMatchesPerInterval = maxMatchesPerInterval;
        this.state = initState;
    }

    async event()
    {
        // we may or may not want a delay between matching?
        if (this.interval > 0)
            await wait(this.interval);

        // gives an array of available players based on how the user wishes to match them.
        let players = await this.playersToMatchAction(this.state);

        // not enough players, break the loop, allow for undefined/null/empty.
        if (!players || players.length === 0)
            return;

        // placeholder for matches we create.
        let matches = [];
        let currentMatchCount = 0;

        while (currentMatchCount < this.maxMatchesPerInterval)
        {
            const matchedPlayers = await this.matchingLogicFunction(players, this.state);

            // No more matches, we let the user return undefined/null/empty
            if (!matchedPlayers || matchedPlayers.length === 0)
            {
                break;
            }

            matches.push(matchedPlayers);
            currentMatchCount++;

            // Remove matched players from the array
            players = players.filter(player => !matchedPlayers.includes(player));
        }

        // callback to report all matched matches. I'm thinking of still sending even if empty matches, so we can handle that?
        await this.matchedResultsCallback(matches, this.state);
    }

    async error(error)
    {
        await this.onError(error);
    }
}

function wait(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function matchingLogic_MMR(mmr_range, match_size)
{
    if (!mmr_range || !match_size)
    {
        throw new Error("MMR_matchingLogic has incomplete setup");
    }

    return (players) =>
    {
        const _match_size = match_size;
        const _mmr_range = mmr_range;

        if (players.length < _match_size)
            return false;

        const sortedPlayers = [...players].sort((a, b) => a.mmr - b.mmr);

        const matches = [];


        for (let i = 0; i < sortedPlayers.length - 1; i++)
        {
            const currentMmr = sortedPlayers[i].mmr;
            const potentialMatch = [sortedPlayers[i]];



            for (let j = i + 1; j < sortedPlayers.length; j++)
            {
                if (sortedPlayers[j].mmr - currentMmr <= mmr_range)
                {
                    potentialMatch.push(sortedPlayers[j]);
                }


                if (potentialMatch.length >= match_size)
                {
                    matches.push(potentialMatch.slice(0, match_size));
                    break;
                }
            }
        }

        return players.slice(0, _match_size);
    };
}