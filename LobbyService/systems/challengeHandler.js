
// should we set this script to handle sending messages?

// a player should only be able to challenge one player at the time.
// a recieving player should be able to get multiple or should it be blocked for other challengers if the player has been challenged?
// a player should be able to cancel its current challenge directly or by challenging another player.
// the challenged player should be able to cancel an opponent challenge, by directly cancel or challenging another player.
// a player should only be able to challenge same player once every X sec.
// needs to have a low memory usage and no databases.

export const challengeHandler = {
    activeChallenges: new Map(),
    activeCooldowns: new Set(),

    /**
     * 
     * @param {*} playerId 
     * @param {*} opponentId 
     * @param {*} onCancel, the cancel timeout was called and list cleared. event fired.
     * @returns true if successful, false if on CD, doesnt check if user if available
     */
    createChallenge(playerId, opponentId, otherData, onCancel)
    {
        const key = getChallengeKey(playerId, opponentId);

        if(this.activeCooldowns.has(key))
        {
            return false;
        }

        this.activeChallenges.set(playerId, {opponentId, ...otherData} );
        this.activeCooldowns.add(key); // If active, we have cooldown

        // trigger a cancel if not accepted within 30s.
        // i expect this to also add a 30s ish cooldown for cons challanging.
        // even if this has a hard impact i may think its fine due to being MM.
        setTimeout(() =>
        {
            const challengeCanceled = this.activeChallenges.delete(playerId);
            const cooldownCleared = this.activeCooldowns.delete(key);

            onCancel(challengeCanceled, cooldownCleared);
        }, 30 * 1000);

        return true;
    },

    acceptChallenge(playerId, opponentId)
    {
        const challenge = this.activeChallenges.get(opponentId);
        // does the challanger have an active challange against the player accepting
        if(this.activeChallenges.has(opponentId) && challenge.opponentId === playerId)
        {
            // remove the challenge, the cooldown should remain.
            this.activeChallenges.delete(opponentId);
            // Add any additional logic here, such as starting the game
            return challenge;
        }

        return undefined;
    },

    cancelMyChallenges(playerId)
    {
        if(this.activeChallenges.has(playerId))
        {
            this.activeChallenges.delete(playerId);
        }

        for(const [key, value] of this.activeChallenges.entries())
        {
            if(value.opponentId === playerId)
            {
                this.activeChallenges.delete(key);
            }
        }
    },

    cancelChallenge(playerId, opponentId)
    {
        // check if we have an active challenge against.
        let successfulCancel = false;

        if(this.activeChallenges.has(playerId))
        {
            this.activeChallenges.delete(playerId);
            successfulCancel = true;
        }

        if(this.activeChallenges.get(opponentId)?.opponentId === playerId)
        {
            this.activeChallenges.delete(opponentId);
            successfulCancel = true;
        }

        return successfulCancel;
    },

    isRegistered(playerId)
    {
        // Check if the ID is a key
        if(this.activeChallenges.has(playerId))
        {
            return true;
        }

        // Check if the ID is a value
        for(const value of this.activeChallenges.values())
        {
            if(value.opponentId === playerId)
            {
                return true;
            }
        }

        return false;
    },

    clearCooldown(p1, p2)
    {

        const key = getChallengeKey(p1, p2);
        this.activeCooldowns.delete(key);
    }
};



function sortByFirstCharacter(arr)
{
    return arr.slice().sort((a, b) => a[0].localeCompare(b[0]));
}

function getChallengeKey(player1, player2)
{
    const sorted = sortByFirstCharacter([player1, player2]);
    return sorted.join("_");
}


// // tests

// const p1 = '341541q4';
// const p2 = 'asdhqabsdj';
// const p3 = 'qjaenjan';

// const checkReg = (premsg) =>
// {
//     if(premsg) console.log(premsg);
//     // check registered
//     console.log("p1: " + challengeHandler.isRegistered(p1) + " p2: " + challengeHandler.isRegistered(p2) + " p3: " + challengeHandler.isRegistered(p3));
//     console.log("")
// };

// // create challenge
// challengeHandler.createChallenge(p1, p2, {gameMode: 1}, () => { });

// // check registered,
// checkReg();

// // cancel challenge
// challengeHandler.cancelChallenge(p1, p2);

// // check registered
// checkReg("check reg after cancel");

// // lets cancel my challenge
// challengeHandler.createChallenge(p1, p2, {gameMode: 1}, () => { });
// challengeHandler.cancelChallenge(p1, undefined);

// checkReg("check reg after cancel self");

// console.log("check cooldowns")
// // check cooldown
// const n1 = challengeHandler.createChallenge(p1, p2, {gameMode: 1}, () => { });
// console.log("on cooldown: " + !n1);

// // clear cd
// challengeHandler.clearCooldown(p1, p2);

// // check cooldown
// const n2 = challengeHandler.createChallenge(p1, p2, {gameMode: 1},  () => { });
// console.log("on cooldown: " + !n2);

// // check registered
// checkReg("check reg after cd check");

// // can p2 cancel?
// challengeHandler.cancelChallenge(p2, p1);
// challengeHandler.clearCooldown(p1, p2);

// // check registered
// checkReg("check reg after opponent cancels");

// // 2p challenge 1 and he accepts 1 and deletes rest
// const n3 = challengeHandler.createChallenge(p1, p2, {gameMode: 1}, () => { });
// console.log(challengeHandler.activeChallenges);
// const n4 = challengeHandler.createChallenge(p3, p2, {gameMode: 1}, () => { });
// console.log(challengeHandler.activeChallenges);
// challengeHandler.acceptChallenge(p2, p3)
// challengeHandler.cancelMyChallenges(p2)
// console.log(challengeHandler.activeChallenges);
