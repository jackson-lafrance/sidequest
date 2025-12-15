import { Text, View, Pressable, StyleSheet, Alert } from "react-native";
import { logout } from "@/core/useFirebase";
import { colors, fonts, spacing, borderRadius } from "@/core/theme";
import { Ionicons } from "@expo/vector-icons";

export default function Settings() {
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

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <View style={styles.content}>
                {/* General Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>General</Text>
                    
                    <View style={styles.card}>
                        <Pressable style={({ pressed }) => [styles.settingRow, pressed && styles.rowPressed]}>
                            <View style={styles.settingLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '30' }]}>
                                    <Ionicons name="notifications-outline" size={20} color={colors.primary} />
                                </View>
                                <Text style={styles.settingLabel}>Notifications</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                        </Pressable>
                        
                        <View style={styles.divider} />
                        
                        <Pressable style={({ pressed }) => [styles.settingRow, pressed && styles.rowPressed]}>
                            <View style={styles.settingLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.gold + '30' }]}>
                                    <Ionicons name="color-palette-outline" size={20} color={colors.gold} />
                                </View>
                                <Text style={styles.settingLabel}>Appearance</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                        </Pressable>
                    </View>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    
                    <View style={styles.card}>
                        <Pressable style={({ pressed }) => [styles.settingRow, pressed && styles.rowPressed]}>
                            <View style={styles.settingLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.accent + '30' }]}>
                                    <Ionicons name="help-circle-outline" size={20} color={colors.accent} />
                                </View>
                                <Text style={styles.settingLabel}>Help & Support</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                        </Pressable>
                        
                        <View style={styles.divider} />
                        
                        <Pressable style={({ pressed }) => [styles.settingRow, pressed && styles.rowPressed]}>
                            <View style={styles.settingLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.success + '30' }]}>
                                    <Ionicons name="document-text-outline" size={20} color={colors.success} />
                                </View>
                                <Text style={styles.settingLabel}>Privacy Policy</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                        </Pressable>
                        
                        <View style={styles.divider} />
                        
                        <View style={styles.settingRow}>
                            <View style={styles.settingLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.textMuted + '30' }]}>
                                    <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
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
                    
                    <Pressable 
                        style={({ pressed }) => [styles.logoutButton, pressed && styles.buttonPressed]}
                        onPress={handleLogout}
                    >
                        <Ionicons name="log-out-outline" size={20} color={colors.error} />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: '#2D2254',
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
    content: {
        flex: 1,
        padding: spacing.lg,
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
    logoutButton: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: colors.error + '50',
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
});
