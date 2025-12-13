import { Button, FlatList, View } from "react-native";
import useFirebase, { QuestType, UserType, getQuests } from "@/core/useFirebase";
import { useEffect, useState } from "react";
import { routes, useNavigation } from "@/core/useNavigation";

export default function Home() {
    const { getCurrentUser } = useFirebase();
    const { setRoute } = useNavigation();
    const [currentUser, setCurrentUser] = useState<UserType | null>(null);
    const [quests, setQuests] = useState<QuestType[]>([]);

    useEffect(() => {
        getCurrentUser().then(setCurrentUser);
    }, [getCurrentUser]);

    useEffect(() => {
        if (!currentUser) return;
        getQuests(currentUser.id).then(setQuests);
    }, [currentUser]);
    return (
        <View style={{ flex: 1 }}>
            <FlatList 
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 100 }}
                data={quests} 
                keyExtractor={(item) => item.id}
                renderItem={({ item }: { item: QuestType }) => <Button title={item.title} onPress={() => setRoute(routes.questDetails, { quest: item })} />} 
            />
        </View>
    )
}