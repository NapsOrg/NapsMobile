/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import {
    View,
    Modal,
    Text,
    TouchableOpacity,
    StyleSheet,
    Pressable,
} from "react-native";

import globalStyles from "../../styles";

const CustomAlert = ({title, message, visible, onConfirm, onCancel, confirmText = "OK", cancelText = "Cancel"}) => {
    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <Pressable
                style={styles.overlay}
                onPress={onCancel}
                activeOpacity={1}
            >
                <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
                    <View style={styles.title}>
                        <Text style={styles.titleMessage}>{title}</Text>
                    </View>
                    <View style={styles.messageContainer}>
                        <Text style={styles.message}>{message}</Text>
                    </View>
                    <View style={styles.buttons}>
                        <TouchableOpacity
                            style={styles.buttonCancel}
                            onPress={onCancel}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.buttonCancelText}>{cancelText}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.buttonOk}
                            onPress={onConfirm}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.buttonOkText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: globalStyles.dark.backgroundColor,
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '85%',
        maxWidth: 400,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        width: '100%',
        marginBottom: 15,
    },
    titleMessage: {
        color: globalStyles.dark.textPrimary,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    messageContainer: {
        width: '100%',
        marginBottom: 20,
    },
    message: {
        color: globalStyles.dark.textSecondary,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    buttons: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        gap: 10,
    },
    buttonCancel: {
        flex: 1,
        height: 44,
        borderColor: globalStyles.main.red,
        borderRadius: 10,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    buttonCancelText: {
        color: globalStyles.main.red,
        fontSize: 16,
        fontWeight: '600',
    },
    buttonOk: {
        flex: 1,
        height: 44,
        backgroundColor: globalStyles.main.accent,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonOkText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default CustomAlert;