import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    Dimensions,
    Animated,
    Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import SmartInput from "../../components/input/SmartInput";
import MessageService from "../../services/MessageService";
import MessageHeader from "../../components/message/MessageHeader";
import OtherMessage from "../../components/message/OtherMessage";
import MyMessage from "../../components/message/MyMessage";
import MessageEmptyChatView from "../../components/message/MessageEmptyChatView";

const SCREEN_WIDTH = Dimensions.get('window').width;

const MessageScreen = () => {
    const route = useRoute();
    const { chatId, username, avatarUrl, userId } = route.params;

    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isConnecting, setIsConnecting] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isOnline, setIsOnline] = useState(false);
    const [connectionState, setConnectionState] = useState("CLOSED");
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const lastOnlinePing = useRef(Date.now());
    const messageServiceRef = useRef(new MessageService());
    const flatListRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const currentUserIdRef = useRef(userId);
    const isConnectingRef = useRef(false);
    const isMountedRef = useRef(true);
    const modalScale = useRef(new Animated.Value(0)).current;
    const scrollButtonScale = useRef(new Animated.Value(0)).current;
    const typingDotAnims = useRef([
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
    ]).current;
    const processedMessageIds = useRef(new Set());

    useEffect(() => {
        const interval = setInterval(() => {
            if (Date.now() - lastOnlinePing.current > 30000) {
                setIsOnline(false);
            }
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        isMountedRef.current = true;
        connectToChat();

        const keyboardDidShow = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 150);
            }
        );

        return () => {
            isMountedRef.current = false;
            keyboardDidShow.remove();
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            messageServiceRef.current.disconnectWebSocket();
            isConnectingRef.current = false;
            processedMessageIds.current.clear();
        };
    }, [chatId, userId]);

    useEffect(() => {
        if (isTyping) {
            startTypingAnimation();
        }
    }, [isTyping]);

    useEffect(() => {
        if (showScrollButton) {
            Animated.spring(scrollButtonScale, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(scrollButtonScale, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [showScrollButton]);

    const startTypingAnimation = () => {
        const animations = typingDotAnims.map((anim, index) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(index * 150),
                    Animated.timing(anim, {
                        toValue: -8,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim, {
                        toValue: 0,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ])
            )
        );
        Animated.parallel(animations).start();
    };

    const showModal = (message) => {
        setSelectedMessage(message);
        setModalVisible(true);
        Animated.spring(modalScale, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const hideModal = () => {
        Animated.timing(modalScale, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setModalVisible(false);
            setSelectedMessage(null);
        });
    };

    const handleScroll = (event) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
        
        setShowScrollButton(distanceFromBottom > 200);
    };

    const scrollToBottom = () => {
        flatListRef.current?.scrollToEnd({ animated: true });
        setShowScrollButton(false);
    };

    useFocusEffect(
        useCallback(() => {
            const messageService = messageServiceRef.current;
            if (!messageService.isConnected() && !isConnectingRef.current && connectionState === "CLOSED") {
                connectToChat();
            }
            return () => {};
        }, [connectionState])
    );

    const connectToChat = async () => {
        if (isConnectingRef.current) return;

        try {
            isConnectingRef.current = true;
            setIsConnecting(true);
            setConnectionState("CONNECTING");

            const messageService = messageServiceRef.current;
            if (messageService.isConnected()) {
                await messageService.disconnectWebSocket();
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            await messageService.connectWebSocket(
                chatId,
                userId,
                handleWebSocketMessage,
                handleWebSocketError,
                handleWebSocketClose
            );

            if (!isMountedRef.current) return;
            setConnectionState("OPEN");

            setTimeout(() => {
                if (isMountedRef.current && messageService.isConnected()) {
                    messageService.markAllAsRead();
                }
            }, 500);

            setIsConnecting(false);
            isConnectingRef.current = false;
        } catch (error) {
            console.error("Error connecting to chat:", error);
            if (!isMountedRef.current) return;
            setConnectionState("CLOSED");
            setIsConnecting(false);
            setIsOnline(false);
            isConnectingRef.current = false;
            Alert.alert("Connection Error", "Failed to connect to chat");
        }
    };

    const handleWebSocketMessage = useCallback((data) => {
        if (!isMountedRef.current) return;

        if (data.type === "pong") {
            return;
        }

        switch (data.type) {
            case "message":
                const messageKey = `${data.message_id}_${data.created_at}`;
                if (processedMessageIds.current.has(messageKey)) {
                    console.log("Duplicate message ignored:", messageKey);
                    return;
                }
                processedMessageIds.current.add(messageKey);

                const newMessage = {
                    message_id: data.message_id,
                    sender_id: data.sender_id,
                    sender_username: data.sender_username,
                    message: data.message,
                    created_at: data.created_at || data.timestamp,
                    is_read: data.is_read || false,
                    is_delivered: data.is_delivered || false,
                    is_edited: data.is_edited || false,
                    reply_to: data.reply_to || null,
                };

                setMessages(prev => {
                    const exists = prev.some(msg => 
                        msg.message_id === data.message_id || 
                        (msg.message === data.message && Math.abs(new Date(msg.created_at) - new Date(data.created_at)) < 1000)
                    );
                    if (exists) {
                        return prev;
                    }
                    const filtered = prev.filter(msg => !msg.isSending || msg.message !== data.message);
                    return [...filtered, newMessage];
                });

                setTimeout(() => {
                    if (isMountedRef.current) {
                        flatListRef.current?.scrollToEnd({ animated: true });
                    }
                }, 100);

                if (data.sender_id !== userId) {
                    messageServiceRef.current.markAsRead(data.message_id);
                }
                break;

            case "typing":
            case "user_typing":
                if (data.user_id !== userId) {
                    setIsTyping(true);
                    if (typingTimeoutRef.current) {
                        clearTimeout(typingTimeoutRef.current);
                    }
                    typingTimeoutRef.current = setTimeout(() => {
                        if (isMountedRef.current) {
                            setIsTyping(false);
                        }
                    }, 3000);
                }
                break;

            case "stop_typing":
            case "user_stop_typing":
                if (data.user_id !== userId) {
                    setIsTyping(false);
                    if (typingTimeoutRef.current) {
                        clearTimeout(typingTimeoutRef.current);
                    }
                }
                break;

            case "user_offline":
                if (data.user_id !== userId) {
                    setIsOnline(false);
                }
                break;

            case "typing":
            case "user_typing":
                if (data.user_id !== userId) {
                    lastOnlinePing.current = Date.now();
                    setIsOnline(true);
                }
                break;

            case "message_deleted":
                setMessages(prev => prev.filter(msg => msg.message_id !== data.message_id));
                break;

            case "message_edited":
                setMessages(prev => prev.map(msg =>
                    msg.message_id === data.message_id
                        ? { ...msg, message: data.new_message, is_edited: true, edited_at: data.edited_at }
                        : msg
                ));
                break;

            case "marked_as_read":
            case "all_marked_as_read":
                setMessages(prev => prev.map(msg =>
                    msg.sender_id === userId ? { ...msg, is_read: true } : msg
                ));
                break;

            case "history":
                if (Array.isArray(data.messages)) {
                    processedMessageIds.current.clear();
                    const historyMessages = data.messages.map(msg => {
                        const messageKey = `${msg.message_id}_${msg.created_at}`;
                        processedMessageIds.current.add(messageKey);
                        return {
                            message_id: msg.message_id,
                            sender_id: msg.sender_id,
                            sender_username: msg.sender_username,
                            message: msg.message,
                            created_at: msg.created_at || msg.timestamp,
                            is_read: true,
                            is_delivered: msg.is_delivered || false,
                            is_edited: msg.is_edited || false,
                            reply_to: msg.reply_to || null,
                        };
                    });
                    setMessages(historyMessages);
                    messageServiceRef.current.markAllAsRead();
                    setTimeout(() => {
                        if (isMountedRef.current) {
                            flatListRef.current?.scrollToEnd({ animated: false });
                        }
                    }, 100);
                }
                break;

            default:
                console.log('Unhandled message type:', data.type, data);
        }
    }, [userId]);

    const handleWebSocketError = useCallback((error) => {
        console.error("WebSocket error:", error);
        if (!isMountedRef.current) return;
        setConnectionState("ERROR");
        setIsOnline(false);
        isConnectingRef.current = false;
    }, []);

    const handleWebSocketClose = useCallback((event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        if (!isMountedRef.current) return;
        setConnectionState("CLOSED");
        setIsOnline(false);
        isConnectingRef.current = false;

        if (event.code !== 1000 && isMountedRef.current) {
            setTimeout(() => {
                if (isMountedRef.current && !messageServiceRef.current.isConnected()) {
                    Alert.alert("Connection Lost", "Attempting to reconnect...", [{
                        text: "OK",
                        onPress: () => connectToChat()
                    }]);
                }
            }, 1000);
        }
    }, []);

    const handleSendMessage = ({ text, media }) => {
        if (!text.trim() && media.length === 0) return;

        try {
            setIsSending(true);
            const messageService = messageServiceRef.current;

            if (!messageService.isConnected()) {
                Alert.alert("Connection Error", "Not connected to chat. Please wait...");
                setIsSending(false);
                return;
            }

            messageService.sendTextMessage(text.trim());
            setInputValue("");
        } catch (error) {
            console.error("Error sending message:", error);
            Alert.alert("Error", "Failed to send message");
        } finally {
            setIsSending(false);
        }
    };

    const handleTyping = (text) => {
        setInputValue(text);
        const messageService = messageServiceRef.current;
        if (!messageService.isConnected()) return;

        messageService.sendTyping();
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
                messageService.sendStopTyping();
            }
        }, 3000);
    };

    const handleDeleteMessage = () => {
        hideModal();
        setTimeout(() => {
            Alert.alert(
                "Delete Message",
                "Are you sure you want to delete this message?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => {
                            try {
                                messageServiceRef.current.deleteMessage(selectedMessage.message_id);
                            } catch (error) {
                                Alert.alert("Error", "Failed to delete message");
                            }
                        }
                    }
                ]
            );
        }, 300);
    };

    const handleEditMessage = () => {
        const messageToEdit = selectedMessage;
        hideModal();
        setTimeout(() => {
            Alert.prompt(
                "Edit Message",
                "Enter new message text:",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Save",
                        onPress: (newText) => {
                            if (newText && newText.trim() && newText !== messageToEdit.message) {
                                try {
                                    messageServiceRef.current.editMessage(messageToEdit.message_id, newText.trim());
                                } catch (error) {
                                    Alert.alert("Error", "Failed to edit message");
                                }
                            }
                        }
                    }
                ],
                "plain-text",
                messageToEdit.message
            );
        }, 300);
    };

    const handleCopyMessage = () => {
        hideModal();
        Alert.alert("Copied", "Message copied to clipboard");
    };

    const renderMessage = ({ item, index }) => {
        const isOwnMessage = item.sender_id === userId;

        return (
            <TouchableOpacity
                onLongPress={() => showModal(item)}
                activeOpacity={0.9}
            >
                {isOwnMessage ? (
                    <MyMessage
                        message={item.message}
                        timestamp={item.created_at}
                        isRead={item.is_read}
                        isDelivered={item.is_delivered}
                        isEdited={item.is_edited}
                        isSending={item.isSending}
                    />
                ) : (
                    <OtherMessage
                        message={item.message}
                        timestamp={item.created_at}
                        isEdited={item.is_edited}
                    />
                )}
            </TouchableOpacity>
        );
    };

    const renderTypingIndicator = () => {
        if (!isTyping) return null;

        return (
            <View style={styles.typingContainer}>
                <View style={styles.typingBubble}>
                    <View style={styles.typingDots}>
                        {typingDotAnims.map((anim, index) => (
                            <Animated.View
                                key={index}
                                style={[
                                    styles.typingDot,
                                    { transform: [{ translateY: anim }] }
                                ]}
                            />
                        ))}
                    </View>
                </View>
            </View>
        );
    };

    if (isConnecting) {
        return (
            <LinearGradient
                colors={['#1A1A1A', '#2D2D2D', '#1A1A1A']}
                style={styles.loadingGradient}
            >
                <SafeAreaView style={styles.container}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#9561FB" />
                        <Text style={styles.loadingText}>Connecting to chat...</Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <MessageHeader
                username={username}
                avatarUrl={avatarUrl}
                connectionState={connectionState}
                isOnline={isOnline}
            />

            <View style={styles.chatContainer}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.message_id.toString()}
                    contentContainerStyle={styles.messagesList}
                    inverted={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    onContentSizeChange={() => {
                        flatListRef.current?.scrollToEnd({ animated: false });
                    }}
                    ListEmptyComponent={
                        !isConnecting ? (
                        <MessageEmptyChatView username={username} />
                        ) : null
                    }
                    ListFooterComponent={renderTypingIndicator}
                    showsVerticalScrollIndicator={false}
                />

                {/* Scroll to Bottom Button */}
                {showScrollButton && (
                    <Animated.View
                        style={[
                            styles.scrollToBottomButton,
                            {
                                transform: [{ scale: scrollButtonScale }],
                                opacity: scrollButtonScale,
                            }
                        ]}
                    >
                        <TouchableOpacity
                            onPress={scrollToBottom}
                            style={styles.scrollButtonTouchable}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#9561FB', '#7B3FE4']}
                                style={styles.scrollButtonGradient}
                            >
                                <Ionicons name="arrow-down" size={24} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                <SmartInput
                    value={inputValue}
                    onChangeText={handleTyping}
                    onSubmit={handleSendMessage}
                    submitting={isSending}
                    placeholder="Message"
                    maxLength={10000}
                    visible={true}
                    isNavbarVisible={false}
                />
            </View>

            <Modal
                visible={modalVisible}
                transparent
                animationType="none"
                onRequestClose={hideModal}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={hideModal}
                >
                    <Animated.View
                        style={[
                            styles.modal,
                            {
                                transform: [{ scale: modalScale }],
                                opacity: modalScale,
                            }
                        ]}
                    >
                        <View style={styles.modalHeader}>
                            <View style={styles.modalAvatar}>
                                <Text style={styles.modalAvatarText}>
                                    {selectedMessage?.sender_username?.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <Text style={styles.modalName}>
                                {selectedMessage?.sender_username}
                            </Text>
                            <Text style={styles.modalMsg} numberOfLines={2}>
                                {selectedMessage?.message}
                            </Text>
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalBtn}
                                onPress={handleCopyMessage}
                            >
                                <Ionicons name="copy-outline" size={20} color="#fff" />
                                <Text style={styles.modalBtnText}>Copy</Text>
                            </TouchableOpacity>

                            {selectedMessage?.sender_id === userId && (
                                <>
                                    <TouchableOpacity
                                        style={styles.modalBtn}
                                        onPress={handleEditMessage}
                                    >
                                        <Ionicons name="create-outline" size={20} color="#fff" />
                                        <Text style={styles.modalBtnText}>Edit</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.modalBtn, styles.deleteBtn]}
                                        onPress={handleDeleteMessage}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                                        <Text style={[styles.modalBtnText, { color: "#FF3B30" }]}>
                                            Delete
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </Animated.View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    backgroundGradient: {
        flex: 1,
    },
    loadingGradient: {
        flex: 1,
    },
    container: {
        backgroundColor: "#000",
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 15,
        color: "rgba(255,255,255,0.6)",
        fontWeight: '500',
    },
    chatContainer: {
        flex: 1,
    },
    messagesList: {
        paddingHorizontal: 4,
        paddingVertical: 16,
        marginTop: 55,
        paddingBottom: 120,
    },
    typingContainer: {
        alignItems: 'flex-start',
        marginVertical: 4,
        paddingHorizontal: 16,
        marginTop: 8,
    },
    typingBubble: {
        backgroundColor: '#2C2C2E',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 18,
        borderBottomLeftRadius: 4,
    },
    typingDots: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
    },
    typingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#9561FB',
    },
    scrollToBottomButton: {
        position: 'absolute',
        right: 16,
        bottom: 100,
        zIndex: 1000,
    },
    scrollButtonTouchable: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    scrollButtonGradient: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.85)",
        justifyContent: "center",
        alignItems: "center",
    },
    modal: {
        width: SCREEN_WIDTH - 80,
        backgroundColor: "#242424",
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        alignItems: "center",
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.08)",
    },
    modalAvatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "#9561FB",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    modalAvatarText: {
        fontSize: 26,
        fontWeight: "700",
        color: "#fff",
    },
    modalName: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 4,
    },
    modalMsg: {
        color: "rgba(255,255,255,0.5)",
        fontSize: 14,
        textAlign: "center",
        marginTop: 6,
        paddingHorizontal: 10,
        lineHeight: 18,
    },
    modalButtons: {
        padding: 8,
    },
    modalBtn: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        marginVertical: 2,
    },
    deleteBtn: {
        marginTop: 4,
    },
    modalBtnText: {
        color: "#fff",
        fontSize: 16,
        marginLeft: 12,
        fontWeight: '600',
    },
});

export default MessageScreen;