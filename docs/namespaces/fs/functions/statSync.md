[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [fs](../README.md) / statSync

# Function: statSync()

## Call Signature

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

[src/std/fs/fs\_sync.ts:83](https://github.com/JiangJie/minigame-std/blob/eeac001add8ab13d21bab6e48cf53f07cd0a9aad/src/std/fs/fs_sync.ts#L83)

## Call Signature

```ts
function statSync(path, options): IOResult<WechatMinigame.FileStats[]>
```

`stat` 的同步版本。

### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |
| `options` | [`StatOptions`](../interfaces/StatOptions.md) & \{ `recursive`: `true`; \} |

### Returns

`IOResult`\<`WechatMinigame.FileStats`[]\>

### Defined in

[src/std/fs/fs\_sync.ts:84](https://github.com/JiangJie/minigame-std/blob/eeac001add8ab13d21bab6e48cf53f07cd0a9aad/src/std/fs/fs_sync.ts#L84)

## Call Signature

```ts
function statSync(path, options?): IOResult<WechatMinigame.Stats | WechatMinigame.FileStats[]>
```

`stat` 的同步版本。

### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |
| `options`? | [`StatOptions`](../interfaces/StatOptions.md) |

### Returns

`IOResult`\<`WechatMinigame.Stats` \| `WechatMinigame.FileStats`[]\>

### Defined in

[src/std/fs/fs\_sync.ts:87](https://github.com/JiangJie/minigame-std/blob/eeac001add8ab13d21bab6e48cf53f07cd0a9aad/src/std/fs/fs_sync.ts#L87)
