# Story Template Guide

## 1. 用法

在项目根目录执行：

```bash
bash scripts/new_story.sh \
  --vol 009 \
  --slug story-xiaoming \
  --title-zh "小明：她在深夜学会了告别" \
  --title-en "Learning to Say Goodbye" \
  --cover cover-009-xiaoming \
  --audio story-xiaoming
```

生成结果：
- 输出文件：`story-xiaoming.html`
- 封面图路径：`assets/covers/cover-009-xiaoming.png`
- 音频路径：`audio/story-xiaoming.mp3`

参数说明：
- `--vol`：故事期数，直接写三位数字，如 `009`
- `--slug`：输出文件名，不带 `.html` 也可以；脚本会自动补齐
- `--title-zh`：完整中文标题，格式建议为 `人名：副标题`
- `--title-en`：英文副标题
- `--cover`：封面文件名，不带扩展名
- `--audio`：音频文件名，不带扩展名

如果目标文件已存在，脚本会先询问是否覆盖。

---

## 2. 脚手架会生成什么

脚本会基于 `story-detail.html` 模板生成一个新故事页，并自动完成这些替换：

1. 更新 `<title>`
2. 更新 Hero 区块里的：
   - Volume 编号
   - 中文标题（自动去掉 `人名：` 前缀，只保留副标题）
   - 英文副标题
   - 封面图路径
3. 清空正文，替换为统一占位结构
4. 把「心灵寄语」文案替换为 TODO 注释
5. 注入音频文件路径

---

## 3. 正文 HTML 格式规范

脚手架生成后的正文入口如下：

```html
<section>
  <p class="text-on-surface text-lg leading-[1.9] font-light mb-6"><!-- 在此粘贴正文内容 --></p>
</section>
```

后续正文请按下面规范填写。

### 3.1 普通段落

使用标准段落：

```html
<section>
  <p class="text-on-surface text-lg leading-[1.9] font-light mb-6">这里是正文段落。</p>
  <p class="text-on-surface text-lg leading-[1.9] font-light mb-6">这里是下一段正文。</p>
</section>
```

要求：
- 一段一个 `<p>`
- 段落间统一用 `mb-6`
- 不要手动塞 `<br>` 做伪分段

### 3.2 对话 / 引语

人物原话或需要突出显示的句子，使用 `dialogue` 类：

```html
<p class="text-on-surface text-lg leading-[1.9] font-light mb-6 dialogue">“我终于明白，有些告别不是失败。”</p>
```

适用场景：
- 采访对象原话
- 需要被视觉强调的短句
- 有明显情绪张力的关键表达

不建议：
- 大段连续内容全部用 `dialogue`
- 普通叙述也套高亮样式

### 3.3 节标题

每个大节使用现有模板结构：

```html
<section>
  <div class="flex items-baseline gap-4 mb-6">
    <span class="text-6xl font-headline text-secondary leading-none">01</span>
    <div>
      <h4 class="font-headline text-3xl text-primary font-bold">学会告别</h4>
      <p class="text-sm text-primary/40 font-label uppercase tracking-wider mt-1">Learning to Let Go</p>
    </div>
  </div>
  <p class="text-on-surface text-lg leading-[1.9] font-light mb-6">这里开始本节正文。</p>
</section>
```

建议：
- 章节编号统一两位数：`01`、`02`、`03`
- 中文节标题简短、可读
- 英文副标题保持概念对应，不必逐字直译

### 3.4 Pull Quote（可选）

如果需要插入一句章节之间的重点提炼，可使用：

```html
<section class="py-4">
  <div class="border-l-4 border-secondary pl-8 py-4">
    <p class="font-headline text-2xl md:text-3xl text-primary leading-snug italic">
      “这是需要被记住的一句话。”
    </p>
  </div>
</section>
```

适用场景：
- 全文洞察句
- 采访对象金句
- 章节转场时的情绪锚点

---

## 4. 心灵寄语填写规范

脚手架默认会生成这三个占位注释：

```html
<!-- TODO: 心灵寄语中文引导语 -->
<!-- TODO: 心灵寄语英文引导语 -->
<!-- TODO: 留言提示文字 -->
```

请替换为实际段落，顺序如下：

```html
<p class="text-on-surface-variant leading-relaxed mb-2">中文引导语</p>
<p class="text-on-surface-variant/60 text-sm italic leading-relaxed mb-6">English prompt</p>
<p class="text-on-surface-variant text-sm leading-relaxed mb-8">留言提示文字</p>
```

### 4.1 中文引导语
- 语气：温柔，但不要悬浮
- 内容：围绕故事主题，抛出一个可回答的问题
- 长度：建议 1 句，不超过 2 句

### 4.2 英文引导语
- 不是生硬直译，要保留语感
- 长度与中文接近
- 适合作为国际化展示时的补充阅读

### 4.3 留言提示文字
- 用来邀请用户写下回应
- 语气应更轻、更开放
- 避免命令式表达

推荐判断标准：
- 读者看完会想回应，而不是觉得被教育
- 文案和故事主题强相关，不是任何故事都能通用
- 语言简洁，避免鸡汤化

---

## 5. 发布前自检

新故事页编辑完成后，至少检查以下项目：

- Hero 中文标题是否只保留副标题
- 封面图路径是否正确
- 音频是否能正常加载
- 正文段落间距是否统一
- `dialogue` 是否只用于需要强调的句子
- 心灵寄语三段文案是否已替换掉 TODO 注释
- 页面内是否还残留模板人物名或旧故事内容
