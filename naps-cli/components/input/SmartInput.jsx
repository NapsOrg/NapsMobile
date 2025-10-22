/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Animated,
    Platform,
    Keyboard,
    ScrollView,
    Image,
    Alert,
    Linking,
    KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';

const MEDIA_PREVIEW_HEIGHT = 100;

const SmartInput = ({
                        value,
                        onChangeText,
                        onSubmit,
                        submitting = false,
                        placeholder = "Write a comment...",
                        maxLength = 500,
                        visible = false,
                        isNavbarVisible = true
                    }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState([]);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const inputRef = useRef(null);
    const mediaHeightAnim = useRef(new Animated.Value(0)).current;
    const keyboardOffsetAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const keyboardWillShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                setKeyboardHeight(e.endCoordinates.height);
                Animated.timing(keyboardOffsetAnim, {
                    toValue: e.endCoordinates.height,
                    duration: Platform.OS === 'ios' ? e.duration : 250,
                    useNativeDriver: false,
                }).start();
            }
        );

        const keyboardWillHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            (e) => {
                setKeyboardHeight(0);
                Animated.timing(keyboardOffsetAnim, {
                    toValue: 0,
                    duration: Platform.OS === 'ios' ? e.duration : 250,
                    useNativeDriver: false,
                }).start();
            }
        );

        return () => {
            keyboardWillShowListener.remove();
            keyboardWillHideListener.remove();
        };
    }, []);

    useEffect(() => {
        Animated.spring(mediaHeightAnim, {
            toValue: selectedMedia.length > 0 ? 1 : 0,
            useNativeDriver: false,
            damping: 15,
            stiffness: 200,
        }).start();
    }, [selectedMedia.length]);

    useEffect(() => {
        if (visible && inputRef.current) {
            setTimeout(() => {
                inputRef.current.focus();
            }, 100);
        }
    }, [visible]);

    const requestMediaPermission = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Please grant access to your media library to share photos and videos.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: () => {
                            if (Platform.OS === 'ios') {
                                Linking.openURL('app-settings:');
                            }
                        }}
                ]
            );
            return false;
        }
        return true;
    };

    const pickMedia = async () => {
        const hasPermission = await requestMediaPermission();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsMultipleSelection: true,
                quality: 0.8,
                videoQuality: ImagePicker.UIImagePickerControllerQualityType.High,
            });

            if (!result.canceled) {
                const newMedia = result.assets.map(asset => ({
                    uri: asset.uri,
                    type: asset.type,
                    duration: asset.duration,
                    width: asset.width,
                    height: asset.height,
                }));
                setSelectedMedia(prev => [...prev, ...newMedia]);
            }
        } catch (error) {
            console.error('Error picking media:', error);
            Alert.alert('Error', 'Failed to select media. Please try again.');
        }
    };

    const removeMedia = (index) => {
        setSelectedMedia(prev => prev.filter((_, i) => i !== index));
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        if (!value.trim() && selectedMedia.length === 0) {
            setIsFocused(false);
        }
    };

    const handleSubmit = () => {
        if ((value.trim() || selectedMedia.length > 0) && !submitting) {
            onSubmit({ text: value, media: selectedMedia });
            setSelectedMedia([]);
            Keyboard.dismiss();
        }
    };

    const showProgressBar = value.length > maxLength * 0.8;
    const canSend = (value.trim() || selectedMedia.length > 0) && !submitting;

    if (!visible) return null;

    const mediaPreviewHeight = mediaHeightAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, MEDIA_PREVIEW_HEIGHT + 16],
    });

    return (
        <Animated.View 
            style={[
                styles.wrapper,
                {
                    bottom: keyboardOffsetAnim,
                }
            ]}
        >
            <View style={styles.container}>
                <Animated.View
                    style={[
                        styles.mediaPreviewContainer,
                        {
                            height: mediaPreviewHeight,
                            opacity: mediaHeightAnim,
                        }
                    ]}
                >
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.mediaScrollContent}
                    >
                        {selectedMedia.map((media, index) => (
                            <View key={index} style={styles.mediaItem}>
                                {media.type === 'video' ? (
                                    <View style={styles.videoPreview}>
                                        <Video
                                            source={{ uri: media.uri }}
                                            style={styles.mediaPreview}
                                            resizeMode="cover"
                                            shouldPlay={false}
                                            isLooping={false}
                                        />
                                        <View style={styles.videoOverlay}>
                                            <Ionicons name="play-circle" size={32} color="rgba(255,255,255,0.9)" />
                                            {media.duration && (
                                                <Text style={styles.videoDuration}>
                                                    {Math.floor(media.duration / 60)}:{String(Math.floor(media.duration % 60)).padStart(2, '0')}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                ) : (
                                    <Image
                                        source={{ uri: media.uri }}
                                        style={styles.mediaPreview}
                                        resizeMode="cover"
                                    />
                                )}
                                <TouchableOpacity
                                    style={styles.removeMediaBtn}
                                    onPress={() => removeMedia(index)}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="close-circle" size={22} color="#FF3B30" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </Animated.View>

                <View style={styles.inputRow}>
                    {/* Attach Button */}
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={pickMedia}
                        activeOpacity={0.6}
                    >
                        <Ionicons name="attach" size={24} color="#9561FB" />
                        {selectedMedia.length > 0 && (
                            <View style={styles.mediaBadge}>
                                <Text style={styles.mediaBadgeText}>{selectedMedia.length}</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.inputWrapper}>
                        <TextInput
                            ref={inputRef}
                            style={styles.input}
                            placeholder={selectedMedia.length > 0 ? "Add a caption..." : placeholder}
                            placeholderTextColor="#666"
                            value={value}
                            onChangeText={onChangeText}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            multiline
                            maxLength={maxLength}
                            textAlignVertical="center"
                        />

                        {showProgressBar && (
                            <View style={styles.counterContainer}>
                                <Text
                                    style={[
                                        styles.charCounter,
                                        value.length >= maxLength && styles.charCounterLimit
                                    ]}
                                >
                                    {value.length}/{maxLength}
                                </Text>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={!canSend}
                        activeOpacity={0.6}
                        style={[
                            styles.sendButton,
                            canSend && styles.sendButtonActive
                        ]}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons
                                name="send"
                                size={20}
                                color={canSend ? "#fff" : "#666"}
                            />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#1A1A1A',
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    container: {
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 8,
    },
    mediaPreviewContainer: {
        overflow: 'hidden',
        marginBottom: 8,
    },
    mediaScrollContent: {
        paddingHorizontal: 4,
        paddingVertical: 4,
        gap: 8,
    },
    mediaItem: {
        position: 'relative',
        marginRight: 8,
    },
    mediaPreview: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#2C2C2E',
    },
    videoPreview: {
        position: 'relative',
    },
    videoOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 8,
    },
    videoDuration: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 3,
        fontSize: 10,
        color: '#fff',
        fontWeight: '500',
    },
    removeMediaBtn: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#fff',
        borderRadius: 11,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        elevation: 2,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },
    iconButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    mediaBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#9561FB',
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    mediaBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    inputWrapper: {
        flex: 1,
        backgroundColor: '#2C2C2E',
        borderRadius: 20,
        minHeight: 40,
        maxHeight: 120,
        justifyContent: 'center',
        paddingRight: 8,
        borderWidth: 1,
        borderColor: 'rgba(149, 97, 251, 0.2)',
    },
    input: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
        fontSize: 15,
        color: '#fff',
        lineHeight: 20,
    },
    counterContainer: {
        position: 'absolute',
        right: 12,
        bottom: 8,
    },
    charCounter: {
        fontSize: 11,
        color: '#666',
        fontWeight: '500',
    },
    charCounterLimit: {
        color: '#FF3B30',
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2C2C2E',
    },
    sendButtonActive: {
        backgroundColor: '#9561FB',
    },
});

export default SmartInput;