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
    Image,
    TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";
import globalStyles from "../../styles";

const ChatCard = ({ chat }) => {
    const navigation = useNavigation();

    const handleChatOpen = () => {
        navigation.navigate('ChatDetail', {
            chatId: chat.chatId,
            username: chat.username
        });
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString();
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={handleChatOpen}
            activeOpacity={0.7}
        >
            <View style={styles.avatarContainer}>
                {chat.avatarUrl ? (
                    <Image
                        source={{ uri: chat.avatarUrl }}
                        style={styles.avatar}
                    />
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Ionicons
                            name="person-circle"
                            size={48}
                            color={globalStyles.main.accent}
                        />
                    </View>
                )}
                {chat.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>
                            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                    <Text
                        style={styles.username}
                        numberOfLines={1}
                    >
                        {chat.username}
                    </Text>
                    <Text style={styles.timestamp}>
                        {formatTime(chat.lastMessageAt)}
                    </Text>
                </View>

                <Text
                    style={[
                        styles.lastMessage,
                        chat.unreadCount > 0 && styles.lastMessageUnread
                    ]}
                    numberOfLines={1}
                >
                    {chat.lastMessage || 'No messages yet'}
                </Text>
            </View>

            <TouchableOpacity style={styles.moreButton}>
                <Ionicons
                    name="ellipsis-vertical"
                    size={20}
                    color={globalStyles.main.textSecondary}
                />
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: globalStyles.main.borderColor,
        backgroundColor: globalStyles.dark.backgroundColor,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: globalStyles.main.inputBackgroundColor,
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    unreadBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: globalStyles.main.accent,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: globalStyles.dark.backgroundColor,
    },
    unreadText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    contentContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    username: {
        fontSize: 16,
        fontWeight: '600',
        color: globalStyles.dark.textPrimary,
        flex: 1,
    },
    timestamp: {
        fontSize: 12,
        color: globalStyles.main.textSecondary,
        marginLeft: 8,
    },
    lastMessage: {
        fontSize: 14,
        color: globalStyles.main.textSecondary,
    },
    lastMessageUnread: {
        color: globalStyles.dark.textPrimary,
        fontWeight: '500',
    },
    moreButton: {
        padding: 8,
        marginLeft: 8,
    },
});

export default ChatCard;