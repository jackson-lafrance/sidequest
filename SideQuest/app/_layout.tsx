import React, { useEffect } from "react";
import { View, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import NavigationProvider from "../core/useNavigation";
import { Slot } from "expo-router";
import { initializeFirebase } from "../core/firebase";
import { colors } from "@/core/theme";

try {
  initializeFirebase();
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
}

export default function RootLayout() {
  useEffect(() => {
    try {
      initializeFirebase();
    } catch (error) {
      console.error("Failed to initialize Firebase in useEffect:", error);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={{ flex: 1, backgroundColor: colors.backgroundDark }}>
        <NavigationProvider>
          <Slot />
        </NavigationProvider>
      </View>
    </SafeAreaProvider>
  );
}
