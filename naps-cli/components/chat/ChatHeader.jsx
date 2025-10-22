/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import {View, Text, StyleSheet, Pressable} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {Ionicons} from "@expo/vector-icons";
import globalStyles from "../../styles";
import React from "react";

const ChatHeader = ({ title  }) => {
    const navigation = useNavigation();
    const handleCreateChat = () => {
        navigation.navigate('CreateChat');
    };

    return (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Pressable
                onPress={handleCreateChat}
                style={styles.composeButton}
            >
                <Ionicons
                    name="add-circle"
                    size={28}
                    color={globalStyles.main.accent}
                />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: '700',
        color: globalStyles.dark.textPrimary,
        letterSpacing: 0.3,
    },
    composeButton: {
        padding: 4,
    },
});

export default ChatHeader;