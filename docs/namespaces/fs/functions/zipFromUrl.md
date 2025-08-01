[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [fs](../README.md) / zipFromUrl

# Function: zipFromUrl()

## Call Signature

```ts
function zipFromUrl(sourceUrl, options?): AsyncIOResult<Uint8Array<ArrayBufferLike>>
```

Defined in: [src/std/fs/fs\_async.ts:309](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/fs/fs_async.ts#L309)

下载文件并压缩到内存。

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `sourceUrl` | `string` | 要下载的文件 URL。 |
| `options`? | [`ZipFromUrlOptions`](../type-aliases/ZipFromUrlOptions.md) | 合并的下载和压缩选项。 |

### Returns

`AsyncIOResult`\<`Uint8Array`\<`ArrayBufferLike`\>\>

## Call Signature

```ts
function zipFromUrl(
   sourceUrl, 
   zipFilePath, 
   options?): AsyncVoidIOResult
```

Defined in: [src/std/fs/fs\_async.ts:316](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/fs/fs_async.ts#L316)

下载文件并压缩为 zip 文件。

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `sourceUrl` | `string` | 要下载的文件 URL。 |
| `zipFilePath` | `string` | 要输出的 zip 文件路径。 |
| `options`? | [`ZipFromUrlOptions`](../type-aliases/ZipFromUrlOptions.md) | 合并的下载和压缩选项。 |

### Returns

`AsyncVoidIOResult`
