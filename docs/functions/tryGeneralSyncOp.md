[**minigame-std**](../README.md) • **Docs**

***

[minigame-std](../README.md) / tryGeneralSyncOp

# Function: tryGeneralSyncOp()

```ts
function tryGeneralSyncOp<T>(op): IOResult<T>
```

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

## Defined in

[src/std/utils/mod.ts:30](https://github.com/JiangJie/minigame-std/blob/ffbed6cccc22260d9da27c221c59422568396e08/src/std/utils/mod.ts#L30)
