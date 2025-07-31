[**minigame-std**](../README.md)

***

[minigame-std](../README.md) / FailType

# Type Alias: FailType\<T\>

```ts
type FailType<T> = T extends (params) => any ? P extends {
  fail: (err) => any;
 } ? E : never : never;
```

Defined in: [src/std/utils/promisify.ts:30](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/utils/promisify.ts#L30)

类型工具：提取失败回调参数类型。

## Type Parameters

| Type Parameter |
| ------ |
| `T` |
