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
import { useState, useRef, useEffect, useContext } from "react";
import { useNavigation } from "@react-navigation/native";

import app_logo from "../../assets/logo/naps-logo-bordered.png";
import envelope_icon from "../../assets/icons/envelope.png";
import lock_icon from "../../assets/icons/lock.png";
import eye_off_icon from "../../assets/icons/eye.png";
import eye_icon  from "../../assets/icons/eye-off.png";

import WelcomeInfo from "../../components/info/WelcomeInfo";
import AuthButton from "../../components/buttons/AuthButton";
import Footer from "../../components/footer/Footer";

import AuthContext from "../../auth/AuthContext";
import { useHaptic } from "../../hooks/useHaptic";
import globalStyles from "../../styles";
import PolicyDisclaymer from "../../components/policy/PolicyDisclaymer";

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [isEmailWrong, setIsEmailWrong] = useState(false);
    const [isEmailCorrect, setIsEmailCorrect] = useState(false);
    const [isPasswordWrong, setIsPasswordWrong] = useState(false);
    const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
    const [serverMessage, setServerMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [shakeAnimation] = useState(new Animated.Value(0));
    const [fadeAnimation] = useState(new Animated.Value(0));
    const [showPassword, setShowPassword] = useState(false);

    const { onLogin } = useContext(AuthContext);

    const emailInputRef = useRef(null);
    const passwordInputRef = useRef(null);
    const ERROR_VIBRATION_DURATION = 200;
    const haptics = useHaptic(ERROR_VIBRATION_DURATION);

    const navigation = useNavigation();

    useEffect(() => {
        Animated.timing(fadeAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const navigateToWelcome = () => {
        navigation.navigate("Welcome");
    }

    const shakeInput = () => {
        Animated.sequence([
            Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    }

    const validateEmail = (text) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);

    const handleLogin = async () => {
        let hasError = false;

        if (email.trim() === '' || !validateEmail(email) || password.trim() === '') {
            setIsEmailWrong(true);
            setIsEmailCorrect(false);
            setIsPasswordWrong(true);
            setIsPasswordCorrect(false);
            hasError = true;
        }

        if (hasError) {
            haptics.error && haptics.error();
            shakeInput();
            setServerMessage(
                'Please enter a valid email credentials.'
            );
            return;
        }

        setIsLoading(true);
        setServerMessage('');

        try {
            const res = await onLogin(email, password);
            console.log("Login response:", res.data);

            setServerMessage("Welcome back! Redirecting...");
            setIsEmailCorrect(true);
            setIsPasswordCorrect(true);
            setIsEmailWrong(false);
            setIsPasswordWrong(false);

            navigation.navigate("UserHome", {userId: null});

        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);

            const message = error.response?.data?.detail || "Invalid credentials. Please try again.";
            setServerMessage(message);

            setIsEmailWrong(true);
            setIsPasswordWrong(true);
            setIsEmailCorrect(false);
            setIsPasswordCorrect(false);
            shakeInput();
            haptics.error && haptics.error();
        } finally {
            setIsLoading(false);
        }
    };

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
        <SafeAreaView style={styles.login_screen}>
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
                            header="Welcome back!"
                            desc="Please enter your credentials to continue."
                        />

                        <Animated.View
                            style={[
                                styles.input_wrapper,
                                {
                                    borderColor: getInputBorderColor(isEmailWrong, isEmailCorrect, isEmailFocused),
                                    transform: [{ translateX: shakeAnimation }],
                                    ...Platform.select({
                                        ios: {
                                            shadowColor: isEmailFocused ? globalStyles.main.accent : '#000',
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: isEmailFocused ? 0.3 : 0.1,
                                            shadowRadius: isEmailFocused ? 12 : 6,
                                        },
                                        android: {
                                            elevation: isEmailFocused ? 8 : 3,
                                        },
                                    }),
                                }
                            ]}
                        >
                            <Image
                                source={envelope_icon}
                                style={[
                                    styles.icon,
                                    { tintColor: getIconColor(isEmailWrong, isEmailCorrect, isEmailFocused) }
                                ]}
                            />
                            <TextInput
                                ref={emailInputRef}
                                style={styles.input_field}
                                placeholder="Email address"
                                placeholderTextColor={globalStyles.main.placeholderTextColor}
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    setIsEmailWrong(false);
                                    setIsEmailCorrect(false);
                                    setServerMessage('');
                                }}
                                onFocus={() => setIsEmailFocused(true)}
                                onBlur={() => setIsEmailFocused(false)}
                                keyboardType="email-address"
                                autoCapitalize="none"
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
                                style={[
                                    styles.input_field,
                                    { height: globalStyles.main.inputContainerDefaultHeight }
                                ]}
                                placeholder="Password"
                                placeholderTextColor={globalStyles.main.placeholderTextColor}
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    setIsPasswordWrong(false);
                                    setIsPasswordCorrect(false);
                                    setServerMessage('');
                                }}
                                onFocus={() => setIsPasswordFocused(true)}
                                onBlur={() => setIsPasswordFocused(false)}
                                secureTextEntry={!showPassword}
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
                            <Animated.View
                                style={{marginBottom: 20}}>
                                <Text
                                    style={[
                                        styles.message_text,
                                        {
                                            color: isEmailWrong || isPasswordWrong
                                                ? globalStyles.main.red
                                                : globalStyles.main.green
                                        }
                                    ]}
                                >
                                    {serverMessage}
                                </Text>
                            </Animated.View>
                        ) : null}

                        <TouchableOpacity style={styles.forgot_password}>
                            <Text style={styles.forgot_text}>Forgot password?</Text>
                        </TouchableOpacity>

                        <AuthButton
                            text="Login"
                            onPress={handleLogin}
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
                            style={styles.signup_container}
                            onPress={navigateToWelcome}
                        >
                            <Text style={styles.signup_text}>
                                Don't have an account? <Text style={styles.signup_link}>Sign up</Text>
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
    login_screen: {
        flex: 1,
    },
    scroll_container: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 40
    },
    main_content: {
        alignItems: 'center',
        width: '100%'
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
        borderWidth: 2,
        width: '100%',
        height: '4%',
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
    forgot_password: {
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 24,
    },
    forgot_text: {
        color: globalStyles.main.accent,
        fontSize: 14,
        fontWeight: '600',
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
    signup_container: {
        marginBottom: 20,
    },
    signup_text: {
        color: '#888',
        fontSize: 14,
        fontWeight: '500',
    },
    signup_link: {
        color: globalStyles.main.accent,
        fontWeight: '700',
    },
});

export default LoginScreen;