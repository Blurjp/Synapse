# Synapse Chrome Extension - Installation Guide

## 📦 Installation Steps

### 1. Load Extension in Chrome/Brave/Edge

1. **Open Extensions Page**
   ```
   chrome://extensions/
   ```
   Or in Brave: `brave://extensions/`
   Or in Edge: `edge://extensions/`

2. **Enable Developer Mode**
   - Toggle "Developer mode" switch (top right corner)

3. **Load Unpacked Extension**
   - Click "Load unpacked" button
   - Navigate to: `/Users/jianpinghuang/projects/Synapse/extension`
   - Click "Select"

4. **Pin Extension**
   - Click puzzle icon in browser toolbar
   - Find "Synapse - Save to Synapse"
   - Click pin icon to keep it visible

---

## ✅ Verify Installation

1. **Check Extension Icon**
   - You should see the Synapse icon (blue square) in toolbar

2. **Test Connection**
   - Click extension icon
   - Should show "Connected" status (green dot)
   - If "Disconnected", ensure backend is running

3. **Test Save**
   - Navigate to any webpage
   - Click "Save to Synapse"
   - Should see success message

---

## 🚀 Usage

### Save Entire Page
**Method 1**: Click extension icon → "Save to Synapse"
**Method 2**: Right-click anywhere → "Save to Synapse"
**Method 3**: Keyboard shortcut `Ctrl/Cmd + Shift + S`

### Save Highlight
1. Select text on webpage
2. Right-click → "Save Highlight to Synapse"
3. Or click extension icon → "Save Highlight"

### Quick Note
1. Click extension icon
2. Type note in text area
3. Click "Save Note"

---

## ⚙️ Configuration

### Backend URL
Default: `http://localhost:8000`

To change:
1. Open `extension/src/popup.js`
2. Update `API_BASE_URL` constant
3. Reload extension in `chrome://extensions/`

### Keyboard Shortcuts
1. Go to `chrome://extensions/shortcuts`
2. Find "Synapse - Save to Synapse"
3. Click pencil icon to customize

---

## 🐛 Troubleshooting

### Extension Not Loading
- Check for errors in `chrome://extensions/`
- Click "Errors" button on extension card
- Check console: Right-click extension icon → "Inspect popup"

### "Disconnected" Status
- Ensure backend is running:
  ```bash
  cd /Users/jianpinghuang/projects/Synapse/backend
  source venv/bin/activate
  uvicorn app.main:app --reload
  ```
- Test backend: http://localhost:8000/health

### Can't Save Pages
- Check backend console for errors
- Verify API endpoint exists
- Check CORS settings

### Icons Not Showing
- Icons are generated from the provided app icon at `extension/icons/icon-app.svg`
- To customize, regenerate the PNG files in `extension/icons/`
- Reload extension after changes

---

## 📁 File Structure

```
extension/
├── manifest.json       # Extension configuration (Manifest V3)
├── README.md           # Documentation
├── INSTALL.md          # This file
├── src/
│   ├── popup.html      # Popup UI
│   ├── popup.css       # Popup styles
│   ├── popup.js        # Popup logic & API calls
│   ├── content.js      # Injected script (page extraction)
│   ├── content.css     # Injected styles
│   └── background.js   # Service worker (context menus, shortcuts)
└── icons/
    ├── icon.svg        # Source icon (vector)
    ├── icon16.png      # 16x16 icon
    ├── icon32.png      # 32x32 icon
    ├── icon48.png      # 48x48 icon
    └── icon128.png     # 128x128 icon
```

---

## 🔧 Development

### Make Changes
1. Edit files in `extension/src/`
2. Go to `chrome://extensions/`
3. Click reload icon on extension card
4. Test changes

### Debug Popup
- Right-click extension icon
- Select "Inspect popup"
- Check console for errors

### Debug Content Script
- Open any webpage
- Open DevTools (F12)
- Check console for content script logs

### Debug Background
- Go to `chrome://extensions/`
- Find "Synapse" extension
- Click "Service Worker" link
- Check console

---

## 🔐 Permissions

The extension requests these permissions:

- **activeTab**: Access current tab when clicked
- **storage**: Save extension settings
- **contextMenus**: Add right-click menu items
- **http://localhost:8000/***: Connect to local backend

No data is sent to external servers.

---

## 📊 Current Features

### ✅ Implemented
- Save webpage to Synapse
- Save text selection as highlight
- Quick notes with source URL
- Right-click context menu
- Keyboard shortcuts
- Connection status indicator
- Recent saves list
- Clean, modern UI

### ⏳ Coming Soon
- PDF annotation
- YouTube video notes
- AI summarization
- Tag management
- Search saved content
- Sync across devices

---

## 🆘 Need Help?

1. **Check Backend Logs**
   ```bash
   tail -f /tmp/synapse-backend.log
   ```

2. **Check Extension Console**
   - Right-click extension icon → "Inspect popup"
   - Check Console tab

3. **Restart Extension**
   - Go to `chrome://extensions/`
   - Click reload icon

4. **Restart Backend**
   ```bash
   pkill -f uvicorn
   cd /Users/jianpinghuang/projects/Synapse/backend
   source venv/bin/activate
   uvicorn app.main:app --reload
   ```

---

## 📝 Notes

- Extension only works with local backend (localhost:8000)
- No authentication required (will be added later)
- Icons are placeholders (can be customized)
- Content scripts run on all URLs (can be restricted in manifest.json)

---

**Extension Location**: `/Users/jianpinghuang/projects/Synapse/extension`
**GitHub**: https://github.com/Blurjp/Synapse/tree/main/extension
