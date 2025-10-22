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
    Image,
    TouchableWithoutFeedback,
    Animated,
    Modal,
    Pressable,
    Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import globalStyles from "../../styles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ChatCard = ({ chat, onDelete, me }) => {
    const navigation = useNavigation();
    const [scaleAnim] = useState(new Animated.Value(1));
    const [modalVisible, setModalVisible] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(50));

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.97,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };

    const handleChatOpen = () => {
        navigation.navigate("Message", {
            chatId: chat.chatId,
            username: chat.username,
            avatarUrl: chat.avatarUrl,
            userId: me.user_id,
        });
    };

    const handleLongPress = () => {
        setModalVisible(true);
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 65,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const closeModal = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 50,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => setModalVisible(false));
    };

    const handleDelete = () => {
        closeModal();
        setTimeout(() => onDelete?.(chat.chatId), 200);
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        const now = new Date();
        const diff = (now - date) / 60000;
        if (diff < 1) return "now";
        if (diff < 60) return `${Math.floor(diff)}m`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h`;
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const unread = chat.unreadCount > 0;
    const isOnline = chat.isOnline || false;
    const isTyping = chat.isTyping || false;

    return (
        <>
            <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
                <TouchableWithoutFeedback
                    onPress={handleChatOpen}
                    onLongPress={handleLongPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                >
                    <View style={styles.inner}>
                        {/* Avatar with Online Indicator */}
                        <View style={styles.avatarContainer}>
                            {chat.avatarUrl ? (
                                <Image
                                    source={{uri: chat.avatarUrl}}
                                    style={styles.avatar}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                    <Text style={styles.avatarInitials}>
                                        {chat.username?.slice(0, 2).toUpperCase() || "?"}
                                    </Text>
                                </View>
                            )}
                            
                            {/* Online Status Indicator */}
                            {isOnline && (
                                <View style={styles.onlineIndicator}>
                                    <View style={styles.onlineDot} />
                                </View>
                            )}
                        </View>

                        {/* Chat Info */}
                        <View style={styles.info}>
                            <View style={styles.header}>
                                <Text style={[styles.username, unread && styles.usernameUnread]}>
                                    {chat.username}
                                </Text>
                                <Text
                                    style={[
                                        styles.time,
                                        unread && { color: globalStyles.main.accent },
                                    ]}
                                >
                                    {formatTime(chat.lastMessageAt)}
                                </Text>
                            </View>

                            <View style={styles.messageRow}>
                                {/* Typing Indicator or Last Message */}
                                {isTyping ? (
                                    <View style={styles.typingContainer}>
                                        <Text style={styles.typingText}>typing</Text>
                                        <View style={styles.typingDots}>
                                            <View style={[styles.typingDot, styles.typingDot1]} />
                                            <View style={[styles.typingDot, styles.typingDot2]} />
                                            <View style={[styles.typingDot, styles.typingDot3]} />
                                        </View>
                                    </View>
                                ) : (
                                    <Text
                                        style={[styles.message, unread && styles.messageUnread]}
                                        numberOfLines={1}
                                    >
                                        {chat.lastMessage || "Start a conversation"}
                                    </Text>
                                )}

                                {/* Read Status (only if not typing) */}
                                {!isTyping && chat.lastMessage && (
                                    <View style={styles.statusIcon}>
                                        {chat.is_read ? (
                                            <Ionicons name="checkmark-done" size={16} color="#3478F6" />
                                        ) : (
                                            <Ionicons name="checkmark" size={16} color="rgba(255,255,255,0.4)" />
                                        )}
                                    </View>
                                )}

                                {/* Unread Badge */}
                                {unread && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>
                                            {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Animated.View>

            {/* Modal */}
            <Modal visible={modalVisible} transparent animationType="none">
                <Pressable style={styles.overlay} onPress={closeModal}>
                    <Animated.View
                        style={[
                            styles.modal,
                            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                        ]}
                    >
                        <View style={styles.modalHeader}>
                            <View style={styles.modalAvatarContainer}>
                                <Image
                                    source={{ uri: chat.avatarUrl }}
                                    style={styles.modalAvatar}
                                />
                                {isOnline && (
                                    <View style={styles.modalOnlineIndicator}>
                                        <View style={styles.modalOnlineDot} />
                                    </View>
                                )}
                            </View>
                            <Text style={styles.modalName}>{chat.username}</Text>
                            {isOnline && (
                                <Text style={styles.modalOnlineText}>Online</Text>
                            )}
                            {chat.lastMessage && (
                                <Text style={styles.modalMsg}>{chat.lastMessage}</Text>
                            )}
                        </View>

                        <View style={styles.modalButtons}>
                            <Pressable
                                style={styles.modalBtn}
                                onPress={() => {
                                    closeModal();
                                    handleChatOpen();
                                }}
                            >
                                <Ionicons name="chatbubble" size={20} color="#fff" />
                                <Text style={styles.modalBtnText}>Open Chat</Text>
                            </Pressable>

                            <Pressable
                                style={[styles.modalBtn, styles.deleteBtn]}
                                onPress={handleDelete}
                            >
                                <Ionicons name="trash" size={20} color="#FF3B30" />
                                <Text style={[styles.modalBtnText, { color: "#FF3B30" }]}>
                                    Delete Chat
                                </Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                </Pressable>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 22,
        overflow: "hidden",
        marginVertical: 4,
        marginHorizontal: 10,
    },
    inner: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderRadius: 22,
    },
    avatarContainer: {
        marginRight: 14,
        position: 'relative',
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
    },
    avatarPlaceholder: {
        backgroundColor: globalStyles.main.accent + "20",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarInitials: {
        color: globalStyles.main.accent,
        fontWeight: "700",
        fontSize: 16,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    onlineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4CD964',
    },
    info: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    username: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "500",
    },
    usernameUnread: {
        fontWeight: "600",
    },
    time: {
        fontSize: 12,
        color: "rgba(255,255,255,0.5)",
    },
    messageRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    message: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 14,
        flex: 1,
    },
    messageUnread: {
        color: "#fff",
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    typingText: {
        color: globalStyles.main.accent,
        fontSize: 14,
        fontWeight: '500',
        marginRight: 4,
    },
    typingDots: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    typingDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: globalStyles.main.accent,
        opacity: 0.7,
    },
    typingDot1: {
        animation: 'typing-dot 1.4s infinite',
    },
    typingDot2: {
        animation: 'typing-dot 1.4s infinite 0.2s',
    },
    typingDot3: {
        animation: 'typing-dot 1.4s infinite 0.4s',
    },
    badge: {
        backgroundColor: globalStyles.main.accent,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 6,
    },
    badgeText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "700",
    },
    statusIcon: {
        marginLeft: 6,
        justifyContent: "center",
        alignItems: "center",
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modal: {
        width: SCREEN_WIDTH - 80,
        backgroundColor: "#1C1C1E",
        borderRadius: 18,
        overflow: "hidden",
    },
    modalHeader: {
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 0.3,
        borderBottomColor: "rgba(255,255,255,0.1)",
    },
    modalAvatarContainer: {
        position: 'relative',
        marginBottom: 10,
    },
    modalAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    modalOnlineIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#1C1C1E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOnlineDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#4CD964',
    },
    modalName: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "600",
    },
    modalOnlineText: {
        color: '#4CD964',
        fontSize: 13,
        fontWeight: '500',
        marginTop: 2,
    },
    modalMsg: {
        color: "rgba(255,255,255,0.5)",
        fontSize: 13,
        textAlign: "center",
        marginTop: 6,
    },
    modalButtons: {
        padding: 10,
    },
    modalBtn: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
    },
    deleteBtn: {
        marginTop: 4,
    },
    modalBtnText: {
        color: "#fff",
        fontSize: 15,
        marginLeft: 10,
    },
});

export default ChatCard;