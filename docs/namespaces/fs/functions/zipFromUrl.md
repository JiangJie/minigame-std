[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [fs](../README.md) / zipFromUrl

# Function: zipFromUrl()

## zipFromUrl(sourceUrl, options)

```ts
function zipFromUrl(sourceUrl, options?): AsyncIOResult<Uint8Array>
```

下载文件并压缩到内存。

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `sourceUrl` | `string` | 要下载的文件 URL。 |
| `options`? | [`ZipFromUrlOptions`](../type-aliases/ZipFromUrlOptions.md) | 合并的下载和压缩选项。 |

### Returns

`AsyncIOResult`\<`Uint8Array`\>

### Defined in

[src/std/fs/fs\_async.ts:296](https://github.com/JiangJie/minigame-std/blob/d5a0bd55450bd8f6d3ddbc9f604a3e15ebaebf6d/src/std/fs/fs_async.ts#L296)

## zipFromUrl(sourceUrl, zipFilePath, options)

```ts
function zipFromUrl(
   sourceUrl, 
   zipFilePath, 
   options?): AsyncVoidIOResult
```

下载文件并压缩为 zip 文件。

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `sourceUrl` | `string` | 要下载的文件 URL。 |
| `zipFilePath` | `string` | 要输出的 zip 文件路径。 |
| `options`? | [`ZipFromUrlOptions`](../type-aliases/ZipFromUrlOptions.md) | 合并的下载和压缩选项。 |

### Returns

`AsyncVoidIOResult`

### Defined in

[src/std/fs/fs\_async.ts:303](https://github.com/JiangJie/minigame-std/blob/d5a0bd55450bd8f6d3ddbc9f604a3e15ebaebf6d/src/std/fs/fs_async.ts#L303)
