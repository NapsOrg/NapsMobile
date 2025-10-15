/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import React, { useEffect, useRef } from "react";
import {
    View,
    StyleSheet,
    Animated,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import globalStyles from "../../../styles";

const PostsListSkeleton = ({ count = 3 }) => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const shimmerOpacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    const SkeletonBox = ({ width, height, style }) => (
        <Animated.View
            style={[
                styles.skeletonBox,
                { width, height, opacity: shimmerOpacity },
                style,
            ]}
        />
    );

    const renderSkeletonPost = (index) => (
        <View key={`skeleton-${index}`} style={styles.postCard}>
            <LinearGradient
                colors={['rgba(155, 117, 255, 0.08)', 'rgba(255, 68, 88, 0.04)', 'rgba(155, 117, 255, 0.02)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBorder}
            >
                <View style={styles.postContent}>
                    {/* UserHeader */}
                    <View style={styles.postHeader}>
                        {/* Avatar */}
                        <View style={styles.avatarContainer}>
                            <LinearGradient
                                colors={['#9B75FF', '#FF4458', '#A283FF']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.avatarGradient}
                            >
                                <View style={styles.avatarInner}>
                                    <SkeletonBox width={44} height={44} style={styles.avatarSkeleton} />
                                </View>
                            </LinearGradient>
                        </View>

                        <View style={styles.postHeaderText}>
                            <SkeletonBox width={120} height={16} style={{ marginBottom: 6 }} />
                            <SkeletonBox width={60} height={12} />
                        </View>

                        <SkeletonBox width={20} height={20} style={{ borderRadius: 4 }} />
                    </View>

                    <View style={styles.captionContainer}>
                        <SkeletonBox width="100%" height={14} style={{ marginBottom: 8 }} />
                        <SkeletonBox width="85%" height={14} style={{ marginBottom: 8 }} />
                        {index % 2 === 0 && (
                            <SkeletonBox width="60%" height={14} style={{ marginBottom: 12 }} />
                        )}
                    </View>

                    {index % 3 !== 2 && (
                        <View style={styles.mediaContainer}>
                            <SkeletonBox
                                width="100%"
                                height={280}
                                style={{ borderRadius: 16 }}
                            />
                        </View>
                    )}

                    <View style={styles.postFooter}>
                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <SkeletonBox width={28} height={28} style={{ borderRadius: 14 }} />
                                <SkeletonBox width={30} height={14} />
                            </View>

                            <View style={styles.statDivider} />

                            <View style={styles.statItem}>
                                <SkeletonBox width={28} height={28} style={{ borderRadius: 14 }} />
                                <SkeletonBox width={30} height={14} />
                            </View>
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );

    return (
        <View style={styles.container}>
            {Array.from({ length: count }).map((_, index) => renderSkeletonPost(index))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingBottom: 20,
    },
    postCard: {
        width: '100%',
        marginBottom: 16,
    },
    gradientBorder: {
        borderRadius: 20,
        padding: 1.5,
    },
    postContent: {
        backgroundColor: globalStyles.dark.postBackgroundColor,
        borderRadius: 19,
        padding: 16,
    },
    postHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    avatarContainer: {
        marginRight: 12,
    },
    avatarGradient: {
        width: 48,
        height: 48,
        borderRadius: 24,
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInner: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarSkeleton: {
        borderRadius: 22,
    },
    postHeaderText: {
        flex: 1,
    },
    captionContainer: {
        marginBottom: 12,
    },
    mediaContainer: {
        marginBottom: 12,
    },
    postFooter: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: 'center',
    },
    statsContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.04)",
        borderRadius: 24,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.08)",
    },
    statItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    statDivider: {
        width: 1,
        height: 20,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        marginHorizontal: 12,
    },
    skeletonBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 8,
    },
});

export default PostsListSkeleton;