import useFirebase, { signUp } from "@/core/useFirebase";
import { routes, useNavigation } from "@/core/useNavigation";
import { useEffect, useState } from "react";
import { Text, TextInput, View, Pressable, StyleSheet, Image, KeyboardAvoidingView, Platform } from "react-native";
import { fonts, spacing, borderRadius } from "@/core/theme";
import { useTheme } from "@/core/useTheme";

export default function Login() {
    const { colors } = useTheme();
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginOrSignup, setLoginOrSignup] = useState<'login' | 'signup'>('login');
    const { signIn, onAuthChange } = useFirebase();
    const { setRoute } = useNavigation();
    const styles = createStyles(colors);

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

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Image 
                        source={require('@/assets/images/logonobackground.png')} 
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.appName}>SideQuest</Text>
                    <Text style={styles.tagline}>Your adventure awaits</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Text style={styles.formTitle}>
                        {loginOrSignup === 'login' ? 'Welcome Back' : 'Create Account'}
                    </Text>

                    {loginOrSignup === 'signup' && (
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Username</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="Choose a username" 
                                placeholderTextColor={colors.textMuted}
                                value={username} 
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                        </View>
                    )}

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="Enter your email" 
                            placeholderTextColor={colors.textMuted}
                            value={email} 
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="Enter your password" 
                            placeholderTextColor={colors.textMuted}
                            value={password} 
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <Pressable 
                        style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
                        onPress={loginOrSignup === 'login' ? handleLogin : handleSignup}
                    >
                        <Text style={styles.primaryButtonText}>
                            {loginOrSignup === 'login' ? 'Login' : 'Create Account'}
                        </Text>
                    </Pressable>

                    <Pressable 
                        style={styles.switchButton}
                        onPress={() => setLoginOrSignup(loginOrSignup === 'login' ? 'signup' : 'login')}
                    >
                        <Text style={styles.switchButtonText}>
                            {loginOrSignup === 'login' 
                                ? "Don't have an account? Sign up" 
                                : "Already have an account? Login"}
                        </Text>
                    </Pressable>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

const createStyles = (colors: typeof import('@/core/useTheme').darkColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: spacing.xl,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: spacing.md,
    },
    appName: {
        fontFamily: fonts.fantasyFamily,
        fontSize: fonts.sizes.hero,
        color: colors.gold,
        fontWeight: fonts.weights.bold,
    },
    tagline: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.md,
        color: colors.textMuted,
        marginTop: spacing.xs,
    },
    form: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        gap: spacing.md,
    },
    formTitle: {
        fontFamily: fonts.fantasyFamily,
        fontSize: fonts.sizes.xl,
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    inputContainer: {
        gap: spacing.xs,
    },
    inputLabel: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.sm,
        color: colors.textSecondary,
        marginLeft: spacing.xs,
    },
    input: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.md,
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: colors.border,
    },
    primaryButton: {
        backgroundColor: colors.gold,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    buttonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    primaryButtonText: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.lg,
        color: colors.backgroundDark,
        fontWeight: fonts.weights.bold,
    },
    switchButton: {
        alignItems: 'center',
        padding: spacing.sm,
    },
    switchButtonText: {
        fontFamily: fonts.bodyFamily,
        fontSize: fonts.sizes.sm,
        color: colors.accent,
    },
});
