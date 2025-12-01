import NavigationProvider from "../core/useNavigation";
import { Slot } from "expo-router";

export default function RootLayout() {
  return (
    <NavigationProvider>
      <Slot />
    </NavigationProvider>
  );
}

