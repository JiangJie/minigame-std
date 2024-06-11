[**minigame-std**](../../../index.md) • **Docs**

***

[minigame-std](../../../index.md) / [fs](../index.md) / emptyDir

# Function: emptyDir()

```ts
function emptyDir(dirPath): AsyncIOResult<boolean>
```

清空指定目录下的所有文件和子目录。

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `dirPath` | `string` | 目录路径。 |

## Returns

`AsyncIOResult`\<`boolean`\>

清空成功返回 true 的异步操作结果。

## Source

[src/std/fs/mod.ts:185](https://github.com/JiangJie/minigame-std/blob/fe87039c9bf9e09f2936bdac3b9a02fcf5e4b50c/src/std/fs/mod.ts#L185)
