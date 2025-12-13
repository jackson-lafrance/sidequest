import { QuestType, UserType, getCurrentUser, createSidequest, addSidequestToQuest, getQuestById, getSidequestsByQuestId } from "@/core/useFirebase";
import { useEffect, useState } from "react";
import { Text, TextInput, Button, ScrollView, Alert, View } from "react-native";
import * as Crypto from "expo-crypto";
import { routes, useNavigation } from "@/core/useNavigation";

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
            <View>
                <Text>No quest selected</Text>
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
        <ScrollView style={{ flex: 1 }}>
            <Text>CreateSidequest</Text>
            <TextInput placeholder="Title" value={title} onChangeText={setTitle} />
            <TextInput placeholder="Description" value={description} onChangeText={setDescription} />
            <TextInput placeholder="Total Sidequest XP" value={totalSidequestXp.toString()} onChangeText={(text) => setTotalSidequestXp(Number(text))} />
            <Button title="Create Sidequest" onPress={handleCreateSidequest} />
        </ScrollView>
    )
}