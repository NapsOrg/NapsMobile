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
import pin_icon from "../../assets/icons/pin.png";

import WelcomeInfo from "../../components/info/WelcomeInfo";
import AuthButton from "../../components/buttons/AuthButton";
import Footer from "../../components/footer/Footer";

import AuthContext from "../../auth/AuthContext";
import { useHaptic } from "../../hooks/useHaptic";
import globalStyles from "../../styles";

const VerifyEmailScreen = ({ route }) => {
    const [verificationCode, setVerificationCode] = useState('');
    const [isCodeFocused, setIsCodeFocused] = useState(false);
    const [isCodeWrong, setIsCodeWrong] = useState(false);
    const [isCodeCorrect, setIsCodeCorrect] = useState(false);
    const [serverMessage, setServerMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [shakeAnimation] = useState(new Animated.Value(0));
    const [fadeAnimation] = useState(new Animated.Value(0));
    const [isResending, setIsResending] = useState(false);

    const navigation = useNavigation();
    const { onVerifyEmail } = useContext(AuthContext);
    const { onSendCode } = useContext(AuthContext);

    const { email } = route.params;

    const CODE_LENGTH = 5;
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
    }

    const handleResend = async () => {
        try {
            if (isResending) return;

            setIsResending(true);
            await onSendCode(email);
            setServerMessage('Code resent successfully!');
            haptics.light && haptics.light();
        } catch (error) {
            console.error('Resend failed:', error.response?.data || error.message);
            const message = error.response?.data?.detail || 'Resend failed';
            setServerMessage(message);
            haptics.error && haptics.error();
        } finally {
            setIsResending(false);
        }
    }

    const handleVerify = async () => {
        if (verificationCode.length !== CODE_LENGTH) {
            setIsCodeWrong(true);
            setIsCodeCorrect(false);
            setServerMessage(`Code must be ${CODE_LENGTH} digits.`);
            haptics.error && haptics.error();
            shakeInput();
            return;
        }

        setIsLoading(true);
        setServerMessage('');

        try {
            const res = await onVerifyEmail(email, verificationCode);
            console.log('Verification response:', res.data);
            setIsCodeCorrect(true);
            setIsCodeWrong(false);
            setServerMessage('Email verified successfully!');

            let uuid = res.data?.uuid;
            navigation.navigate('Register', { uuid });
        } catch (error) {
            console.error('Verification failed:', error.response?.data || error.message);
            const message = error.response?.data?.detail || 'Verification failed';
            setServerMessage(message);
            setIsCodeWrong(true);
            setIsCodeCorrect(false);
            haptics.error && haptics.error();
            shakeInput();
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <SafeAreaView style={styles.screen}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll_container}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View style={{ flex: 1, opacity: fadeAnimation, alignItems: 'center' }}>
                        <Image source={app_logo} style={styles.logo} />
                        <WelcomeInfo
                            header="Verify Your Email"
                            desc={`We sent a ${CODE_LENGTH} digit \n verification code to ${email}.`}
                        />

                        <Animated.View
                            style={[
                                styles.input_wrapper,
                                { transform: [{ translateX: shakeAnimation }] },
                                isCodeFocused && styles.inputActive,
                                isCodeWrong && styles.inputError,
                                isCodeCorrect && styles.inputCorrect,
                            ]}
                        >
                            <Image
                                source={pin_icon}
                                style={[
                                    styles.icon,
                                    isCodeFocused && { tintColor: globalStyles.main.accent },
                                    isCodeWrong && { tintColor: globalStyles.main.red },
                                    isCodeCorrect && { tintColor: globalStyles.main.green },
                                ]}
                            />
                            <TextInput
                                style={styles.input_field}
                                placeholder="Enter code"
                                placeholderTextColor={globalStyles.main.placeholderTextColor}
                                value={verificationCode}
                                onChangeText={(text) => {
                                    setVerificationCode(text);
                                    setIsCodeWrong(false);
                                    setIsCodeCorrect(false);
                                    setServerMessage('');
                                }}
                                onFocus={() => setIsCodeFocused(true)}
                                onBlur={() => setIsCodeFocused(false)}
                                keyboardType="number-pad"
                                maxLength={CODE_LENGTH}
                            />
                        </Animated.View>

                        {serverMessage ? (
                            <Text
                                style={{
                                    color: isCodeWrong ? globalStyles.main.red : globalStyles.main.green,
                                    fontSize: 12,
                                    marginBottom: 20,
                                }}
                            >
                                {serverMessage}
                            </Text>
                        ) : null}

                        <AuthButton
                            text="Verify"
                            onPress={handleVerify}
                            loading={isLoading}
                        />

                        <TouchableOpacity
                            style={styles.resend_container}
                            onPress={handleResend}>
                            <Text style={styles.resend_text}>
                                Didn't get a code? <Text style={styles.resend_link}> {isResending ? 'Resending...' : 'Resend code'} </Text>
                            </Text>
                        </TouchableOpacity>

                        <Footer />
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    scroll_container: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 40
    },
    logo: {
        width: 150,
        height: 150,
        alignSelf: 'center',
        marginBottom: 20
    },
    input_wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: globalStyles.main.inputBackgroundColor,
        borderRadius: 16,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#2A3542',
        width: '100%',
        height: '10%',
        marginTop: 20,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        marginBottom: 20,
    },
    inputActive: {
        borderColor: globalStyles.main.accent,
        shadowColor: globalStyles.main.accent,
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
    },
    inputError: {
        borderColor: globalStyles.main.red
    },
    inputCorrect: {
        borderColor: globalStyles.main.green
    },
    icon: {
        width: 24,
        height: 24,
        marginRight: 10,
        resizeMode: 'contain',
        tintColor: '#888'
    },
    input_field: {
        flex: 1,
        color: globalStyles.dark.textPrimary,
        fontSize: 16
    },
    resend_container: {
        marginTop: 20,
    },
    resend_text: {
        color: '#888',
        fontSize: 14,
        fontWeight: '500',
    },
    resend_link: {
        color: globalStyles.main.accent,
        fontWeight: '700',
    },
});

export default VerifyEmailScreen;