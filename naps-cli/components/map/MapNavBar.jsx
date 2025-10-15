/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import React from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

import my_geolocation_icon from "../../assets/icons/my-geo.png";
import plus_icon from "../../assets/icons/plus-small.png";
import sun_icon from "../../assets/icons/sun.png";
import moon_icon from "../../assets/icons/moon.png";

const MapNavBar = ({ onLocationPress, onPlusPress, darkMode, onThemeToggle }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                onPress={onLocationPress}
                activeOpacity={0.7}
            >
                <Image source={my_geolocation_icon} style={styles.icon} />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, styles.buttonCenter]}
                onPress={onPlusPress}
                activeOpacity={0.7}
            >
                <Image source={plus_icon} style={styles.iconCenter} />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={onThemeToggle}
                activeOpacity={0.7}
            >
                <Image
                    source={darkMode ? sun_icon : moon_icon}
                    style={styles.icon}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        gap: 20,
    },
    button: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#9561FB',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#9561FB',
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
    },
    buttonCenter: {
        width: 64,
        height: 64,
        borderRadius: 32,
        shadowOpacity: 0.5,
        shadowRadius: 16,
        transform: [{ scale: 1.05 }],
    },
    icon: {
        width: 24,
        height: 24,
        tintColor: '#fff',
    },
    iconCenter: {
        width: 28,
        height: 28,
        tintColor: '#fff',
    },
});

export default MapNavBar;