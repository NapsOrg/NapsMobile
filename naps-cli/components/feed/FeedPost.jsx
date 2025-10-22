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

const AdaptivePostMedia = memo(({ mediaUrl, containerWidth }) => {
    const [imageHeight, setImageHeight] = useState(300);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (mediaUrl) {
            Image.getSize(
                mediaUrl,
                (width, height) => {
                    const aspectRatio = height / width;
                    let calculatedHeight = (containerWidth - 80) * aspectRatio;

                    calculatedHeight = Math.max(150, Math.min(400, calculatedHeight));

                    setImageHeight(calculatedHeight);
                    setLoading(false);
                },
                (error) => {
                    console.log('Failed to get image size:', error);
                    setImageHeight(250);
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

    // Safety checks
    if (!post) return null;

    const hasMedia = post.media && post.media.length > 0;

    const formatDate = (dateString) => {
        if (!dateString) return "recently";
        
        try {
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
        } catch (error) {
            console.log('Error formatting date:', error);
            return "recently";
        }
    };

    const handleLike = () => {
        if (onLikePress) {
            onLikePress(post.postId);
        }
    };

    const handleComment = () => {
        if (onCommentPress) {
            onCommentPress(post.postId);
        }
    };

    const username = post.creatorUsername || "Anonymous";
    const avatarLetter = username.charAt(0).toUpperCase();

    return (
        <View style={styles.container}>
            <View style={styles.messageGroup}>
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
                                {avatarLetter}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.messageContent}>
                    <View style={styles.messageHeader}>
                        <Text style={styles.username}>{username}</Text>
                        {post.isMy && (
                            <Ionicons name="checkmark-circle" size={14} color="#8774E1" style={styles.badgeIcon} />
                        )}
                        <Text style={styles.timestamp}>{formatDate(post.createdAt)}</Text>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => onPress && onPress(post.postId)}
                        style={styles.messageBubble}
                    >
                        {post.content && post.content.trim() !== '' && (
                            <Text style={styles.messageText}>
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
                                        <Text style={styles.mediaCountText}>+{post.media.length - 1}</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.messageFooter}>
                        <View style={styles.viewsContainer}>
                            <Ionicons name="eye-outline" size={14} color="#8E8E93" />
                            <Text style={styles.viewsText}>
                                {post.viewsCount || 0}
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
                                    size={16}
                                    color={post.isLiked ? "#FF3B30" : "#8E8E93"}
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
                                    size={16}
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
                                    size={16}
                                    color="#8E8E93"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#000000',
    },
    messageGroup: {
        flexDirection: 'row',
        gap: 8,
    },
    avatarContainer: {
        marginTop: 4,
    },
    avatarImage: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    avatarPlaceholder: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#8774E1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },

    messageContent: {
        flex: 1,
        gap: 4,
    },
    messageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    username: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    badgeIcon: {
        marginHorizontal: 2,
    },
    timestamp: {
        color: "#8E8E93",
        fontSize: 12,
        fontWeight: "400",
    },

    messageBubble: {
        backgroundColor: '#2C2C2E',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 8,
    },
    messageText: {
        color: "#fff",
        fontSize: 15,
        lineHeight: 20,
    },

    mediaWrapper: {
        marginVertical: 4,
        position: 'relative',
    },
    mediaContainer: {
        width: "100%",
        borderRadius: 8,
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
        top: 6,
        right: 6,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    mediaCountText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },

    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingLeft: 4,
    },
    viewsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    viewsText: {
        color: '#8E8E93',
        fontSize: 12,
        fontWeight: '400',
    },
    actionsContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        padding: 4,
    },
    actionText: {
        color: "#8E8E93",
        fontSize: 12,
        fontWeight: "500",
    },
    actionTextActive: {
        color: "#FF3B30",
    },
});

export default memo(FeedPost);