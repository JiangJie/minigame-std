[**minigame-std**](../README.md)

***

[minigame-std](../README.md) / tryGeneralSyncOp

# Function: tryGeneralSyncOp()

```ts
function tryGeneralSyncOp<T>(op): IOResult<T>
```

Defined in: [src/std/utils/mod.ts:30](https://github.com/JiangJie/minigame-std/blob/ff3594872b1efbdbc13aabe99588385e855b50dc/src/std/utils/mod.ts#L30)

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
