import React, { useEffect, useState } from "react";
import { useNavigation, getRouteComponent } from "../core/useNavigation";
import BottomTabBar from "../components/navigation/bottomTabBar";
import { View, StyleSheet } from "react-native";
import useFirebase from "../core/useFirebase";
import { User } from "firebase/auth";

export default function Index() {
  const { route, setRoute, routes } = useNavigation();
  const { onAuthChange } = useFirebase();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, [onAuthChange]);

  useEffect(() => {
    if (!currentUser && route !== routes.login) {
      setRoute(routes.login);
    }
  }, [currentUser, setRoute, routes.login, route]);

  const mainTabs = [
    { icon: "home" as const, route: routes.home },
    { icon: "person" as const, route: routes.profile },
    { icon: "create" as const, route: routes.createQuest },
    { icon: "document" as const, route: routes.questDetails },
    { icon: "settings" as const, route: routes.settings },
  ];

  return (
    <View style={styles.container}>
      {getRouteComponent(route)}
      {currentUser && (
      <View style={styles.bottomTabBar}> 
        <BottomTabBar tabs={mainTabs} setRoute={setRoute} route={route} />
      </View>)}
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
