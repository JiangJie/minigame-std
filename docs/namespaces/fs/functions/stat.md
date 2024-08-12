[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [fs](../README.md) / stat

# Function: stat()

获取文件或目录的状态信息。

## Param

文件或目录的路径。

## Param

可选选项。

## stat(path)

```ts
function stat(path): AsyncIOResult<WechatMinigame.Stats>
```

获取文件或目录的状态信息。

### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |

### Returns

`AsyncIOResult`\<`WechatMinigame.Stats`\>

### Param

文件或目录的路径。

### Param

可选选项。

### Defined in

[src/std/fs/fs\_async.ts:105](https://github.com/JiangJie/minigame-std/blob/d5a0bd55450bd8f6d3ddbc9f604a3e15ebaebf6d/src/std/fs/fs_async.ts#L105)

## stat(path, options)

```ts
function stat(path, options): AsyncIOResult<WechatMinigame.FileStats[]>
```

获取文件或目录的状态信息。

### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |
| `options` | [`StatOptions`](../interfaces/StatOptions.md) & \{ `recursive`: `true`; \} |

### Returns

`AsyncIOResult`\<`WechatMinigame.FileStats`[]\>

### Param

文件或目录的路径。

### Param

可选选项。

### Defined in

[src/std/fs/fs\_async.ts:106](https://github.com/JiangJie/minigame-std/blob/d5a0bd55450bd8f6d3ddbc9f604a3e15ebaebf6d/src/std/fs/fs_async.ts#L106)

## stat(path, options)

```ts
function stat(path, options?): AsyncIOResult<WechatMinigame.Stats | WechatMinigame.FileStats[]>
```

获取文件或目录的状态信息。

### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |
| `options`? | [`StatOptions`](../interfaces/StatOptions.md) |

### Returns

`AsyncIOResult`\<`WechatMinigame.Stats` \| `WechatMinigame.FileStats`[]\>

### Param

文件或目录的路径。

### Param

可选选项。

### Defined in

[src/std/fs/fs\_async.ts:109](https://github.com/JiangJie/minigame-std/blob/d5a0bd55450bd8f6d3ddbc9f604a3e15ebaebf6d/src/std/fs/fs_async.ts#L109)
