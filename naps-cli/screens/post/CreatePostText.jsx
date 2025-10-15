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
    KeyboardAvoidingView,
    Platform,
    Alert,
    Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import left_arrow_icon from "../../assets/icons/angle-left.png";
import globalStyles from "../../styles";
import LocationService from "../../services/LocationService";
import PostService from "../../services/PostService";

const CreatePostText = () => {
    const navigation = useNavigation();

    const [caption, setCaption] = useState("");
    const [showOnMap, setShowOnMap] = useState(true);
    const [isPosting, setIsPosting] = useState(false);

    const locationService = new LocationService();
    const postService = new PostService();

    const handleGoBack = () => {
        if (caption.trim()) {
            Alert.alert(
                "Discard post?",
                "Are you sure you want to discard this post?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Discard",
                        style: "destructive",
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } else {
            navigation.goBack();
        }
    };

    const handlePost = async () => {
        if (!caption.trim()) {
            Alert.alert("Error", "Please write something");
            return;
        }

        setIsPosting(true);

        try {
            const locationData = await locationService.getUserLocationData();
            const postData = {
                content: caption.trim(),
                file: null,
                longitude: showOnMap ? locationData.longitude : 0,
                latitude: showOnMap ? locationData.latitude : 0,
                city: showOnMap ? locationData.city : "",
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
                        onPress={handleGoBack}
                        disabled={isPosting}
                    >
                        <Image
                            source={left_arrow_icon}
                            style={styles.backIcon}
                        />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Text Post</Text>

                    <TouchableOpacity
                        style={[
                            styles.postButton,
                            (!caption.trim() || isPosting) &&
                            styles.postButtonDisabled,
                        ]}
                        onPress={handlePost}
                        disabled={!caption.trim() || isPosting}
                    >
                        <Text
                            style={[
                                styles.postButtonText,
                                (!caption.trim() || isPosting) &&
                                styles.postButtonTextDisabled,
                            ]}
                        >
                            {isPosting ? "Posting..." : "Post"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>What's on your mind?</Text>
                        <TextInput
                            style={styles.captionInput}
                            placeholder="Share your thoughts..."
                            placeholderTextColor={globalStyles.dark.textSecondary}
                            value={caption}
                            onChangeText={setCaption}
                            multiline
                            maxLength={2200}
                            autoFocus
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
                        <Text style={styles.tipsTitle}>💡 Tips:</Text>
                        <Text style={styles.tipText}>
                            • Use hashtags to reach more people
                        </Text>
                        <Text style={styles.tipText}>
                            • Tag people using @username
                        </Text>
                        <Text style={styles.tipText}>
                            • Share interesting thoughts or stories
                        </Text>
                        <Text style={styles.tipText}>
                            • Be authentic and respectful
                        </Text>
                    </View>
                </View>
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
        paddingTop: 20,
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
        minHeight: 200,
        textAlignVertical: "top",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    charCount: {
        fontSize: 12,
        color: globalStyles.dark.textSecondary,
        marginTop: 8,
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
        paddingVertical: 16,
        marginHorizontal: 16,
        backgroundColor: "rgba(255, 255, 255, 0.03)",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)",
    },
    tipsTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: globalStyles.dark.textPrimary,
        marginBottom: 12,
    },
    tipText: {
        fontSize: 14,
        color: globalStyles.dark.textSecondary,
        marginBottom: 6,
        lineHeight: 20,
    },
});

export default CreatePostText;