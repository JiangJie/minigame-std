import { assert } from '@std/assert';
import { cryptos, textEncode } from 'minigame-std';

(async () => {
    const data = 'minigame-std-中文';
    const md5Str = '3395c7db2e34c56338bec2bad454f224';

    assert(cryptos.md5(data) === md5Str);
    assert(cryptos.md5(textEncode(data)) === md5Str);

    const sha1Str = '431de9a89a769f4fb56a1c128fb7208bebb37960';

    assert(await cryptos.sha1(data) === sha1Str);
    assert(await cryptos.sha1(textEncode(data)) === sha1Str);

    assert(await cryptos.sha256(data) === '9cff73e4d0e15d78089294a8519788df44f306411e8d20f5f3770e564a73467f');
    assert(await cryptos.sha384(data) === '23ba7aac72c86e88befc6094e8f903645e2531cf14ac57edf1796e74e40a6e567b0255502a342d3085493d34e87b0541');
    assert(await cryptos.sha512(data) === 'b4ebfef03638039622452ce378974fba515a8cb46c07e667bf80cdae06e69127123d5c32d85deb0ccc9ce563e5939b3340a604b45bd6493e663ae266c203d694');
})();