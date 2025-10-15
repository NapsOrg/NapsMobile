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
import CommentReplyView from "./CommentReplyView";
import globalStyles from "../../styles";

const CommentView = ({
                         comment,
                         onLike,
                         onDelete,
                         onUpdate,
                         onReplySubmit,
                         onLoadReplies,
                         formatDate
                     }) => {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [submittingReply, setSubmittingReply] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState([]);
    const [loadingReplies, setLoadingReplies] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.content);
    const [updating, setUpdating] = useState(false);

    const handleReplySubmit = async () => {
        if (!replyText.trim() || submittingReply) return;

        try {
            setSubmittingReply(true);
            await onReplySubmit(comment.commentId, replyText);
            setReplyText("");
            setShowReplyInput(false);

            if (showReplies) {
                await loadReplies();
            }
        } catch (error) {
            console.error("Error submitting reply:", error);
            Alert.alert("Error", "Failed to post reply");
        } finally {
            setSubmittingReply(false);
        }
    };

    const loadReplies = async () => {
        if (loadingReplies) return;

        try {
            setLoadingReplies(true);
            const repliesData = await onLoadReplies(comment.commentId);
            setReplies(repliesData);
            setShowReplies(true);
        } catch (error) {
            console.error("Error loading replies:", error);
            Alert.alert("Error", "Failed to load replies");
        } finally {
            setLoadingReplies(false);
        }
    };

    const handleToggleReplies = () => {
        if (showReplies) {
            setShowReplies(false);
        } else {
            loadReplies();
        }
    };

    const handleUpdate = async () => {
        if (!editText.trim() || updating) return;

        try {
            setUpdating(true);
            await onUpdate(comment.commentId, editText);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating comment:", error);
            Alert.alert("Error", "Failed to update comment");
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Comment",
            "Are you sure you want to delete this comment?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => onDelete(comment.commentId)
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.commentCard}>
                <LinearGradient
                    colors={comment.userHasStories ? ['#9B75FF', '#FF4458'] : ['transparent', 'transparent']}
                    style={[
                        styles.avatarGradient,
                        !comment.userHasStories && styles.avatarNoStories
                    ]}
                >
                    <View style={styles.avatarInner}>
                        {comment.avatarUrl ? (
                            <Image
                                source={{ uri: comment.avatarUrl }}
                                style={styles.avatar}
                            />
                        ) : (
                            <Ionicons name="person" size={18} color="#9B75FF" />
                        )}
                    </View>
                </LinearGradient>

                <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                        <Text style={styles.username}>@{comment.username}</Text>
                        <View style={styles.headerRight}>
                            <Text style={styles.time}>
                                {formatDate(comment.createdAt)}
                            </Text>
                            {comment.isMy && (
                                <TouchableOpacity
                                    onPress={() => setIsEditing(!isEditing)}
                                    style={styles.menuButton}
                                >
                                    <Ionicons name="ellipsis-horizontal" size={16} color="#888" />
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
                                maxLength={500}
                                autoFocus
                            />
                            <View style={styles.editActions}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsEditing(false);
                                        setEditText(comment.content);
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
                                    <Ionicons name="trash-outline" size={16} color="#FF4458" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.commentText}>{comment.content}</Text>
                    )}

                    <View style={styles.actions}>
                        <TouchableOpacity
                            onPress={() => onLike(comment.commentId)}
                            style={styles.action}
                        >
                            <Ionicons
                                name={comment.isReacted ? "heart" : "heart-outline"}
                                size={16}
                                color={comment.isReacted ? "#FF4458" : "#888"}
                            />
                            <Text style={styles.actionText}>
                                {comment.reactionsCount}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setShowReplyInput(!showReplyInput)}
                            style={styles.action}
                        >
                            <Ionicons name="chatbubble-outline" size={14} color="#888" />
                            <Text style={styles.actionText}>Reply</Text>
                        </TouchableOpacity>

                        {comment.replyCount > 0 && (
                            <TouchableOpacity
                                onPress={handleToggleReplies}
                                style={styles.action}
                            >
                                {loadingReplies ? (
                                    <ActivityIndicator size="small" color="#9B75FF" />
                                ) : (
                                    <>
                                        <Ionicons
                                            name={showReplies ? "chevron-up" : "chevron-down"}
                                            size={14}
                                            color="#9B75FF"
                                        />
                                        <Text style={[styles.actionText, styles.repliesText]}>
                                            {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>

                    {showReplyInput && (
                        <View style={styles.replyInputContainer}>
                            <TextInput
                                style={styles.replyInput}
                                placeholder="Write a reply..."
                                placeholderTextColor="#666"
                                value={replyText}
                                onChangeText={setReplyText}
                                multiline
                                maxLength={500}
                            />
                            <TouchableOpacity
                                onPress={handleReplySubmit}
                                style={[
                                    styles.replyButton,
                                    (!replyText.trim() || submittingReply) && styles.replyButtonDisabled
                                ]}
                                disabled={!replyText.trim() || submittingReply}
                            >
                                {submittingReply ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Ionicons name="send" size={16} color="#fff" />
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            {showReplies && replies.length > 0 && (
                <View style={styles.repliesContainer}>
                    {replies.map((reply, index) => (
                        <CommentReplyView
                            key={reply.id}
                            reply={reply}
                            formatDate={formatDate}
                            isLast={index === replies.length - 1}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
    },
    commentCard: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: globalStyles.dark.postBackgroundColor,
        borderRadius: 16,
    },
    avatarGradient: {
        width: 40,
        height: 40,
        borderRadius: 20,
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarNoStories: {
        padding: 0,
    },
    avatarInner: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    commentContent: {
        flex: 1,
        marginLeft: 12,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    username: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    time: {
        fontSize: 12,
        color: '#666',
    },
    menuButton: {
        padding: 4,
    },
    commentText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#e0e0e0',
        marginBottom: 8,
    },
    editContainer: {
        marginBottom: 8,
    },
    editInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 10,
        fontSize: 14,
        color: '#fff',
        borderWidth: 1,
        borderColor: 'rgba(155, 117, 255, 0.3)',
        minHeight: 60,
    },
    editActions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    editButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
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
        fontSize: 13,
        color: '#888',
        fontWeight: '600',
    },
    saveText: {
        fontSize: 13,
        color: '#fff',
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'center',
    },
    action: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        fontSize: 13,
        color: '#888',
        fontWeight: '600',
    },
    repliesText: {
        color: '#9B75FF',
    },
    replyInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    replyInput: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 13,
        color: '#fff',
        maxHeight: 80,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    replyButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#9B75FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    replyButtonDisabled: {
        backgroundColor: 'rgba(155, 117, 255, 0.3)',
    },
    repliesContainer: {
        marginLeft: 52,
        marginTop: 8,
        paddingLeft: 12,
        borderLeftWidth: 2,
        borderLeftColor: 'rgba(155, 117, 255, 0.2)',
    },
});

export default CommentView;