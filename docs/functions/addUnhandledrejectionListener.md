[**minigame-std**](../README.md)

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

[src/std/event/mod.ts:38](https://github.com/JiangJie/minigame-std/blob/eeac001add8ab13d21bab6e48cf53f07cd0a9aad/src/std/event/mod.ts#L38)
