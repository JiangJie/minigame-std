import { audio, fs } from 'minigame-std';

wx.onTouchEnd(async () => {
    (await fs.unzipFromUrl('https://hlddz.huanle.qq.com/web/FeaturesPicture/WH_Dialect_Package_MP3.zip', '/audios')).inspect(() => {
        audio.playWebAudioFromFile('/audios/Sound/WH_Dialect_Package/Man/chaojijiabei.mp3');
    });
});