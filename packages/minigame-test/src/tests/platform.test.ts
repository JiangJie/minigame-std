import { assert } from '@std/assert';
import { platform } from 'minigame-std';

assert(platform.isMiniGame());

const windowInfo = platform.getWindowInfo();
assert(windowInfo.screenHeight >= windowInfo.windowHeight);
assert(windowInfo.screenWidth >= windowInfo.windowWidth);