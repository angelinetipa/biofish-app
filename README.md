# 🐟 BIO-FISH — Bioplastic Formation Monitoring System

A mobile app + PHP backend for monitoring and controlling the BIO-FISH bioplastic production machine. Built with React Native (Expo) and XAMPP.

---

## 📁 Project Structure

```
biofish-app/
├── mobile/               ← React Native (Expo) app
│   ├── screens/          ← LoginScreen, DashboardScreen, SplashScreen
│   ├── tabs/             ← DashboardTab, BatchesTab, InventoryTab, FeedbackTab, GameTab
│   ├── components/       ← MachineCard, ControlBtn, SpringButton, Card, useDemoMachine
│   ├── modals/           ← StartBatchModal, AddInventoryModal, AddFeedbackModal
│   ├── constants/        ← api.js (API URL config), theme.js, colors.js
│   └── App.js            ← Entry point
│
└── backend/              ← PHP backend (goes inside XAMPP htdocs)
    ├── api/              ← All API endpoints
    │   ├── auth.php
    │   ├── dashboard.php
    │   ├── start_batch.php
    │   ├── demo_control.php
    │   ├── control.php   ← Sends commands to ESP32
    │   ├── get_batch_form_data.php
    │   ├── get_completed_batches.php
    │   └── add_material.php, add_feedback.php, etc.
    └── config.php        ← DB + ESP32 config
```

---

## ⚙️ Setup: XAMPP (Backend)

### 1. Install XAMPP
Download from [https://www.apachefriends.org](https://www.apachefriends.org) and install.

### 2. Place the backend folder
Copy the `backend/` folder into XAMPP's htdocs:
```
C:\xampp\htdocs\biofish-backend\
```
So your API URL becomes: `http://YOUR_IP/biofish-backend/api`

### 3. Import the database
- Open XAMPP → Start **Apache** and **MySQL**
- Go to `http://localhost/phpmyadmin`
- Create a new database named `biofish_db`
- Click **Import** → select `biofish_db.sql` from the project root
- Click **Go**

### 4. Verify config
Open `backend/config.php` and confirm:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');        // default XAMPP has no password
define('DB_NAME', 'biofish_db');
define('ESP32_IP', '192.168.x.x');  // change when ESP32 is connected
define('ESP32_PORT', '80');
```

---

## 📱 Setup: Mobile App (Expo Go)

### 1. Install requirements
- Install [Node.js](https://nodejs.org) (v18 or higher)
- Install Expo Go on your Android/iOS phone from the app store
- Install Expo CLI:
```bash
npm install -g expo-cli
```

### 2. Install dependencies
```bash
cd mobile
npm install
```

### 3. Set your API URL
Open `mobile/constants/api.js`:
```js
export const API_URL = 'http://192.168.x.x/biofish-backend/api';
```
Replace `192.168.x.x` with **your computer's IPv4 address** (see below how to find it).

### 4. Run the app
```bash
cd mobile
npx expo start
```
Scan the QR code with Expo Go on your phone.

---

## 🌐 Finding Your IPv4 Address

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

## 🤝 Testing Together (Different Wi-Fi / Locations)

### Same Wi-Fi (easiest)
Both phones + the computer must be on **the same Wi-Fi network**.
- Whoever runs XAMPP → their IPv4 is the API URL
- The other person just updates `api.js` with that IP

### Different Wi-Fi / Different Homes
You have two options:

**Option A — Ngrok (recommended for testing remotely)**
1. Download [ngrok](https://ngrok.com) and create a free account
2. Start XAMPP, then run:
```bash
ngrok http 80
```
3. Ngrok gives you a public URL like `https://abc123.ngrok.io`
4. Update `api.js`:
```js
export const API_URL = 'https://abc123.ngrok.io/biofish-backend/api';
```
5. Share that URL with your teammate — works from anywhere

**Option B — Hotspot**
One person turns on mobile hotspot, both connect to it, then use the hotspot host's IPv4 as the API URL.

> ⚠️ Remember: every time you change Wi-Fi or restart ngrok, the IP/URL changes. Update `api.js` each time.

---

## 🔄 Git Collaboration (Keeping in Sync)

### First time setup (your teammate)
```bash
git clone https://github.com/YOUR_USERNAME/biofish-app.git
cd biofish-app
cd mobile && npm install
```

### Daily workflow
**Before you start working — always pull first:**
```bash
git pull
```

**After making changes — push your work:**
```bash
git add .
git commit -m "describe what you changed"
git push
```

### If there's a conflict
When two people edit the same file, Git will show a conflict. Open the file in VS Code — it will highlight both versions. Pick which one to keep, save, then:
```bash
git add .
git commit -m "resolve conflict"
git push
```

### Seeing what changed
```bash
git log --oneline       # see commit history
git diff                # see exact line changes
git status              # see which files changed
```

### Undo everything back to last push
```bash
git reset --hard origin/main
```
> ⚠️ This deletes all local uncommitted changes permanently.

---

## 🔑 Important Files to Know

| File | What it does |
|---|---|
| `mobile/constants/api.js` | **Change this every time your IP changes** |
| `backend/config.php` | DB credentials + ESP32 IP address |
| `backend/api/demo_control.php` | Handles demo mode DB updates (stage, complete, stop, rollback) |
| `backend/api/start_batch.php` | Creates batch in DB, deducts inventory |
| `backend/api/control.php` | Sends command to ESP32 (only works when ESP32 is connected) |
| `mobile/components/useDemoMachine.js` | All demo mode timer + stage logic |
| `mobile/screens/DashboardScreen.js` | Main screen — machine commands, demo toggle, modals |
| `mobile/tabs/GameTab.js` | Scale Catcher mini game |

---

## 🧪 Demo Mode vs Real Mode

| | Demo Mode ON | Demo Mode OFF |
|---|---|---|
| Start batch | Opens form → saves to DB → runs 5-sec stages automatically | Opens checklist → form → tries ESP32 → shows error if not connected |
| Batch in DB | ✅ Created and auto-completed | ✅ Created, but stays running until ESP32 responds |
| ESP32 needed | ❌ No | ✅ Yes |
| Inventory deducted | ✅ Yes (rolled back if stopped early) | ✅ Yes (rolled back if ESP32 fails) |

### Demo mode stage duration
To change how long each stage lasts in demo mode, edit `mobile/components/useDemoMachine.js`:
```js
export const STAGES = [
  { key: 'extraction',     label: 'Extraction',     duration: 5 },  // seconds
  { key: 'filtration',     label: 'Filtration',     duration: 5 },
  { key: 'formulation',    label: 'Formulation',    duration: 5 },
  { key: 'film_formation', label: 'Film Formation', duration: 5 },
];
```

---

## 🔌 ESP32 Setup (When Ready)

1. Flash your ESP32 with the machine firmware
2. Connect ESP32 to the same Wi-Fi as your computer
3. Find the ESP32's IP address (shown on Serial Monitor)
4. Update `backend/config.php`:
```php
define('ESP32_IP', '192.168.x.x');  // ESP32's IP
```
5. Turn **Demo Mode OFF** in the app
6. Start batch → checklist → form → machine starts for real

---

## 🗄️ Database: Stuck Running Batch Fix

If a batch gets stuck as `running` (e.g., after a crash), run this in phpMyAdmin SQL tab:
```sql
UPDATE batches SET status = 'stopped', end_time = NOW() WHERE status IN ('running', 'paused');
```

---

## 🚀 Login Credentials

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `password123` |
| Operator | `operator1` | `password123` |

---

## 📦 Tech Stack

- **Mobile:** React Native + Expo Go
- **Backend:** PHP 8+ on XAMPP (Apache + MySQL)
- **Database:** MySQL (`biofish_db`)
- **Hardware:** ESP32 microcontroller (DS18B20 temp sensors)
- **Version Control:** Git + GitHub

---

## ⚠️ Common Mistakes / Reminders

- **App shows "Connection failed"** → Check `api.js` IP matches your current IPv4
- **"Machine busy" on start** → Run the stuck batch SQL fix above
- **Inventory not restoring** → Make sure `batch_materials` table exists (check `biofish_db.sql`)
- **Demo mode off, start works** → You're on a network where port 80 is open but ESP32 isn't there — normal
- **Changes not showing on teammate's phone** → They need to `git pull` and restart Expo
- **Never commit `node_modules/`** → It's in `.gitignore`, don't force-add it
- **Different IP every session** → Wi-Fi routers assign new IPs sometimes; always check `ipconfig` before testing