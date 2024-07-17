[**minigame-std**](../README.md) • **Docs**

***

[minigame-std](../README.md) / fetchT

# Function: fetchT()

发起一个网络请求，根据初始化配置返回对应类型的 FetchTask 或 AsyncIOResult。

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
| `init` | `FetchInit` & [`MinaFetchInit`](../interfaces/MinaFetchInit.md) & \{ `abortable`: `true`; `responseType`: `"text"`; \} | 请求的初始化配置，指定响应类型为文本且请求可中断。 |

### Returns

`FetchTask`\<`string`\>

返回一个文本类型的 FetchTask。

### Defined in

[fetch/mod.ts:15](https://github.com/JiangJie/minigame-std/blob/1187f9b62000e3d29782e461fb54ceb4107f512c/src/std/fetch/mod.ts#L15)

## fetchT(url, init)

```ts
function fetchT(url, init): FetchTask<ArrayBuffer>
```

发起一个可中断的 ArrayBuffer 类型响应的网络请求。

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `url` | `string` | 请求的 URL 地址。 |
| `init` | `FetchInit` & [`MinaFetchInit`](../interfaces/MinaFetchInit.md) & \{ `abortable`: `true`; `responseType`: `"arraybuffer"`; \} | 请求的初始化配置，指定响应类型为 ArrayBuffer 且请求可中断。 |

### Returns

`FetchTask`\<`ArrayBuffer`\>

返回一个 ArrayBuffer 类型的 FetchTask。

### Defined in

[fetch/mod.ts:26](https://github.com/JiangJie/minigame-std/blob/1187f9b62000e3d29782e461fb54ceb4107f512c/src/std/fetch/mod.ts#L26)

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
| `init` | `FetchInit` & [`MinaFetchInit`](../interfaces/MinaFetchInit.md) & \{ `abortable`: `true`; `responseType`: `"json"`; \} | 请求的初始化配置，指定响应类型为 JSON 且请求可中断。 |

### Returns

`FetchTask`\<`T`\>

返回一个 JSON 类型的 FetchTask。

### Defined in

[fetch/mod.ts:38](https://github.com/JiangJie/minigame-std/blob/1187f9b62000e3d29782e461fb54ceb4107f512c/src/std/fetch/mod.ts#L38)

## fetchT(url, init)

```ts
function fetchT(url, init): AsyncIOResult<string>
```

发起一个文本类型响应的网络请求。

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `url` | `string` | 请求的 URL 地址。 |
| `init` | `FetchInit` & [`MinaFetchInit`](../interfaces/MinaFetchInit.md) & \{ `responseType`: `"text"`; \} | 请求的初始化配置，指定响应类型为文本。 |

### Returns

`AsyncIOResult`\<`string`\>

返回一个文本类型的 AsyncIOResult。

### Defined in

[fetch/mod.ts:49](https://github.com/JiangJie/minigame-std/blob/1187f9b62000e3d29782e461fb54ceb4107f512c/src/std/fetch/mod.ts#L49)

## fetchT(url, init)

```ts
function fetchT(url, init): AsyncIOResult<ArrayBuffer>
```

发起一个 ArrayBuffer 类型响应的网络请求。

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `url` | `string` | 请求的 URL 地址。 |
| `init` | `FetchInit` & [`MinaFetchInit`](../interfaces/MinaFetchInit.md) & \{ `responseType`: `"arraybuffer"`; \} | 请求的初始化配置，指定响应类型为 ArrayBuffer。 |

### Returns

`AsyncIOResult`\<`ArrayBuffer`\>

返回一个 ArrayBuffer 类型的 AsyncIOResult。

### Defined in

[fetch/mod.ts:59](https://github.com/JiangJie/minigame-std/blob/1187f9b62000e3d29782e461fb54ceb4107f512c/src/std/fetch/mod.ts#L59)

## fetchT(url, init)

```ts
function fetchT<T>(url, init): AsyncIOResult<T>
```

发起一个 JSON 类型响应的网络请求。

### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | 预期的 JSON 响应数据类型。 |

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `url` | `string` | 请求的 URL 地址。 |
| `init` | `FetchInit` & [`MinaFetchInit`](../interfaces/MinaFetchInit.md) & \{ `responseType`: `"json"`; \} | 请求的初始化配置，指定响应类型为 JSON。 |

### Returns

`AsyncIOResult`\<`T`\>

返回一个 JSON 类型的 AsyncIOResult。

### Defined in

[fetch/mod.ts:70](https://github.com/JiangJie/minigame-std/blob/1187f9b62000e3d29782e461fb54ceb4107f512c/src/std/fetch/mod.ts#L70)

## fetchT(url, init)

```ts
function fetchT(url, init): FetchTask<string>
```

发起一个可中断的网络请求，默认返回文本类型响应。

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `url` | `string` | 请求的 URL 地址。 |
| `init` | `FetchInit` & [`MinaFetchInit`](../interfaces/MinaFetchInit.md) & \{ `abortable`: `true`; \} | 请求的初始化配置，指定请求可中断。 |

### Returns

`FetchTask`\<`string`\>

返回一个文本类型的 FetchTask。

### Defined in

[fetch/mod.ts:80](https://github.com/JiangJie/minigame-std/blob/1187f9b62000e3d29782e461fb54ceb4107f512c/src/std/fetch/mod.ts#L80)

## fetchT(url, init)

```ts
function fetchT(url, init): AsyncIOResult<string>
```

发起一个不可中断的网络请求，默认返回文本类型响应。

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `url` | `string` | 请求的 URL 地址。 |
| `init` | `FetchInit` & [`MinaFetchInit`](../interfaces/MinaFetchInit.md) & \{ `abortable`: `false`; \} | 请求的初始化配置，指定请求不可中断。 |

### Returns

`AsyncIOResult`\<`string`\>

返回一个文本类型的 AsyncIOResult。

### Defined in

[fetch/mod.ts:90](https://github.com/JiangJie/minigame-std/blob/1187f9b62000e3d29782e461fb54ceb4107f512c/src/std/fetch/mod.ts#L90)

## fetchT(url, init)

```ts
function fetchT<T>(url, init?): FetchTask<T> | AsyncIOResult<T>
```

发起一个网络请求，根据初始化配置返回对应类型的 FetchTask 或 AsyncIOResult。

### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` | 预期的响应数据类型。 |

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `url` | `string` | 请求的 URL 地址。 |
| `init`? | [`UnionFetchInit`](../type-aliases/UnionFetchInit.md) | 请求的初始化配置。 |

### Returns

`FetchTask`\<`T`\> \| `AsyncIOResult`\<`T`\>

根据配置返回 FetchTask 或 AsyncIOResult。

### Defined in

[fetch/mod.ts:101](https://github.com/JiangJie/minigame-std/blob/1187f9b62000e3d29782e461fb54ceb4107f512c/src/std/fetch/mod.ts#L101)
