/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import { useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  Animated,
  Platform,
  Pressable
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import default_user_logo from '../../../assets/logo/defaul_user_logo.jpg';
import globalStyles from "../../../styles";

const SkeletonPlaceholder = ({ width, height, borderRadius, style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const shimmerValue = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const opacityAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: false,
        }),
      ])
    );

    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      })
    );

    opacityAnimation.start();
    shimmerAnimation.start();

    return () => {
      opacityAnimation.stop();
      shimmerAnimation.stop();
    };
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  const translateX = shimmerValue.interpolate({
    inputRange: [-1, 1],
    outputRange: [-width, width],
  });

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: borderRadius || 8,
          backgroundColor: '#2a2a2a',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: '#333',
            opacity,
          }
        ]}
      />
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            transform: [{ translateX }],
            width: width * 0.3,
          }
        ]}
      />
    </View>
  );
};

const UserSearchCardSkeleton = ({ style }) => {
  return (
    <Animated.View 
      style={[styles.userCard, styles.skeletonCard, style]}
      entering={Platform.OS === 'ios' ? undefined : 'fadeIn'}
    >
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <SkeletonPlaceholder 
            width={52} 
            height={52} 
            borderRadius={26}
          />
        </View>
        
        <View style={styles.userData}>
          <View style={styles.userInitials}>
            <SkeletonPlaceholder 
              width={Math.random() * 40 + 120} 
              height={18} 
              borderRadius={4}
              style={{ marginBottom: 8 }}
            />
            <SkeletonPlaceholder 
              width={Math.random() * 20 + 90} 
              height={14} 
              borderRadius={3}
            />
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const OnlineIndicator = ({ isOnline, size = 14 }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isOnline) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isOnline]);

  if (!isOnline) return null;

  return (
    <Animated.View
      style={[
        styles.onlineIndicator,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [{ scale: pulseAnim }],
        }
      ]}
    />
  );
};

const UserSearchCard = ({ 
    user_id, 
    full_name,
    username, 
    avatar_uri,
    have_stories = false,
    is_online = false,
    bio,
    followers_count,
    loading = false,
    style,
    onPress,
    showBio = false,
    compact = false
}) => {
    const navigation = useNavigation();
    const scaleValue = useRef(new Animated.Value(1)).current;
    
    const avatar_logo = avatar_uri ? { uri: avatar_uri } : default_user_logo;

    const displayName = full_name;

    if (loading) {
        return <UserSearchCardSkeleton style={style} />;
    }

    const animatePress = () => {
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 0.98,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
    };

    const handleUserPress = () => {
        animatePress();
        
        if (onPress) {
            onPress(user_id);
        } else {
            navigation.navigate("UserProfile", { userId: user_id });
        }
    };

    const formatFollowersCount = (count) => {
        if (!count) return '';
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M followers`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K followers`;
        return `${count} followers`;
    };

    return (
        <Animated.View 
          style={[
            styles.userCard, 
            compact && styles.compactCard,
            style,
            { transform: [{ scale: scaleValue }] }
          ]}
        >
            <Pressable 
                style={styles.userInfo}
                onPress={handleUserPress}
                android_ripple={{ 
                  color: globalStyles.main.accent + '20',
                  borderless: false,
                  radius: 200
                }}
            >
                <View style={styles.avatarContainer}>
                    <View style={[
                      styles.avatarWrapper,
                      have_stories && styles.storyBorder,
                      compact && styles.compactAvatarWrapper
                    ]}>
                        <Image source={avatar_logo} style={[
                          styles.userLogo,
                          compact && styles.compactAvatar
                        ]} />
                    </View>
                    <OnlineIndicator 
                      isOnline={is_online} 
                      size={compact ? 12 : 14}
                    />
                </View>
                
                <View style={styles.userData}>
                    <View style={styles.userInitials}>
                        <Text style={[
                          styles.initials,
                          compact && styles.compactInitials
                        ]} numberOfLines={1}>
                            {displayName}
                        </Text>
                        <View style={styles.userMetaContainer}>
                            <Text style={[
                              styles.userName,
                              compact && styles.compactUserName
                            ]} numberOfLines={1}>
                                @{username || "undefined"}
                            </Text>
                            {followers_count > 0 && (
                                <Text style={styles.followersCount}>
                                    • {formatFollowersCount(followers_count)}
                                </Text>
                            )}
                        </View>
                        {showBio && bio && (
                            <Text style={styles.bioText} numberOfLines={2}>
                                {bio}
                            </Text>
                        )}
                    </View>
                </View>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    userCard: {
        borderRadius: 15,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomColor: globalStyles.main.inputBackgroundColor,
        borderBottomWidth: 1,
        marginVertical: 4,
    },

    skeletonCard: {
        backgroundColor: '#1a1a1a',
        borderColor: '#2a2a2a',
        borderWidth: 1,
    },

    compactCard: {
        padding: 12,
        borderRadius: 12,
    },

    userInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },

    avatarContainer: {
        position: 'relative',
    },

    avatarWrapper: {
        borderRadius: 28,
        padding: 2,
    },

    compactAvatarWrapper: {
        borderRadius: 24,
        padding: 1.5,
    },

    storyBorder: {
        borderWidth: 1.5,
        borderColor: globalStyles.main.accent || '#7A4DE8',
        backgroundColor: 'transparent',
    },

    userLogo: {
        width: 52,
        height: 52,
        borderRadius: 26,
    },

    compactAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },

    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: globalStyles.dark.backgroundColor || '#000',
    },

    userData: {
        marginTop: 6,
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },

    userInitials: {
        flex: 1,
    },

    initials: {
        fontSize: 17,
        fontWeight: '700',
        color: globalStyles.dark.textPrimary || '#FFFFFF',
        marginBottom: 0,
        fontFamily: globalStyles.fonts?.bold || 'System',
        letterSpacing: -0.3,
    },

    compactInitials: {
        fontSize: 16,
    },

    userMetaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },

    userName: {
        fontSize: 14,
        color: globalStyles.dark.textSecondary || '#888',
        fontFamily: globalStyles.fonts?.medium || 'System',
        fontWeight: '500',
    },

    compactUserName: {
        fontSize: 13,
    },

    followersCount: {
        fontSize: 12,
        color: globalStyles.dark.textTertiary || '#666',
        fontFamily: globalStyles.fonts?.regular || 'System',
        marginLeft: 4,
    },

    bioText: {
        fontSize: 13,
        color: globalStyles.dark.textSecondary || '#999',
        marginTop: 4,
        lineHeight: 18,
        fontFamily: globalStyles.fonts?.regular || 'System',
    },
});

export default UserSearchCard;