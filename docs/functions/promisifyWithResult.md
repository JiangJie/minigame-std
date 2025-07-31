[**minigame-std**](../README.md)

***

[minigame-std](../README.md) / promisifyWithResult

# Function: promisifyWithResult()

```ts
function promisifyWithResult<F, T, E>(api): ValidAPI<F> extends true ? (...args) => AsyncResult<T, E> : never
```

Defined in: [src/std/utils/promisify.ts:44](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/utils/promisify.ts#L44)

将小游戏异步 API 转换为返回 `AsyncResult<T, E>` 的新函数，需要转换的 API 必须是接受可选 `success` 和 `fail` 回调的函数，并且其返回值必须是 `void` 或 `Promise`。

其中 `T` 为 `success` 回调的参数类型，`E` 为 `fail` 回调的参数类型。

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `F` *extends* (...`args`) => `any` | - |
| `T` | [`SuccessType`](../type-aliases/SuccessType.md)\<`F`\> |
| `E` | [`FailType`](../type-aliases/FailType.md)\<`F`\> |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `api` | `F` | 小游戏异步 API。 |

## Returns

[`ValidAPI`](../type-aliases/ValidAPI.md)\<`F`\> *extends* `true` ? (...`args`) => `AsyncResult`\<`T`, `E`\> : `never`

返回一个新的函数，该函数返回 `AsyncResult<T, E>`。
