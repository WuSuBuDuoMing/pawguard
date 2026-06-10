# AI 宠物管家 — 技术架构文档

## 1. 架构概览

```
┌─────────────┐
│   Pages     │  ← 10 个页面，负责状态管理和页面逻辑
├─────────────┤
│ Components  │  ← 13 个组件，纯 UI 展示
├─────────────┤
│  Services   │  ← 8 个服务，数据操作（当前 mock，后期可替换后端）
├─────────────┤
│   Utils     │  ← 8 个工具模块，通用逻辑
├─────────────┤
│  Storage    │  ← 本地缓存持久化
└─────────────┘
```

## 2. 数据流

```
用户操作 → Page 事件处理 → Service 方法 → Storage 读写 → Page setData → 视图更新
```

- **单向数据流**：页面通过 `setData` 驱动视图更新
- **组件通信**：properties 向下传值，triggerEvent 向上发事件
- **Service 层隔离**：页面不直接操作 Storage，通过 Service 统一管理

## 3. 主题系统

使用 Behavior 模式实现全局暗黑模式：
- `utils/theme-behavior.js` 提供主题状态和切换方法
- 页面/组件通过 `behaviors: [themeBehavior]` 引入
- CSS 变量（`var(--xxx)`）实现主题色切换
- `page.dark` class 控制暗黑模式下的变量覆盖

## 4. 核心模块说明

### 4.1 Services 层
| 服务 | 职责 |
|------|------|
| pet-service | 宠物 CRUD、体重历史 |
| care-service | 照护任务、打卡、统计、AI 建议 |
| health-service | 健康记录 CRUD、提醒、摘要 |
| training-service | 训练记录、技能进度、徽章、周报 |
| inventory-service | 库存 CRUD、低库存检测、购物清单 |
| expense-service | 开销 CRUD、月度/年度统计、分类分析 |
| diary-service | 日记 CRUD、月度总结、AI 文案 |
| album-service | 相册 CRUD、标签统计 |

### 4.2 Utils 层
| 工具 | 职责 |
|------|------|
| constants | 全局常量（颜色、类型、存储键等） |
| date-utils | 日期格式化、年龄计算、提醒计算 |
| pet-utils | BMI 计算、品种管理、ID 生成 |
| health-utils | 健康状态评估、提醒计算 |
| money-utils | 金额格式化、统计计算 |
| storage-utils | 本地缓存封装（带过期时间） |
| mock-utils | Mock 辅助工具（ID、随机数等） |
| theme-behavior | 暗黑模式 Behavior |

## 5. 组件规范

- 组件只负责 UI 展示
- 通过 properties 接收数据
- 通过 triggerEvent 向父页面发事件
- 不直接操作 API 或 Storage
- 所有组件支持暗黑模式

## 6. 后端替换方案

当前所有 Service 使用 mock 数据和 `wx.Storage`。替换真实后端时：

1. 保留 Service 接口签名不变
2. 将 Service 内部实现替换为 HTTP 请求
3. 移除 mock 数据文件
4. 添加请求封装（拦截器、Token 管理等）

推荐后端方案：
- 云开发（微信原生）
- Node.js + Express + MongoDB
- Java Spring Boot + MySQL
