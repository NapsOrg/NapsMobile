/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import React, { useState } from "react";
import {
    View,
    TextInput,
    Image,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Keyboard,
} from "react-native";

import globalStyles from "../../styles";

import search_icon from "../../assets/icons/search.png";
import trash_icon from "../../assets/icons/trash.png";

const MapHeader = ({ onSearch }) => {
    const [value, setValue] = useState("");
    const [focused, setFocused] = useState(false);

    const handleSearch = () => {
        if (value.trim()) {
            onSearch(value);
            Keyboard.dismiss();
        }
    };

    const handleClear = () => {
        setValue("");
    };

    return (
        <View style={[styles.container, focused && styles.containerFocused]}>
            <View style={styles.searchIconContainer}>
                <Image source={search_icon} style={styles.iconSearch} />
            </View>

            <TextInput
                style={styles.input}
                placeholder="Search cities, places..."
                placeholderTextColor="#999"
                value={value}
                onChangeText={setValue}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
            />

            {value.length > 0 && (
                <TouchableOpacity
                    onPress={handleClear}
                    style={styles.clearButton}
                    activeOpacity={0.7}
                >
                    <Image source={trash_icon} style={styles.iconTrash} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: globalStyles.main.inputBackgroundColor,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === "ios" ? 12 : 10,
        marginHorizontal: 20,
        marginTop: 16,
        shadowColor: "#9561FB",
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
        borderWidth: 2,
        borderColor: "transparent",
    },
    containerFocused: {
        borderColor: globalStyles.main.accent,
        shadowOpacity: 0.25,
        shadowRadius: 16,
        color: "#222",
        backgroundColor: globalStyles.main.inputBackgroundColor,
    },
    searchIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: globalStyles.main.inputBackgroundColor,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    iconSearch: {
        width: 20,
        height: 20,
        tintColor: "#9561FB",
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#ccc",
        paddingVertical: 4,
        fontWeight: "500",
    },
    clearButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: globalStyles.main.inputBackgroundColor,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 8,
    },
    iconTrash: {
        width: 18,
        height: 18,
        tintColor: "#9561FB",
    },
});

export default MapHeader;