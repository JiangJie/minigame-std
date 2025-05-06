[**minigame-std**](../README.md)

***

[minigame-std](../README.md) / tryGeneralAsyncOp

# Function: tryGeneralAsyncOp()

```ts
function tryGeneralAsyncOp<T>(op): AsyncIOResult<T>
```

Defined in: [src/std/utils/mod.ts:43](https://github.com/JiangJie/minigame-std/blob/8c5db4b9c3dabb4d0435a493922f29b60a730f0d/src/std/utils/mod.ts#L43)

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
