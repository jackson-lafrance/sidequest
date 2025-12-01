import React, { Dispatch, SetStateAction } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteKey } from '../../core/useNavigation';

interface Props {
    tabs: {
        icon: keyof typeof Ionicons.glyphMap;
        route: RouteKey;
    }[];
    setRoute: Dispatch<SetStateAction<RouteKey>>;
    route: RouteKey;
}

export default function BottomTabBar({ tabs, setRoute, route }: Props) {
    return (
        <View style={styles.container}>
            {tabs.map((tab, index) => {
                return (
                    <Pressable
                        key={index} 
                        style={styles.tab}
                        onPress={() => setRoute(tab.route)}
                    >
                        <Ionicons
                            name={tab.icon}
                            size={24}
                            color={route === tab.route ? '#007AFF' : '#8E8E93'}
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
});

