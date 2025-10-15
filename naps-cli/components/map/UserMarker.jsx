/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import { Animated, Easing, View, StyleSheet } from "react-native";
import { Marker } from "react-native-maps";
import React, { useRef, useEffect } from "react";
import globalStyles from "../../styles";

const UserMarker = ({ location }) => {
    const pulse = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulse, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true
                }),
            ])
        ).start();
    }, [pulse]);

    return (
        <Marker coordinate={location}>
            <View style={styles.markerContainer}>
                <Animated.View
                    style={[
                        styles.pulseCircle,
                        {
                            transform: [
                                {
                                    scale: pulse.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [1, 2.5]
                                    })
                                },
                            ],
                            opacity: pulse.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.6, 0]
                            }),
                        },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.pulseCircle,
                        {
                            transform: [
                                {
                                    scale: pulse.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [1, 2]
                                    })
                                },
                            ],
                            opacity: pulse.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [0, 0.4, 0]
                            }),
                        },
                    ]}
                />

                <View style={styles.markerDot}>
                    <View style={styles.markerInner} />
                </View>
            </View>
        </Marker>
    );
};

const styles = StyleSheet.create({
    markerContainer: {
        alignItems: "center",
        justifyContent: "center",
        width: 30,
        height: 30,
    },
    markerDot: {
        width: 15,
        height: 15,
        backgroundColor: "#9561FB",
        borderRadius: 10,
        borderWidth: 3,
        borderColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#9561FB",
        shadowOpacity: 0.6,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
        elevation: 8,
    },
    markerInner: {
        width: 6,
        height: 6,
        backgroundColor: globalStyles.main.accent,
        borderRadius: 3,
    },
    pulseCircle: {
        position: "absolute",
        width: 15,
        height: 15,
        borderRadius: 10,
        backgroundColor: "#9561FB",
    },
});

export default UserMarker;