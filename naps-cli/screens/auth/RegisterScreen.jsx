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
    Image,
    TextInput,
    Text,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Animated,
    TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef, useContext } from "react";
import { useNavigation } from "@react-navigation/native";

import at_icon from "../../assets/icons/at.png";
import app_logo from "../../assets/logo/naps-logo-bordered.png";
import user_icon from "../../assets/icons/user.png";
import lock_icon from "../../assets/icons/lock.png";
import eye_off_icon from "../../assets/icons/eye.png";
import eye_icon from "../../assets/icons/eye-off.png";

import WelcomeInfo from "../../components/info/WelcomeInfo";
import AuthButton from "../../components/buttons/AuthButton";
import Footer from "../../components/footer/Footer";
import PolicyDisclaymer from "../../components/policy/PolicyDisclaymer";

import UserMetadataService from "../../services/UserMetadataService";
import AuthContext from "../../auth/AuthContext";
import { useHaptic } from "../../hooks/useHaptic";
import globalStyles from "../../styles";
import LocationService from "../../services/LocationService";

const RegisterScreen = ({ route }) => {
    const navigation = useNavigation();
    const { onCompleteRegistration } = useContext(AuthContext);

    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [serverMessage, setServerMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [isUsernameFocused, setIsUsernameFocused] = useState(false);
    const [isFullNameFocused, setIsFullNameFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    const [isUsernameWrong, setIsUsernameWrong] = useState(false);
    const [isFullNameWrong, setIsFullNameWrong] = useState(false);
    const [isPasswordWrong, setIsPasswordWrong] = useState(false);

    const [isUsernameCorrect, setIsUsernameCorrect] = useState(false);
    const [isFullNameCorrect, setIsFullNameCorrect] = useState(false);
    const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);

    const [fadeAnimation] = useState(new Animated.Value(0));
    const [shakeAnimation] = useState(new Animated.Value(0));

    const usernameInputRef = useRef(null);
    const fullNameInputRef = useRef(null);
    const passwordInputRef = useRef(null);

    const ERROR_VIBRATION_DURATION = 200;
    const haptics = useHaptic(ERROR_VIBRATION_DURATION);

    useEffect(() => {
        Animated.timing(fadeAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const shakeInput = () => {
        Animated.sequence([
            Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    const resetValidationStates = () => {
        setIsUsernameWrong(false);
        setIsFullNameWrong(false);
        setIsPasswordWrong(false);
        setIsUsernameCorrect(false);
        setIsFullNameCorrect(false);
        setIsPasswordCorrect(false);
    };

    const handleRegister = async () => {
        let hasError = false;

        resetValidationStates();

        if (!username.trim()) {
            setIsUsernameWrong(true);
            hasError = true;
        }

        if (!fullName.trim()) {
            setIsFullNameWrong(true);
            hasError = true;
        }

        if (!password.trim()) {
            setIsPasswordWrong(true);
            hasError = true;
        }

        if (hasError) {
            haptics.error && haptics.error();
            setServerMessage("Please fill in all fields correctly.");
            shakeInput();
            return;
        }

        setIsLoading(true);
        setServerMessage("");

        try {
            console.log("Fetching location data...");
            const locationService = new LocationService();
            const locationData = await locationService.getUserLocationDataWithRetry();
            const { latitude, longitude, city, country, timezone } = locationData;

            console.log("Fetching user metadata...");
            const metadataService = new UserMetadataService();
            const metadata = await metadataService.getUserMetadataWithRetry();
            const { os, device, app_version, ip_address } = metadata;

            const verified_id = route.params.uuid;

            const payload = {
                verified_id,
                username,
                full_name: fullName,
                password,
                latitude: latitude || null,
                longitude: longitude || null,
                city: city || null,
                country: country || null,
                timezone: timezone || null,
                os: os || null,
                device: device || null,
                app_version: app_version || null,
                ip_address: ip_address || null,
            };

            console.log("Registration payload:", payload);

            const res = await onCompleteRegistration(verified_id, payload);
            console.log("Registration success:", res);

            // Update UI states
            setServerMessage("Account created successfully!");
            setIsUsernameCorrect(true);
            setIsFullNameCorrect(true);
            setIsPasswordCorrect(true);

            haptics.success && haptics.success();
            navigation.navigate("UserHome", { userId: null });
        } catch (error) {
            console.error(
                "Registration failed:",
                error.response?.data || error.message
            );

            const message =
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Registration failed. Please try again.";

            setServerMessage(message);
            setIsUsernameWrong(true);
            setIsFullNameWrong(true);
            setIsPasswordWrong(true);

            shakeInput();
            haptics.error && haptics.error();
        } finally {
            setIsLoading(false);
        }
    };

    const navigateToLogin = () => navigation.navigate("Login");

    const getInputBorderColor = (isWrong, isCorrect, isFocused) => {
        if (isWrong) return globalStyles.main.red;
        if (isCorrect) return globalStyles.main.green;
        if (isFocused) return globalStyles.main.accent;
        return '#2A3542';
    };

    const getIconColor = (isWrong, isCorrect, isFocused) => {
        if (isWrong) return globalStyles.main.red;
        if (isCorrect) return globalStyles.main.green;
        if (isFocused) return globalStyles.main.accent;
        return '#888';
    };

    return (
        <SafeAreaView style={styles.register_screen}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll_container}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View
                        style={[
                            styles.main_content,
                            { opacity: fadeAnimation }
                        ]}
                    >
                        <View style={styles.logo_container}>
                            <Image source={app_logo} style={styles.logo} />
                        </View>

                        <WelcomeInfo
                            header="Create an account"
                            desc="Join Naps and start connecting."
                        />

                        <Animated.View
                            style={[
                                styles.input_wrapper,
                                {
                                    borderColor: getInputBorderColor(isUsernameWrong, isUsernameCorrect, isUsernameFocused),
                                    transform: [{ translateX: shakeAnimation }],
                                    ...Platform.select({
                                        ios: {
                                            shadowColor: isUsernameFocused ? globalStyles.main.accent : '#000',
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: isUsernameFocused ? 0.3 : 0.1,
                                            shadowRadius: isUsernameFocused ? 12 : 6,
                                        },
                                        android: {
                                            elevation: isUsernameFocused ? 8 : 3,
                                        },
                                    }),
                                }
                            ]}
                        >
                            <Image
                                source={at_icon}
                                style={[
                                    styles.icon,
                                    { tintColor: getIconColor(isUsernameWrong, isUsernameCorrect, isUsernameFocused) }
                                ]}
                            />
                            <TextInput
                                ref={usernameInputRef}
                                placeholder="Username"
                                placeholderTextColor={globalStyles.main.placeholderTextColor}
                                value={username}
                                onChangeText={(text) => {
                                    setUsername(text);
                                    setIsUsernameWrong(false);
                                    setIsUsernameCorrect(false);
                                    setServerMessage('');
                                }}
                                onFocus={() => setIsUsernameFocused(true)}
                                onBlur={() => setIsUsernameFocused(false)}
                                style={styles.input_field}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </Animated.View>

                        <Animated.View
                            style={[
                                styles.input_wrapper,
                                {
                                    borderColor: getInputBorderColor(isFullNameWrong, isFullNameCorrect, isFullNameFocused),
                                    transform: [{ translateX: shakeAnimation }],
                                    ...Platform.select({
                                        ios: {
                                            shadowColor: isFullNameFocused ? globalStyles.main.accent : '#000',
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: isFullNameFocused ? 0.3 : 0.1,
                                            shadowRadius: isFullNameFocused ? 12 : 6,
                                        },
                                        android: {
                                            elevation: isFullNameFocused ? 8 : 3,
                                        },
                                    }),
                                }
                            ]}
                        >
                            <Image
                                source={user_icon}
                                style={[
                                    styles.icon,
                                    { tintColor: getIconColor(isFullNameWrong, isFullNameCorrect, isFullNameFocused) }
                                ]}
                            />
                            <TextInput
                                ref={fullNameInputRef}
                                placeholder="Full name"
                                placeholderTextColor={globalStyles.main.placeholderTextColor}
                                value={fullName}
                                onChangeText={(text) => {
                                    setFullName(text);
                                    setIsFullNameWrong(false);
                                    setIsFullNameCorrect(false);
                                    setServerMessage('');
                                }}
                                onFocus={() => setIsFullNameFocused(true)}
                                onBlur={() => setIsFullNameFocused(false)}
                                style={styles.input_field}
                                autoCorrect={false}
                            />
                        </Animated.View>

                        <Animated.View
                            style={[
                                styles.input_wrapper,
                                {
                                    borderColor: getInputBorderColor(isPasswordWrong, isPasswordCorrect, isPasswordFocused),
                                    transform: [{ translateX: shakeAnimation }],
                                    ...Platform.select({
                                        ios: {
                                            shadowColor: isPasswordFocused ? globalStyles.main.accent : '#000',
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: isPasswordFocused ? 0.3 : 0.1,
                                            shadowRadius: isPasswordFocused ? 12 : 6,
                                        },
                                        android: {
                                            elevation: isPasswordFocused ? 8 : 3,
                                        },
                                    }),
                                    marginBottom: 20,
                                }
                            ]}
                        >
                            <Image
                                source={lock_icon}
                                style={[
                                    styles.icon,
                                    { tintColor: getIconColor(isPasswordWrong, isPasswordCorrect, isPasswordFocused) }
                                ]}
                            />
                            <TextInput
                                ref={passwordInputRef}
                                placeholder="Password"
                                placeholderTextColor={globalStyles.main.placeholderTextColor}
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    setIsPasswordWrong(false);
                                    setIsPasswordCorrect(false);
                                    setServerMessage('');
                                }}
                                onFocus={() => setIsPasswordFocused(true)}
                                onBlur={() => setIsPasswordFocused(false)}
                                style={[
                                    styles.input_field,
                                    { height: globalStyles.main.inputContainerDefaultHeight }
                                ]}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eye_button}
                            >
                                <Image
                                    source={showPassword ? eye_off_icon : eye_icon}
                                    style={[
                                        styles.icon,
                                        { tintColor: showPassword ? globalStyles.main.accent : '#888' }
                                    ]}
                                />
                            </TouchableOpacity>
                        </Animated.View>

                        {serverMessage ? (
                            <Animated.View style={{ marginBottom: 20 }}>
                                <Text
                                    style={[
                                        styles.message_text,
                                        {
                                            color: isUsernameWrong || isFullNameWrong || isPasswordWrong
                                                ? globalStyles.main.red
                                                : globalStyles.main.green
                                        }
                                    ]}
                                >
                                    {serverMessage}
                                </Text>
                            </Animated.View>
                        ) : null}

                        <AuthButton
                            text="Register"
                            onPress={handleRegister}
                            loading={isLoading}
                        />

                        <View style={{
                            alignSelf: "center",
                            marginTop: 20,
                        }}>
                            <PolicyDisclaymer />
                        </View>

                        <View style={styles.divider_container}>
                            <View style={styles.divider_line} />
                            <Text style={styles.divider_text}>or</Text>
                            <View style={styles.divider_line} />
                        </View>

                        <TouchableOpacity
                            style={styles.have_account}
                            onPress={navigateToLogin}
                        >
                            <Text style={styles.have_account_text}>
                                Already have an account?{" "}
                                <Text style={styles.login_link}>Login</Text>
                            </Text>
                        </TouchableOpacity>

                        <Footer />
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    register_screen: {
        flex: 1,
    },
    scroll_container: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 40,
    },
    main_content: {
        alignItems: 'center',
        width: '100%',
    },
    logo_container: {
        marginBottom: 30,
        ...Platform.select({
            ios: {
                shadowColor: globalStyles.main.accent,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    logo: {
        width: 140,
        height: 140,
        borderRadius: 28,
    },
    input_wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: globalStyles.main.inputBackgroundColor,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: '4%',
        borderWidth: 2,
        width: '100%',
        marginTop: 16,
        transition: 'all 0.3s ease',
    },
    icon: {
        width: 22,
        height: 22,
        marginRight: 12,
        resizeMode: 'contain',
    },
    eye_button: {
        padding: 4,
    },
    input_field: {
        flex: 1,
        color: globalStyles.dark.textPrimary,
        fontSize: 16,
        fontWeight: '500',
    },
    message_text: {
        width: '100%',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 12,
    },
    divider_container: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginVertical: 24,
    },
    divider_line: {
        flex: 1,
        height: 1,
        backgroundColor: '#2A3542',
    },
    divider_text: {
        color: '#888',
        fontSize: 14,
        marginHorizontal: 16,
        fontWeight: '500',
    },
    have_account: {
        marginBottom: 20,
    },
    have_account_text: {
        color: '#888',
        fontSize: 14,
        fontWeight: '500',
    },
    login_link: {
        color: globalStyles.main.accent,
        fontWeight: '700',
    },
});

export default RegisterScreen;