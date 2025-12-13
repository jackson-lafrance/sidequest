import useFirebase, { UserType, createQuest } from "@/core/useFirebase";
import { routes, useNavigation } from "@/core/useNavigation";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Button, ScrollView, Text, TextInput, View } from "react-native";
import * as Crypto from "expo-crypto";
import usePrompt from "@/core/usePrompt";

export default function CreateQuest() {
    const { getCurrentUser } = useFirebase();
    const { setRoute } = useNavigation();
    const { generateQuestWithAI, loading: aiLoading } = usePrompt();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [totalQuestXp, setTotalQuestXp] = useState(0);
    const [currentUser, setCurrentUser] = useState<UserType | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        const refreshUser = async () => {
            const user = await getCurrentUser();
            setCurrentUser(user);
        };
        refreshUser();
    }, [getCurrentUser]);

    const handleCreateQuest = async () => {
        if (!currentUser) return;
        try {
            const newQuest = await createQuest(currentUser.id, title, description, totalQuestXp, Crypto.randomUUID());
            setTitle('');
            setDescription('');
            setTotalQuestXp(0);
            setRoute(routes.questDetails, { quest: newQuest });
        } catch (error) {
            Alert.alert('Error', 'Failed to create quest. Check Firebase rules.');
            console.error('Failed to create quest:', error);
        }
    };

    const handleCreateQuestWithAI = async () => {
        if (!currentUser) return;
        setIsCreating(true);
        
        try {
            const { quest } = await generateQuestWithAI(currentUser.id, title, description);
            
            setTitle('');
            setDescription('');
            setTotalQuestXp(0);
            setRoute(routes.questDetails, { quest });
        } catch (error) {
            Alert.alert('Error', 'Failed to create quest with AI.');
            console.error('Failed to create quest with AI:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const isLoading = isCreating || aiLoading;

    return (
        <ScrollView style={{ flex: 1 }}>
            <Text>CreateQuest</Text>
            <TextInput placeholder="Title" value={title} onChangeText={setTitle} editable={!isLoading} />
            <TextInput placeholder="Description" value={description} onChangeText={setDescription} editable={!isLoading} />
            <TextInput placeholder="Total Quest XP (manual only)" value={totalQuestXp.toString()} onChangeText={(text) => setTotalQuestXp(Number(text))} editable={!isLoading} />
            
            {isLoading ? (
                <View style={{ alignItems: 'center', padding: 20 }}>
                    <ActivityIndicator size="large" />
                    <Text style={{ marginTop: 10 }}>
                        {aiLoading ? 'AI is planning your quest...' : 'Creating quest...'}
                    </Text>
                </View>
            ) : (
                <>
                    <Button title="Create Quest (Manual)" onPress={handleCreateQuest} />
                    <Button title="Create Quest with AI" onPress={handleCreateQuestWithAI} />
                </>
            )}
        </ScrollView>
    )
}

