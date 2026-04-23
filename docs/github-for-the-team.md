# GitHub for the EA Team
### A no-code guide to working on the scheduling dashboard together

---

## What is this repo?

Think of it like a shared Google Drive folder — except it tracks every change, who made it, and lets you go back to any previous version. The repo lives at:

**https://github.com/elizabethnakamura/scheduling-tool**

---

## The only file you need to care about

`dashboard.html` — this is the combined scheduling dashboard. It's the file you'll copy into your Cowork to create your personal live version.

Everything in `reference/` is prior work. You don't need to touch it.

---

## How to view files

1. Go to the repo link above
2. Click any file to see its contents
3. Click the download icon (↓) to download it to your computer

---

## How to get your dashboard set up (one time)

1. Go to the repo → click `dashboard.html` → click the download button
2. Open the file in a text editor (TextEdit on Mac, or just open it in a browser first to see it works)
3. Find the `CFG` block near the top — it looks like this:

```js
const CFG = {
  execName: 'Asif Satchu',
  execAccountId: 'Asif',
  ...
};
```

4. Change `execName` to your exec's name
5. Change `execAccountId` to the accountId your Outlook uses for your exec
   - To find yours: in Cowork, ask "what accounts do I have in Outlook?"
   - It'll return something like `"me"`, `"Scott"`, `"Chris"` — use that value
6. Add your exec's personal keywords to `personalKW` so their family/personal events classify correctly
7. Copy the entire file contents → go to your Cowork → create a new artifact → paste it in

That's it. Your dashboard will pull live from your calendar every time you open it.

---

## How to save your changes back to GitHub

If you update your version of `dashboard.html` and want to share the changes with the team:

1. Go to the repo → click `dashboard.html`
2. Click the **pencil icon** (Edit this file) in the top right
3. Select all the text, delete it, paste in your updated version
4. Scroll down to **Commit changes**
5. Write a short note about what you changed (e.g. "added Scott's personal keywords")
6. Click **Commit changes** (green button)

Done. Everyone else can now pull your update.

---

## How to get updates from the team

If someone else made a change:

1. Go to the repo → click `dashboard.html` → download the latest version
2. Copy your `CFG` block (your personal config) from your old version
3. Paste it into the new file, replacing the default CFG block
4. Re-paste into your Cowork artifact

The CFG block is the only thing that's personal to you. Everything else is shared.

---

## How to see what changed

- Click **Commits** at the top of the repo to see a history of every change
- Click any commit to see exactly what was added, removed, or edited (green = added, red = removed)

---

## The golden rule

**Never change someone else's CFG block.** Each person's config is theirs. If you're improving shared logic (the parser, the brand, the layout), that's fair game for everyone.

---

## Questions?

Ping Elizabeth — she's the repo owner and can fix anything that goes sideways.
