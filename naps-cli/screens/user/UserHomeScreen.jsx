/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";

import UserHeader from "../../components/header/UserHeader.jsx";
import Navbar from "../../components/navbar/Navbar";
import UserDataView from "../../components/user/data/UserDataView";
import UserMediaView from "../../components/user/media/UserMediaView";

import FollowService from "../../services/FollowService";
import UserService from "../../services/UserService.js";
import globalStyles from "../../styles";

const UserHomeScreen = ({ route }) => {
    const { userId } = route?.params || {};
    const [user, setUser] = useState(null);
    const [userFetchingProblems, setUserFetchingProblems] = useState(false);
    const [userFetchingProblemsMessage, setUserFetchingProblemsMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoadingFollow, setIsLoadingFollow] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [mediaViewKey, setMediaViewKey] = useState(0);

    const followService = new FollowService();
    const userService = new UserService();
    const navigation = useNavigation();

    const fetchMe = async (isRefresh = false) => {
        try {
            if (!isRefresh) setIsLoading(true);
            setUserFetchingProblems(false);

            const response = await userService.getMyProfile();

            if (response.status === 200 && response.data) {
                setUser(response.data);
                setIsFollowing(false);
            } else {
                setUserFetchingProblems(true);
                setUserFetchingProblemsMessage('Invalid response from server');
            }
        } catch (error) {
            setUserFetchingProblems(true);
            setUserFetchingProblemsMessage(
                error?.response?.data?.detail ||
                error?.message ||
                'Failed to fetch user data'
            );
            console.error('Error fetching user data:', error);
        } finally {
            if (!isRefresh) setIsLoading(false);
        }
    };

    const fetchUser = async (userId, isRefresh = false) => {
        if (userId === null || userId === undefined || userId < 0) {
            console.warn('Invalid user ID:', userId);
            setUserFetchingProblems(true);
            setUserFetchingProblemsMessage('Invalid user ID');
            return;
        }

        try {
            if (!isRefresh) setIsLoading(true);
            setUserFetchingProblems(false);

            const response = await userService.getUserById(userId);

            if (response.status === 200 && response.data) {
                setUser(response.data);
                setIsFollowing(response.data.is_following || false);
            } else {
                setUserFetchingProblems(true);
                setUserFetchingProblemsMessage('Invalid response from server');
            }
        } catch (error) {
            setUserFetchingProblems(true);
            setUserFetchingProblemsMessage(
                error?.response?.data?.detail ||
                error?.message ||
                'Failed to fetch user data'
            );
            console.error('Error fetching user data:', error);
        } finally {
            if (!isRefresh) setIsLoading(false);
        }
    };

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);

        const isMe = !userId || userId === null || userId === undefined;

        try {
            if (isMe) {
                await fetchMe(true);
            } else {
                await fetchUser(userId, true);
            }

            setMediaViewKey(prev => prev + 1);
        } catch (error) {
            console.error('Error refreshing:', error);
        } finally {
            setTimeout(() => {
                setRefreshing(false);
            }, 300);
        }
    }, [userId]);

    const handleFollowToggle = async () => {
        if (!user) return;

        try {
            setIsLoadingFollow(true);

            if (isFollowing) {
                await followService.unfollowUser(user.user_id);
                setIsFollowing(false);
                setUser(prev => ({
                    ...prev,
                    followers: prev.followers - 1
                }));
            } else {
                await followService.followUser(user.user_id);
                setIsFollowing(true);
                setUser(prev => ({
                    ...prev,
                    followers: prev.followers + 1
                }));
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
        } finally {
            setIsLoadingFollow(false);
        }
    };

    const handleMessage = () => {
        if (!user) return;
        navigation.navigate("Chat", {
            userId: user.user_id,
            username: user.username
        });
    };

    const handleEdit = () => {
        navigation.navigate("UpdateUser");
    };

    const handleSettings = () => {
        navigation.navigate("Settings");
    };

    const handleCreateMedia = () => {
        navigation.navigate("CreatePost");
    };

    const formatRegisterDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
        });
    };

    useEffect(() => {
        const isMe = !userId || userId === null || userId === undefined;
        if (isMe) {
            fetchMe();
        } else {
            fetchUser(userId);
        }
    }, [userId]);

    const isMyProfile = !userId || userId === null || userId === undefined;

    if (userFetchingProblems && !refreshing) {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                <View style={styles.innerContainer}>
                    <UserHeader user_name={user?.username} />
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>
                            {userFetchingProblemsMessage || 'Failed to load user profile'}
                        </Text>
                    </View>
                </View>
                <Navbar />
            </SafeAreaView>
        );
    }

    const handleAvatarUpdate = (newAvatarUrl) => {
        console.log('Avatar updated:', newAvatarUrl);
        setUser(prev => ({
            ...prev,
            avatar_url: newAvatarUrl
        }));
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.innerContainer}>
                <UserHeader user_name={user?.username} />

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={globalStyles.main.accent}
                            colors={[globalStyles.main.accent]}
                            progressBackgroundColor={globalStyles.dark.backgroundColor}
                            title="Pull to refresh"
                            titleColor={globalStyles.dark.textSecondary}
                        />
                    }
                >
                    <UserDataView
                        username={user?.username}
                        full_name={user?.full_name}
                        bio={user?.bio}
                        city={user?.city}
                        followers={user?.followers || 0}
                        following={user?.following || 0}
                        reactions={user?.likes || 0}
                        user_status={user?.online_status}
                        register_date={formatRegisterDate(user?.register_date)}
                        is_my_prof={isMyProfile}
                        user_id={user?.user_id}
                        avatar_url={user?.avatar_url}
                        isFollowing={isFollowing}
                        isLoadingFollow={isLoadingFollow}
                        loading={isLoading}
                        onFollowToggle={handleFollowToggle}
                        onMessage={handleMessage}
                        onEdit={handleEdit}
                        onSettings={handleSettings}
                        onAvatarUpdate={handleAvatarUpdate}
                    />

                    <UserMediaView
                        key={mediaViewKey}
                        userId={user?.user_id}
                        onCreateMedia={handleCreateMedia}
                        isMyProfile={isMyProfile}
                        userName={user?.username}
                    />
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
        position: 'relative',
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingBottom: 100,
    },
    navbarWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: globalStyles.dark.backgroundColor,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        paddingBottom: 0,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        marginBottom: 80,
    },
    errorText: {
        color: '#FF4458',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '500',
    },
});

export default UserHomeScreen;