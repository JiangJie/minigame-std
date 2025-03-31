[**minigame-std**](../README.md)

***

[minigame-std](../README.md) / addResizeListener

# Function: addResizeListener()

```ts
function addResizeListener(listener): () => void
```

添加窗口大小变化监听器。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `listener` | `OnWindowResizeCallback` | 窗口大小变化的回调函数。 |

## Returns

`Function`

返回一个函数，调用该函数可以移除监听器。

### Returns

`void`

## Defined in

[src/std/event/mod.ts:49](https://github.com/JiangJie/minigame-std/blob/8633d80114dee6c79033ec094d8233bd8263bedc/src/std/event/mod.ts#L49)
