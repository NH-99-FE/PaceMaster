# PaceMaster

<div align="center">

<img src="public/logo.svg" alt="PaceMaster Logo" width="32" height="32">

**高效的考试节奏训练与管理工具**

[在线演示](https://pace-master.lhiyn.xyz)

[![React 19](https://img.shields.io/badge/React-19-61dafb.svg?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7-646cff.svg?style=flat-square&logo=vite)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38bdf8.svg?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

</div>

## 简介

PaceMaster 是一款专注于考试节奏训练的 Web 应用，帮助用户通过科学的计时与进度管理来提升答题效率。支持练习模式与模拟考试模式，具备答题记录、统计分析和数据备份等功能。

## 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS v4 + Radix UI
- **状态管理**: Zustand + Immer
- **路由**: React Router v7
- **表单**: React Hook Form + Zod
- **本地存储**: IndexedDB
- **图表**: Recharts
- **动画**: tw-animate-css + Framer Motion

## 主要功能

- **节奏训练** - 精确到毫秒的计时器，支持总时、区间时、单题时追踪
- **练习模式** - 按模板配置进行针对性训练
- **模拟考试** - 模拟真实考试环境，训练应试节奏
- **答题记录** - 记录每道题的用时、正确率与状态
- **数据统计** - 每日学习数据汇总与趋势分析
- **多主题** - Azure、Citrus、Slate、Rose 四种配色方案
- **数据备份** - 支持导入导出备份文件

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 项目结构

```
src/
├── app/              # 应用入口与布局组件
├── components/       # 共享组件
│   ├── ui/           # shadcn/ui 风格的基础组件
│   ├── shared/       # 通用组件（骨架屏等）
│   └── theme/        # 主题配置
├── features/         # 功能模块（按特性组织）
│   ├── dashboard/    # 仪表盘页面
│   ├── practice/     # 练习/考试页面
│   ├── records/      # 记录管理页面
│   ├── review/       # 复盘分析页面
│   └── settings/     # 设置页面
├── pages/            # 路由页面组件
├── hooks/            # 全局自定义 Hooks
├── store/            # Zustand 状态管理（Slice 模式）
├── lib/              # 工具函数
├── db/               # IndexedDB 数据层
├── router/           # 路由配置
├── types/            # TypeScript 类型定义
└── utils/            # 辅助函数
```

## 架构特点

### 状态管理

采用 Zustand + Immer 的 Slice 模式，将状态按功能模块划分为：

- `sessionSlice` - 会话状态与计时逻辑
- `templateSlice` - 模板与题型管理
- `statsSlice` - 统计数据
- `uiSlice` - UI 状态

通过 `selectors.ts` 中的细粒度选择器优化渲染性能。

### 数据持久化

- **Zustand Persist** - 会话状态自动持久化，页面刷新自动暂停
- **IndexedDB** - 记录、模板、统计数据等持久化存储

### 计时器实现

使用 `performance.now()` 配合 200ms 间隔的 `setInterval`，实现高精度计时，通过 delta 差值计算避免累积误差。

### 难点与亮点

- **高精度计时器**：采用 `performance.now()` + delta 差值计算，避免 `setInterval` 累积误差，支持页面关闭后恢复时自动补齐时间
- **高性能状态管理**：Zustand Slice 模式配合细粒度选择器（selectors.ts），确保只有相关状态变化时组件才重新渲染
- **离线优先架构**：所有数据存储于 IndexedDB，支持完全离线使用，刷新页面不丢失进度
- **零依赖拖拽**：使用 `@dnd-kit` 实现答题 sheet 的拖拽排序
- **TypeScript 严格类型**：全项目启用严格模式，通过类型推导减少运行时错误

### 最佳实践

- 组件按特性组织（features/），每个功能模块包含其组件、hooks 和类型定义
- IndexedDB 操作封装为 Repository 模式，业务逻辑与存储细节分离
- React Hook Form + Zod 实现类型安全的表单验证
- 路由页面懒加载 + 骨架屏，实现渐进式加载体验
