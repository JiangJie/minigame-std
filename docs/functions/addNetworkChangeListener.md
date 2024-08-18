[**minigame-std**](../README.md) • **Docs**

***

[minigame-std](../README.md) / addNetworkChangeListener

# Function: addNetworkChangeListener()

```ts
function addNetworkChangeListener(listener): () => void
```

监听网络状态变化。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `listener` | (`type`) => `void` | 网络状态变化的回调函数。 |

## Returns

`Function`

返回一个函数，调用该函数可以移除监听器。

### Returns

`void`

## Defined in

[src/std/network/mod.ts:23](https://github.com/JiangJie/minigame-std/blob/0b3f4c24a764d15c8d4cfbfab659d3f6c53dfd93/src/std/network/mod.ts#L23)
