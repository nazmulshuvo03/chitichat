// @refresh reset
import { StatusBar } from "expo-status-bar";
import React from "react";
import { GiftedChat } from "react-native-gifted-chat";
import {
    StyleSheet,
    Text,
    TextInput,
    Button,
    View,
    YellowBox,
} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import * as firebase from "firebase";
import "firebase/firestore";

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDxh7_mGD9cO3iNIG-95pvZkI-XHKyLH-8",
    authDomain: "chitichat-70b27.firebaseapp.com",
    databaseURL: "https://chitichat-70b27.firebaseio.com",
    projectId: "chitichat-70b27",
    storageBucket: "chitichat-70b27.appspot.com",
    messagingSenderId: "371173057690",
    appId: "1:371173057690:web:86b768d7b2394af9576b23",
};
// Initialize Firebase
if (firebase.apps.length === 0) firebase.initializeApp(firebaseConfig);

YellowBox.ignoreWarnings(["Setting a timer for a long period of time"]);

const db = firebase.firestore();
const chatsRef = db.collection("chats");

export default function App() {
    const [user, setUser] = React.useState(null);
    const [name, setName] = React.useState("");
    const [messages, setMessages] = React.useState([]);

    React.useEffect(() => {
        readUser();

        const unsubscribe = chatsRef.onSnapshot((querySnapshot) => {
            const messagesFirestore = querySnapshot
                .docChanges()
                .filter(({ type }) => type === "added")
                .map(({ doc }) => {
                    const message = doc.data();
                    return {
                        ...message,
                        createdAt: message.createdAt.toDate(),
                    };
                })
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            appendMessages(messagesFirestore);
        });

        return () => unsubscribe();
    }, []);

    const appendMessages = React.useCallback(
        (messages) => {
            setMessages((previousMessages) =>
                GiftedChat.append(previousMessages, messages)
            );
        },
        [messages]
    );

    async function readUser() {
        const user = await AsyncStorage.getItem("user");
        if (user) {
            setUser(JSON.parse(user));
        }
    }

    async function handlePress() {
        const _id = Math.random().toString(36).substring(7);
        const user = { _id, name };
        await AsyncStorage.setItem("user", JSON.stringify(user));
        setUser(user);
    }

    async function handleSend(messages) {
        const writes = messages.map((m) => chatsRef.add(m));
        await Promise.all(writes);
    }

    if (!user) {
        return (
            <View style={styles.container}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    value={name}
                    onChangeText={setName}
                />
                <Button onPress={handlePress} title="Enter the chat" />
            </View>
        );
    }

    return <GiftedChat messages={messages} user={user} onSend={handleSend} />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        padding: 30,
    },
    input: {
        height: 50,
        width: "100%",
        borderWidth: 1,
        padding: 15,
        marginBottom: 20,
        borderColor: "gray",
    },
});
