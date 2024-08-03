[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [fs](../README.md) / statSync

# Function: statSync()

## statSync(path)

```ts
function statSync(path): IOResult<WechatMinigame.Stats>
```

`stat` 的同步版本。

### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |

### Returns

`IOResult`\<`WechatMinigame.Stats`\>

### Defined in

[fs/fs\_sync.ts:74](https://github.com/JiangJie/minigame-std/blob/1d046e44c5931182cced8ad59c3bf51847c8ead7/src/std/fs/fs_sync.ts#L74)

## statSync(path, options)

```ts
function statSync(path, options): IOResult<WechatMinigame.FileStats[]>
```

### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |
| `options` | [`StatOptions`](../interfaces/StatOptions.md) & \{ `recursive`: `true`; \} |

### Returns

`IOResult`\<`WechatMinigame.FileStats`[]\>

### Defined in

[fs/fs\_sync.ts:75](https://github.com/JiangJie/minigame-std/blob/1d046e44c5931182cced8ad59c3bf51847c8ead7/src/std/fs/fs_sync.ts#L75)

## statSync(path, options)

```ts
function statSync(path, options?): IOResult<WechatMinigame.Stats | WechatMinigame.FileStats[]>
```

### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |
| `options`? | [`StatOptions`](../interfaces/StatOptions.md) |

### Returns

`IOResult`\<`WechatMinigame.Stats` \| `WechatMinigame.FileStats`[]\>

### Defined in

[fs/fs\_sync.ts:78](https://github.com/JiangJie/minigame-std/blob/1d046e44c5931182cced8ad59c3bf51847c8ead7/src/std/fs/fs_sync.ts#L78)
