import { cryptos } from 'minigame-std';

export async function testRsa(): Promise<void> {
    const data = 'minigame-std-中文';

    const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
    MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAix682LW8jwpZEGjFfoom
    GvLHCDh8ttPgSB5CBvXZLglimVfVkA7FiGdJqlKkf2kKXqrwSICbgcYUjFHMFdy9
    fvUwrKXzFXP46AzzV3ivkam2LB97eDSMI8gaIjumDaIFZAD3E9osYz4LMSI2A0nC
    qs+5xZ66JeC/Dtr5W9nobushAhFzZQWS/4I7iSUkV4WFmSG1ACB267z8YZ7YFmlT
    1hMFvp+biIsZIx7mebQNqjFjFPP0ZTskXg4UfQt6yyuaPqL55pQ7Wc8iI3umlsSV
    hDL1q3+ry7L8VDg7EtDBbodyYT5R62zBuhe7sJrvhtt/R6fZIfISPvRbumwusbf5
    XQIDAQAB
    -----END PUBLIC KEY-----
    `;
    const publicKey = await cryptos.rsa.importPublicKey(PUBLIC_KEY, 'SHA-1');
    const encryptedData = await publicKey.unwrap().encrypt(data);
    console.log(new Uint8Array(encryptedData.unwrap()).join());
}