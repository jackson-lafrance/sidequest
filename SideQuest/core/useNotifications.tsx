import { useState, useEffect, useRef, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

const NOTIFICATION_TOKEN_KEY = '@sidequest_push_token';
const NOTIFICATIONS_ENABLED_KEY = '@sidequest_notifications_enabled';

export interface ScheduledNotification {
    id: string;
    title: string;
    body: string;
    trigger: Date | number; // Date for absolute time, number for seconds from now
}

export interface UseNotificationsReturn {
    expoPushToken: string | null;
    notification: Notifications.Notification | null;
    notificationsEnabled: boolean;
    setNotificationsEnabled: (enabled: boolean) => Promise<void>;
    scheduleNotification: (notification: ScheduledNotification) => Promise<string | null>;
    scheduleDailyReminder: (hour: number, minute: number) => Promise<string | null>;
    cancelNotification: (id: string) => Promise<void>;
    cancelAllNotifications: () => Promise<void>;
    sendLocalNotification: (title: string, body: string) => Promise<string | null>;
    requestPermissions: () => Promise<boolean>;
}

async function setupNotifications(): Promise<string | null> {
    let token: string | null = null;

    // Set up Android notification channels first (works without permissions)
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#D4A84B',
        });

        await Notifications.setNotificationChannelAsync('reminders', {
            name: 'Quest Reminders',
            description: 'Daily reminders to complete your quests',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#D4A84B',
        });
    }

    // Check if we're on a physical device (simulators have limited notification support)
    if (!Device.isDevice) {
        console.log('Running on simulator - notifications may have limited functionality');
        // Still return null for token, but notifications will work locally
        return null;
    }

    // Check current permission status
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permission if not already granted
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Permission for push notifications not granted');
        return null;
    }

    // Try to get Expo push token (for remote push notifications)
    // This is optional - local notifications work without it
    try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        
        if (projectId) {
            const pushToken = await Notifications.getExpoPushTokenAsync({ projectId });
            token = pushToken.data;
            console.log('Expo push token:', token);
        } else {
            // No project ID - that's fine, local notifications still work
            console.log('No EAS project ID - local notifications will work, remote push requires EAS setup');
        }
    } catch (error) {
        // Token generation failed - local notifications still work
        console.log('Push token not available (local notifications still work):', error);
    }

    return token;
}

export function useNotifications(): UseNotificationsReturn {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [notification, setNotification] = useState<Notifications.Notification | null>(null);
    const [notificationsEnabled, setNotificationsEnabledState] = useState(true);
    
    const notificationListener = useRef<Notifications.Subscription | null>(null);
    const responseListener = useRef<Notifications.Subscription | null>(null);

    useEffect(() => {
        // Load saved notification preference
        AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY).then((value) => {
            if (value !== null) {
                setNotificationsEnabledState(value === 'true');
            }
        });

        // Set up notifications and try to get push token
        setupNotifications().then((token) => {
            if (token) {
                setExpoPushToken(token);
                AsyncStorage.setItem(NOTIFICATION_TOKEN_KEY, token);
            }
        });

        // Listen for incoming notifications (when app is in foreground)
        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
            setNotification(notification);
        });

        // Listen for notification responses (when user taps notification)
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            const data = response.notification.request.content.data;
            console.log('Notification tapped:', data);
            // Handle navigation or actions based on notification data
        });

        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, []);

    const setNotificationsEnabled = useCallback(async (enabled: boolean) => {
        setNotificationsEnabledState(enabled);
        await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, enabled.toString());
        
        if (!enabled) {
            // Cancel all scheduled notifications when disabled
            await Notifications.cancelAllScheduledNotificationsAsync();
        }
    }, []);

    const requestPermissions = useCallback(async (): Promise<boolean> => {
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
    }, []);

    const scheduleNotification = useCallback(async (
        scheduledNotification: ScheduledNotification
    ): Promise<string | null> => {
        if (!notificationsEnabled) return null;

        try {
            let trigger: Notifications.NotificationTriggerInput;
            
            if (scheduledNotification.trigger instanceof Date) {
                trigger = { date: scheduledNotification.trigger };
            } else {
                trigger = { seconds: scheduledNotification.trigger };
            }

            const id = await Notifications.scheduleNotificationAsync({
                content: {
                    title: scheduledNotification.title,
                    body: scheduledNotification.body,
                    data: { id: scheduledNotification.id },
                    sound: true,
                },
                trigger,
            });

            return id;
        } catch (error) {
            console.log('Error scheduling notification:', error);
            return null;
        }
    }, [notificationsEnabled]);

    const scheduleDailyReminder = useCallback(async (
        hour: number,
        minute: number
    ): Promise<string | null> => {
        if (!notificationsEnabled) return null;

        try {
            // Cancel existing daily reminders first
            const scheduled = await Notifications.getAllScheduledNotificationsAsync();
            for (const notification of scheduled) {
                if (notification.content.data?.type === 'daily_reminder') {
                    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
                }
            }

            const id = await Notifications.scheduleNotificationAsync({
                content: {
                    title: '⚔️ Quest Reminder',
                    body: 'Don\'t forget to work on your quests today!',
                    data: { type: 'daily_reminder' },
                    sound: true,
                },
                trigger: {
                    hour,
                    minute,
                    repeats: true,
                    channelId: Platform.OS === 'android' ? 'reminders' : undefined,
                },
            });

            return id;
        } catch (error) {
            console.log('Error scheduling daily reminder:', error);
            return null;
        }
    }, [notificationsEnabled]);

    const cancelNotification = useCallback(async (id: string) => {
        try {
            await Notifications.cancelScheduledNotificationAsync(id);
        } catch (error) {
            console.log('Error canceling notification:', error);
        }
    }, []);

    const cancelAllNotifications = useCallback(async () => {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
        } catch (error) {
            console.log('Error canceling all notifications:', error);
        }
    }, []);

    const sendLocalNotification = useCallback(async (
        title: string,
        body: string
    ): Promise<string | null> => {
        if (!notificationsEnabled) return null;

        try {
            const id = await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    sound: true,
                },
                trigger: null, // Immediate
            });

            return id;
        } catch (error) {
            console.log('Error sending local notification:', error);
            return null;
        }
    }, [notificationsEnabled]);

    return {
        expoPushToken,
        notification,
        notificationsEnabled,
        setNotificationsEnabled,
        scheduleNotification,
        scheduleDailyReminder,
        cancelNotification,
        cancelAllNotifications,
        sendLocalNotification,
        requestPermissions,
    };
}

export default useNotifications;

