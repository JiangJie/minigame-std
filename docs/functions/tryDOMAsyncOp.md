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

[utils/mod.ts:69](https://github.com/JiangJie/minigame-std/blob/e98ab0af7ad78dc07fcec865ee164ff1e7efe9cf/src/std/utils/mod.ts#L69)
