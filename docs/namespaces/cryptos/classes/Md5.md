[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [cryptos](../README.md) / Md5

# Class: Md5

Md5 hash

## Constructors

### new Md5()

```ts
new Md5(): Md5
```

#### Returns

[`Md5`](Md5.md)

## Methods

### digest()

```ts
digest(): ArrayBuffer
```

Returns final hash.

#### Returns

`ArrayBuffer`

#### Defined in

[src/std/crypto/md/md5.ts:183](https://github.com/JiangJie/minigame-std/blob/d842b492eda479274cfeb38a06f4c4255b5493bc/src/std/crypto/md/md5.ts#L183)

***

### toString()

```ts
toString(): string
```

Returns hash as a hex string.

#### Returns

`string`

#### Defined in

[src/std/crypto/md/md5.ts:217](https://github.com/JiangJie/minigame-std/blob/d842b492eda479274cfeb38a06f4c4255b5493bc/src/std/crypto/md/md5.ts#L217)

***

### update()

```ts
update(data): this
```

Update internal state.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | `string` \| `BufferSource` | data to update, data cannot exceed 2^32 bytes. |

#### Returns

`this`

#### Defined in

[src/std/crypto/md/md5.ts:146](https://github.com/JiangJie/minigame-std/blob/d842b492eda479274cfeb38a06f4c4255b5493bc/src/std/crypto/md/md5.ts#L146)
