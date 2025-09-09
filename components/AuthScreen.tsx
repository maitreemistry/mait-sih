import { useAuth } from "@/contexts/AuthContext";
import { formatAuthError } from "@/utils/errors";
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
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        Alert.alert("Error", formatAuthError(error) || "Authentication failed");
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
      Alert.alert("Error", formatAuthError(error) || "Sign out failed");
    }
  };

  if (user) {
    return (
      <View className="flex-1 justify-center px-6 bg-neutral-50">
        <View className="bg-white rounded-2xl p-8 shadow-card">
          <Text className="text-3xl font-bold text-center text-neutral-900 mb-2">
            Welcome! 🌱
          </Text>
          <Text className="text-lg text-center text-neutral-600 mb-8">
            {user.email}
          </Text>
          <TouchableOpacity
            className="bg-error-500 py-4 px-6 rounded-xl active:bg-error-600"
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
    <View className="flex-1 justify-center px-6 bg-primary-50">
      <View className="bg-white rounded-2xl p-8 shadow-card">
        <Text className="text-3xl font-bold text-center text-neutral-900 mb-2">
          {isSignUp ? "Join Krishi Sakhi" : "Welcome Back"}
        </Text>
        <Text className="text-base text-center text-neutral-600 mb-8">
          {isSignUp ? "Create your farmer account" : "Sign in to your account"}
        </Text>

        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-neutral-700 mb-2">
              Email
            </Text>
            <TextInput
              className="border border-neutral-300 px-4 py-3 rounded-lg text-base bg-neutral-50 focus:border-primary-500 focus:bg-white"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-neutral-700 mb-2">
              Password
            </Text>
            <TextInput
              className="border border-neutral-300 px-4 py-3 rounded-lg text-base bg-neutral-50 focus:border-primary-500 focus:bg-white"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>
        </View>

        <TouchableOpacity
          className={`mt-6 py-4 px-6 rounded-xl ${
            loading ? "bg-neutral-300" : "bg-primary-500 active:bg-primary-600"
          }`}
          onPress={handleAuth}
          disabled={loading}
        >
          <Text className="text-white text-lg font-semibold text-center">
            {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-6 py-2"
          onPress={() => setIsSignUp(!isSignUp)}
        >
          <Text className="text-primary-600 text-center text-base">
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
