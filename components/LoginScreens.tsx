import { FontAwesome, Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [regUser, setRegUser] = useState("");
  const [regPass, setRegPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [btnScale] = useState(new Animated.Value(1));
  const [inputFocus, setInputFocus] = useState('');

  // Fungsi login
  const handleLogin = async () => {
    try {
      const res = await fetch("https://klark-dev.up.railway.app/api/instance/h3fh50m/api/users");
      const data = await res.json();

      const found = data.find(
        (u: any) => u.username === username && u.password === password
      );

      if (found) {
        Alert.alert("✅ Login Berhasil");
        await AsyncStorage.setItem("username", username);
        await AsyncStorage.setItem("password", password);
        navigation.navigate("MainTabs");
      } else {
        Alert.alert("❌ Username atau password salah");
      }
    } catch (err) {
      Alert.alert("⚠️ Error", String(err));
    }
  };

  // Fungsi registrasi
  const handleRegister = async () => {
    try {
      const res = await fetch("https://klark-dev.up.railway.app/api/instance/h3fh50m/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: regUser, password: regPass }),
      });
      const result = await res.json();
      console.log(result);
      Alert.alert("✅ Pendaftaran berhasil");
      setModalVisible(false);
      setRegUser("");
      setRegPass("");
    } catch (err) {
      Alert.alert("⚠️ Error", String(err));
    }
  };

  // Fungsi untuk animasi pada tombol
  const handlePressIn = () => {
    Animated.spring(btnScale, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                style={styles.logoBackground}
              >
                <Ionicons name="map" size={40} color="#667eea" />
              </LinearGradient>
            </View>

            <Text style={styles.welcomeTitle}>Selamat Datang</Text>
            <Text style={styles.welcomeSubtitle}>Sistem Pelaporan Jalan Raya</Text>
          </View>

          {/* Image Section - DIPERKECIL DAN TANPA BOX */}
          <View style={styles.imageContainer}>
            <Image
              source={require('../assets/images/land-survey-civil-engineer-working.png')}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          {/* Login Card */}
          <View style={styles.cardContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.9)']}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Masuk ke Akun</Text>
                <Text style={styles.cardSubtitle}>
                  Aplikasi Pelaporan Kerusakan Jalan Raya Kota Binjai Berbasis SIG dan Fuzzy Logic
                </Text>
              </View>

              <View style={styles.formContainer}>
                {/* Username Input */}
                <View style={styles.inputContainer}>
                  <View style={[
                    styles.inputWrapper,
                    inputFocus === 'username' && styles.inputWrapperFocused
                  ]}>
                    <Ionicons name="person" size={20} color="#667eea" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Email atau Username"
                      placeholderTextColor="#999"
                      value={username}
                      onChangeText={setUsername}
                      onFocus={() => setInputFocus('username')}
                      onBlur={() => setInputFocus('')}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <View style={[
                    styles.inputWrapper,
                    inputFocus === 'password' && styles.inputWrapperFocused
                  ]}>
                    <Ionicons name="lock-closed" size={20} color="#667eea" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInput, { flex: 1 }]}
                      placeholder="Password"
                      placeholderTextColor="#999"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setInputFocus('password')}
                      onBlur={() => setInputFocus('')}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      <FontAwesome
                        name={showPassword ? "eye" : "eye-slash"}
                        size={18}
                        color="#667eea"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Forgot Password */}
                <TouchableOpacity onPress={() => Alert.alert("Lupa Password", "Fitur akan segera hadir")}>
                  <Text style={styles.forgotPassword}>Lupa Password?</Text>
                </TouchableOpacity>

                {/* Login Button */}
                <Animated.View style={[styles.buttonContainer, { transform: [{ scale: btnScale }] }]}>
                  <TouchableOpacity
                    onPress={handleLogin}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                  >
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      style={styles.loginButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons name="log-in" size={20} color="#fff" />
                      <Text style={styles.loginButtonText}>Masuk</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>atau</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Register Link */}
                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={() => setModalVisible(true)}
                >
                  <Text style={styles.registerButtonText}>Belum punya akun? </Text>
                  <Text style={styles.registerButtonTextBold}>Daftar Sekarang</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Enhanced Modal Register */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboard}
          >
            <View style={styles.modalContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.98)', 'rgba(255,255,255,0.95)']}
                style={styles.modalCard}
              >
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color="#667eea" />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Buat Akun Baru</Text>
                  <Text style={styles.modalSubtitle}>Bergabunglah dengan sistem pelaporan</Text>
                </View>

                {/* Modal Form */}
                <View style={styles.modalForm}>
                  <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="person-add" size={20} color="#667eea" style={styles.inputIcon} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Username"
                        placeholderTextColor="#999"
                        value={regUser}
                        onChangeText={setRegUser}
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="lock-closed" size={20} color="#667eea" style={styles.inputIcon} />
                      <TextInput
                        style={[styles.textInput, { flex: 1 }]}
                        placeholder="Password"
                        placeholderTextColor="#999"
                        secureTextEntry={!showRegPassword}
                        value={regPass}
                        onChangeText={setRegPass}
                      />
                      <TouchableOpacity
                        onPress={() => setShowRegPassword(!showRegPassword)}
                        style={styles.eyeButton}
                      >
                        <FontAwesome
                          name={showRegPassword ? "eye" : "eye-slash"}
                          size={18}
                          color="#667eea"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity onPress={handleRegister}>
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      style={styles.modalButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons name="person-add" size={20} color="#fff" />
                      <Text style={styles.modalButtonText}>Daftar</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: 40,
    marginBottom: 20,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  // IMAGE SECTION - DIPERKECIL DAN TANPA BOX
  imageContainer: {
    alignItems: 'center',
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  image: {
    width: width * 0.5, // 50% lebar layar (diperkecil dari 90%)
    height: 160, // Tinggi diperkecil dari 320
  },
  cardContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: 'rgba(102, 126, 234, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputWrapperFocused: {
    borderColor: '#667eea',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#2d3748',
    paddingVertical: 16,
    fontWeight: '500',
  },
  eyeButton: {
    padding: 4,
  },
  forgotPassword: {
    color: '#667eea',
    textAlign: 'right',
    marginBottom: 24,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(102, 126, 234, 0.3)',
  },
  dividerText: {
    color: '#718096',
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  registerButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(102, 126, 234, 0.2)',
  },
  registerButtonText: {
    color: '#718096',
    fontSize: 14,
    fontWeight: '500',
  },
  registerButtonTextBold: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '700',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
  },
  modalKeyboard: {
    flex: 1,
    justifyContent: 'center',
  },
  modalContainer: {
    paddingHorizontal: 20,
  },
  modalCard: {
    borderRadius: 24,
    paddingVertical: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  modalHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    right: 24,
    top: -8,
    padding: 8,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
  modalForm: {
    paddingHorizontal: 24,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
});