/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import { View, TouchableOpacity, Image, StyleSheet, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import arrow_left_icon from "../../assets/icons/angle-left.png";

const DefaultPageHeader = ({ title }) => {
    const navigation = useNavigation();

    const goBack = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.header}>
            <View style={styles.leftSection}>
                <TouchableOpacity onPress={goBack} style={styles.backButton}>
                    <Image source={arrow_left_icon} style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
            </View>
            <View style={styles.headerRight} />
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        height: 60,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
    },
    leftSection: {
        flexDirection: "row",
        alignItems: "center",
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
    },
    backIcon: {
        width: 18,
        height: 18,
        resizeMode: "contain",
        tintColor: "#fff",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#fff",
        marginLeft: 35,
    },
    headerRight: {
        width: 35,
    },
});

export default DefaultPageHeader;
