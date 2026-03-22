# Zhipu Usage - Stream Deck/Mirabox Plugin

> Monitor your Zhipu AI 5-hour Token Limit directly from your Stream Deck

## Overview
![App](https://github.com/ongyishen/streamdeck-minimax-usage/blob/5287ed8ef9967da97df79564c761a72265dc19be/AppScreenShot.png)
This plugin enables Stream Deck users to monitor their Zhipu AI usage in real-time. It displays usage statistics, remaining quota, and time until reset directly on Stream Deck buttons with color-coded indicators.

## Features

- **Real-time Monitoring**: Fetches and displays current API usage from Zhipu servers
- **Visual Indicators**: Color-coded usage display:
  - 🟢 **Green**: < 80% usage (healthy)
  - 🟡 **Yellow**: 80-90% usage (warning)
  - 🔴 **Red**: > 90% usage (critical)
- **Configurable**: Customize API key and refresh interval
- **Auto-refresh**: Configurable polling interval (1-60 minutes)
- **Manual Refresh**: Press button to instantly update usage data
- **Time Display**: Shows time until 5-hour token limit resets

## Screenshots

### Stream Deck Display
![Stream Deck Button Display](https://github.com/ongyishen/streamdeck-minimax-usage/blob/5287ed8ef9967da97df79564c761a72265dc19be/293.png)

Real-time usage display on Stream Deck button with color-coded indicator and model information.

### Property Inspector Settings

Configuration panel for API key and refresh interval settings.

## Installation

### Prerequisites

- Stream Deck application (compatible with Elgato Stream Deck)
- Zhipu account with API key

### Steps

1. Download this plugin repository
2. Copy plugin folder to your Stream Deck plugins directory:
   - **Windows**: `C:\Users\[YourUsername]\AppData\Roaming\Elgato\StreamDeck\Plugins\`
   - **macOS**: `~/Library/Application Support/com.elgato.StreamDeck/Plugins/`
3. Restart Stream Deck application
4. The plugin will appear under "Zhipu" category in Actions panel

## Configuration

### Accessing Settings

1. Drag "Zhipu Usage" action to a Stream Deck key
2. Right-click key to open Property Inspector
3. Configure the following settings:

| Setting                 | Description                      | Default          |
| ----------------------- | -------------------------------- | ---------------- |
| **API Key**       | Your Zhipu API key (required)    | -                |
| **Refresh (min)** | Auto-refresh interval in minutes | `5`            |

### Getting Your Zhipu API Key

1. Visit [Zhipu AI Platform](https://bigmodel.cn)
2. Sign in to your account
3. Navigate to API Key management
4. Copy your API key and paste it into the plugin settings

## Usage

### Display Information

The Stream Deck button displays three pieces of information:

```
┌─────────────┐
│  Zhipu      │ ← Fixed label (top)
│             │
│  45.2%      │ ← Usage % (center, colored)
│             │
│  4 hr 47 min│ ← Reset in (bottom)
└─────────────┘
```

- **Top**: "Zhipu" (fixed label)
- **Center**: Usage percentage with color indicator
- **Bottom**: Time until 5-hour token limit resets

### Manual Refresh

Press the Stream Deck button to immediately fetch and update usage data without waiting for the auto-refresh timer.

### Error Messages

| Message        | Cause                        | Solution                             |
| -------------- | ---------------------------- | ------------------------------------ |
| `No API Key` | API key not configured       | Enter your API Key in settings       |
| `No Plan`    | TOKENS_LIMIT not found       | Check your Zhipu plan                |
| `API Err`    | API request failed           | Check API key and network connection |
| `Net Err`    | Network connection issue     | Check internet connection            |

## Technical Details

### API Endpoint

- **URL**: `https://bigmodel.cn/api/monitor/usage/quota/limit`
- **Method**: GET
- **Auth**: API Key in Authorization header
- **Response**: JSON with limits array (TOKENS_LIMIT, TIME_LIMIT)

### Event Handling

The plugin handles these Stream Deck events:

| Event                  | Description                      |
| ---------------------- | -------------------------------- |
| `willAppear`         | Initialize button, start polling |
| `willDisappear`      | Clean up, stop polling           |
| `keyUp`              | Manual refresh trigger           |
| `didReceiveSettings` | Apply new configuration          |

### Refresh Logic

- Auto-refresh runs on a configurable timer
- Timer persists across button appearances/disappearances
- Settings changes restart the polling timer with new interval

## References

- **MiraBox**: [Official Product Website](https://mirabox.key123.vip/home)
- **MiraBox Dock SDK Guide**: [Official Documentation](https://sdk.key123.vip/en/guide/overview.html)
- **Zhipu API Platform**: [bigmodel.cn](https://bigmodel.cn)

## File Structure

```
com.ongyishen.minimax.usage.sdPlugin/
├── manifest.json              # Plugin manifest
├── readme.md                 # Stream Dock API documentation (Chinese)
├── README.md                 # Plugin documentation (English)
├── zh_CN.json               # Localization file
├── plugin/
│   ├── index.html            # Main plugin page
│   ├── index.js              # Core plugin logic
│   └── utils/
│       ├── common.js         # Stream Deck utilities
│       └── worker.js         # Worker for timers
├── propertyInspector/
│   └── action1/
│       ├── index.html        # Settings UI
│       ├── index.js          # Settings logic
│       └── utils/
│           ├── common.js     # Shared utilities
│           └── action.js     # Action utilities
└── static/
    ├── css/
    │   └── sdpi.css       # Stream Deck PI styles
    └── icon.png            # Plugin icon
```

## Supported Platforms

- **macOS**: 10.11+
- **Windows**: 7+
- **Stream Deck Software**: 2.9+

## API Details

### Zhipu API Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "limits": [
      {
        "type": "TOKENS_LIMIT",
        "usage": 1000000,
        "currentValue": 250000,
        "percentage": 25.0,
        "nextResetTime": 1711094400000
      },
      {
        "type": "TIME_LIMIT",
        "usage": 500,
        "currentValue": 50,
        "percentage": 10.0
      }
    ]
  },
  "success": true
}
```

### Usage Calculation

```
Percentage = percentage (directly from API, represents usage %)
Remaining = 100 - percentage
```

### Time Formatting

```
Reset Time = nextResetTime - Date.now()
Hours = totalMinutes / 60
Minutes = totalMinutes % 60
Display = "X hr Y min"
```

## Development

### Building

No build step required - plugin uses vanilla JavaScript and standard web technologies.

### Testing

1. Configure with a valid Zhipu API key
2. Set refresh interval to 1 minute for quick testing
3. Monitor browser console for debug logs:
   - `[Zhipu] willAppear` - Button initialized
   - `[Zhipu] Polling every X minutes` - Timer status
   - `[Zhipu] keyUp - refreshing` - Manual refresh
   - `[Zhipu] Response:` - API response data

### Debug Mode

All debug messages are prefixed with `[Zhipu]` and logged to the console.

## Troubleshooting

### Button shows "Loading..."

- Check that your API key is valid
- Verify internet connection
- Wait for the first API call to complete

### Button shows "No Plan"

- Your Zhipu account may not have a TOKENS_LIMIT quota
- Check your plan at [bigmodel.cn](https://bigmodel.cn)

### Usage stuck at old value

- Press button to trigger manual refresh
- Check refresh interval setting (may be too long)
- Restart Stream Deck application

### Cannot see settings panel

- Ensure Property Inspector is enabled in Stream Deck settings
- Right-click button to open settings (not just click)

## Credits

- **Author**: ONG YI SHEN
- **Repository**: [ongyishen](https://github.com/ongyishen)

## License

This plugin is provided as-is for use with Zhipu API.

## Version History

### v1.0

- Initial release
- Zhipu AI Usage Monitor
- Configurable refresh intervals
- Color-coded usage indicators
- 5-hour token limit with reset countdown

## Support

For issues or questions:

1. Check [Stream Dock SDK Guide](https://sdk.key123.vip/en/guide/overview.html) for development reference
2. Verify your Zhipu API key is valid
3. Check browser console for error messages

---

**Note**: This plugin requires an active Zhipu account with a valid API key to function. API usage is subject to Zhipu's terms of service.
