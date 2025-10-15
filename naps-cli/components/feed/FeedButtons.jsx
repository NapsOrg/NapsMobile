/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import React from "react";
import { View, StyleSheet } from "react-native";

import FeedPenButton from "./FeedPenButton";
import FeedMediaButton from "./FeedMediaButton";

const FeedButtons = ({ onPenPress, isKeyboardOpen }) => {
    return (
        <View style={[styles.container, { marginBottom: isKeyboardOpen ? 70 : 0 }]}>
            <FeedMediaButton size={45} />
            <View style={{ height: 12 }} />
            <FeedPenButton
                onPress={onPenPress}
                size={60}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 80,
        right: 20,
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        zIndex: 100,
    },
});

export default FeedButtons;