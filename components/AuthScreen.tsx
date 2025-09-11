import { useAuth } from "@/hooks/useAuth";
import type { FarmerRegistrationData } from "@/types/auth.types";
import * as LocalAuthentication from 'expo-local-authentication';
import React, { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function AuthScreen() {
  const { user, login, logout, registerFarmer, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showFarmerForm, setShowFarmerForm] = useState(false);

  // Farmer registration form state
  const [farmerData, setFarmerData] = useState<FarmerRegistrationData>({
    aadhaarNumber: "",
    name: "",
    phoneNumber: "",
    email: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India"
    },
    landDetails: [],
    bankDetails: {
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      accountHolderName: ""
    }
  });

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const response = await login({ email, password });
      if (response.success) {
        Alert.alert("Success", "Signed in successfully!");
        setEmail("");
        setPassword("");
      } else {
        Alert.alert("Error", response.message || "Authentication failed");
      }
    } catch (err) {
      console.error("Auth error:", err);
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert("Error", "Biometric authentication not available");
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login to AgriChain Odisha',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        // For demo purposes, use stored credentials or show success
        Alert.alert("Success", "Biometric authentication successful!");
      } else {
        Alert.alert("Error", "Biometric authentication failed");
      }
    } catch (err) {
      Alert.alert("Error", "Biometric authentication error");
    }
  };

  const handleFarmerRegistration = async () => {
    if (!farmerData.aadhaarNumber || !farmerData.name || !farmerData.phoneNumber) {
      Alert.alert("Error", "Please fill in required fields");
      return;
    }

    try {
      const response = await registerFarmer(farmerData);
      if (response.success) {
        Alert.alert("Success", "Farmer registration successful!");
        setShowFarmerForm(false);
      } else {
        Alert.alert("Error", response.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  const handleSignOut = async () => {
    await logout();
  };

  if (user) {
    return (
      <View className="flex-1 justify-center px-6 bg-green-50">
        <View className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-green-200">
          <Text className="text-4xl font-bold text-center text-green-800 mb-2">
            Welcome Back! 🌾
          </Text>
          <Text className="text-lg text-center text-green-700 mb-4">
            Role: {user.role}
          </Text>
          <Text className="text-base text-center text-green-600 mb-8">
            {user.role === 'farmer' ? (user.profile as any)?.name :
             user.role === 'consumer' ? (user.profile as any)?.name :
             user.role === 'government' ? (user.profile as any)?.employeeId :
             user.role === 'distributor' || user.role === 'retailer' ? (user.profile as any)?.businessName :
             'User'}
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

  if (showFarmerForm) {
    return (
      <ScrollView className="flex-1 bg-green-50">
        <View className="p-6">
          <View className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-green-200">
            <Text className="text-3xl font-bold text-center text-green-800 mb-2">
              Farmer Registration 🌱
            </Text>
            <Text className="text-base text-center text-green-600 mb-8">
              Join AgriChain Odisha as a verified farmer
            </Text>

            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-green-700 mb-2">
                  🆔 Aadhaar Number *
                </Text>
                <TextInput
                  className="border-2 border-green-300 px-4 py-4 rounded-2xl text-base bg-green-50"
                  placeholder="Enter 12-digit Aadhaar number"
                  value={farmerData.aadhaarNumber}
                  onChangeText={(text) => setFarmerData({...farmerData, aadhaarNumber: text})}
                  keyboardType="numeric"
                  maxLength={12}
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-green-700 mb-2">
                  👤 Full Name *
                </Text>
                <TextInput
                  className="border-2 border-green-300 px-4 py-4 rounded-2xl text-base bg-green-50"
                  placeholder="Enter your full name"
                  value={farmerData.name}
                  onChangeText={(text) => setFarmerData({...farmerData, name: text})}
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-green-700 mb-2">
                  📱 Phone Number *
                </Text>
                <TextInput
                  className="border-2 border-green-300 px-4 py-4 rounded-2xl text-base bg-green-50"
                  placeholder="Enter phone number"
                  value={farmerData.phoneNumber}
                  onChangeText={(text) => setFarmerData({...farmerData, phoneNumber: text})}
                  keyboardType="phone-pad"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-green-700 mb-2">
                  📧 Email (Optional)
                </Text>
                <TextInput
                  className="border-2 border-green-300 px-4 py-4 rounded-2xl text-base bg-green-50"
                  placeholder="Enter email address"
                  value={farmerData.email}
                  onChangeText={(text) => setFarmerData({...farmerData, email: text})}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-green-700 mb-2">
                  🏠 Address
                </Text>
                <TextInput
                  className="border-2 border-green-300 px-4 py-4 rounded-2xl text-base bg-green-50 mb-2"
                  placeholder="Street address"
                  value={farmerData.address.street}
                  onChangeText={(text) => setFarmerData({
                    ...farmerData,
                    address: {...farmerData.address, street: text}
                  })}
                />
                <View className="flex-row space-x-2">
                  <TextInput
                    className="border-2 border-green-300 px-4 py-4 rounded-2xl text-base bg-green-50 flex-1"
                    placeholder="City"
                    value={farmerData.address.city}
                    onChangeText={(text) => setFarmerData({
                      ...farmerData,
                      address: {...farmerData.address, city: text}
                    })}
                  />
                  <TextInput
                    className="border-2 border-green-300 px-4 py-4 rounded-2xl text-base bg-green-50 flex-1"
                    placeholder="State"
                    value={farmerData.address.state}
                    onChangeText={(text) => setFarmerData({
                      ...farmerData,
                      address: {...farmerData.address, state: text}
                    })}
                  />
                </View>
                <TextInput
                  className="border-2 border-green-300 px-4 py-4 rounded-2xl text-base bg-green-50 mt-2"
                  placeholder="PIN Code"
                  value={farmerData.address.pincode}
                  onChangeText={(text) => setFarmerData({
                    ...farmerData,
                    address: {...farmerData.address, pincode: text}
                  })}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View className="flex-row space-x-4 mt-8">
              <TouchableOpacity
                className="bg-gray-500 py-4 px-6 rounded-2xl shadow-lg flex-1"
                onPress={() => setShowFarmerForm(false)}
              >
                <Text className="text-white text-lg font-semibold text-center">
                  Back
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`py-4 px-6 rounded-2xl shadow-lg flex-1 ${
                  loading ? "bg-gray-400" : "bg-green-500 active:bg-green-600"
                }`}
                onPress={handleFarmerRegistration}
                disabled={loading}
              >
                <Text className="text-white text-lg font-semibold text-center">
                  {loading ? "Registering..." : "Register Farmer"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View className="flex-1 justify-center px-6 bg-green-50">
      <View className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-green-200">
        <Text className="text-4xl font-bold text-center text-green-800 mb-2">
          {isSignUp ? "Join Krishi Sakhi" : "Welcome Back"}
        </Text>
        <Text className="text-base text-center text-green-600 mb-8">
          {isSignUp ? "Create your account 🌱" : "Sign in to your account 🚜"}
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
          className="mt-4 py-4 px-6 rounded-2xl shadow-lg bg-blue-500 active:bg-blue-600"
          onPress={handleBiometricLogin}
        >
          <Text className="text-white text-lg font-semibold text-center">
            🔐 Biometric Login
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-4 py-4 px-6 rounded-2xl shadow-lg bg-orange-500 active:bg-orange-600"
          onPress={() => setShowFarmerForm(true)}
        >
          <Text className="text-white text-lg font-semibold text-center">
            🌾 Register as Farmer
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

        {error && (
          <Text className="text-red-500 text-center text-sm mt-4">
            {error}
          </Text>
        )}
      </View>
    </View>
  );
}
