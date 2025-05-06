[**minigame-std**](../README.md)

***

[minigame-std](../README.md) / addNetworkChangeListener

# Function: addNetworkChangeListener()

```ts
function addNetworkChangeListener(listener): () => void
```

Defined in: [src/std/network/mod.ts:23](https://github.com/JiangJie/minigame-std/blob/8c5db4b9c3dabb4d0435a493922f29b60a730f0d/src/std/network/mod.ts#L23)

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
