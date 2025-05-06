[**minigame-std**](../README.md)

***

[minigame-std](../README.md) / miniGameFailureToResult

# Function: miniGameFailureToResult()

```ts
function miniGameFailureToResult<T>(err): IOResult<T>
```

Defined in: [src/std/utils/mod.ts:21](https://github.com/JiangJie/minigame-std/blob/8c5db4b9c3dabb4d0435a493922f29b60a730f0d/src/std/utils/mod.ts#L21)

将错误对象转换为 IOResult 类型。

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | Result 的 Ok 类型。 |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `err` | `GeneralCallbackResult` | 错误对象。 |

## Returns

`IOResult`\<`T`\>

转换后的 IOResult 对象。
