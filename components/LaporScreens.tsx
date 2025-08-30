// File: /LaporScreens.tsx

import { Ionicons } from "@expo/vector-icons";
import { Camera, MapView, PointAnnotation } from "@maplibre/maplibre-react-native";
import Slider from '@react-native-community/slider';
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { decode } from 'base64-arraybuffer';
import { launchCamera, launchImageLibrary, CameraOptions, ImageLibraryOptions, ImagePickerResponse } from 'react-native-image-picker';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  Linking,
  ActionSheetIOS,
} from "react-native";
import { supabase } from './utils/supabase';

// Type guard for geometry coordinates
interface PointGeometry {
  type: 'Point';
  coordinates: [number, number];
}

const isPointGeometry = (geometry: any): geometry is PointGeometry => {
  return geometry && geometry.type === 'Point' && Array.isArray(geometry.coordinates);
};

// ✅ INTERFACE YANG DIPERLUAS
interface LaporanToEdit {
  _id: string;
  nama_jalan: string;
  keterangan: string;
  lokasi: string;
  jenis_jalan: string;
  sta_awal: string;
  sta_akhir: string;
  jenis_retak_dominan: string;
  luas_retak: number;
  lebar_retak: number;
  jumlah_lubang: number;
  alur_roda: number;
  volume_lhr: string;
  sumber_data: string;
  jenis_perkerasan: string;
  foto_urls: string[];
  // ✅ FIELDS BARU
  tanggal_survey?: string;
  waktu_survey?: string;
  cuaca_survey?: string;
  kondisi_drainase?: string;
  kondisi_bahu?: string;
  kondisi_markah?: string;
}

interface FormData {
  _id?: string;
  namaJalan: string;
  keterangan: string;
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
  jenisPerkerasan: string;
  foto: string[];
  // ✅ FIELDS BARU
  tanggalSurvey: string;
  waktuSurvey: string;
  cuacaSurvey: string;
  kondisiDrainase: string;
  kondisiBahu: string;
  kondisiMarkah: string;
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

// ✅ INITIAL FORM DATA YANG DIPERLUAS
const initialFormData: FormData = {
  namaJalan: "",
  keterangan: "",
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
  jenisPerkerasan: "",
  foto: [],
  // ✅ DEFAULT VALUES BARU
  tanggalSurvey: new Date().toLocaleDateString('id-ID'),
  waktuSurvey: "",
  cuacaSurvey: "",
  kondisiDrainase: "",
  kondisiBahu: "",
  kondisiMarkah: "",
};

export default function LaporScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const laporanToEdit = route.params?.laporanToEdit as LaporanToEdit | undefined;

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);

  // State untuk modal maps
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [selectedCoordinate, setSelectedCoordinate] = useState<Coordinate | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Coordinate>({
    latitude: -2.5489,
    longitude: 118.0149,
  });
  const [centerCoordinate, setCenterCoordinate] = useState<[number, number]>([118.0149, -2.5489]);
  const [zoomLevel, setZoomLevel] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ AUTO-SET WAKTU SURVEY BERDASARKAN JAM SAAT INI
  useEffect(() => {
    const currentHour = new Date().getHours();
    let waktuDefault = "";
    if (currentHour >= 6 && currentHour < 12) waktuDefault = "pagi";
    else if (currentHour >= 12 && currentHour < 18) waktuDefault = "siang";
    else if (currentHour >= 18 && currentHour < 22) waktuDefault = "sore";
    else waktuDefault = "malam";

    setFormData(prev => ({
      ...prev,
      waktuSurvey: waktuDefault,
      tanggalSurvey: new Date().toLocaleDateString('id-ID')
    }));
  }, []);

  // ✅ EFFECT UNTUK MODE EDIT YANG DIPERLUAS
  useEffect(() => {
    if (laporanToEdit) {
      setIsEditMode(true);
      setFormData({
        _id: laporanToEdit._id,
        namaJalan: laporanToEdit.nama_jalan,
        keterangan: laporanToEdit.keterangan,
        lokasi: laporanToEdit.lokasi,
        jenisJalan: laporanToEdit.jenis_jalan,
        staAwal: laporanToEdit.sta_awal,
        staAkhir: laporanToEdit.sta_akhir,
        jenisRetakDominan: laporanToEdit.jenis_retak_dominan,
        luasRetak: laporanToEdit.luas_retak,
        lebarRetak: laporanToEdit.lebar_retak,
        jumlahLubang: laporanToEdit.jumlah_lubang,
        alurRoda: laporanToEdit.alur_roda,
        volumeLHR: laporanToEdit.volume_lhr,
        sumberData: laporanToEdit.sumber_data,
        jenisPerkerasan: laporanToEdit.jenis_perkerasan,
        foto: [],
        // ✅ LOAD DATA BARU JIKA ADA
        tanggalSurvey: laporanToEdit.tanggal_survey || new Date().toLocaleDateString('id-ID'),
        waktuSurvey: laporanToEdit.waktu_survey || "",
        cuacaSurvey: laporanToEdit.cuaca_survey || "",
        kondisiDrainase: laporanToEdit.kondisi_drainase || "",
        kondisiBahu: laporanToEdit.kondisi_bahu || "",
        kondisiMarkah: laporanToEdit.kondisi_markah || "",
      });
      setExistingPhotos(laporanToEdit.foto_urls);

      if (laporanToEdit.lokasi) {
        const [latitude, longitude] = laporanToEdit.lokasi.split(",").map(Number);
        if (!isNaN(latitude) && !isNaN(longitude)) {
          setSelectedCoordinate({ latitude, longitude });
          setCenterCoordinate([longitude, latitude]);
        }
      }
    } else {
      setIsEditMode(false);
      setFormData(initialFormData);
      setExistingPhotos([]);
    }
  }, [laporanToEdit]);

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setExistingPhotos([]);
    setSelectedCoordinate(null);
  };

  // ====== PERMISSIONS & PICKER HELPERS ======

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Izin lokasi diperlukan untuk menggunakan fitur ini');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coordinate: Coordinate = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCurrentLocation(coordinate);

      if (!isNaN(coordinate.latitude) && !isNaN(coordinate.longitude)) {
        setCenterCoordinate([coordinate.longitude, coordinate.latitude]);
        setZoomLevel(15);
      }

      if (!selectedCoordinate) {
        setSelectedCoordinate(coordinate);
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Gagal mendapatkan lokasi. Menggunakan lokasi default.');
      setCenterCoordinate([118.0149, -2.5489]);
      setZoomLevel(10);
    }
  };

  const openMapModal = () => {
    setIsMapModalVisible(true);
    getCurrentLocation();
  };

  const confirmLocation = () => {
    if (selectedCoordinate) {
      const locationString = `${selectedCoordinate.latitude.toFixed(6)}, ${selectedCoordinate.longitude.toFixed(6)}`;
      updateFormData('lokasi', locationString);
      setIsMapModalVisible(false);
    } else {
      Alert.alert('Error', 'Silakan pilih lokasi di peta terlebih dahulu');
    }
  };

  // ✅ Fungsi kamera yang stabil
  const openCamera = () => {
    const options: CameraOptions = {
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: false,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
        return;
      }

      if (response.errorMessage) {
        console.error('Camera error:', response.errorMessage);
        Alert.alert('Error', `Gagal mengakses kamera: ${response.errorMessage}`);
        return;
      }

      if (response.assets && response.assets[0] && response.assets[0].uri) {
        const newPhoto = response.assets[0].uri;
        setFormData(prev => ({
          ...prev, 
          foto: [...prev.foto, newPhoto]
        }));
        Alert.alert('Sukses', 'Foto berhasil diambil dari kamera!');
      }
    });
  };

  // ✅ Fungsi galeri yang stabil
  const openImageLibrary = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: false,
      selectionLimit: 5, // bisa pilih multiple
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled gallery');
        return;
      }

      if (response.errorMessage) {
        console.error('Gallery error:', response.errorMessage);
        Alert.alert('Error', `Gagal mengakses galeri: ${response.errorMessage}`);
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const newPhotos = response.assets
          .map(asset => asset.uri)
          .filter(uri => uri !== undefined) as string[];
        
        setFormData(prev => ({
          ...prev,
          foto: [...prev.foto, ...newPhotos]
        }));
        Alert.alert('Sukses', `${newPhotos.length} foto berhasil dipilih dari galeri!`);
      }
    });
  };

  // ✅ Fungsi utama dengan pilihan
  const addPhoto = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Batal', 'Ambil Foto', 'Pilih dari Galeri'], cancelButtonIndex: 0 },
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
        'Pilih Foto', 'Pilih sumber foto',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Ambil Foto', onPress: openCamera },
          { text: 'Pilih dari Galeri', onPress: openImageLibrary },
        ]
      );
    }
  };

  // ✅ Fungsi untuk menghapus foto yang sudah ada
  const removeExistingPhoto = (index: number) => {
    Alert.alert(
      'Hapus Foto', 'Apakah Anda yakin ingin menghapus foto ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus', style: 'destructive', onPress: () => {
            setExistingPhotos(prev => prev.filter((_, i) => i !== index));
          },
        },
      ]
    );
  };

  const removeNewPhoto = (index: number) => {
    Alert.alert(
      'Hapus Foto', 'Apakah Anda yakin ingin menghapus foto ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus', style: 'destructive', onPress: () => {
            setFormData(prev => ({
              ...prev, foto: prev.foto.filter((_, i) => i !== index)
            }));
          },
        },
      ]
    );
  };

  const validateForm = (): boolean => {
    const requiredFields = ["namaJalan", "keterangan", "lokasi", "jenisJalan", "staAwal", "staAkhir", "jenisRetakDominan", "volumeLHR", "sumberData", "jenisPerkerasan"];
    for (const field of requiredFields) {
      const value = formData[field as keyof FormData];
      if (typeof value === "string") {
        if (!value.trim()) {
          Alert.alert("Error", `${field} harus diisi`);
          return false;
        }
      }
    }
    if (existingPhotos.length === 0 && formData.foto.length === 0) {
      Alert.alert("Error", "Minimal satu foto harus disertakan");
      return false;
    }
    return true;
  };

  const hitungPrioritas = (): HasilPrioritas => {
    let sdiTotal = 0; let sdi1 = 0; let sdi2 = 0; let sdi3 = 0; let sdi4 = 0;
    if (formData.luasRetak === 0) {
      sdi1 = 0;
    } else if (formData.luasRetak < 10) {
      sdi1 = 5;
    } else if (formData.luasRetak >= 10 && formData.luasRetak <= 30) {
      sdi1 = 20;
    } else if (formData.luasRetak > 30) {
      sdi1 = 40;
    }
    sdiTotal = sdi1;
    if (formData.lebarRetak > 3) {
      sdi2 = sdi1 * 2;
    } else {
      sdi2 = sdi1;
    }
    sdiTotal = sdi2;
    if (formData.jumlahLubang > 50) {
      sdi3 = sdi2 + 225;
    } else if (formData.jumlahLubang >= 10 && formData.jumlahLubang <= 50) {
      sdi3 = sdi2 + 75;
    } else if (formData.jumlahLubang > 0 && formData.jumlahLubang < 10) {
      sdi3 = sdi2 + 15;
    } else {
      sdi3 = sdi2;
    }
    sdiTotal = sdi3;
    if (formData.alurRoda > 3) {
      sdi4 = sdi3 + 20;
    } else if (formData.alurRoda >= 1 && formData.alurRoda <= 3) {
      sdi4 = sdi3 + 10;
    } else if (formData.alurRoda > 0 && formData.alurRoda < 1) {
      sdi4 = sdi3 + 2.5;
    } else {
      sdi4 = sdi3;
    }
    sdiTotal = sdi4;
    let kategori: string; let aksi: string;
    if (sdiTotal < 50) {
      kategori = "Baik (Good)";
      aksi = "Pemeliharaan rutin; pembersihan, penutupan retak kecil, pemeriksaan berkala.";
    } else if (sdiTotal >= 50 && sdiTotal < 100) {
      kategori = "Sedang (Fair)";
      aksi = "Pemeliharaan rutin intensif dan pemeliharaan berkala; penutupan retak, pengisian lubang kecil, overlay tipis.";
    } else if (sdiTotal >= 100 && sdiTotal < 150) {
      kategori = "Rusak Ringan (Poor)";
      aksi = "Perbaikan terfokus; penambalan lubang/lapis tambal, perbaikan struktural ringan, overlay atau perkerasan ulang sebagian.";
    } else {
      kategori = "Rusak Berat (Bad)";
      aksi = "Rehabilitasi mayor atau rekonstruksi; penggantian lapisan permukaan/struktural secara menyeluruh untuk memulihkan kondisi jalan.";
    }
    return { Z: sdiTotal, kategori, aksi };
  };

  // ✅ FUNGSI UNTUK MENDAPATKAN WARNA BERDASARKAN KATEGORI SDI
  const getSDIColors = (kategori: string): [string, string] => {
    switch (kategori) {
      case "Baik (Good)": return ["#10b981", "#34d399"];
      case "Sedang (Fair)": return ["#f59e0b", "#fbbf24"];
      case "Rusak Ringan (Poor)": return ["#f97316", "#fb923c"];
      case "Rusak Berat (Bad)": return ["#ef4444", "#f87171"];
      default: return ["#6b7280", "#9ca3af"];
    }
  };

  const uploadPhotosToSupabase = async (photoUris: string[]): Promise<string[]> => {
    const downloadUrls: string[] = [];
    try {
      for (const uri of photoUris) {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const fileExtension = uri.split('.').pop();
        const filePath = `laporan-foto/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

        const fileBuffer = decode(base64);

        const { data, error } = await supabase.storage
          .from('laporan-foto')
          .upload(filePath, fileBuffer, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
          .from('laporan-foto').getPublicUrl(filePath);

        if (!publicUrlData) throw new Error("Gagal mendapatkan URL publik.");

        downloadUrls.push(publicUrlData.publicUrl);
      }
      return downloadUrls;
    } catch (error) {
      console.error("Error uploading photos:", error);
      throw new Error("Gagal mengunggah foto ke Supabase Storage.");
    }
  };

  // ✅ UPDATE FUNCTION YANG DIPERLUAS
  const updateToSupabase = async (data: FormData, hasilPrioritas: HasilPrioritas) => {
    setIsSubmitting(true);
    try {
      if (!data._id) throw new Error("ID laporan tidak ditemukan untuk update.");

      let newFotoUrls: string[] = [];
      if (data.foto.length > 0) {
        newFotoUrls = await uploadPhotosToSupabase(data.foto);
      }

      const allFotoUrls = [...existingPhotos, ...newFotoUrls];

      const dataToUpdate = {
        nama_jalan: data.namaJalan, keterangan: data.keterangan, lokasi: data.lokasi, jenis_jalan: data.jenisJalan,
        sta_awal: data.staAwal, sta_akhir: data.staAkhir, jenis_retak_dominan: data.jenisRetakDominan,
        luas_retak: data.luasRetak, lebar_retak: data.lebarRetak, jumlah_lubang: data.jumlahLubang,
        alur_roda: data.alurRoda, volume_lhr: data.volumeLHR, sumber_data: data.sumberData,
        jenis_perkerasan: data.jenisPerkerasan, foto_urls: allFotoUrls, prioritas: hasilPrioritas.Z,
        kategori: hasilPrioritas.kategori, aksi: hasilPrioritas.aksi,
        // ✅ TAMBAHKAN FIELDS BARU
        tanggal_survey: data.tanggalSurvey,
        waktu_survey: data.waktuSurvey,
        cuaca_survey: data.cuacaSurvey,
        kondisi_drainase: data.kondisiDrainase,
        kondisi_bahu: data.kondisiBahu,
        kondisi_markah: data.kondisiMarkah,
      };

      const { error } = await supabase.from('laporan_jalan').update(dataToUpdate).eq('_id', data._id);
      if (error) throw error;

      Alert.alert(
        "Berhasil!",
        `Laporan berhasil diperbarui.\nNilai SDI: ${hasilPrioritas.Z.toFixed(2)}`
      );
      navigation.goBack();

    } catch (error) {
      console.error("Error updating to Supabase:", error);
      Alert.alert("Error", "Gagal menyimpan perubahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ SAVE FUNCTION YANG DIPERLUAS
  const saveToSupabase = async (data: FormData, hasilPrioritas: HasilPrioritas, status: string) => {
    setIsSubmitting(true);
    try {
      let fotoUrls: string[] = [];
      if (data.foto.length > 0) {
        fotoUrls = await uploadPhotosToSupabase(data.foto);
      }
      const dataToSave = {
        nama_jalan: data.namaJalan, keterangan: data.keterangan, lokasi: data.lokasi, jenis_jalan: data.jenisJalan,
        sta_awal: data.staAwal, sta_akhir: data.staAkhir, jenis_retak_dominan: data.jenisRetakDominan,
        luas_retak: data.luasRetak, lebar_retak: data.lebarRetak, jumlah_lubang: data.jumlahLubang,
        alur_roda: data.alurRoda, volume_lhr: data.volumeLHR, sumber_data: data.sumberData,
        jenis_perkerasan: data.jenisPerkerasan, foto_urls: fotoUrls, prioritas: hasilPrioritas.Z,
        kategori: hasilPrioritas.kategori, aksi: hasilPrioritas.aksi, tanggal: new Date().toISOString(), status: status,
        // ✅ TAMBAHKAN FIELDS BARU
        tanggal_survey: data.tanggalSurvey,
        waktu_survey: data.waktuSurvey,
        cuaca_survey: data.cuacaSurvey,
        kondisi_drainase: data.kondisiDrainase,
        kondisi_bahu: data.kondisiBahu,
        kondisi_markah: data.kondisiMarkah,
      };

      const { data: savedData, error } = await supabase.from('laporan_jalan').insert([dataToSave]).select();
      if (error) {
        throw error;
      }
      console.log('Dokumen berhasil ditambahkan di Supabase:', savedData);
      return savedData;
    } catch (error) {
      console.error("Error saving to Supabase:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    const hasil = hitungPrioritas();

    if (isEditMode) {
      await updateToSupabase(formData, hasil);
    } else {
      try {
        await saveToSupabase(formData, hasil, "pending");
        Alert.alert(
          "Laporan Berhasil Dikirim!",
          `Nilai SDI: ${hasil.Z.toFixed(2)}\nKategori: ${hasil.kategori}\nAksi: ${hasil.aksi}`,
          [{
            text: "OK", onPress: () => {
              resetForm();
              navigation.goBack();
            }
          }]
        );
      } catch (error) {
        console.error('Submit error:', error);
        Alert.alert("Error", "Gagal mengirim laporan. Silakan coba lagi.");
      }
    }
  };

  const handleDraft = async () => {
    if (!validateForm()) return;
    const hasil = hitungPrioritas();

    if (isEditMode) {
      Alert.alert("Fitur Draft Tidak Tersedia", "Mode edit tidak mendukung fitur draft.");
      return;
    }

    try {
      await saveToSupabase(formData, hasil, "draft");
      Alert.alert("Draft Tersimpan", "Data telah disimpan sebagai draft", [{
        text: "OK", onPress: resetForm
      }]);
    } catch (error) {
      console.error('Error menyimpan draft:', error);
      Alert.alert("Error", "Gagal menyimpan draft. Silakan coba lagi.");
    }
  };

  const getHelpText = (field: string, value: number): string => {
    switch (field) {
      case 'luasRetak': if (value === 0) return 'Tidak Ada'; if (value < 10) return '< 10%'; if (value >= 10 && value <= 30) return '10 - 30%'; if (value > 30) return '> 30%'; return '';
      case 'lebarRetak': if (value === 0) return 'Tidak Ada'; if (value < 1) return '< 1mm'; if (value >= 1 && value <= 3) return '1 - 3 mm'; if (value > 3) return '> 3mm'; return '';
      case 'jumlahLubang': if (value === 0) return 'Tidak Ada'; if (value < 10) return '< 10 per km'; if (value >= 10 && value <= 50) return '10 - 50 per km'; if (value > 50) return '> 50 per km'; return '';
      case 'alurRoda': if (value === 0) return 'Tidak Ada'; if (value < 1) return '< 1 cm'; if (value >= 1 && value <= 3) return '1 - 3 cm'; if (value > 3) return '> 3 cm'; return '';
      case 'volumeLHR': return 'Rata-rata kendaraan per hari';
      default: return '';
    }
  };

  const allPhotos = [...existingPhotos, ...formData.foto];

  // ✅ REAL-TIME SDI CALCULATION
  const currentSDI = hitungPrioritas();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>{isEditMode ? 'Edit Laporan' : 'Formulir Penilaian'}</Text>
            <Text style={styles.subtitle}>Kondisi Jalan</Text>
            <View style={styles.decorativeLine} />
          </View>

          {/* ✅ 1. SURVEY METADATA SECTION */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time" size={24} color="#667eea" />
              <Text style={styles.sectionTitle}>📅 Metadata Survey</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Tanggal Survey</Text>
              <TextInput
                value={formData.tanggalSurvey}
                style={[styles.textInput, { backgroundColor: '#f3f4f6' }]}
                editable={false}
              />
            </View>

            <View style={styles.rowContainer}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.inputLabel}>Waktu Survey</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.waktuSurvey}
                    onValueChange={(value) => updateFormData("waktuSurvey", value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="🌅 Pagi (06-12)" value="pagi" />
                    <Picker.Item label="☀️ Siang (12-18)" value="siang" />
                    <Picker.Item label="🌇 Sore (18-22)" value="sore" />
                    <Picker.Item label="🌙 Malam (22-06)" value="malam" />
                  </Picker>
                </View>
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.inputLabel}>Kondisi Cuaca</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.cuacaSurvey}
                    onValueChange={(value) => updateFormData("cuacaSurvey", value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Pilih Cuaca" value="" />
                    <Picker.Item label="☀️ Cerah" value="cerah" />
                    <Picker.Item label="⛅ Berawan" value="berawan" />
                    <Picker.Item label="🌦️ Hujan Ringan" value="hujan_ringan" />
                    <Picker.Item label="🌧️ Hujan Lebat" value="hujan_lebat" />
                  </Picker>
                </View>
              </View>
            </View>
          </View>

          {/* ✅ 2. REAL-TIME SDI PREVIEW */}
          <LinearGradient
            colors={getSDIColors(currentSDI.kategori)}
            style={styles.sdiPreviewContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.sdiPreviewContent}>
              <View style={styles.sdiPreviewHeader}>
                <Ionicons name="analytics" size={24} color="#ffffff" />
                <Text style={styles.sdiPreviewTitle}>📊 Nilai SDI Real-time</Text>
              </View>
              <View style={styles.sdiPreviewValues}>
                <Text style={styles.sdiPreviewValue}>{currentSDI.Z.toFixed(1)}</Text>
                <Text style={styles.sdiPreviewCategory}>{currentSDI.kategori}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Basic Info Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={24} color="#667eea" />
              <Text style={styles.sectionTitle}>Informasi Dasar</Text>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nama Jalan *</Text>
              <TextInput value={formData.namaJalan} onChangeText={(value) => updateFormData("namaJalan", value)} style={styles.textInput} placeholder="Masukkan nama jalan" />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Jenis Jalan *</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={formData.jenisJalan} onValueChange={(value) => updateFormData("jenisJalan", value)} style={styles.picker} dropdownIconColor="#667eea">
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
                <TextInput value={formData.staAwal} onChangeText={(value) => updateFormData("staAwal", value)} style={styles.textInput} placeholder="0+000" />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.inputLabel}>STA Akhir *</Text>
                <TextInput value={formData.staAkhir} onChangeText={(value) => updateFormData("staAkhir", value)} style={styles.textInput} placeholder="0+000" />
              </View>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Lokasi (GPS Koordinat) *</Text>
              <View style={styles.locationInputContainer}>
                <TextInput value={formData.lokasi} onChangeText={(value) => updateFormData("lokasi", value)} style={[styles.textInput, styles.locationInput]} placeholder="Koordinat akan muncul di sini" editable={false} />
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
                <Picker selectedValue={formData.jenisRetakDominan} onValueChange={(value) => updateFormData("jenisRetakDominan", value)} style={styles.picker} dropdownIconColor="#667eea">
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
            <View style={styles.sliderContainer}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>Luas Retak</Text>
                <View style={styles.sliderValueContainer}>
                  <Text style={styles.sliderValue}>{formData.luasRetak}%</Text>
                  <Text style={styles.sliderStatus}>{getHelpText('luasRetak', formData.luasRetak)}</Text>
                </View>
              </View>
              <Slider value={formData.luasRetak} onValueChange={(value) => updateFormData("luasRetak", value)} minimumValue={0} maximumValue={100} step={1} minimumTrackTintColor="#667eea" maximumTrackTintColor="#e5e7eb" />
            </View>
            <View style={styles.sliderContainer}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>Lebar Retak</Text>
                <View style={styles.sliderValueContainer}>
                  <Text style={styles.sliderValue}>{formData.lebarRetak.toFixed(1)} mm</Text>
                  <Text style={styles.sliderStatus}>{getHelpText('lebarRetak', formData.lebarRetak)}</Text>
                </View>
              </View>
              <Slider value={formData.lebarRetak} onValueChange={(value) => updateFormData("lebarRetak", value)} minimumValue={0} maximumValue={10} step={0.1} minimumTrackTintColor="#667eea" maximumTrackTintColor="#e5e7eb" />
            </View>
            <View style={styles.counterContainer}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>Jumlah Lubang per km</Text>
              </View>
              <View style={styles.counterContent}>
                <TouchableOpacity style={styles.counterButton} onPress={() => updateFormData("jumlahLubang", Math.max(0, formData.jumlahLubang - 1))}>
                  <Ionicons name="remove" size={20} color="#ffffff" />
                </TouchableOpacity>
                <View style={styles.counterDisplay}>
                  <Text style={styles.counterValue}>{formData.jumlahLubang}</Text>
                  <Text style={styles.counterStatus}>{getHelpText('jumlahLubang', formData.jumlahLubang)}</Text>
                </View>
                <TouchableOpacity style={styles.counterButton} onPress={() => updateFormData("jumlahLubang", Math.min(100, formData.jumlahLubang + 1))}>
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
              <Slider value={formData.alurRoda} onValueChange={(value) => updateFormData("alurRoda", value)} minimumValue={0} maximumValue={10} step={0.1} minimumTrackTintColor="#667eea" maximumTrackTintColor="#e5e7eb" />
            </View>
          </View>

          {/* ✅ 3. KONDISI INFRASTRUKTUR PENDUKUNG */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="construct" size={24} color="#667eea" />
              <Text style={styles.sectionTitle}>🛣️ Kondisi Infrastruktur Pendukung</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Kondisi Drainase</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.kondisiDrainase}
                  onValueChange={(value) => updateFormData("kondisiDrainase", value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Pilih Kondisi" value="" />
                  <Picker.Item label="✅ Baik" value="baik" />
                  <Picker.Item label="⚠️ Sedang" value="sedang" />
                  <Picker.Item label="❌ Buruk" value="buruk" />
                  <Picker.Item label="🚫 Tidak Ada" value="tidak_ada" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Kondisi Bahu Jalan</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.kondisiBahu}
                  onValueChange={(value) => updateFormData("kondisiBahu", value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Pilih Kondisi" value="" />
                  <Picker.Item label="✅ Baik" value="baik" />
                  <Picker.Item label="⚠️ Rusak" value="rusak" />
                  <Picker.Item label="🚫 Tidak Ada" value="tidak_ada" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Kondisi Marka Jalan</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.kondisiMarkah}
                  onValueChange={(value) => updateFormData("kondisiMarkah", value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Pilih Kondisi" value="" />
                  <Picker.Item label="✅ Jelas" value="jelas" />
                  <Picker.Item label="⚠️ Pudar" value="pudar" />
                  <Picker.Item label="❌ Hilang" value="hilang" />
                  <Picker.Item label="🚫 Tidak Ada" value="tidak_ada" />
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="car" size={24} color="#667eea" />
              <Text style={styles.sectionTitle}>Data Teknis & Lalu Lintas</Text>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Volume LHR (kendaraan/hari) *</Text>
              <TextInput value={formData.volumeLHR} onChangeText={(value) => updateFormData("volumeLHR", value)} keyboardType="numeric" style={styles.textInput} placeholder="Contoh: 5000" />
              <Text style={styles.helpText}>{getHelpText('volumeLHR', 0)}</Text>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Sumber Data *</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={formData.sumberData} onValueChange={(value) => updateFormData("sumberData", value)} style={styles.picker} dropdownIconColor="#667eea">
                  <Picker.Item label="Pilih Sumber Data" value="" />
                  <Picker.Item label="Survey Lapangan" value="survey_lapangan" />
                  <Picker.Item label="Data Dinas PU" value="data_dinas_pu" />
                  <Picker.Item label="Data BPS" value="data_bps" />
                  <Picker.Item label="Estimasi" value="estimasi" />
                </Picker>
              </View>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Jenis Perkerasan *</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={formData.jenisPerkerasan} onValueChange={(value) => updateFormData("jenisPerkerasan", value)} style={styles.picker} dropdownIconColor="#667eea">
                  <Picker.Item label="Pilih Jenis Perkerasan" value="" />
                  <Picker.Item label="Perkerasan Lentur (Flexible Pavement)" value="Perkerasan Lentur (Flexible Pavement)" />
                  <Picker.Item label="Perkerasan Kaku (Rigid Pavement)" value="Perkerasan Kaku (Rigid Pavement)" />
                  <Picker.Item label="Perkerasan Komposit (Composite Pavement)" value="Perkerasan Komposit (Composite Pavement)" />
                </Picker>
              </View>
            </View>
          </View>

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
                {existingPhotos.map((photo, index) => (
                  <View key={`existing-${index}`} style={styles.photoContainer}>
                    <Image source={{ uri: photo }} style={styles.photoImage} />
                    <TouchableOpacity style={styles.removePhotoButton} onPress={() => removeExistingPhoto(index)}>
                      <Ionicons name="close-circle" size={24} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                {formData.foto.map((photo, index) => (
                  <View key={`new-${index}`} style={styles.photoContainer}>
                    <Image source={{ uri: photo }} style={styles.photoImage} />
                    <TouchableOpacity style={styles.removePhotoButton} onPress={() => removeNewPhoto(index)}>
                      <Ionicons name="close-circle" size={24} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
            {allPhotos.length > 0 && (
              <View style={styles.photoCountContainer}>
                <Text style={styles.photoCountText}>📷 {allPhotos.length} foto ditambahkan</Text>
              </View>
            )}
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={24} color="#667eea" />
              <Text style={styles.sectionTitle}>Keterangan Tambahan</Text>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Observasi & Informasi Tambahan *</Text>
              <TextInput value={formData.keterangan} onChangeText={(value) => updateFormData("keterangan", value)} style={styles.textArea} multiline={true} numberOfLines={4} textAlignVertical="top" placeholder="Deskripsikan kondisi jalan, faktor penyebab kerusakan, atau informasi lain yang relevan..." />
            </View>
          </View>

          <View style={styles.actionButtons}>
            {!isEditMode && (
              <TouchableOpacity style={[styles.button, styles.draftButton]} onPress={handleDraft}>
                <Ionicons name="save-outline" size={20} color="#6b7280" />
                <Text style={[styles.buttonText, { color: '#6b7280' }]}>Simpan Draft</Text>
              </TouchableOpacity>
            )}
            {isSubmitting ? (
              <View style={[styles.button, styles.submitButton]}>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={styles.buttonText}>{isEditMode ? 'Menyimpan...' : 'Mengirim...'}</Text>
              </View>
            ) : (
              <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
                <Ionicons name="send" size={20} color="#ffffff" />
                <Text style={styles.buttonText}>{isEditMode ? 'Simpan Perubahan' : 'Kirim Laporan'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Modal Peta - Fixed version */}
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

            <MapView
              style={styles.map}
              mapStyle="https://api.maptiler.com/maps/streets/style.json?key=JiiHs6CPY8WFKYJJthkD"
              onPress={(event: any) => {
                try {
                  const { geometry } = event;
                  if (isPointGeometry(geometry)) {
                    const [longitude, latitude] = geometry.coordinates;
                    if (!isNaN(latitude) && !isNaN(longitude)) {
                      setSelectedCoordinate({ latitude, longitude });
                    }
                  }
                } catch (err) {
                  console.error('Map press error:', err);
                }
              }}
              logoEnabled={false}
              attributionEnabled={false}
              compassEnabled={true}
              zoomEnabled={true}
            >
              <Camera
                zoomLevel={zoomLevel}
                centerCoordinate={centerCoordinate}
                animationMode="easeTo"
                animationDuration={500}
              />

              {selectedCoordinate && (
                <PointAnnotation
                  id="selected-location"
                  coordinate={[selectedCoordinate.longitude, selectedCoordinate.latitude]}
                >
                  <View style={{
                    width: 20,
                    height: 20,
                    backgroundColor: '#ff6347',
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: 'white'
                  }} />
                </PointAnnotation>
              )}

              {currentLocation && (
                <PointAnnotation
                  id="user-location"
                  coordinate={[currentLocation.longitude, currentLocation.latitude]}
                >
                  <View style={{
                    width: 15,
                    height: 15,
                    backgroundColor: '#007AFF',
                    borderRadius: 7.5,
                    borderWidth: 2,
                    borderColor: 'white'
                  }} />
                </PointAnnotation>
              )}
            </MapView>

            <View style={styles.mapButtonsContainer}>
              <TouchableOpacity
                style={[styles.mapButton, styles.mapCancelButton]}
                onPress={() => setIsMapModalVisible(false)}
              >
                <Text style={styles.mapButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.mapButton, styles.mapConfirmButton]}
                onPress={confirmLocation}
              >
                <Text style={[styles.mapButtonText, { color: 'white' }]}>Pilih Lokasi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ✅ STYLES YANG DIPERLUAS
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  contentContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  headerContainer: { alignItems: 'center', paddingTop: 60, paddingBottom: 30 },
  title: { fontSize: 32, fontWeight: '800', color: '#1e293b', textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { fontSize: 18, fontWeight: '500', color: '#667eea', textAlign: 'center', marginTop: 4 },
  decorativeLine: { width: 60, height: 4, backgroundColor: '#667eea', borderRadius: 2, marginTop: 16 },
  sectionContainer: { backgroundColor: '#ffffff', borderRadius: 20, padding: 24, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginLeft: 12 },
  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 },
  textInput: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 16, borderWidth: 2, borderColor: '#e2e8f0', fontSize: 16, color: '#1e293b', fontWeight: '500' },
  textArea: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 16, borderWidth: 2, borderColor: '#e2e8f0', fontSize: 16, color: '#1e293b', fontWeight: '500', minHeight: 120, textAlignVertical: 'top' },
  pickerContainer: { backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 2, borderColor: '#e2e8f0', overflow: 'hidden' },
  picker: { height: 56, width: '100%', color: '#1e293b' },
  rowContainer: { flexDirection: 'row', alignItems: 'flex-end' },
  locationInputContainer: { flexDirection: 'row', alignItems: 'center' },
  locationInput: { flex: 1, marginRight: 12 },
  mapButton: { backgroundColor: '#667eea', borderRadius: 12, padding: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#667eea', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },

  // ✅ SDI PREVIEW STYLES
  sdiPreviewContainer: {
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10
  },
  sdiPreviewContent: {
    padding: 24
  },
  sdiPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  sdiPreviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 8
  },
  sdiPreviewValues: {
    alignItems: 'center'
  },
  sdiPreviewValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center'
  },
  sdiPreviewCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 4,
    textAlign: 'center'
  },

  sliderContainer: { marginBottom: 24, backgroundColor: '#f8fafc', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sliderLabel: { fontSize: 16, fontWeight: '600', color: '#374151' },
  sliderValueContainer: { alignItems: 'flex-end' },
  sliderValue: { fontSize: 18, fontWeight: '700', color: '#667eea' },
  sliderStatus: { fontSize: 14, color: '#6b7280', fontStyle: 'italic' },
  counterContainer: { marginBottom: 24, backgroundColor: '#f8fafc', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  counterContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  counterButton: { backgroundColor: '#667eea', borderRadius: 12, padding: 12, width: 48, height: 48, justifyContent: 'center', alignItems: 'center', shadowColor: '#667eea', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  counterDisplay: { alignItems: 'center', marginHorizontal: 24, minWidth: 80 },
  counterValue: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
  counterStatus: { fontSize: 14, color: '#6b7280', fontStyle: 'italic', marginTop: 4 },
  helpText: { fontSize: 14, color: '#6b7280', marginTop: 8, fontStyle: 'italic' },
  photoScrollView: { marginBottom: 16 },
  photoScrollContent: { paddingRight: 20 },
  addPhotoButton: { width: 140, height: 140, backgroundColor: '#f8fafc', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed' },
  addPhotoIcon: { backgroundColor: '#f3f4f6', borderRadius: 24, padding: 12, marginBottom: 8 },
  addPhotoText: { fontSize: 14, color: '#6b7280', fontWeight: '600', textAlign: 'center' },
  photoContainer: { width: 140, height: 140, marginRight: 16, position: 'relative' },
  photoImage: { width: '100%', height: '100%', borderRadius: 16 },
  removePhotoButton: { position: 'absolute', top: -8, right: -8, backgroundColor: '#ffffff', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  photoCountContainer: { backgroundColor: '#f0f9ff', borderRadius: 12, padding: 12, alignItems: 'center' },
  photoCountText: { fontSize: 16, color: '#0369a1', fontWeight: '600' },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 16 },
  button: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 16, gap: 8 },
  draftButton: { backgroundColor: '#f8fafc', borderWidth: 2, borderColor: '#e2e8f0' },
  submitButton: { backgroundColor: '#667eea', shadowColor: '#667eea', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  buttonText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  modalContainer: { flex: 1, backgroundColor: '#ffffff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', backgroundColor: '#ffffff' },
  modalHeaderContent: { flexDirection: 'row', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginLeft: 12 },
  closeButton: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 8 },
  map: { flex: 1 },
  mapButtonsContainer: { flexDirection: 'row', padding: 20, position: 'absolute', justifyContent: "center", bottom: 0, left: 0, right: 0, gap: 16 },
  mapButtonText: { fontSize: 16, fontWeight: '700', color: '#6b7280' },
  mapConfirmButton: { backgroundColor: '#667eea' },
  mapCancelButton: { backgroundColor: '#f3f4f6' },
});