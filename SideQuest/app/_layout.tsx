import React, { useEffect } from "react";
import NavigationProvider from "../core/useNavigation";
import { Slot } from "expo-router";
import { initializeFirebase } from "../core/firebase";

export default function RootLayout() {
  useEffect(() => {
    try {
      initializeFirebase();
    } catch (error) {
      console.error("Failed to initialize Firebase:", error);

    }
  }, []);

  return (
    <NavigationProvider>
      <Slot />
    </NavigationProvider>
  );
}

