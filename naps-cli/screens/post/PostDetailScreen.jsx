/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Animated,
    Alert,
    useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import SavingService from "../../services/SavingService";
import PostService from "../../services/PostService";
import CommentService from "../../services/CommentService";
import CommentView from "../../components/comment/CommentView";
import AnimatedCommentInput from "../../components/input/SmartInput";
import DefaultPageHeader from "../../components/header/DefaultPageHeader";

import globalStyles from "../../styles";

const AdaptiveMediaContainer = ({ mediaUrl, containerWidth }) => {
    const [imageHeight, setImageHeight] = useState(300);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (mediaUrl) {
            Image.getSize(
                mediaUrl,
                (width, height) => {
                    const aspectRatio = height / width;
                    let calculatedHeight = (containerWidth - 32) * aspectRatio;
                    calculatedHeight = Math.max(200, Math.min(500, calculatedHeight));
                    setImageHeight(calculatedHeight);
                    setLoading(false);
                },
                (error) => {
                    console.log('Failed to get image size:', error);
                    setImageHeight(300);
                    setLoading(false);
                }
            );
        }
    }, [mediaUrl, containerWidth]);

    return (
        <View style={[styles.mediaContainer, { height: imageHeight }]}>
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="small" color="#8774E1" />
                </View>
            )}
            <Image
                source={{ uri: mediaUrl }}
                style={styles.mediaImage}
                resizeMode="cover"
            />
        </View>
    );
};

const PostDetailScreen = ({ route }) => {
    const { postId } = route.params;
    const { width: screenWidth } = useWindowDimensions();
    const postService = new PostService();
    const commentService = new CommentService();
    const savingService = new SavingService();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [likeAnimating, setLikeAnimating] = useState(false);
    const [saveAnimating, setSaveAnimating] = useState(false);
    const [commentInputVisible, setCommentInputVisible] = useState(false);

    const likeScale = useRef(new Animated.Value(1)).current;
    const saveScale = useRef(new Animated.Value(1)).current;
    const scrollViewRef = useRef(null);

    useEffect(() => {
        loadPostDetails();
    }, [postId]);

    const handleCommentVisible = () => {
        setCommentInputVisible(!commentInputVisible);
    }

    const loadPostDetails = async () => {
        try {
            setLoading(true);
            const [postData, commentsData] = await Promise.all([
                postService.getPostById(postId),
                commentService.getPostComments(postId)
            ]);

            setPost(postData);
            setComments(commentsData);
        } catch (error) {
            console.error("Error loading post details:", error);
            Alert.alert("Error", "Failed to load post details");
        } finally {
            setLoading(false);
        }
    };

    const handleLikeToggle = async () => {
        if (likeAnimating || !post) return;

        setLikeAnimating(true);

        Animated.sequence([
            Animated.timing(likeScale, {
                toValue: 1.3,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(likeScale, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();

        try {
            if (post.isLiked) {
                await postService.removeLike(postId);
                setPost(prev => ({
                    ...prev,
                    isLiked: false,
                    likesCount: Math.max(0, prev.likesCount - 1)
                }));
            } else {
                await postService.addLike(postId);
                setPost(prev => ({
                    ...prev,
                    isLiked: true,
                    likesCount: prev.likesCount + 1
                }));
            }
        } catch (error) {
            console.error("Error toggling like:", error);
            Alert.alert("Error", "Failed to update like");
        } finally {
            setLikeAnimating(false);
        }
    };

    const handleSaveToggle = async () => {
        if (saveAnimating || !post) return;

        setSaveAnimating(true);

        Animated.sequence([
            Animated.timing(saveScale, {
                toValue: 1.3,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(saveScale, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();

        try {
            if (post.isSaved) {
                await savingService.unsavePost(postId);
                setPost(prev => ({ ...prev, isSaved: false }));
            } else {
                await savingService.savePost(postId);
                setPost(prev => ({ ...prev, isSaved: true }));
            }
        } catch (error) {
            console.error("Error toggling save:", error);
            Alert.alert("Error", "Failed to update bookmark");
        } finally {
            setSaveAnimating(false);
        }
    };

    const handleSubmitComment = async () => {
        if (!commentText.trim() || submitting) return;

        try {
            setSubmitting(true);
            const newComment = await commentService.createComment(postId, commentText);

            setComments(prev => [newComment, ...prev]);
            setPost(prev => ({
                ...prev,
                commentsCount: prev.commentsCount + 1
            }));
            setCommentText("");
            setCommentInputVisible(false);

            setTimeout(() => {
                scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            }, 300);
        } catch (error) {
            console.error("Error submitting comment:", error);
            Alert.alert("Error", "Failed to post comment");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCommentLike = async (commentId) => {
        try {
            const commentIndex = comments.findIndex(c => c.commentId === commentId);
            if (commentIndex === -1) return;

            const comment = comments[commentIndex];

            if (comment.isReacted) {
                await commentService.removeCommentLike(commentId);
                const updatedComments = [...comments];
                updatedComments[commentIndex] = {
                    ...comment,
                    isReacted: false,
                    reactionsCount: Math.max(0, comment.reactionsCount - 1)
                };
                setComments(updatedComments);
            } else {
                await commentService.addCommentLike(commentId);
                const updatedComments = [...comments];
                updatedComments[commentIndex] = {
                    ...comment,
                    isReacted: true,
                    reactionsCount: comment.reactionsCount + 1
                };
                setComments(updatedComments);
            }
        } catch (error) {
            console.error("Error toggling comment like:", error);
            Alert.alert("Error", "Failed to update like");
        }
    };

    const handleCommentDelete = async (commentId) => {
        try {
            await commentService.deleteComment(commentId);
            setComments(prev => prev.filter(c => c.commentId !== commentId));
            setPost(prev => ({
                ...prev,
                commentsCount: Math.max(0, prev.commentsCount - 1)
            }));
        } catch (error) {
            console.error("Error deleting comment:", error);
            Alert.alert("Error", "Failed to delete comment");
        }
    };

    const handleCommentUpdate = async (commentId, content) => {
        try {
            await commentService.updateComment(commentId, content);
            const updatedComments = comments.map(c =>
                c.commentId === commentId ? { ...c, content } : c
            );
            setComments(updatedComments);
        } catch (error) {
            console.error("Error updating comment:", error);
            Alert.alert("Error", "Failed to update comment");
        }
    };

    const handleReplySubmit = async (commentId, content) => {
        try {
            await commentService.createReply(commentId, content);

            const updatedComments = comments.map(c =>
                c.commentId === commentId
                    ? { ...c, replyCount: c.replyCount + 1 }
                    : c
            );
            setComments(updatedComments);
        } catch (error) {
            console.error("Error submitting reply:", error);
            throw error;
        }
    };

    const handleLoadReplies = async (commentId) => {
        try {
            const replies = await commentService.getCommentReplies(commentId);
            return replies;
        } catch (error) {
            console.error("Error loading replies:", error);
            throw error;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return "yesterday";
        if (diffDays < 7) return `${diffDays}d ago`;

        const options = { month: 'short', day: 'numeric' };
        if (date.getFullYear() !== now.getFullYear()) {
            options.year = 'numeric';
        }
        return date.toLocaleDateString("en-US", options);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#8774E1" />
                </View>
            </SafeAreaView>
        );
    }

    if (!post) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Post not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
                <DefaultPageHeader title={"Post"} />

                <ScrollView
                    ref={scrollViewRef}
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.postCard}>
                        <View style={styles.postContent}>
                            <View style={styles.postHeader}>
                                <View style={styles.avatarContainer}>
                                    {post.creatorAvatarUrl ? (
                                        <Image
                                            source={{ uri: post.creatorAvatarUrl }}
                                            style={styles.avatarImage}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View style={styles.avatarPlaceholder}>
                                            <Text style={styles.avatarText}>
                                                {post.creatorUsername.charAt(0).toUpperCase()}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.postHeaderText}>
                                    <Text style={styles.username}>{post.creatorUsername}</Text>
                                    <Text style={styles.timestamp}>{formatDate(post.createdAt)}</Text>
                                </View>

                                {post.isMy && (
                                    <View style={styles.myBadge}>
                                        <Ionicons name="checkmark-circle" size={18} color="#8774E1" />
                                    </View>
                                )}
                            </View>

                            {post.content && post.content.trim() !== '' && (
                                <Text style={styles.caption}>{post.content}</Text>
                            )}

                            {post.media && post.media.length > 0 && (
                                <View style={styles.mediaWrapper}>
                                    <AdaptiveMediaContainer
                                        mediaUrl={post.media[0].mediaUrl}
                                        containerWidth={screenWidth}
                                    />
                                    {post.media.length > 1 && (
                                        <View style={styles.mediaCountBadge}>
                                            <Ionicons name="images" size={12} color="#fff" />
                                            <Text style={styles.mediaCountText}>{post.media.length}</Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            <View style={styles.postFooter}>
                                <View style={styles.viewsContainer}>
                                    <Ionicons name="eye-outline" size={16} color="#8E8E93" />
                                    <Text style={styles.viewsText}>
                                        {post.viewsCount || Math.floor(Math.random() * 1000)}
                                    </Text>
                                </View>

                                <View style={styles.actionsContainer}>
                                    <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={handleLikeToggle}
                                            activeOpacity={0.6}
                                            disabled={likeAnimating}
                                        >
                                            <Ionicons
                                                name={post.isLiked ? "heart" : "heart-outline"}
                                                size={20}
                                                color="#FF3B30"
                                            />
                                            {post.likesCount > 0 && (
                                                <Text style={[
                                                    styles.actionText,
                                                    post.isLiked && styles.actionTextActive
                                                ]}>
                                                    {post.likesCount}
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    </Animated.View>

                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={handleCommentVisible}
                                        activeOpacity={0.6}
                                    >
                                        <Ionicons
                                            name="chatbubble-outline"
                                            size={19}
                                            color="#9561FB"
                                        />
                                        {post.commentsCount > 0 && (
                                            <Text style={styles.actionText}>
                                                {post.commentsCount}
                                            </Text>
                                        )}
                                    </TouchableOpacity>

                                    <Animated.View style={{ transform: [{ scale: saveScale }] }}>
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={handleSaveToggle}
                                            activeOpacity={0.6}
                                            disabled={saveAnimating}
                                        >
                                            <Ionicons
                                                name={post.isSaved ? "bookmark" : "bookmark-outline"}
                                                size={19}
                                                color="#8E8E93"
                                            />
                                        </TouchableOpacity>
                                    </Animated.View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.divider} />
                    </View>

                    <View style={styles.commentsSection}>
                        <Text style={styles.commentsTitle}>
                            Comments ({comments.length})
                        </Text>

                        {comments.map((comment) => (
                            <CommentView
                                key={comment.commentId}
                                comment={comment}
                                onLike={handleCommentLike}
                                onDelete={handleCommentDelete}
                                onUpdate={handleCommentUpdate}
                                onReplySubmit={handleReplySubmit}
                                onLoadReplies={handleLoadReplies}
                                formatDate={formatDate}
                            />
                        ))}

                        {comments.length === 0 && (
                            <View style={styles.noComments}>
                                <Ionicons name="chatbubbles-outline" size={48} color="#444" />
                                <Text style={styles.noCommentsText}>No comments yet</Text>
                                <Text style={styles.noCommentsSubtext}>Be the first to comment!</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>

                <AnimatedCommentInput
                    value={commentText}
                    onChangeText={setCommentText}
                    onSubmit={handleSubmitComment}
                    submitting={submitting}
                    placeholder="Write a comment..."
                    maxLength={500}
                    visible={commentInputVisible}
                />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: globalStyles.dark.backgroundColor,
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: Platform.OS === 'ios' ? 220 : 200,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#FF3B30',
        fontWeight: '600',
    },

    postCard: {
        width: '100%',
        backgroundColor: globalStyles.dark.backgroundColor,
    },
    postContent: {
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 8,
    },
    postHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    avatarContainer: {
        marginRight: 10,
    },
    avatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#8774E1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    postHeaderText: {
        flex: 1,
    },
    username: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 2,
    },
    timestamp: {
        color: "#8E8E93",
        fontSize: 13,
        fontWeight: "400",
    },
    myBadge: {
        marginLeft: 8,
    },
    caption: {
        color: "#fff",
        fontSize: 15,
        lineHeight: 20,
        marginBottom: 8,
    },
    mediaWrapper: {
        marginVertical: 8,
        position: 'relative',
    },
    mediaContainer: {
        width: "100%",
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: '#1C1C1E',
    },
    mediaImage: {
        width: "100%",
        height: "100%",
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        zIndex: 1,
    },
    mediaCountBadge: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    mediaCountText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    postFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 8,
        paddingTop: 8,
    },
    viewsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewsText: {
        color: '#8E8E93',
        fontSize: 13,
        fontWeight: '400',
    },
    actionsContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 20,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 2,
    },
    actionText: {
        color: "#8E8E93",
        fontSize: 13,
        fontWeight: "500",
    },
    actionTextActive: {
        color: "#FF3B30",
    },
    divider: {
        height: 0.5,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginLeft: 62,
    },

    commentsSection: {
        padding: 16,
    },
    commentsTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 20,
    },
    noComments: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    noCommentsText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#666',
        marginTop: 16,
    },
    noCommentsSubtext: {
        fontSize: 14,
        color: '#444',
        marginTop: 4,
    },
});

export default PostDetailScreen;