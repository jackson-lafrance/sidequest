import { Text, View, Pressable, StyleSheet, Alert, Linking, ScrollView, Switch } from "react-native";
import { logout } from "@/core/useFirebase";
import { fonts, spacing, borderRadius } from "@/core/theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTheme } from "@/core/useTheme";

export default function Settings() {
    const { colors, mode, toggleTheme } = useTheme();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const styles = createStyles(colors);

    const handleLogout = async () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Log Out', style: 'destructive', onPress: async () => {
                    await logout();
                }},
            ]
        );
    };

    const handleHelpSupport = () => {
        Linking.openURL('https://youtube.com');
    };

    const handlePrivacyPolicy = () => {
        Linking.openURL('https://youtube.com');
    };

    const handleTermsOfService = () => {
        Linking.openURL('https://youtube.com');
    };

    const handleRateApp = () => {
        Alert.alert('Rate SideQuest', 'Thank you for your support! Rating feature coming soon.');
    };

    const handleShareApp = () => {
        Alert.alert('Share SideQuest', 'Share feature coming soon!');
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => {
                    Alert.alert('Coming Soon', 'Account deletion will be available in a future update.');
                }},
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                {/* Preferences Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    
                    <View style={styles.card}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.gold + '30' }]}>
                                    <Ionicons name={mode === 'dark' ? 'moon' : 'sunny'} size={20} color={colors.gold} />
                                </View>
                                <View>
                                    <Text style={styles.settingLabel}>Dark Mode</Text>
                                    <Text style={styles.settingSubtext}>{mode === 'dark' ? 'On' : 'Off'}</Text>
                                </View>
                            </View>
                            <Switch
                                value={mode === 'dark'}
                                onValueChange={toggleTheme}
                                trackColor={{ false: colors.border, true: colors.gold + '60' }}
                                thumbColor={mode === 'dark' ? colors.gold : colors.textMuted}
                            />
                        </View>
                        
                        <View style={styles.divider} />
                        
                        <View style={styles.settingRow}>
                            <View style={styles.settingLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '30' }]}>
                                    <Ionicons name="notifications-outline" size={20} color={colors.primary} />
                                </View>
                                <Text style={styles.settingLabel}>Push Notifications</Text>
                            </View>
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                                trackColor={{ false: colors.border, true: colors.gold + '60' }}
                                thumbColor={notificationsEnabled ? colors.gold : colors.textMuted}
                            />
                        </View>
                    </View>
                </View>

                {/* Support Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>
                    
                    <View style={styles.card}>
                        <Pressable 
                            style={({ pressed }) => [styles.settingRow, pressed && styles.rowPressed]}
                            onPress={handleHelpSupport}
                        >
                            <View style={styles.settingLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.accent + '30' }]}>
                                    <Ionicons name="help-circle-outline" size={20} color={colors.accent} />
                                </View>
                                <Text style={styles.settingLabel}>Help & Support</Text>
                            </View>
                            <Ionicons name="open-outline" size={18} color={colors.textMuted} />
                        </Pressable>
                        
                        <View style={styles.divider} />
                        
                        <Pressable 
                            style={({ pressed }) => [styles.settingRow, pressed && styles.rowPressed]}
                            onPress={handleRateApp}
                        >
                            <View style={styles.settingLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.gold + '30' }]}>
                                    <Ionicons name="star-outline" size={20} color={colors.gold} />
                                </View>
                                <Text style={styles.settingLabel}>Rate SideQuest</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                        </Pressable>
                        
                        <View style={styles.divider} />
                        
                        <Pressable 
                            style={({ pressed }) => [styles.settingRow, pressed && styles.rowPressed]}
                            onPress={handleShareApp}
                        >
                            <View style={styles.settingLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.success + '30' }]}>
                                    <Ionicons name="share-social-outline" size={20} color={colors.success} />
                                </View>
                                <Text style={styles.settingLabel}>Share with Friends</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                        </Pressable>
                    </View>
                </View>

                {/* Legal Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Legal</Text>
                    
                    <View style={styles.card}>
                        <Pressable 
                            style={({ pressed }) => [styles.settingRow, pressed && styles.rowPressed]}
                            onPress={handlePrivacyPolicy}
                        >
                            <View style={styles.settingLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '30' }]}>
                                    <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
                                </View>
                                <Text style={styles.settingLabel}>Privacy Policy</Text>
                            </View>
                            <Ionicons name="open-outline" size={18} color={colors.textMuted} />
                        </Pressable>
                        
                        <View style={styles.divider} />
                        
                        <Pressable 
                            style={({ pressed }) => [styles.settingRow, pressed && styles.rowPressed]}
                            onPress={handleTermsOfService}
                        >
                            <View style={styles.settingLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.textMuted + '30' }]}>
                                    <Ionicons name="document-text-outline" size={20} color={colors.textMuted} />
                                </View>
                                <Text style={styles.settingLabel}>Terms of Service</Text>
                            </View>
                            <Ionicons name="open-outline" size={18} color={colors.textMuted} />
                        </Pressable>
                        
                        <View style={styles.divider} />
                        
                        <View style={styles.settingRow}>
                            <View style={styles.settingLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.gold + '20' }]}>
                                    <Ionicons name="information-circle-outline" size={20} color={colors.gold} />
                                </View>
                                <Text style={styles.settingLabel}>Version</Text>
                            </View>
                            <Text style={styles.versionText}>1.0.0</Text>
                        </View>
                    </View>
                </View>

                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    
                    <View style={styles.accountButtons}>
                        <Pressable 
                            style={({ pressed }) => [styles.logoutButton, pressed && styles.buttonPressed]}
                            onPress={handleLogout}
                        >
                            <Ionicons name="log-out-outline" size={20} color={colors.error} />
                            <Text style={styles.logoutText}>Log Out</Text>
                        </Pressable>
                        
                        <Pressable 
                            style={({ pressed }) => [styles.deleteButton, pressed && styles.buttonPressed]}
                            onPress={handleDeleteAccount}
                        >
                            <Ionicons name="trash-outline" size={20} color={colors.error} />
                            <Text style={styles.deleteText}>Delete Account</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Made with ❤️ for adventurers</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const createStyles = (colors: typeof import('@/core/useTheme').darkColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.headerBackground,
        paddingTop: spacing.xxl + 20,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: colors.gold,
    },
    headerTitle: {
        fontFamily: fonts.fantasyFamily,
        fontSize: fonts.sizes.xl,
        color: colors.textLight,
        fontWeight: fonts.weights.semibold,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: 120,
        gap: spacing.xl,
    },
    section: {
        gap: spacing.md,
    },
    sectionTitle: {
        fontFamily: fonts.fantasyFamily,
        fontSize: fonts.sizes.lg,
        color: colors.textPrimary,
        fontWeight: fonts.weights.semibold,
    },
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
    },
    rowPressed: {
        backgroundColor: colors.border + '50',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingLabel: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.md,
        color: colors.textPrimary,
    },
    settingSubtext: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.xs,
        color: colors.textMuted,
        marginTop: 2,
    },
    versionText: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.md,
        color: colors.textMuted,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginLeft: spacing.md + 36 + spacing.md,
    },
    accountButtons: {
        gap: spacing.md,
    },
    logoutButton: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: colors.error + '30',
    },
    deleteButton: {
        backgroundColor: 'transparent',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    logoutText: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.md,
        color: colors.error,
        fontWeight: fonts.weights.medium,
    },
    deleteText: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.md,
        color: colors.textMuted,
        fontWeight: fonts.weights.medium,
    },
    footer: {
        alignItems: 'center',
        paddingTop: spacing.lg,
    },
    footerText: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.sm,
        color: colors.textMuted,
    },
});
