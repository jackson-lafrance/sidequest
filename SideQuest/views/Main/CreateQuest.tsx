import useFirebase, { UserType } from "@/core/useFirebase";
import { routes, useNavigation } from "@/core/useNavigation";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, View, Pressable, StyleSheet } from "react-native";
import usePrompt, { ConversationMessage } from "@/core/usePrompt";
import { fonts, spacing, borderRadius } from "@/core/theme";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/core/useTheme";

type ConversationState = 'initial' | 'asking' | 'complete';

export default function CreateQuest() {
    const { colors } = useTheme();
    const { getCurrentUser } = useFirebase();
    const { setRoute } = useNavigation();
    const { startQuestConversation, continueQuestConversation, finalizeQuest, loading: aiLoading } = usePrompt();
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const styles = createStyles(colors);
    const [currentUser, setCurrentUser] = useState<UserType | null>(null);
    
    // Conversation state
    const [conversationState, setConversationState] = useState<ConversationState>('initial');
    const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<string>('');
    const [userAnswer, setUserAnswer] = useState('');

    useEffect(() => {
        const refreshUser = async () => {
            const user = await getCurrentUser();
            setCurrentUser(user);
        };
        refreshUser();
    }, [getCurrentUser]);

    const handleStartQuest = async () => {
        if (!currentUser) return;
        
        try {
            const response = await startQuestConversation(title, description);
            
            // Add the initial message to history
            const initialMessage = `I want to create a quest:\n\nTitle: ${title || 'Not provided'}\nDescription: ${description || 'Not provided'}`;
            
            if (response.needsMoreInfo && response.question) {
                setConversationHistory([
                    { role: 'user', content: initialMessage },
                    { role: 'assistant', content: JSON.stringify(response) },
                ]);
                setCurrentQuestion(response.question);
                setConversationState('asking');
            } else if (response.questPlan) {
                setConversationState('complete');
                
                // Automatically create the quest
                const { quest } = await finalizeQuest(currentUser.id, response.questPlan);
                setRoute(routes.questDetails, { quest });
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to start quest creation.');
            console.error('Failed to start quest:', error);
        }
    };

    const handleAnswerQuestion = async () => {
        if (!currentUser || !userAnswer.trim()) return;
        
        try {
            const response = await continueQuestConversation(conversationHistory, userAnswer.trim());
            
            // Update conversation history
            const newHistory: ConversationMessage[] = [
                ...conversationHistory,
                { role: 'user', content: userAnswer.trim() },
                { role: 'assistant', content: JSON.stringify(response) },
            ];
            setConversationHistory(newHistory);
            setUserAnswer('');
            
            if (response.needsMoreInfo && response.question) {
                setCurrentQuestion(response.question);
                setConversationState('asking');
            } else if (response.questPlan) {
                setConversationState('complete');
                
                // Automatically create the quest
                const { quest } = await finalizeQuest(currentUser.id, response.questPlan);
                setRoute(routes.questDetails, { quest });
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to continue conversation.');
            console.error('Failed to continue:', error);
        }
    };

    const handleReset = () => {
        setConversationState('initial');
        setConversationHistory([]);
        setCurrentQuestion('');
        setUserAnswer('');
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => setRoute(routes.home)}>
                    <Ionicons name="arrow-back" size={24} color={colors.textLight} />
                </Pressable>
                <Text style={styles.headerTitle}>New Quest</Text>
                {conversationState !== 'initial' ? (
                    <Pressable style={styles.resetButton} onPress={handleReset}>
                        <Ionicons name="refresh" size={22} color={colors.textLight} />
                    </Pressable>
                ) : (
                    <View style={styles.headerSpacer} />
                )}
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                {conversationState === 'initial' && (
                    <>
                        <Text style={styles.sectionTitle}>What do you want to accomplish?</Text>
                        
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Title</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="What's your quest?" 
                                placeholderTextColor={colors.textMuted}
                                value={title} 
                                onChangeText={setTitle} 
                                editable={!aiLoading} 
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Description (optional)</Text>
                            <TextInput 
                                style={[styles.input, styles.textArea]}
                                placeholder="Any details that might help..."
                                placeholderTextColor={colors.textMuted}
                                value={description} 
                                onChangeText={setDescription} 
                                editable={!aiLoading}
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        {aiLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={colors.gold} />
                                <Text style={styles.loadingText}>AI is thinking...</Text>
                            </View>
                        ) : (
                            <Pressable 
                                style={({ pressed }) => [
                                    styles.aiButton, 
                                    !title.trim() && styles.aiButtonDisabled,
                                    pressed && title.trim() && styles.buttonPressed
                                ]}
                                onPress={handleStartQuest}
                                disabled={!title.trim()}
                            >
                                <Ionicons name="sparkles" size={20} color={title.trim() ? colors.backgroundDark : colors.textMuted} />
                                <Text style={[styles.aiButtonText, !title.trim() && styles.aiButtonTextDisabled]}>
                                    Create with AI
                                </Text>
                            </Pressable>
                        )}
                    </>
                )}

                {conversationState === 'asking' && (
                    <>
                        {/* Show the original quest info */}
                        <View style={styles.originalQuest}>
                            <Text style={styles.originalQuestLabel}>Your Quest</Text>
                            <Text style={styles.originalQuestTitle}>{title || 'Untitled'}</Text>
                            {description && (
                                <Text style={styles.originalQuestDescription}>{description}</Text>
                            )}
                        </View>

                        {/* AI Question */}
                        <View style={styles.questionCard}>
                            <View style={styles.questionHeader}>
                                <Ionicons name="sparkles" size={18} color={colors.gold} />
                                <Text style={styles.questionHeaderText}>AI needs more info</Text>
                            </View>
                            <Text style={styles.questionText}>{currentQuestion}</Text>
                        </View>

                        {/* Answer Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Your answer</Text>
                            <TextInput 
                                style={[styles.input, styles.textArea]}
                                placeholder="Type your answer..."
                                placeholderTextColor={colors.textMuted}
                                value={userAnswer} 
                                onChangeText={setUserAnswer} 
                                editable={!aiLoading}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        {aiLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={colors.gold} />
                                <Text style={styles.loadingText}>AI is thinking...</Text>
                            </View>
                        ) : (
                            <Pressable 
                                style={({ pressed }) => [
                                    styles.aiButton, 
                                    !userAnswer.trim() && styles.aiButtonDisabled,
                                    pressed && userAnswer.trim() && styles.buttonPressed
                                ]}
                                onPress={handleAnswerQuestion}
                                disabled={!userAnswer.trim()}
                            >
                                <Ionicons name="send" size={20} color={userAnswer.trim() ? colors.backgroundDark : colors.textMuted} />
                                <Text style={[styles.aiButtonText, !userAnswer.trim() && styles.aiButtonTextDisabled]}>
                                    Send Answer
                                </Text>
                            </Pressable>
                        )}
                    </>
                )}

                {conversationState === 'complete' && aiLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.gold} />
                        <Text style={styles.loadingText}>Creating your quest...</Text>
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
    headerSpacer: {
        width: 40,
    },
    resetButton: {
        padding: spacing.sm,
        marginRight: -spacing.sm,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: spacing.lg,
        gap: spacing.md,
        paddingBottom: 120,
    },
    sectionTitle: {
        fontFamily: fonts.fantasyFamily,
        fontSize: fonts.sizes.lg,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
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
        minHeight: 100,
        textAlignVertical: 'top',
    },
    loadingContainer: {
        alignItems: 'center',
        padding: spacing.xxl,
        gap: spacing.md,
    },
    loadingText: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.md,
        color: colors.textSecondary,
    },
    aiButton: {
        marginTop: spacing.lg,
        backgroundColor: colors.gold,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    aiButtonDisabled: {
        backgroundColor: colors.border,
    },
    buttonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    aiButtonText: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.lg,
        color: colors.backgroundDark,
        fontWeight: fonts.weights.bold,
    },
    aiButtonTextDisabled: {
        color: colors.textMuted,
    },
    originalQuest: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        gap: spacing.xs,
        borderLeftWidth: 3,
        borderLeftColor: colors.gold,
    },
    originalQuestLabel: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.xs,
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    originalQuestTitle: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.lg,
        color: colors.textPrimary,
        fontWeight: fonts.weights.semibold,
    },
    originalQuestDescription: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.sm,
        color: colors.textSecondary,
    },
    questionCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        gap: spacing.md,
        borderWidth: 1,
        borderColor: colors.gold,
    },
    questionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    questionHeaderText: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.sm,
        color: colors.gold,
        fontWeight: fonts.weights.medium,
    },
    questionText: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.lg,
        color: colors.textPrimary,
        lineHeight: 26,
    },
});
