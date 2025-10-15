/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Animated,
  Platform,
  Pressable
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import default_user_logo from '../../../assets/logo/defaul_user_logo.jpg';
import globalStyles from "../../../styles";
import FollowService from "../../../services/FollowService";

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

const UserFollowCardSkeleton = ({ style }) => {
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

      <SkeletonPlaceholder 
        width={88} 
        height={38} 
        borderRadius={12}
      />
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

const UserFollowCard = ({ 
    user_id, 
    full_name,
    username, 
    avatar_uri,
    have_stories = false,
    is_following,
    is_online = false,
    bio,
    followers_count,
    onFollowStateChange,
    loading = false,
    style,
    onPress,
    showBio = false,
    compact = false
}) => {
    const navigation = useNavigation();
    const [followLoading, setFollowLoading] = useState(false);
    const [error, setError] = useState(null);
    const scaleValue = useRef(new Animated.Value(1)).current;
    const followButtonScale = useRef(new Animated.Value(1)).current;
    
    const followService = new FollowService();
    const avatar_logo = avatar_uri ? { uri: avatar_uri } : default_user_logo;

    const displayName = full_name;

    const [isFollowing, setIsFollowing] = useState(!!is_following);

    if (loading) {
        return <UserFollowCardSkeleton style={style} />;
    }

    useEffect(() => {
        setIsFollowing(!!is_following);
    }, [is_following]);

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

    const animateFollowButton = () => {
        Animated.sequence([
          Animated.timing(followButtonScale, {
            toValue: 0.95,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(followButtonScale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
    };

    const handleFollowPress = async () => {
        if (followLoading) return;
        
        animateFollowButton();
        const previousState = isFollowing;

        try {
            setFollowLoading(true);
            setError(null);

            if (isFollowing) {
                await followService.unfollowUser(user_id);
                setIsFollowing(false);
            } else {
                await followService.followUser(user_id);
                setIsFollowing(true);
            }

            if (onFollowStateChange) {
                onFollowStateChange(user_id, !previousState);
            }
        } catch (err) {
            console.error('Error toggling follow state:', err);
            setError(err.message || 'Failed to update follow status');
            setIsFollowing(previousState);
        } finally {
            setFollowLoading(false);
        }
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

            <Animated.View style={{ transform: [{ scale: followButtonScale }] }}>
                <TouchableOpacity 
                    style={[
                        styles.followButton,
                        isFollowing && styles.followingButton,
                        followLoading && styles.followButtonLoading,
                        compact && styles.compactFollowButton
                    ]}
                    onPress={handleFollowPress}
                    disabled={followLoading}
                    activeOpacity={0.8}
                >
                    {followLoading ? (
                        <ActivityIndicator 
                            size={compact ? "small" : "small"} 
                            color={isFollowing ? globalStyles.main.accent : '#FFFFFF'} 
                        />
                    ) : (
                        <Text style={[
                            styles.followText,
                            isFollowing && styles.followingText,
                            compact && styles.compactFollowText
                        ]}>
                            {isFollowing ? "Following" : "Follow"}
                        </Text>
                    )}
                </TouchableOpacity>
            </Animated.View>
            
            {error && (
                <Animated.View 
                  style={styles.errorContainer}
                  entering={Platform.OS === 'ios' ? undefined : 'slideInUp'}
                >
                    <Text style={styles.errorText} numberOfLines={1}>
                        {error}
                    </Text>
                </Animated.View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    userCard: {
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomColor: globalStyles.main.inputBackgroundColor,
        borderBottomWidth: 1,
    },

    skeletonCard: {
        backgroundColor: '#1a1a1a',
        borderColor: '#2a2a2a',
    },

    compactCard: {
        padding: 12,
        borderRadius: 12,
    },

    userInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
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

    followButton: {
        backgroundColor: globalStyles.main.accent || '#7A4DE8',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        minWidth: 110,
        height: 38,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: globalStyles.main.accent || '#7A4DE8',
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },

    compactFollowButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        minWidth: 80,
        height: 34,
        borderRadius: 10,
    },

    followingButton: {
        color: "#FFF",
        borderColor: globalStyles.main.accent || '#7A4DE8',
    },

    followButtonLoading: {
        opacity: 0.7,
    },

    followText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },

    compactFollowText: {
        fontSize: 12,
    },

    followingText: {
        color: "#FFF",
    },

    errorContainer: {
        position: 'absolute',
        bottom: -25,
        right: 0,
        backgroundColor: globalStyles.colors?.error || '#FF4444',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },

    errorText: {
        fontSize: 11,
        color: '#FFFFFF',
        fontFamily: globalStyles.fonts?.medium || 'System',
        fontWeight: '500',
    },
});

export default UserFollowCard;