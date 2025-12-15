import useFirebase, { QuestType, SidequestType, deleteQuest, getSidequestsByQuestId, canCompleteQuest, getQuestById } from "@/core/useFirebase";
import { Alert, FlatList, Text, View, Pressable, StyleSheet, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { routes, useNavigation } from "@/core/useNavigation";
import SidequestDetails from "./SidequestDetails";
import { useCallback, useEffect, useState } from "react";
import XpBar from "@/components/xpBar";
import { fonts, spacing, borderRadius } from "@/core/theme";
import { Ionicons } from "@expo/vector-icons";
import usePrompt from "@/core/usePrompt";
import { useTheme } from "@/core/useTheme";
import { useNotifications } from "@/core/useNotifications";

interface Props {
    quest: QuestType;
}

export default function QuestDetails({ quest: initialQuest }: Props) {
    const { colors } = useTheme();
    const { completeQuest } = useFirebase();
    const { setRoute } = useNavigation();
    const { updateQuestWithAI, loading: aiLoading } = usePrompt();
    const { sendLocalNotification } = useNotifications();
    const [quest, setQuest] = useState<QuestType | null>(initialQuest);
    const [sidequests, setSidequests] = useState<SidequestType[]>([]);
    const styles = createStyles(colors);
    const [canComplete, setCanComplete] = useState(false);
    const [updatePrompt, setUpdatePrompt] = useState('');

    const handleDeleteQuest = async () => {
        if (!quest) return;
        Alert.alert(
            'Delete Quest',
            'Are you sure you want to delete this quest?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: async () => {
                    await deleteQuest(quest.id);
                    setRoute(routes.home);
                }},
            ]
        );
    };

    const handleCompleteQuest = async () => {
        if (!quest) return;
        try {
            await completeQuest(quest.id);
            setRoute(routes.home);
        } catch (error) {
            Alert.alert('Cannot Complete', (error as Error).message);
        }
    };

    const handleQuestAutoCompleted = async () => {
        // Send a celebratory notification
        await sendLocalNotification(
            '🎉 Quest Complete!',
            `You finished "${quest?.title}"! Keep up the great work, adventurer!`
        );
        
        Alert.alert(
            '🎉 Quest Complete!',
            'Congratulations! You\'ve completed all sidequests and finished this quest!',
            [{ text: 'Awesome!', onPress: () => setRoute(routes.home) }]
        );
    };

    const handleUpdateQuest = async () => {
        if (!quest || !updatePrompt.trim()) return;
        
        try {
            const result = await updateQuestWithAI(quest, sidequests, updatePrompt.trim());
            setQuest(result.quest);
            setSidequests(result.sidequests);
            setUpdatePrompt('');
            
            const completable = await canCompleteQuest(quest.id);
            setCanComplete(completable);
        } catch (error) {
            Alert.alert('Update Failed', (error as Error).message);
        }
    };

    const refreshData = useCallback(async () => {
        if (!initialQuest) return;
        
        const updatedQuest = await getQuestById(initialQuest.id);
        if (updatedQuest) {
            setQuest(updatedQuest);
        }
        
        const fetched = await getSidequestsByQuestId(initialQuest.id);
        const sorted = [...fetched].sort((a, b) => a.orderIndex - b.orderIndex);
        setSidequests(sorted);
        
        const completable = await canCompleteQuest(initialQuest.id);
        setCanComplete(completable);
    }, [initialQuest]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    if (!quest) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No quest selected</Text>
                </View>
            </View>
        );
    }

    const completedCount = sidequests.filter(s => s.isCompleted).length;
    const isCompleted = quest.status === 'completed';

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => setRoute(routes.home)}>
                    <Ionicons name="arrow-back" size={24} color={colors.textLight} />
                </Pressable>
                <Text style={styles.headerTitle}>Quest Details</Text>
                <Pressable style={styles.deleteButton} onPress={handleDeleteQuest}>
                    <Ionicons name="trash-outline" size={22} color={colors.error} />
                </Pressable>
            </View>

            {/* Loading Overlay */}
            {aiLoading && (
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color={colors.gold} />
                        <Text style={styles.loadingText}>Updating quest...</Text>
                    </View>
                </View>
            )}

            <FlatList 
                style={styles.list}
                contentContainerStyle={styles.listContent}
                data={sidequests} 
                keyExtractor={(item) => item.id} 
                ListHeaderComponent={
                    <View style={styles.questInfo}>
                        {/* Quest Card */}
                        <View style={styles.questCard}>
                            {isCompleted && (
                                <View style={styles.completedBanner}>
                                    <Ionicons name="trophy" size={16} color={colors.gold} />
                                    <Text style={styles.completedBannerText}>Quest Completed!</Text>
                                </View>
                            )}
                            
                            <Text style={styles.questTitle}>{quest.title}</Text>
                            {quest.description && (
                                <Text style={styles.questDescription}>{quest.description}</Text>
                            )}
                            
                            <View style={styles.questMeta}>
                                <View style={styles.xpBadge}>
                                    <Text style={styles.xpBadgeText}>+{quest.totalQuestXp} XP</Text>
                                </View>
                                <Text style={styles.statusText}>
                                    {isCompleted ? 'Completed' : 'In Progress'}
                                </Text>
                            </View>

                            {/* Progress */}
                            <View style={styles.progressSection}>
                                <XpBar 
                                    xp={completedCount} 
                                    maxXp={sidequests.length || 1} 
                                    title={`${completedCount} / ${sidequests.length} Sidequests`} 
                                />
                            </View>

                            {/* Complete Button */}
                            {quest.status === 'active' && (
                                <Pressable 
                                    style={({ pressed }) => [
                                        styles.completeButton, 
                                        !canComplete && styles.completeButtonDisabled,
                                        pressed && canComplete && styles.buttonPressed
                                    ]}
                                    onPress={handleCompleteQuest}
                                    disabled={!canComplete}
                                >
                                    <Ionicons 
                                        name="checkmark-circle" 
                                        size={20} 
                                        color={canComplete ? colors.backgroundDark : colors.textMuted} 
                                    />
                                    <Text style={[
                                        styles.completeButtonText,
                                        !canComplete && styles.completeButtonTextDisabled
                                    ]}>
                                        {canComplete ? 'Complete Quest' : `${sidequests.length - completedCount} sidequests remaining`}
                                    </Text>
                                </Pressable>
                            )}
                        </View>

                        {/* Sidequests Header */}
                        <View style={styles.sidequestsHeader}>
                            <Text style={styles.sidequestsTitle}>Sidequests</Text>
                            {quest.status === 'active' && (
                                <Pressable 
                                    style={({ pressed }) => [styles.addButton, pressed && styles.buttonPressed]}
                                    onPress={() => setRoute(routes.createSidequest, { quest: quest })}
                                >
                                    <Ionicons name="add" size={20} color={colors.gold} />
                                    <Text style={styles.addButtonText}>Add</Text>
                                </Pressable>
                            )}
                        </View>
                    </View>
                }
                renderItem={({ item }: { item: SidequestType }) => {
                    const firstUncompletedIndex = sidequests.findIndex(s => !s.isCompleted);
                    const isFirst = sidequests.indexOf(item) === firstUncompletedIndex;
                    return <SidequestDetails sidequest={item} isFirst={isFirst} onUpdate={refreshData} onQuestCompleted={handleQuestAutoCompleted} questStatus={quest.status} />;
                }}
                ListEmptyComponent={
                    <View style={styles.emptySidequests}>
                        <Ionicons name="list-outline" size={40} color={colors.textMuted} />
                        <Text style={styles.emptySidequestsText}>No sidequests yet</Text>
                        <Text style={styles.emptySidequestsSubtext}>Add sidequests to break down your quest</Text>
                    </View>
                }
                ListFooterComponent={
                    quest.status === 'active' ? (
                        <View style={styles.updateContainer}>
                            <View style={styles.updateInputRow}>
                                <TextInput
                                    style={styles.updateInput}
                                    placeholder="Describe changes to your quest..."
                                    placeholderTextColor={colors.textMuted}
                                    value={updatePrompt}
                                    onChangeText={setUpdatePrompt}
                                    editable={!aiLoading}
                                    multiline
                                />
                                <Pressable 
                                    style={({ pressed }) => [
                                        styles.updateButton, 
                                        (!updatePrompt.trim() || aiLoading) && styles.updateButtonDisabled,
                                        pressed && updatePrompt.trim() && !aiLoading && styles.buttonPressed
                                    ]}
                                    onPress={handleUpdateQuest}
                                    disabled={!updatePrompt.trim() || aiLoading}
                                >
                                    <Ionicons 
                                        name="sparkles" 
                                        size={20} 
                                        color={updatePrompt.trim() && !aiLoading ? colors.backgroundDark : colors.textMuted} 
                                    />
                                </Pressable>
                            </View>
                        </View>
                    ) : null
                }
            />
        </KeyboardAvoidingView>
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
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: colors.gold,
    },
    backButton: {
        padding: spacing.sm,
        marginLeft: -spacing.sm,
    },
    headerTitle: {
        flex: 1,
        fontFamily: fonts.fantasyFamily,
        fontSize: fonts.sizes.xl,
        color: colors.textLight,
        textAlign: 'center',
        fontWeight: fonts.weights.semibold,
    },
    deleteButton: {
        padding: spacing.sm,
        marginRight: -spacing.sm,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    loadingBox: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        alignItems: 'center',
        gap: spacing.md,
    },
    loadingText: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.md,
        color: colors.textSecondary,
    },
    list: {
        flex: 1,
    },
    listContent: {
        padding: spacing.lg,
        paddingBottom: 120,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.lg,
        color: colors.textMuted,
    },
    questInfo: {
        gap: spacing.lg,
    },
    questCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        gap: spacing.md,
    },
    completedBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.success + '20',
        padding: spacing.sm,
        borderRadius: borderRadius.sm,
        marginBottom: spacing.xs,
    },
    completedBannerText: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.sm,
        color: colors.success,
        fontWeight: fonts.weights.medium,
    },
    questTitle: {
        fontFamily: fonts.fantasyFamily,
        fontSize: fonts.sizes.xxl,
        color: colors.textPrimary,
        fontWeight: fonts.weights.bold,
    },
    questDescription: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.md,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    questMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    xpBadge: {
        backgroundColor: colors.gold,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    xpBadgeText: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.sm,
        color: colors.backgroundDark,
        fontWeight: fonts.weights.bold,
    },
    statusText: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.sm,
        color: colors.textMuted,
    },
    progressSection: {
        marginTop: spacing.sm,
    },
    completeButton: {
        backgroundColor: colors.gold,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    completeButtonDisabled: {
        backgroundColor: colors.border,
    },
    buttonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    completeButtonText: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.md,
        color: colors.backgroundDark,
        fontWeight: fonts.weights.bold,
    },
    completeButtonTextDisabled: {
        color: colors.textMuted,
    },
    sidequestsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sidequestsTitle: {
        fontFamily: fonts.fantasyFamily,
        fontSize: fonts.sizes.lg,
        color: colors.textPrimary,
        fontWeight: fonts.weights.semibold,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        padding: spacing.sm,
    },
    addButtonText: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.md,
        color: colors.gold,
        fontWeight: fonts.weights.medium,
    },
    emptySidequests: {
        alignItems: 'center',
        padding: spacing.xxl,
        gap: spacing.sm,
    },
    emptySidequestsText: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.lg,
        color: colors.textMuted,
    },
    emptySidequestsSubtext: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.sm,
        color: colors.textMuted,
    },
    updateContainer: {
        marginTop: spacing.lg,
    },
    updateInputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: spacing.sm,
    },
    updateInput: {
        flex: 1,
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.md,
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: colors.border,
        maxHeight: 100,
    },
    updateButton: {
        backgroundColor: colors.gold,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    updateButtonDisabled: {
        backgroundColor: colors.border,
    },
});
