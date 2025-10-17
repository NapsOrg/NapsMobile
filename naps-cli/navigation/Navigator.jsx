/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import React, { useMemo, useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import {
    NavigationContainer,
    DefaultTheme,
    DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Navbar from "../components/navbar/Navbar";

import WelcomeScreen from "../screens/auth/WelcomeScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import VerifyEmailScreen from "../screens/auth/VerifyEmailScreen";
import UserHomeScreen from "../screens/user/UserHomeScreen";
import UserSearchScreen from "../screens/user/UserSearchScreen";
import CreatePostScreen from "../screens/post/CreatePostScreen";
import CreatePostEditor from "../screens/post/CreatePostEditor";
import CreatePostText from "../screens/post/CreatePostText";
import PostDetailScreen from "../screens/post/PostDetailScreen";
import FeedScreen from "../screens/feed/FeedScreen";
import MapScreen from "../screens/map/MapsScreen";
import FollowersScreen from "../screens/followers/FollowersScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import UpdateUserScreen from "../screens/user/UpdateUserScreen";

import globalStyles from "../styles";
import JwtTokenService from "../services/JwtTokenService";

const Stack = createNativeStackNavigator();
const authScreens = ["Welcome", "Login", "Register", "VerifyEmail"];

export default function Navigator() {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [currentRoute, setCurrentRoute] = useState(null);
    const [initialRoute, setInitialRoute] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const jwtService = new JwtTokenService();

            await jwtService.removeToken();

            const isAuth = await jwtService.isAuthenticated();
            const startRoute = isAuth ? "UserHome" : "Welcome";

            setInitialRoute(startRoute);
            setCurrentRoute(startRoute);
            setLoading(false);
        };

        checkAuth();
    }, []);

    const MyTheme = useMemo(() => {
        const baseTheme = isDarkMode ? DarkTheme : DefaultTheme;
        const bgColor = isDarkMode
            ? globalStyles.dark.backgroundColor
            : globalStyles.light.backgroundColor;

        return {
            ...baseTheme,
            colors: {
                ...baseTheme.colors,
                background: bgColor,
                card: bgColor,
                primary: bgColor,
                border: bgColor,
            },
        };
    }, [isDarkMode]);

    const defaultScreenOptions = {
        headerShown: false,
        contentStyle: {
            backgroundColor: isDarkMode
                ? globalStyles.dark.backgroundColor
                : globalStyles.light.backgroundColor,
        },
        animation: "default",
    };

    if (loading || !initialRoute) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#9561FB" />
            </View>
        );
    }

    return (
        <NavigationContainer
            theme={MyTheme}
            onStateChange={(state) => {
                const routeName = state.routes[state.index].name;
                setCurrentRoute(routeName);
            }}
        >
            <Stack.Navigator
                initialRouteName={initialRoute}
                screenOptions={defaultScreenOptions}
            >
                {/* Auth */}
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />

                {/* User */}
                <Stack.Screen name="UserHome" component={UserHomeScreen} />
                <Stack.Screen name="UserSearch" component={UserSearchScreen} />
                <Stack.Screen name="Followers" component={FollowersScreen} />
                <Stack.Screen name="UpdateUser" component={UpdateUserScreen} />

                {/* Feed / Map */}
                <Stack.Screen name="Feed" component={FeedScreen} />
                <Stack.Screen name="Map" component={MapScreen} />

                {/* Posts */}
                <Stack.Screen name="CreatePost" component={CreatePostScreen} />
                <Stack.Screen name="CreatePostEditor" component={CreatePostEditor} />
                <Stack.Screen name="CreatePostText" component={CreatePostText} />
                <Stack.Screen name="PostDetail" component={PostDetailScreen} />

                {/* Settings */}
                <Stack.Screen name="Settings" component={SettingsScreen} />
            </Stack.Navigator>

            {/* Navbar */}
            {!authScreens.includes(currentRoute) &&
                !["CreatePost", "CreatePostEditor", "CreatePostText"].includes(
                    currentRoute
                ) && (
                    <View style={StyleSheet.absoluteFill}>
                        <Navbar
                            currentRoute={
                                currentRoute === "Followers" ? "UserHome" : currentRoute
                            }
                        />
                    </View>
                )}
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: globalStyles.dark.backgroundColor,
    },
});
