import React, { useEffect, useState, useCallback } from "react";
import { Button, ScrollView, Text, View } from "react-native";
import useFirebase, { UserType, addXp } from "@/core/useFirebase";
import XpBar from "@/components/xpBar";

export default function Profile() {
    const { getCurrentUser } = useFirebase();
    const [currentUser, setCurrentUser] = useState<UserType | null>(null);

    const refreshUser = useCallback(async () => {
        const user = await getCurrentUser();
        setCurrentUser(user);
    }, [getCurrentUser]);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const handleAddXp = async () => {
        if (!currentUser) return;
        await addXp(currentUser.id, 10);
        await refreshUser();
    };

    if (!currentUser) {
        return (
            <View>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1 }}>
            <Text>Profile</Text>
            <Text>Email: {currentUser.email}</Text>
            <Text>Username: {currentUser.displayName}</Text>
            <Text>Created At: {currentUser.createdAt.toDate().toLocaleDateString()}</Text>
            <Text>Level: {currentUser.level}</Text>
            <Text>Current XP: {currentUser.currentXp}</Text>
            <XpBar xp={currentUser.currentXp} maxXp={currentUser.level * 100} />
            <Button title="Add XP" onPress={handleAddXp} />
        </ScrollView>
    )
}

