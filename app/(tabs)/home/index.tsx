import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/contexts/AuthContext";
import { useTranscripts } from "@/contexts/TranscriptsContext";
import { Transcript } from "@/types";
import { AntDesign } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SectionList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Menu, MenuItem } from "react-native-material-menu";

export default function HomeListScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    transcripts,
    isLoading,
    error,
    refreshTranscripts,
    deleteTranscript,
  } = useTranscripts();
  const { isAuthenticated } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const lastRefreshTimeRef = useRef(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [orderMenuVisible, setOrderMenuVisible] = useState(false);
  const [noteStatusFilter, setNoteStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderBy, setOrderBy] = useState<"desc" | "asc">("desc");

  const hideMenu = () => setMenuVisible(false);
  const showMenu = () => setMenuVisible(true);
  const hideOrderMenu = () => setOrderMenuVisible(false);
  const showOrderMenu = () => setOrderMenuVisible(true);

  // Debounced refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const now = Date.now();
      const timeSinceLastRefresh = now - lastRefreshTimeRef.current;

      // Only refresh if it's been more than 2 seconds since last refresh
      if (timeSinceLastRefresh > 2000) {
        if (isAuthenticated) {
          refreshTranscripts(false); // Don't use cache to get fresh data
        }
        lastRefreshTimeRef.current = now;
      }
    }, [isAuthenticated, refreshTranscripts])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshTranscripts(false); // Don't use cache on refresh
    setRefreshing(false);
  };

  const handleDeleteTranscript = (transcript: Transcript) => {
    Alert.alert(
      t("alert.confirmDelete"),
      `${t("alert.deleteMessage")} "${transcript.title}"?`,
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
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
      ...(transcript.note
        ? [transcript.note.created_at, transcript.note.updated_at]
        : []),
    ];
    return new Date(
      Math.max(...timestamps.map((ts) => new Date(ts).getTime()))
    );
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      // Show time for today's items
      return date.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } else {
      // Show date for older items
      return date.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    }
  };

  // Filter transcripts based on current filters
  const filteredTranscripts = useMemo(() => {
    return transcripts.filter((transcript) => {
      // Apply note status filter
      if (noteStatusFilter === "hasNote" && !transcript.note) {
        return false;
      }
      if (noteStatusFilter === "noNote" && transcript.note) {
        return false;
      }

      // Apply search query filter
      if (searchQuery.trim()) {
        const displayTitle = transcript.note?.title || transcript.title;
        const normalizedTitle = displayTitle.toLowerCase();
        const normalizedQuery = searchQuery.toLowerCase().trim();

        if (!normalizedTitle.includes(normalizedQuery)) {
          return false;
        }
      }

      return true;
    });
  }, [transcripts, noteStatusFilter, searchQuery]);

  // Group transcripts by time period
  const groupedTranscripts = useMemo(() => {
    if (!filteredTranscripts.length) return [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getFullYear(), today.getMonth(), 1);

    // Sort by most recent timestamp, respecting order preference
    const sorted = [...filteredTranscripts].sort((a, b) => {
      const aTime = new Date(getMostRecentTimestamp(a)).getTime();
      const bTime = new Date(getMostRecentTimestamp(b)).getTime();

      if (orderBy === "desc") {
        return bTime - aTime; // Newest first
      } else {
        return aTime - bTime; // Oldest first
      }
    });

    const groups = {
      today: [] as Transcript[],
      thisWeek: [] as Transcript[],
      thisMonth: [] as Transcript[],
      older: [] as Transcript[],
    };

    sorted.forEach((transcript) => {
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
      sections.push({ title: t("home.sections.today"), data: groups.today });
    }
    if (groups.thisWeek.length > 0) {
      sections.push({
        title: t("home.sections.thisWeek"),
        data: groups.thisWeek,
      });
    }
    if (groups.thisMonth.length > 0) {
      sections.push({
        title: t("home.sections.thisMonth"),
        data: groups.thisMonth,
      });
    }
    if (groups.older.length > 0) {
      sections.push({ title: t("home.sections.older"), data: groups.older });
    }

    // Reverse sections for ascending order (oldest first)
    if (orderBy === "asc") {
      return sections.reverse();
    }

    return sections;
  }, [filteredTranscripts, orderBy, t]);

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
            {t("home.lastEdited")}{" "}
            {formatDateTime(mostRecentTimestamp.toISOString())}
            {!hasNote && `\t - ${t("home.draft")}`}
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
        {isAuthenticated ? t("home.noTranscripts") : t("home.welcome")}
      </ThemedText>
      <ThemedText type="default" style={styles.emptyStateText}>
        {isAuthenticated ? t("home.createFirst") : t("error.unauthorized")}
      </ThemedText>
      {!isAuthenticated && (
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push("/login")}
        >
          <ThemedText type="defaultSemiBold" style={styles.loginButtonText}>
            {t("auth.login")}
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
            {t("common.error")}
          </ThemedText>
          <ThemedText type="default" style={styles.errorText}>
            {error}
          </ThemedText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refreshTranscripts()}
          >
            <ThemedText type="defaultSemiBold" style={styles.retryButtonText}>
              {t("common.retry")}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  // Function bar component
  const FunctionBar = () => (
    <View style={styles.functionBar}>
      <View style={styles.functionBarContent}>
        <Menu
          visible={orderMenuVisible}
          anchor={
            <TouchableOpacity
              style={styles.orderButton}
              onPress={showOrderMenu}
            >
              <AntDesign
                name={orderBy === "desc" ? "down" : "up"}
                size={16}
                color="#007AFF"
              />
            </TouchableOpacity>
          }
          onRequestClose={hideOrderMenu}
          style={styles.menuStyle}
        >
          <MenuItem
            onPress={() => {
              setOrderBy("desc");
              hideOrderMenu();
            }}
          >
            <View style={styles.menuItemContent}>
              <ThemedText type="default">{t("home.order.desc")}</ThemedText>
              {orderBy === "desc" && (
                <AntDesign
                  name="check"
                  size={16}
                  color="#007AFF"
                  style={styles.checkIcon}
                />
              )}
            </View>
          </MenuItem>
          <MenuItem
            onPress={() => {
              setOrderBy("asc");
              hideOrderMenu();
            }}
          >
            <View style={styles.menuItemContent}>
              <ThemedText type="default">{t("home.order.asc")}</ThemedText>
              {orderBy === "asc" && (
                <AntDesign
                  name="check"
                  size={16}
                  color="#007AFF"
                  style={styles.checkIcon}
                />
              )}
            </View>
          </MenuItem>
        </Menu>
        <Menu
          visible={menuVisible}
          anchor={
            <TouchableOpacity style={styles.filterButton} onPress={showMenu}>
              <AntDesign name="filter" size={16} color="#007AFF" />
            </TouchableOpacity>
          }
          onRequestClose={hideMenu}
          style={styles.menuStyle}
        >
          <MenuItem
            onPress={() => {
              setNoteStatusFilter("all");
              hideMenu();
            }}
          >
            <View style={styles.menuItemContent}>
              <ThemedText type="default">{t("home.filter.all")}</ThemedText>
              {noteStatusFilter === "all" && (
                <AntDesign
                  name="check"
                  size={16}
                  color="#007AFF"
                  style={styles.checkIcon}
                />
              )}
            </View>
          </MenuItem>
          <MenuItem
            onPress={() => {
              setNoteStatusFilter("hasNote");
              hideMenu();
            }}
          >
            <View style={styles.menuItemContent}>
              <ThemedText type="default">{t("home.filter.hasNote")}</ThemedText>
              {noteStatusFilter === "hasNote" && (
                <AntDesign
                  name="check"
                  size={16}
                  color="#007AFF"
                  style={styles.checkIcon}
                />
              )}
            </View>
          </MenuItem>
          <MenuItem
            onPress={() => {
              setNoteStatusFilter("noNote");
              hideMenu();
            }}
          >
            <View style={styles.menuItemContent}>
              <ThemedText type="default">{t("home.filter.noNote")}</ThemedText>
              {noteStatusFilter === "noNote" && (
                <AntDesign
                  name="check"
                  size={16}
                  color="#007AFF"
                  style={styles.checkIcon}
                />
              )}
            </View>
          </MenuItem>
        </Menu>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <ThemedText type="default" style={styles.loadingText}>
            {t("common.loading")}
          </ThemedText>
        </View>
      ) : (
        <>
          <View style={styles.headerRow}>
            <TextInput
              placeholder={t("home.search")}
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
            <FunctionBar />
          </View>
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
        </>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
  },
  listContent: {
    paddingBottom: 16,
    flexGrow: 1,
  },
  sectionHeader: {
    backgroundColor: "rgba(0, 122, 255, 0.05)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#007AFF",
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    opacity: 0.8,
  },
  transcriptItem: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 122, 255, 0.2)",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  transcriptContent: {
    flex: 1,
    marginRight: 12,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  deleteButtonText: {
    color: "white",
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
    opacity: 0.8,
  },
  rightColumn: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: "100%",
  },
  deleteIconButton: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  emptyStateTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.7,
  },
  loginButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: "white",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  errorText: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.7,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
  },
  functionBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  functionBarContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orderButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
  },
  filterButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
  },
  menuStyle: {
    marginTop: 40,
    borderRadius: 8,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 8,
  },
  checkIcon: {
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
});
