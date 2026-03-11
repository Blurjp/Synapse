# Chrome Web Store 发布指南

## 📦 发布准备清单

### ✅ 必需材料
- [x] Extension 源代码
- [x] manifest.json (Manifest V3)
- [x] 图标 (128x128)
- [ ] 商店截图 (1280x800 或 640x400) - 至少 1 张
- [ ] 宣传图片 (440x280, 920x680, 1400x560) - 可选
- [x] 商店描述
- [x] 详细说明
- [x] 隐私政策
- [ ] $5 开发者账户注册费

---

## 📝 商店列表信息

### 名称
**Synapse - Save to Synapse**

### 简短描述 (132 字符内)
Save webpages, highlights, and notes to Synapse - Your AI-powered knowledge hub.

### 详细描述
**Synapse - Where Ideas Connect**

Save anything from the web to your personal knowledge base. Highlight text, take notes, and let AI help you connect ideas.

**Features:**
✅ Save entire webpages with one click
✅ Highlight and annotate any text
✅ Quick notes with automatic source tracking
✅ Right-click context menu integration
✅ Keyboard shortcuts for fast saving
✅ Clean, modern interface

**How to Use:**

1. **Save Webpages**
   - Click the Synapse icon
   - Press "Save to Synapse"
   - Or use keyboard shortcut: Ctrl/Cmd + Shift + S

2. **Save Highlights**
   - Select any text on a webpage
   - Right-click → "Save Highlight to Synapse"
   - Add notes to your highlights

3. **Quick Notes**
   - Click the icon
   - Type your note
   - Press "Save Note"

**Perfect for:**
- 📚 Researchers and students
- ✍️ Content creators
- 💼 Professionals
- 🧠 Knowledge workers

**Privacy First:**
- No data tracking
- No third-party analytics
- Your data stays on your device
- Open source and transparent

**Requirements:**
- Synapse backend running on localhost:8001
- See GitHub for setup instructions

**Coming Soon:**
- AI-powered summaries
- Semantic search
- PDF annotations
- YouTube video notes
- Cross-device sync

**Open Source:**
GitHub: https://github.com/Blurjp/Synapse

---

## 🏷️ 分类和语言

### 主要分类
**Productivity**

### 次要分类
**Knowledge Management**, **Research Tools**

### 语言
**English**, **中文 (简体)**

---

## 🔒 隐私政策

### Synapse Extension 隐私政策

**最后更新**: 2026-03-11

**概述**

Synapse Chrome Extension ("我们", "我们的", "Extension") 致力于保护您的隐私。本隐私政策说明了我们如何收集、使用和保护您的信息。

**信息收集**

我们收集的信息:
- **网页内容**: 当您选择保存时，我们收集页面标题、URL 和内容
- **高亮文本**: 您选择并保存的文本片段
- **笔记**: 您输入的笔记内容
- **元数据**: 保存时间、来源 URL

我们不收集的信息:
- ❌ 个人身份信息（姓名、邮箱、电话）
- ❌ 浏览历史（除非您主动保存）
- ❌ 其他网站的数据
- ❌ 设备信息或位置数据

**数据存储**

- 所有数据存储在您的本地 Synapse 后端 (localhost:8001)
- 数据不会上传到我们的服务器
- 数据不会与第三方共享
- 您可以随时删除所有数据

**数据使用**

我们使用您的数据仅用于:
- 在 Synapse 中显示您保存的内容
- 提供搜索和组织功能
- 生成 AI 摘要（如果启用）

**第三方服务**

Extension 可能使用以下服务:
- **OpenAI API**: 用于生成摘要（可选功能）
  - 仅在您配置 API key 时使用
  - 您控制是否启用此功能

**Cookies 和跟踪**

- Extension 不使用 cookies
- Extension 不使用任何跟踪技术
- Extension 不包含广告

**您的权利**

您有以下权利:
- ✅ 查看所有保存的数据
- ✅ 删除任何保存的内容
- ✅ 导出您的数据
- ✅ 完全卸载 Extension

**儿童隐私**

Extension 不面向 13 岁以下儿童。我们不会故意收集儿童的信息。

**政策变更**

我们可能会不时更新本隐私政策。重大变更将在 Extension 更新说明中通知您。

**联系我们**

如有隐私相关问题，请联系:
- GitHub: https://github.com/Blurjp/Synapse/issues
- Email: [您的邮箱]

**许可**

本 Extension 是开源软件，采用 MIT 许可证。

---

## 📸 截图要求

### 必需截图
- **数量**: 至少 1 张，最多 5 张
- **尺寸**: 1280x800 或 640x400 像素
- **格式**: PNG 或 JPEG
- **内容**: 展示 Extension 的实际使用场景

### 建议截图内容
1. **主界面**: Extension 弹窗显示 "Connected" 状态
2. **保存网页**: 展示保存成功的界面
3. **高亮功能**: 展示选中文本并保存高亮
4. **笔记功能**: 展示添加笔记的界面
5. **右键菜单**: 展示右键菜单选项

### 如何创建截图
1. 安装 Extension
2. 访问示例网站（如 https://example.com）
3. 打开 Extension 弹窗
4. 使用 macOS 截图: `⌘ + Shift + 4`
5. 调整尺寸到 1280x800

---

## 🎨 宣传图片（可选）

### Small Promotional Tile
- **尺寸**: 440x280 像素
- **用途**: 商店搜索结果

### Large Promotional Tile
- **尺寸**: 920x680 像素
- **用途**: 商店详情页

### Marquee Promotional Tile
- **尺寸**: 1400x560 像素
- **用途**: 商店首页推荐

---

## 💰 开发者账户

### 注册费用
- **一次性费用**: $5 USD
- **支付方式**: 信用卡
- **注册地址**: https://chrome.google.com/webstore/devconsole

### 注册步骤
1. 访问 Chrome Web Store Developer Dashboard
2. 使用 Google 账户登录
3. 支付 $5 一次性费用
4. 同意开发者协议
5. 完成账户设置

---

## 📋 发布步骤

### 步骤 1: 准备 Extension ZIP
```bash
cd /Users/jianpinghuang/projects/Synapse
zip -r synapse-extension-store.zip extension \
  -x "*.DS_Store" \
  -x "*__pycache__*" \
  -x "*.pyc" \
  -x "*.log"
```

### 步骤 2: 登录开发者控制台
1. 访问: https://chrome.google.com/webstore/devconsole
2. 使用您的 Google 账户登录

### 步骤 3: 上传 Extension
1. 点击 "Add new item"（添加新项目）
2. 选择 ZIP 文件
3. 上传

### 步骤 4: 填写商店信息
- 上传截图
- 填写描述
- 上传宣传图片（可选）
- 选择分类
- 设置隐私政策 URL

### 步骤 5: 配置发布选项
- **可见性**: Public（公开）或 Private（私有）
- **地区**: 选择目标地区
- **语言**: 选择支持的语言

### 步骤 6: 提交审核
1. 检查所有信息
2. 点击 "Submit for review"
3. 等待审核（通常 1-3 天）

---

## ⚠️ 审核注意事项

### 常见拒绝原因
1. **缺少隐私政策**: 必须提供隐私政策 URL
2. **截图质量差**: 确保截图清晰、相关
3. **描述不清楚**: 详细说明功能和权限
4. **权限过多**: 只请求必需的权限
5. **误导性描述**: 确保描述准确反映功能

### 我们的 Extension 优势
- ✅ 权限最小化（只有 activeTab, storage, contextMenus）
- ✅ 隐私友好（无跟踪、无广告）
- ✅ 开源透明
- ✅ 功能明确
- ✅ 详细文档

---

## 📊 发布后

### 监控指标
- 安装数量
- 用户评分
- 评论反馈
- 崩溃报告

### 更新 Extension
1. 修改代码
2. 更新 manifest.json 中的版本号
3. 重新打包 ZIP
4. 在开发者控制台上传新版本
5. 提交审核

---

## 🔗 有用链接

- **Developer Dashboard**: https://chrome.google.com/webstore/devconsole
- **发布文档**: https://developer.chrome.com/docs/webstore/publish/
- **审核指南**: https://developer.chrome.com/docs/webstore/review-process/
- **最佳实践**: https://developer.chrome.com/docs/webstore/best-practices/

---

## ✅ 发布前最终检查

- [ ] Extension 功能完整且稳定
- [ ] manifest.json 版本号正确
- [ ] 图标符合要求 (128x128)
- [ ] 准备至少 1 张截图 (1280x800)
- [ ] 商店描述完整
- [ ] 隐私政策已准备
- [ ] 开发者账户已注册
- [ ] ZIP 包已创建

---

**准备好发布了吗？让我们开始！** 🚀
