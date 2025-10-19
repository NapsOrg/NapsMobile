/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

import FeedButtons from "../../components/feed/FeedButtons";
import FeedPost from "../../components/feed/FeedPost";
import FeedHeader from "../../components/feed/FeedHeader";
import SmartInput from "../../components/input/SmartInput";
import FeedService from "../../services/FeedService";
import PostService from "../../services/PostService";
import LocationService from "../../services/LocationService";

import globalStyles from "../../styles";

const NAVBAR_HEIGHT = 70;

const FeedScreen = () => {
    const navigation = useNavigation();
    const feedService = new FeedService();
    const postService = new PostService();
    const locationService = new LocationService();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const [postText, setPostText] = useState("");
    const [postMedia, setPostMedia] = useState([]);
    const [isInputVisible, setIsInputVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadFeed = async (isRefresh = false) => {
        try {
            if (!isRefresh) {
                setLoading(true);
            }
            setError(null);

            const feedData = await feedService.getFeed();
            setPosts(feedData);
        } catch (err) {
            console.error('Error loading feed:', err);
            setError(err.message || 'Failed to load feed');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadFeed(true);
    }, []);

    useEffect(() => {
        loadFeed();
    }, []);

    const handleCreatePost = async ({ text, media }) => {
        if (!text.trim() && (!media || media.length === 0)) {
            return;
        }

        setIsSubmitting(true);

        try {
            const { latitude, longitude, city } = await locationService.getUserLocationData();

            const fileToUpload = media && media.length > 0 ? media[0] : null;

            await postService.createPost({
                content: text.trim(),
                file: fileToUpload,
                longitude,
                latitude,
                city,
                showOnMap: false
            });

            setPostText("");
            setPostMedia([]);
            setIsInputVisible(false);

            onRefresh();
        } catch (error) {
            console.error("Error creating post:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePenPress = () => {
        setIsInputVisible(!isInputVisible);
    };

    const handlePostPress = (postId) => {
        navigation.navigate("PostDetail", { postId });
    };

    const handleLikePress = async (postId) => {
        let currentLiked = false;

        setPosts(prevPosts =>
            prevPosts.map(post => {
                if (post.postId === postId) {
                    currentLiked = post.isLiked;
                    return {
                        ...post,
                        isLiked: !post.isLiked,
                        likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1
                    };
                }
                return post;
            })
        );

        try {
            if (!currentLiked) {
                await postService.addLike(postId);
            } else {
                await postService.removeLike(postId);
            }
        } catch (err) {
            console.error('Failed to toggle like:', err);

            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post.postId === postId
                        ? {
                            ...post,
                            isLiked: currentLiked,
                            likesCount: currentLiked ? post.likesCount + 1 : post.likesCount - 1
                        }
                        : post
                )
            );
        }
    };

    const handleCommentPress = (postId) => {
        navigation.navigate("PostDetail", { postId, focusComment: true });
    };

    const handleLogoPress = () => {
        if (posts.length > 0) {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }
    };

    const flatListRef = React.useRef(null);

    const renderLoader = () => (
        <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#9B75FF" />
            <Text style={styles.loaderText}>Loading your feed...</Text>
        </View>
    );

    const renderError = () => (
        <View style={styles.errorContainer}>
            <LinearGradient
                colors={['rgba(255, 68, 88, 0.1)', 'rgba(155, 117, 255, 0.05)']}
                style={styles.errorGradient}
            >
                <View style={styles.errorIconContainer}>
                    <Ionicons name="alert-circle" size={60} color="#FF4458" />
                </View>
                <Text style={styles.errorTitle}>Oops!</Text>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => loadFeed()}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#9B75FF', '#A283FF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.retryButtonGradient}
                    >
                        <Ionicons name="refresh" size={20} color="#fff" />
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <LinearGradient
                colors={['rgba(155, 117, 255, 0.08)', 'rgba(255, 68, 88, 0.04)']}
                style={styles.emptyGradient}
            >
                <View style={styles.emptyIconContainer}>
                    <Ionicons name="images-outline" size={80} color="#9B75FF" />
                </View>
                <Text style={styles.emptyTitle}>No posts yet</Text>
                <Text style={styles.emptyText}>
                    Follow some users to see their posts in your feed!
                </Text>
                <TouchableOpacity
                    style={styles.exploreButton}
                    onPress={() => navigation.navigate("UserSearch")}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#9B75FF', '#FF4458']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.exploreButtonGradient}
                    >
                        <Ionicons name="search" size={20} color="#fff" />
                        <Text style={styles.exploreButtonText}>Explore Users</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );

    const ItemSeparator = () => <View style={styles.separator} />;

    const renderPost = ({ item }) => (
        <FeedPost
            post={item}
            onPress={handlePostPress}
            onLikePress={handleLikePress}
            onCommentPress={handleCommentPress}
        />
    );

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={styles.container}>
                <FeedHeader onLogoPress={handleLogoPress} />
                {renderLoader()}
            </SafeAreaView>
        );
    }

    if (error && !refreshing) {
        return (
            <SafeAreaView style={styles.container}>
                <FeedHeader onLogoPress={handleLogoPress} />
                {renderError()}
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <FeedHeader
                onProfilePress={() => navigation.openDrawer()}
                onLogoPress={handleLogoPress} />

            <KeyboardAvoidingView
                style={styles.keyboardAvoidingContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={NAVBAR_HEIGHT}
            >
                <FlatList
                    ref={flatListRef}
                    data={posts}
                    renderItem={renderPost}
                    keyExtractor={(item) => `post-${item.postId}`}
                    contentContainerStyle={[
                        styles.feedList,
                        posts.length === 0 && styles.feedListEmpty,
                        isInputVisible && styles.feedListWithInput
                    ]}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={ItemSeparator}
                    ListEmptyComponent={renderEmpty}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#9B75FF"
                            colors={['#9B75FF', '#FF4458']}
                            progressBackgroundColor="#1a1a1a"
                        />
                    }
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={5}
                    updateCellsBatchingPeriod={50}
                    initialNumToRender={5}
                    windowSize={10}
                    getItemLayout={(data, index) => ({
                        length: 400,
                        offset: 400 * index,
                        index,
                    })}
                />

                <FeedButtons
                    onPenPress={handlePenPress}
                    isKeyboardOpen={isInputVisible}
                />

                <SmartInput
                    placeholder={"Write something..."}
                    value={postText}
                    onChangeText={setPostText}
                    onSubmit={handleCreatePost}
                    submitting={isSubmitting}
                    visible={isInputVisible}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: globalStyles.dark.backgroundColor,
        height: "110%",
    },
    keyboardAvoidingContainer: {
        flex: 1,
    },
    feedList: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 20,
    },
    feedListEmpty: {
        flexGrow: 1,
    },
    feedListWithInput: {
        paddingBottom: 200,
    },
    separator: {
        height: 0,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    loaderGradient: {
        borderRadius: 24,
        padding: 40,
        alignItems: 'center',
        minWidth: 200,
    },
    loaderText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
        textAlign: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    errorGradient: {
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        width: '100%',
        maxWidth: 340,
    },
    errorIconContainer: {
        marginBottom: 16,
    },
    errorTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    errorText: {
        color: '#999',
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    retryButton: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    retryButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        gap: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyGradient: {
        borderRadius: 24,
        padding: 40,
        alignItems: 'center',
        width: '100%',
        maxWidth: 340,
    },
    emptyIconContainer: {
        marginBottom: 20,
        opacity: 0.6,
    },
    emptyTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyText: {
        color: '#999',
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 28,
        lineHeight: 22,
    },
    exploreButton: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    exploreButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        gap: 8,
    },
    exploreButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default FeedScreen;