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

[src/std/fs/fs\_sync.ts:83](https://github.com/JiangJie/minigame-std/blob/0b3f4c24a764d15c8d4cfbfab659d3f6c53dfd93/src/std/fs/fs_sync.ts#L83)

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

[src/std/fs/fs\_sync.ts:84](https://github.com/JiangJie/minigame-std/blob/0b3f4c24a764d15c8d4cfbfab659d3f6c53dfd93/src/std/fs/fs_sync.ts#L84)

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

[src/std/fs/fs\_sync.ts:87](https://github.com/JiangJie/minigame-std/blob/0b3f4c24a764d15c8d4cfbfab659d3f6c53dfd93/src/std/fs/fs_sync.ts#L87)
