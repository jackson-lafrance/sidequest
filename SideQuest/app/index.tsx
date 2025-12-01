import { useNavigation, Route } from "../core/useNavigation";
import BottomTabBar from "../components/navigation/bottomTabBar";
import { View, StyleSheet } from "react-native";
import { routes } from "../core/routes";

export default function Index() {
  const { loggedIn, route } = useNavigation();
  const CurrentComponent = routes[route];
  
  const mainTabs = [
    { icon: "home" as const, route: Route.HOME },
    { icon: "person" as const, route: Route.PROFILE },
    { icon: "create" as const, route: Route.CREATE_QUEST },
    { icon: "document" as const, route: Route.QUEST_DETAILS },
    { icon: "settings" as const, route: Route.SETTINGS },
  ];

  return (
    <View style={styles.container}>
      {CurrentComponent && <CurrentComponent />}
      
      {loggedIn && (
        <View style={styles.bottomTabBar}> 
          <BottomTabBar tabs={mainTabs} />
        </View>
      )}
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
