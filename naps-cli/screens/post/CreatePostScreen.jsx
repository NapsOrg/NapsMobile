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
    TouchableOpacity,
    Image,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

import left_arrow_icon from "../../assets/icons/angle-left.png";
import gallery_icon from "../../assets/icons/galery.png";
import flip_camera_icon from "../../assets/icons/repeat.png";

import globalStyles from "../../styles";

const CreatePostScreen = () => {
    const navigation = useNavigation();
    const cameraRef = useRef(null);

    const [facing, setFacing] = useState("back");
    const [permission, requestPermission] = useCameraPermissions();

    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Permission needed",
                    "Please grant media library permissions to select photos"
                );
            }
        })();
    }, []);

    const handleGoBack = () => {
        navigation.goBack();
    };

    const handleWithoutMedia = () => {
        navigation.navigate("CreatePostText");
    };

    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images", "videos"],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                navigation.navigate("CreatePostEditor", {
                    media: result.assets[0],
                });
            }
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert("Error", "Failed to pick image");
        }
    };

    const handleTakePhoto = async () => {
        if (!cameraRef.current) return;

        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 1,
                base64: false,
            });

            navigation.navigate("CreatePostEditor", {
                media: photo,
            });
        } catch (error) {
            console.error("Error taking photo:", error);
            Alert.alert("Error", "Failed to take photo");
        }
    };

    const toggleCameraFacing = () => {
        setFacing((current) => (current === "back" ? "front" : "back"));
    };

    if (!permission) {
        return (
            <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading camera...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleGoBack}
                    >
                        <Image source={left_arrow_icon} style={styles.backIcon} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>New Post</Text>
                    <View style={styles.headerSpacer} />
                </View>
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionText}>
                        We need your permission to show the camera
                    </Text>
                    <TouchableOpacity
                        style={styles.permissionButton}
                        onPress={requestPermission}
                    >
                        <Text style={styles.permissionButtonText}>
                            Grant Permission
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleGoBack}
                >
                    <Image source={left_arrow_icon} style={styles.backIcon} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.withoutMediaButton}
                    onPress={handleWithoutMedia}
                >
                    <Text style={styles.withoutMediaText}>Without Media</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.cameraContainer}>
                <CameraView
                    style={styles.camera}
                    facing={facing}
                    ref={cameraRef}
                />

                <View style={styles.cameraOverlay}>
                    <View style={styles.topControls}>
                        <TouchableOpacity
                            style={styles.flipButton}
                            onPress={toggleCameraFacing}
                        >
                            <Image
                                source={flip_camera_icon}
                                style={styles.flipIcon}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.bottomControls}>
                <TouchableOpacity
                    style={styles.galleryButton}
                    onPress={handlePickImage}
                >
                    <Image source={gallery_icon} style={styles.controlIcon} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.captureButton}
                    onPress={handleTakePhoto}
                >
                    <View style={styles.captureButtonInner} />
                </TouchableOpacity>

                <View style={styles.placeholderButton} />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: globalStyles.dark.background,
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
    headerSpacer: {
        width: 44,
    },
    withoutMediaButton: {
        backgroundColor: globalStyles.main.accent,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    withoutMediaText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
    cameraContainer: {
        flex: 1,
        backgroundColor: "#000",
        position: "relative",
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        ...StyleSheet.absoluteFillObject,
        pointerEvents: "box-none",
    },
    topControls: {
        position: "absolute",
        top: 20,
        right: 20,
        flexDirection: "row",
        gap: 12,
    },
    flipButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        alignItems: "center",
        justifyContent: "center",
    },
    flipIcon: {
        width: 24,
        height: 24,
        tintColor: "#FFFFFF",
    },
    bottomControls: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 40,
        paddingVertical: 20,
        backgroundColor: globalStyles.dark.background,
        borderTopWidth: 1,
        borderTopColor: "rgba(255, 255, 255, 0.1)",
    },
    galleryButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    controlIcon: {
        width: 24,
        height: 24,
        tintColor: globalStyles.dark.textPrimary,
    },
    captureButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 4,
        borderColor: "#FFFFFF",
    },
    captureButtonInner: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#FFFFFF",
    },
    placeholderButton: {
        width: 48,
        height: 48,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        fontSize: 16,
        color: globalStyles.dark.textSecondary,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    permissionText: {
        fontSize: 16,
        color: globalStyles.dark.textPrimary,
        textAlign: "center",
        marginBottom: 20,
    },
    permissionButton: {
        backgroundColor: globalStyles.main.accent,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    permissionButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
});

export default CreatePostScreen;