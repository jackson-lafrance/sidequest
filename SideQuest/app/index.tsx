import React from "react";
import { useNavigation } from "../core/useNavigation";
import BottomTabBar from "../components/navigation/bottomTabBar";
import { View, StyleSheet } from "react-native";

export default function Index() {
  const { route, routes, setRoute } = useNavigation();
  
  const mainTabs = [
    { icon: "home" as const, route: routes.home },
    { icon: "person" as const, route: routes.profile },
    { icon: "create" as const, route: routes.createQuest },
    { icon: "document" as const, route: routes.questDetails },
    { icon: "settings" as const, route: routes.settings },
  ];

  return (
    <View style={styles.container}>
      {route}
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
