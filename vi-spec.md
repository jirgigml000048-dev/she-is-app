# 女也 She Is VI Spec

## 配色
--bg: #FAF7F4
--accent: #4A3073
--accent-hover: #3D2565
--text: #1E1628
--text-muted: rgba(30,22,40,0.5)
--border: rgba(74,48,115,0.12)
--btn-bg: rgba(180,155,225,0.22)
--btn-border: rgba(190,165,235,0.45)

## 字体
- Logo/标题: Lora italic
- 中文正文: Noto Serif SC
- 功能/按钮: Noto Sans SC

## 字号
- Display 36px Lora italic (Hero)
- H1 24px Lora (Logo)
- H2 18px Lora (卡片标题)
- Body 13px Noto Serif SC
- Caption 11px Noto Sans SC
- Micro 9-10px Noto Sans SC uppercase

## 组件
- 卡片: 白底 #fff, 1px border, radius 14px, 无阴影
- 已完成卡片: 左侧 3px #4A3073 竖线
- 按钮: 浅紫磨砂胶囊, backdrop-filter blur(8px)
- 导航: 纯文字无icon, 活跃项紫色+小圆点
- 分割线: 40px x 1px rgba(74,48,115,0.1)

## 动画
- fadeUp: opacity + translateY(16px)
- easing: cubic-bezier(.25,.46,.45,.94)
- hover: transition all .25s ease
- 只用 transform + opacity

## 禁止
- emoji 图标
- box-shadow 堆砌
- 饱和弥散渐变
- glassmorphism
- 纯黑/纯白
- 居中一切
- 圆体字
