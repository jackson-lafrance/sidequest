import { Text, View, Button } from "react-native";
import { logout } from "@/core/useFirebase";

export default function Settings() {
    const handleLogout = async () => {
        await logout();
    };

    return (
        <View>
            <Text>Settings</Text>
            <Button title="Log Out" onPress={handleLogout} />
        </View>
    )
}

