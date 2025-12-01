import React, { useEffect } from "react";
import NavigationProvider from "../core/useNavigation";
import { Slot } from "expo-router";
import { initializeFirebase } from "../core/firebase";


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
    <NavigationProvider>
      <Slot />
    </NavigationProvider>
  );
}

