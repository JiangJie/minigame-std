[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [fs](../README.md) / zip

# Function: zip()

## Call Signature

```ts
function zip(sourcePath, options?): AsyncIOResult<Uint8Array<ArrayBufferLike>>
```

Defined in: [src/std/fs/fs\_async.ts:283](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/fs/fs_async.ts#L283)

压缩文件到内存。

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `sourcePath` | `string` | 需要压缩的文件（夹）路径。 |
| `options`? | `ZipOptions` | 可选的压缩参数。 |

### Returns

`AsyncIOResult`\<`Uint8Array`\<`ArrayBufferLike`\>\>

压缩成功的异步结果。

## Call Signature

```ts
function zip(
   sourcePath, 
   zipFilePath, 
   options?): AsyncVoidIOResult
```

Defined in: [src/std/fs/fs\_async.ts:291](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/fs/fs_async.ts#L291)

压缩文件。

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `sourcePath` | `string` | 需要压缩的文件（夹）路径。 |
| `zipFilePath` | `string` | 压缩后的 zip 文件路径。 |
| `options`? | `ZipOptions` | 可选的压缩参数。 |

### Returns

`AsyncVoidIOResult`

压缩成功的异步结果。
