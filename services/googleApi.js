// TODO: build

export async function verifyGoogleId(googleId)
{
    return googleId.search("google") >= 0; // replace with auth
}