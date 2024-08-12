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

[src/std/fs/fs\_async.ts:270](https://github.com/JiangJie/minigame-std/blob/22787d0fd0cff776ed579de48ccf7523d9e4ce53/src/std/fs/fs_async.ts#L270)

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

[src/std/fs/fs\_async.ts:278](https://github.com/JiangJie/minigame-std/blob/22787d0fd0cff776ed579de48ccf7523d9e4ce53/src/std/fs/fs_async.ts#L278)
