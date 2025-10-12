import { ThemedText } from '@/components/themed-text';
import { router, Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';

export default function HomeLayout() {

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: '我的语记',
          headerRight: () => (
            <TouchableOpacity
              style={{
                backgroundColor: '#007AFF',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
                marginRight: 16,
              }}
              onPress={() => router.push('/home/createTranscript')}
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
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      <Stack.Screen
        name="transcript"
        options={{
          title: '草稿',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="note"
        options={{
          title: '笔记',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="answer"
        options={{
          title: '回答以扩充笔记',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="createTranscript"
        options={{
          title: 'New Transcript',
          headerBackTitle: 'Back'
        }}
      />
    </Stack>
  );
}
