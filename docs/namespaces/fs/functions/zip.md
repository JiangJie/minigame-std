[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [fs](../README.md) / zip

# Function: zip()

## Call Signature

```ts
function zip(sourcePath, options?): AsyncIOResult<Uint8Array>
```

压缩文件到内存。

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `sourcePath` | `string` | 需要压缩的文件（夹）路径。 |
| `options`? | `ZipOptions` | 可选的压缩参数。 |

### Returns

`AsyncIOResult`\<`Uint8Array`\>

压缩成功的异步结果。

### Defined in

[src/std/fs/fs\_async.ts:281](https://github.com/JiangJie/minigame-std/blob/eeac001add8ab13d21bab6e48cf53f07cd0a9aad/src/std/fs/fs_async.ts#L281)

## Call Signature

```ts
function zip(
   sourcePath, 
   zipFilePath, 
   options?): AsyncVoidIOResult
```

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

### Defined in

[src/std/fs/fs\_async.ts:289](https://github.com/JiangJie/minigame-std/blob/eeac001add8ab13d21bab6e48cf53f07cd0a9aad/src/std/fs/fs_async.ts#L289)
