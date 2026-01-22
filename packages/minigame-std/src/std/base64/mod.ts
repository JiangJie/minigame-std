/**
 * @fileoverview Base64 编解码模块。
 *
 * - encodeBase64: 全平台使用纯 JS 实现，支持 DataSource 输入
 * - decodeBase64: 支持 atob 时使用原生实现，否则使用纯 JS 实现
 */

export { decodeBase64, encodeBase64 } from './base64.ts';
