// 先注册测试
// oxlint-disable-next-line import/no-unassigned-import -- 测试入口按副作用注册全部用例
import './tests/mod.ts';
// 再初始化运行器（绘制UI）
import { initTestRunner } from './test-runner.ts';

initTestRunner();
