export const MatchAccessRoles = Object.freeze({
    player: 0,
    spectator: 1
});

export function GetRoleFromString(roleString)
{
    const roleKeys = Object.keys(MatchAccessRoles);
    const defaultRole = MatchAccessRoles.player;

    return roleKeys.includes(roleString) ? MatchAccessRoles[roleString] : defaultRole;
}