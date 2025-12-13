import { Button, FlatList, Text, View } from "react-native";
import useFirebase, { QuestType, UserType, getQuests } from "@/core/useFirebase";
import { useCallback, useEffect, useState } from "react";
import { routes, useNavigation } from "@/core/useNavigation";

export default function Home() {
    const { getCurrentUser } = useFirebase();
    const { setRoute } = useNavigation();
    const [currentUser, setCurrentUser] = useState<UserType | null>(null);
    const [quests, setQuests] = useState<QuestType[]>([]);
    const refreshQuests = useCallback(async () => {
        if (!currentUser) return;
        const quests = await getQuests(currentUser.id);
        setQuests(quests);
    }, [currentUser]);
    useEffect(() => {
        const refreshUser = async () => {
            const user = await getCurrentUser();
            setCurrentUser(user);
            refreshQuests();
        };
        refreshUser();
    }, [getCurrentUser, refreshQuests]);
    return (
        <View>
            <FlatList data={quests} renderItem={({ item }: { item: QuestType }) => <Button title={item.title} onPress={() => setRoute(routes.questDetails, { quest: item })} />} />
        </View>
    )
}