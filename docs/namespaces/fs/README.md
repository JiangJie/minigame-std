[**minigame-std**](../../README.md) • **Docs**

***

[minigame-std](../../README.md) / fs

# fs

## Index

### Interfaces

| Interface | Description |
| ------ | ------ |
| [DownloadFileOptions](interfaces/DownloadFileOptions.md) | Options for downloading files. |
| [ReadOptions](interfaces/ReadOptions.md) | Options for reading files with specified encoding. |
| [StatOptions](interfaces/StatOptions.md) | Options for stat operations. |
| [UploadFileOptions](interfaces/UploadFileOptions.md) | Options for uploading files. |

### Type Aliases

| Type alias | Description |
| ------ | ------ |
| [FileEncoding](type-aliases/FileEncoding.md) | Supported file encodings for reading and writing files. |
| [ReadFileContent](type-aliases/ReadFileContent.md) | File content type for read result, support `ArrayBuffer` `string`. |
| [UnionDownloadFileOptions](type-aliases/UnionDownloadFileOptions.md) | Options for union requests. |
| [UnionUploadFileOptions](type-aliases/UnionUploadFileOptions.md) | Options for union requests. |
| [WriteFileContent](type-aliases/WriteFileContent.md) | File content type for write, support `ArrayBuffer` `TypedArray` `string`. |
| [ZipFromUrlOptions](type-aliases/ZipFromUrlOptions.md) | Union options for `unzipFromUrl`. |

### Functions

| Function | Description |
| ------ | ------ |
| [appendFile](functions/appendFile.md) | 向文件追加内容。 |
| [appendFileSync](functions/appendFileSync.md) | `appendFile` 的同步版本。 |
| [copy](functions/copy.md) | 复制文件或文件夹。 |
| [copySync](functions/copySync.md) | `copy` 的同步版本。 |
| [downloadFile](functions/downloadFile.md) | 下载文件并保存到临时文件。 |
| [emptyDir](functions/emptyDir.md) | 清空指定目录下的所有文件和子目录。 |
| [emptyDirSync](functions/emptyDirSync.md) | `emptyDir` 的同步版本。 |
| [exists](functions/exists.md) | 检查指定路径的文件或目录是否存在。 |
| [existsSync](functions/existsSync.md) | `exists` 的同步版本。 |
| [mkdir](functions/mkdir.md) | 递归创建文件夹，相当于`mkdir -p`。 |
| [mkdirSync](functions/mkdirSync.md) | `mkdir` 的同步版本。 |
| [move](functions/move.md) | 重命名文件或目录。 |
| [moveSync](functions/moveSync.md) | `move` 的同步版本。 |
| [readDir](functions/readDir.md) | 异步读取指定目录下的所有文件和子目录。 |
| [readDirSync](functions/readDirSync.md) | `readDir` 的同步版本。 |
| [readFile](functions/readFile.md) | 读取文件内容。 |
| [readFileSync](functions/readFileSync.md) | `readFile` 的同步版本。 |
| [readJsonFile](functions/readJsonFile.md) | 读取文件并解析为 JSON。 |
| [readJsonFileSync](functions/readJsonFileSync.md) | `readJsonFile` 的同步版本。 |
| [readTextFile](functions/readTextFile.md) | 读取文本文件的内容。 |
| [readTextFileSync](functions/readTextFileSync.md) | `readTextFile` 的同步版本。 |
| [remove](functions/remove.md) | 删除文件或目录。 |
| [removeSync](functions/removeSync.md) | `remove` 的同步版本。 |
| [stat](functions/stat.md) | - |
| [statSync](functions/statSync.md) | `stat` 的同步版本。 |
| [unzip](functions/unzip.md) | 解压 zip 文件。 |
| [unzipFromUrl](functions/unzipFromUrl.md) | 从网络下载 zip 文件并解压。 |
| [unzipSync](functions/unzipSync.md) | `unzip` 的同步版本。 |
| [uploadFile](functions/uploadFile.md) | 上传本地文件。 |
| [writeFile](functions/writeFile.md) | 写入文件，不存在则创建，同时创建对应目录，contents只支持ArrayBuffer和string，并且需要确保string一定是utf8编码的。 |
| [writeFileSync](functions/writeFileSync.md) | `writeFile` 的同步版本。 |
| [zip](functions/zip.md) | 压缩文件到内存。 |
| [zipFromUrl](functions/zipFromUrl.md) | 下载文件并压缩到内存。 |
| [zipSync](functions/zipSync.md) | `zip` 的同步版本。 |
