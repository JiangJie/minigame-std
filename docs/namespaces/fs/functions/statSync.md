[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [fs](../README.md) / statSync

# Function: statSync()

## Call Signature

```ts
function statSync(path): IOResult<Stats>
```

Defined in: [src/std/fs/fs\_sync.ts:83](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/fs/fs_sync.ts#L83)

`stat` 的同步版本。

### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |

### Returns

`IOResult`\<`Stats`\>

## Call Signature

```ts
function statSync(path, options): IOResult<FileStats[]>
```

Defined in: [src/std/fs/fs\_sync.ts:84](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/fs/fs_sync.ts#L84)

`stat` 的同步版本。

### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |
| `options` | [`StatOptions`](../interfaces/StatOptions.md) & \{ `recursive`: `true`; \} |

### Returns

`IOResult`\<`FileStats`[]\>

## Call Signature

```ts
function statSync(path, options?): IOResult<Stats | FileStats[]>
```

Defined in: [src/std/fs/fs\_sync.ts:87](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/fs/fs_sync.ts#L87)

`stat` 的同步版本。

### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |
| `options`? | [`StatOptions`](../interfaces/StatOptions.md) |

### Returns

`IOResult`\<`Stats` \| `FileStats`[]\>
