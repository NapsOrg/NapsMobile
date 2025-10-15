import React, {useEffect, useRef} from "react";
import {Animated, View, StyleSheet} from "react-native";
import globalStyles from "../../../styles";

const SkeletonPlaceholder = ({ width, height, borderRadius, style }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: false,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: false,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, []);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    borderRadius: borderRadius || 8,
                    backgroundColor: '#333',
                    opacity,
                },
                style,
            ]}
        />
    );
};

const UserDataViewSkeleton = () => {
    return (
        <View style={styles.container}>
            <View style={styles.userCredentials}>
                <View style={styles.avatarContainer}>
                    <SkeletonPlaceholder
                        width={120}
                        height={120}
                        borderRadius={60}
                    />
                </View>
                <SkeletonPlaceholder
                    width={200}
                    height={28}
                    borderRadius={6}
                    style={{ marginBottom: 8 }}
                />
                <SkeletonPlaceholder
                    width={120}
                    height={20}
                    borderRadius={4}
                />
            </View>

            <View style={styles.userInfoCard}>
                <View style={styles.userInfo}>
                    <View style={{ alignItems: 'center', marginBottom: 20 }}>
                        <SkeletonPlaceholder
                            width="80%"
                            height={16}
                            borderRadius={4}
                            style={{ marginBottom: 6 }}
                        />
                        <SkeletonPlaceholder
                            width="60%"
                            height={16}
                            borderRadius={4}
                        />
                    </View>

                    <View style={styles.userDetailsskeleton}>
                        <View style={styles.detailItemSkeleton}>
                            <SkeletonPlaceholder width={16} height={16} borderRadius={3} />
                            <SkeletonPlaceholder
                                width={80}
                                height={14}
                                borderRadius={3}
                                style={{ marginLeft: 8 }}
                            />
                        </View>
                        <View style={styles.separator} />
                        <View style={styles.detailItemSkeleton}>
                            <SkeletonPlaceholder width={16} height={16} borderRadius={3} />
                            <SkeletonPlaceholder
                                width={100}
                                height={14}
                                borderRadius={3}
                                style={{ marginLeft: 8 }}
                            />
                        </View>
                    </View>

                    <View style={styles.userStats}>
                        <View style={styles.statItem}>
                            <SkeletonPlaceholder
                                width={40}
                                height={24}
                                borderRadius={4}
                                style={{ marginBottom: 4 }}
                            />
                            <SkeletonPlaceholder width={60} height={12} borderRadius={3} />
                        </View>

                        <View style={styles.statDivider} />

                        <View style={styles.statItem}>
                            <SkeletonPlaceholder
                                width={40}
                                height={24}
                                borderRadius={4}
                                style={{ marginBottom: 4 }}
                            />
                            <SkeletonPlaceholder width={60} height={12} borderRadius={3} />
                        </View>

                        <View style={styles.statDivider} />

                        <View style={styles.statItem}>
                            <SkeletonPlaceholder
                                width={40}
                                height={24}
                                borderRadius={4}
                                style={{ marginBottom: 4 }}
                            />
                            <SkeletonPlaceholder width={60} height={12} borderRadius={3} />
                        </View>
                    </View>
                </View>

                <View style={styles.buttons}>
                    <SkeletonPlaceholder
                        width="48%"
                        height={48}
                        borderRadius={12}
                    />
                    <SkeletonPlaceholder
                        width="48%"
                        height={48}
                        borderRadius={12}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        marginTop: 20,
        paddingHorizontal: 24,
        width: "100%",
        position: "relative",
    },
    userCredentials: {
        alignItems: "center",
        marginBottom: 24,
        zIndex: 1,
    },
    avatarContainer: {
        position: "relative",
        marginBottom: 16,
    },
    userInfoCard: {
        width: "100%",
        zIndex: 1,
    },
    userInfo: {
        marginBottom: 24,
    },
    userDetailsskeleton: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
        backgroundColor: globalStyles.main.inputBackgroundColor,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    detailItemSkeleton: {
        flexDirection: "row",
        alignItems: "center",
    },
    separator: {
        width: 1,
        height: 16,
        backgroundColor: "#444",
        marginHorizontal: 16,
    },
    userStats: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        gap: 5,
    },
    statItem: {
        alignItems: "center",
        flex: 1,
    },
    statDivider: {
        width: 1,
        height: 32,
        backgroundColor: globalStyles.main.inputBackgroundColor,
    },
    buttons: {
        flexDirection: "row",
        gap: 12,
    },
});

export default UserDataViewSkeleton;