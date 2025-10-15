/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import React, { useState } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    Pressable,
    Platform,
    Alert,
    Linking,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from "@expo/vector-icons";

import marker_icon from '../../../assets/icons/marker.png';
import calendar_icon from '../../../assets/icons/calendar.png';
import edit_icon from '../../../assets/icons/edit.png';
import settings_icon from '../../../assets/icons/settings.png';
import follow_user_icon from '../../../assets/icons/following.png';
import message_icon from '../../../assets/icons/comment-dots.png';
import default_user_logo from '../../../assets/logo/defaul_user_logo.jpg';
import globalStyles from "../../../styles";
import UserDataViewSkeleton from "./UserDataSkeleton";
import UserService from "../../../services/UserService";

const UserDataView = ({
                          username,
                          full_name,
                          bio,
                          city,
                          followers,
                          following,
                          reactions,
                          user_status,
                          register_date,
                          is_my_prof,
                          user_id,
                          avatar_url,
                          isFollowing,
                          isLoadingFollow,
                          loading,
                          onFollowToggle,
                          onMessage,
                          onEdit,
                          onSettings,
                          onAvatarUpdate,
                      }) => {
    const navigation = useNavigation();
    const [imageError, setImageError] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const userService = new UserService();

    if (loading) return <UserDataViewSkeleton />;

    const getAvatarSource = () => {
        if (imageError || !avatar_url) return default_user_logo;
        return { uri: avatar_url };
    };

    const openImageModal = () => setIsModalVisible(true);
    const closeImageModal = () => setIsModalVisible(false);

    const pickAndUploadAvatar = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Please grant access to your media library to upload photos.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Open Settings',
                            onPress: () => Linking.openSettings()
                        }
                    ]
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                setIsUploading(true);
                closeImageModal();

                try {
                    const response = await userService.uploadAvatar(asset); // передаем файл, не FormData

                    if (response.status === 200 || response.data) {
                        Alert.alert('Success', 'Avatar updated successfully!');
                        if (onAvatarUpdate && response.data?.avatar_url) {
                            onAvatarUpdate(response.data.avatar_url);
                        }
                    }
                } catch (uploadError) {
                    console.error('Upload error:', uploadError);
                    Alert.alert(
                        'Upload Error',
                        uploadError.response?.data?.message || 'Failed to upload avatar. Please check your connection and try again.'
                    );
                } finally {
                    setIsUploading(false);
                }
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to select image. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const downloadAvatar = async () => {
        try {
            if (!avatar_url) {
                Alert.alert('Error', 'No avatar to download');
                return;
            }

            if (Platform.OS === 'android') {
                const { status } = await MediaLibrary.requestPermissionsAsync(false);
                if (status !== 'granted') {
                    Alert.alert(
                        'Permission Required',
                        'Please grant access to save images to your gallery.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Open Settings',
                                onPress: () => Linking.openSettings()
                            }
                        ]
                    );
                    return;
                }
            } else {
                const { status } = await MediaLibrary.requestPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert(
                        'Permission Required',
                        'Please grant access to save images to your gallery.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Open Settings',
                                onPress: () => Linking.openSettings()
                            }
                        ]
                    );
                    return;
                }
            }

            closeImageModal();

            Alert.alert('Downloading', 'Starting download...');

            const fileUri = `${FileSystem.documentDirectory}avatar_${username}_${Date.now()}.jpg`;

            const downloadResult = await FileSystem.downloadAsync(
                avatar_url,
                fileUri
            );

            if (downloadResult.status === 200) {
                const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);

                try {
                    const album = await MediaLibrary.getAlbumAsync('Naps');
                    if (album) {
                        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
                    } else {
                        await MediaLibrary.createAlbumAsync('Naps', asset, false);
                    }
                } catch (albumError) {
                    console.log('Album creation skipped:', albumError);
                }

                Alert.alert('Success', 'Avatar saved to gallery!');
            } else {
                throw new Error('Download failed');
            }
        } catch (error) {
            console.error('Error downloading avatar:', error);
            Alert.alert(
                'Download Error',
                'Failed to download avatar. Please check your connection and try again.'
            );
        }
    };

    const formatNumber = (num) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
        return num?.toString() || '0';
    };

    const navigateToFollowers = () => {
        navigation.navigate("Followers", {
            user_id,
            username,
            initialTab: "Followers"
        });
    };

    const navigateToFollowing = () => {
        navigation.navigate("Followers", {
            user_id,
            username,
            initialTab: "Following"
        });
    };

    const renderActionButtons = () => {
        if (is_my_prof) {
            return (
                <View style={styles.buttons}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={onEdit}
                        activeOpacity={0.8}
                    >
                        <View style={styles.buttonContent}>
                            <Image source={edit_icon} style={styles.buttonIcon}/>
                            <Text style={styles.primaryButtonText}>Edit Profile</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={onSettings}
                        activeOpacity={0.8}
                    >
                        <View style={styles.buttonContent}>
                            <Image source={settings_icon} style={styles.buttonIcon}/>
                            <Text style={styles.secondaryButtonText}>Settings</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        } else {
            return (
                <View style={styles.buttons}>
                    <TouchableOpacity
                        style={[
                            isFollowing ? styles.secondaryButton : styles.primaryButton,
                            isLoadingFollow && styles.buttonDisabled
                        ]}
                        onPress={onFollowToggle}
                        disabled={isLoadingFollow}
                        activeOpacity={0.8}
                    >
                        {isLoadingFollow ? (
                            <ActivityIndicator
                                size="small"
                                color={isFollowing ? globalStyles.main.accent : '#FFFFFF'}
                            />
                        ) : (
                            <View style={styles.buttonContent}>
                                <Image source={follow_user_icon} style={styles.buttonIcon}/>
                                <Text style={isFollowing ? styles.secondaryButtonText : styles.primaryButtonText}>
                                    {isFollowing ? "Following" : "Follow"}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={onMessage}
                        activeOpacity={0.8}
                    >
                        <View style={styles.buttonContent}>
                            <Image source={message_icon} style={styles.buttonIcon}/>
                            <Text style={styles.secondaryButtonText}>Message</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        }
    };

    return (
        <View style={styles.container}>
            {isUploading && (
                <View style={styles.uploadingOverlay}>
                    <View style={styles.uploadingCard}>
                        <ActivityIndicator size="large" color={globalStyles.main.accent} />
                        <Text style={styles.uploadingText}>Uploading avatar...</Text>
                    </View>
                </View>
            )}

            <View style={styles.userCredentials}>
                <View style={styles.avatarContainer}>
                    <TouchableOpacity onPress={openImageModal} activeOpacity={0.9}>
                        <Image
                            source={getAvatarSource()}
                            style={styles.avatar}
                            onError={() => setImageError(true)}
                        />
                        {user_status === 'ONLINE' && (
                            <View style={styles.onlineIndicator} />
                        )}
                    </TouchableOpacity>
                </View>
                <Text style={styles.displayName} numberOfLines={2}>{full_name}</Text>
                <Text style={styles.username} numberOfLines={1}>@{username}</Text>
            </View>

            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeImageModal}
                statusBarTranslucent
            >
                <View style={styles.modalBackground}>
                    <Pressable style={styles.closeArea} onPress={closeImageModal} />

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={closeImageModal}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.modalContent}>
                        <Image
                            source={getAvatarSource()}
                            style={styles.fullscreenImage}
                            resizeMode="contain"
                        />

                        <View style={styles.modalActions}>
                            {is_my_prof && (
                                <TouchableOpacity
                                    style={styles.modernButton}
                                    onPress={pickAndUploadAvatar}
                                    activeOpacity={0.85}
                                >
                                    <View style={styles.buttonIconCircle}>
                                        <Ionicons name="camera" size={24} color="#fff" />
                                    </View>
                                    <Text style={styles.modernButtonText}>Change</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={styles.modernButton}
                                onPress={downloadAvatar}
                                activeOpacity={0.85}
                            >
                                <View style={styles.buttonIconCircle}>
                                    <Ionicons name="download" size={24} color="#fff" />
                                </View>
                                <Text style={styles.modernButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <View style={styles.userInfoCard}>
                <View style={styles.userInfo}>
                    {bio && <Text style={styles.bio}>{bio}</Text>}

                    <View style={styles.userDetails}>
                        {city && (
                            <>
                                <View style={styles.detailItem}>
                                    <Image source={marker_icon} style={styles.detailIcon}/>
                                    <Text style={styles.detailText}>{city}</Text>
                                </View>
                                <View style={styles.separator} />
                            </>
                        )}
                        <View style={styles.detailItem}>
                            <Image source={calendar_icon} style={styles.detailIcon}/>
                            <Text style={styles.detailText}>Joined {register_date}</Text>
                        </View>
                    </View>

                    <View style={styles.userStats}>
                        <TouchableOpacity style={styles.statItem} onPress={navigateToFollowing} activeOpacity={0.7}>
                            <Text style={styles.statValue}>{formatNumber(following)}</Text>
                            <Text style={styles.statLabel}>Following</Text>
                        </TouchableOpacity>

                        <View style={styles.statDivider} />

                        <TouchableOpacity style={styles.statItem} onPress={navigateToFollowers} activeOpacity={0.7}>
                            <Text style={styles.statValue}>{formatNumber(followers)}</Text>
                            <Text style={styles.statLabel}>Followers</Text>
                        </TouchableOpacity>

                        <View style={styles.statDivider} />

                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{formatNumber(reactions)}</Text>
                            <Text style={styles.statLabel}>Reactions</Text>
                        </View>
                    </View>
                </View>

                {renderActionButtons()}
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

    uploadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        borderRadius: 20,
    },

    uploadingCard: {
        backgroundColor: 'rgba(30, 30, 30, 0.95)',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        gap: 16,
    },

    uploadingText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
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

    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: globalStyles.dark.backgroundColor,
    },

    onlineIndicator: {
        position: "absolute",
        bottom: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#4CAF50',
        borderWidth: 3,
        borderColor: globalStyles.main.borderColor || globalStyles.dark.backgroundColor,
    },

    displayName: {
        fontSize: 24,
        fontWeight: "700",
        color: globalStyles.dark.textPrimary,
        marginBottom: 4,
        textAlign: "center",
    },

    username: {
        fontSize: 16,
        color: globalStyles.dark.textSecondary,
        marginBottom: 4,
        fontWeight: "500",
        textAlign: "center",
    },

    userInfoCard: {
        width: "100%",
        zIndex: 1,
    },

    userInfo: {
        marginBottom: 24,
    },

    bio: {
        fontSize: 15,
        color: globalStyles.dark.textPrimary,
        marginBottom: 20,
        textAlign: "center",
        lineHeight: 22,
        fontWeight: "400",
        letterSpacing: 0.5,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        textAlignVertical: "center",
        flex: 1,
        flexWrap: "wrap",
    },

    userDetails: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
        backgroundColor: globalStyles.main.inputBackgroundColor,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },

    detailItem: {
        flexDirection: "row",
        alignItems: "center",
    },

    separator: {
        width: 1,
        height: 16,
        backgroundColor: "#444",
        marginHorizontal: 16,
    },

    detailIcon: {
        width: 16,
        height: 16,
        marginRight: 8,
        tintColor: globalStyles.main.accent,
    },

    detailText: {
        color: globalStyles.main.placeholderTextColor,
        fontSize: 13,
        fontWeight: "500",
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

    statValue: {
        color: globalStyles.dark.textPrimary,
        fontWeight: "700",
        fontSize: 20,
        marginBottom: 4,
        letterSpacing: 0.5,
    },

    statLabel: {
        color: globalStyles.main.placeholderTextColor,
        fontSize: 10,
        fontWeight: "500",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },

    buttons: {
        flexDirection: "row",
        gap: 12,
    },

    primaryButton: {
        flex: 1,
        backgroundColor: globalStyles.main.accent,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        ...Platform.select({
            ios: {
                shadowColor: globalStyles.main.accent,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },

    secondaryButton: {
        flex: 1,
        backgroundColor: "transparent",
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#444",
    },

    buttonDisabled: {
        opacity: 0.6,
    },

    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    buttonIcon: {
        width: 16,
        height: 16,
        marginRight: 8,
        tintColor: '#fff',
    },

    primaryButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 15,
        letterSpacing: 0.5,
    },

    secondaryButtonText: {
        color: "#ccc",
        fontWeight: "600",
        fontSize: 15,
        letterSpacing: 0.5,
    },

    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.95)",
        justifyContent: "center",
        alignItems: "center",
    },

    closeArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },

    closeButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },

    modalContent: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
        paddingBottom: 100,
    },

    fullscreenImage: {
        width: "90%",
        height: "60%",
        borderRadius: 20,
    },

    modalActions: {
        flexDirection: 'row',
        marginTop: 50,
        gap: 32,
        paddingHorizontal: 20,
    },

    modernButton: {
        alignItems: 'center',
        gap: 12,
    },

    buttonIconCircle: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: globalStyles.main.accent,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: globalStyles.main.accent,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.5,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },

    modernButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});

export default UserDataView;