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

import WelcomeInfo from "../../components/info/WelcomeInfo";
import AuthButton from "../../components/buttons/AuthButton";
import Footer from "../../components/footer/Footer";

import AuthContext from "../../auth/AuthContext";
import { useHaptic } from "../../hooks/useHaptic";
import globalStyles from "../../styles";

const WelcomeScreen = () => {
    const [email, setEmail] = useState('');
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isEmailWrong, setIsEmailWrong] = useState(false);
    const [isEmailCorrect, setIsEmailCorrect] = useState(false);
    const [serverMessage, setServerMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [shakeAnimation] = useState(new Animated.Value(0));
    const [fadeAnimation] = useState(new Animated.Value(0));

    const navigation = useNavigation();
    const { onRegister } = useContext(AuthContext);

    const emailInputRef = useRef(null);
    const ERROR_VIBRATION_DURATION = 200;
    const haptics = useHaptic(ERROR_VIBRATION_DURATION);

    useEffect(() => {
        Animated.timing(fadeAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const navigateToLogin = () => {
        navigation.navigate("Login");
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

    const handleStart = async () => {
        if (email.trim() === '' || !validateEmail(email)) {
            setIsEmailWrong(true);
            setIsEmailCorrect(false);
            setServerMessage('Please enter a valid email address.');
            haptics.error && haptics.error();
            shakeInput();
            return;
        }

        setIsEmailWrong(false);
        setServerMessage('');

        setIsLoading(true);

        try {
            const res = await onRegister(email);
            console.log('Registration response:', res.data);

            setServerMessage(res.data?.detail || 'Registration successful!');
            setIsEmailWrong(false);
            setIsEmailCorrect(true);
            navigation.navigate('VerifyEmail', { email });
        } catch (error) {
            console.error('Registration failed:', error.response?.data || error.message);

            const message = error.response?.data?.detail || 'Registration failed';
            setServerMessage(message);

            setIsEmailWrong(true);
            setIsEmailCorrect(false);
            shakeInput();
            haptics.error && haptics.error();
        } finally {
            setIsLoading(false);
        }
    }

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
        <SafeAreaView style={styles.welcome_screen}>
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
                            header="Welcome to Naps!"
                            desc="Provide your email to get started."
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

                        {serverMessage ? (
                            <Animated.View style={{ marginBottom: 20 }}>
                                <Text
                                    style={[
                                        styles.message_text,
                                        {
                                            color: isEmailWrong
                                                ? globalStyles.main.red
                                                : globalStyles.main.green
                                        }
                                    ]}
                                >
                                    {serverMessage}
                                </Text>
                            </Animated.View>
                        ) : null}

                        <TouchableOpacity
                            style={styles.have_account}
                            onPress={navigateToLogin}
                        >
                            <Text style={styles.have_account_text}>
                                Already have an account?{" "}
                                <Text style={styles.login_link}>
                                    Login
                                </Text>
                            </Text>
                        </TouchableOpacity>

                        <AuthButton
                            text="Get Started"
                            onPress={handleStart}
                            loading={isLoading}
                        />

                        <View style={styles.divider_container}>
                            <View style={styles.divider_line} />
                            <Text style={styles.divider_text}>or</Text>
                            <View style={styles.divider_line} />
                        </View>

                        <Footer />
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    welcome_screen: {
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
        height: '5%',
        marginTop: 16,
        transition: 'all 0.3s ease',
    },
    icon: {
        width: 22,
        height: 22,
        marginRight: 12,
        resizeMode: 'contain',
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
    have_account: {
        marginTop: 12,
        marginBottom: 24,
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
});

export default WelcomeScreen;