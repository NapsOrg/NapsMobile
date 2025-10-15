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
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";

import search_icon from "../../assets/icons/search.png";
import trash_icon from "../../assets/icons/trash.png";
import left_arrow_icon from "../../assets/icons/angle-left.png";

import UserSearchCard from "../../components/user/search/UserSearchCard";
import UserSearchService from "../../services/UserSearchService";
import globalStyles from "../../styles";
import Navbar from "../../components/navbar/Navbar";

const UserSearchScreen = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigation = useNavigation();
    const userSearchService = new UserSearchService();
    const searchInputRef = useRef(null);

    useEffect(() => {
        if (searchQuery.trim()) {
            performSearch(searchQuery);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const performSearch = async (query) => {
        setIsLoading(true);
        setError(null);

        try {
            const results = await userSearchService.searchUsers(query, 50);
            setSearchResults(results || []);
        } catch (err) {
            console.error("Search error:", err);
            setError("Failed to load search results");
        } finally {
            setIsLoading(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery("");
        searchInputRef.current?.blur();
    };

    const handleUserPress = (userId) => {
        navigation.navigate("UserHome", { userId });
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Image source={left_arrow_icon} style={styles.backButtonIcon} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Search Users</Text>
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
                    placeholder="Search users..."
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

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
                {searchQuery ? "No users found" : "Start typing to search users"}
            </Text>
        </View>
    );

    const renderItem = ({ item }) => (
        <UserSearchCard
            user_id={item.user_id}
            username={item.username}
            full_name={item.full_name}
            avatar_uri={item.avatar_url}
            bio={item.bio}
            followers_count={item.followers_count}
            onPress={handleUserPress}
        />
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {renderHeader()}
            {renderSearchBar()}

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={globalStyles.main.accent} />
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => performSearch(searchQuery)}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={searchResults}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => `${item.user_id}-${index}`}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyState}
                />
            )}
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
    backButtonIcon: {
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

export default UserSearchScreen;
