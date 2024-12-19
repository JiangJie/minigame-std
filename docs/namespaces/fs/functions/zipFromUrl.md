[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [fs](../README.md) / zipFromUrl

# Function: zipFromUrl()

## Call Signature

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

[src/std/fs/fs\_async.ts:307](https://github.com/JiangJie/minigame-std/blob/eeac001add8ab13d21bab6e48cf53f07cd0a9aad/src/std/fs/fs_async.ts#L307)

## Call Signature

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

[src/std/fs/fs\_async.ts:314](https://github.com/JiangJie/minigame-std/blob/eeac001add8ab13d21bab6e48cf53f07cd0a9aad/src/std/fs/fs_async.ts#L314)
