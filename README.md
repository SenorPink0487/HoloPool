# HoloPool

> 沉浸式三维物理台球体验室，融合真实刚体动力学、第三人称自由漫游与动态轨迹/公式推演。

本项目是基于 **Three.js** 与 **cannon-es** 构建的浏览器端三维台球沙盒，支持桌面端键鼠与触控设备操作，兼具真实物理击球手感与可视化物理教学推演能力。

## 核心特性

- **真实刚体物理**：由 `cannon-es` 驱动球体碰撞、库边反弹、台呢摩擦与落袋判定，配合真实采样音效与高精度材质贴图。
- **自由漫游与就位击球**：支持第三人称自由行走观察球局，靠近球桌一键就位瞄准，支持杆尾精细调角与可视化弧形蓄力仪表盘。
- **轨迹预测与公式推演**：内置俯视落点预览、力度阶梯（Power Ladder）、击球回放、物理公式板与教学 HUD，直观呈现碰撞规律与运动轨迹。
- **物理探针叠加层**：内置 Probe 空间测量与物理量探测工具，辅助分析角度、距离与动力学参数。
- **多端操控与互动预览**：支持桌面键鼠与 iPad / 触控摇杆操控，并附带独立互动展示页 `showcase.html`。

## 页面与入口

| 入口文件 | 页面 | 说明 |
| --- | --- | --- |
| `index.html` | 三维台球体验室 | 完整的 3D 台球场景、自由漫游、击球物理、轨迹与公式推演 |
| `showcase.html` | 互动预览 | 轻量级 Canvas 互动台球预览卡片与启动入口 |

## 常用操作

| 按键 / 交互 | 功能 |
| --- | --- |
| `W` `A` `S` `D` | 自由模式下行走移动 |
| `左键拖动` | 旋转视角镜头 |
| `E` | 就位击球 / 退出瞄准 |
| `A` `D` / `拖杆尾` | 瞄准转向 / 精细调角 |
| `W` `S`（瞄准态） | 调整前后站位 |
| `空格` | 蓄力并击球 |
| `公式推演` | 打开俯视落点预览与物理公式板 |
| `R` | 重新摆球 |
| `H` | 隐藏 / 显示界面 HUD |

## 技术栈

- **3D 渲染**：Three.js `0.184`
- **物理引擎**：cannon-es `0.20`
- **构建工具**：Vite `6`（`appType: 'mpa'` 多入口打包）
- **开发语言与测试**：原生 HTML5 / CSS3 / ES2022 JavaScript，Node.js 内置测试运行器（`node --test`）

## 目录结构

```text
HoloPool/
├── index.html               # 三维台球主入口
├── showcase.html            # 互动预览页入口
├── public/
│   └── pool/                # 台呢贴图、采样音效、图标与资源说明
├── src/
│   ├── showcase.js / .css   # 互动预览页脚本与样式
│   └── pool/
│       ├── main.js          # 主循环与场景入口
│       ├── physics.js       # cannon-es 刚体物理封装
│       ├── table.js         # 球桌建模与库边/袋口构造
│       ├── balls.js         # 球体渲染与同步
│       ├── cue.js           # 球杆瞄准与蓄力逻辑
│       ├── player.js        # 角色漫游与视角控制
│       ├── touch-controls.js# 触控摇杆与移动端交互
│       ├── predict/         # 轨迹预测、力度阶梯、公式板与教学 HUD
│       ├── probe/           # 物理探针测量与叠加层
│       └── test/            # 单元测试
├── vite.config.js           # Vite 配置（默认端口 3001）
└── package.json             # 依赖与脚本
```

## 本地开发

环境要求：**Node.js 22** 或更高版本。

```bash
git clone https://github.com/SenorPink0487/HoloPool.git
cd HoloPool
npm ci
npm run dev
```

启动后可访问：

- 三维台球体验室：[http://localhost:3001/](http://localhost:3001/)
- 互动预览页：[http://localhost:3001/showcase.html](http://localhost:3001/showcase.html)

### 常用命令

```bash
npm run dev       # 启动本地开发服务器（端口 3001）
npm test          # 运行核心物理与推演单元测试
npm run build     # 构建生产静态文件到 dist/
npm run preview   # 本地预览生产构建结果（默认端口 4173）
```

部署时将 `dist/` 目录发布至静态站点根目录即可。

## 资源说明

音效与材质来源记录在 `public/pool/` 下各资源目录的说明文件中。

## 许可证

本项目基于 [GPL-3.0-or-later](./LICENSE) 许可证发布。
