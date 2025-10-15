/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import { Text, StyleSheet } from "react-native";
import React from "react";

import { SafeAreaView } from "react-native-safe-area-context";
import DefaultPageHeader from "../../components/header/DefaultPageHeader";

import globalStyles from "../../styles";

const SettingsScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <DefaultPageHeader title="Settings" />

            <Text style={styles.text}>Settings - will implemented soon</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: globalStyles.dark.backgroundColor,
    },
    text: {
        color: globalStyles.dark.textPrimary,
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 20,
    }
});

export default SettingsScreen;