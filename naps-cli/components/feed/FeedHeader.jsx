/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import {
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
} from "react-native";

import { useEffect, useState } from "react";

import UserService from "../../services/UserService";

import settings_icon from "../../assets/icons/settings.png";
import user_default_logo from "../../assets/logo/defaul_user_logo.jpg";
import logo_icon from "../../assets/icons/logo.png";
import globalStyles from "../../styles";

const FeedHeader = ({ onLogoPress, onProfilePress, onMenuPress }) => {
    const [userAvatar, setUserAvatar] = useState(user_default_logo);
    const userService = new UserService();

    const fetchAvatar = async () => {
        try {
            const res = await userService.getUserAvatarUrl();
            if (res.status === 200 && res.data?.url) {
                setUserAvatar({ uri: res.data.url });
            } else {
                setUserAvatar(user_default_logo);
            }
        } catch (error) {
            console.log("Problem with fetching avatar: ", error);
            setUserAvatar(user_default_logo);
        }
    };

    useEffect(() => {
        fetchAvatar();
    }, []);

    return (
        <View style={styles.headerContainer}>
            <TouchableOpacity onPress={onProfilePress}>
                <Image
                    source={userAvatar}
                    style={styles.userIcon}
                />
            </TouchableOpacity>

            <TouchableOpacity onPress={onLogoPress}>
                <Image
                    source={logo_icon}
                    style={styles.logoIcon}
                />
            </TouchableOpacity>

            <TouchableOpacity onPress={onMenuPress}>
                <Image
                    source={settings_icon}
                    style={styles.menuIcon}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 30,
        backgroundColor: globalStyles.dark.backgroundColor,
        marginBottom: 20,
    },
    userIcon: {
        width: 25,
        height: 25,
        borderRadius: 20,
    },
    logoIcon: {
        width: 25,
        height: 25,
        tintColor: "#fff",
        transform: [{ rotate: "135deg" }],
    },
    menuIcon: {
        width: 25,
        height: 25,
        tintColor: "#fff",
    },
});

export default FeedHeader;