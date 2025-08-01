[**minigame-std**](../README.md)

***

[minigame-std](../README.md) / fetchT

# Function: fetchT()

发起一个网络请求，根据初始化配置返回对应类型的 FetchTask。

## Type Param

预期的响应数据类型。

## Param

请求的 URL 地址。

## Param

请求的初始化配置。

## Call Signature

```ts
function fetchT(url, init): FetchTask<string>
```

Defined in: [src/std/fetch/mod.ts:14](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/fetch/mod.ts#L14)

发起一个可中断的文本类型响应的网络请求。

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `url` | `string` | 请求的 URL 地址。 |
| `init` | `FetchInit` & [`MinaFetchInit`](../interfaces/MinaFetchInit.md) & \{ `responseType`: `"text"`; \} | 请求的初始化配置，指定响应类型为文本且请求可中断。 |

### Returns

`FetchTask`\<`string`\>

FetchTask。

返回一个文本类型的 FetchTask。

### Type Param

预期的响应数据类型。

### Param

请求的 URL 地址。

### Param

请求的初始化配置。

## Call Signature

```ts
function fetchT(url, init): FetchTask<ArrayBuffer>
```

Defined in: [src/std/fetch/mod.ts:24](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/fetch/mod.ts#L24)

发起一个可中断的 ArrayBuffer 类型响应的网络请求。

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `url` | `string` | 请求的 URL 地址。 |
| `init` | `FetchInit` & [`MinaFetchInit`](../interfaces/MinaFetchInit.md) & \{ `responseType`: `"arraybuffer"`; \} | 请求的初始化配置，指定响应类型为 ArrayBuffer 且请求可中断。 |

### Returns

`FetchTask`\<`ArrayBuffer`\>

FetchTask。

返回一个 ArrayBuffer 类型的 FetchTask。

### Type Param

预期的响应数据类型。

### Param

请求的 URL 地址。

### Param

请求的初始化配置。

## Call Signature

```ts
function fetchT<T>(url, init): FetchTask<T>
```

Defined in: [src/std/fetch/mod.ts:35](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/fetch/mod.ts#L35)

发起一个可中断的 JSON 类型响应的网络请求。

### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | 预期的 JSON 响应数据类型。 |

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `url` | `string` | 请求的 URL 地址。 |
| `init` | `FetchInit` & [`MinaFetchInit`](../interfaces/MinaFetchInit.md) & \{ `responseType`: `"json"`; \} | 请求的初始化配置，指定响应类型为 JSON 且请求可中断。 |

### Returns

`FetchTask`\<`T`\>

FetchTask。

返回一个 JSON 类型的 FetchTask。

### Type Param

预期的响应数据类型。

### Param

请求的 URL 地址。

### Param

请求的初始化配置。

## Call Signature

```ts
function fetchT(url, init?): FetchTask<string | Response>
```

Defined in: [src/std/fetch/mod.ts:46](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/fetch/mod.ts#L46)

发起一个可中断的网络请求，默认返回文本类型响应。

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `url` | `string` | 请求的 URL 地址。 |
| `init`? | [`UnionFetchInit`](../type-aliases/UnionFetchInit.md) | 请求的初始化配置，指定请求可中断。 |

### Returns

`FetchTask`\<`string` \| `Response`\>

FetchTask。

FetchTask。

### Type Param

预期的响应数据类型。

### Param

请求的 URL 地址。

### Param

请求的初始化配置。
