import useFirebase, { QuestType, SidequestType, deleteQuest, getSidequestsByQuestId } from "@/core/useFirebase";
import { Button, FlatList, Text, View } from "react-native";
import { routes, useNavigation } from "@/core/useNavigation";
import SidequestDetails from "./SidequestDetails";
import { useCallback, useEffect, useState } from "react";

interface Props {
    quest: QuestType;
}

export default function QuestDetails({ quest }: Props) {
    const { completeQuest } = useFirebase();
    const { setRoute } = useNavigation();
    const handleDeleteQuest = async () => {
        if (!quest) return;
        await deleteQuest(quest.id);
        setRoute(routes.home);
    };
    const handleCompleteQuest = async () => {
        if (!quest) return;
        await completeQuest(quest.id);
    };
    const [sidequests, setSidequests] = useState<SidequestType[]>([]);
    const refreshSidequests = useCallback(() => {
        if (!quest) return;
        getSidequestsByQuestId(quest.id).then((sidequests) => {
            const sorted = [...sidequests].sort((a, b) => a.orderIndex - b.orderIndex);
            setSidequests(sorted);
        });
    }, [quest]);
    useEffect(() => {
        refreshSidequests();
    }, [refreshSidequests]);
    if (!quest) {
        return (
            <View>
                <Text>No quest selected</Text>      
            </View>
        );
    }

    return (
        <FlatList 
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 100 }}
            data={sidequests} 
            keyExtractor={(item) => item.id} 
            ListHeaderComponent={
                <View>
                    <Text>QuestDetails</Text>
                    <Text>Title: {quest.title}</Text>
                    <Text>Description: {quest.description}</Text>
                    <Text>Total Quest XP: {quest.totalQuestXp}</Text>
                    <Text>Status: {quest.status}</Text>
                    <Text>Created At: {quest.createdAt.toDate().toLocaleDateString()}</Text>
                    <Text>Completed At: {quest.completedAt?.toDate().toLocaleDateString()}</Text>
                    {quest.status === 'active' && <Button title="Complete Quest" onPress={handleCompleteQuest} />}
                    <Button title="Delete Quest" onPress={handleDeleteQuest} />
                    <Button title="Create Sidequest" onPress={() => setRoute(routes.createSidequest, { quest: quest })} />
                </View>
            }
            renderItem={({ item }: { item: SidequestType }) => {
                const firstUncompletedIndex = sidequests.findIndex(s => !s.isCompleted);
                const isFirst = sidequests.indexOf(item) === firstUncompletedIndex;
                return <SidequestDetails sidequest={item} isFirst={isFirst} onUpdate={refreshSidequests} />;
            }} 
        />
    )
}

