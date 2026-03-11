# Synapse Chrome Extension

Browser extension for saving web content to Synapse.

## Installation

### Development Mode

1. **Generate Icons** (or use placeholder)
   ```bash
   # If you have ImageMagick or similar tool
   convert icon.svg -resize 16x16 icon16.png
   convert icon.svg -resize 32x32 icon32.png
   convert icon.svg -resize 48x48 icon48.png
   convert icon.svg -resize 128x128 icon128.png
   ```

2. **Load Extension**
   - Open Chrome/Brave/Edge
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `extension` folder

3. **Pin Extension**
   - Click puzzle icon in toolbar
   - Find "Synapse - Save to Synapse"
   - Click pin icon

## Features

### ✅ Implemented
- Save entire webpage to Synapse
- Save selected text as highlight
- Quick notes
- Context menu integration
- Keyboard shortcuts
  - `Ctrl/Cmd + Shift + S` - Save page
  - `Ctrl/Cmd + Shift + N` - Quick note

### ⏳ Coming Soon
- PDF annotation
- YouTube video timestamp notes
- AI summarization
- Tag management
- Search saved content

## Usage

### Save Page
1. Navigate to any webpage
2. Click extension icon
3. Click "Save to Synapse"

Or right-click anywhere on page → "Save to Synapse"

### Save Highlight
1. Select text on any webpage
2. Right-click → "Save Highlight to Synapse"
3. Or use extension popup

### Quick Note
1. Click extension icon
2. Type note in text area
3. Click "Save Note"

## Configuration

### Backend URL
Default: `http://localhost:8000`

To change:
1. Open `src/popup.js`
2. Update `API_BASE_URL` constant

### Keyboard Shortcuts
1. Go to `chrome://extensions/shortcuts`
2. Find "Synapse - Save to Synapse"
3. Customize shortcuts

## Development

### File Structure
```
extension/
├── manifest.json       # Extension configuration
├── src/
│   ├── popup.html      # Popup UI
│   ├── popup.css       # Popup styles
│   ├── popup.js        # Popup logic
│   ├── content.js      # Injected script
│   ├── content.css     # Injected styles
│   └── background.js   # Service worker
└── icons/              # Extension icons
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

### Testing
1. Make changes to files
2. Go to `chrome://extensions/`
3. Click reload icon on extension card
4. Test changes

## Troubleshooting

### Extension Not Working
1. Check backend is running: http://localhost:8000/health
2. Check console for errors: Right-click extension icon → "Inspect popup"
3. Check background logs: `chrome://extensions/` → "Service Worker"

### Can't Save Pages
- Ensure backend is running
- Check CORS settings in backend
- Verify API endpoints exist

### Icons Not Showing
- Generate PNG icons from SVG
- Or use placeholder icons

## Permissions

- `activeTab`: Access current tab
- `storage`: Save settings
- `contextMenus`: Right-click menu
- `http://localhost:8000/*`: Backend API

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

MIT

---

**Built with ❤️ for Synapse**
