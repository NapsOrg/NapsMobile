/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    useWindowDimensions,
    ActivityIndicator,
} from "react-native";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";

import renderMediaGrid from "./MediaRender";
import PostsList from "./PostRender";
import PostsListSkeleton from "./PostsListSkeletonLoader";
import MediaGridSkeleton from "./MediaGridSkeleton";
import PostService from "../../../services/PostService";

import globalStyles from "../../../styles";

const EmptyMediaState = ({ onCreatePress, isMyProfile, username }) => (
    <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>📷</Text>
        </View>
        <Text style={styles.emptyTitle}>No media yet</Text>
        {!isMyProfile && (
            <Text style={styles.emptySubtitle}>
                @{username || 'This user'} hasn't shared any media yet.
            </Text>
        )}
        {isMyProfile && (
            <>
                <Text style={styles.emptySubtitle}>
                    Share your first moment with the community
                </Text>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={onCreatePress}
                    activeOpacity={0.8}
                >
                    <Text style={styles.createButtonText}>+ Create Post</Text>
                </TouchableOpacity>
            </>
        )}
    </View>
);

const EmptyPostsState = ({ onCreatePress, isMyProfile, username }) => (
    <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>📝</Text>
        </View>
        <Text style={styles.emptyTitle}>No posts yet</Text>
        {!isMyProfile && (
            <Text style={styles.emptySubtitle}>
                @{username || 'This user'} hasn't posted anything yet.
            </Text>
        )}
        {isMyProfile && (
            <>
                <Text style={styles.emptySubtitle}>
                    Share your thoughts with your followers
                </Text>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={onCreatePress}
                    activeOpacity={0.8}
                >
                    <Text style={styles.createButtonText}>+ Create Post</Text>
                </TouchableOpacity>
            </>
        )}
    </View>
);

const UserMediaView = ({
                           userId,
                           onCreateMedia,
                           isMyProfile = false,
                           userName
                       }) => {
    const navigation = useNavigation();
    const { width } = useWindowDimensions();
    const postService = useMemo(() => new PostService(), []);
    const cacheRef = useRef({
        media: null,
        posts: null,
        lastFetch: {
            media: null,
            posts: null
        }
    });

    const [activeTab, setActiveTab] = useState("media");
    const [mediaItems, setMediaItems] = useState(null);
    const [postItems, setPostItems] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const CACHE_DURATION = 60000;

    const isCacheValid = useCallback((type) => {
        const lastFetch = cacheRef.current.lastFetch[type];
        if (!lastFetch) return false;
        return Date.now() - lastFetch < CACHE_DURATION;
    }, []);

    const loadUserMedia = useCallback(async (forceRefresh = false) => {
        if (!forceRefresh && isCacheValid('media') && cacheRef.current.media) {
            setMediaItems(cacheRef.current.media);
            setLoading(false);
            return;
        }

        try {
            if (!refreshing) setLoading(true);
            setError(null);

            const response = await postService.getUserMedia(userId);
            const userMedia = response?.data || response || [];

            setMediaItems(userMedia);
            cacheRef.current.media = userMedia;
            cacheRef.current.lastFetch.media = Date.now();
        } catch (err) {
            console.error("Error loading user media:", err);
            setError(err.message || "Failed to load media");
            setMediaItems([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [userId, postService, isCacheValid, refreshing]);

    const loadUserPosts = useCallback(async (forceRefresh = false) => {
        if (!forceRefresh && isCacheValid('posts') && cacheRef.current.posts) {
            setPostItems(cacheRef.current.posts);
            setLoading(false);
            return;
        }

        try {
            if (!refreshing) setLoading(true);
            setError(null);

            const response = await postService.getUserPosts(userId);
            const userPosts = response?.data || response || [];

            setPostItems(userPosts);
            cacheRef.current.posts = userPosts;
            cacheRef.current.lastFetch.posts = Date.now();
        } catch (err) {
            console.error("Error loading user posts:", err);
            setError(err.message || "Failed to load posts");
            setPostItems([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [userId, postService, isCacheValid, refreshing]);

    const loadContent = useCallback(async (isRefresh = false) => {
        if (activeTab === "media") {
            await loadUserMedia(isRefresh);
        } else if (activeTab === "posts") {
            await loadUserPosts(isRefresh);
        }
    }, [activeTab, loadUserMedia, loadUserPosts]);

    useEffect(() => {
        if (userId) {
            loadContent(false);
        }
    }, [activeTab, userId, loadContent]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await loadContent(true);
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
            console.error('Error refreshing content:', error);
        } finally {
            setRefreshing(false);
        }
    }, [loadContent]);

    const handleCreatePress = useCallback(() => {
        if (onCreateMedia) {
            onCreateMedia();
        } else {
            navigation.navigate("CreatePost");
        }
    }, [onCreateMedia, navigation]);

    const handleTabChange = useCallback((tab) => {
        if (tab !== activeTab) {
            setActiveTab(tab);
            setError(null);
        }
    }, [activeTab]);

    const renderMediaContent = useCallback(() => {
        if (loading && !refreshing) {
            return <MediaGridSkeleton screenWidth={width} count={9} />;
        }

        if (error && !refreshing) {
            return (
                <View style={styles.errorState}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => loadUserMedia(true)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (mediaItems === null) {
            return <MediaGridSkeleton screenWidth={width} count={9} />;
        }

        if (mediaItems.length === 0) {
            return (
                <EmptyMediaState
                    onCreatePress={handleCreatePress}
                    isMyProfile={isMyProfile}
                    username={userName}
                />
            );
        }

        return renderMediaGrid(width, mediaItems);
    }, [loading, refreshing, error, mediaItems, width, handleCreatePress, isMyProfile, userName, loadUserMedia]);

    const renderPostsContentWrapper = useCallback(() => {
        if (loading && !refreshing) {
            return <PostsListSkeleton count={3} />;
        }

        if (error && !refreshing) {
            return (
                <View style={styles.errorState}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => loadUserPosts(true)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (postItems === null) {
            return <PostsListSkeleton count={3} />;
        }

        if (postItems.length === 0) {
            return (
                <EmptyPostsState
                    onCreatePress={handleCreatePress}
                    isMyProfile={isMyProfile}
                    username={userName}
                />
            );
        }

        return <PostsList posts={postItems} />;
    }, [loading, refreshing, error, postItems, handleCreatePress, isMyProfile, userName, loadUserPosts]);

    return (
        <View style={styles.container}>
            <View style={styles.tabSwitcher}>
                {["media", "posts"].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={styles.tabElement}
                        onPress={() => handleTabChange(tab)}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === tab && styles.activeTabText,
                            ]}
                        >
                            {tab === "media" ? "Media" : "Posts"}
                        </Text>
                        {activeTab === tab && <View style={styles.tabIndicator} />}
                    </TouchableOpacity>
                ))}
            </View>

            {refreshing && (
                <View style={styles.refreshIndicator}>
                    <ActivityIndicator size="small" color={globalStyles.main.accent} />
                </View>
            )}

            <View style={styles.showContent}>
                {activeTab === "media" ? renderMediaContent() : renderPostsContentWrapper()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 35,
        width: "100%",
    },

    tabSwitcher: {
        flexDirection: "row",
        borderRadius: 12,
        padding: 4,
        width: "100%",
        marginBottom: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
    },

    tabElement: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        position: "relative",
    },

    tabText: {
        fontSize: 16,
        fontWeight: "600",
        color: globalStyles.dark.textSecondary,
        letterSpacing: 0.5,
    },

    activeTabText: {
        color: globalStyles.dark.textPrimary,
    },

    tabIndicator: {
        position: "absolute",
        bottom: -2,
        width: "60%",
        height: 3,
        backgroundColor: globalStyles.main.accent,
        borderRadius: 2,
    },

    refreshIndicator: {
        paddingVertical: 10,
        alignItems: 'center',
        width: '100%',
    },

    showContent: {
        flex: 1,
        width: "100%",
        minHeight: 200,
    },

    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        paddingHorizontal: 40,
        minHeight: 300,
    },

    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(155, 117, 255, 0.1)',
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
        borderWidth: 2,
        borderColor: 'rgba(155, 117, 255, 0.2)',
    },

    emptyIcon: {
        fontSize: 48,
    },

    emptyTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: globalStyles.dark.textPrimary,
        marginBottom: 12,
        textAlign: "center",
    },

    emptySubtitle: {
        fontSize: 16,
        color: globalStyles.dark.textSecondary,
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 32,
        maxWidth: 280,
    },

    createButton: {
        backgroundColor: globalStyles.main.accent,
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 28,
        elevation: 4,
        shadowColor: globalStyles.main.accent,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },

    createButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 0.5,
    },

    errorState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        paddingHorizontal: 40,
        minHeight: 300,
    },

    errorIcon: {
        fontSize: 48,
        marginBottom: 16,
    },

    errorText: {
        fontSize: 16,
        color: globalStyles.dark.textSecondary,
        marginBottom: 24,
        textAlign: "center",
        lineHeight: 24,
    },

    retryButton: {
        backgroundColor: globalStyles.main.accent,
        paddingHorizontal: 28,
        paddingVertical: 12,
        borderRadius: 24,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },

    retryButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
        letterSpacing: 0.5,
    },
});

export default UserMediaView;