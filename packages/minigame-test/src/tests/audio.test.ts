import { assert } from '@std/assert';
import { audio, fs } from 'minigame-std';

const audioUrl = 'https://www.w3schools.com/html/horse.mp3';

export async function testAudio(): Promise<void> {
    (await fs.unzipFromUrl('https://hlddz.huanle.qq.com/web/FeaturesPicture/WH_Dialect_Package_MP3.zip', '/audios')).inspect(() => {
        audio.playWebAudioFromFile('/audios/Sound/WH_Dialect_Package/Man/chaojijiabei.mp3');
    });

    console.log('测试从 URL 播放 WebAudio...');
    const playFromUrlRes = await audio.playWebAudioFromUrl(audioUrl, {
        autoDisconnect: false,
    });

    assert(playFromUrlRes.isOk(), `playWebAudioFromUrl 应该成功: ${ playFromUrlRes.isErr() ? playFromUrlRes.unwrapErr().message : '' }`);

    const source = playFromUrlRes.unwrap();
    source.stop();
    source.disconnect();
    console.log('✅ playWebAudioFromUrl 测试完成');
}