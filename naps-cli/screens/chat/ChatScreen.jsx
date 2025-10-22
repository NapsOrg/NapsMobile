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
    TextInput,
    Pressable,
    FlatList,
    ActivityIndicator,
    Alert,
} from "react-native";

import { useEffect, useState, useRef, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import ChatHeader from "../../components/chat/ChatHeader";
import UserService from "../../services/UserService";
import ChatService from "../../services/ChatService";
import MessageService from "../../services/MessageService";
import ChatCard from "../../components/chat/ChatCard";
import globalStyles from "../../styles";
import React from "react";

const ChatScreen = () => {
    const navigation = useNavigation();
    const chatServiceRef = useRef(new ChatService());
    const userServiceRef = useRef(new UserService());
    const messageServicesRef = useRef(new Map());

    const [me, setMe] = useState(null);
    const [chats, setChats] = useState([]);
    const [filteredChats, setFilteredChats] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const isMountedRef = useRef(true);
    const typingTimeouts = useRef(new Map());

    useEffect(() => {
        isMountedRef.current = true;
        fetchMeBasic();

        return () => {
            isMountedRef.current = false;
            messageServicesRef.current.forEach((service) => {
                service.disconnectWebSocket();
            });
            messageServicesRef.current.clear();
            typingTimeouts.current.forEach(timeout => clearTimeout(timeout));
            typingTimeouts.current.clear();
        };
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadChats();
            return () => {
                messageServicesRef.current.forEach((service) => {
                    service.disconnectWebSocket();
                });
                messageServicesRef.current.clear();
            };
        }, [])
    );

    const fetchMeBasic = async () => {
        try {
            const res = await userServiceRef.current.getMeBasic();
            if (res.status === 200 && isMountedRef.current) {
                setMe(res.data);
            }
        } catch (error) {
            console.error("Error fetching user basic data:", error);
        }
    };

    const loadChats = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }
            setError(null);

            const fetchedChats = await chatServiceRef.current.getChats();

            if (!isMountedRef.current) return;

            const sortedChats = fetchedChats.sort((a, b) => {
                const timeA = new Date(a.last_message_time);
                const timeB = new Date(b.last_message_time);
                return timeB - timeA;
            });

            const chatsWithStatus = sortedChats.map(chat => ({
                ...chat,
                isOnline: false,
                isTyping: false,
            }));

            setChats(chatsWithStatus);

            if (searchQuery.trim() !== "") {
                handleSearch(searchQuery, chatsWithStatus);
            } else {
                setFilteredChats(chatsWithStatus);
            }

            if (me?.user_id) {
                connectToChats(chatsWithStatus);
            }
        } catch (err) {
            console.error("Error loading chats:", err);
            if (isMountedRef.current) {
                setError("Failed to load chats");
            }
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
                setIsRefreshing(false);
            }
        }
    };

    const connectToChats = async (chatList) => {
        if (!me?.user_id) return;

        for (const chat of chatList) {
            if (!messageServicesRef.current.has(chat.chatId)) {
                const messageService = new MessageService();
                messageServicesRef.current.set(chat.chatId, messageService);

                try {
                    await messageService.connectWebSocket(
                        chat.chatId,
                        me.user_id,
                        (data) => handleChatStatusUpdate(chat.chatId, data),
                        (error) => console.error(`WebSocket error for chat ${chat.chatId}:`, error),
                        () => updateChatStatus(chat.chatId, { isOnline: false, isTyping: false })
                    );
                } catch (error) {
                    console.error(`Failed to connect to chat ${chat.chatId}:`, error);
                }
            }
        }
    };

    const handleChatStatusUpdate = (chatId, data) => {
        if (!isMountedRef.current || !me?.user_id) return;

        switch (data.type) {
            case "user_joined":
            case "user_online":
                if (data.user_id !== me.user_id) {
                    updateChatStatus(chatId, { isOnline: true });
                }
                break;

            case "user_offline":
                if (data.user_id !== me.user_id) {
                    updateChatStatus(chatId, { isOnline: false, isTyping: false });
                }
                break;

            case "typing":
            case "user_typing":
                if (data.user_id !== me.user_id) {
                    updateChatStatus(chatId, { isTyping: true });
                    
                    if (typingTimeouts.current.has(chatId)) {
                        clearTimeout(typingTimeouts.current.get(chatId));
                    }
                    
                    const timeout = setTimeout(() => {
                        if (isMountedRef.current) {
                            updateChatStatus(chatId, { isTyping: false });
                        }
                    }, 3000);
                    
                    typingTimeouts.current.set(chatId, timeout);
                }
                break;

            case "stop_typing":
            case "user_stop_typing":
                if (data.user_id !== me.user_id) {
                    updateChatStatus(chatId, { isTyping: false });
                    
                    if (typingTimeouts.current.has(chatId)) {
                        clearTimeout(typingTimeouts.current.get(chatId));
                        typingTimeouts.current.delete(chatId);
                    }
                }
                break;

            case "message":
                if (data.sender_id !== me.user_id) {
                    updateChatLastMessage(chatId, data.message);
                }
                break;
        }
    };

    const updateChatStatus = (chatId, statusUpdate) => {
        if (!isMountedRef.current) return;

        setChats(prev => {
            const updated = prev.map(chat =>
                chat.chatId === chatId
                    ? { ...chat, ...statusUpdate }
                    : chat
            );
            return updated;
        });

        setFilteredChats(prev => {
            const updated = prev.map(chat =>
                chat.chatId === chatId
                    ? { ...chat, ...statusUpdate }
                    : chat
            );
            return updated;
        });
    };

    const updateChatLastMessage = (chatId, message) => {
        if (!isMountedRef.current) return;

        const now = new Date().toISOString();

        setChats(prev => {
            const updated = prev.map(chat =>
                chat.chatId === chatId
                    ? { ...chat, lastMessage: message, lastMessageAt: now, isTyping: false }
                    : chat
            );
            return updated.sort((a, b) => {
                const timeA = new Date(a.lastMessageAt);
                const timeB = new Date(b.lastMessageAt);
                return timeB - timeA;
            });
        });

        setFilteredChats(prev => {
            const updated = prev.map(chat =>
                chat.chatId === chatId
                    ? { ...chat, lastMessage: message, lastMessageAt: now, isTyping: false }
                    : chat
            );
            return updated.sort((a, b) => {
                const timeA = new Date(a.lastMessageAt);
                const timeB = new Date(b.lastMessageAt);
                return timeB - timeA;
            });
        });
    };

    const handleSearch = (text, chatList = chats) => {
        setSearchQuery(text);
        if (text.trim() === "") {
            setFilteredChats(chatList);
        } else {
            const filtered = chatList.filter(chat =>
                chat.username.toLowerCase().includes(text.toLowerCase()) ||
                (chat.lastMessage && chat.lastMessage.toLowerCase().includes(text.toLowerCase()))
            );
            setFilteredChats(filtered);
        }
    };

    const handleDeleteChat = (chatId) => {
        Alert.alert(
            "Delete Chat",
            "Are you sure you want to delete this chat?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    onPress: async () => {
                        try {
                            await chatServiceRef.current.deleteChat(chatId);

                            const messageService = messageServicesRef.current.get(chatId);
                            if (messageService) {
                                messageService.disconnectWebSocket();
                                messageServicesRef.current.delete(chatId);
                            }

                            if (isMountedRef.current) {
                                setChats(prev => prev.filter(c => c.chatId !== chatId));
                                setFilteredChats(prev => prev.filter(c => c.chatId !== chatId));
                            }
                        } catch (err) {
                            console.error("Error deleting chat:", err);
                            Alert.alert("Error", "Failed to delete chat");
                        }
                    },
                    style: "destructive",
                },
            ]
        );
    };

    const handleRefresh = () => {
        loadChats(true);
    };

    const renderChatCard = ({ item }) => (
        <ChatCard
            chat={item}
            me={me}
            onDelete={handleDeleteChat}
        />
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Ionicons
                    name="chatbubbles-outline"
                    size={56}
                    color={globalStyles.main.accent}
                />
            </View>
            <Text style={styles.emptyTitle}>No Messages Yet</Text>
            <Text style={styles.emptySubtitle}>
                Start a conversation by tapping the compose button
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ChatHeader title={"Chats"} />

            {/* Search Bar */}
            <View style={styles.searchWrapper}>
                <View style={styles.searchContainer}>
                    <Ionicons
                        name="search"
                        size={20}
                        color={globalStyles.main.placeholderTextColor}
                        style={styles.searchIcon}
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search"
                        placeholderTextColor={globalStyles.main.placeholderTextColor}
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                    {searchQuery.length > 0 && (
                        <Pressable
                            onPress={() => handleSearch("")}
                            style={styles.clearButton}
                        >
                            <Ionicons
                                name="close-circle"
                                size={20}
                                color={globalStyles.main.placeholderTextColor}
                            />
                        </Pressable>
                    )}
                </View>
            </View>

            {/* Chat List */}
            {isLoading && !isRefreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator
                        size="large"
                        color={globalStyles.main.accent}
                    />
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <View style={styles.errorIconContainer}>
                        <Ionicons
                            name="alert-circle-outline"
                            size={56}
                            color={globalStyles.main.red}
                        />
                    </View>
                    <Text style={styles.errorTitle}>Something went wrong</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <Pressable
                        style={styles.retryButton}
                        onPress={() => loadChats()}
                    >
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </Pressable>
                </View>
            ) : (
                <FlatList
                    data={filteredChats}
                    renderItem={renderChatCard}
                    keyExtractor={(item, index) => (item.chatId ? item.chatId.toString() : index.toString())}
                    ListEmptyComponent={renderEmptyState}
                    onRefresh={handleRefresh}
                    refreshing={isRefreshing}
                    style={styles.chatList}
                    contentContainerStyle={filteredChats.length === 0 ? styles.chatListEmpty : null}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: globalStyles.dark.backgroundColor,
    },
    searchWrapper: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        paddingHorizontal: 16,
    },
    searchIcon: {
        marginRight: 8,
        opacity: 0.6,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: globalStyles.dark.textPrimary,
        paddingVertical: 0,
    },
    clearButton: {
        padding: 4,
    },
    chatList: {
        flex: 1,
    },
    chatListEmpty: {
        flexGrow: 1,
    },
    separator: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginLeft: 88,
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
        paddingHorizontal: 40,
    },
    errorIconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: globalStyles.dark.textPrimary,
        marginBottom: 8,
    },
    errorText: {
        fontSize: 15,
        color: globalStyles.main.textSecondary,
        textAlign: 'center',
        opacity: 0.8,
    },
    retryButton: {
        marginTop: 24,
        paddingHorizontal: 32,
        paddingVertical: 12,
        backgroundColor: globalStyles.main.accent,
        borderRadius: 24,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: globalStyles.main.accent + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: globalStyles.dark.textPrimary,
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    emptySubtitle: {
        fontSize: 15,
        color: globalStyles.main.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        opacity: 0.8,
    },
});

export default ChatScreen;