/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * Licensed under GNU GPL v. 2 or later.
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import React from "react";
import { AuthProvider } from "./auth/AuthProvider";
import Navigator from "./navigation/Navigator";
import { SafeAreaView } from "react-native-safe-area-context";
import { SafeAreaProvider } from "react-native-safe-area-context";

import globalStyles from "./styles";

export default function App() {
    return (
        <AuthProvider>
            <SafeAreaProvider>
                <SafeAreaView style={{ backgroundColor: globalStyles.dark.backgroundColor, flex: 1 }}>
                    <Navigator />
                </SafeAreaView>
            </SafeAreaProvider>
        </AuthProvider>
    );
}