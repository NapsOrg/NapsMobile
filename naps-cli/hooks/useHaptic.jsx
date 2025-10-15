import { useCallback, useMemo } from "react";
import { Platform, Vibration } from "react-native";
import * as Haptics from "expo-haptics";

export const useHaptic = (durationMs = 2000) => {
    const createHapticHandler = useCallback((type) => {
        return Platform.OS === "web" ? undefined : () => Haptics.impactAsync(type);
    }, []);

    const createNotificationFeedback = useCallback((type) => {
        return Platform.OS === "web" ? undefined : () => Haptics.notificationAsync(type);
    }, []);

    const vibrate = useCallback(() => {
        if (Platform.OS !== "web") {
            Vibration.vibrate(durationMs);
        }
    }, [durationMs]);

    const hapticHandlers = useMemo(
        () => ({
            light: createHapticHandler(Haptics.ImpactFeedbackStyle.Light),
            medium: createHapticHandler(Haptics.ImpactFeedbackStyle.Medium),
            heavy: createHapticHandler(Haptics.ImpactFeedbackStyle.Heavy),
            selection: Platform.OS === "web" ? undefined : Haptics.selectionAsync,
            success: createNotificationFeedback(Haptics.NotificationFeedbackType.Success),
            warning: createNotificationFeedback(Haptics.NotificationFeedbackType.Warning),
            error: createNotificationFeedback(Haptics.NotificationFeedbackType.Error),
            vibrate,
        }),
        [createHapticHandler, createNotificationFeedback, vibrate]
    );

    return hapticHandlers;
};
