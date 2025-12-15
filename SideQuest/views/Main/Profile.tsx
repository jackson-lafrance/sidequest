import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, Text, View, StyleSheet, Image } from "react-native";
import useFirebase, { UserType, QuestType, getQuests } from "@/core/useFirebase";
import XpBar from "@/components/xpBar";
import { fonts, spacing, borderRadius } from "@/core/theme";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/core/useTheme";

export default function Profile() {
    const { colors } = useTheme();
    const { getCurrentUser } = useFirebase();
    const [currentUser, setCurrentUser] = useState<UserType | null>(null);
    const [quests, setQuests] = useState<QuestType[]>([]);
    const styles = createStyles(colors);

    const refreshUser = useCallback(async () => {
        const user = await getCurrentUser();
        setCurrentUser(user);
    }, [getCurrentUser]);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    useEffect(() => {
        if (!currentUser) return;
        const fetchQuests = async () => {
            const userQuests = await getQuests(currentUser.id);
            setQuests(userQuests);
        };
        fetchQuests();
    }, [currentUser]);

    const activeQuests = quests.filter(q => q.status === 'active');
    const completedQuests = quests.filter(q => q.status === 'completed');

    if (!currentUser) {
        return (
            <View style={styles.loadingContainer}>
                <Image 
                    source={require('@/assets/images/logonobackground.png')} 
                    style={styles.loadingLogo}
                    resizeMode="contain"
                />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    const memberSince = currentUser.createdAt.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {currentUser.displayName.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.levelBadge}>
                            <Text style={styles.levelNumber}>{currentUser.level}</Text>
                        </View>
                    </View>
                    
                    <Text style={styles.displayName}>{currentUser.displayName}</Text>
                    <Text style={styles.email}>{currentUser.email}</Text>
                    
                    <View style={styles.xpSection}>
                        <XpBar xp={currentUser.currentXp} maxXp={currentUser.level * 100} />
                    </View>
                </View>

                {/* Stats Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Stats</Text>
                    
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <Ionicons name="trophy" size={24} color={colors.gold} />
                            <Text style={styles.statValue}>{completedQuests.length}</Text>
                            <Text style={styles.statLabel}>Completed</Text>
                        </View>
                        
                        <View style={styles.statCard}>
                            <Ionicons name="flame" size={24} color={colors.accent} />
                            <Text style={styles.statValue}>{activeQuests.length}</Text>
                            <Text style={styles.statLabel}>Active</Text>
                        </View>
                        
                        <View style={styles.statCard}>
                            <Ionicons name="arrow-up-circle" size={24} color={colors.success} />
                            <Text style={styles.statValue}>{(currentUser.level * 100) - currentUser.currentXp}</Text>
                            <Text style={styles.statLabel}>XP to Level</Text>
                        </View>
                    </View>
                </View>

                {/* Info Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Info</Text>
                    
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoLeft}>
                                <Ionicons name="person-outline" size={20} color={colors.textMuted} />
                                <Text style={styles.infoLabel}>Username</Text>
                            </View>
                            <Text style={styles.infoValue}>{currentUser.displayName}</Text>
                        </View>
                        
                        <View style={styles.divider} />
                        
                        <View style={styles.infoRow}>
                            <View style={styles.infoLeft}>
                                <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
                                <Text style={styles.infoLabel}>Email</Text>
                            </View>
                            <Text style={styles.infoValue}>{currentUser.email}</Text>
                        </View>
                        
                        <View style={styles.divider} />
                        
                        <View style={styles.infoRow}>
                            <View style={styles.infoLeft}>
                                <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
                                <Text style={styles.infoLabel}>Member Since</Text>
                            </View>
                            <Text style={styles.infoValue}>{memberSince}</Text>
                        </View>
                    </View>
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
    loadingContainer: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.lg,
    },
    loadingLogo: {
        width: 100,
        height: 100,
    },
    loadingText: {
        fontFamily: fonts.fantasyFamily,
        fontSize: fonts.sizes.lg,
        color: colors.textSecondary,
        fontStyle: 'italic',
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
        gap: spacing.lg,
    },
    profileCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        alignItems: 'center',
        gap: spacing.md,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: colors.gold,
    },
    avatarText: {
        fontFamily: fonts.fantasyFamily,
        fontSize: fonts.sizes.hero,
        color: colors.textLight,
        fontWeight: fonts.weights.bold,
    },
    levelBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: colors.gold,
        borderRadius: borderRadius.round,
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.cardBackground,
    },
    levelNumber: {
        fontFamily: fonts.fantasyFamily,
        fontSize: fonts.sizes.sm,
        color: colors.backgroundDark,
        fontWeight: fonts.weights.bold,
    },
    displayName: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.xxl,
        color: colors.textPrimary,
        fontWeight: fonts.weights.bold,
    },
    email: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.md,
        color: colors.textMuted,
    },
    xpSection: {
        width: '100%',
        marginTop: spacing.sm,
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
    statsGrid: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        alignItems: 'center',
        gap: spacing.xs,
    },
    statValue: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.xl,
        color: colors.textPrimary,
        fontWeight: fonts.weights.bold,
    },
    statLabel: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.xs,
        color: colors.textMuted,
    },
    infoCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.sm,
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    infoLabel: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.md,
        color: colors.textSecondary,
    },
    infoValue: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.md,
        color: colors.textPrimary,
        fontWeight: fonts.weights.medium,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginHorizontal: spacing.sm,
    },
});
