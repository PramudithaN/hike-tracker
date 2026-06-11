// app/(tabs)/_layout.tsx
import { type ComponentProps } from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type MCIName = ComponentProps<typeof MaterialCommunityIcons>['name'];
type TabIconProps = { focused: boolean; color: string; size: number };

// Icon renderers defined at module level — avoids nested-component lint warning.
function makeIcon(icon: MCIName, activeIcon: MCIName) {
  return function TabIcon({ focused, color, size }: TabIconProps) {
    return <MaterialCommunityIcons name={focused ? activeIcon : icon} size={size} color={color} />;
  };
}

const HomeIcon        = makeIcon('home-outline',          'home');
const HikeIcon        = makeIcon('hiking',                'hiking');
const LeaderboardIcon = makeIcon('trophy-outline',        'trophy');
const AchieveIcon     = makeIcon('medal-outline',         'medal');
const ProfileIcon     = makeIcon('account-circle-outline','account-circle');

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f1f0f',
          borderTopColor: '#2d5a27',
          height: 64,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#7ec87e',
        tabBarInactiveTintColor: '#5a7a5a',
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index"        options={{ title: 'Home',    tabBarIcon: HomeIcon }} />
      <Tabs.Screen name="hike"         options={{ title: 'Hike',    tabBarIcon: HikeIcon }} />
      <Tabs.Screen name="leaderboard"  options={{ title: 'Leaders', tabBarIcon: LeaderboardIcon }} />
      <Tabs.Screen name="achievements" options={{ title: 'Badges',  tabBarIcon: AchieveIcon }} />
      <Tabs.Screen name="profile"      options={{ title: 'Profile', tabBarIcon: ProfileIcon }} />
    </Tabs>
  );
}
