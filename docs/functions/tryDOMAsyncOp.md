[**minigame-std**](../README.md) • **Docs**

***

[minigame-std](../README.md) / tryDOMAsyncOp

# Function: tryDOMAsyncOp()

```ts
function tryDOMAsyncOp<T>(op): AsyncIOResult<T>
```

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

## Defined in

[src/std/utils/mod.ts:69](https://github.com/JiangJie/minigame-std/blob/ffbed6cccc22260d9da27c221c59422568396e08/src/std/utils/mod.ts#L69)
