/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import { Text, StyleSheet, View, TouchableOpacity } from "react-native";

const Footer = () => {
    const handlePress = () => {
        console.log('Footer pressed');
    };

    return (
        <View style={styles.footer}>
            <View style={styles.divider} />
            <TouchableOpacity 
                style={styles.footerContent} 
                onPress={handlePress}
                activeOpacity={0.7}
            >
                <Text style={styles.footerText}>
                    Powered by{' '}
                    <Text style={styles.companyName}>Naps Solutions</Text>
                </Text>
                <Text style={styles.copyright}>
                    © {new Date().getFullYear()} All rights reserved
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default Footer;

const styles = StyleSheet.create({
    divider: {
        height: 1,
        marginHorizontal: 20,
    },
    footerContent: {
        paddingVertical: 20,
        paddingHorizontal: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerText: {
        color: '#666666',
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 4,
        fontWeight: '400',
    },
    companyName: {
        color: '#2A3542',
        fontWeight: '600',
    },
    copyright: {
        color: '#999999',
        fontSize: 11,
        textAlign: 'center',
        fontWeight: '300',
    },
});