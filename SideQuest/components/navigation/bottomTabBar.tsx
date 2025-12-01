import { View, StyleSheet, Pressable } from 'react-native';
import { useNavigation, Route } from '../../core/useNavigation';
import { Ionicons } from '@expo/vector-icons';

export interface TabItem {
    icon: keyof typeof Ionicons.glyphMap;
    route: Route;
}

interface BottomTabBarProps {
    tabs: TabItem[];
}

export default function BottomTabBar({ tabs }: BottomTabBarProps) {
    const { route, setRoute } = useNavigation();

    return (
        <View style={styles.container}>
            {tabs.map((tab, index) => {
                const isActive = route === tab.route;
                return (
                    <Pressable
                        key={index}
                        style={[styles.tab]}
                        onPress={() => setRoute(tab.route)}
                    >
                        <Ionicons
                            name={tab.icon}
                            size={24}
                            color={isActive ? '#007AFF' : '#8E8E93'}
                        />
                        
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
        paddingBottom: 8,
        paddingTop: 8,
        elevation: 5,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    label: {
        fontSize: 10,
        color: '#8E8E93',
        marginTop: 4,
    },
    activeLabel: {
        color: '#007AFF',
    },
});

