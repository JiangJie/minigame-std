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

[fs/fs\_async.ts:95](https://github.com/JiangJie/minigame-std/blob/1d046e44c5931182cced8ad59c3bf51847c8ead7/src/std/fs/fs_async.ts#L95)

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

[fs/fs\_async.ts:96](https://github.com/JiangJie/minigame-std/blob/1d046e44c5931182cced8ad59c3bf51847c8ead7/src/std/fs/fs_async.ts#L96)

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

[fs/fs\_async.ts:99](https://github.com/JiangJie/minigame-std/blob/1d046e44c5931182cced8ad59c3bf51847c8ead7/src/std/fs/fs_async.ts#L99)
