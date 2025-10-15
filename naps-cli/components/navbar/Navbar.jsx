/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import React, { useState, useEffect } from "react";
import {
    Image,
    View,
    StyleSheet,
    TouchableOpacity,
    Platform,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import house_icon from "../../assets/icons/house-chimney.png";
import marker_icon from "../../assets/icons/marker.png";
import search_icon from "../../assets/icons/search.png";
import plus_icon from "../../assets/icons/more.png";
import default_user_logo from "../../assets/icons/profile-user.png";

const Navbar = ({ currentRoute }) => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets(); // безопасные отступы
    const [activeTab, setActiveTab] = useState("home");

    const routeToTabMap = {
        UserSearch: "search",
        UserHome: "profile",
        Followers: "profile",
        Feed: "home",
        Map: "map",
        CreatePost: "camera",
    };

    const navItems = [
        { id: "home", icon: house_icon, route: "Feed" },
        { id: "map", icon: marker_icon, route: "Map" },
        { id: "camera", icon: plus_icon, route: "CreatePost" },
        { id: "search", icon: search_icon, route: "UserSearch" },
        { id: "profile", icon: default_user_logo, route: "UserHome" },
    ];

    useEffect(() => {
        if (currentRoute && routeToTabMap[currentRoute]) {
            setActiveTab(routeToTabMap[currentRoute]);
        }
    }, [currentRoute]);

    const handleTabPress = (item) => {
        setActiveTab(item.id);
        if (item.route) navigation.navigate(item.route);
    };

    const renderNavItem = (item) => {
        const isActive = activeTab === item.id;
        return (
            <TouchableOpacity
                key={item.id}
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => handleTabPress(item)}
                activeOpacity={1}
            >
                <Image
                    source={item.icon}
                    style={[styles.icon, isActive && styles.iconActive]}
                />
                {isActive && <View style={styles.activeIndicatorMobile} />}
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom + 30 }]}>
            {navItems.map(renderNavItem)}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 70,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#333333",
        paddingTop: 40,
        backgroundColor: "#000",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
            },
            android: { elevation: 5 },
        }),
        zIndex: 1000,
    },
    navItem: {
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        width: 50,
        height: 50,
    },
    navItemActive: {
        backgroundColor: "#1a1a1a",
    },
    icon: {
        width: 24,
        height: 24,
        tintColor: "#666",
    },
    iconActive: {
        tintColor: "#fff",
    },
    activeIndicatorMobile: {
        position: "absolute",
        bottom: -2,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#9561FB",
    },
});

export default Navbar;
