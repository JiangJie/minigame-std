[**minigame-std**](../README.md) • **Docs**

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

## fetchT(url, init)

```ts
function fetchT(url, init): FetchTask<string>
```

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

### Defined in

[fetch/mod.ts:14](https://github.com/JiangJie/minigame-std/blob/66ec277d862ca15172344b727bd1c648b6b39934/src/std/fetch/mod.ts#L14)

## fetchT(url, init)

```ts
function fetchT(url, init): FetchTask<ArrayBuffer>
```

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

### Defined in

[fetch/mod.ts:24](https://github.com/JiangJie/minigame-std/blob/66ec277d862ca15172344b727bd1c648b6b39934/src/std/fetch/mod.ts#L24)

## fetchT(url, init)

```ts
function fetchT<T>(url, init): FetchTask<T>
```

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

### Defined in

[fetch/mod.ts:35](https://github.com/JiangJie/minigame-std/blob/66ec277d862ca15172344b727bd1c648b6b39934/src/std/fetch/mod.ts#L35)

## fetchT(url)

```ts
function fetchT(url): FetchTask<string | Response>
```

发起一个可中断的网络请求，默认返回文本类型响应。

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `url` | `string` | 请求的 URL 地址。 |

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

### Defined in

[fetch/mod.ts:44](https://github.com/JiangJie/minigame-std/blob/66ec277d862ca15172344b727bd1c648b6b39934/src/std/fetch/mod.ts#L44)

## fetchT(url, init)

```ts
function fetchT(url, init): FetchTask<string | Response>
```

发起一个可中断的网络请求，默认返回文本类型响应。

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `url` | `string` | 请求的 URL 地址。 |
| `init` | [`UnionFetchInit`](../type-aliases/UnionFetchInit.md) | 请求的初始化配置，指定请求可中断。 |

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

### Defined in

[fetch/mod.ts:53](https://github.com/JiangJie/minigame-std/blob/66ec277d862ca15172344b727bd1c648b6b39934/src/std/fetch/mod.ts#L53)
