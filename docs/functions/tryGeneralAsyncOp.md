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

[src/std/utils/mod.ts:43](https://github.com/JiangJie/minigame-std/blob/0b3f4c24a764d15c8d4cfbfab659d3f6c53dfd93/src/std/utils/mod.ts#L43)
