import useFirebase, { QuestType } from "@/core/useFirebase";
import { Button, Text, View } from "react-native";

interface Props {
    quest: QuestType;
}

export default function QuestDetails({ quest }: Props) {
    const { completeQuest } = useFirebase();
    const handleCompleteQuest = async () => {
        if (!quest) return;
        await completeQuest(quest.id);
    };
    return (
        <View>
            <Text>QuestDetails</Text>
            <Text>Title: {quest.title}</Text>
            <Text>Description: {quest.description}</Text>
            <Text>Total Quest XP: {quest.totalQuestXp}</Text>
            <Text>Status: {quest.status}</Text>
            <Text>Created At: {quest.createdAt.toDate().toLocaleDateString()}</Text>
            <Text>Completed At: {quest.completedAt?.toDate().toLocaleDateString()}</Text>
            {quest.status === 'active' && <Button title="Complete Quest" onPress={handleCompleteQuest} />}
        </View>
    )
}

