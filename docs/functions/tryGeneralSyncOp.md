[**minigame-std**](../README.md)

***

[minigame-std](../README.md) / tryGeneralSyncOp

# Function: tryGeneralSyncOp()

```ts
function tryGeneralSyncOp<T>(op): IOResult<T>
```

Defined in: [src/std/utils/mod.ts:30](https://github.com/JiangJie/minigame-std/blob/8c5db4b9c3dabb4d0435a493922f29b60a730f0d/src/std/utils/mod.ts#L30)

执行同步函数，预期异常都是 `WechatMinigame.GeneralCallbackResult`。

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
