# 🐟 BIO-FISH — Bioplastic Formation Monitoring System

A mobile app + PHP backend for monitoring and controlling the BIO-FISH bioplastic production machine. Built with React Native (Expo) and XAMPP.

---

## 📋 Table of Contents

1. [What is BIO-FISH?](#what-is-bio-fish)
2. [Features](#features)
3. [Project Structure](#project-structure)
4. [Setup Guide](#setup-guide)
   - [Step 1: Clone the Repository](#step-1-clone-the-repository)
   - [Step 2: Set Up the Backend (XAMPP)](#step-2-set-up-the-backend-xampp)
   - [Step 3: Set Up the Mobile App](#step-3-set-up-the-mobile-app)
   - [Step 4: Find Your IP Address](#step-4-find-your-ip-address)
   - [Step 5: Run the App](#step-5-run-the-app)
5. [Login Credentials](#login-credentials)
6. [How to Use the App](#how-to-use-the-app)
7. [Demo Mode vs Real Mode](#demo-mode-vs-real-mode)
8. [ESP32 Setup (When Ready)](#esp32-setup-when-ready)
9. [Collaborating with Git](#collaborating-with-git)
10. [Testing Remotely (Different Wi-Fi)](#testing-remotely-different-wi-fi)
11. [Common Issues & Fixes](#common-issues--fixes)
12. [Working with Claude AI (Recommended)](#working-with-claude-ai-recommended)
13. [Tech Stack](#tech-stack)

---

## What is BIO-FISH?

BIO-FISH is a capstone/thesis project that monitors and controls a machine that produces bioplastic sheets from fish scales. The system has two parts:

- **Mobile app** — operators and admins use this on their phones to monitor the machine, manage batches, track inventory, and submit feedback
- **PHP backend** — runs on a laptop/PC via XAMPP, connects to the database and communicates with the ESP32 hardware

---

## Features

| Feature | Description |
|---|---|
| 🔐 User Authentication | Admin and Operator roles with secure login |
| 👥 User Management | Admins can add, delete, and change roles of users |
| 🎛️ Machine Control | Start, pause, resume, stop, and cleaning mode |
| 📊 Real-time Dashboard | Machine status, batch progress, production stats |
| 📦 Inventory Management | Track fish scales (kg) and process materials (mL) with edit support |
| 📋 Batch History | View all batches with detailed records |
| 💬 Quality Feedback | Submit per-batch feedback with ratings, bug reports, and feature requests |
| 🧪 Demo Mode | Simulate the full machine cycle without an ESP32 |
| 🎮 Mini Game | Scale Catcher game hidden in the Dashboard tab |
| ❓ Help & User Guide | Built-in FAQ and manual accessible from the (?) button |

---

## Project Structure

```
biofish-app/
├── mobile/                        ← React Native (Expo) app
│   ├── App.js                     ← Entry point, handles login state
│   ├── screens/
│   │   ├── SplashScreen.js        ← Opening animation
│   │   ├── LoginScreen.js         ← Login form
│   │   ├── DashboardScreen.js     ← Main screen with tab bar and header
│   │   ├── ManageUsersScreen.js   ← Admin-only: add/delete/edit users
│   │   └── HelpScreen.js          ← FAQ and user guide
│   ├── tabs/
│   │   ├── DashboardTab.js        ← Machine card, metrics, game card
│   │   ├── BatchesTab.js          ← Batch list with search and filters
│   │   ├── InventoryTab.js        ← Fish scales + additives with stats and edit
│   │   └── FeedbackTab.js         ← Feedback list and stats
│   ├── modals/
│   │   ├── StartBatchModal.js     ← Form to start a new batch
│   │   ├── AddInventoryModal.js   ← Form to add inventory items
│   │   └── AddFeedbackModal.js    ← Form to submit feedback
│   ├── components/
│   │   ├── MachineCard.js         ← Machine status display and controls
│   │   ├── SpringButton.js        ← Animated button with spring effect
│   │   ├── Card.js                ← Reusable card component
│   │   └── useDemoMachine.js      ← Demo mode timer and stage logic
│   └── constants/
│       ├── api.js                 ← ⚠️ Set your IP address here
│       ├── theme.js               ← Colors, spacing, shared styles
│       └── colors.js              ← Color palette
│
└── backend/                       ← PHP backend (place inside XAMPP htdocs)
    ├── config.php                 ← ⚠️ DB credentials and ESP32 IP
    └── api/
        ├── auth.php               ← Login endpoint
        ├── users.php              ← User management (admin only)
        ├── dashboard.php          ← Metrics, batches, materials, feedback
        ├── start_batch.php        ← Create batch + deduct inventory
        ├── control.php            ← Send commands to ESP32
        ├── demo_control.php       ← Demo mode stage simulation
        ├── add_material.php       ← Add inventory items
        ├── edit_material.php      ← Edit inventory items
        ├── delete_material.php    ← Delete inventory items
        ├── inventory_stats.php    ← Inventory summary stats
        ├── add_feedback.php       ← Submit feedback
        ├── get_batch_form_data.php← Materials for batch start form
        └── get_completed_batches.php ← For feedback batch picker
```

---

## Setup Guide

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/biofish-app.git
cd biofish-app
```

> Replace `YOUR_USERNAME` with the actual GitHub username.

---

### Step 2: Set Up the Backend (XAMPP)

**a. Install XAMPP**
Download from [https://www.apachefriends.org](https://www.apachefriends.org) and install it.

**b. Copy the backend folder**
Copy the `backend/` folder into XAMPP's htdocs directory:

```
Windows: C:\xampp\htdocs\biofish-backend\
Mac:     /Applications/XAMPP/htdocs/biofish-backend/
```

Your API will be available at: `http://YOUR_IP/biofish-backend/api`

**c. Import the database**
1. Open XAMPP Control Panel → Start **Apache** and **MySQL**
2. Go to `http://localhost/phpmyadmin` in your browser
3. Click **New** → name it `biofish_db` → click **Create**
4. Click the `biofish_db` database → go to **Import** tab
5. Click **Choose File** → select `biofish_db.sql` from the project root
6. Click **Go**

**d. Check config.php**
Open `backend/config.php` and confirm these settings:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');           // XAMPP default has no password
define('DB_NAME', 'biofish_db');
define('ESP32_IP', '192.168.x.x');  // update when ESP32 is connected
define('ESP32_PORT', '80');
```

---

### Step 3: Set Up the Mobile App

**a. Install Node.js**
Download from [https://nodejs.org](https://nodejs.org) — version 18 or higher.

**b. Install Expo Go on your phone**
- Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

**c. Install dependencies**
```bash
cd mobile
npm install
```

---

### Step 4: Find Your IP Address

Your phone and computer must be on the **same Wi-Fi network**.

**Windows:**
```bash
ipconfig
```
Look for **IPv4 Address** under your active Wi-Fi adapter. Example: `192.168.1.47`

**Mac/Linux:**
```bash
ifconfig | grep inet
```

---

### Step 5: Run the App

**a. Set your IP address**
Open `mobile/constants/api.js` and update:

```js
export const API_URL = 'http://192.168.1.47/biofish-backend/api';
//                            ↑ your computer's IPv4 address
```

> ⚠️ This IP can change every time you reconnect to Wi-Fi. Always check before running.

**b. Start the app**
```bash
cd mobile
npx expo start
```

**c. Scan the QR code**
Open Expo Go on your phone and scan the QR code shown in the terminal.

---

## Login Credentials

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `password123` |
| Operator | `operator1` | `password123` |

> Admins can create new operator/admin accounts from the **Users tab** inside the app.

---

## How to Use the App

### Dashboard Tab
- See the machine's current status (idle, running, paused, cleaning)
- Start, pause, resume, stop the machine
- View production metrics (total batches, success rate, avg time, low stock count)
- Tap 🎮 **Scale Catcher** to play the mini game

### Batches Tab
- Browse all production batches
- Search and filter by status, batch code, or fish type
- Tap a batch to expand its details

### Inventory Tab
- View fish scales (kg) grouped by type, and process materials (mL)
- Stats bar shows totals, low stock count, and most-used material
- Tap the **+ Add** button to add new stock
- Tap the **✏️ pencil** icon to edit an existing entry
- Long-press an entry to delete it

### Feedback Tab
- View all submitted feedback with ratings and tags
- Tap **+ Add** to submit feedback for a completed batch

### Users Tab *(Admin only)*
- Add new users with username, role, and initial password
- Tap a user's role badge to toggle between Admin and Operator
- Tap the trash icon to delete a user

### Help Screen
- Tap the **?** button in the top-right of the header from any screen
- Contains FAQ, feature explanations, and troubleshooting tips

---

## Demo Mode vs Real Mode

| | Demo Mode ON | Demo Mode OFF |
|---|---|---|
| Start batch | Runs 5-second simulated stages | Sends command to ESP32 |
| ESP32 needed | ❌ No | ✅ Yes |
| Batch saved to DB | ✅ Yes | ✅ Yes |
| Inventory deducted | ✅ Yes (rolled back if stopped early) | ✅ Yes |

Toggle Demo Mode with the 🧪 flask button at the top of the Dashboard tab.

**To change stage duration** (default: 5 seconds each), edit `mobile/components/useDemoMachine.js`:
```js
export const STAGES = [
  { key: 'extraction',     label: 'Extraction',     duration: 5 },
  { key: 'filtration',     label: 'Filtration',     duration: 5 },
  { key: 'formulation',    label: 'Formulation',    duration: 5 },
  { key: 'film_formation', label: 'Film Formation', duration: 5 },
];
```

---

## ESP32 Setup (When Ready)

1. Flash your ESP32 with the machine firmware
2. Connect ESP32 to the same Wi-Fi as your computer
3. Find the ESP32's IP (shown in Arduino Serial Monitor)
4. Update `backend/config.php`:
```php
define('ESP32_IP', '192.168.x.x');
```
5. Turn **Demo Mode OFF** in the app
6. Start a batch → fill the checklist → the machine will run for real

---

## Collaborating with Git

### First time (your teammate)
```bash
git clone https://github.com/YOUR_USERNAME/biofish-app.git
cd biofish-app/mobile
npm install
```

### Daily workflow
```bash
# Before starting — always pull first
git pull

# After making changes — push your work
git add .
git commit -m "describe what you changed"
git push
```

### If there's a conflict
Open the file in VS Code — it highlights both versions. Keep the right one, then:
```bash
git add .
git commit -m "resolve conflict"
git push
```

### Useful commands
```bash
git status          # see which files changed
git log --oneline   # see commit history
git diff            # see exact line changes
git reset --hard origin/main  # ⚠️ discard all local changes
```

---

## Testing Remotely (Different Wi-Fi)

If your teammate is at a different location, use **ngrok**:

1. Download from [https://ngrok.com](https://ngrok.com) and create a free account
2. Start XAMPP, then run:
```bash
ngrok http 80
```
3. You'll get a public URL like `https://abc123.ngrok.io`
4. Update `mobile/constants/api.js`:
```js
export const API_URL = 'https://abc123.ngrok.io/biofish-backend/api';
```
5. Share the URL with your teammate — works from anywhere

> ⚠️ The ngrok URL changes every time you restart it. Update `api.js` each time.

---

## Common Issues & Fixes

| Problem | Fix |
|---|---|
| "Connection failed" on login | Check `api.js` IP matches your current IPv4. Make sure XAMPP Apache is running. |
| "Invalid username or password" | Run `reset_passwords.php` once in the browser to rehash all passwords. |
| "Could not reach machine" | ESP32 not connected or wrong IP in `config.php`. Use Demo Mode instead. |
| Batch stuck as "running" | Run this in phpMyAdmin SQL tab: `UPDATE batches SET status = 'stopped', end_time = NOW() WHERE status IN ('running', 'paused');` |
| Inventory not deducted | Check `batch_materials` table exists in the database. |
| App changes not showing on teammate's phone | They need to `git pull` and restart Expo. |
| IP changed after reconnecting | Always run `ipconfig` before testing and update `api.js`. |
| `node_modules` errors | Delete `mobile/node_modules/` and run `npm install` again. |

---

## Working with Claude AI (Recommended)

This project is set up to work well with [Claude](https://claude.ai) for development help. Here's the recommended workflow:

### Connect your GitHub repository to Claude

1. Go to [claude.ai](https://claude.ai) and open or create a **Project**
2. In the Project, click **Add content** → **Link GitHub repository**
3. Connect `biofish-app` — Claude will be able to read all your files
4. Now when you ask Claude questions, it already knows your project structure, code, and patterns

### Why this helps

- Claude can reference your actual code instead of guessing
- You get precise answers like "add this to line 47 of `DashboardScreen.js`" instead of generic examples
- Claude can spot conflicts, missing imports, and logic errors in context

### Recommended prompts

```
"Check if everything is wired correctly in DashboardScreen and DashboardTab"
"I added [feature] — write a commit message for it"
"This error happened: [paste error] — what's wrong?"
"Lets do [feature] — review the relevant files first then build it"
```

### Tips

- Paste error messages directly — Claude can usually pinpoint the cause
- Share the relevant file contents when asking about specific bugs
- After any major feature, ask Claude for a commit message
- Use Claude to generate the `reset_passwords.php` or other one-time utility scripts when needed

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo Go |
| Backend | PHP 8+ |
| Server | Apache via XAMPP |
| Database | MySQL (`biofish_db`) |
| Hardware | ESP32 + DS18B20 temperature sensors |
| Version Control | Git + GitHub |

---

## Authors

Capstone/thesis project — built for sustainable bioplastic production research using fish scale waste.