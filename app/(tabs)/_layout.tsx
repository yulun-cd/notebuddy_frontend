import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          headerTitle: '我的笔记',
          headerRight: () => (
            <TouchableOpacity
              style={{
                backgroundColor: '#007AFF',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
                marginRight: 16,
              }}
              onPress={() => router.push('/create-transcript')}
            >
              <ThemedText
                type="defaultSemiBold"
                style={{
                  color: 'white',
                  fontSize: 14,
                }}
              >
                添加
              </ThemedText>
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: '探索',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          headerTitle: '探索',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '个人资料',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          headerTitle: '个人资料',
        }}
      />
    </Tabs>
  );
}
