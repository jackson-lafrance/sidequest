import NavigationProvider from "../core/useNavigation";
import { Slot } from "expo-router";
import { useEffect } from "react";
import { initializeFirebase } from "../core/firebase";

export default function RootLayout() {
  useEffect(() => {
    // Initialize Firebase when app starts
    initializeFirebase();
  }, []);

  return (
    <NavigationProvider>
      <Slot />
    </NavigationProvider>
  );
}

