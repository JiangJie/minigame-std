[**minigame-std**](../README.md)

***

[minigame-std](../README.md) / ValidAPI

# Type Alias: ValidAPI\<T\>

```ts
type ValidAPI<T> = T extends (params) => infer R ? R extends void | Promise<any> ? P extends 
  | {
  success: any;
 }
  | undefined ? true : P extends 
  | {
  fail: any;
 }
  | undefined ? true : false : false : false;
```

Defined in: [src/std/utils/promisify.ts:8](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/utils/promisify.ts#L8)

类型工具：判断 API 是否符合 promisify 条件。

## Type Parameters

| Type Parameter |
| ------ |
| `T` |
