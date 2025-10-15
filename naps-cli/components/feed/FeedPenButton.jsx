/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import { TouchableOpacity, Image, StyleSheet } from "react-native";
import pen_icon from "../../assets/icons/pen.png";
import globalStyles from "../../styles";

const FeedPenButton = ({ onPress, size = 60 }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.penBtn, { width: size, height: size, borderRadius: size / 2 }]}
        >
            <Image
                source={pen_icon}
                style={[styles.penIcon, { width: size / 2.5, height: size / 2.5 }]}
            />
        </TouchableOpacity>
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

export default FeedPenButton;
