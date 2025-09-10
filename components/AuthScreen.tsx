import { useAuth } from "@/contexts/AuthContext";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function AuthScreen() {
  const { user, signIn, signUp, signOut, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const { error } = isSignUp
        ? await signUp({ email, password })
        : await signIn({ email, password });

      if (error) {
        Alert.alert("Error", error.message || "Authentication failed");
      } else {
        Alert.alert(
          "Success",
          isSignUp ? "Account created successfully!" : "Signed in successfully!"
        );
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      console.error("Auth error:", err);
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      Alert.alert("Error", error.message || "Sign out failed");
    }
  };

  if (user) {
    return (
      <View className="flex-1 justify-center px-6 bg-green-50">
        <View className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-green-200">
          <Text className="text-4xl font-bold text-center text-green-800 mb-2">
            Welcome Back! 🌾
          </Text>
          <Text className="text-lg text-center text-green-700 mb-8">
            {user.email}
          </Text>
          <TouchableOpacity
            className="bg-red-500 py-4 px-6 rounded-2xl active:bg-red-600 shadow-lg"
            onPress={handleSignOut}
          >
            <Text className="text-white text-lg font-semibold text-center">
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center px-6 bg-green-50">
      <View className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-green-200">
        <Text className="text-4xl font-bold text-center text-green-800 mb-2">
          {isSignUp ? "Join Krishi Sakhi" : "Welcome Back"}
        </Text>
        <Text className="text-base text-center text-green-600 mb-8">
          {isSignUp ? "Create your farmer account 🌱" : "Sign in to your account 🚜"}
        </Text>

        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-green-700 mb-2">
              📧 Email
            </Text>
            <TextInput
              className="border-2 border-green-300 px-4 py-4 rounded-2xl text-base bg-green-50 focus:border-green-500 focus:bg-white shadow-sm"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-green-700 mb-2">
              🔒 Password
            </Text>
            <TextInput
              className="border-2 border-green-300 px-4 py-4 rounded-2xl text-base bg-green-50 focus:border-green-500 focus:bg-white shadow-sm"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>
        </View>

        <TouchableOpacity
          className={`mt-8 py-4 px-6 rounded-2xl shadow-lg ${
            loading ? "bg-gray-400" : "bg-green-500 active:bg-green-600"
          }`}
          onPress={handleAuth}
          disabled={loading}
        >
          <Text className="text-white text-lg font-semibold text-center">
            {loading ? "Loading..." : isSignUp ? "🌱 Create Account" : "🚜 Sign In"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-6 py-2"
          onPress={() => setIsSignUp(!isSignUp)}
        >
          <Text className="text-green-600 text-center text-base font-medium">
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
