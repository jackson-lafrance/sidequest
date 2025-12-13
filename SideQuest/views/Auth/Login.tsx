import useFirebase, { signUp } from "@/core/useFirebase";
import { routes, useNavigation } from "@/core/useNavigation";
import { useEffect, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

export default function Login() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginOrSignup, setLoginOrSignup] = useState<'login' | 'signup'>('login');
    const { signIn, onAuthChange } = useFirebase();
    const { setRoute } = useNavigation();

    useEffect(() => {
        const unsubscribe = onAuthChange((user) => {
            if (user) {
                setRoute(routes.home);
            }
        });
        return () => unsubscribe();
    }, [setRoute, onAuthChange]);


    const handleLogin = async () => {
        const result = await signIn(email, password);
        if (result) setRoute(routes.home);
    }

    const handleSignup = async () => {
        const result = await signUp(email, password, username);
        if (result) setRoute(routes.home);
    }

    if (loginOrSignup === 'login') {
        return (
            <View>
                <Text>Login</Text>
                <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
                <TextInput placeholder="Password" value={password} onChangeText={setPassword} />
                <Button title="Login" onPress={handleLogin} />
                <Button title="Signup" onPress={() => setLoginOrSignup('signup')} />
            </View>
        )
    }

    return (
        <View>
            <Text>Signup</Text>
            <TextInput placeholder="Username" value={username} onChangeText={setUsername} />
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
            <TextInput placeholder="Password" value={password} onChangeText={setPassword} />
            <Button title="Signup" onPress={handleSignup} />
        </View>
    )
}

