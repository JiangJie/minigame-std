[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [cryptos](../README.md) / Md5

# Class: Md5

Defined in: [src/std/crypto/md/md5.ts:17](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/crypto/md/md5.ts#L17)

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

Defined in: [src/std/crypto/md/md5.ts:184](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/crypto/md/md5.ts#L184)

Returns final hash.

#### Returns

`ArrayBuffer`

***

### toString()

```ts
toString(): string
```

Defined in: [src/std/crypto/md/md5.ts:218](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/crypto/md/md5.ts#L218)

Returns hash as a hex string.

#### Returns

`string`

***

### update()

```ts
update(data): this
```

Defined in: [src/std/crypto/md/md5.ts:147](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/crypto/md/md5.ts#L147)

Update internal state.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | [`DataSource`](../../../type-aliases/DataSource.md) | data to update, data cannot exceed 2^32 bytes. |

#### Returns

`this`
