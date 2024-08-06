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

[fs/fs\_sync.ts:79](https://github.com/JiangJie/minigame-std/blob/e98ab0af7ad78dc07fcec865ee164ff1e7efe9cf/src/std/fs/fs_sync.ts#L79)

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

[fs/fs\_sync.ts:80](https://github.com/JiangJie/minigame-std/blob/e98ab0af7ad78dc07fcec865ee164ff1e7efe9cf/src/std/fs/fs_sync.ts#L80)

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

[fs/fs\_sync.ts:83](https://github.com/JiangJie/minigame-std/blob/e98ab0af7ad78dc07fcec865ee164ff1e7efe9cf/src/std/fs/fs_sync.ts#L83)
