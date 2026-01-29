/**
 * 音频相关功能模块，提供 Web Audio API 封装。
 * @module
 */
export * as audio from './std/audio/mod.ts';

/**
 * 剪贴板操作模块，提供读取和写入剪贴板文本的功能。
 * @module
 */
export * as clipboard from './std/clipboard/mod.ts';

/**
 * 编解码模块，提供 Base64、Hex、UTF-8、ByteString 等编解码功能。
 */
export * from './std/codec/mod.ts';

/**
 * 加密相关功能模块，提供 HMAC、MD5、SHA、RSA 等加密算法和随机数生成。
 * @module
 */
export * as cryptos /* Avoid conflict with global `crypto` */ from './std/crypto/mod.ts';

/**
 * 公共类型定义，如 DataSource 等。
 */
export * from './std/defines.ts';
/**
 * 事件监听模块，提供错误、未处理拒绝、窗口大小变化等事件监听功能。
 */
export * from './std/event/mod.ts';
/**
 * 网络请求模块，提供可中断的 fetch 请求功能，支持 text、JSON、ArrayBuffer 等响应类型。
 */
export * from './std/fetch/mod.ts';

/**
 * 文件系统操作模块，提供同步和异步的文件读写、目录操作等功能。
 * @module
 */
export * as fs from './std/fs/mod.ts';

/**
 * 图片处理模块，提供从 URL 或文件创建图片的功能。
 * @module
 */
export * as image from './std/image/mod.ts';

/**
 * 位置服务模块（Location Based Service），提供获取地理位置坐标的功能。
 * @module
 */
export * as lbs from './std/lbs/mod.ts';

/**
 * 网络状态模块，提供获取网络类型和监听网络变化的功能。
 */
export * from './std/network/mod.ts';
/**
 * 性能模块，提供高精度时间戳获取功能。
 */
export * from './std/performance/mod.ts';

/**
 * 平台信息模块，提供设备信息、平台检测等功能。
 * @module
 */
export * as platform from './std/platform/mod.ts';

/**
 * WebSocket 模块，提供创建和管理 WebSocket 连接的功能。
 */
export * from './std/socket/mod.ts';

/**
 * 本地存储模块，提供同步和异步的键值对存储功能。
 * @module
 */
export * as storage from './std/storage/mod.ts';

/**
 * 工具函数模块，提供 resultify 等实用工具。
 */
export * from './std/utils/mod.ts';

/**
 * 视频播放模块，提供创建和控制视频播放器的功能。
 * @module
 */
export * as video from './std/video/mod.ts';
