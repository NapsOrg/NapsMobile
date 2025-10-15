/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import React, { useState, useEffect, memo } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import globalStyles from "../../styles";

const AdaptivePostMedia = memo(({ mediaUrl, containerWidth }) => {
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
                style={styles.postImage}
                resizeMode="cover"
            />
        </View>
    );
});

AdaptivePostMedia.displayName = 'AdaptivePostMedia';

const FeedPost = ({ post, onPress, onLikePress, onCommentPress }) => {
    const { width: screenWidth } = useWindowDimensions();

    const hasMedia = post.media && post.media.length > 0;

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

    const handleLike = (e) => {
        e.stopPropagation();
        if (onLikePress) {
            onLikePress(post.postId);
        }
    };

    const handleComment = (e) => {
        e.stopPropagation();
        if (onCommentPress) {
            onCommentPress(post.postId);
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={0.95}
            onPress={() => onPress && onPress(post.postId)}
            style={styles.postCard}
        >
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
                    <Text style={styles.caption}>
                        {post.content}
                    </Text>
                )}

                {hasMedia && (
                    <View style={styles.mediaWrapper}>
                        <AdaptivePostMedia
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
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleLike}
                            activeOpacity={0.6}
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

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleComment}
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

                        <TouchableOpacity
                            style={styles.actionButton}
                            activeOpacity={0.6}
                        >
                            <Ionicons
                                name="arrow-redo-outline"
                                size={19}
                                color="#8E8E93"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.divider} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
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
    postImage: {
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

    // Footer
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
});

export default memo(FeedPost);