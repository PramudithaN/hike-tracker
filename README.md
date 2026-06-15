# TrailMark

![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)

> A cross-platform mobile application for tracking hikes, recording waypoints, and competing with friends.

---

## 📖 About This Project

TrailMark is a comprehensive hiking companion app built with React Native and Expo. It allows outdoor enthusiasts to track their journeys with high precision using background GPS tracking. The app integrates with Supabase for real-time data synchronization, featuring a competitive leaderboard and a robust achievements system to keep users motivated on the trail.

---

## ✨ Features

- 📍 **Real-time GPS Tracking** - Record your exact path, altitude, and distance even when the app is in the background.
- 🏔️ **Summit Logging** - Specifically mark when you reach a summit to track your peak performance.
- 🏆 **Achievements System** - Earn badges like "Mountain Goat" (10 hikes) or "Speed Demon" (under 30 min) as you progress.
- 📊 **Global Leaderboard** - See how you rank against other hikers in total distance and hike count.
- 🗺️ **Interactive Map View** - Visualize your current route and historical tracks directly on the map.
- 👤 **Personal Profiles** - Track your lifetime statistics, including total distance and total hikes.
- 🔐 **Secure Auth** - Seamless and secure user authentication powered by Supabase.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Expo v54.0.35](https://expo.dev/) |
| Mobile Library | [React Native v0.81.5](https://reactnative.dev/) |
| Backend/Database | [Supabase](https://supabase.com/) |
| State Management | [Zustand](https://docs.pmnd.rs/zustand/) |
| Navigation | [Expo Router](https://docs.expo.dev/router/introduction/) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Maps | [React Native Maps](https://github.com/react-native-maps/react-native-maps) |

---

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) **v18 or higher**
- [pnpm](https://pnpm.io/) (recommended) or npm
- [Git](https://git-scm.com/)
- [Expo Go](https://expo.dev/expo-go) app on your mobile device

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/PramudithaN/hike-tracker.git
cd hike-tracker
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start the development server

```bash
pnpm start
```

Scan the QR code with your **Expo Go** app to run the project.

---

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm start` | Starts the Expo development server |
| `pnpm android` | Runs the app on a connected Android device or emulator |
| `pnpm ios` | Runs the app on an iOS simulator |
| `pnpm web` | Opens the app in a web browser |

---

## 📁 Project Structure

```
hike-tracker/
├── app/                       # Expo Router screens and layouts
│   ├── (tabs)/                # Main navigation tabs (Home, Hike, Leaderboard, etc.)
│   └── auth/                  # Authentication flow screens
├── assets/                    # Static assets (icons, splash screen)
├── lib/                       # Core business logic and integrations
│   ├── hooks/                 # Custom React hooks (location tracking)
│   ├── supabase/              # Supabase client and database queries
│   └── utils/                 # Utility functions and achievement definitions
├── store/                     # Zustand state management
├── supabase/                  # SQL schema and database migrations
└── types/                     # TypeScript interface definitions
```

---

## 🙋‍♂️ Connect with Me

- **GitHub**: [github.com/PramudithaN](https://github.com/PramudithaN)
- **LinkedIn**: [linkedin.com/in/pramuditha-nadun-612b1b204](https://linkedin.com/in/pramuditha-nadun-612b1b204)
- **Email**: pramudithanadun@gmail.com

---

*Developed with ❤️ by Pramuditha Nadun.*
