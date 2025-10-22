/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Image, Modal, Animated } from 'react-native';
import { Home, Bookmark, User, Settings, LogOut, Moon, Sun, Zap, Phone, Bell, Lock, HelpCircle, MessageSquare, X } from 'lucide-react-native';
import StorageService from '../services/StorageService';
import JwtTokenService from '../services/JwtTokenService';
import globalStyles from '../styles';

const CustomDrawerContent = ({ navigation, isDarkMode, setIsDarkMode }) => {
    const [userData, setUserData] = useState(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [selectedAccount, setSelectedAccount] = useState(0);
    const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [modalScale] = useState(new Animated.Value(0));

    useEffect(() => {
        const loadUserData = async () => {
            try {
                setIsLoadingUser(true);
                const data = await StorageService.getUserData();
                setUserData(data);
            } catch (error) {
                console.error('Failed to load user data:', error);
            } finally {
                setIsLoadingUser(false);
            }
        };

        const unsubscribe = navigation.addListener('drawerOpen', loadUserData);
        loadUserData();

        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        if (showLogoutModal) {
            Animated.spring(modalScale, {
                toValue: 1,
                tension: 80,
                friction: 10,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(modalScale, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [showLogoutModal]);

    const handleAccountSwitch = (index) => {
        setSelectedAccount(index);
        setShowAccountSwitcher(false);
    };

    const handleLogoutPress = () => {
        setShowLogoutModal(true);
    };

    const handleLogout = async () => {
        try {
            const jwtService = new JwtTokenService();
            await jwtService.removeToken();
            await StorageService.clearUserData();
            setShowLogoutModal(false);
            navigation.closeDrawer();
            navigation.navigate('Welcome');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const bgColor = isDarkMode ? '#000' : '#ffffff';
    const textColor = isDarkMode ? '#ffffff' : '#000000';
    const secondaryText = isDarkMode ? '#8e8e93' : '#8e8e93';
    const iconColor = isDarkMode ? '#ffffff' : '#000000';
    const accentColor = globalStyles.main.accent || '#9561FB';
    const separatorColor = isDarkMode ? '#2c2c2e' : '#e5e5ea';
    const cellBg = isDarkMode ? '#2c2c2e' : '#f2f2f7';

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: bgColor,
        },
        scrollView: {
            flex: 1,
        },
        header: {
            backgroundColor: isDarkMode ? '#000' : '#ffffff',
            paddingTop: 60,
            paddingBottom: 20,
            paddingHorizontal: 20,
        },
        userSection: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        avatar: {
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: accentColor,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
            overflow: 'hidden',
        },
        avatarImage: {
            width: '100%',
            height: '100%',
        },
        avatarText: {
            fontSize: 28,
        },
        userInfo: {
            flex: 1,
        },
        userName: {
            fontSize: 18,
            fontWeight: '600',
            color: textColor,
            marginBottom: 4,
        },
        userPhone: {
            fontSize: 15,
            color: secondaryText,
        },
        accountSwitcherButton: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 4,
            marginTop: 4,
        },
        accountSwitcherText: {
            fontSize: 15,
            color: accentColor,
            marginRight: 4,
        },
        accountsList: {
            backgroundColor: cellBg,
            borderRadius: 10,
            marginHorizontal: 20,
            marginTop: 8,
            marginBottom: 12,
            overflow: 'hidden',
        },
        accountItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 0.5,
            borderBottomColor: separatorColor,
        },
        accountItemLast: {
            borderBottomWidth: 0,
        },
        accountItemActive: {
            backgroundColor: isDarkMode ? '#3a3a3c' : '#e8e8ed',
        },
        accountAvatar: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: accentColor,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },
        accountAvatarText: {
            fontSize: 18,
        },
        accountInfo: {
            flex: 1,
        },
        accountName: {
            fontSize: 16,
            fontWeight: '500',
            color: textColor,
            marginBottom: 2,
        },
        accountHandle: {
            fontSize: 14,
            color: secondaryText,
        },
        addAccountText: {
            fontSize: 16,
            color: accentColor,
            fontWeight: '500',
        },
        menuSection: {
            borderRadius: 10,
            marginHorizontal: 20,
            marginBottom: 12,
            overflow: 'hidden',
        },
        menuItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 14,
            paddingHorizontal: 16,
            backgroundColor: 'transparent',
        },
        logoutSection: {
            backgroundColor: isDarkMode ? 'rgba(255, 59, 48, 0.15)' : 'rgba(255, 59, 48, 0.08)',
            borderRadius: 10,
            marginHorizontal: 20,
            marginBottom: 12,
            overflow: 'hidden',
        },
        logoutItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 14,
            paddingHorizontal: 16,
        },
        menuIcon: {
            width: 30,
            alignItems: 'center',
            marginRight: 14,
        },
        menuLabel: {
            fontSize: 16,
            color: textColor,
            flex: 1,
        },
        menuBadge: {
            backgroundColor: accentColor,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 10,
            minWidth: 20,
            alignItems: 'center',
        },
        menuBadgeText: {
            fontSize: 12,
            fontWeight: '700',
            color: '#ffffff',
        },
        nightModeSection: {
            backgroundColor: cellBg,
            borderRadius: 10,
            marginHorizontal: 20,
            marginBottom: 12,
            overflow: 'hidden',
        },
        nightModeItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 14,
            paddingHorizontal: 16,
        },
        nightModeToggle: {
            width: 51,
            height: 31,
            borderRadius: 16,
            backgroundColor: isDarkMode ? accentColor : '#e5e5ea',
            justifyContent: 'center',
            padding: 2,
        },
        nightModeKnob: {
            width: 27,
            height: 27,
            borderRadius: 13.5,
            backgroundColor: '#ffffff',
            alignSelf: isDarkMode ? 'flex-end' : 'flex-start',
        },
        featuresSection: {
            marginHorizontal: 20,
            marginBottom: 12,
        },
        featuresButton: {
            backgroundColor: accentColor,
            borderRadius: 10,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
        },
        featuresIcon: {
            marginRight: 14,
        },
        featuresText: {
            fontSize: 16,
            fontWeight: '600',
            color: '#ffffff',
            flex: 1,
        },
        footer: {
            paddingHorizontal: 20,
            paddingVertical: 20,
            alignItems: 'center',
        },
        footerText: {
            fontSize: 13,
            color: secondaryText,
        },
        version: {
            fontSize: 13,
            color: secondaryText,
            marginTop: 4,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 30,
        },
        modalContent: {
            backgroundColor: isDarkMode ? '#2c2c2e' : '#ffffff',
            borderRadius: 20,
            width: '100%',
            maxWidth: 340,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
        },
        modalHeader: {
            paddingTop: 28,
            paddingHorizontal: 24,
            paddingBottom: 8,
            alignItems: 'center',
        },
        modalIconCircle: {
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: isDarkMode ? '#3a1f1f' : '#ffe5e5',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
        },
        modalTitle: {
            fontSize: 22,
            fontWeight: '700',
            color: textColor,
            textAlign: 'center',
            marginBottom: 8,
            letterSpacing: -0.5,
        },
        modalBody: {
            paddingHorizontal: 24,
            paddingBottom: 24,
        },
        modalMessage: {
            fontSize: 15,
            color: secondaryText,
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: 4,
        },
        modalUsername: {
            fontSize: 15,
            fontWeight: '600',
            color: accentColor,
            textAlign: 'center',
            marginBottom: 24,
        },
        modalButtons: {
            gap: 12,
        },
        modalButton: {
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
        },
        modalButtonPrimary: {
            backgroundColor: '#ff3b30',
            shadowColor: '#ff3b30',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
        },
        modalButtonSecondary: {
            backgroundColor: isDarkMode ? '#3a3a3c' : '#f2f2f7',
        },
        modalButtonText: {
            fontSize: 17,
            fontWeight: '600',
            letterSpacing: -0.3,
        },
        modalButtonTextPrimary: {
            color: '#ffffff',
        },
        modalButtonTextSecondary: {
            color: textColor,
        },
    });

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.userSection}
                        activeOpacity={0.6}
                        onPress={() => {
                            navigation.navigate('UserHome');
                            navigation.closeDrawer();
                        }}
                    >
                        <View style={styles.avatar}>
                            {userData?.avatar ? (
                                <Image
                                    source={{ uri: userData.avatar }}
                                    style={styles.avatarImage}
                                />
                            ) : (
                                <Text style={styles.avatarText}>👤</Text>
                            )}
                        </View>
                        <View style={styles.userInfo}>
                            {isLoadingUser ? (
                                <ActivityIndicator size="small" color={accentColor} />
                            ) : userData ? (
                                <>
                                    <Text style={styles.userName} numberOfLines={1}>
                                        {userData.fullName || 'User'}
                                    </Text>
                                    <Text style={styles.userPhone} numberOfLines={1}>
                                        @{userData.userName || 'username'}
                                    </Text>
                                </>
                            ) : (
                                <Text style={styles.userPhone}>No user data</Text>
                            )}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.accountSwitcherButton}
                        onPress={() => setShowAccountSwitcher(!showAccountSwitcher)}
                        activeOpacity={0.6}
                    >
                        <Text style={styles.accountSwitcherText}>
                            {showAccountSwitcher ? 'Hide Accounts' : 'Switch Account'}
                        </Text>
                        <Text style={[styles.accountSwitcherText, { fontSize: 12 }]}>
                            {showAccountSwitcher ? '▲' : '▼'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {showAccountSwitcher && (
                    <View style={styles.accountsList}>
                        <TouchableOpacity
                            style={[
                                styles.accountItem,
                                selectedAccount === 0 && styles.accountItemActive,
                            ]}
                            onPress={() => handleAccountSwitch(0)}
                            activeOpacity={0.6}
                        >
                            <View style={styles.accountAvatar}>
                                {userData?.avatar ? (
                                    <Image
                                        source={{ uri: userData.avatar }}
                                        style={{ width: 40, height: 40, borderRadius: 20 }}
                                    />
                                ) : (
                                    <Text style={styles.accountAvatarText}>👤</Text>
                                )}
                            </View>
                            <View style={styles.accountInfo}>
                                <Text style={styles.accountName} numberOfLines={1}>
                                    {userData?.fullName || 'Current Account'}
                                </Text>
                                <Text style={styles.accountHandle} numberOfLines={1}>
                                    @{userData?.userName || 'username'}
                                </Text>
                            </View>
                            {selectedAccount === 0 && (
                                <Text style={{ fontSize: 20, color: accentColor }}>✓</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.accountItem, styles.accountItemLast]}
                            onPress={() => handleAccountSwitch(1)}
                            activeOpacity={0.6}
                        >
                            <View style={[styles.accountAvatar, { backgroundColor: secondaryText }]}>
                                <Text style={styles.accountAvatarText}>+</Text>
                            </View>
                            <Text style={styles.addAccountText}>Add Account</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.menuSection}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            navigation.navigate('FeedMain');
                            navigation.closeDrawer();
                        }}
                        activeOpacity={0.6}
                    >
                        <View style={styles.menuIcon}>
                            <Home size={24} color={iconColor} strokeWidth={1.5} />
                        </View>
                        <Text style={styles.menuLabel}>Home Feed</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            navigation.navigate("Chats");
                            navigation.closeDrawer();
                        }}
                        activeOpacity={0.6}
                    >
                        <View style={styles.menuIcon}>
                            <MessageSquare size={24} color={iconColor} strokeWidth={1.5} />
                        </View>
                        <Text style={styles.menuLabel}>Messages</Text>
                        <View style={styles.menuBadge}>
                            <Text style={styles.menuBadgeText}>3</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.closeDrawer()}
                        activeOpacity={0.6}
                    >
                        <View style={styles.menuIcon}>
                            <Bell size={24} color={iconColor} strokeWidth={1.5} />
                        </View>
                        <Text style={styles.menuLabel}>Notifications</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.closeDrawer()}
                        activeOpacity={0.6}
                    >
                        <View style={styles.menuIcon}>
                            <Bookmark size={24} color={iconColor} strokeWidth={1.5} />
                        </View>
                        <Text style={styles.menuLabel}>Saved Content</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.menuSection}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            navigation.navigate('SettingsDrawer');
                            navigation.closeDrawer();
                        }}
                        activeOpacity={0.6}
                    >
                        <View style={styles.menuIcon}>
                            <Settings size={24} color={iconColor} strokeWidth={1.5} />
                        </View>
                        <Text style={styles.menuLabel}>Settings</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.closeDrawer()}
                        activeOpacity={0.6}
                    >
                        <View style={styles.menuIcon}>
                            <Lock size={24} color={iconColor} strokeWidth={1.5} />
                        </View>
                        <Text style={styles.menuLabel}>Privacy & Security</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.closeDrawer()}
                        activeOpacity={0.6}
                    >
                        <View style={styles.menuIcon}>
                            <HelpCircle size={24} color={iconColor} strokeWidth={1.5} />
                        </View>
                        <Text style={styles.menuLabel}>Help</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.nightModeSection}>
                    <TouchableOpacity
                        style={styles.nightModeItem}
                        onPress={() => setIsDarkMode(!isDarkMode)}
                        activeOpacity={0.6}
                    >
                        <View style={styles.menuIcon}>
                            {isDarkMode ? (
                                <Moon size={24} color={iconColor} strokeWidth={1.5} />
                            ) : (
                                <Sun size={24} color={iconColor} strokeWidth={1.5} />
                            )}
                        </View>
                        <Text style={styles.menuLabel}>Night Mode</Text>
                        <View style={styles.nightModeToggle}>
                            <View style={styles.nightModeKnob} />
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.logoutSection}>
                    <TouchableOpacity
                        style={styles.logoutItem}
                        onPress={handleLogoutPress}
                        activeOpacity={0.6}
                    >
                        <View style={styles.menuIcon}>
                            <LogOut size={24} color="#ff3b30" strokeWidth={1.5} />
                        </View>
                        <Text style={[styles.menuLabel, { color: '#ff3b30' }]}>Log Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Naps for Mobile</Text>
                <Text style={styles.version}>Version 5.x.x</Text>
            </View>

            <Modal
                visible={showLogoutModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowLogoutModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowLogoutModal(false)}
                >
                    <Animated.View
                        style={[
                            styles.modalContent,
                            {
                                transform: [
                                    { scale: modalScale },
                                    {
                                        translateY: modalScale.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [50, 0],
                                        }),
                                    },
                                ],
                                opacity: modalScale,
                            },
                        ]}
                    >
                        <TouchableOpacity activeOpacity={1}>
                            <View style={styles.modalHeader}>
                                <View style={styles.modalIconCircle}>
                                    <LogOut size={32} color="#ff3b30" strokeWidth={2} />
                                </View>
                                <Text style={styles.modalTitle}>Log Out?</Text>
                            </View>

                            <View style={styles.modalBody}>
                                <Text style={styles.modalMessage}>
                                    Are you sure you want to log out from
                                </Text>
                                <Text style={styles.modalUsername}>
                                    @{userData?.userName || 'username'}
                                </Text>

                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.modalButtonPrimary]}
                                        onPress={handleLogout}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                                            Yes, Log Out
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.modalButtonSecondary]}
                                        onPress={() => setShowLogoutModal(false)}
                                        activeOpacity={0.6}
                                    >
                                        <Text style={[styles.modalButtonText, styles.modalButtonTextSecondary]}>
                                            Cancel
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default CustomDrawerContent;