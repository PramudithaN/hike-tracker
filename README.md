# TrailMark 🏔️

A cross-platform hiking tracker for Android and iOS built with React Native + Expo.

## Features
- Start / summit / end hike tracking with GPS
- Real-time elapsed timer
- Background GPS route recording (works with screen off)
- Map view with route polyline (OpenStreetMap — free)
- Leaderboard showing all registered hikers ranked by best time
- Achievements / badge system
- Hike history with stats

## Tech stack
| | Tool |
|---|---|
| Framework | React Native + Expo (SDK 51) |
| Navigation | Expo Router (file-based) |
| Maps | react-native-maps + OpenStreetMap tiles |
| GPS | expo-location (background mode) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| State | Zustand |
| Hosting (API) | Supabase Edge (serverless) |
| App builds | EAS Build (Expo) |

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Create a free project at https://supabase.com
2. Go to SQL Editor and run `supabase/schema.sql`
3. Copy `.env.example` to `.env.local` and fill in your project URL and anon key

### 3. Run on device
```bash
# Install Expo Go on your phone, then:
npm start

# Or run on simulator:
npm run android
npm run ios
```

### 4. Build for production
```bash
npm install -g eas-cli
eas login
eas build --platform android   # or ios
```

## Project structure
```
trailmark/
├── app/
│   ├── _layout.tsx          # Root layout, auth listener
│   ├── auth/
│   │   └── login.tsx        # Sign in / sign up screen
│   └── tabs/
│       ├── _layout.tsx      # Tab bar
│       ├── index.tsx        # Home — stats + recent hikes
│       ├── hike.tsx         # Core hike tracker + map
│       ├── leaderboard.tsx  # All hikers ranked
│       ├── achievements.tsx # Badge collection
│       └── profile.tsx      # User profile
├── components/              # Shared UI components
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Supabase client
│   │   └── queries.ts       # All DB queries
│   ├── hooks/
│   │   └── useLocationTracking.ts  # Background GPS hook
│   └── utils/
│       └── achievements.ts  # Badge engine + formatElapsed
├── store/
│   └── index.ts             # Zustand — auth + active hike
├── types/
│   └── index.ts             # All TypeScript types
└── supabase/
    └── schema.sql           # Database schema
```
