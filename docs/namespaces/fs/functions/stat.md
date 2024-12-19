[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [fs](../README.md) / stat

# Function: stat()

获取文件或目录的状态信息。

## Param

文件或目录的路径。

## Param

可选选项。

## Call Signature

```ts
function stat(path): AsyncIOResult<WechatMinigame.Stats>
```

### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |

### Returns

`AsyncIOResult`\<`WechatMinigame.Stats`\>

### Defined in

[src/std/fs/fs\_async.ts:107](https://github.com/JiangJie/minigame-std/blob/eeac001add8ab13d21bab6e48cf53f07cd0a9aad/src/std/fs/fs_async.ts#L107)

## Call Signature

```ts
function stat(path, options): AsyncIOResult<WechatMinigame.FileStats[]>
```

### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |
| `options` | [`StatOptions`](../interfaces/StatOptions.md) & \{ `recursive`: `true`; \} |

### Returns

`AsyncIOResult`\<`WechatMinigame.FileStats`[]\>

### Defined in

[src/std/fs/fs\_async.ts:108](https://github.com/JiangJie/minigame-std/blob/eeac001add8ab13d21bab6e48cf53f07cd0a9aad/src/std/fs/fs_async.ts#L108)

## Call Signature

```ts
function stat(path, options?): AsyncIOResult<WechatMinigame.Stats | WechatMinigame.FileStats[]>
```

### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |
| `options`? | [`StatOptions`](../interfaces/StatOptions.md) |

### Returns

`AsyncIOResult`\<`WechatMinigame.Stats` \| `WechatMinigame.FileStats`[]\>

### Defined in

[src/std/fs/fs\_async.ts:111](https://github.com/JiangJie/minigame-std/blob/eeac001add8ab13d21bab6e48cf53f07cd0a9aad/src/std/fs/fs_async.ts#L111)
