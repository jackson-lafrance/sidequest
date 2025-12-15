import { QuestType, UserType, getCurrentUser, createSidequest, addSidequestToQuest, getQuestById, getSidequestsByQuestId } from "@/core/useFirebase";
import { useEffect, useState } from "react";
import { Text, TextInput, ScrollView, Alert, View, Pressable, StyleSheet } from "react-native";
import * as Crypto from "expo-crypto";
import { routes } from "@/core/routes";
import { useNavigation } from "@/core/useNavigation";
import { colors, fonts, spacing, borderRadius } from "@/core/theme";
import { Ionicons } from "@expo/vector-icons";

interface Props {
    quest: QuestType;
}

export default function CreateSidequest({ quest }: Props) {
    const { setRoute } = useNavigation();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [totalSidequestXp, setTotalSidequestXp] = useState(0);
    const [currentUser, setCurrentUser] = useState<UserType | null>(null);

    useEffect(() => {
        const refreshUser = async () => {
            const user = await getCurrentUser();
            setCurrentUser(user);
        };
        refreshUser();
    }, []);

    if (!quest) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No quest selected</Text>
                </View>
            </View>
        );
    }

    const handleCreateSidequest = async () => {
        if (!currentUser || !quest.id) return;
        try {
            const existingSidequests = await getSidequestsByQuestId(quest.id);
            const orderIndex = existingSidequests.length;
            
            const newSidequest = await createSidequest(quest.id, title, description, totalSidequestXp, orderIndex, Crypto.randomUUID());
            await addSidequestToQuest(quest.id, newSidequest.id);
            setRoute(routes.questDetails, { quest: await getQuestById(quest.id) });
        } catch (error) {
            Alert.alert('Error', 'Failed to create sidequest. The quest may not exist.');
            console.error('Failed to create sidequest:', error);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => setRoute(routes.questDetails, { quest })}>
                    <Ionicons name="arrow-back" size={24} color={colors.textLight} />
                </Pressable>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>New Sidequest</Text>
                    <Text style={styles.headerSubtitle}>{quest.title}</Text>
                </View>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Title</Text>
                    <TextInput 
                        style={styles.input}
                        placeholder="What needs to be done?"
                        placeholderTextColor={colors.textMuted}
                        value={title} 
                        onChangeText={setTitle} 
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Description</Text>
                    <TextInput 
                        style={[styles.input, styles.textArea]}
                        placeholder="Add more details..."
                        placeholderTextColor={colors.textMuted}
                        value={description} 
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>XP Reward</Text>
                    <TextInput 
                        style={styles.input}
                        placeholder="0"
                        placeholderTextColor={colors.textMuted}
                        value={totalSidequestXp.toString()} 
                        onChangeText={(text) => setTotalSidequestXp(Number(text) || 0)}
                        keyboardType="numeric"
                    />
                </View>

                <Pressable 
                    style={({ pressed }) => [styles.createButton, pressed && styles.buttonPressed]}
                    onPress={handleCreateSidequest}
                >
                    <Text style={styles.createButtonText}>Create Sidequest</Text>
                </Pressable>
            </ScrollView>
        </View>
    )
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
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: colors.gold,
    },
    backButton: {
        padding: spacing.sm,
        marginLeft: -spacing.sm,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontFamily: fonts.fantasyFamily,
        fontSize: fonts.sizes.xl,
        color: colors.textLight,
        fontWeight: fonts.weights.semibold,
    },
    headerSubtitle: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.sm,
        color: colors.goldLight,
    },
    headerSpacer: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: spacing.lg,
        gap: spacing.md,
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
    inputContainer: {
        gap: spacing.xs,
    },
    inputLabel: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.sm,
        color: colors.textSecondary,
        marginLeft: spacing.xs,
    },
    input: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.md,
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: colors.border,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    createButton: {
        backgroundColor: colors.gold,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
        marginTop: spacing.lg,
    },
    buttonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    createButtonText: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.lg,
        color: colors.backgroundDark,
        fontWeight: fonts.weights.bold,
    },
});
