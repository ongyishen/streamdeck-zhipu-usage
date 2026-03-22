# Zhipu AI (Coding Plan) Usage Query Implementation

This document describes how the `opencode-mystatus` repository queries Zhipu AI "Coding Plan" usage data.

## 1. API Endpoints
The repository uses the following (likely internal/undocumented) API endpoints for monitoring usage:

- **Zhipu AI**: `https://bigmodel.cn/api/monitor/usage/quota/limit`
- **Z.ai**: `https://api.z.ai/api/monitor/usage/quota/limit`

## 2. Request Details
The query is performed via a `GET` request with the following headers:

| Header | Value |
| :--- | :--- |
| `Authorization` | `<Your_Zhipu_API_Key>` |
| `Content-Type` | `application/json` |
| `User-Agent` | `OpenCode-Status-Plugin/1.0` |

## 3. Core Implementation Logic
The implementation resides primarily in `plugin/lib/zhipu.ts`.

### 3.1 Data Structures
The API returns a list of `limits` containing usage information:
- `TOKENS_LIMIT`: Represents the 5-hour Token limit usage.
- `TIME_LIMIT`: Represents the MCP monthly search quota usage.

### 3.2 Display Logic
The code calculates the remaining percentage and format it into a progress bar:
- **Remaining Percentage**: Calculated using `calcRemainPercent(percentage)`.
- **Progress Bar**: Generated using `createProgressBar(remainPercent)`.
- **Reset Time**: For `TOKENS_LIMIT`, it parses `nextResetTime` to show when the quota will reset.

## 4. "Coding Plan" Label
In the repository's internationalization file (`plugin/lib/i18n.ts`), the label `zhipuAccountName` is explicitly set to **"Coding Plan"**, which is why the tool identifies these accounts as such.

```typescript
// plugin/lib/i18n.ts
zhipuAccountName: "Coding Plan",
```

## 5. API Response Structure
The API returns a JSON response that reflects your current plan's status.

### Example Response
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

### Response Field Explanations
*   **`code`**: Status code (`200` for success).
*   **`msg`**: Success or error message.
*   **`data.limits`**: An array of quota items:
    *   **`type`**: Either `TOKENS_LIMIT` (5-hour token window) or `TIME_LIMIT` (MCP monthly search quota).
    *   **`usage`**: The total allowed quota (e.g., total tokens or total searches).
    *   **`currentValue`**: How much you have already used.
    *   **`percentage`**: The usage percentage (used by the plugin to render the progress bar).
    *   **`nextResetTime`**: (Only for `TOKENS_LIMIT`) A Unix timestamp in milliseconds indicating when the next window resets.
*   **`success`**: Boolean indicating if the request was successful.

## 6. Files Involved
- `plugin/lib/zhipu.ts`: Core query and formatting logic.
- `plugin/lib/i18n.ts`: Localization strings including the "Coding Plan" labeling.
- `plugin/lib/utils.ts`: Helper functions for fetching, formatting tokens, and building UI elements.
