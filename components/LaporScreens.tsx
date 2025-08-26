// File: /LaporScreens.tsx

import { Ionicons } from "@expo/vector-icons";
import Slider from '@react-native-community/slider';
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import React, { useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
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
  View,
} from "react-native";
import { WebView } from "react-native-webview";

interface FormData {
  namaJalan: string;
  Keterangan: string;
  lokasi: string;
  jenisJalan: string;
  staAwal: string;
  staAkhir: string;
  jenisRetakDominan: string;
  luasRetak: number;
  lebarRetak: number;
  jumlahLubang: number;
  alurRoda: number;
  volumeLHR: string;
  sumberData: string;
  // umur: string; // DIHAPUS: Umur Perkerasan
  jenisPerkerasan: string;
  foto: string[];
}

interface HasilPrioritas {
  Z: number;
  kategori: string;
  aksi: string;
}

interface Coordinate {
  latitude: number;
  longitude: number;
}

const { width, height } = Dimensions.get('window');

export default function LaporScreen() {
  const navigation = useNavigation();

  // State untuk form data
  const [formData, setFormData] = useState<FormData>({
    namaJalan: "",
    Keterangan: "",
    lokasi: "",
    jenisJalan: "",
    staAwal: "",
    staAkhir: "",
    jenisRetakDominan: "",
    luasRetak: 0,
    lebarRetak: 0,
    jumlahLubang: 0,
    alurRoda: 0,
    volumeLHR: "",
    sumberData: "",
    // umur: "", // DIHAPUS: Umur Perkerasan
    jenisPerkerasan: "",
    foto: [],
  });

  // State untuk modal maps
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [selectedCoordinate, setSelectedCoordinate] = useState<Coordinate | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Coordinate>({
    latitude: -2.5489, // Pusat Indonesia
    longitude: 118.0149,
  });
  const [mapRegion, setMapRegion] = useState({
    latitude: -2.5489,
    longitude: 118.0149,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function untuk update state
  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Function untuk mendapatkan lokasi saat ini - DIPERBAIKI: Hapus timeout
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Izin lokasi diperlukan untuk menggunakan fitur ini');
        return;
      }

      // PERBAIKAN: Hapus timeout, hanya gunakan accuracy dan maximumAge
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        maximumAge: 60000,
      });

      const coordinate = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCurrentLocation(coordinate);
      setMapRegion({
        ...coordinate,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      if (!selectedCoordinate) {
        setSelectedCoordinate(coordinate);
      }

    } catch (error) {
      console.error('Location error:', error);
      // PERBAIKAN: Proper error handling
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Gagal mendapatkan lokasi saat ini. ${errorMessage}. Pastikan GPS aktif dan coba lagi.`);
    }
  };

  // Function untuk membuka modal maps
  const openMapModal = () => {
    setIsMapModalVisible(true);
    getCurrentLocation();
  };

  // Function untuk konfirmasi pilihan lokasi
  const confirmLocation = () => {
    if (selectedCoordinate) {
      const locationString = `${selectedCoordinate.latitude.toFixed(6)}, ${selectedCoordinate.longitude.toFixed(6)}`;
      updateFormData('lokasi', locationString);
      setIsMapModalVisible(false);
    } else {
      Alert.alert('Error', 'Silakan pilih lokasi di peta terlebih dahulu');
    }
  };

  // Function untuk reset lokasi ke posisi saat ini
  const resetToCurrentLocation = () => {
    getCurrentLocation();
  };

  // Function untuk menambah foto - DIPERBAIKI error handling
  const addPhoto = async () => {
    try {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted') {
        Alert.alert('Permission Required', 'Aplikasi memerlukan izin kamera untuk mengambil foto');
        return;
      }
      
      if (mediaStatus !== 'granted') {
        Alert.alert('Permission Required', 'Aplikasi memerlukan izin galeri untuk memilih foto');
        return;
      }

      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['Batal', 'Ambil Foto', 'Pilih dari Galeri'],
            cancelButtonIndex: 0,
          },
          (buttonIndex) => {
            if (buttonIndex === 1) {
              openCamera();
            } else if (buttonIndex === 2) {
              openImageLibrary();
            }
          }
        );
      } else {
        Alert.alert(
          'Pilih Foto',
          'Pilih sumber foto',
          [
            { text: 'Batal', style: 'cancel' },
            { text: 'Ambil Foto', onPress: openCamera },
            { text: 'Pilih dari Galeri', onPress: openImageLibrary },
          ]
        );
      }
    } catch (error) {
      console.error('Error in addPhoto:', error);
      // PERBAIKAN: Proper error handling
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Gagal membuka kamera atau galeri: ${errorMessage}`);
    }
  };


// Perbaikan openCamera function - HAPUS allowsEditing
const openCamera = async () => {
  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // PERBAIKAN: Set false untuk skip crop
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const newPhoto = result.assets[0].uri;
      setFormData(prev => ({
        ...prev,
        foto: [...prev.foto, newPhoto]
      }));
      Alert.alert('Sukses', 'Foto berhasil ditambahkan');
    }
  } catch (error) {
    console.error('Camera error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    Alert.alert('Error', `Gagal mengambil foto dari kamera: ${errorMessage}`);
  }
};

// Perbaikan openImageLibrary function - HAPUS allowsEditing  
const openImageLibrary = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // PERBAIKAN: Set false untuk skip crop
      quality: 0.8,
      allowsMultipleSelection: false,
      base64: false,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const newPhoto = result.assets[0].uri;
      setFormData(prev => ({
        ...prev,
        foto: [...prev.foto, newPhoto]
      }));
      Alert.alert('Sukses', 'Foto berhasil ditambahkan');
    }
  } catch (error) {
    console.error('Gallery error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    Alert.alert('Error', `Gagal memilih foto dari galeri: ${errorMessage}`);
  }
};


  const removePhoto = (index: number) => {
    Alert.alert(
      'Hapus Foto',
      'Apakah Anda yakin ingin menghapus foto ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            setFormData(prev => ({
              ...prev,
              foto: prev.foto.filter((_, i) => i !== index)
            }));
          },
        },
      ]
    );
  };

  // Validasi form
  const validateForm = (): boolean => {
    const requiredFields = [
      "namaJalan",
      "Keterangan",
      "lokasi",
      "jenisJalan",
      "staAwal",
      "staAkhir",
      "jenisRetakDominan",
      "volumeLHR",
      "sumberData",
      // "umur", // DIHAPUS: Umur Perkerasan
      "jenisPerkerasan",
    ];

    for (const field of requiredFields) {
      const value = formData[field as keyof FormData];
      if (typeof value === "string") {
        if (!value.trim()) {
          Alert.alert("Error", `${field} harus diisi`);
          return false;
        }
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          Alert.alert("Error", `${field} harus diisi`);
          return false;
        }
      }
    }
    return true;
  };

  // Hitung prioritas dengan algoritma SDI
  const hitungPrioritas = (): HasilPrioritas => {
    let sdiTotal = 0;
    let sdi1 = 0;
    let sdi2 = 0;
    let sdi3 = 0;
    let sdi4 = 0;

    // 1. Perhitungan SDI1 (Persentase Luas Retak)
    if (formData.luasRetak === 0) {
      sdi1 = 0;
    } else if (formData.luasRetak < 10) {
      sdi1 = 5;
    } else if (formData.luasRetak >= 10 && formData.luasRetak <= 30) {
      sdi1 = 20;
    } else if (formData.luasRetak > 30) {
      sdi1 = 40;
    }
    sdiTotal = sdi1; // SDI1 adalah nilai awal SDI total

    // 2. Perhitungan SDI2 (Lebar Retak Rata-rata)
    // SDI2 = SDI1
    // Jika lebar retak rata-rata > 3mm, SDI yang didapat dari pengamatan % luas retak dikali 2.
    if (formData.lebarRetak > 3) {
      sdi2 = sdi1 * 2;
    } else {
      sdi2 = sdi1; // Jika tidak, SDI2 sama dengan SDI1
    }
    sdiTotal = sdi2; // SDI total diperbarui dengan SDI2

    // 3. Perhitungan SDI3 (Jumlah Lubang per Kilometer)
    // SDI3 = SDI2
    // Jika jumlah lubang > 50/km, nilai ditambah 225.
    // Jika jumlah lubang 10-50/km, nilai ditambah 75.
    // Jika jumlah lubang < 10/km, nilai ditambah 15.
    if (formData.jumlahLubang > 50) {
      sdi3 = sdi2 + 225;
    } else if (formData.jumlahLubang >= 10 && formData.jumlahLubang <= 50) {
      sdi3 = sdi2 + 75;
    } else if (formData.jumlahLubang > 0 && formData.jumlahLubang < 10) {
      sdi3 = sdi2 + 15;
    } else {
      sdi3 = sdi2; // Jika tidak ada lubang, SDI3 sama dengan SDI2
    }
    sdiTotal = sdi3; // SDI total diperbarui dengan SDI3

    // 4. Perhitungan SDI4 (Kedalaman Bekas Roda Rata-rata)
    // SDI4 = SDI3
    // Jika bekas roda > 3 cm, nilai SDI ditambah 20.
    // Jika bekas roda 1-3 cm, nilai SDI ditambah 10.
    // Jika bekas roda < 1 cm, nilai SDI ditambah 2.5.
    if (formData.alurRoda > 3) {
      sdi4 = sdi3 + 20;
    } else if (formData.alurRoda >= 1 && formData.alurRoda <= 3) {
      sdi4 = sdi3 + 10;
    } else if (formData.alurRoda > 0 && formData.alurRoda < 1) {
      sdi4 = sdi3 + 2.5;
    } else {
      sdi4 = sdi3; // Jika tidak ada bekas roda, SDI4 sama dengan SDI3
    }
    sdiTotal = sdi4; // SDI total diperbarui dengan SDI4

    let kategori: string;
    let aksi: string;

    // Kategori dan Tindakan Pemeliharaan berdasarkan Tabel 2
    if (sdiTotal < 50) {
      kategori = "Baik (Good)";
      aksi = "Pemeliharaan rutin; pembersihan, penutupan retak kecil, pemeriksaan berkala.";
    } else if (sdiTotal >= 50 && sdiTotal < 100) {
      kategori = "Sedang (Fair)";
      aksi = "Pemeliharaan rutin intensif dan pemeliharaan berkala; penutupan retak, pengisian lubang kecil, overlay tipis.";
    } else if (sdiTotal >= 100 && sdiTotal < 150) {
      kategori = "Rusak Ringan (Poor)";
      aksi = "Perbaikan terfokus; penambalan lubang/lapis tambal, perbaikan struktural ringan, overlay atau perkerasan ulang sebagian.";
    } else { // sdiTotal >= 150
      kategori = "Rusak Berat (Bad)";
      aksi = "Rehabilitasi mayor atau rekonstruksi; penggantian lapisan permukaan/struktural secara menyeluruh untuk memulihkan kondisi jalan.";
    }

    return { Z: sdiTotal, kategori, aksi };
  };

  const saveToAPI = async (hasilPrioritas: HasilPrioritas) => {
    try {
      setIsSubmitting(true);
      const dataToSend = {
        ...formData,
        prioritas: hasilPrioritas.Z,
        kategori: hasilPrioritas.kategori,
        aksi: hasilPrioritas.aksi,
        tanggal: new Date().toISOString(),
        status: "pending"
      };

      console.log('Mengirim data:', dataToSend);

      const response = await fetch('https://klark-dev.up.railway.app/api/instance/h3fh50m/api/laporan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('Response lengkap dari server:', result);
      return result;
    } catch (error) {
      console.error('Error menyimpan data:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // PERBAIKAN: Navigation error handling
  const handleSubmit = async () => {
    if (!validateForm()) return;

    const hasil = hitungPrioritas();

    try {
      const result = await saveToAPI(hasil);
      console.log('Data lengkap yang disimpan:', result.saved);

      Alert.alert(
        "Laporan Berhasil Dikirim!",
        `Nilai SDI: ${hasil.Z.toFixed(2)}\nKategori: ${hasil.kategori}\nAksi: ${hasil.aksi}`,
        [
          {
            text: "OK",
            onPress: () => {
              try {
                // PERBAIKAN: Gunakan navigation.goBack() sebagai default
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  // Reset form sebagai alternatif
                  setFormData({
                    namaJalan: "",
                    Keterangan: "",
                    lokasi: "",
                    jenisJalan: "",
                    staAwal: "",
                    staAkhir: "",
                    jenisRetakDominan: "",
                    luasRetak: 0,
                    lebarRetak: 0,
                    jumlahLubang: 0,
                    alurRoda: 0,
                    volumeLHR: "",
                    sumberData: "",
                    // umur: "", // DIHAPUS: Umur Perkerasan
                    jenisPerkerasan: "",
                    foto: [],
                  });
                }
              } catch (error) {
                console.log("Navigation error:", error);
                // Fallback: reset form
                setFormData({
                  namaJalan: "",
                  Keterangan: "",
                  lokasi: "",
                  jenisJalan: "",
                  staAwal: "",
                  staAkhir: "",
                  jenisRetakDominan: "",
                  luasRetak: 0,
                  lebarRetak: 0,
                  jumlahLubang: 0,
                  alurRoda: 0,
                  volumeLHR: "",
                  sumberData: "",
                  // umur: "", // DIHAPUS: Umur Perkerasan
                  jenisPerkerasan: "",
                  foto: [],
                });
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert("Error", "Gagal mengirim laporan. Silakan coba lagi.");
    }
  };

  const handleDraft = async () => {
    try {
      const draftData = {
        ...formData,
        status: "draft",
        tanggal: new Date().toISOString(),
      };

      const response = await fetch('https://klark-dev.up.railway.app/api/instance/h3fh50m/api/laporan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draftData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Draft berhasil disimpan:', result);
      Alert.alert("Draft Tersimpan", "Data telah disimpan sebagai draft");
    } catch (error) {
      console.error('Error menyimpan draft:', error);
      Alert.alert("Error", "Gagal menyimpan draft. Silakan coba lagi.");
    }
  };

  // Handler untuk WebView message
  const handleWebViewMessage = (event: any) => {
    const message = event.nativeEvent.data;
    
    if (message === 'cancel') {
      setIsMapModalVisible(false);
    } else if (message.startsWith('confirm:')) {
      const coords = message.replace('confirm:', '').split(',');
      if (coords.length === 2) {
        const latitude = parseFloat(coords[0]);
        const longitude = parseFloat(coords[1]);
        
        setSelectedCoordinate({ latitude, longitude });
        const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        updateFormData('lokasi', locationString);
        setIsMapModalVisible(false);
        
        Alert.alert('Sukses', 'Lokasi berhasil dipilih');
      }
    }
  };

// Ganti HTML mapHTML dengan versi yang tidak menggunakan browser geolocation
const mapHTML = `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Map Selector</title>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
          #map { height: 70vh; width: 100%; }
          #info { 
              position: fixed; 
              bottom: 120px; 
              left: 20px; 
              right: 20px; 
              background: white; 
              padding: 15px; 
              border-radius: 10px; 
              box-shadow: 0 2px 10px rgba(0,0,0,0.2);
              z-index: 1000;
          }
          #buttons { 
              position: fixed; 
              bottom: 20px; 
              left: 20px; 
              right: 20px; 
              display: flex; 
              gap: 10px;
              z-index: 1000;
          }
          button { 
              flex: 1; 
              padding: 15px; 
              border: none; 
              border-radius: 8px; 
              font-size: 16px; 
              font-weight: bold;
              cursor: pointer;
          }
          #cancelBtn { background: #f3f4f6; color: #374151; }
          #confirmBtn { background: #667eea; color: white; }
          #locationBtn { 
              position: absolute; 
              top: 10px; 
              right: 10px; 
              z-index: 1000;
              background: white;
              border: none;
              border-radius: 8px;
              padding: 10px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          }
      </style>
  </head>
  <body>
      <div id="map"></div>
      <button id="locationBtn">📍</button>
      <div id="info">
          <strong>Koordinat Terpilih</strong><br>
          <span id="coords">Ketuk pada peta untuk memilih lokasi</span>
      </div>
      <div id="buttons">
          <button id="cancelBtn">Batal</button>
          <button id="confirmBtn">Pilih Lokasi</button>
      </div>

      <script>
          let map;
          let marker;
          let selectedCoord = null;

          // Initialize map dengan koordinat dari React Native (tidak dari browser geolocation)
          function initMap() {
              map = L.map('map').setView([${currentLocation.latitude}, ${currentLocation.longitude}], 15);
              
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  attribution: '© OpenStreetMap contributors',
                  maxZoom: 19,
              }).addTo(map);

              // Add current location marker dari React Native location
              L.marker([${currentLocation.latitude}, ${currentLocation.longitude}])
                  .addTo(map)
                  .bindPopup('Lokasi Saat Ini')
                  .openPopup();

              // Map click handler
              map.on('click', function(e) {
                  const lat = e.latlng.lat;
                  const lng = e.latlng.lng;
                  
                  selectedCoord = { latitude: lat, longitude: lng };
                  
                  if (marker) {
                      map.removeLayer(marker);
                  }
                  
                  marker = L.marker([lat, lng]).addTo(map);
                  document.getElementById('coords').innerHTML = 
                      lat.toFixed(6) + ', ' + lng.toFixed(6);
              });
          }

          // PERBAIKAN: Hapus browser geolocation, gunakan koordinat dari React Native
          document.getElementById('locationBtn').onclick = function() {
              // Reset ke koordinat yang sudah didapat dari React Native
              map.setView([${currentLocation.latitude}, ${currentLocation.longitude}], 15);
          };

          // Button handlers
          document.getElementById('cancelBtn').onclick = function() {
              window.ReactNativeWebView.postMessage('cancel');
          };

          document.getElementById('confirmBtn').onclick = function() {
              if (selectedCoord) {
                  window.ReactNativeWebView.postMessage('confirm:' + selectedCoord.latitude + ',' + selectedCoord.longitude);
              } else {
                  alert('Silakan pilih lokasi di peta terlebih dahulu');
              }
          };

          window.onload = initMap;
      </script>
  </body>
  </html>
`;


  // Helper function untuk mendapatkan teks bantuan
  const getHelpText = (field: string, value: number): string => {
    switch (field) {
      case 'luasRetak':
        if (value === 0) return 'Tidak Ada';
        if (value < 10) return '< 10%';
        if (value >= 10 && value <= 30) return '10 - 30%';
        if (value > 30) return '> 30%';
        return '';
      case 'lebarRetak':
        if (value === 0) return 'Tidak Ada';
        if (value < 1) return '< 1mm';
        if (value >= 1 && value <= 3) return '1 - 3 mm';
        if (value > 3) return '> 3mm';
        return '';
      case 'jumlahLubang':
        if (value === 0) return 'Tidak Ada';
        if (value < 10) return '< 10 per km';
        if (value >= 10 && value <= 50) return '10 - 50 per km';
        if (value > 50) return '> 50 per km';
        return '';
      case 'alurRoda':
        if (value === 0) return 'Tidak Ada';
        if (value < 1) return '< 1 cm';
        if (value >= 1 && value <= 3) return '1 - 3 cm';
        if (value > 3) return '> 3 cm';
        return '';
      case 'volumeLHR':
        return 'Rata-rata kendaraan per hari';
      default:
        return '';
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Formulir Penilaian</Text>
            <Text style={styles.subtitle}>Kondisi Jalan</Text>
            <View style={styles.decorativeLine} />
          </View>

          {/* Basic Info Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={24} color="#667eea" />
              <Text style={styles.sectionTitle}>Informasi Dasar</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nama Jalan *</Text>
              <TextInput
                value={formData.namaJalan}
                onChangeText={(value) => updateFormData("namaJalan", value)}
                style={styles.textInput}
                placeholder="Masukkan nama jalan"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Jenis Jalan *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.jenisJalan}
                  onValueChange={(value) => updateFormData("jenisJalan", value)}
                  style={styles.picker}
                  dropdownIconColor="#667eea"
                >
                  <Picker.Item label="Pilih Jenis Jalan" value="" />
                  <Picker.Item label="Jalan Nasional" value="jalan_nasional" />
                  <Picker.Item label="Jalan Provinsi" value="jalan_provinsi" />
                  <Picker.Item label="Jalan Kabupaten/Kota" value="jalan_kabupaten_kota" />
                </Picker>
              </View>
            </View>

            <View style={styles.rowContainer}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.inputLabel}>STA Awal *</Text>
                <TextInput
                  value={formData.staAwal}
                  onChangeText={(value) => updateFormData("staAwal", value)}
                  style={styles.textInput}
                  placeholder="0+000"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.inputLabel}>STA Akhir *</Text>
                <TextInput
                  value={formData.staAkhir}
                  onChangeText={(value) => updateFormData("staAkhir", value)}
                  style={styles.textInput}
                  placeholder="0+000"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Lokasi (GPS Koordinat) *</Text>
              <View style={styles.locationInputContainer}>
                <TextInput
                  value={formData.lokasi}
                  onChangeText={(value) => updateFormData("lokasi", value)}
                  style={[styles.textInput, styles.locationInput]}
                  placeholder="Koordinat akan muncul di sini"
                  editable={false}
                />
                <TouchableOpacity style={styles.mapButton} onPress={openMapModal}>
                  <Ionicons name="location" size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Damage Assessment Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="warning" size={24} color="#667eea" />
              <Text style={styles.sectionTitle}>Penilaian Kerusakan</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Jenis Retak Dominan *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.jenisRetakDominan}
                  onValueChange={(value) => updateFormData("jenisRetakDominan", value)}
                  style={styles.picker}
                  dropdownIconColor="#667eea"
                >
                  <Picker.Item label="Pilih Jenis Retak" value="" />
                  <Picker.Item label="Tidak Ada Retak" value="Tidak Ada Retak" />
                  <Picker.Item label="Retak Rambut (Hairline Cracks)" value="Retak Rambut (Hairline Cracks)" />
                  <Picker.Item label="Retak Buaya (Alligator Cracking)" value="Retak Buaya (Alligator Cracking)" />
                  <Picker.Item label="Retak Memanjang (Longitudinal Cracking)" value="Retak Memanjang (Longitudinal Cracking)" />
                  <Picker.Item label="Retak Melintang (Transversal Cracking)" value="Retak Melintang (Transversal Cracking)" />
                  <Picker.Item label="Retak Blok (Block Cracking)" value="Retak Blok (Block Cracking)" />
                  <Picker.Item label="Retak Tepi (Edge Cracking)" value="Retak Tepi (Edge Cracking)" />
                  <Picker.Item label="Retak Sambungan (Joint Reflection Cracking)" value="Retak Sambungan (Joint Reflection Cracking)" />
                  <Picker.Item label="Retak Slip (Slippage Cracking)" value="Retak Slip (Slippage Cracking)" />
                </Picker>
              </View>
            </View>

            {/* PERBAIKAN: Sliders tanpa thumbStyle */}
            <View style={styles.sliderContainer}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>Luas Retak</Text>
                <View style={styles.sliderValueContainer}>
                  <Text style={styles.sliderValue}>{formData.luasRetak}%</Text>
                  <Text style={styles.sliderStatus}>{getHelpText('luasRetak', formData.luasRetak)}</Text>
                </View>
              </View>
              <Slider
                value={formData.luasRetak}
                onValueChange={(value) => updateFormData("luasRetak", value)}
                minimumValue={0}
                maximumValue={100}
                step={1}
                minimumTrackTintColor="#667eea"
                maximumTrackTintColor="#e5e7eb"
              />
            </View>

            <View style={styles.sliderContainer}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>Lebar Retak</Text>
                <View style={styles.sliderValueContainer}>
                  <Text style={styles.sliderValue}>{formData.lebarRetak.toFixed(1)} mm</Text>
                  <Text style={styles.sliderStatus}>{getHelpText('lebarRetak', formData.lebarRetak)}</Text>
                </View>
              </View>
              <Slider
                value={formData.lebarRetak}
                onValueChange={(value) => updateFormData("lebarRetak", value)}
                minimumValue={0}
                maximumValue={10}
                step={0.1}
                minimumTrackTintColor="#667eea"
                maximumTrackTintColor="#e5e7eb"
              />
            </View>

            <View style={styles.counterContainer}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>Jumlah Lubang per km</Text>
              </View>
              <View style={styles.counterContent}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => updateFormData("jumlahLubang", Math.max(0, formData.jumlahLubang - 1))}
                >
                  <Ionicons name="remove" size={20} color="#ffffff" />
                </TouchableOpacity>
                <View style={styles.counterDisplay}>
                  <Text style={styles.counterValue}>{formData.jumlahLubang}</Text>
                  <Text style={styles.counterStatus}>{getHelpText('jumlahLubang', formData.jumlahLubang)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => updateFormData("jumlahLubang", Math.min(100, formData.jumlahLubang + 1))}
                >
                  <Ionicons name="add" size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sliderContainer}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>Alur Roda</Text>
                <View style={styles.sliderValueContainer}>
                  <Text style={styles.sliderValue}>{formData.alurRoda.toFixed(1)} cm</Text>
                  <Text style={styles.sliderStatus}>{getHelpText('alurRoda', formData.alurRoda)}</Text>
                </View>
              </View>
              <Slider
                value={formData.alurRoda}
                onValueChange={(value) => updateFormData("alurRoda", value)}
                minimumValue={0}
                maximumValue={10}
                step={0.1}
                minimumTrackTintColor="#667eea"
                maximumTrackTintColor="#e5e7eb"
              />
            </View>
          </View>

          {/* Traffic & Technical Data Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="car" size={24} color="#667eea" />
              <Text style={styles.sectionTitle}>Data Teknis & Lalu Lintas</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Volume LHR (kendaraan/hari) *</Text>
              <TextInput
                value={formData.volumeLHR}
                onChangeText={(value) => updateFormData("volumeLHR", value)}
                keyboardType="numeric"
                style={styles.textInput}
                placeholder="Contoh: 5000"
              />
              <Text style={styles.helpText}>{getHelpText('volumeLHR', 0)}</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Sumber Data *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.sumberData}
                  onValueChange={(value) => updateFormData("sumberData", value)}
                  style={styles.picker}
                  dropdownIconColor="#667eea"
                >
                  <Picker.Item label="Pilih Sumber Data" value="" />
                  <Picker.Item label="Survey Lapangan" value="survey_lapangan" />
                  <Picker.Item label="Data Dinas PU" value="data_dinas_pu" />
                  <Picker.Item label="Data BPS" value="data_bps" />
                  <Picker.Item label="Estimasi" value="estimasi" />
                </Picker>
              </View>
            </View>

            {/* DIHAPUS: Umur Perkerasan */}
            {/* <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Umur Perkerasan *</Text>
              <TextInput
                value={formData.umur}
                onChangeText={(value) => updateFormData("umur", value)}
                keyboardType="numeric"
                style={styles.textInput}
                placeholder="Dalam tahun (contoh: 5)"
              />
            </View> */}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Jenis Perkerasan *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.jenisPerkerasan}
                  onValueChange={(value) => updateFormData("jenisPerkerasan", value)}
                  style={styles.picker}
                  dropdownIconColor="#667eea"
                >
                  <Picker.Item label="Pilih Jenis Perkerasan" value="" />
                  <Picker.Item label="Perkerasan Lentur (Flexible Pavement)" value="Perkerasan Lentur (Flexible Pavement)" />
                  <Picker.Item label="Perkerasan Kaku (Rigid Pavement)" value="Perkerasan Kaku (Rigid Pavement)" />
                  <Picker.Item label="Perkerasan Komposit (Composite Pavement)" value="Perkerasan Komposit (Composite Pavement)" />
                </Picker>
              </View>
            </View>
          </View>

          {/* Photo Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="camera" size={24} color="#667eea" />
              <Text style={styles.sectionTitle}>Dokumentasi Foto</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScrollView}>
              <View style={styles.photoScrollContent}>
                <TouchableOpacity style={styles.addPhotoButton} onPress={addPhoto}>
                  <View style={styles.addPhotoIcon}>
                    <Ionicons name="camera" size={24} color="#9ca3af" />
                  </View>
                  <Text style={styles.addPhotoText}>Tambah Foto</Text>
                </TouchableOpacity>

                {formData.foto.map((photo, index) => (
                  <View key={index} style={styles.photoContainer}>
                    <Image source={{ uri: photo }} style={styles.photoImage} />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => removePhoto(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>

            {formData.foto.length > 0 && (
              <View style={styles.photoCountContainer}>
                <Text style={styles.photoCountText}>📷 {formData.foto.length} foto ditambahkan</Text>
              </View>
            )}
          </View>

          {/* Additional Notes Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={24} color="#667eea" />
              <Text style={styles.sectionTitle}>Keterangan Tambahan</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Observasi & Informasi Tambahan *</Text>
              <TextInput
                value={formData.Keterangan}
                onChangeText={(value) => updateFormData("Keterangan", value)}
                style={styles.textArea}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                placeholder="Deskripsikan kondisi jalan, faktor penyebab kerusakan, atau informasi lain yang relevan..."
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.button, styles.draftButton]} onPress={handleDraft}>
              <Ionicons name="save-outline" size={20} color="#6b7280" />
              <Text style={[styles.buttonText, { color: '#6b7280' }]}>Simpan Draft</Text>
            </TouchableOpacity>

            {isSubmitting ? (
              <View style={[styles.button, styles.submitButton]}>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={styles.buttonText}>Mengirim...</Text>
              </View>
            ) : (
              <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
                <Ionicons name="send" size={20} color="#ffffff" />
                <Text style={styles.buttonText}>Kirim Laporan</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Map Modal */}
      <Modal
        visible={isMapModalVisible}
        animationType="slide"
        onRequestClose={() => setIsMapModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <Ionicons name="location" size={24} color="#667eea" />
              <Text style={styles.modalTitle}>Pilih Lokasi Jalan</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsMapModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          <WebView
            source={{ html: mapHTML }}
            style={styles.webview}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#667eea',
    textAlign: 'center',
    marginTop: 4,
  },
  decorativeLine: {
    width: 60,
    height: 4,
    backgroundColor: '#667eea',
    borderRadius: 2,
    marginTop: 16,
  },
  sectionContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 12,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  textArea: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  picker: {
    height: 56,
    width: '100%',
    color: '#1e293b',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationInput: {
    flex: 1,
    marginRight: 12,
  },
  mapButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sliderContainer: {
    marginBottom: 24,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  sliderValueContainer: {
    alignItems: 'flex-end',
  },
  sliderValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#667eea',
  },
  sliderStatus: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  // PERBAIKAN: Hapus sliderThumb dari styles karena tidak dipakai lagi
  counterContainer: {
    marginBottom: 24,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  counterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  counterButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  counterDisplay: {
    alignItems: 'center',
    marginHorizontal: 24,
    minWidth: 80,
  },
  counterValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
  },
  counterStatus: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  helpText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  photoScrollView: {
    marginBottom: 16,
  },
  photoScrollContent: {
    paddingRight: 20,
  },
  addPhotoButton: {
    width: 140,
    height: 140,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  addPhotoIcon: {
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    padding: 12,
    marginBottom: 8,
  },
  addPhotoText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  photoContainer: {
    width: 140,
    height: 140,
    marginRight: 16,
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  photoCountContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  photoCountText: {
    fontSize: 16,
    color: '#0369a1',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 8,
  },
  draftButton: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  submitButton: {
    backgroundColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 12,
  },
  closeButton: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 8,
  },
  webview: {
    flex: 1,
  },
});
