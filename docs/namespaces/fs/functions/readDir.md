[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [fs](../README.md) / readDir

# Function: readDir()

```ts
function readDir(dirPath): AsyncIOResult<string[]>
```

异步读取指定目录下的所有文件和子目录。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `dirPath` | `string` | 需要读取的目录路径。 |

## Returns

`AsyncIOResult`\<`string`[]\>

包含目录内容的字符串数组的异步操作结果。

## Defined in

[src/std/fs/fs\_async.ts:75](https://github.com/JiangJie/minigame-std/blob/0b3f4c24a764d15c8d4cfbfab659d3f6c53dfd93/src/std/fs/fs_async.ts#L75)
