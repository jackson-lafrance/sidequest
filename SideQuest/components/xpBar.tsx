import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, fonts, spacing, borderRadius } from "@/core/theme";

interface Props {
    xp: number;
    maxXp: number;
    title?: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function XpBar({ xp, maxXp, title, size = 'md' }: Props) {
    const progress = Math.min(xp / maxXp, 1);
    
    const barHeight = size === 'sm' ? 8 : size === 'lg' ? 16 : 12;
    const fontSize = size === 'sm' ? fonts.sizes.xs : size === 'lg' ? fonts.sizes.md : fonts.sizes.sm;

    return (
        <View style={styles.container}>
            <View style={[styles.barBackground, { height: barHeight }]}>
                <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
                {/* Gold shimmer overlay */}
                <View style={[styles.barShimmer, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={[styles.xpText, { fontSize }]}>
                {title ? title : `${xp} / ${maxXp} XP`}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: spacing.xs,
    },
    barBackground: {
        backgroundColor: colors.backgroundDark,
        borderRadius: borderRadius.round,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
    },
    barFill: {
        height: '100%',
        backgroundColor: colors.gold,
        borderRadius: borderRadius.round,
    },
    barShimmer: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '40%',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: borderRadius.round,
    },
    xpText: {
        fontFamily: fonts.bodyFamily,
        color: colors.textSecondary,
        fontWeight: fonts.weights.medium,
    },
});
