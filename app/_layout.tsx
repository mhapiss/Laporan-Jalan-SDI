import { Feather } from "@expo/vector-icons";
import {
  BottomTabNavigationEventMap,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import {
  NavigationHelpers,
  ParamListBase,
  TabNavigationState,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SurveyDetailScreen from "@/components/SurveyDetailScreen";
import SurveyMapScreen from "@/components/SurveyMapScreen";
import AdminScreens from "../components/AdminScreens";
import HomeScreen from "../components/HomeScreen";
import LaporScreen from "../components/LaporScreens";
import LoginScreen from "../components/LoginScreens";
import Profile from "../components/profile";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<ParamListBase>();
const { width } = Dimensions.get("window");

type CustomTabBarProps = {
  state: TabNavigationState<ParamListBase>;
  descriptors: { [key: string]: { options: any } };
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
};

const CustomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.navBarContainer, { paddingBottom: insets.bottom }]}>
      <View style={styles.navBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const getIconName = () => {
            switch (route.name) {
              case "Home":
                return "home";
              case "Data":
                return "file-text";
              case "Lapor":
                return "plus";
              case "Profile":
              case "Login":
                return "users";
              case "History":
                return "map";
              default:
                return "circle";
            }
          };

          if (route.name === "Lapor") {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.laporButtonWrapper}
              >
                <View style={styles.laporButton}>
                  <Feather name="plus" size={32} color="white" />
                </View>
                <Text style={styles.laporLabel}>Lapor</Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabButton}
              onPress={onPress}
            >
              <Feather
                name={getIconName() as keyof typeof Feather.glyphMap}
                size={22}
                color={isFocused ? "#fff" : "#ddd"}
              />
              <Text style={[styles.tabLabel, { color: isFocused ? "#fff" : "#ddd" }]}>
                {route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Data" component={AdminScreens} />
      <Tab.Screen name="Lapor" component={LaporScreen} />
      <Tab.Screen name="Profile" component={Profile} />
      <Tab.Screen name="History" component={SurveyMapScreen} />
    </Tab.Navigator>
  );
};

const Layout: React.FC = () => (
  <Stack.Navigator
    screenOptions={{ headerShown: false }}
    initialRouteName="Login"
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="SurveyDetail" component={SurveyDetailScreen} />
    <Stack.Screen name="SurveyMap" component={SurveyMapScreen} />
    <Stack.Screen name="MainTabs" component={TabNavigator} />
  </Stack.Navigator>
);

const styles = StyleSheet.create({
  navBarContainer: {
    backgroundColor: "#2F2DBB",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "visible",
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 65,
    paddingTop: 8,
    paddingBottom: 8,
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: "bold",
  },
  laporButtonWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -50,
    flex: 1,
    zIndex: 1000,
  },
  laporButton: {
    width: 60,
    height: 60,
    borderRadius: 35,
    backgroundColor: "#2704a7cc",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    borderWidth: 4,
    borderColor: "#fff",
  },
  laporLabel: {
    fontSize: 10,
    marginTop: 4,
    color: "white",
    fontWeight: "bold",
  },
});

export default Layout;