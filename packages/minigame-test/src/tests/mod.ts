import { registerTest } from '../test-runner.ts';

import { testAudio } from './audio.test.ts';
import { testBase64 } from './base64.test.ts';
import { testClipboard } from './clipboard.test.ts';
import { testCodec } from './codec.test.ts';
import { testEvent } from './event.test.ts';
import { testFetch } from './fetch.test.ts';
import { testFs } from './fs.test.ts';
import { testHash } from './hash.test.ts';
import { testImage } from './image.test.ts';
import { testLbs } from './lbs.test.ts';
import { testNetwork } from './network.test.ts';
import { testPlatform } from './platform.test.ts';
import { testRandom } from './random.test.ts';
import { testRsa } from './rsa.test.ts';
import { testSocket } from './socket.test.ts';
import { testStorage } from './storage.test.ts';

// 注册所有测试
registerTest('Audio', testAudio);
registerTest('Base64', testBase64);
registerTest('Clipboard', testClipboard);
registerTest('Codec', testCodec);
registerTest('Event', testEvent);
registerTest('Fetch', testFetch);
registerTest('FS', testFs);
registerTest('Hash', testHash);
registerTest('Image', testImage);
registerTest('LBS', testLbs);
registerTest('Network', testNetwork);
registerTest('Platform', testPlatform);
registerTest('Random', testRandom);
registerTest('RSA', testRsa);
registerTest('Socket', testSocket);
registerTest('Storage', testStorage);
