/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import { View, Text, StyleSheet } from "react-native";
import globalStyles from "../../styles";

const OtherMessage = ({ message, timestamp, isEdited }) => {
    const formatTime = (time) => {
        const date = new Date(time);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
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
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'flex-start',
        marginVertical: 3,
        paddingHorizontal: 16,
    },
    messageBubble: {
        backgroundColor: '#2C2C2E',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 18,
        borderBottomLeftRadius: 4,
        maxWidth: '75%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
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
        color: 'rgba(255,255,255,0.4)',
        fontStyle: 'italic',
    },
    timeText: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.5)',
    },
});

export default OtherMessage;