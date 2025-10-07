import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { useTranscripts } from '@/contexts/TranscriptsContext';
import { Transcript } from '@/types';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

export default function TranscriptsScreen() {
  const router = useRouter();
  const { transcripts, isLoading, error, refreshTranscripts, deleteTranscript } = useTranscripts();
  const { isAuthenticated } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

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
          onPress: () => deleteTranscript(transcript.id),
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const renderTranscriptItem = ({ item }: { item: Transcript }) => (
    <View style={styles.transcriptItem}>
      <TouchableOpacity
        style={styles.transcriptContent}
        onPress={() => router.push(`/transcript/${item.id}`)}
        onLongPress={() => handleDeleteTranscript(item)}
      >
        <ThemedText type="defaultSemiBold" style={styles.transcriptTitle}>
          {item.title}
        </ThemedText>
        <ThemedText type="default" style={styles.transcriptDate}>
          Created {formatDate(item.created_at)}
        </ThemedText>
        <ThemedText
          type="default"
          style={styles.transcriptPreview}
          numberOfLines={2}
        >
          {item.content}
        </ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteTranscript(item)}
      >
        <ThemedText type="defaultSemiBold" style={styles.deleteButtonText}>
          Delete
        </ThemedText>
      </TouchableOpacity>
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
          onPress={() => router.push('/login' as any)}
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
        <FlatList
          data={transcripts}
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
});
