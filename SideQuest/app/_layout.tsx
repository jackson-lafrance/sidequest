import React, { useEffect } from "react";
import NavigationProvider from "../core/useNavigation";
import { Slot } from "expo-router";
import { initializeFirebase } from "../core/firebase";

export default function RootLayout() {
  useEffect(() => {
    initializeFirebase();
  }, []);

  return (
    <NavigationProvider>
      <Slot />
    </NavigationProvider>
  );
}

