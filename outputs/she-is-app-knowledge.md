# 女也 She Is — Project Knowledge

> 一款面向女性用户的心理测评 + 非虚构故事 Web App，纯静态部署，AI 与创作者共建。

## Quick Facts

| 指标 | 值 |
|---|---|
| 产品 | 心理测评 + 真实女性故事（「100位女孩」系列）|
| 品牌 | 女也 She Is |
| 构建者 | Gigi + Claude Code（AI 协作）|
| 时间线 | 2026-03-18 → 2026-04-01（约 15 天）|
| Commits | 105 |
| 技术栈 | 纯静态 HTML/CSS/JS，Tailwind CSS（CDN），Supabase（Auth + DB）|
| 部署 | Netlify |
| 月成本 | 极低（Netlify 免费层 + Supabase 免费层）|
| 仓库 | 私有 GitHub |

## The Problem

Gigi 想做一个面向中国女性的自我认知产品：不是娱乐向的"测测你是什么星座/甜品"，而是有学术依据的心理测量工具，配以真实女性的非虚构故事，让用户在测评和阅读中完成某种内在相遇。

核心洞察：心理测评内容本身不稀缺，但把它做得既有质感、又有共情温度、又能在手机浏览器零门槛访问的产品几乎没有。纯静态 HTML 的选择不是因为技术限制，而是刻意的极简主义——不需要 App，不需要注册才能用，打开即用。

「100位女孩」系列是产品差异化的灵魂：每个真实女孩的故事都配有 AI 生成封面图、TTS 朗读音频、背景音乐，像一本会呼吸的杂志。

## Key Decisions

### Decision: 纯静态 HTML 而非框架
- **Context**: 作为 vibe coding 项目，需要快速迭代、零服务器成本、Claude Code 可直接编辑
- **Options**: Next.js / Vue / 纯 HTML
- **Chosen**: 纯静态 HTML + Tailwind CDN
- **Why**: 没有构建步骤，AI 可以直接看到 DOM 结构并精确修改；部署秒完成；用户零门槛访问

### Decision: Supabase 做 Auth + 数据存储
- **Context**: 需要保存用户测评结果，支持 Google 登录 + Magic Link
- **Chosen**: Supabase（CDN 引入）
- **Why**: 免费层够用，前端直接调用，无需后端服务器；Google OAuth + 邮件 Magic Link 覆盖主要登录场景

### Decision: 品牌色「暮色紫」#4A3073
- **Context**: 需要一个区别于粉色系（传统女性产品）又有温度的品牌色
- **Chosen**: #4A3073 暮色紫 + #FAF7F4 米白底
- **Why**: 紫色兼有神秘感、内省感、知识感，不落入粉色女性刻板印象

### Decision: Lora 衬线体 + Noto Serif SC 正文
- **Context**: 品牌需要文学质感，区别于科技/娱乐 App
- **Chosen**: Logo/标题 Lora italic + 中文正文 Noto Serif SC
- **Why**: 衬线体传递沉稳、阅读感；Lora 斜体有杂志感；这两种组合在 CDN 上稳定可用

### Decision: 禁用 Glassmorphism 和渐变滥用
- **Context**: 早期 demo 版本用了弥散渐变，3 月 24 日全站 VI 统一后明确禁止
- **Chosen**: 极简 VI 规范（vi-spec.md）
- **Why**: 保持克制美学，留白比装饰更有质感；禁止 emoji 图标、box-shadow 堆砌、纯黑纯白

### Decision: 故事页三要素：封面图 + 朗读音频 + 背景音乐
- **Context**: 希望故事不只是文字，而是一个多感官体验
- **Chosen**: AI 生成封面 + TTS 音频 + 背景音乐（glass player）
- **Why**: 沉浸感是区别于普通博客的核心体验；用户可以「听」故事

### Decision: 结果页可分享长图 + 卡片
- **Context**: 用户分享是获客的主要渠道
- **Chosen**: html2canvas 生成可下载的结果卡片，3 月 20 日全面重构为长图/卡片双选项
- **Why**: 微信/小红书分享图是社交传播的核心触点；branded 卡片带品牌曝光

## Architecture

### Tech Stack
| 层 | 选择 | 原因 |
|---|---|---|
| 前端框架 | 无框架，纯 HTML | 零构建、AI 可直接修改 |
| CSS | Tailwind CSS（CDN）| 快速样式，无构建步骤 |
| 字体 | Google Fonts CDN | Lora + Noto Serif SC + Noto Sans SC |
| Auth | Supabase CDN | Google OAuth + Magic Link，免费层 |
| 数据库 | Supabase PostgreSQL | 存储测评结果 |
| 部署 | Netlify | 自动部署，免费层，自定义域名 |
| 图片生成 | html2canvas | 结果卡片下载 |
| 音频 | 本地 MP3 + glass player | TTS + 背景音乐 |
| 故事脚手架 | bash script | `scripts/new_story.sh` 快速生成故事模板 |

### System Design

```
she-is-app/
├── index.html          # 首页
├── assessment.html     # 测评中心（四轴分类）
├── stories.html        # 故事列表
├── story-*.html        # 各故事页（曲奇/小陈/小李/冰冰/秀秀/自行车/008/009）
├── story-detail.html   # 故事模板
├── test-*.html         # 各测评页（HSP/ECR/ERQ/FMPS/认知/边界/关系/DISC/今日心情）
├── profile.html        # 个人画像（四轴雷达图）
├── map.html            # 内在地图（数据可视化）
├── login.html          # 登录页
├── mailbox.html        # 邮箱验证
├── assets/             # JS 工具库（auth.js, result-card.js, profile-utils.js）
├── audio/              # 故事音频
├── docs/               # 故事模板指南
├── scripts/            # 脚手架脚本
├── supabase/           # Edge Functions（可选）
└── vi-spec.md          # VI 规范文档
```

### 测评模块（四轴）
- **情绪轴**：HSP 高敏感人格 / ERQ 情绪调节
- **关系轴**：ECR 依恋风格 / 边界感 / 关系角色
- **认知轴**：FMPS 完美主义 / 认知测评 / DISC 行为风格
- **探索轴**：今日心情 / 理想型男友 / 更多

## Development Timeline

| 日期 | 里程碑 | Commits |
|---|---|---|
| 2026-03-18 | 项目初始化，VI polish，核心测评页上线 | 7 |
| 2026-03-19 | Supabase Auth 接入（Google + Magic Link），结果卡片下载，个人画像页 | 20 |
| 2026-03-20 | 分享功能重构——长图/卡片双选项，雷达图修复 | 1 |
| 2026-03-22 | 六个真实女孩故事完整稿上线，ECR 结果页精修 | 10 |
| 2026-03-23 | **爆发日**：全站测评名称统一，四轴架构重构，HSP/ERQ/FMPS/profile 精修，DISC 新增 | 22 |
| 2026-03-24 | VI 规范写入 vi-spec.md，全站统一暮色紫 + Lora + #FAF7F4 | 7 |
| 2026-03-25 | HSP 自动翻页 + 长按保存，结果页边距精修 | 11 |
| 2026-03-26 | 故事页视觉重建（Stitch），故事脚手架脚本，ERQ 重建 | 12 |
| 2026-03-27 | 批量 Stitch 重建收尾 | 1 |
| 2026-03-30 | Supabase 登录 bug 修复，map.html（内在地图）上线，profile 迁移 | 12 |
| 2026-04-01 | 播放器双模式，故事 008/009，首页优化，AI 交叉解读 | 2 |

**最高产日**：2026-03-23（22 commits，全站架构重组日）

## How Builder & AI Collaborated

### 工作流模式
- **Gigi 驱动方向**：功能 → 决策 → 调整
- **Claude Code 执行实现**：一次性完成文件生成/修改
- **截图确认循环**：每个视觉变更 Gigi 都会看截图（项目里大量 `ss-*.png` 是迭代轨迹）
- **VI 规范先于代码**：3 月 24 日写下 vi-spec.md 后，风格才真正稳定

### 典型协作模式
1. Gigi 提出功能需求（往往很具体，包含 HTML 片段或截图）
2. Claude Code 批量修改多个文件
3. Gigi 看效果截图 → 给出精修意见（"去掉图标"/"呼吸感"/"克制"）
4. Claude Code 精修迭代

### 结果卡片下载的协作轨迹
> Session: 2026-03-19
> "implement branded result card download across all specified test pages"
→ 创建 `assets/result-card.js`，统一注入所有测评页

### 故事脚手架的诞生
3 月 26 日，故事数量增多后，Gigi 要求标准化故事页生成流程，诞生了 `scripts/new_story.sh` + `docs/story-template-guide.md`，之后每个新故事只需一行命令生成模板。

## Pitfalls & Solutions

### Pitfall: iOS Safari 渲染 bug
- **症状**：ECR/ERQ 结果页在 iOS Safari 显示异常
- **根因**：CSS 属性兼容性（Safari 对某些 flex/grid 属性处理不同）
- **修复**：加前缀，简化布局，2026-03-22 修复
- **预防**：每次结果页重构后在 Safari 预览

### Pitfall: Supabase 初始化时序问题
- **症状**：登录后 session 无法写入，auth headers 报错
- **根因**：`window.sb` 在 DOMContentLoaded 前使用；CDN 版本不兼容
- **修复**：defer 初始化，直接写 localStorage，固定 CDN 版本
- **预防**：Supabase 操作都在 `window.sb` 确认存在后执行

### Pitfall: 雷达图数据重复/孤字
- **症状**：分享长图中标签重复，文本末尾孤字
- **根因**：数据源合并时未去重，CSS 没有防孤字处理
- **修复**：`[...new Set()]` 去重，`word-break` + `overflow-wrap` 处理
- **预防**：生成卡片前做数据清洗

### Pitfall: 结果页视觉"上重下轻"
- **症状**：重构后结果页内容集中在顶部，底部空旷
- **根因**：div 默认 `align-items: flex-start`，缺少呼吸感设计
- **修复**：增加 section 间距，加入「在日常里」「值得想一想」等新内容 section
- **预防**：结果页结构参考 knowledge doc 里的 section 清单

### Pitfall: 弥散渐变 → 视觉过度
- **症状**：早期 index 页加了弥散渐变背景，视觉显得廉价
- **根因**：没有 VI 规范约束
- **修复**：3 月 24 日写 vi-spec.md，全站统一，禁止弥散渐变
- **预防**：先写 VI 规范，后写代码

## Build Guide（For Someone Starting Fresh）

### Prerequisites
- GitHub 账号 + 仓库
- Netlify 账号（免费）
- Supabase 账号（免费）+ 创建项目
- Google Cloud Console → OAuth 2.0 凭据（如需 Google 登录）
- 字体使用 Google Fonts CDN（无需账号）

### 推荐构建顺序
1. **VI 规范**：先写 `vi-spec.md`，定义品牌色/字体/组件规范，一切以此为准
2. **首页 + 导航**：`index.html` + 底部导航，确认整体风格
3. **第一个测评**（HSP 最简单）：完整流程（问题 → 计分 → 结果页）
4. **结果页分享卡**：`assets/result-card.js` 统一抽象，后续复用
5. **测评中心页**：`assessment.html` 四轴分类
6. **Auth 接入**：Supabase Magic Link 优先（微信环境不支持 Google OAuth）
7. **个人画像页**：`profile.html` / `map.html`
8. **第一个故事页**：按 `story-detail.html` 模板做，配封面图 + 音频
9. **故事脚手架**：`scripts/new_story.sh` 标准化生成
10. **批量故事**：按脚手架生成并填充内容

### CLAUDE.md Template（适合此类项目）

```markdown
# Project Rules

## Stack
- Pure static HTML/CSS/JS, no build step
- Tailwind CSS via CDN
- Supabase via CDN for auth + storage

## VI Rules (see vi-spec.md)
- Brand color: #4A3073 (accent), #FAF7F4 (bg)
- Fonts: Lora italic for titles, Noto Serif SC for body
- NO emoji icons, NO glassmorphism, NO diffuse gradients
- Whitespace > decoration

## Code Style
- All pages self-contained (no shared framework)
- Consistent header/nav structure across pages
- Mobile-first (target: WeChat in-app browser + Safari)

## Workflow
- Discuss approach before writing code
- Make changes file by file, show what changed
- Screenshot before/after for any visual change

## Story Pages
- Use scripts/new_story.sh to scaffold
- Follow docs/story-template-guide.md
- Each story: cover image + TTS audio + bg music

## Result Cards
- All test pages use assets/result-card.js
- html2canvas for download
- Branded with She Is VI
```

## Lessons Learned

### On Product
- 心理测评最难的不是题目，是结果页：要有洞察感，不能像报告
- 「真实故事」是产品的灵魂，但内容生产成本高，脚手架化是唯一出路
- 用户分享路径要在设计期就想清楚，事后加很痛
- 微信内置浏览器限制多（Google OAuth 不可用），Magic Link 是更安全的选择

### On Vibe Coding
- **VI 规范要最先写**：没有规范的阶段每次改都在返工
- **截图即验收**：视觉类改动必须看截图，口头描述容易失真
- **脚手架救生命**：重复性内容（故事页）一定要工具化，手工复制粘贴 = 无穷 bug
- **Session logs 是隐藏的产品决策记录**：每一次"不对，改成"都是一个微型产品决策
- **Claude Code 最擅长批量相似修改**：同一改动要在 10 个文件里做时，AI 效率碾压人工

### On Technical Choices
- 纯静态 HTML 对 AI 协作极友好：没有编译错误，所见即所得
- Supabase CDN 版本要固定，不然更新可能 breaking
- `html2canvas` 处理中文字体渲染需要额外注意（字体必须 loaded 才能截图准确）
- Netlify 自动部署非常适合这种快速迭代模式（push → 30 秒上线）
- 音频文件要放 CDN 或排除在 git 外，否则仓库会爆
