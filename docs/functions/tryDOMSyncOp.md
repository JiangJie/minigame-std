[**minigame-std**](../README.md)

***

[minigame-std](../README.md) / tryDOMSyncOp

# Function: tryDOMSyncOp()

```ts
function tryDOMSyncOp<T>(op): IOResult<T>
```

Defined in: [src/std/utils/mod.ts:56](https://github.com/JiangJie/minigame-std/blob/c702c23d8258d9dd96d873df515d0027c84fb302/src/std/utils/mod.ts#L56)

执行同步函数，预期异常都是 `DOMException`。

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `op` | () => `T` | 需要执行的同步函数。 |

## Returns

`IOResult`\<`T`\>

IOResult。
