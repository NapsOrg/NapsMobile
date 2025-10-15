/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import { Pressable, Image, StyleSheet } from "react-native";
import { useState } from "react";
import camera_icon from "../../assets/icons/photo-camera-interface-symbol-for-button.png";
import microphone_icon from "../../assets/icons/microphone-black-shape.png";
import globalStyles from "../../styles";

const MediaButton = ({ onPress, size = 30 }) => {
    const [btnIcon, setBtnIcon] = useState(camera_icon);

    const handlePress = () => {
        setBtnIcon(btnIcon === camera_icon ? microphone_icon : camera_icon);
        onPress && onPress();
    }

    return (
        <Pressable
            onPress={handlePress}
            style={[styles.penBtn, { width: size, height: size, borderRadius: size / 2 }]}
        >
            <Image
                source={btnIcon}
                style={[styles.penIcon, { width: size / 2.5, height: size / 2.5 }]}
            />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    penBtn: {
        backgroundColor: globalStyles.main.accent,
        justifyContent: "center",
        alignItems: "center",
    },
    penIcon: {
        tintColor: "#fff",
        resizeMode: "contain",
    }
});

export default MediaButton;
