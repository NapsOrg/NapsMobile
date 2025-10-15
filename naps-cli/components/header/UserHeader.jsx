/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import { Text, Image, View, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import arrow_icon from '../../assets/icons/angle-left.png';
import dots_icon from '../../assets/icons/menu-dots.png';

import globalStyles from "../../styles";

const isWeb = Platform.OS === "web";
const HEADER_HEIGHT = isWeb ? 100 : 64;

const SIZES = {
  horizontalPadding: 30,
  headerIcon: 18,
};

const UserHeader = ({user_name, isOnline = true}) => {

    const navigation = useNavigation();
    const [dots, setDots] = useState('');

    const handleBackPress = useCallback(() => {
    navigation.goBack();
    }, [navigation]);

    const handleMenuPress = useCallback(() => {
    console.log("Menu pressed");
    }, []);

    useEffect(() => {
      if (!isOnline) {
        const interval = setInterval(() => {
          setDots(prev => {
            if (prev.length >= 3) return '';
            return prev + '.';
          });
        }, 500);

        return () => clearInterval(interval);
      } else {
        setDots('');
      }
    }, [isOnline]);

    return (
        <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              activeOpacity={0.7}
              onPress={handleBackPress}
            >
              <Image source={arrow_icon} style={styles.headerIcon} />
            </TouchableOpacity>

            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>
                {isOnline ? `@${user_name}` : `Connecting${dots}`}
              </Text>
              {isOnline && (
                <View style={styles.headerSubtitle}>
                  <View style={styles.onlineIndicator} />
                  <Text style={styles.headerSubtitleText}>Online</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.headerButton}
              activeOpacity={0.7}
              onPress={handleMenuPress}
            >
              <Image source={dots_icon} style={styles.headerIcon} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
 header: {
    height: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.horizontalPadding,
    backgroundColor: globalStyles.dark.backgroundColor,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  headerButton: {
    alignItems: "center",
    justifyContent: "center",
  },

  headerIcon: {
    width: SIZES.headerIcon,
    height: SIZES.headerIcon,
    tintColor: globalStyles.dark.textPrimary,
  },

  headerTitleContainer: {
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    color: globalStyles.dark.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  headerSubtitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: globalStyles.main.green,
    marginRight: 6,
  },
  headerSubtitleText: {
    color: globalStyles.dark.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
});

export default UserHeader;