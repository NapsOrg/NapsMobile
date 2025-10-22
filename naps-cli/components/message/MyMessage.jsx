/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import globalStyles from "../../styles";

const MyMessage = ({ message, timestamp, isRead, isDelivered, isEdited, isSending }) => {
    const formatTime = (time) => {
        const date = new Date(time);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const getStatusIcon = () => {
        if (isSending) {
            return <ActivityIndicator size={12} color="rgba(255,255,255,0.6)" />;
        }
        if (isRead) {
            return <Ionicons name="checkmark-done" size={14} color="#4CD964" />;
        }
        if (isDelivered) {
            return <Ionicons name="checkmark-done" size={14} color="rgba(255,255,255,0.6)" />;
        }
        return <Ionicons name="checkmark" size={14} color="rgba(255,255,255,0.6)" />;
    };

    return (
        <View style={styles.container}>
            <View style={styles.messageBubble}>
                <Text style={styles.messageText}>{message}</Text>
                <View style={styles.footer}>
                    {isEdited && (
                        <Text style={styles.editedText}>edited</Text>
                    )}
                    <Text style={styles.timeText}>
                        {formatTime(timestamp)}
                    </Text>
                    <View style={styles.statusIcon}>
                        {getStatusIcon()}
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'flex-end',
        marginVertical: 3,
        paddingHorizontal: 16,
    },
    messageBubble: {
        backgroundColor: '#9561FB',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 18,
        borderBottomRightRadius: 4,
        maxWidth: '75%',
        shadowColor: '#9561FB',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 3,
    },
    messageText: {
        color: '#FFFFFF',
        fontSize: 15,
        lineHeight: 20,
        marginBottom: 2,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
        gap: 4,
    },
    editedText: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.5)',
        fontStyle: 'italic',
    },
    timeText: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.6)',
    },
    statusIcon: {
        marginLeft: 2,
        width: 14,
        height: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MyMessage;