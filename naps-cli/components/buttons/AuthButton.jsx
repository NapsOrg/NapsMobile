/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import globalStyles from "../../styles";

const AuthButton = ({ text, onPress, loading }) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={styles.text}>{text}</Text>
      )}
    </TouchableOpacity>
  );
};

export default AuthButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: globalStyles.main.accent,
    paddingVertical: 12,
    width: "100%",
    maxWidth: 400,
    height: "100%",
    maxHeight: 60,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
