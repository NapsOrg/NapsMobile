/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import globalStyles from "../../styles";

const CommentReplyView = ({
                              reply,
                              formatDate,
                              onLike,
                              onDelete,
                              onUpdate,
                              isLast
                          }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(reply.content);
    const [updating, setUpdating] = useState(false);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(reply.reactions_count || 0);

    const handleLike = async () => {
        try {
            if (liked) {
                await onLike?.(reply.id, false);
                setLiked(false);
                setLikesCount(prev => Math.max(0, prev - 1));
            } else {
                await onLike?.(reply.id, true);
                setLiked(true);
                setLikesCount(prev => prev + 1);
            }
        } catch (error) {
            console.error("Error toggling reply like:", error);
            Alert.alert("Error", "Failed to update like");
        }
    };

    const handleUpdate = async () => {
        if (!editText.trim() || updating) return;

        try {
            setUpdating(true);
            await onUpdate?.(reply.id, editText);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating reply:", error);
            Alert.alert("Error", "Failed to update reply");
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Reply",
            "Are you sure you want to delete this reply?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => onDelete?.(reply.id)
                }
            ]
        );
    };

    return (
        <View style={[styles.container, isLast && styles.lastReply]}>
            <View style={styles.replyCard}>
                {/* Avatar */}
                <LinearGradient
                    colors={reply.have_stories ? ['#9B75FF', '#FF4458'] : ['transparent', 'transparent']}
                    style={[
                        styles.avatarGradient,
                        !reply.have_stories && styles.avatarNoStories
                    ]}
                >
                    <View style={styles.avatarInner}>
                        {reply.user_avatar_url ? (
                            <Image
                                source={{ uri: reply.user_avatar_url }}
                                style={styles.avatar}
                            />
                        ) : (
                            <Ionicons name="person" size={16} color="#9B75FF" />
                        )}
                    </View>
                </LinearGradient>

                <View style={styles.replyContent}>
                    <View style={styles.replyHeader}>
                        <Text style={styles.username}>@user_{reply.user_id}</Text>
                        <View style={styles.headerRight}>
                            <Text style={styles.time}>
                                {formatDate(reply.created_at)}
                            </Text>
                            {reply.is_my && (
                                <TouchableOpacity
                                    onPress={() => setIsEditing(!isEditing)}
                                    style={styles.menuButton}
                                >
                                    <Ionicons name="ellipsis-horizontal" size={14} color="#888" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {isEditing ? (
                        <View style={styles.editContainer}>
                            <TextInput
                                style={styles.editInput}
                                value={editText}
                                onChangeText={setEditText}
                                multiline
                                maxLength={1000}
                                autoFocus
                            />
                            <View style={styles.editActions}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsEditing(false);
                                        setEditText(reply.content);
                                    }}
                                    style={styles.editButton}
                                >
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleUpdate}
                                    style={[styles.editButton, styles.saveButton]}
                                    disabled={updating}
                                >
                                    {updating ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.saveText}>Save</Text>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleDelete}
                                    style={[styles.editButton, styles.deleteButton]}
                                >
                                    <Ionicons name="trash-outline" size={14} color="#FF4458" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.replyText}>{reply.content}</Text>
                    )}

                    <View style={styles.actions}>
                        <TouchableOpacity
                            onPress={handleLike}
                            style={styles.action}
                        >
                            <Ionicons
                                name={liked ? "heart" : "heart-outline"}
                                size={14}
                                color={liked ? "#FF4458" : "#888"}
                            />
                            <Text style={styles.actionText}>
                                {likesCount}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
    },
    lastReply: {
        marginBottom: 0,
    },
    replyCard: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: globalStyles.dark.postBackgroundColor,
        borderRadius: 12,
    },
    avatarGradient: {
        width: 32,
        height: 32,
        borderRadius: 16,
        padding: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarNoStories: {
        padding: 0,
    },
    avatarInner: {
        width: 29,
        height: 29,
        borderRadius: 14.5,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    replyContent: {
        flex: 1,
        marginLeft: 10,
    },
    replyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    username: {
        fontSize: 13,
        fontWeight: '700',
        color: '#fff',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    time: {
        fontSize: 11,
        color: '#666',
    },
    menuButton: {
        padding: 4,
    },
    replyText: {
        fontSize: 13,
        lineHeight: 18,
        color: '#e0e0e0',
        marginBottom: 6,
    },
    editContainer: {
        marginBottom: 6,
    },
    editInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 10,
        padding: 8,
        fontSize: 13,
        color: '#fff',
        borderWidth: 1,
        borderColor: 'rgba(155, 117, 255, 0.3)',
        minHeight: 50,
    },
    editActions: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 6,
    },
    editButton: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    saveButton: {
        backgroundColor: '#9B75FF',
    },
    deleteButton: {
        backgroundColor: 'rgba(255, 68, 88, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 68, 88, 0.3)',
    },
    cancelText: {
        fontSize: 12,
        color: '#888',
        fontWeight: '600',
    },
    saveText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    action: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        fontSize: 12,
        color: '#888',
        fontWeight: '600',
    },
});

export default CommentReplyView;