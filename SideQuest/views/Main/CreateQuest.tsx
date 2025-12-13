import useFirebase, { UserType, createQuest } from "@/core/useFirebase";
import { routes, useNavigation } from "@/core/useNavigation";
import React, { useEffect, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

export default function CreateQuest() {
    const { getCurrentUser } = useFirebase();
    const { setRoute } = useNavigation();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [totalQuestXp, setTotalQuestXp] = useState(0);
    const [currentUser, setCurrentUser] = useState<UserType | null>(null);

    useEffect(() => {
        const refreshUser = async () => {
            const user = await getCurrentUser();
            setCurrentUser(user);
        };
        refreshUser();
    }, [getCurrentUser]);
    const handleCreateQuest = async () => {
        if (!currentUser) return;
        await createQuest(currentUser.id, title, description, totalQuestXp);
        setTitle('');
        setDescription('');
        setTotalQuestXp(0);
        setRoute(routes.home);
    };
    return (
        <View>
            <Text>CreateQuest</Text>
            <TextInput placeholder="Title" value={title} onChangeText={setTitle} />
            <TextInput placeholder="Description" value={description} onChangeText={setDescription} />
            <TextInput placeholder="Total Quest XP" value={totalQuestXp.toString()} onChangeText={(text) => setTotalQuestXp(Number(text))} />
            <Button title="Create Quest" onPress={handleCreateQuest} />
        </View>
    )
}

