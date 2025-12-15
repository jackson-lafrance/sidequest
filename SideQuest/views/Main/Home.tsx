import { Text, View, Pressable, ScrollView, StyleSheet, Image } from "react-native";
import useFirebase, { QuestType, UserType, SidequestType, getQuests, getSidequestsByQuestId } from "@/core/useFirebase";
import { useEffect, useState, useCallback } from "react";
import { routes, useNavigation } from "@/core/useNavigation";
import XpBar from "@/components/xpBar";
import { fonts, spacing, borderRadius, shadows } from "@/core/theme";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/core/useTheme";

interface QuestWithSidequests extends QuestType {
    sidequests: SidequestType[];
}

export default function Home() {
    const { colors } = useTheme();
    const { getCurrentUser } = useFirebase();
    const { setRoute } = useNavigation();
    const [currentUser, setCurrentUser] = useState<UserType | null>(null);
    const [questsWithSidequests, setQuestsWithSidequests] = useState<QuestWithSidequests[]>([]);
    const [showCompleted, setShowCompleted] = useState(false);
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
        
        const fetchQuestsWithSidequests = async () => {
            const quests = await getQuests(currentUser.id);
            const questsWithSq = await Promise.all(
                quests.map(async (quest) => {
                    const sidequests = await getSidequestsByQuestId(quest.id);
                    return { ...quest, sidequests: sidequests.sort((a, b) => a.orderIndex - b.orderIndex) };
                })
            );
            setQuestsWithSidequests(questsWithSq);
        };
        
        fetchQuestsWithSidequests();
    }, [currentUser]);

    const getCurrentSidequest = (sidequests: SidequestType[]): SidequestType | null => {
        return sidequests.find(sq => !sq.isCompleted) || null;
    };

    const getProgress = (sidequests: SidequestType[]): { completed: number; total: number } => {
        const completed = sidequests.filter(sq => sq.isCompleted).length;
        return { completed, total: sidequests.length };
    };

    // Separate active and completed quests
    const activeQuests = questsWithSidequests.filter(q => q.status === 'active');
    const completedQuests = questsWithSidequests.filter(q => q.status === 'completed');

    if (!currentUser) {
        return (
            <View style={styles.loadingContainer}>
                <Image 
                    source={require('@/assets/images/logonobackground.png')} 
                    style={styles.loadingLogo}
                    resizeMode="contain"
                />
                <Text style={styles.loadingText}>Loading your quests...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Fixed Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.userInfo}>
                        <Text style={styles.greeting}>Welcome back,</Text>
                        <Text style={styles.username}>{currentUser.displayName}</Text>
                    </View>
                    <View style={styles.levelBadge}>
                        <Text style={styles.levelNumber}>{currentUser.level}</Text>
                    </View>
                </View>
                <View style={styles.xpContainer}>
                    <XpBar xp={currentUser.currentXp} maxXp={currentUser.level * 100} size="sm" />
                </View>
            </View>

            {/* Scrollable Content */}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
                {/* Active Quests */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {activeQuests.length > 0 ? `${activeQuests.length} Active Quest${activeQuests.length > 1 ? 's' : ''}` : 'No Active Quests'}
                    </Text>
                    
                    {activeQuests.length === 0 ? (
                        <Pressable 
                            style={({ pressed }) => [styles.emptyState, pressed && styles.emptyStatePressed]}
                            onPress={() => setRoute(routes.createQuest)}
                        >
                            <Ionicons name="add-circle-outline" size={32} color={colors.gold} />
                            <Text style={styles.emptyStateText}>Start a New Quest</Text>
                            <Text style={styles.emptyStateSubtext}>Tap to begin your adventure</Text>
                        </Pressable>
                    ) : (
                        <View style={styles.questList}>
                            {activeQuests.map((quest) => {
                                const currentSidequest = getCurrentSidequest(quest.sidequests);
                                const progress = getProgress(quest.sidequests);
                                const progressPercent = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;
                                
                                return (
                                    <Pressable 
                                        key={quest.id} 
                                        onPress={() => setRoute(routes.questDetails, { quest })}
                                        style={({ pressed }) => [
                                            styles.questCard,
                                            pressed && styles.questCardPressed
                                        ]}
                                    >
                                        {/* Progress bar as background accent */}
                                        <View style={styles.questProgressBg}>
                                            <View style={[styles.questProgressFill, { width: `${progressPercent}%` }]} />
                                        </View>
                                        
                                        <View style={styles.questCardContent}>
                                            {/* Title row - full width */}
                                            <View style={styles.questTitleRow}>
                                                <Text style={styles.questTitle}>{quest.title}</Text>
                                                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                                            </View>
                                            
                                            {/* Details row */}
                                            <View style={styles.questDetailsRow}>
                                                <View style={styles.questDetailLeft}>
                                                    {currentSidequest ? (
                                                        <Text style={styles.nextUpText}>
                                                            <Text style={styles.nextUpLabel}>Up next: </Text>
                                                            {currentSidequest.title}
                                                        </Text>
                                                    ) : (
                                                        <Text style={styles.readyToComplete}>Ready to complete!</Text>
                                                    )}
                                                </View>
                                                
                                                <View style={styles.questDetailRight}>
                                                    <View style={styles.xpBadge}>
                                                        <Text style={styles.xpBadgeText}>+{quest.totalQuestXp}</Text>
                                                    </View>
                                                    <Text style={styles.progressText}>{progress.completed}/{progress.total}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* Completed Quests - Collapsible */}
                {completedQuests.length > 0 && (
                    <View style={styles.completedSection}>
                        <Pressable 
                            style={styles.completedHeader}
                            onPress={() => setShowCompleted(!showCompleted)}
                        >
                            <View style={styles.completedHeaderLeft}>
                                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                                <Text style={styles.completedTitle}>
                                    {completedQuests.length} Completed
                                </Text>
                            </View>
                            <Ionicons 
                                name={showCompleted ? "chevron-up" : "chevron-down"} 
                                size={20} 
                                color={colors.textMuted} 
                            />
                        </Pressable>
                        
                        {showCompleted && (
                            <View style={styles.completedList}>
                                {completedQuests.map((quest) => (
                                    <Pressable 
                                        key={quest.id} 
                                        onPress={() => setRoute(routes.questDetails, { quest })}
                                        style={({ pressed }) => [
                                            styles.completedCard,
                                            pressed && styles.questCardPressed
                                        ]}
                                    >
                                        <Ionicons name="trophy" size={16} color={colors.gold} />
                                        <Text style={styles.completedQuestTitle}>
                                            {quest.title}
                                        </Text>
                                        <Text style={styles.completedXp}>+{quest.totalQuestXp} XP</Text>
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const createStyles = (colors: typeof import('@/core/useTheme').darkColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    
    // Loading State
    loadingContainer: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.lg,
    },
    loadingLogo: {
        width: 140,
        height: 140,
    },
    loadingText: {
        fontFamily: fonts.fantasyFamily,
        fontSize: fonts.sizes.lg,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
    
    // Fixed Header
    header: {
        backgroundColor: colors.headerBackground,
        paddingTop: spacing.xxl + 20,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomWidth: 2,
        borderBottomColor: colors.gold,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    userInfo: {
        flex: 1,
    },
    greeting: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.sm,
        color: colors.goldLight,
    },
    username: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.xl,
        color: colors.textLight,
        fontWeight: fonts.weights.bold,
    },
    levelBadge: {
        backgroundColor: colors.gold,
        borderRadius: borderRadius.md,
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    levelNumber: {
        fontFamily: fonts.fantasyFamily,
        fontSize: fonts.sizes.xl,
        color: colors.backgroundDark,
        fontWeight: fonts.weights.bold,
        textAlign: 'center',
    },
    levelLabel: {
        fontFamily: fonts.bodyFamily,
        fontSize: 9,
        color: colors.backgroundDark,
        fontWeight: fonts.weights.bold,
        letterSpacing: 1,
    },
    xpContainer: {
        marginTop: spacing.sm,
    },
    
    // Scrollable Content
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 120,
    },
    
    // Section
    section: {
        padding: spacing.lg,
        gap: spacing.md,
    },
    sectionTitle: {
        fontFamily: fonts.fantasyFamily,
        fontSize: fonts.sizes.lg,
        color: colors.textPrimary,
        fontWeight: fonts.weights.semibold,
    },
    
    // Empty State
    emptyState: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        alignItems: 'center',
        gap: spacing.sm,
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: 'dashed',
    },
    emptyStatePressed: {
        opacity: 0.8,
        borderColor: colors.gold,
    },
    emptyStateText: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.lg,
        color: colors.textPrimary,
        fontWeight: fonts.weights.semibold,
    },
    emptyStateSubtext: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.sm,
        color: colors.textMuted,
    },
    
    // Quest List
    questList: {
        gap: spacing.md,
    },
    
    // Quest Card
    questCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        ...shadows.card,
    },
    questCardPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    questProgressBg: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        backgroundColor: 'transparent',
    },
    questProgressFill: {
        height: '100%',
        backgroundColor: colors.gold,
        opacity: 0.1,
    },
    questCardContent: {
        padding: spacing.lg,
        gap: spacing.md,
    },
    questTitleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: spacing.md,
    },
    questTitle: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.lg,
        color: colors.textPrimary,
        fontWeight: fonts.weights.semibold,
        flex: 1,
    },
    questDetailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.md,
    },
    questDetailLeft: {
        flex: 1,
    },
    questDetailRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    xpBadge: {
        backgroundColor: colors.gold,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    xpBadgeText: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.xs,
        color: colors.backgroundDark,
        fontWeight: fonts.weights.bold,
    },
    nextUpLabel: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.sm,
        color: colors.textMuted,
    },
    nextUpText: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.sm,
        color: colors.accent,
    },
    readyToComplete: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.sm,
        color: colors.success,
        fontWeight: fonts.weights.medium,
    },
    progressText: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.lg,
        color: colors.textMuted,
        fontWeight: fonts.weights.bold,
    },
    
    // Completed Section
    completedSection: {
        marginHorizontal: spacing.lg,
        marginTop: spacing.sm,
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
    },
    completedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
    },
    completedHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    completedTitle: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.md,
        color: colors.textMuted,
        fontWeight: fonts.weights.medium,
    },
    completedList: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    completedCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    completedQuestTitle: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.sm,
        color: colors.textMuted,
        flex: 1,
    },
    completedXp: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.xs,
        color: colors.gold,
        fontWeight: fonts.weights.medium,
    },
});
