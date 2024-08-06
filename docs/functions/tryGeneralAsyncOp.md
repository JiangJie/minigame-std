[**minigame-std**](../README.md) • **Docs**

***

[minigame-std](../README.md) / tryGeneralAsyncOp

# Function: tryGeneralAsyncOp()

```ts
function tryGeneralAsyncOp<T>(op): AsyncIOResult<T>
```

执行异步函数，预期异常都是 `WechatMinigame.GeneralCallbackResult`。

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `op` | () => `Promise`\<`T`\> | 需要执行的异步函数。 |

## Returns

`AsyncIOResult`\<`T`\>

AsyncIOResult。

## Defined in

[utils/mod.ts:42](https://github.com/JiangJie/minigame-std/blob/baaa9364b1809237ffe9720be3ef4dba617567c9/src/std/utils/mod.ts#L42)