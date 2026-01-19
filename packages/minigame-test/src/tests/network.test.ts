import { addNetworkChangeListener, getNetworkType } from 'minigame-std';

export async function testNetwork(): Promise<void> {
    console.log('getNetworkType', await getNetworkType());

    addNetworkChangeListener(type => {
        console.log('addNetworkChangeListener', type);
    });
}