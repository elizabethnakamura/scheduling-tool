# MRC Scheduling Dashboard

Live scheduling dashboard for the MRC EA team. Each EA has their own view, configured for their exec and access level. Powered by Cowork + Outlook MCP.

## Team

| EA | Exec | Folder |
|----|------|--------|
| Elizabeth | Asif Satchu | `elizabeth/` |
| Caroline | Chris O'Connell | `caroline/` |
| Ariel | TBD | `ariel/` |
| Alexandra | Scott Tenley | `alexandra/` |

## How it works

- `dashboard-template.html` is the shared base — all logic and styling lives here
- Each EA has their own copy in their folder, pre-configured for their exec
- Dashboards pull live from Outlook via Cowork's MCP connection
- Each person's Cowork uses **their own** Outlook credentials, so access levels are respected automatically

## Setting up your dashboard

1. Copy `dashboard-template.html` into your folder (e.g. `caroline/dashboard.html`)
2. Open it and find the `CONFIG` block at the top of the `<script>` tag
3. Fill in:
   - `execName` — your exec's display name
   - `execAccountId` — the accountId Outlook assigns to your exec in your account
     - To find this: in Cowork, ask "what accounts do I have in Outlook?" or run `list-accounts`
     - Common values: `"me"` (your own), or a name like `"Asif"`, `"Scott"`, etc.
   - `personalKeywords` — add your exec's kids' names, regular activities, etc.
4. Create a new artifact in your Cowork and paste the full HTML
5. It will start pulling live calendar data immediately

## Access levels

The dashboard handles different access levels automatically:

- **Full delegate access** (e.g. Elizabeth → Asif): set `execAccountId` to the delegate ID. Set `showMyCalendar: false` unless you also want your own events shown.
- **Partial/shared calendar**: same setup — the dashboard only shows what Outlook gives you.
- **Your own calendar only**: set `execAccountId: 'me'`, `showMyCalendar: false`.
- **Your calendar + exec's**: set both `execAccountId` and `myAccountId: 'me'`, enable `showMyCalendar: true`.

## Updating

When the template changes:
1. Pull the latest from `main`
2. Re-apply your CONFIG block to the updated template
3. Re-paste into your Cowork artifact (use the Reload button to refresh data)

## File structure

```
scheduling-dashboard/
├── README.md
├── dashboard-template.html   ← start here
├── shared/
│   ├── brand.css             ← MRC design tokens
│   └── calendar-parser.js    ← parser + utilities (reference, not loaded by dashboards)
├── elizabeth/
│   └── dashboard.html
├── caroline/
│   └── dashboard.html
├── ariel/
│   └── dashboard.html
└── alexandra/
    └── dashboard.html
```

## Brand

Design system: **MRC Executive Intelligence**
- Primary: `#002D74` (MRC Navy)
- Surface: `#f8f9ff`
- Typefaces: Newsreader (serif headlines) + Manrope (UI) — system fallbacks in dashboards
- Full spec: `shared/brand.css`
