# ⚡ GitHub Account Enhancer

A powerful web app to automatically enhance your GitHub profile for placements.

## ✨ Features
- 📊 **Dashboard** — Profile score, checklist, repo stats
- 👤 **Profile Updater** — Bio, name, location, website, Twitter
- 📝 **README Generator** — AI-powered profile README with stats, badges, trophies
- 📦 **Repo Bulk Enhancer** — Auto descriptions + topics for all repos

---

## 🚀 Deploy on Vercel (Step by Step)

### Step 1 — Upload Code
1. GitHub pe ek **new repository** banao (e.g. `github-enhancer`)
2. Is folder ki saari files us repo mein push karo

### Step 2 — Vercel pe Deploy karo
1. [vercel.com](https://vercel.com) pe jao → **Sign up with GitHub**
2. **"New Project"** click karo
3. Apna `github-enhancer` repo select karo
4. **"Deploy"** dabao — 2 minutes mein deploy ho jayega!

### Step 3 — GitHub Token Add karo (SECRET!)
1. Vercel project → **Settings** tab
2. Left mein **"Environment Variables"**
3. Add karo:
   - **Name**: `GITHUB_TOKEN`
   - **Value**: `ghp_xxxxxxxxxxxxxxxx` (tumhara token)
4. **Save** → **Redeploy** (top right "Redeploy" button)

### Step 4 — Done! 🎉
Vercel ka URL open karo — `your-app.vercel.app`
Token safe rahega server mein, URL pe visible nahi hoga!

---

## 🔑 GitHub Token Permissions Needed
- `repo` — Full repository access
- `user` — Profile read/write
- `read:org` — Organization info

---

## 🛡️ Security
- Token **sirf** Vercel server pe hai
- Frontend se token **kabhi visible nahi** hoga
- Token revoke karna ho toh GitHub Settings → Developer Settings → Tokens
