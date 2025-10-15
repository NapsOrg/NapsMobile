/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import {
    View,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Animated,
} from "react-native";

import { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import UserService from "../../services/UserService";
import DefaultPageHeader from "../../components/header/DefaultPageHeader";
import globalStyles from "../../styles";

const MAX_BIO_LENGTH = 80;

const UpdateUserScreen = () => {
    const navigation = useNavigation();
    const userService = new UserService();

    const [fullName, setFullName] = useState("");
    const [bio, setBio] = useState("");
    const [originalData, setOriginalData] = useState({ fullName: "", bio: "" });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const res = await userService.getMyProfile();
            if (res.status === 200) {
                setFullName(res.data.full_name || "");
                setBio(res.data.bio || "");
                setOriginalData({
                    fullName: res.data.full_name || "",
                    bio: res.data.bio || "",
                });
            }
        } catch (error) {
            console.log("Problem with fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        setSaving(true);
        try {
            const updates = {};
            if (fullName !== originalData.fullName) updates.full_name = fullName;
            if (bio !== originalData.bio) updates.bio = bio;

            const res = await userService.updateProfile(updates);
            if (res.status === 200) {
                navigation.navigate("UserHome");
            }
        } catch (error) {
            console.log("Error updating profile:", error);
        } finally {
            setSaving(false);
        }
    };

    const hasChanges =
        fullName !== originalData.fullName || bio !== originalData.bio;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: hasChanges ? 1 : 0,
            duration: 250,
            useNativeDriver: true,
        }).start();
    }, [hasChanges]);

    useEffect(() => {
        fetchUserData();
    }, []);

    const handleBioChange = (text) => {
        if (text.length <= MAX_BIO_LENGTH) setBio(text);
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={globalStyles.main.accent} />
            </View>
        );
    }

    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: globalStyles.dark.backgroundColor },
            ]}
        >
            <View style={styles.headerContainer}>
                <DefaultPageHeader title="Update Profile" />
                <Animated.View style={{ opacity: fadeAnim }}>
                    {hasChanges && (
                        <TouchableOpacity
                            onPress={handleUpdate}
                            disabled={saving}
                            style={styles.saveButton}
                        >
                            {saving ? (
                                <ActivityIndicator
                                    size="small"
                                    color={globalStyles.main.accent}
                                />
                            ) : (
                                <Ionicons
                                    name="checkmark"
                                    size={26}
                                    color={globalStyles.main.accent}
                                />
                            )}
                        </TouchableOpacity>
                    )}
                </Animated.View>
            </View>

            <View style={styles.updateBlock}>
                <View style={styles.inputBlock}>
                    <Text style={styles.inputBlockTitle}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Enter your full name"
                        placeholderTextColor={
                            globalStyles.main.placeholderTextColor
                        }
                    />
                </View>

                <View style={styles.inputBlock}>
                    <Text style={styles.inputBlockTitle}>Bio</Text>
                    <TextInput
                        style={[styles.input, { height: 100, textAlignVertical: "top" }]}
                        value={bio}
                        onChangeText={handleBioChange}
                        multiline
                        placeholder="Tell something about yourself"
                        placeholderTextColor={
                            globalStyles.main.placeholderTextColor
                        }
                    />
                    <Text style={styles.charCounter}>
                        {bio.length}/{MAX_BIO_LENGTH}
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: globalStyles.dark.backgroundColor,
    },
    updateBlock: {
        marginTop: 24,
    },
    inputBlock: {
        marginBottom: 20,
    },
    inputBlockTitle: {
        color: globalStyles.main.accent,
        fontWeight: "bold",
        fontSize: 14,
        marginBottom: 6,
    },
    input: {
        backgroundColor: globalStyles.main.inputBackgroundColor,
        color: globalStyles.dark.textPrimary,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
    },
    charCounter: {
        color: globalStyles.main.textSecondary || "#888",
        fontSize: 12,
        textAlign: "right",
        marginTop: 4,
    },
    saveButton: {
        padding: 8,
    },
});

export default UpdateUserScreen;