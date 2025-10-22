/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";
import { Ionicons } from "@expo/vector-icons";

const MessageEmptyChatView = ({ username }) => {
  return (
    <Animatable.View animation="fadeIn" duration={800} style={styles.container}>
        <View style={styles.container}>
        <Ionicons
            name="chatbubbles-outline"
            size={64}
            color="rgba(255,255,255,0.5)"
            style={styles.icon}
        />
        <Text style={styles.text}>
            No messages yet{'\n'}
            <Text style={styles.username}>with @{username}</Text>
        </Text>
        </View>
    </Animatable.View>    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  icon: {
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    color: "rgba(255,255,255,0.7)",
    lineHeight: 22,
  },
  username: {
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default MessageEmptyChatView;
