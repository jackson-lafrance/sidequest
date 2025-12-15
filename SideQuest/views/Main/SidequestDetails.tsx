import { SidequestType, completeSidequest, deleteSidequest } from "@/core/useFirebase";
import { Text, View, Pressable, StyleSheet, Alert } from "react-native";
import { colors, fonts, spacing, borderRadius } from "@/core/theme";
import { Ionicons } from "@expo/vector-icons";

interface Props {
    sidequest: SidequestType;
    isFirst?: boolean;
    onUpdate?: () => void;
    onQuestCompleted?: () => void;
    questStatus?: 'active' | 'completed';
}

export default function SidequestDetails({ sidequest, isFirst, onUpdate, onQuestCompleted, questStatus }: Props) {

    const handleCompleteSidequest = async () => {   
        if (!sidequest) return;
        const result = await completeSidequest(sidequest.id);
        
        if (result.questCompleted) {
            onQuestCompleted?.();
        } else {
            onUpdate?.();
        }
    };

    const handleDeleteSidequest = async () => {
        if (!sidequest) return;
        Alert.alert(
            'Delete Sidequest',
            'Are you sure you want to delete this sidequest?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: async () => {
                    await deleteSidequest(sidequest.id, sidequest.questId);
                    onUpdate?.();
                }},
            ]
        );
    };

    if (!sidequest) {
        return null;
    }

    const isCompleted = sidequest.isCompleted;
    const canComplete = isFirst && !isCompleted && questStatus === 'active';

    return (
        <View style={[styles.container, isCompleted && styles.containerCompleted]}>
            {/* Left accent */}
            <View style={[styles.accent, isCompleted ? styles.accentCompleted : (canComplete ? styles.accentActive : styles.accentPending)]} />
            
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.titleRow}>
                        {isCompleted && (
                            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                        )}
                        <Text style={[styles.title, isCompleted && styles.titleCompleted]}>
                            {sidequest.title}
                        </Text>
                    </View>
                    
                    <View style={styles.xpBadge}>
                        <Text style={styles.xpText}>+{sidequest.totalSidequestXp}</Text>
                    </View>
                </View>

                {sidequest.description && (
                    <Text style={[styles.description, isCompleted && styles.descriptionCompleted]}>
                        {sidequest.description}
                    </Text>
                )}

                {/* Actions */}
                <View style={styles.actions}>
                    {canComplete && (
                        <Pressable 
                            style={({ pressed }) => [styles.completeButton, pressed && styles.buttonPressed]}
                            onPress={handleCompleteSidequest}
                        >
                            <Ionicons name="checkmark" size={18} color={colors.backgroundDark} />
                            <Text style={styles.completeButtonText}>Complete</Text>
                        </Pressable>
                    )}
                    
                    {questStatus === 'active' && (
                        <Pressable 
                            style={({ pressed }) => [styles.deleteButton, pressed && styles.buttonPressed]}
                            onPress={handleDeleteSidequest}
                        >
                            <Ionicons name="trash-outline" size={16} color={colors.error} />
                        </Pressable>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.md,
        flexDirection: 'row',
        overflow: 'hidden',
        marginBottom: spacing.sm,
    },
    containerCompleted: {
        opacity: 0.7,
    },
    accent: {
        width: 4,
    },
    accentActive: {
        backgroundColor: colors.gold,
    },
    accentPending: {
        backgroundColor: colors.border,
    },
    accentCompleted: {
        backgroundColor: colors.success,
    },
    content: {
        flex: 1,
        padding: spacing.md,
        gap: spacing.sm,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    titleRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    title: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.md,
        color: colors.textPrimary,
        fontWeight: fonts.weights.semibold,
        flex: 1,
    },
    titleCompleted: {
        color: colors.textMuted,
        textDecorationLine: 'line-through',
    },
    xpBadge: {
        backgroundColor: colors.gold + '30',
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    xpText: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.xs,
        color: colors.gold,
        fontWeight: fonts.weights.bold,
    },
    description: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.sm,
        color: colors.textSecondary,
    },
    descriptionCompleted: {
        color: colors.textMuted,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    completeButton: {
        backgroundColor: colors.gold,
        borderRadius: borderRadius.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    completeButtonText: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.sm,
        color: colors.backgroundDark,
        fontWeight: fonts.weights.bold,
    },
    deleteButton: {
        padding: spacing.sm,
    },
});
