/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import { Text, StyleSheet, Animated } from "react-native";

import globalStyles from "../../styles";

const WelcomeInfo = ({header, desc}) => {
    return (
          <Animated.View style={styles.info}>
            <Text style={styles.header}>{header}</Text>
            <Text style={styles.description}>
              {desc}
            </Text>
          </Animated.View>
    );
}

export default WelcomeInfo;

const styles = StyleSheet.create({
  info: {
    alignItems: "center",
    marginBottom: 30,
  },
  header: {
    color: globalStyles.dark.textPrimary,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    color: globalStyles.dark.textSecondary,
    fontSize: 14,
    textAlign: "center",
    maxWidth: 180,
  },
})
