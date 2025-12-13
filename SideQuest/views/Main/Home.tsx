import { Text, View, Pressable, ScrollView } from "react-native";
import useFirebase, { QuestType, UserType, SidequestType, getQuests, getSidequestsByQuestId } from "@/core/useFirebase";
import { useEffect, useState, useCallback } from "react";
import { routes, useNavigation } from "@/core/useNavigation";
import XpBar from "@/components/xpBar";

interface QuestWithSidequests extends QuestType {
    sidequests: SidequestType[];
}

export default function Home() {
    const { getCurrentUser } = useFirebase();
    const { setRoute } = useNavigation();
    const [currentUser, setCurrentUser] = useState<UserType | null>(null);
    const [questsWithSidequests, setQuestsWithSidequests] = useState<QuestWithSidequests[]>([]);

    const refreshUser = useCallback(async () => {
        const user = await getCurrentUser();
        setCurrentUser(user);
    }, [getCurrentUser]);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    useEffect(() => {
        if (!currentUser) return;
        
        const fetchQuestsWithSidequests = async () => {
            const quests = await getQuests(currentUser.id);
            const questsWithSq = await Promise.all(
                quests.map(async (quest) => {
                    const sidequests = await getSidequestsByQuestId(quest.id);
                    return { ...quest, sidequests: sidequests.sort((a, b) => a.orderIndex - b.orderIndex) };
                })
            );
            setQuestsWithSidequests(questsWithSq);
        };
        
        fetchQuestsWithSidequests();
    }, [currentUser]);

    const getCurrentSidequest = (sidequests: SidequestType[]): SidequestType | null => {
        return sidequests.find(sq => !sq.isCompleted) || null;
    };

    const getProgress = (sidequests: SidequestType[]): { completed: number; total: number } => {
        const completed = sidequests.filter(sq => sq.isCompleted).length;
        return { completed, total: sidequests.length };
    };

    // Separate active and completed quests
    const activeQuests = questsWithSidequests.filter(q => q.status === 'active');
    const completedQuests = questsWithSidequests.filter(q => q.status === 'completed');

    if (!currentUser) {
        return (
            <View>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1 }}>
            {/* Profile Section */}
            <View>
                <Text>Hello, {currentUser.displayName}</Text>
                <Text>Level {currentUser.level}</Text>
                <XpBar xp={currentUser.currentXp} maxXp={currentUser.level * 100} />
            </View>

            {/* Active Quests */}
            <View>
                <Text>Quests</Text>
                {activeQuests.map((quest) => {
                    const currentSidequest = getCurrentSidequest(quest.sidequests);
                    const progress = getProgress(quest.sidequests);
                    
                    return (
                        <Pressable 
                            key={quest.id} 
                            onPress={() => setRoute(routes.questDetails, { quest })}
                        >
                            <View>
                                <View>
                                    <Text>{quest.title}</Text>
                                    {currentSidequest && (
                                        <Text>{currentSidequest.title}</Text>
                                    )}
                                </View>
                                <Text>{progress.completed}/{progress.total}</Text>
                            </View>
                        </Pressable>
                    );
                })}
            </View>

            {/* Completed Quests */}
            {completedQuests.length > 0 && (
                <View>
                    <Text>Completed</Text>
                    {completedQuests.map((quest) => {
                        const progress = getProgress(quest.sidequests);
                        
                        return (
                            <Pressable 
                                key={quest.id} 
                                onPress={() => setRoute(routes.questDetails, { quest })}
                            >
                                <View>
                                    <View>
                                        <Text style={{ textDecorationLine: 'line-through' }}>
                                            {quest.title}
                                        </Text>
                                    </View>
                                    <Text style={{ textDecorationLine: 'line-through' }}>
                                        {progress.completed}/{progress.total}
                                    </Text>
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            )}
        </ScrollView>
    );
}
