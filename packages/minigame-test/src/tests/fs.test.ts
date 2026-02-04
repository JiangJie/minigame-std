import { assert } from '@std/assert';
import { encodeUtf8, fs } from 'minigame-std';

const mockServer = 'https://fakestoreapi.com';

const mockAll = `${mockServer}/products`;
const mockSingle = `${mockAll}/1`;

export const mockZipUrl = 'https://hlddz.huanle.qq.com/web/FeaturesPicture/WH_Dialect_Package_MP3.zip';

async function testAsync() {
    // Clear all files and folders
    await fs.emptyDir(fs.opfs.ROOT_DIR);
    // Recursively create the /happy/opfs directory
    await fs.mkdir('/happy/opfs');
    // Create and write file content
    await fs.writeFile('/happy/opfs/a.txt', 'hello opfs');
    await fs.writeFile('/happy/op-fs/fs.txt', 'hello opfs');
    // Move the file
    await fs.move('/happy/opfs/a.txt', '/happy/b.txt');
    (await fs.move('/happy/op-fs', '/happy/opfs-bak')).inspectErr(err => {
        console.log('move', err);
    });
    // Append content to the file
    (await fs.appendFile('/happy/b.txt', encodeUtf8(' happy opfs'))).inspectErr(err => {
        console.log('appendFile', err);
    });

    // File no longer exists
    const statRes = await fs.stat('/happy/opfs/a.txt');
    assert(statRes.inspect(x => {
        console.log('stat', x);
    }).isErr());

    assert((await fs.readFile('/happy/b.txt')).unwrap().byteLength === 21);
    // Automatically normalize the path
    assert((await fs.readTextFile('//happy///b.txt//')).unwrap() === 'hello opfs happy opfs');

    assert((await fs.remove('/happy/not/exists')).isOk());
    await fs.remove('/happy/opfs');

    assert(!(await fs.exists('/happy/opfs')).unwrap());
    assert((await fs.exists('/happy/b.txt')).unwrap());
    assert((await fs.stat('/happy/b.txt')).unwrap().isFile());

    // Download a file
    const downloadTask = fs.downloadFile(mockSingle, '/todo.json', {
        timeout: 1000,
        onProgress(progressResult) {
            progressResult.inspect(progress => {
                // Maybe zero?
                assert(progress.totalByteLength === 0 || progress.completedByteLength <= progress.totalByteLength);
            }).inspectErr(err => {
                console.log(err);
            });
        },
    });
    const downloadRes = await downloadTask.result;
    if (downloadRes.isOk()) {
        assert((downloadRes.unwrap() as WechatMinigame.DownloadFileSuccessCallbackResult).filePath.endsWith('/todo.json'));

        const postData = (await fs.readTextFile('/todo.json')).unwrap();
        const postJson: {
            id: number;
            title: string;
        } = JSON.parse(postData);
        assert(postJson.id === 1);

        // Modify the file
        postJson.title = 'happy-opfs';
        await fs.writeFile('/todo.json', JSON.stringify(postJson));

        // Upload a file
        assert(((await fs.uploadFile('/todo.json', mockAll).result).unwrap() as WechatMinigame.UploadFileSuccessCallbackResult).statusCode === 201);
    } else {
        assert(downloadRes.unwrapErr() instanceof Error);
    }

    {
        // Download a file to a temporary file
        const downloadTask = fs.downloadFile(mockSingle);
        const downloadRes = await downloadTask.result;
        downloadRes.inspect((x: WechatMinigame.DownloadFileSuccessCallbackResult | { tempFilePath: string; }) => {
            // Maybe /tmp/xxx or /tmp_xxx
            assert(x.tempFilePath.includes('/tmp'));
        });
        if (downloadRes.isOk()) {
            await fs.remove(downloadRes.unwrap().tempFilePath);
        }
    }

    // Will create directory
    await fs.emptyDir('/not-exists');

    // Zip/Unzip
    assert((await fs.zip('/happy', '/happy.zip')).isOk());
    assert((await fs.zip('/happy')).unwrap().byteLength === (await fs.readFile('/happy.zip')).unwrap().byteLength);
    assert((await fs.unzip('/happy.zip', '/happy-2')).isOk());
    assert((await fs.unzipFromUrl(mockZipUrl, '/happy-3', {
        onProgress(progressResult) {
            progressResult.inspect(progress => {
                console.log(`Unzipped ${progress.completedByteLength}/${progress.totalByteLength} bytes`);
            });
        },
    })).isOk());
    assert((await fs.zipFromUrl(mockZipUrl, '/test-zip.zip')).isOk());
    assert((await fs.zipFromUrl(mockZipUrl)).unwrap().byteLength === (await fs.readFile('/test-zip.zip')).unwrap().byteLength);

    // Copy
    await fs.mkdir('/happy/copy');
    assert((await fs.copy('/happy/b.txt', '//happy/op-fs/aaa/bbb.txt')).isOk());
    assert((await fs.copy('/happy', '/happy-copy')).isOk());
    await fs.appendFile('/happy-copy/b.txt', ' copy');
    assert((await fs.readFile('/happy-copy/b.txt')).unwrap().byteLength === 26);

    // List all files and folders in the root directory
    for (const name of (await fs.readDir(fs.opfs.ROOT_DIR)).unwrap()) {
        console.log(name);
    }

    // ==================== 新增测试用例 ====================

    // Test readJsonFile / writeJsonFile
    const testJsonData = {
        name: 'minigame-std',
        version: '1.0.0',
        features: ['fs', 'crypto', 'codec'],
        config: {
            debug: true,
            timeout: 3000,
        },
    };
    assert((await fs.writeJsonFile('/test-config.json', testJsonData)).isOk());
    const readJsonRes = await fs.readJsonFile<typeof testJsonData>('/test-config.json');
    assert(readJsonRes.isOk());
    const jsonContent = readJsonRes.unwrap();
    assert(jsonContent.name === 'minigame-std');
    assert(jsonContent.version === '1.0.0');
    assert(jsonContent.features.length === 3);
    assert(jsonContent.config.debug === true);

    // Test readFile with utf8 encoding
    await fs.writeFile('/test-utf8.txt', 'UTF-8 测试内容');
    const utf8Res = await fs.readFile('/test-utf8.txt', { encoding: 'utf8' });
    assert(utf8Res.isOk());
    assert(utf8Res.unwrap() === 'UTF-8 测试内容');

    // Test readFile with bytes encoding
    const bytesRes = await fs.readFile('/test-utf8.txt', { encoding: 'bytes' });
    assert(bytesRes.isOk());
    assert(bytesRes.unwrap() instanceof Uint8Array);

    // Test stat with recursive option
    await fs.mkdir('/stat-test/sub1/sub2');
    await fs.writeFile('/stat-test/file1.txt', 'file1');
    await fs.writeFile('/stat-test/sub1/file2.txt', 'file2');
    await fs.writeFile('/stat-test/sub1/sub2/file3.txt', 'file3');

    // Non-recursive stat should return single Stats
    const statNonRecursive = await fs.stat('/stat-test');
    assert(statNonRecursive.isOk());
    assert(statNonRecursive.unwrap().isDirectory());

    // Recursive stat should return FileStats array
    const statRecursive = await fs.stat('/stat-test', { recursive: true });
    assert(statRecursive.isOk());
    const statsArr = statRecursive.unwrap() as WechatMinigame.FileStats[];
    assert(Array.isArray(statsArr));
    assert(statsArr.length >= 4); // At least: root dir, file1, sub1 dir, sub1/file2

    // Test exists with isFile/isDirectory options
    assert((await fs.exists('/stat-test/file1.txt', { isFile: true })).unwrap() === true);
    assert((await fs.exists('/stat-test/file1.txt', { isDirectory: true })).unwrap() === false);
    assert((await fs.exists('/stat-test/sub1', { isDirectory: true })).unwrap() === true);
    assert((await fs.exists('/stat-test/sub1', { isFile: true })).unwrap() === false);

    // Test error handling - read non-existent file
    const readNonExist = await fs.readFile('/non-existent-file.txt');
    assert(readNonExist.isErr());

    // Test error handling - stat non-existent path
    const statNonExist = await fs.stat('/non-existent-path');
    assert(statNonExist.isErr());

    // Test writeFile with empty content
    assert((await fs.writeFile('/empty-file.txt', '')).isOk());
    assert((await fs.readTextFile('/empty-file.txt')).unwrap() === '');

    // Test writeFile with ArrayBuffer
    const arrayBuffer = new ArrayBuffer(8);
    const view = new Uint8Array(arrayBuffer);
    view.set([72, 101, 108, 108, 111, 33, 33, 33]); // "Hello!!!"
    assert((await fs.writeFile('/arraybuffer-test.txt', arrayBuffer)).isOk());
    assert((await fs.readTextFile('/arraybuffer-test.txt')).unwrap() === 'Hello!!!');

    // Test mkdir for existing directory (should not fail)
    assert((await fs.mkdir('/stat-test/sub1')).isOk());

    // Test appendFile to non-existent file (should create file)
    assert((await fs.appendFile('/new-append-file.txt', 'first content')).isOk());
    assert((await fs.readTextFile('/new-append-file.txt')).unwrap() === 'first content');

    // Test copy overwrite
    await fs.writeFile('/copy-src.txt', 'source content');
    await fs.writeFile('/copy-dest.txt', 'old content');
    assert((await fs.copy('/copy-src.txt', '/copy-dest.txt')).isOk());
    assert((await fs.readTextFile('/copy-dest.txt')).unwrap() === 'source content');

    // Test move with directory
    await fs.mkdir('/move-test/subdir');
    await fs.writeFile('/move-test/subdir/file.txt', 'move test');
    assert((await fs.move('/move-test', '/moved-dir')).isOk());
    assert((await fs.exists('/move-test')).unwrap() === false);
    assert((await fs.exists('/moved-dir/subdir/file.txt')).unwrap() === true);

    // Test readDir empty directory
    await fs.emptyDir('/empty-dir-test');
    const emptyDirRes = await fs.readDir('/empty-dir-test');
    assert(emptyDirRes.isOk());
    assert(emptyDirRes.unwrap().length === 0);

    // Test special characters in filename
    await fs.writeFile('/special-chars_文件名.txt', 'special content');
    assert((await fs.exists('/special-chars_文件名.txt')).unwrap() === true);
    assert((await fs.readTextFile('/special-chars_文件名.txt')).unwrap() === 'special content');

    // ==================== 代码包路径测试 ====================
    // 注意：代码包路径测试需要在小游戏项目中有对应的文件

    // Test readFile with code package path (no ./ or ../ prefix)
    const testPngRes = await fs.readFile('images/test.png');
    assert(testPngRes.isOk());
    console.log('Read code package file images/test.png, size:', testPngRes.unwrap().byteLength);
    assert(testPngRes.unwrap() instanceof Uint8Array);

    // Test stat with code package path
    const testPngStatRes = await fs.stat('images/test.png');
    assert(testPngStatRes.isOk());
    assert(testPngStatRes.unwrap().isFile());
    console.log('Stat code package file images/test.png:', testPngStatRes.unwrap());

    // Test readDir with code package path
    const readDirCodePkgRes = await fs.readDir('images');
    assert(readDirCodePkgRes.isOk());
    console.log('Read code package directory images:', readDirCodePkgRes.unwrap());
    assert(Array.isArray(readDirCodePkgRes.unwrap()));

    // Test invalid code package path (should fail with ./ prefix)
    const invalidPathRes1 = await fs.readFile('./images/test.png');
    assert(invalidPathRes1.isErr());
    console.log('Invalid path ./images/test.png correctly rejected:', invalidPathRes1.unwrapErr().message);

    // Test invalid code package path (should fail with ../ prefix)
    const invalidPathRes2 = await fs.readFile('../images/test.png');
    assert(invalidPathRes2.isErr());
    console.log('Invalid path ../images/test.png correctly rejected:', invalidPathRes2.unwrapErr().message);

    // Test code package path with subdirectory stat
    const imagesDirRes = await fs.stat('images');
    assert(imagesDirRes.isOk());
    assert(imagesDirRes.unwrap().isDirectory());
    console.log('Stat code package directory images:', imagesDirRes.unwrap());

    // ==================== 代码包路径测试结束 ====================

    // ==================== 新增测试用例结束 ====================

    await fs.remove(fs.opfs.ROOT_DIR);
}

function testSync() {
    // Clear all files and folders
    fs.emptyDirSync(fs.opfs.ROOT_DIR);
    // Recursively create the /happy/opfs directory
    fs.mkdirSync('/happy/opfs');
    // Create and write file content
    fs.writeFileSync('/happy/opfs/a.txt', 'hello opfs');
    fs.writeFileSync('/happy/op-fs/fs.txt', 'hello opfs');
    // Move the file
    fs.moveSync('/happy/opfs/a.txt', '/happy/b.txt').inspectErr(err => {
        console.log('rename', err);
    });
    // Append content to the file
    fs.appendFileSync('/happy/b.txt', encodeUtf8(' happy opfs'));

    // File no longer exists
    const statRes = fs.statSync('/happy/opfs/a.txt');
    assert(statRes.isErr());

    assert((fs.readFileSync('/happy/b.txt')).unwrap().byteLength === 21);
    // Automatically normalize the path
    assert((fs.readTextFileSync('//happy///b.txt//')).unwrap() === 'hello opfs happy opfs');

    assert((fs.removeSync('/happy/not/exists')).isOk());
    fs.removeSync('/happy/opfs');

    assert(!(fs.existsSync('/happy/opfs')).unwrap());
    assert((fs.existsSync('/happy/b.txt')).unwrap());
    assert((fs.statSync('/happy/b.txt')).unwrap().isFile());

    // Will create directory
    fs.emptyDirSync('/not-exists');

    // Zip/Unzip
    assert((fs.zipSync('/happy', '/happy.zip')).isOk());
    assert((fs.unzipSync('/happy.zip', '/happy-2')).isOk());

    // Copy
    fs.mkdirSync('/happy/copy');
    assert(fs.copySync('/happy/b.txt', '//happy/op-fs/aaa/bbb.txt').isOk());
    assert(fs.copySync('/happy', '/happy-copy').isOk());
    fs.appendFileSync('/happy-copy/b.txt', ' copy');
    assert(fs.readFileSync('/happy-copy/b.txt').unwrap().byteLength === 26);

    // List all files and folders in the root directory
    for (const name of (fs.readDirSync(fs.opfs.ROOT_DIR)).unwrap()) {
        console.log(name);
    }

    // ==================== 新增同步测试用例 ====================

    // Test readJsonFileSync / writeJsonFileSync
    const testJsonData = {
        name: 'minigame-std-sync',
        version: '2.0.0',
        enabled: true,
        items: [1, 2, 3],
    };
    assert(fs.writeJsonFileSync('/test-config-sync.json', testJsonData).isOk());
    const readJsonRes = fs.readJsonFileSync<typeof testJsonData>('/test-config-sync.json');
    assert(readJsonRes.isOk());
    const jsonContent = readJsonRes.unwrap();
    assert(jsonContent.name === 'minigame-std-sync');
    assert(jsonContent.version === '2.0.0');
    assert(jsonContent.enabled === true);
    assert(jsonContent.items.length === 3);

    // Test readFileSync with utf8 encoding
    fs.writeFileSync('/test-utf8-sync.txt', 'UTF-8 同步测试');
    const utf8Res = fs.readFileSync('/test-utf8-sync.txt', { encoding: 'utf8' });
    assert(utf8Res.isOk());
    assert(utf8Res.unwrap() === 'UTF-8 同步测试');

    // Test readFileSync with bytes encoding
    const bytesRes = fs.readFileSync('/test-utf8-sync.txt', { encoding: 'bytes' });
    assert(bytesRes.isOk());
    assert(bytesRes.unwrap() instanceof Uint8Array);

    // Test statSync with recursive option
    fs.mkdirSync('/stat-test-sync/sub1/sub2');
    fs.writeFileSync('/stat-test-sync/file1.txt', 'file1');
    fs.writeFileSync('/stat-test-sync/sub1/file2.txt', 'file2');

    // Non-recursive stat
    const statNonRecursive = fs.statSync('/stat-test-sync');
    assert(statNonRecursive.isOk());
    assert(statNonRecursive.unwrap().isDirectory());

    // Recursive stat
    const statRecursive = fs.statSync('/stat-test-sync', { recursive: true });
    assert(statRecursive.isOk());
    const statsArr = statRecursive.unwrap() as WechatMinigame.FileStats[];
    assert(Array.isArray(statsArr));
    assert(statsArr.length >= 3);

    // Test existsSync with isFile/isDirectory options
    assert(fs.existsSync('/stat-test-sync/file1.txt', { isFile: true }).unwrap() === true);
    assert(fs.existsSync('/stat-test-sync/file1.txt', { isDirectory: true }).unwrap() === false);
    assert(fs.existsSync('/stat-test-sync/sub1', { isDirectory: true }).unwrap() === true);
    assert(fs.existsSync('/stat-test-sync/sub1', { isFile: true }).unwrap() === false);

    // Test error handling - read non-existent file
    const readNonExist = fs.readFileSync('/non-existent-sync.txt');
    assert(readNonExist.isErr());

    // Test error handling - stat non-existent path
    const statNonExist = fs.statSync('/non-existent-path-sync');
    assert(statNonExist.isErr());

    // Test writeFileSync with empty content
    assert(fs.writeFileSync('/empty-file-sync.txt', '').isOk());
    assert(fs.readTextFileSync('/empty-file-sync.txt').unwrap() === '');

    // Test writeFileSync with ArrayBuffer
    const arrayBuffer = new ArrayBuffer(5);
    const view = new Uint8Array(arrayBuffer);
    view.set([72, 101, 108, 108, 111]); // "Hello"
    assert(fs.writeFileSync('/arraybuffer-sync.txt', arrayBuffer).isOk());
    assert(fs.readTextFileSync('/arraybuffer-sync.txt').unwrap() === 'Hello');

    // Test mkdirSync for existing directory
    assert(fs.mkdirSync('/stat-test-sync/sub1').isOk());

    // Test appendFileSync to non-existent file
    assert(fs.appendFileSync('/new-append-sync.txt', 'first').isOk());
    assert(fs.readTextFileSync('/new-append-sync.txt').unwrap() === 'first');

    // Test copySync overwrite
    fs.writeFileSync('/copy-src-sync.txt', 'src');
    fs.writeFileSync('/copy-dest-sync.txt', 'old');
    assert(fs.copySync('/copy-src-sync.txt', '/copy-dest-sync.txt').isOk());
    assert(fs.readTextFileSync('/copy-dest-sync.txt').unwrap() === 'src');

    // Test moveSync with directory
    fs.mkdirSync('/move-test-sync/sub');
    fs.writeFileSync('/move-test-sync/sub/f.txt', 'mv');
    assert(fs.moveSync('/move-test-sync', '/moved-sync').isOk());
    assert(fs.existsSync('/move-test-sync').unwrap() === false);
    assert(fs.existsSync('/moved-sync/sub/f.txt').unwrap() === true);

    // Test readDirSync empty directory
    fs.emptyDirSync('/empty-dir-sync');
    const emptyDirRes = fs.readDirSync('/empty-dir-sync');
    assert(emptyDirRes.isOk());
    assert(emptyDirRes.unwrap().length === 0);

    // Test zipSync to memory
    fs.mkdirSync('/zip-mem-test');
    fs.writeFileSync('/zip-mem-test/data.txt', 'zip memory test');
    const zipMemRes = fs.zipSync('/zip-mem-test');
    assert(zipMemRes.isOk());
    assert(zipMemRes.unwrap().byteLength > 0);

    // Test special characters in filename (sync)
    fs.writeFileSync('/sync-特殊字符.txt', '同步特殊');
    assert(fs.existsSync('/sync-特殊字符.txt').unwrap() === true);
    assert(fs.readTextFileSync('/sync-特殊字符.txt').unwrap() === '同步特殊');

    // ==================== 代码包路径同步测试 ====================

    // Test readFileSync with code package path
    const testPngSyncRes = fs.readFileSync('images/test.png');
    assert(testPngSyncRes.isOk());
    console.log('ReadSync code package file images/test.png, size:', testPngSyncRes.unwrap().byteLength);
    assert(testPngSyncRes.unwrap() instanceof Uint8Array);

    // Test statSync with code package path
    const testPngStatSyncRes = fs.statSync('images/test.png');
    assert(testPngStatSyncRes.isOk());
    assert(testPngStatSyncRes.unwrap().isFile());

    // Test readDirSync with code package path
    const readDirSyncCodePkgRes = fs.readDirSync('images');
    assert(readDirSyncCodePkgRes.isOk());
    console.log('ReadDirSync code package directory images:', readDirSyncCodePkgRes.unwrap());
    assert(Array.isArray(readDirSyncCodePkgRes.unwrap()));

    // Test invalid code package path sync (should fail with ./ prefix)
    const invalidSyncPathRes1 = fs.readFileSync('./images/test.png');
    assert(invalidSyncPathRes1.isErr());
    console.log('Invalid sync path ./images/test.png correctly rejected:', invalidSyncPathRes1.unwrapErr().message);

    // Test invalid code package path sync (should fail with ../ prefix)
    const invalidSyncPathRes2 = fs.readFileSync('../images/test.png');
    assert(invalidSyncPathRes2.isErr());
    console.log('Invalid sync path ../images/test.png correctly rejected:', invalidSyncPathRes2.unwrapErr().message);

    // ==================== 代码包路径同步测试结束 ====================

    // ==================== 新增同步测试用例结束 ====================

    fs.removeSync(fs.opfs.ROOT_DIR);
}

export async function testFs(): Promise<void> {
    await testAsync();
    testSync();
}
