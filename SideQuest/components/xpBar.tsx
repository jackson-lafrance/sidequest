import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
    xp: number;
    maxXp: number;
}

export default function XpBar({ xp, maxXp }: Props) {
    const progress = Math.min(xp / maxXp, 1);

    return (
        <View style={styles.container}>
            <View style={styles.barBackground}>
                <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.xpText}>{xp} / {maxXp} XP</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    barBackground: {
        height: 12,
        backgroundColor: '#E5E5EA',
        borderRadius: 6,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        backgroundColor: '#007AFF',
        borderRadius: 6,
    },
    xpText: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 4,
    },
});