[**minigame-std**](../README.md)

***

[minigame-std](../README.md) / tryDOMAsyncOp

# Function: tryDOMAsyncOp()

```ts
function tryDOMAsyncOp<T>(op): AsyncIOResult<T>
```

Defined in: [src/std/utils/mod.ts:69](https://github.com/JiangJie/minigame-std/blob/c702c23d8258d9dd96d873df515d0027c84fb302/src/std/utils/mod.ts#L69)

执行异步函数，预期异常都是 `DOMException`。

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
