/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { BlurView } from 'expo-blur';

const MessageHeader = ({ username, avatarUrl, connectionState, isOnline }) => {
    const navigation = useNavigation();

    const getConnectionStatusColor = () => {
        if (isOnline) return "#4CD964";
        
        switch (connectionState) {
            case "OPEN":
                return "#4CD964";
            case "CONNECTING":
                return "#FF9500";
            case "CLOSED":
            case "ERROR":
                return "#FF3B30";
            default:
                return "#8E8E93";
        }
    };

    return (
        <View style={styles.headerContainer}>
            <BlurView intensity={80} tint="dark" style={styles.headerBlur}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <View style={styles.avatarContainer}>
                            {avatarUrl ? (
                                <Image
                                    source={{ uri: avatarUrl }}
                                    style={styles.avatar}
                                />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarText}>
                                        {username?.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                            )}
                            <View style={[
                                styles.statusIndicator,
                                { backgroundColor: getConnectionStatusColor() }
                            ]} />
                        </View>

                        <View style={styles.headerInfo}>
                            <Text style={styles.headerUsername} numberOfLines={1}>
                                {username}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.headerAction}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        marginBottom: 25,
    },
    headerBlur: {
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 12,
        backgroundColor: 'rgba(26, 26, 26, 0.5)',
    },
    backButton: {
        padding: 8,
        marginRight: 4,
    },
    headerCenter: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 2,
        borderColor: 'rgba(149, 97, 251, 0.4)',
    },
    avatarPlaceholder: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#9561FB',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(149, 97, 251, 0.4)',
    },
    avatarText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#fff',
    },
    statusIndicator: {
        position: 'absolute',
        bottom: 0,
        right: -2,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2.5,
        borderColor: '#1A1A1A',
    },
    headerInfo: {
        flex: 1,
    },
    headerUsername: {
        fontSize: 17,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 1,
    },
    headerStatus: {
        fontSize: 13,
        fontWeight: '500',
    },
    headerAction: {
        padding: 8,
        marginLeft: 4,
    },
});

export default MessageHeader;