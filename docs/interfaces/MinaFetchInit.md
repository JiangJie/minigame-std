[**minigame-std**](../README.md) • **Docs**

***

[minigame-std](../README.md) / MinaFetchInit

# Interface: MinaFetchInit

微信小游戏网络请求初始化配置接口，继承自微信小游戏请求选项，除去'url'和'responseType'。

## Extends

- `Omit`\<`WechatMinigame.RequestOption`, `"url"` \| `"responseType"`\>

## Properties

| Property | Type | Description | Inherited from |
| :------ | :------ | :------ | :------ |
| `abortable?` | `boolean` | - | - |
| `complete?` | `RequestCompleteCallback` | 接口调用结束的回调函数（调用成功、失败都会执行） | `Omit.complete` |
| `data?` | `string` \| `ArrayBuffer` \| `IAnyObject` | 请求的参数 | `Omit.data` |
| `dataType?` | `"json"` \| `"其他"` | <p>返回的数据格式</p><p>可选值：</p><ul><li>'json': 返回的数据为 JSON，返回后会对返回的数据进行一次 JSON.parse;</li><li>'其他': 不对返回的内容进行 JSON.parse;</li></ul> | `Omit.dataType` |
| `enableCache?` | `boolean` | <p>需要基础库： `2.10.4`</p><p>开启 cache</p> | `Omit.enableCache` |
| `enableChunked?` | `boolean` | <p>需要基础库： `2.20.2`</p><p>开启 transfer-encoding chunked。</p> | `Omit.enableChunked` |
| `enableHttp2?` | `boolean` | <p>需要基础库： `2.10.4`</p><p>开启 http2</p> | `Omit.enableHttp2` |
| `enableHttpDNS?` | `boolean` | <p>需要基础库： `2.19.1`</p><p>是否开启 HttpDNS 服务。如开启，需要同时填入 httpDNSServiceId 。 HttpDNS 用法详见 [移动解析HttpDNS](https://developers.weixin.qq.com/miniprogram/dev/framework/ability/HTTPDNS.html)</p> | `Omit.enableHttpDNS` |
| `enableQuic?` | `boolean` | <p>需要基础库： `2.10.4`</p><p>开启 quic</p> | `Omit.enableQuic` |
| `fail?` | `RequestFailCallback` | 接口调用失败的回调函数 | `Omit.fail` |
| `forceCellularNetwork?` | `boolean` | <p>需要基础库： `2.21.0`</p><p>强制使用蜂窝网络发送请求</p> | `Omit.forceCellularNetwork` |
| `header?` | `IAnyObject` | <p>设置请求的 header，header 中不能设置 Referer。</p><p>`content-type` 默认为 `application/json`</p> | `Omit.header` |
| `httpDNSServiceId?` | `string` | <p>需要基础库： `2.19.1`</p><p>HttpDNS 服务商 Id。 HttpDNS 用法详见 [移动解析HttpDNS](https://developers.weixin.qq.com/miniprogram/dev/framework/ability/HTTPDNS.html)</p> | `Omit.httpDNSServiceId` |
| `method?` |  \| `"OPTIONS"` \| `"GET"` \| `"HEAD"` \| `"POST"` \| `"PUT"` \| `"DELETE"` \| `"TRACE"` \| `"CONNECT"` | <p>HTTP 请求方法</p><p>可选值：</p><ul><li>'OPTIONS': HTTP 请求 OPTIONS;</li><li>'GET': HTTP 请求 GET;</li><li>'HEAD': HTTP 请求 HEAD;</li><li>'POST': HTTP 请求 POST;</li><li>'PUT': HTTP 请求 PUT;</li><li>'DELETE': HTTP 请求 DELETE;</li><li>'TRACE': HTTP 请求 TRACE;</li><li>'CONNECT': HTTP 请求 CONNECT;</li></ul> | `Omit.method` |
| `redirect?` | `"follow"` \| `"manual"` | <p>需要基础库： `3.2.2`</p><p>重定向拦截策略。（目前仅安卓和iOS端支持，开发者工具和PC端将在后续支持）</p><p>可选值：</p><ul><li>'follow': 不拦截重定向，即客户端自动处理重定向;</li><li>'manual': 拦截重定向。开启后，当 http 状态码为 3xx 时客户端不再自动重定向，而是触发 onHeadersReceived 回调，并结束本次 request 请求。可通过 onHeadersReceived 回调中的 header.Location 获取重定向的 url;</li></ul> | `Omit.redirect` |
| `responseType?` | `"arraybuffer"` \| `"text"` \| `"json"` | - | - |
| `success?` | `RequestSuccessCallback`\<`string` \| `ArrayBuffer` \| `IAnyObject`\> | 接口调用成功的回调函数 | `Omit.success` |
| `timeout?` | `number` | <p>需要基础库： `2.10.0`</p><p>超时时间，单位为毫秒。默认值为 60000</p> | `Omit.timeout` |
