/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import { Text, StyleSheet, Animated } from "react-native";

const PolicyDisclaymer = () => {
    return (
          <Animated.Text style={styles.policy}>
            By signing up or logging in, you consent to Naps{" "}
            <Text style={styles.link}>Terms of Use</Text> and{" "}
            <Text style={styles.link}>Privacy Policy</Text>
          </Animated.Text>
    );
}

export default PolicyDisclaymer;

const styles = StyleSheet.create({
  policy: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 12,
    maxWidth: 280,
    marginTop: 0,
  },
  link: {
    color: "#9561FB",
    textDecorationLine: "underline",
  },
})
