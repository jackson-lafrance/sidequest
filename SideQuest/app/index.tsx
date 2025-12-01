import React from "react";
import { useNavigation } from "../core/useNavigation";
import BottomTabBar from "../components/navigation/bottomTabBar";
import { View, StyleSheet } from "react-native";

export default function Index() {
  const { route, setRoute, getRouteComponent } = useNavigation();
  
  const mainTabs = [
    { icon: "home" as const, route: "home" as const },
    { icon: "person" as const, route: "profile" as const },
    { icon: "create" as const, route: "createQuest" as const },
    { icon: "document" as const, route: "questDetails" as const },
    { icon: "settings" as const, route: "settings" as const },
  ];

  return (
    <View style={styles.container}>
      {getRouteComponent(route)}
      <View style={styles.bottomTabBar}> 
        <BottomTabBar tabs={mainTabs} setRoute={setRoute} route={route} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 20,
    marginTop: 80,
  },
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
