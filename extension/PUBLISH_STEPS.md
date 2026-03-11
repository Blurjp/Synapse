# 🚀 Chrome Web Store 发布步骤

**5 分钟快速发布指南**

---

## 📋 前置准备

### ✅ 检查清单
- [ ] Chrome 开发者账户（$5 一次性费用）
- [ ] 准备好截图（至少 1 张 1280x800）
- [ ] 隐私政策已托管
- [ ] ZIP 包已创建

---

## 步骤 1: 创建发布 ZIP 包

```bash
cd /Users/jianpinghuang/projects/Synapse

# 清理不必要的文件
rm -rf extension/icons/*.txt
rm -rf extension/dist

# 创建 ZIP 包
zip -r synapse-extension-store-v1.0.0.zip extension \
  -x "*.DS_Store" \
  -x "*__pycache__*" \
  -x "*.pyc" \
  -x "*.log" \
  -x "*node_modules*" \
  -x "*.md" \
  -x "*.html" \
  -x "*.txt"

# 验证 ZIP 内容
unzip -l synapse-extension-store-v1.0.0.zip | head -20
```

**✅ ZIP 包位置**: `/Users/jianpinghuang/projects/Synapse/synapse-extension-store-v1.0.0.zip`

---

## 步骤 2: 准备截图

### 快速截图方法

1. **安装 Extension**
   ```bash
   # 在 Chrome 中加载
   chrome://extensions/
   # 加载已解压的扩展程序 → 选择 extension 文件夹
   ```

2. **访问示例网站**
   - 打开: https://example.com
   - 或任何有内容的网页

3. **截取 Extension 弹窗**
   - 点击 Extension 图标
   - 等待 "Connected" 状态显示
   - 按 `⌘ + Shift + 4` 截图
   - 保存为 `screenshot-1.png`

4. **调整尺寸**
   ```bash
   # 使用 macOS 自带工具
   # 或在线工具: https://www.iloveimg.com/resize-image
   
   # 目标尺寸: 1280x800 或 640x400
   ```

### 建议的 5 张截图

1. **主界面** - Extension 弹窗显示 "Connected"
2. **保存成功** - 展示保存成功的提示
3. **右键菜单** - 展示右键菜单选项
4. **笔记功能** - 展示添加笔记
5. **高亮功能** - 展示选中文本并保存

---

## 步骤 3: 托管隐私政策

### 方法 A: GitHub Pages（推荐）

1. **创建 gh-pages 分支**
   ```bash
   cd /Users/jianpinghuang/projects/Synapse
   git checkout -b gh-pages
   ```

2. **复制隐私政策**
   ```bash
   cp extension/privacy-policy.html index.html
   git add index.html
   git commit -m "Add privacy policy for Chrome Web Store"
   git push origin gh-pages
   ```

3. **启用 GitHub Pages**
   - 访问: https://github.com/Blurjp/Synapse/settings/pages
   - Source: Deploy from a branch
   - Branch: gh-pages / root
   - Save

4. **隐私政策 URL**
   ```
   https://blurjp.github.io/Synapse/
   ```

### 方法 B: 使用现有文件

直接使用 GitHub 仓库中的文件：
```
https://github.com/Blurjp/Synapse/blob/main/extension/privacy-policy.html
```

---

## 步骤 4: 注册开发者账户

1. **访问开发者控制台**
   ```
   https://chrome.google.com/webstore/devconsole
   ```

2. **使用 Google 账户登录**
   - 推荐使用您的个人或工作 Google 账户

3. **支付一次性费用**
   - 金额: $5 USD
   - 支付方式: 信用卡

4. **同意开发者协议**
   - 阅读并同意条款
   - 完成账户设置

---

## 步骤 5: 上传 Extension

### 5.1 创建新项目

1. 在开发者控制台，点击 **"Add new item"**
2. 选择 ZIP 文件: `synapse-extension-store-v1.0.0.zip`
3. 点击 **"Upload"**

### 5.2 填写商店信息

#### 基本信息
- **Name**: `Synapse - Save to Synapse`
- **Short Description**: 
  ```
  Save webpages, highlights, and notes to Synapse - Your AI-powered knowledge hub.
  ```

#### 详细描述
复制 `STORE_DESCRIPTION.md` 中的内容

#### 截图
- 上传至少 1 张截图（最多 5 张）
- 尺寸: 1280x800 或 640x400

#### 图标
- 自动从 manifest.json 读取 (128x128)

#### 分类
- **Category**: Productivity
- **Language**: English, Chinese (Simplified)

---

### 5.3 隐私设置

#### 隐私政策 URL
```
https://blurjp.github.io/Synapse/
```
或
```
https://github.com/Blurjp/Synapse/blob/main/extension/privacy-policy.html
```

#### 单一用途
```
Save web content (pages, highlights, notes) to user's local Synapse backend for knowledge management.
```

#### 权限说明
- **activeTab**: Required to read page content when saving
- **storage**: Required to save extension settings
- **contextMenus**: Required to add right-click menu options

---

### 5.4 发布设置

#### 可见性
- **Public**: 所有人可见（推荐）
- **Private**: 只有特定用户可见

#### 地区
- **All regions**: 所有地区（推荐）
- 或选择特定地区

#### 价格
- **Free**: 免费（推荐）

---

## 步骤 6: 提交审核

### 6.1 最终检查

- [ ] 名称和描述正确
- [ ] 截图已上传
- [ ] 隐私政策 URL 已填写
- [ ] 分类已选择
- [ ] 所有必填项已完成

### 6.2 提交

1. 点击 **"Submit for review"**
2. 确认提交
3. 等待审核

---

## 📊 审核时间

- **通常**: 1-3 个工作日
- **复杂情况**: 可能长达 7 天
- **结果通知**: 邮件通知

---

## 🎉 发布后

### 监控指标

访问开发者控制台查看：
- 安装数量
- 用户评分
- 评论
- 崩溃报告

### 回复评论

- 及时回复用户评论
- 收集反馈
- 计划更新

---

## 🔄 更新 Extension

### 版本更新流程

1. **修改代码**
   ```bash
   # 更新代码
   # 修复 bug 或添加新功能
   ```

2. **更新版本号**
   ```json
   // extension/manifest.json
   {
     "version": "1.0.1"  // 从 1.0.0 升级到 1.0.1
   }
   ```

3. **重新打包**
   ```bash
   zip -r synapse-extension-store-v1.0.1.zip extension -x "*.DS_Store"
   ```

4. **上传更新**
   - 在开发者控制台选择 Extension
   - 点击 "Upload new package"
   - 选择新的 ZIP 文件

5. **提交审核**
   - 填写更新说明
   - 提交审核

---

## ⚠️ 常见问题

### Q1: 审核被拒绝怎么办？

**常见原因**:
- 隐私政策不完整
- 权限说明不清楚
- 截图质量差
- 描述误导

**解决方案**:
- 查看拒绝原因
- 修改相应内容
- 重新提交

### Q2: 如何修改已发布的信息？

- 登录开发者控制台
- 选择 Extension
- 修改信息
- 保存（无需重新审核）

### Q3: Extension 被下架怎么办？

- 检查邮件通知
- 查看下架原因
- 修复问题
- 重新提交

---

## 📞 需要帮助？

### 官方资源
- **发布文档**: https://developer.chrome.com/docs/webstore/publish/
- **审核指南**: https://developer.chrome.com/docs/webstore/review-process/
- **政策指南**: https://developer.chrome.com/docs/webstore/program-policies/

### 我们的资源
- **GitHub**: https://github.com/Blurjp/Synapse
- **Issues**: https://github.com/Blurjp/Synapse/issues

---

## ✅ 发布前最终检查清单

- [ ] ZIP 包已创建并测试
- [ ] 截图已准备（至少 1 张）
- [ ] 隐私政策已托管并 URL 可访问
- [ ] 开发者账户已注册
- [ ] 商店描述已准备
- [ ] 所有信息已填写完整
- [ ] 准备好 $5 注册费

---

**准备就绪！开始发布吧！** 🚀

**下一步**:
1. 创建 ZIP 包
2. 准备截图
3. 托管隐私政策
4. 注册开发者账户
5. 上传并提交审核
