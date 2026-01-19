import { audio, fs } from 'minigame-std';

export async function testAudio(): Promise<void> {
    (await fs.unzipFromUrl('https://hlddz.huanle.qq.com/web/FeaturesPicture/WH_Dialect_Package_MP3.zip', '/audios')).inspect(() => {
        audio.playWebAudioFromFile('/audios/Sound/WH_Dialect_Package/Man/chaojijiabei.mp3');
    });
}