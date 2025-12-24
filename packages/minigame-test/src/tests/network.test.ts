import { addNetworkChangeListener, getNetworkType } from 'minigame-std';

(async () => {
    console.log('getNetworkType', await getNetworkType());

    addNetworkChangeListener(type => {
        console.log('addNetworkChangeListener', type);
    });
})();