/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import { TouchableOpacity, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import arrow_left_icon from '../../assets/icons/angle-left.png';

const BackButton = () => {

    const navigation = useNavigation();
    return (
      <TouchableOpacity
        style={styles.backFloatingButton}
        activeOpacity={0.7}
        onPress={() => navigation.goBack()}
      >
        <Image source={arrow_left_icon} style={styles.backIcon} />
      </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    backFloatingButton: {
        position: "absolute",
        top: 20,
        left: 20,
        padding: 12,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.05)",
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 6,
        marginTop: 65,
        zIndex: 10,
    },
    backIcon: {
        width: 28,
        height: 28,
        tintColor: "#fff",
        resizeMode: "contain",
  },
})

export default BackButton;