import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { MockAIQualityService, QualityAssessmentResult } from '../../services/ai/quality-assessment';
import { QRCodeData, QRCodeService } from '../../services/qr-code.service';
import { ThemedText } from '../ThemedText';

export const QualityAssessmentScreen: React.FC = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [cropType, setCropType] = useState<string>('rice');
  const [assessmentResult, setAssessmentResult] = useState<QualityAssessmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<QRCodeData | null>(null);
  const [generatingQR, setGeneratingQR] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const qualityService = new MockAIQualityService();

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Camera permission is required for quality assessment',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const captureImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setAssessmentResult(null); // Clear previous results
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Gallery permission is required to select images',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setAssessmentResult(null); // Clear previous results
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const assessQuality = async () => {
    if (!imageUri) {
      Alert.alert('Error', 'Please capture or select an image first');
      return;
    }

    setLoading(true);
    try {
      const result = await qualityService.assessQualityDemo(imageUri, cropType);
      setAssessmentResult(result);

      // After quality assessment, generate QR code for the batch using QRCodeService
      setGeneratingQR(true);
      try {
        const qrCodeService = new QRCodeService();

        // Prepare actual data for QR code generation
        const qrRequest = {
          productId: `prod_${Date.now()}`, // Generate unique product id
          farmerId: 'farmer123', // TODO: Replace with actual farmer id from auth context or profile
          batchId: `batch_${Date.now()}`, // Generate unique batch id
          productData: {
            name: 'Sample Product', // TODO: Replace with actual product name
            cropType: cropType,
            harvestDate: new Date().toISOString(),
            qualityGrade: result.grade,
            farmLocation: { latitude: 0, longitude: 0 }, // TODO: Replace with actual farm location
            certifications: []
          }
        };

        // Register product on blockchain and generate QR code
        const generatedQRCode = await qrCodeService.generateQRCode(qrRequest);
        setQrCodeData(generatedQRCode);
      } catch (qrError) {
        Alert.alert('Error', 'Failed to generate QR code for the batch');
      } finally {
        setGeneratingQR(false);
      }

      Toast.show({
        type: 'success',
        text1: 'Quality Assessment Complete',
        text2: `Grade: ${result.grade} (${result.qualityScore}%)`
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Assessment Failed',
        text2: 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'Premium': return colors.success;
      case 'Grade-A': return '#4CAF50';
      case 'Grade-B': return '#FF9800';
      case 'Grade-C': return colors.error;
      default: return colors.text;
    }
  };

  const renderQualityResult = () => {
    if (!assessmentResult) return null;

    return (
      <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={styles.resultTitle}>Quality Assessment Result</ThemedText>

        <View style={styles.gradeContainer}>
          <ThemedText style={styles.gradeLabel}>Grade:</ThemedText>
          <Text style={[styles.gradeValue, { color: getGradeColor(assessmentResult.grade) }]}>
            {assessmentResult.grade}
          </Text>
        </View>

        <View style={styles.scoreContainer}>
          <ThemedText style={styles.scoreLabel}>Quality Score:</ThemedText>
          <ThemedText style={styles.scoreValue}>{assessmentResult.qualityScore}%</ThemedText>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${assessmentResult.qualityScore}%`,
                  backgroundColor: getGradeColor(assessmentResult.grade)
                }
              ]}
            />
          </View>
        </View>

        <View style={styles.priceContainer}>
          <ThemedText style={styles.priceLabel}>Estimated Market Price:</ThemedText>
          <ThemedText style={styles.priceValue}>₹{assessmentResult.marketPrice}/quintal</ThemedText>
        </View>

        {assessmentResult.defects.length > 0 && (
          <View style={styles.defectsContainer}>
            <ThemedText style={styles.defectsTitle}>Detected Issues:</ThemedText>
            {assessmentResult.defects.map((defect, index) => (
              <ThemedText key={index} style={styles.defectItem}>• {defect}</ThemedText>
            ))}
          </View>
        )}

        <View style={styles.recommendationsContainer}>
          <ThemedText style={styles.recommendationsTitle}>Recommendations:</ThemedText>
          {assessmentResult.recommendations.map((rec, index) => (
            <ThemedText key={index} style={styles.recommendationItem}>• {rec}</ThemedText>
          ))}
        </View>

        <ThemedText style={styles.confidence}>
          Confidence: {Math.round(assessmentResult.confidence * 100)}%
        </ThemedText>
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>AI Quality Assessment</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Capture or select a crop image for instant quality analysis
        </ThemedText>
      </View>

      <View style={[styles.captureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={styles.cardTitle}>Select Crop Type</ThemedText>

        <View style={styles.cropTypeContainer}>
          {['rice', 'wheat', 'maize', 'pulses', 'vegetables'].map((crop) => (
            <TouchableOpacity
              key={crop}
              style={[
                styles.cropTypeButton,
                {
                  backgroundColor: cropType === crop ? colors.primary : colors.card,
                  borderColor: cropType === crop ? colors.primary : colors.border
                }
              ]}
              onPress={() => setCropType(crop)}
            >
              <ThemedText
                style={[
                  styles.cropTypeText,
                  { color: cropType === crop ? '#FFFFFF' : colors.text }
                ]}
              >
                {crop.charAt(0).toUpperCase() + crop.slice(1)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.capturedImage} />
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.imageButton, { backgroundColor: colors.secondary }]}
            onPress={captureImage}
          >
            <ThemedText style={styles.buttonText}>📷 Capture Image</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.imageButton, { backgroundColor: colors.accent }]}
            onPress={pickFromGallery}
          >
            <ThemedText style={styles.buttonText}>🖼️ Select from Gallery</ThemedText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.assessButton,
            {
              backgroundColor: imageUri ? colors.primary : colors.icon,
            }
          ]}
          onPress={assessQuality}
          disabled={!imageUri || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.assessButtonText}>
              🔍 Assess Quality
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>

      {renderQualityResult()}

      <Toast />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  captureCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  cropTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  cropTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    margin: 4,
  },
  cropTypeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  capturedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  imageButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  assessButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  assessButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  gradeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  gradeLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  gradeValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreContainer: {
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 16,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  defectsContainer: {
    marginBottom: 16,
  },
  defectsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  defectItem: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.8,
  },
  recommendationsContainer: {
    marginBottom: 16,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  recommendationItem: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.8,
  },
  confidence: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
});
