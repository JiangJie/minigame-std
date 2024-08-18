[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [fs](../README.md) / zip

# Function: zip()

## zip(sourcePath, options)

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

[src/std/fs/fs\_async.ts:281](https://github.com/JiangJie/minigame-std/blob/0b3f4c24a764d15c8d4cfbfab659d3f6c53dfd93/src/std/fs/fs_async.ts#L281)

## zip(sourcePath, zipFilePath, options)

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

[src/std/fs/fs\_async.ts:289](https://github.com/JiangJie/minigame-std/blob/0b3f4c24a764d15c8d4cfbfab659d3f6c53dfd93/src/std/fs/fs_async.ts#L289)
