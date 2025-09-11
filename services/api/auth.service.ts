import * as LocalAuthentication from 'expo-local-authentication';
import { supabase } from '../../lib/supabase/client';
import type {
  AuthResponse,
  FarmerRegistrationData,
  LandDetails,
  LoginCredentials,
  User
} from '../../types/auth.types';

// Export types for use in other files
export type { AuthResponse, FarmerRegistrationData, LoginCredentials };

export class AuthService {
  async registerFarmer(data: FarmerRegistrationData): Promise<AuthResponse> {
    try {
      // Aadhaar verification integration
      const aadhaarVerification = await this.verifyAadhaar(data.aadhaarNumber);
      if (!aadhaarVerification.isValid) {
        throw new Error('Invalid Aadhaar number');
      }

      // Land record verification
      const landVerification = await this.verifyLandRecords(data.landDetails);
      if (!landVerification.isValid) {
        throw new Error('Land records verification failed');
      }

      // Create user account with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email || `${data.aadhaarNumber}@temp.com`,
        password: this.generateTempPassword(),
        options: {
          data: {
            name: data.name,
            phone: data.phoneNumber,
            aadhaar: data.aadhaarNumber,
            role: 'farmer',
            address: data.address,
            land_records: data.landDetails,
            bank_details: data.bankDetails,
            aadhaar_verified: aadhaarVerification.isValid,
            land_verified: landVerification.isValid
          }
        }
      });

      if (authError) {
        throw new Error(`Registration failed: ${authError.message}`);
      }

      // Store additional profile data
      if (authData.user) {
        await this.createFarmerProfile(authData.user.id, data);
      }

      return {
        success: true,
        user: this.mapSupabaseUserToUser(authData.user),
        token: authData.session?.access_token,
        message: 'Farmer registration successful'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        throw new Error(`Login failed: ${error.message}`);
      }

      return {
        success: true,
        user: this.mapSupabaseUserToUser(data.user),
        token: data.session?.access_token,
        message: 'Login successful'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  async loginWithBiometric(): Promise<AuthResponse> {
    try {
      const biometricResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login to AgriChain Odisha',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (!biometricResult.success) {
        throw new Error('Biometric authentication failed');
      }

      // Get stored credentials (this would need secure storage implementation)
      const storedCredentials = await this.getStoredCredentials();
      if (!storedCredentials) {
        throw new Error('No stored credentials found');
      }

      return this.authenticateWithCredentials(storedCredentials);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Biometric login failed'
      };
    }
  }

  private async verifyAadhaar(aadhaarNumber: string): Promise<{ isValid: boolean }> {
    // Integration with UIDAI API or mock verification
    // For demo purposes, return mock verification
    const isValid = aadhaarNumber.length === 12 && /^\d+$/.test(aadhaarNumber);
    return { isValid };
  }

  private async verifyLandRecords(landDetails: LandDetails[]): Promise<{ isValid: boolean }> {
    // Integration with land records API
    // For demo purposes, return mock verification
    return { isValid: landDetails.length > 0 };
  }

  private generateTempPassword(): string {
    // Generate a temporary password for initial registration
    return Math.random().toString(36).slice(-12) + 'Temp@123';
  }

  private async createFarmerProfile(userId: string, data: FarmerRegistrationData): Promise<void> {
    // TODO: Implement farmer profile creation in Supabase
    // For now, profile data is stored in user metadata
    console.log('Farmer profile data:', { userId, data });
  }

  private async getStoredCredentials(): Promise<LoginCredentials | null> {
    // This would use SecureStore to retrieve stored credentials
    // For now, return null as implementation depends on secure storage setup
    return null;
  }

  private async authenticateWithCredentials(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.login(credentials);
  }

  private mapSupabaseUserToUser(supabaseUser: any): User | undefined {
    if (!supabaseUser) return undefined;

    return {
      id: supabaseUser.id,
      role: supabaseUser.user_metadata?.role || 'consumer',
      profile: supabaseUser.user_metadata?.profile || {},
      permissions: supabaseUser.user_metadata?.permissions || [],
      isVerified: supabaseUser.email_confirmed_at ? true : false,
      lastLogin: new Date()
    };
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return this.mapSupabaseUserToUser(user) || null;
  }
}

// Export singleton instance
export const authService = new AuthService();
