[**minigame-std**](../README.md)

***

[minigame-std](../README.md) / miniGameFailureToResult

# Function: miniGameFailureToResult()

```ts
function miniGameFailureToResult<T>(err): IOResult<T>
```

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

## Defined in

[src/std/utils/mod.ts:21](https://github.com/JiangJie/minigame-std/blob/8633d80114dee6c79033ec094d8233bd8263bedc/src/std/utils/mod.ts#L21)
