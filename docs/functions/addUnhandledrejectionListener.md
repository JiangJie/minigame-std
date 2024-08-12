[**minigame-std**](../README.md) • **Docs**

***

[minigame-std](../README.md) / addUnhandledrejectionListener

# Function: addUnhandledrejectionListener()

```ts
function addUnhandledrejectionListener(listener): () => void
```

添加未处理的 Promise 拒绝事件监听器。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `listener` | (`ev`) => `void` | 未处理的 Promise 拒绝事件的回调函数。 |

## Returns

`Function`

返回一个函数，调用该函数可以移除监听器。

### Returns

`void`

## Defined in

[src/std/event/mod.ts:30](https://github.com/JiangJie/minigame-std/blob/22787d0fd0cff776ed579de48ccf7523d9e4ce53/src/std/event/mod.ts#L30)
