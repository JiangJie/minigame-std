[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [fs](../README.md) / mkdir

# Function: mkdir()

```ts
function mkdir(dirPath): AsyncIOResult<boolean>
```

递归创建文件夹，相当于`mkdir -p`。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `dirPath` | `string` | 将要创建的目录的路径。 |

## Returns

`AsyncIOResult`\<`boolean`\>

创建成功返回 true 的异步操作结果。

## Defined in

[fs/mod.ts:64](https://github.com/JiangJie/minigame-std/blob/541deb559aa54bb90a9c59ed9d62e2fa15307533/src/std/fs/mod.ts#L64)
