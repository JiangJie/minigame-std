import { assert } from '@std/assert';
import { fs, textEncode } from 'minigame-std';

const mockServer = 'https://fakestoreapi.com';

const mockAll = `${ mockServer }/products`;
const mockSingle = `${ mockAll }/1`;

export const mockZipUrl = 'https://raw.githubusercontent.com/JiangJie/happy-opfs/main/tests/test.zip';

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
    (await fs.appendFile('/happy/b.txt', textEncode(' happy opfs'))).inspectErr(err => {
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
                assert(progress.completedByteLength <= progress.totalByteLength);
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
        assert(((await fs.uploadFile('/todo.json', mockAll).result).unwrap() as WechatMinigame.UploadFileSuccessCallbackResult).statusCode === 200);
    } else {
        assert(downloadRes.unwrapErr() instanceof Error);
    }

    {
        // Download a file to a temporary file
        const downloadTask = fs.downloadFile(mockSingle);
        const downloadRes = await downloadTask.result;
        downloadRes.inspect((x: WechatMinigame.DownloadFileSuccessCallbackResult | { tempFilePath: string; }) => {
            assert(x.tempFilePath.includes('/tmp/'));
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
                console.log(`Unzipped ${ progress.completedByteLength }/${ progress.totalByteLength } bytes`);
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
    fs.appendFileSync('/happy/b.txt', textEncode(' happy opfs'));

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

    fs.removeSync(fs.opfs.ROOT_DIR);
}

(async () => {
    await testAsync();
    testSync();
})();
