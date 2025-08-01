[**minigame-std**](../README.md)

***

[minigame-std](../README.md) / miniGameFailureToError

# Function: miniGameFailureToError()

```ts
function miniGameFailureToError(err): Error
```

Defined in: [src/std/utils/mod.ts:12](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/utils/mod.ts#L12)

将小游戏失败回调的结果转换为 `Error` 类型。

如果是异步 API 的 `fail` 回调返回的结果通常是 `WechatMinigame.GeneralCallbackResult` 或者变体类型，
如果是同步 API throw 的异常通常是一个类似 `Error` 的类型。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `err` | `Error` \| `GeneralCallbackResult` | 小游戏错误对象。 |

## Returns

`Error`

转换后的 `Error` 对象。
