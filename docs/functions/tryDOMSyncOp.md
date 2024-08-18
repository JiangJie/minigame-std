[**minigame-std**](../README.md) • **Docs**

***

[minigame-std](../README.md) / tryDOMSyncOp

# Function: tryDOMSyncOp()

```ts
function tryDOMSyncOp<T>(op): IOResult<T>
```

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

## Defined in

[src/std/utils/mod.ts:56](https://github.com/JiangJie/minigame-std/blob/0b3f4c24a764d15c8d4cfbfab659d3f6c53dfd93/src/std/utils/mod.ts#L56)
