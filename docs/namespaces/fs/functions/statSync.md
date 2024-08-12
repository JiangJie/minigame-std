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

[src/std/fs/fs\_sync.ts:81](https://github.com/JiangJie/minigame-std/blob/d5a0bd55450bd8f6d3ddbc9f604a3e15ebaebf6d/src/std/fs/fs_sync.ts#L81)

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

[src/std/fs/fs\_sync.ts:82](https://github.com/JiangJie/minigame-std/blob/d5a0bd55450bd8f6d3ddbc9f604a3e15ebaebf6d/src/std/fs/fs_sync.ts#L82)

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

[src/std/fs/fs\_sync.ts:85](https://github.com/JiangJie/minigame-std/blob/d5a0bd55450bd8f6d3ddbc9f604a3e15ebaebf6d/src/std/fs/fs_sync.ts#L85)
