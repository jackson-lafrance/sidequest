import React, { useEffect } from "react";
import { useNavigation } from "../core/useNavigation";
import BottomTabBar from "../components/navigation/bottomTabBar";
import { View, StyleSheet } from "react-native";
import useFirebase from "../core/useFirebase";

export default function Index() {
  const { route, setRoute, routes } = useNavigation();
  const { getCurrentUser } = useFirebase();
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      setRoute(routes.login);
    }
  }, [currentUser, setRoute, routes.login]);

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
