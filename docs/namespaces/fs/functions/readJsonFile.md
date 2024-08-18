[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [fs](../README.md) / readJsonFile

# Function: readJsonFile()

```ts
function readJsonFile<T>(filePath): AsyncIOResult<T>
```

读取文件并解析为 JSON。

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `filePath` | `string` | 文件路径。 |

## Returns

`AsyncIOResult`\<`T`\>

读取结果。

## Defined in

[src/std/fs/fs\_async.ts:203](https://github.com/JiangJie/minigame-std/blob/0b3f4c24a764d15c8d4cfbfab659d3f6c53dfd93/src/std/fs/fs_async.ts#L203)
