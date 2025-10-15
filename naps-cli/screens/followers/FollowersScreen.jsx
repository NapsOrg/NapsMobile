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
    Image,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    TextInput,
    Animated,
    ActivityIndicator,
    RefreshControl,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";

import search_icon from "../../assets/icons/search.png";
import trash_icon from "../../assets/icons/trash.png";
import left_arrow_icon from "../../assets/icons/angle-left.png";

import UserFollowCard from "../../components/user/follow/UserFollowCard";
import FollowService from "../../services/FollowService";
import UserService from "../../services/UserService.js";
import globalStyles from "../../styles";

const FollowersScreen = ({ route }) => {
    const { user_id, username, initialTab = "Followers" } = route?.params || {};

    const [activeTab, setActiveTab] = useState(initialTab);
    const [searchQuery, setSearchQuery] = useState("");
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [isMyProfile, setIsMyProfile] = useState(false);

    const navigation = useNavigation();
    const followService = new FollowService();
    const userService = new UserService();

    const slideAnim = useRef(new Animated.Value(initialTab === "Followers" ? 0 : 1)).current;
    const searchInputRef = useRef(null);

    useEffect(() => {
        initializeScreen();
    }, [user_id]);

    useEffect(() => {
        filterData();
    }, [searchQuery, activeTab, followers, following]);

    const initializeScreen = async () => {
        try {
            const response = await userService.getMyProfile();
            const isMe = !user_id || user_id === null || user_id === undefined || response?.data?.user_id === user_id;
            setIsMyProfile(isMe);

            await fetchData(isMe);
        } catch (error) {
            console.error("Error initializing screen:", error);
            await fetchData(false);
        }
    };

    const fetchData = async (isMe = isMyProfile) => {
        try {
            setIsLoading(true);
            setError(null);

            let followersResponse, followingResponse;

            if (isMe) {
                [followersResponse, followingResponse] = await Promise.all([
                    followService.getMyFollowers(),
                    followService.getMyFollowing()
                ]);
            } else {
                [followersResponse, followingResponse] = await Promise.all([
                    followService.getFollowers(user_id),
                    followService.getFollowing(user_id)
                ]);
            }

            setFollowers(followersResponse.followers || []);
            setFollowing(followingResponse.following || []);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError(err.message || "Failed to load data");
            setFollowers([]);
            setFollowing([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData(isMyProfile);
        setRefreshing(false);
    }, [isMyProfile]);

    const filterData = () => {
        const dataSource = activeTab === "Followers" ? followers : following;

        if (!searchQuery.trim()) {
            setFilteredData(dataSource);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = dataSource.filter(user => {
            const username = user.username?.toLowerCase() || "";
            const firstName = user.first_name?.toLowerCase() || "";
            const lastName = user.last_name?.toLowerCase() || "";
            const fullName = `${firstName} ${lastName}`.trim();

            return username.includes(query) ||
                firstName.includes(query) ||
                lastName.includes(query) ||
                fullName.includes(query);
        });

        setFilteredData(filtered);
    };

    const handleTabSwitch = (tab) => {
        if (tab === activeTab) return;

        setActiveTab(tab);
        setSearchQuery("");

        Animated.spring(slideAnim, {
            toValue: tab === "Followers" ? 0 : 1,
            useNativeDriver: true,
            friction: 8,
            tension: 80,
        }).start();
    };

    const clearSearch = () => {
        setSearchQuery("");
        searchInputRef.current?.blur();
    };

    const handleUserPress = (userId) => {
        navigation.navigate("UserHome", { userId });
    };

    const handleFollowStateChange = (userId, newState) => {
        const updateList = (list) =>
            list.map(u => u.user_id === userId ? { ...u, is_following: newState } : u);

        setFollowers(updateList(followers));
        setFollowing(updateList(following));
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Image source={left_arrow_icon} style={styles.backButtonText} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>@{username || "User"}</Text>
            <View style={styles.headerSpacer} />
        </View>
    );

    const renderSearchBar = () => (
        <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
                <Image source={search_icon} style={styles.searchIcon} />
                <TextInput
                    ref={searchInputRef}
                    style={styles.searchInput}
                    placeholder="Search..."
                    placeholderTextColor={globalStyles.dark.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity
                        onPress={clearSearch}
                        style={styles.clearButton}
                    >
                        <Image source={trash_icon} style={styles.clearIcon} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const TAB_WIDTH = useRef(0);

    const renderTabs = () => {
        const slideInterpolate = slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, TAB_WIDTH.current || 0],
        });

        return (
            <View style={styles.tabContainer}>
                <View
                    style={styles.tabWrapper}
                    onLayout={(e) => {
                        const width = e.nativeEvent.layout.width;
                        TAB_WIDTH.current = width / 2;
                    }}
                >
                    <Animated.View
                        style={[
                            styles.tabIndicator,
                            {
                                width: TAB_WIDTH.current - 8, // отступы
                                transform: [{ translateX: slideInterpolate }],
                            },
                        ]}
                    />
                    <TouchableOpacity
                        style={styles.tab}
                        onPress={() => handleTabSwitch("Followers")}
                    >
                        <Text style={[styles.tabText, activeTab === "Followers" && styles.activeTabText]}>
                            Followers
                        </Text>
                        <Text style={[styles.tabCount, activeTab === "Followers" && styles.activeTabCount]}>
                            {followers.length}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.tab}
                        onPress={() => handleTabSwitch("Following")}
                    >
                        <Text style={[styles.tabText, activeTab === "Following" && styles.activeTabText]}>
                            Following
                        </Text>
                        <Text style={[styles.tabCount, activeTab === "Following" && styles.activeTabCount]}>
                            {following.length}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
                {searchQuery
                    ? "No users found"
                    : `No ${activeTab.toLowerCase()} yet`
                }
            </Text>
        </View>
    );

    const renderItem = ({ item }) => (
        console.log(item.fullName),
        <UserFollowCard
            user_id={item.user_id}
            username={item.username}
            full_name={item.full_name}
            avatar_uri={item.avatar_url}
            have_stories={item.have_stories}
            is_following={item.is_following}
            onPress={() => handleUserPress(item.user_id)}
            onFollowStateChange={handleFollowStateChange}
        />
    );

    if (isLoading && !refreshing) {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                {renderHeader()}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={globalStyles.main.accent} />
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                {renderHeader()}
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => fetchData(isMyProfile)}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {renderHeader()}
            {renderSearchBar()}
            {renderTabs()}

            <FlatList
                data={filteredData}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.user_id}-${index}`}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={globalStyles.main.accent}
                        colors={[globalStyles.main.accent]}
                    />
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        height: 24,
        width: 24,
        tintColor: globalStyles.dark.textSecondary,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: globalStyles.dark.textPrimary,
    },
    headerSpacer: {
        width: 44,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    searchIcon: {
        width: 20,
        height: 20,
        tintColor: globalStyles.dark.textSecondary,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: globalStyles.dark.textPrimary,
        padding: 0,
    },
    clearButton: {
        padding: 4,
    },
    clearIcon: {
        width: 18,
        height: 18,
        tintColor: globalStyles.dark.textSecondary,
    },
    tabContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    tabWrapper: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 4,
        position: 'relative',
    },
    tabIndicator: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        left: 4,
        backgroundColor: globalStyles.main.accent,
        borderRadius: 10,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        gap: 6,
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
        color: globalStyles.dark.textSecondary,
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    tabCount: {
        fontSize: 13,
        fontWeight: '600',
        color: globalStyles.dark.textSecondary,
    },
    activeTabCount: {
        color: 'rgba(255, 255, 255, 0.8)',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    errorText: {
        fontSize: 16,
        color: '#FF4458',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: globalStyles.main.accent,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    emptyContainer: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: globalStyles.dark.textSecondary,
        textAlign: 'center',
    },
});

export default FollowersScreen;