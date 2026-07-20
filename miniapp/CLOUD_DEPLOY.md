# 微信云开发部署清单

源码位于 `miniapp/src`，微信开发者工具导入目录为 `miniapp/dist/dev/mp-weixin`（开发）或 `miniapp/dist/build/mp-weixin`（发布）。

## 1. 云环境

当前代码使用云环境 `cloud1-d4gkbgtzob1673d47`。如更换环境，只修改 `src/config.js` 中的 `CLOUD_ENV_ID`。

## 2. 数据库集合

在云开发控制台创建以下集合：

- `users`：匿名身份、用户主动选择的昵称和头像
- `assessments`：逐项测评答案与结果
- `activity`：读过的故事
- `portraits`：生成的内在画像缓存

这些集合全部通过云函数读写，权限应设置为“仅管理端可读写”。不要开放为所有用户可读。

## 3. 云函数

在微信开发者工具的 `cloudfunctions` 目录中，逐个上传并部署（云端安装依赖）：

- `login`
- `saveAssessment`
- `saveStoryRead`
- `generatePortrait`
- `deleteUserData`

为 `generatePortrait` 配置云函数环境变量 `DEEPSEEK_API_KEY`。密钥不得写入源码、`config.js` 或小程序后台的普通配置中。默认模型为 `deepseek-v4-flash`；如需切换，可额外设置 `DEEPSEEK_MODEL`。该函数只向 DeepSeek 发送测评名称、结果标签和分数，不发送昵称、OpenID 或原始答案。

## 4. 隐私配置

在小程序后台根据实际功能填写《小程序用户隐私保护指引》，至少核对：

- 微信昵称、头像（用户主动选择）
- 保存结果图片到系统相册
- 匿名身份、测评答案、阅读记录的云端存储用途
- 数据删除方式：个人中心 → 隐私与数据 → 删除我的全部云端数据

正式提审前，用体验版分别验证首次授权、拒绝授权、再次授权和删除数据。

## 5. 合法域名与资源

将 `https://sheisapp.oss-cn-beijing.aliyuncs.com` 配置为小程序所需的合法资源域名，并真机验证封面、背景音乐和朗读音频。开发工具中的 `urlCheck: false` 只用于开发，不替代后台域名配置。
