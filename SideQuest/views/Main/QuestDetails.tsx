import useFirebase, { QuestType, SidequestType, deleteQuest, getSidequestsByQuestId, canCompleteQuest, getQuestById } from "@/core/useFirebase";
import { Alert, Button, FlatList, Text, View } from "react-native";
import { routes, useNavigation } from "@/core/useNavigation";
import SidequestDetails from "./SidequestDetails";
import { useCallback, useEffect, useState } from "react";
import XpBar from "@/components/xpBar";

interface Props {
    quest: QuestType;
}

export default function QuestDetails({ quest: initialQuest }: Props) {
    const { completeQuest } = useFirebase();
    const { setRoute } = useNavigation();
    const [quest, setQuest] = useState<QuestType | null>(initialQuest);
    const [sidequests, setSidequests] = useState<SidequestType[]>([]);
    const [canComplete, setCanComplete] = useState(false);

    const handleDeleteQuest = async () => {
        if (!quest) return;
        await deleteQuest(quest.id);
        setRoute(routes.home);
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
                    <XpBar 
                        xp={sidequests.filter(s => s.isCompleted).length} 
                        maxXp={sidequests.length} 
                        title={`${sidequests.filter(s => s.isCompleted).length} / ${sidequests.length} Sidequests Completed`} 
                    />
                    {quest.status === 'active' && (
                        <Button 
                            title={canComplete ? "Complete Quest" : `Complete Quest (${sidequests.filter(s => !s.isCompleted).length} remaining)`}
                            onPress={handleCompleteQuest} 
                            disabled={!canComplete}
                        />
                    )}
                    <Button title="Delete Quest" onPress={handleDeleteQuest} />
                    <Button title="Create Sidequest" onPress={() => setRoute(routes.createSidequest, { quest: quest })} />
                </View>
            }
            renderItem={({ item }: { item: SidequestType }) => {
                const firstUncompletedIndex = sidequests.findIndex(s => !s.isCompleted);
                const isFirst = sidequests.indexOf(item) === firstUncompletedIndex;
                return <SidequestDetails sidequest={item} isFirst={isFirst} onUpdate={refreshData} />;
            }} 
        />
    )
}

