# Getting Started
### For Caroline, Ariel, and Alexandra

This gets you from zero to fully set up — repo on your computer, dashboard running in Cowork, and a skill that lets you push changes with one command.

Takes about 15 minutes total.

---

## Step 1: Create a GitHub account

If you already have one, skip this.

Go to [github.com/signup](https://github.com/signup) and create a free account. Once you have one, send your username to Elizabeth so she can add you as a collaborator on the repo.

Wait for the invite email from GitHub, then click **Accept invitation** before moving on.

---

## Step 2: Get the repo on your computer

Open **Terminal** (search for it in Spotlight with Cmd+Space).

Paste this and hit enter:

```bash
cd ~/Documents && git clone https://github.com/elizabethnakamura/scheduling-tool.git
```

This downloads everything into a `scheduling-tool` folder in your Documents. You only do this once.

---

## Step 3: Get a GitHub token (your password for pushing)

GitHub doesn't let you use your regular password to push changes — you need a token instead.

1. Go to [github.com](https://github.com) → click your avatar (top right) → **Settings**
2. Scroll to the bottom of the left sidebar → **Developer settings**
3. **Personal access tokens** → **Tokens (classic)** → **Generate new token (classic)**
4. Give it a name (e.g. `scheduling-tool`), set expiration to 90 days, check the **`repo`** box
5. Click **Generate token** — copy it immediately (it won't show again)

Keep that token somewhere safe (Notes app is fine). You'll need it the first time you push.

---

## Step 4: Set up your dashboard

1. Go to the repo: [github.com/elizabethnakamura/scheduling-tool](https://github.com/elizabethnakamura/scheduling-tool)
2. Click `dashboard.html` → click the download button (↓)
3. Open the file in a text editor — search for the `CFG` block:

```js
const CFG = {
  execName: 'Asif Satchu',
  execAccountId: 'Asif',
  ...
};
```

4. Change `execName` to your exec's name
5. Change `execAccountId` to your exec's accountId in Outlook
   - To find it: in Cowork, ask "what accounts do I have in Outlook?"
   - It'll return something like `"me"`, `"Scott"`, `"Chris"` — use that value
6. Add your exec's personal keywords to `personalKW` (kids' names, recurring activities, etc.) so those events classify correctly
7. In Cowork, create a new artifact → paste the full file contents in → save it

Your dashboard is now live and pulling from your calendar.

---

## Step 5: Install the push-to-github skill

Download this file: [push-to-github.skill](../push-to-github.skill)

Double-click it to install. Once installed, you can say "push to github" or "push my changes" in Cowork and it will handle everything — check what changed, suggest a commit message, and push once you confirm.

The first time you use it, it'll ask where you cloned the repo. Just say `~/Documents/scheduling-tool` and it'll remember from then on.

---

## Day-to-day workflow

When you make changes to your dashboard and want to share them with the team:

1. Say **"push to github"** in Cowork
2. Confirm the commit message it suggests (or give your own)
3. Done — your changes are on GitHub

When someone else has pushed changes and you want to get them:

```bash
cd ~/Documents/scheduling-tool
git pull
```

That's it.

---

## Need help?

Ping Elizabeth — she's the repo owner.

Full GitHub guide (for viewing files, editing in browser, etc.) is in `docs/github-for-the-team.md`.
