import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { useTranscripts } from '@/contexts/TranscriptsContext';
import { Transcript } from '@/types';
import { AntDesign } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

export default function HomeListScreen() {
  const router = useRouter();
  const { transcripts, isLoading, error, refreshTranscripts, deleteTranscript } = useTranscripts();
  const { isAuthenticated } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);

  // Debounced refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const now = Date.now();
      const timeSinceLastRefresh = now - lastRefreshTime;

      // Only refresh if it's been more than 2 seconds since last refresh
      if (timeSinceLastRefresh > 2000) {
        if (isAuthenticated) {
          refreshTranscripts(false); // Don't use cache to get fresh data
        }
        setLastRefreshTime(now);
      }
    }, [isAuthenticated, lastRefreshTime, refreshTranscripts])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshTranscripts(false); // Don't use cache on refresh
    setRefreshing(false);
  };

  const handleDeleteTranscript = (transcript: Transcript) => {
    Alert.alert(
      '删除笔记',
      `确定要删除"${transcript.title}"吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            await deleteTranscript(transcript.id);
            // Trigger refresh after deletion to update the list
            refreshTranscripts(false);
          },
        },
      ]
    );
  };

  const getMostRecentTimestamp = (transcript: Transcript) => {
    const timestamps = [
      transcript.created_at,
      transcript.updated_at,
      ...(transcript.note ? [transcript.note.created_at, transcript.note.updated_at] : [])
    ];
    return new Date(Math.max(...timestamps.map(ts => new Date(ts).getTime())));
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      // Show time for today's items
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } else {
      // Show date for older items
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
  };

  // Group transcripts by time period
  const groupedTranscripts = useMemo(() => {
    if (!transcripts.length) return [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getFullYear(), today.getMonth(), 1);

    // Sort by most recent first
    const sorted = [...transcripts].sort((a, b) =>
      new Date(getMostRecentTimestamp(b)).getTime() -
      new Date(getMostRecentTimestamp(a)).getTime()
    );

    const groups = {
      today: [] as Transcript[],
      thisWeek: [] as Transcript[],
      thisMonth: [] as Transcript[],
      older: [] as Transcript[]
    };

    sorted.forEach(transcript => {
      const timestamp = getMostRecentTimestamp(transcript);
      const date = new Date(timestamp);

      if (date >= today) {
        groups.today.push(transcript);
      } else if (date >= weekAgo) {
        groups.thisWeek.push(transcript);
      } else if (date >= monthAgo) {
        groups.thisMonth.push(transcript);
      } else {
        groups.older.push(transcript);
      }
    });

    // Convert to SectionList format, filtering empty sections
    const sections = [];
    if (groups.today.length > 0) {
      sections.push({ title: '今天', data: groups.today });
    }
    if (groups.thisWeek.length > 0) {
      sections.push({ title: '本周', data: groups.thisWeek });
    }
    if (groups.thisMonth.length > 0) {
      sections.push({ title: '本月', data: groups.thisMonth });
    }
    if (groups.older.length > 0) {
      sections.push({ title: '更早', data: groups.older });
    }

    return sections;
  }, [transcripts]);

  const renderTranscriptItem = ({ item }: { item: Transcript }) => {
    const displayTitle = item.note?.title || item.title;
    const hasNote = Boolean(item.note);
    const mostRecentTimestamp = getMostRecentTimestamp(item);

    const handleItemPress = () => {
      if (hasNote && item.note) {
        // Navigate to note screen if transcript has a note
        router.push(`/home/note?id=${item.note.id}`);
      } else {
        // Navigate to transcript screen if no note exists
        router.push(`/home/transcript?id=${item.id}`);
      }
    };

    return (
      <View style={styles.transcriptItem}>
        <TouchableOpacity
          style={styles.transcriptContent}
          onPress={handleItemPress}
          onLongPress={() => handleDeleteTranscript(item)}
        >
          <ThemedText type="defaultSemiBold" style={styles.transcriptTitle}>
            {displayTitle}
          </ThemedText>
          <ThemedText type="default" style={styles.transcriptDate}>
            上次编辑 {formatDateTime(mostRecentTimestamp.toISOString())}
            {!hasNote && "\t - 草稿"}
          </ThemedText>
          <ThemedText
            type="default"
            style={styles.transcriptPreview}
            numberOfLines={1}
          >
            {item?.note ? item.note.content : item.content}
          </ThemedText>
        </TouchableOpacity>
        <View style={styles.rightColumn}>
          <TouchableOpacity
            style={styles.deleteIconButton}
            onPress={() => handleDeleteTranscript(item)}
          >
            <AntDesign name="delete" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        {section.title}
      </ThemedText>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <ThemedText type="title" style={styles.emptyStateTitle}>
        {isAuthenticated ? '暂无笔记' : '欢迎使用 NoteBuddy'}
      </ThemedText>
      <ThemedText type="default" style={styles.emptyStateText}>
        {isAuthenticated
          ? "创建您的第一个笔记开始使用吧！"
          : "请登录以查看和管理您的笔记"
        }
      </ThemedText>
      {!isAuthenticated && (
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/login')}
        >
          <ThemedText type="defaultSemiBold" style={styles.loginButtonText}>
            登录
          </ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );

  if (error && !transcripts.length) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText type="title" style={styles.errorTitle}>
            出错了
          </ThemedText>
          <ThemedText type="default" style={styles.errorText}>
            {error}
          </ThemedText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refreshTranscripts()}
          >
            <ThemedText type="defaultSemiBold" style={styles.retryButtonText}>
              重试
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <ThemedText type="default" style={styles.loadingText}>
            正在加载笔记...
          </ThemedText>
        </View>
      ) : (
        <SectionList
          sections={groupedTranscripts}
          renderSectionHeader={renderSectionHeader}
          renderItem={renderTranscriptItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#007AFF"
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={true}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
  },
  listContent: {
    paddingBottom: 16,
    flexGrow: 1,
  },
  sectionHeader: {
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.8,
  },
  transcriptItem: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  transcriptContent: {
    flex: 1,
    marginRight: 12,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
  },
  transcriptTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  transcriptDate: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  transcriptPreview: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    opacity: 0.7,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 32,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  loginButtonText: {
    color: 'white',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  noteStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  hasNote: {
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    borderColor: 'rgba(52, 199, 89, 0.5)',
    borderWidth: 1,
  },
  noNote: {
    backgroundColor: 'rgba(142, 142, 147, 0.2)',
    borderColor: 'rgba(142, 142, 147, 0.5)',
    borderWidth: 1,
  },
  noteStatusText: {
    fontSize: 12,
    opacity: 0.8,
  },
  rightColumn: {
    alignItems: 'flex-end',
    gap: 8,
  },
  deleteIconButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
  },
  noNoteCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(142, 142, 147, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noNoteCircleText: {
    fontSize: 8,
    color: 'white',
    lineHeight: 16,
  },
});
