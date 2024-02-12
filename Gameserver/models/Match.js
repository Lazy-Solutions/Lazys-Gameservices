//@ts-nocheck

import { Match as ExtendedMatch } from '../../core/models/Match.js';
import { MatchAccessRoles } from './MatchAccessRoles.js';
import { MatchStates } from './MatchStates.js';

export class Match extends ExtendedMatch
{
    constructor(match_id, maxPlayers, gameMode, _private = false)
    {
        super(match_id, _private);

        this.maxPlayers = maxPlayers;
        this.state = MatchStates.preMatch;
        this.gameMode = gameMode;
    }

    // If the access is set as "player" add them, if not, make them spectators.
    // if they try to connect to a match as a player, but we are full, deny them.
    // this way the client side will know its role.
    Connect(user, role)
    {
        if (role === MatchAccessRoles.player)
        {
            // for reconnection, player is connected to match
            if (this.players.indexOf(user) !== -1)
                return true;

            // this player tried to connect as a player to a full game?    
            if (this.players.length === this.maxPlayers)
                return false;

            this.players.push(user);
        }

        return true;
    }

    disconnect(user, gracefull)
    {

        // if the dc was gracefull, treat it as abandon.

    }

    abandon(player)
    {

    }

    endMatch(winner)
    {
        state = MatchStates.postMatch;
    }

    pause()
    {

    }
}