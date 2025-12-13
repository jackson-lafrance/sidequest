import { SidequestType, completeSidequest, deleteSidequest } from "@/core/useFirebase";
import { Button, Text, View } from "react-native";

interface Props {
    sidequest: SidequestType;
    isFirst?: boolean;
    onUpdate?: () => void;
}

export default function SidequestDetails({ sidequest, isFirst, onUpdate }: Props) {

    const handleCompleteSidequest = async () => {   
        if (!sidequest) return;
        await completeSidequest(sidequest.id);
        onUpdate?.();
    };
    const handleDeleteSidequest = async () => {
        if (!sidequest) return;
        await deleteSidequest(sidequest.id, sidequest.questId);
        onUpdate?.();
    };

    if (!sidequest) {
        return (
            <></>
        );
    }
    return (
        <View>
            <Text>SidequestDetails</Text>
            <Text>Title: {sidequest.title}</Text>
            <Text>Description: {sidequest.description}</Text>
            <Text>Total Sidequest XP: {sidequest.totalSidequestXp}</Text>
            <Text>Is Completed: {sidequest.isCompleted ? 'Yes' : 'No'}</Text>
            <Text>Order Index: {sidequest.orderIndex}</Text>
            {isFirst && <Button title="Complete Sidequest" onPress={handleCompleteSidequest} />}
            <Button title="Delete Sidequest" onPress={handleDeleteSidequest} />
        </View>
    );
}