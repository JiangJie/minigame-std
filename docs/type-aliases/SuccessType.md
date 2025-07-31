[**minigame-std**](../README.md)

***

[minigame-std](../README.md) / SuccessType

# Type Alias: SuccessType\<T\>

```ts
type SuccessType<T> = T extends (params) => any ? P extends {
  success: (res) => any;
 } ? S : never : never;
```

Defined in: [src/std/utils/promisify.ts:21](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/utils/promisify.ts#L21)

类型工具：提取成功回调参数类型。

## Type Parameters

| Type Parameter |
| ------ |
| `T` |
