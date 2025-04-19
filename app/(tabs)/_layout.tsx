import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import { Pressable, View } from "react-native";
import { useTheme } from "@/components/theme-context";

function TabBarIcon(props: {
    name: React.ComponentProps<typeof FontAwesome>["name"];
    color: string;
}) {
    return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
    const { colors } = useTheme();

    return (
        <View style={{ flex: 1, backgroundColor: "#000000" }}>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: colors.primary,
                    tabBarStyle: { backgroundColor: "#000000" },
                    headerStyle: { backgroundColor: "#000000" },
                    headerTintColor: colors.text,
                    tabBarInactiveTintColor: colors.tabBarInactive,
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Tab One",
                        tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
                        headerRight: () => (
                            <Link href="/modal" asChild>
                                <Pressable>
                                    {({ pressed }) => (
                                        <FontAwesome
                                            name="info-circle"
                                            size={25}
                                            color={colors.text}
                                            style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                                        />
                                    )}
                                </Pressable>
                            </Link>
                        ),
                    }}
                />
            </Tabs>
        </View>
    );
}