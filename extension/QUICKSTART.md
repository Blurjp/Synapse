# Synapse Extension - 快速开始指南

**3分钟快速上手 Synapse Chrome Extension**

---

## 📦 安装 Extension

### 方法 1: 加载未打包的 Extension（推荐）

1. **打开 Chrome 扩展页面**
   - 在地址栏输入: `chrome://extensions/`
   - 或: 菜单 → 更多工具 → 扩展程序

2. **启用开发者模式**
   - 右上角开关: "开发者模式" → 开启

3. **加载 Extension**
   - 点击 "加载已解压的扩展程序"
   - 选择文件夹: `/Users/jianpinghuang/projects/Synapse/extension`
   - 点击 "选择"

4. **固定 Extension**
   - 点击浏览器工具栏的拼图图标 🧩
   - 找到 "Synapse - Save to Synapse"
   - 点击图钉图标 📌 固定

✅ **完成！** 你应该能在工具栏看到蓝色 Synapse 图标

---

## 🚀 使用方法

### 1. 保存整个网页

**3种方法，任选其一**:

**方法 A**: 点击图标
1. 访问任意网页
2. 点击工具栏的 Synapse 图标
3. 点击 "Save to Synapse" 按钮

**方法 B**: 右键菜单
1. 在网页任意位置右键
2. 选择 "Save to Synapse"

**方法 C**: 键盘快捷键
- Windows/Linux: `Ctrl + Shift + S`
- macOS: `⌘ + Shift + S`

### 2. 保存高亮文本

1. **选择文本**
   - 在网页上用鼠标选择任意文本

2. **保存高亮**
   - 右键 → "Save Highlight to Synapse"
   - 或: 点击 Extension 图标 → "Save Highlight"

3. **添加笔记**（可选）
   - 在 Extension 弹窗中输入笔记
   - 点击 "Save Note"

### 3. 快速笔记

1. 点击 Extension 图标
2. 在 "Quick Note" 文本框中输入
3. 点击 "Save Note"

**提示**: 笔记会自动关联当前网页 URL

---

## ✅ 验证安装

### 检查连接状态

1. 点击 Extension 图标
2. 右上角应显示: **● Connected** (绿色)

**如果显示 "Disconnected"**:
- 确保后端正在运行: `http://localhost:8001/health`
- 检查后端日志: `tail -f /tmp/synapse-backend.log`

### 测试保存

1. 访问任意网页（例如: https://example.com）
2. 点击 Extension 图标 → "Save to Synapse"
3. 应该看到成功提示 ✅

---

## 🎯 功能列表

### ✅ 已实现

| 功能 | 快捷键 | 说明 |
|-----|--------|------|
| 保存网页 | `Ctrl/⌘ + Shift + S` | 保存整个页面到 Synapse |
| 保存高亮 | 右键菜单 | 保存选中的文本 |
| 快速笔记 | - | 添加笔记并关联当前页面 |
| 最近保存 | - | 查看最近5条保存记录 |
| 右键菜单 | - | 快速保存高亮和链接 |

### ⏳ 即将推出

- [ ] PDF 注释
- [ ] YouTube 视频笔记
- [ ] AI 自动摘要
- [ ] 标签管理
- [ ] 搜索已保存内容

---

## 🔧 配置

### 后端 URL

默认: `http://localhost:8001`

修改方法:
1. 打开 `extension/src/popup.js`
2. 修改第 2 行: `const API_BASE_URL = 'http://your-backend-url';`
3. 在 `chrome://extensions/` 重新加载 Extension

### 键盘快捷键

自定义快捷键:
1. 打开 `chrome://extensions/shortcuts`
2. 找到 "Synapse - Save to Synapse"
3. 点击铅笔图标修改

---

## 🐛 故障排除

### 问题: "Disconnected" 状态

**原因**: 后端未运行

**解决**:
```bash
# 启动后端
cd /Users/jianpinghuang/projects/Synapse/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8001

# 验证
curl http://localhost:8001/health
# 应返回: {"status":"healthy"}
```

### 问题: 保存失败

**检查**:
1. 后端是否运行: `curl http://localhost:8001/health`
2. 数据库是否连接: 查看后端日志
3. 权限是否正确: 数据库用户权限

**日志**:
```bash
# 查看后端日志
tail -f /tmp/synapse-backend.log
```

### 问题: Extension 图标不显示

**解决**:
1. 检查 `chrome://extensions/` 是否已启用
2. 点击拼图图标 → 固定 Extension
3. 重新加载 Extension

---

## 📊 查看已保存内容

### 方法 1: Extension 弹窗

点击 Extension 图标 → "Recent Saves"

### 方法 2: API 查询

```bash
# 列出所有 sources
curl http://localhost:8001/api/sources/

# 列出所有 highlights
curl http://localhost:8001/api/highlights/

# 列出所有 notes
curl http://localhost:8001/api/notes/
```

### 方法 3: 数据库查询

```bash
/opt/homebrew/opt/postgresql@16/bin/psql -d synapse -c "SELECT * FROM sources LIMIT 5;"
```

---

## 🎨 界面预览

```
┌─────────────────────────────────┐
│ 🧠 Synapse         ● Connected │ ← 绿点 = 已连接
├─────────────────────────────────┤
│ Current Page                    │
│ ┌─────────────────────────────┐ │
│ │ Example Domain              │ │ ← 当前页面标题
│ │ https://example.com/...     │ │ ← 页面 URL
│ └─────────────────────────────┘ │
│ [➕ Save to Synapse]            │ ← 保存按钮
│                                 │
│ Quick Note                      │
│ ┌─────────────────────────────┐ │
│ │ Type your note here...      │ │ ← 笔记输入框
│ └─────────────────────────────┘ │
│ [✏️ Save Note]                  │ ← 保存笔记
│                                 │
│ Recent Saves                    │
│ • Test Page • 2m ago           │ ← 最近保存
│ • Another Page • 1h ago        │
├─────────────────────────────────┤
│ Open Synapse    Settings        │ ← 底部链接
└─────────────────────────────────┘
```

---

## 💡 使用技巧

### 技巧 1: 快速保存
- 使用键盘快捷键 `⌘ + Shift + S` 比点击图标快 3 倍

### 技巧 2: 批量高亮
- 在同一页面保存多个高亮
- 它们会自动关联到同一 URL

### 技巧 3: 标签笔记
- 在笔记中添加标签: `#important #todo`
- 后续可以按标签搜索

### 技巧 4: 离线使用
- Extension 可以离线保存
- 后端恢复后自动同步

---

## 📞 需要帮助？

### 查看日志
```bash
# 后端日志
tail -f /tmp/synapse-backend.log

# Extension 控制台
# 右键 Extension 图标 → "检查弹出内容" → Console
```

### 重启后端
```bash
# 停止
pkill -f uvicorn

# 启动
cd /Users/jianpinghuang/projects/Synapse/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

### 重新加载 Extension
1. 打开 `chrome://extensions/`
2. 找到 Synapse Extension
3. 点击刷新图标 🔄

---

## 🎉 开始使用！

1. ✅ Extension 已安装
2. ✅ 后端已运行
3. ✅ 连接状态正常

**现在访问任意网页，试试保存功能吧！**

---

**项目主页**: https://github.com/Blurjp/Synapse
**详细测试报告**: EXTENSION_TEST_REPORT.md
**后端 API 文档**: http://localhost:8001/docs

---

**祝使用愉快！** 🚀
