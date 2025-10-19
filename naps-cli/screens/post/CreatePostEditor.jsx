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
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    Alert,
    Switch,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';

import CustomAlert from "../../components/alert/CustomAlert";
import left_arrow_icon from "../../assets/icons/angle-left.png";
import flip_icon from "../../assets/icons/repeat.png";
import trash_icon from "../../assets/icons/trash.png";
import gallery_icon from "../../assets/icons/galery.png";
import globalStyles from "../../styles";
import LocationService from "../../services/LocationService";
import PostService from "../../services/PostService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const FILTER_STYLES = [
    { id: "none", name: "Original" },
    { id: "grayscale", name: "B&W" },
    { id: "sepia", name: "Sepia" },
    { id: "warm", name: "Warm" },
    { id: "cool", name: "Cool" },
    { id: "vintage", name: "Vintage" },
    { id: "bright", name: "Bright" },
];

const CreatePostEditor = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { media: initialMedia } = route.params || {};

    const [media, setMedia] = useState(initialMedia);
    const [originalMedia, setOriginalMedia] = useState(initialMedia);
    const [caption, setCaption] = useState("");
    const [showOnMap, setShowOnMap] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("none");
    const [isFlipped, setIsFlipped] = useState(false);
    const [processedUri, setProcessedUri] = useState(null);
    const [alertIsVisible, setAlertIsVisible] = useState(false);

    const locationService = new LocationService();
    const postService = new PostService();

    const handleDiscard = () => {
        setAlertIsVisible(false);
        navigation.goBack();
    };

    const handleCancel = () => {
        setAlertIsVisible(false);
    };

    const handleCheck = () => {
        if (caption.trim() || media) {
            setAlertIsVisible(true);
        } else {
            navigation.goBack();
        }
    };


    const handleChangeMedia = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images", "videos"],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                setMedia(result.assets[0]);
                setOriginalMedia(result.assets[0]);
                setIsFlipped(false);
                setSelectedFilter("none");
                setProcessedUri(null);
            }
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert("Error", "Failed to pick image");
        }
    };

    const handleRemoveMedia = () => {
        Alert.alert(
            "Remove media?",
            "Are you sure you want to remove this media?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: () => {
                        setMedia(null);
                        setOriginalMedia(null);
                        setIsFlipped(false);
                        setSelectedFilter("none");
                        setProcessedUri(null);
                    },
                },
            ]
        );
    };

    const handleFlipImage = async () => {
        if (!media) return;

        try {
            const sourceUri = processedUri || media.uri;
            const result = await manipulateAsync(
                sourceUri,
                [{ flip: FlipType.Horizontal }],
                { compress: 0.9, format: SaveFormat.JPEG }
            );

            setProcessedUri(result.uri);
            setIsFlipped(!isFlipped);
        } catch (error) {
            console.error("Error flipping image:", error);
            Alert.alert("Error", "Failed to flip image");
        }
    };

    const handlePost = async () => {
        if (!caption.trim() && !media) {
            Alert.alert("Error", "Please add a caption or media");
            return;
        }

        setIsPosting(true);

        try {
            const locationData = await locationService.getUserLocationData();

            let fileToUpload = null;
            if (media) {
                const mediaToUpload = processedUri || media.uri;
                fileToUpload = {
                    uri: mediaToUpload,
                    type: media.type === "video" ? "video/mp4" : "image/jpeg",
                    name: media.fileName || `media_${Date.now()}.${media.type === "video" ? "mp4" : "jpg"}`,
                };
            }

            const postData = {
                content: caption.trim() || null,
                file: fileToUpload,
                longitude: locationData.longitude,
                latitude: locationData.latitude,
                city: locationData.city,
                showOnMap: showOnMap,
            };

            await postService.createPost(postData);

            Alert.alert("Success", "Post created successfully!", [
                {
                    text: "OK",
                    onPress: () => {
                        navigation.navigate("UserHome");
                    },
                },
            ]);
        } catch (error) {
            console.error("Error creating post:", error);
            Alert.alert("Error", "Failed to create post. Please try again.");
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleCheck}
                        disabled={isPosting}
                    >
                        <Image
                            source={left_arrow_icon}
                            style={styles.backIcon}
                        />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>New Post</Text>

                    <TouchableOpacity
                        style={[
                            styles.postButton,
                            ((!caption.trim() && !media) || isPosting) &&
                            styles.postButtonDisabled,
                        ]}
                        onPress={handlePost}
                        disabled={(!caption.trim() && !media) || isPosting}
                    >
                        <Text
                            style={[
                                styles.postButtonText,
                                ((!caption.trim() && !media) || isPosting) &&
                                styles.postButtonTextDisabled,
                            ]}
                        >
                            {isPosting ? "Posting..." : "Post"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {media && (
                        <View style={styles.mediaSection}>
                            <View style={styles.mediaContainer}>
                                <Image
                                    source={{ uri: processedUri || media.uri }}
                                    style={[
                                        styles.mediaPreview,
                                        selectedFilter === "grayscale" && styles.grayscaleFilter,
                                        selectedFilter === "sepia" && styles.sepiaFilter,
                                        selectedFilter === "warm" && styles.warmFilter,
                                        selectedFilter === "cool" && styles.coolFilter,
                                        selectedFilter === "vintage" && styles.vintageFilter,
                                        selectedFilter === "bright" && styles.brightFilter,
                                    ]}
                                    resizeMode="cover"
                                />
                                <View style={styles.mediaInfo}>
                                    <Text style={styles.mediaInfoText}>
                                        {media.width} × {media.height}
                                    </Text>
                                    {selectedFilter !== "none" && (
                                        <Text style={styles.filterBadge}>
                                            {FILTER_STYLES.find(f => f.id === selectedFilter)?.name}
                                        </Text>
                                    )}
                                </View>
                            </View>

                            <View style={styles.mediaControls}>
                                <TouchableOpacity
                                    style={[
                                        styles.mediaControlButton,
                                        isFlipped && styles.activeControlButton
                                    ]}
                                    onPress={handleFlipImage}
                                    disabled={isPosting}
                                >
                                    <Image
                                        source={flip_icon}
                                        style={styles.controlButtonIcon}
                                    />
                                    <Text style={styles.controlButtonText}>
                                        Flip
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.mediaControlButton}
                                    onPress={handleChangeMedia}
                                    disabled={isPosting}
                                >
                                    <Image
                                        source={gallery_icon}
                                        style={styles.controlButtonIcon}
                                    />
                                    <Text style={styles.controlButtonText}>
                                        Change
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.mediaControlButton,
                                        styles.removeButton,
                                    ]}
                                    onPress={handleRemoveMedia}
                                    disabled={isPosting}
                                >
                                    <Image
                                        source={trash_icon}
                                        style={[
                                            styles.controlButtonIcon,
                                            styles.removeIcon,
                                        ]}
                                    />
                                    <Text
                                        style={[
                                            styles.controlButtonText,
                                            styles.removeText,
                                        ]}
                                    >
                                        Remove
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.filtersSection}>
                                <Text style={styles.filtersTitle}>Filters</Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.filtersScroll}
                                    contentContainerStyle={styles.filtersContent}
                                >
                                    {FILTER_STYLES.map((filter) => (
                                        <TouchableOpacity
                                            key={filter.id}
                                            style={[
                                                styles.filterItem,
                                                selectedFilter === filter.id &&
                                                styles.filterItemActive,
                                            ]}
                                            onPress={() => setSelectedFilter(filter.id)}
                                            disabled={isPosting}
                                        >
                                            <View
                                                style={[
                                                    styles.filterPreview,
                                                    selectedFilter === filter.id &&
                                                    styles.filterPreviewActive,
                                                ]}
                                            >
                                                <Image
                                                    source={{ uri: media.uri }}
                                                    style={[
                                                        styles.filterPreviewImage,
                                                        filter.id === "grayscale" && styles.grayscaleFilter,
                                                        filter.id === "sepia" && styles.sepiaFilter,
                                                        filter.id === "warm" && styles.warmFilter,
                                                        filter.id === "cool" && styles.coolFilter,
                                                        filter.id === "vintage" && styles.vintageFilter,
                                                        filter.id === "bright" && styles.brightFilter,
                                                    ]}
                                                    resizeMode="cover"
                                                />
                                            </View>
                                            <Text
                                                style={[
                                                    styles.filterName,
                                                    selectedFilter === filter.id &&
                                                    styles.filterNameActive,
                                                ]}
                                            >
                                                {filter.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                    )}

                    <View style={styles.inputSection}>
                        <Text style={styles.label}>Caption</Text>
                        <TextInput
                            style={styles.captionInput}
                            placeholder="Write a caption..."
                            placeholderTextColor={globalStyles.dark.textSecondary}
                            value={caption}
                            onChangeText={setCaption}
                            multiline
                            maxLength={2200}
                            editable={!isPosting}
                        />
                        <Text style={styles.charCount}>
                            {caption.length}/2200
                        </Text>
                    </View>

                    <View style={styles.inputSection}>
                        <View style={styles.toggleContainer}>
                            <View style={styles.toggleLabelContainer}>
                                <Text style={styles.label}>Show on map?</Text>
                                <Text style={styles.toggleDescription}>
                                    Allow others to see where this post was created
                                </Text>
                            </View>
                            <Switch
                                value={showOnMap}
                                onValueChange={setShowOnMap}
                                trackColor={{
                                    false: "rgba(255, 255, 255, 0.2)",
                                    true: globalStyles.main.accent
                                }}
                                thumbColor="#FFFFFF"
                                disabled={isPosting}
                            />
                        </View>
                    </View>

                    <View style={styles.tipsContainer}>
                        <Text style={styles.tipsTitle}>Tips:</Text>
                        <Text style={styles.tipText}>
                            • Use hashtags to reach more people
                        </Text>
                        <Text style={styles.tipText}>
                            • Tag people using @username
                        </Text>
                        <Text style={styles.tipText}>
                            • Share your location to connect with nearby users
                        </Text>
                    </View>
                </ScrollView>
                <CustomAlert
                    title="Discard post?"
                    message="Are you sure you want to discard this post?"
                    visible={alertIsVisible}
                    onConfirm={handleDiscard}
                    onCancel={handleCancel}
                    confirmText="Discard"
                    cancelText="Cancel"
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: globalStyles.dark.background,
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.1)",
    },
    backButton: {
        padding: 8,
    },
    backIcon: {
        width: 24,
        height: 24,
        tintColor: globalStyles.dark.textPrimary,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: globalStyles.dark.textPrimary,
    },
    postButton: {
        backgroundColor: globalStyles.main.accent,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 8,
    },
    postButtonDisabled: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    postButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    postButtonTextDisabled: {
        color: globalStyles.dark.textSecondary,
    },
    content: {
        flex: 1,
    },
    mediaSection: {
        marginBottom: 16,
    },
    mediaContainer: {
        margin: 16,
        marginBottom: 12,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        position: "relative",
    },
    mediaPreview: {
        width: "100%",
        height: SCREEN_WIDTH - 32,
    },
    grayscaleFilter: {
        opacity: 0.95,
    },
    sepiaFilter: {
        opacity: 0.9,
    },
    warmFilter: {
        opacity: 1,
    },
    coolFilter: {
        opacity: 1,
    },
    vintageFilter: {
        opacity: 0.85,
    },
    brightFilter: {
        opacity: 1,
    },
    mediaInfo: {
        position: "absolute",
        bottom: 8,
        right: 8,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    mediaInfoText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "500",
    },
    filterBadge: {
        color: globalStyles.main.accent,
        fontSize: 10,
        fontWeight: "600",
        marginTop: 2,
    },
    mediaControls: {
        flexDirection: "row",
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 16,
    },
    mediaControlButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
        gap: 8,
    },
    activeControlButton: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderColor: globalStyles.main.accent,
    },
    removeButton: {
        backgroundColor: "rgba(255, 68, 88, 0.1)",
        borderColor: "rgba(255, 68, 88, 0.2)",
    },
    controlButtonIcon: {
        width: 18,
        height: 18,
        tintColor: globalStyles.dark.textPrimary,
    },
    removeIcon: {
        tintColor: "#FF4458",
    },
    controlButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: globalStyles.dark.textPrimary,
    },
    removeText: {
        color: "#FF4458",
    },
    filtersSection: {
        paddingVertical: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)",
        backgroundColor: "rgba(255, 255, 255, 0.02)",
    },
    filtersTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: globalStyles.dark.textPrimary,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    filtersScroll: {
        paddingLeft: 16,
    },
    filtersContent: {
        paddingRight: 16,
        gap: 12,
    },
    filterItem: {
        alignItems: "center",
        gap: 8,
    },
    filterPreview: {
        width: 70,
        height: 70,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "transparent",
    },
    filterPreviewActive: {
        borderColor: globalStyles.main.accent,
    },
    filterPreviewImage: {
        width: "100%",
        height: "100%",
    },
    filterName: {
        fontSize: 12,
        fontWeight: "500",
        color: globalStyles.dark.textSecondary,
    },
    filterNameActive: {
        color: globalStyles.main.accent,
        fontWeight: "600",
    },
    inputSection: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: globalStyles.dark.textPrimary,
        marginBottom: 8,
    },
    captionInput: {
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: globalStyles.dark.textPrimary,
        minHeight: 120,
        textAlignVertical: "top",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    charCount: {
        fontSize: 12,
        color: globalStyles.dark.textSecondary,
        marginTop: 4,
        textAlign: "right",
    },
    toggleContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    toggleLabelContainer: {
        flex: 1,
        marginRight: 12,
    },
    toggleDescription: {
        fontSize: 13,
        color: globalStyles.dark.textSecondary,
        marginTop: 4,
        lineHeight: 18,
    },
    tipsContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 16,
        marginBottom: 20,
        backgroundColor: "rgba(255, 255, 255, 0.03)",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)",
    },
    tipsTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: globalStyles.dark.textPrimary,
        marginBottom: 8,
    },
    tipText: {
        fontSize: 13,
        color: globalStyles.dark.textSecondary,
        marginBottom: 4,
        lineHeight: 18,
    },
});

export default CreatePostEditor;