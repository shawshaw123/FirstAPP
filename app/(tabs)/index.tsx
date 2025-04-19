import { StyleSheet, Text, View } from "react-native";

export default function TabOneScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Tab One</Text>
            <View style={styles.separator} />
            <Text style={styles.text}>
                This is an example tab. You can edit it in app/%28tabs%29/index.tsx.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000000",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    text: {
        color: "#FFFFFF",
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: "80%",
        backgroundColor: "#333333",
    },
});