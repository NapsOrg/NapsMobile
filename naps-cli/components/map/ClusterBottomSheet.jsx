/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import React, { useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Animated,
    TouchableOpacity,
    Image,
    ScrollView,
    Dimensions,
    PanResponder,
} from "react-native";

import marker_icon from "../../assets/icons/marker.png";
import { useNavigation } from "@react-navigation/native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const ClusterBottomSheet = ({ visible, onClose, posts, onPostPress, darkMode }) => {
    const translateY = useRef(new Animated.Value(0)).current;
    const navigation = useNavigation();

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    translateY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 50) {
                    closeBottomSheet();
                } else {
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    useEffect(() => {
        if (visible) {
            translateY.setValue(SCREEN_HEIGHT);
            Animated.spring(translateY, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const closeBottomSheet = () => {
        Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            onClose();
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return "just now";
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

        return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
    };

    const getMediaUrl = (post) => {
        if (post.media && post.media.length > 0) {
            return post.media[0].url || post.media[0].thumbnail_url;
        }
        return null;
    };

    if (!visible) return null;

    const openPost = (postId) => {
        navigation.navigate('PostDetail', { postId });
    }

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={closeBottomSheet}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={closeBottomSheet}
            >
                <Animated.View
                    style={[
                        styles.bottomSheet,
                        darkMode && styles.bottomSheetDark,
                        {
                            transform: [{ translateY }],
                        },
                    ]}
                    {...panResponder.panHandlers}
                >
                    <TouchableOpacity activeOpacity={1}>
                        <View style={[styles.handle, darkMode && styles.handleDark]} />

                        <View style={[styles.header, darkMode && styles.headerDark]}>
                            <Text style={[styles.title, darkMode && styles.titleDark]}>
                                {posts?.length || 0} {posts?.length === 1 ? "post" : "posts"}
                            </Text>
                            <TouchableOpacity onPress={closeBottomSheet} style={[styles.closeButton, darkMode && styles.closeButtonDark]}>
                                <Text style={[styles.closeButtonText, darkMode && styles.closeButtonTextDark]}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={styles.scrollView}
                            showsVerticalScrollIndicator={false}
                        >
                            {posts?.map((post) => {
                                const mediaUrl = getMediaUrl(post);

                                return (
                                    <TouchableOpacity
                                        key={post.id}
                                        style={[styles.postCard, darkMode && styles.postCardDark]}
                                        onPress={() => {
                                            if (onPostPress) {
                                                onPostPress(post.id);
                                            }
                                        }}
                                    >
                                        <View style={styles.mediaContainer}>
                                            {mediaUrl ? (
                                                <Image
                                                    source={{ uri: mediaUrl }}
                                                    style={styles.mediaImage}
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <View style={styles.mediaPlaceholder}>
                                                    <Text style={styles.placeholderText}>📷</Text>
                                                </View>
                                            )}
                                        </View>

                                        <View style={styles.postInfo}>
                                            <View style={styles.userInfo}>
                                                <Image
                                                    source={{ uri: post.user.profile_pic }}
                                                    style={styles.avatar}
                                                />
                                                <View style={styles.userDetails}>
                                                    <Text style={[styles.username, darkMode && styles.usernameDark]}>
                                                        @{post.user.username}
                                                    </Text>
                                                    <Text style={[styles.timestamp, darkMode && styles.timestampDark]}>
                                                        {formatDate(post.created_at)}
                                                    </Text>
                                                </View>
                                            </View>

                                            {post.content && (
                                                <Text style={[styles.content, darkMode && styles.contentDark]} numberOfLines={2}>
                                                    {post.content}
                                                </Text>
                                            )}

                                            <Text style={[styles.location, darkMode && styles.locationDark]}>
                                                <Image source={marker_icon} style={styles.markerIcon}/> {post.city}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </TouchableOpacity>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    bottomSheet: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        minHeight: SCREEN_HEIGHT * 0.5,
        maxHeight: SCREEN_HEIGHT * 0.9,
        paddingBottom: 20,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: "#DDD",
        borderRadius: 2,
        alignSelf: "center",
        marginTop: 12,
        marginBottom: 8,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#f0f0f0",
        alignItems: "center",
        justifyContent: "center",
    },
    closeButtonText: {
        fontSize: 20,
        color: "#666",
    },
    scrollView: {
        maxHeight: SCREEN_HEIGHT * 0.7,
    },
    postCard: {
        flexDirection: "row",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        backgroundColor: "#fff",
    },
    mediaContainer: {
        width: 100,
        height: 100,
        borderRadius: 12,
        overflow: "hidden",
        marginRight: 12,
        backgroundColor: "#f0f0f0",
    },
    mediaImage: {
        width: "100%",
        height: "100%",
    },
    mediaPlaceholder: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#9561FB",
    },
    placeholderText: {
        fontSize: 32,
    },
    postInfo: {
        flex: 1,
        justifyContent: "space-between",
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
        borderWidth: 2,
        borderColor: "#9561FB",
    },
    userDetails: {
        flex: 1,
    },
    username: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
    },
    timestamp: {
        fontSize: 12,
        color: "#999",
        marginTop: 2,
    },
    content: {
        fontSize: 14,
        color: "#555",
        lineHeight: 20,
        marginBottom: 8,
    },
    location: {
        fontSize: 12,
        color: "#9561FB",
        fontWeight: "500",
    },
    // Dark mode styles
    bottomSheetDark: {
        backgroundColor: "#1a1a1a",
    },
    handleDark: {
        backgroundColor: "#444",
    },
    headerDark: {
        borderBottomColor: "#333",
    },
    titleDark: {
        color: "#fff",
    },
    closeButtonDark: {
        backgroundColor: "#333",
    },
    closeButtonTextDark: {
        color: "#ccc",
    },
    postCardDark: {
        backgroundColor: "#1a1a1a",
        borderBottomColor: "#333",
    },
    usernameDark: {
        color: "#fff",
    },
    timestampDark: {
        color: "#888",
    },
    contentDark: {
        color: "#ccc",
    },
    locationDark: {
        color: "#b58aff",
    },
    markerIcon: {
        width: 16,
        height: 16,
        marginRight: 4,
        tintColor: "#b58aff",
    }
});

export default ClusterBottomSheet;