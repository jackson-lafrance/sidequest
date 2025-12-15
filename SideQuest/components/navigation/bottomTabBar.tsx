import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteKey, RouteProps } from '../../core/routes';
import { spacing } from '@/core/theme';
import { useTheme } from '@/core/useTheme';

interface Props {
    tabs: {
        icon: keyof typeof Ionicons.glyphMap;
        route: RouteKey;
    }[];
    setRoute: (route: RouteKey, props?: RouteProps) => void;
    route: RouteKey;
}

export default function BottomTabBar({ tabs, setRoute, route }: Props) {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <View style={styles.container}>
            {tabs.map((tab, index) => {
                const isActive = route === tab.route;
                return (
                    <Pressable
                        key={index} 
                        style={styles.tab}
                        onPress={() => setRoute(tab.route)}
                    >
                        <Ionicons
                            name={tab.icon}
                            size={24}
                            color={isActive ? colors.gold : colors.textMuted}
                        />                        
                    </Pressable>
                );
            })}
        </View>
    );
}

const createStyles = (colors: typeof import('@/core/useTheme').darkColors) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: colors.backgroundDark,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: spacing.lg,
        paddingTop: spacing.sm,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
    },
});
