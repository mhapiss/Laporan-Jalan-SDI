// File: /SurveyDetailScreen.tsx

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text, // Pastikan Text diimpor
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

const { width } = Dimensions.get("window");

interface Laporan {
  _id: string;
  namaJalan: string;
  Keterangan: string; // Tambah Keterangan
  lokasi: string;
  jenisJalan: string;
  staAwal: string; // Tambah staAwal
  staAkhir: string; // Tambah staAkhir
  jenisRetakDominan: string;
  luasRetak: number; // Tambah luasRetak
  lebarRetak: number; // Tambah lebarRetak
  jumlahLubang: number; // Tambah jumlahLubang
  alurRoda: number; // Tambah alurRoda
  volumeLHR: string;
  sumberData: string; // Tambah sumberData
  // umur: string; // DIHAPUS: Umur Perkerasan
  jenisPerkerasan: string;
  kategori: string;
  aksi: string;
  prioritas: number;
  tanggal: string;
  status: string;
  foto: string[];
}

const SurveyDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { laporan } = route.params as { laporan: Laporan };

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  useEffect(() => {
    if (laporan.lokasi) {
      const [latitude, longitude] = laporan.lokasi.split(",").map((c) => parseFloat(c.trim()));
      if (!isNaN(latitude) && !isNaN(longitude)) {
        setLat(latitude);
        setLng(longitude);
      }
    }
  }, [laporan.lokasi]);

  const openInMaps = () => {
    if (lat && lng) {
      const url = Platform.select({
        ios: `maps:${lat},${lng}?q=${laporan.namaJalan}`,
        android: `geo:${lat},${lng}?q=${laporan.namaJalan}`,
      });
      if (url) Linking.openURL(url).catch(() => Alert.alert("Error", "Tidak bisa buka maps"));
    }
  };

  const mapHtml = (lat: number, lng: number) => `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css"/>
        <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
        <style>#map{height:100vh;width:100%;margin:0;padding:0;}body{margin:0;}</style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([${lat}, ${lng}], 16);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
          L.marker([${lat}, ${lng}]).addTo(map).bindPopup('${laporan.namaJalan}').openPopup();
        </script>
      </body>
    </html>
  `;

  // Helper function untuk mendapatkan teks bantuan (dari LaporScreen)
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
      default:
        return '';
    }
  };

  // Fungsi untuk menjelaskan perhitungan SDI
  const explainSDICalculation = (laporan: Laporan) => {
    let sdiTotal = 0;
    let sdi1 = 0;
    let sdi2 = 0;
    let sdi3 = 0;
    let sdi4 = 0;

    const steps = [];

    // 1. Perhitungan SDI1 (Persentase Luas Retak)
    if (laporan.luasRetak === 0) {
      sdi1 = 0;
      steps.push(`1. SDI1 (Luas Retak ${laporan.luasRetak}%): Tidak ada retak, SDI1 = 0.`);
    } else if (laporan.luasRetak < 10) {
      sdi1 = 5;
      steps.push(`1. SDI1 (Luas Retak ${laporan.luasRetak}%): Luas retak < 10%, SDI1 = 5.`);
    } else if (laporan.luasRetak >= 10 && laporan.luasRetak <= 30) {
      sdi1 = 20;
      steps.push(`1. SDI1 (Luas Retak ${laporan.luasRetak}%): Luas retak 10-30%, SDI1 = 20.`);
    } else if (laporan.luasRetak > 30) {
      sdi1 = 40;
      steps.push(`1. SDI1 (Luas Retak ${laporan.luasRetak}%): Luas retak > 30%, SDI1 = 40.`);
    }
    sdiTotal = sdi1;
    steps.push(`   SDI Total saat ini: ${sdiTotal}`);

    // 2. Perhitungan SDI2 (Lebar Retak Rata-rata)
    if (laporan.lebarRetak > 3) {
      sdi2 = sdi1 * 2;
      steps.push(`2. SDI2 (Lebar Retak ${laporan.lebarRetak}mm): Lebar retak > 3mm, SDI1 (${sdi1}) dikali 2. SDI2 = ${sdi2}.`);
    } else {
      sdi2 = sdi1;
      steps.push(`2. SDI2 (Lebar Retak ${laporan.lebarRetak}mm): Lebar retak <= 3mm, SDI2 = SDI1 (${sdi2}).`);
    }
    sdiTotal = sdi2;
    steps.push(`   SDI Total saat ini: ${sdiTotal}`);

    // 3. Perhitungan SDI3 (Jumlah Lubang per Kilometer)
    let additionalSDI3 = 0;
    if (laporan.jumlahLubang > 50) {
      additionalSDI3 = 225;
      steps.push(`3. SDI3 (Jumlah Lubang ${laporan.jumlahLubang}/km): Jumlah lubang > 50/km, ditambah 225.`);
    } else if (laporan.jumlahLubang >= 10 && laporan.jumlahLubang <= 50) {
      additionalSDI3 = 75;
      steps.push(`3. SDI3 (Jumlah Lubang ${laporan.jumlahLubang}/km): Jumlah lubang 10-50/km, ditambah 75.`);
    } else if (laporan.jumlahLubang > 0 && laporan.jumlahLubang < 10) {
      additionalSDI3 = 15;
      steps.push(`3. SDI3 (Jumlah Lubang ${laporan.jumlahLubang}/km): Jumlah lubang < 10/km, ditambah 15.`);
    } else {
      steps.push(`3. SDI3 (Jumlah Lubang ${laporan.jumlahLubang}/km): Tidak ada lubang, tidak ada penambahan.`);
    }
    sdi3 = sdi2 + additionalSDI3;
    sdiTotal = sdi3;
    steps.push(`   SDI Total saat ini: ${sdiTotal}`);

    // 4. Perhitungan SDI4 (Kedalaman Bekas Roda Rata-rata)
    let additionalSDI4 = 0;
    if (laporan.alurRoda > 3) {
      additionalSDI4 = 20;
      steps.push(`4. SDI4 (Alur Roda ${laporan.alurRoda}cm): Alur roda > 3cm, ditambah 20.`);
    } else if (laporan.alurRoda >= 1 && laporan.alurRoda <= 3) {
      additionalSDI4 = 10;
      steps.push(`4. SDI4 (Alur Roda ${laporan.alurRoda}cm): Alur roda 1-3cm, ditambah 10.`);
    } else if (laporan.alurRoda > 0 && laporan.alurRoda < 1) {
      additionalSDI4 = 2.5;
      steps.push(`4. SDI4 (Alur Roda ${laporan.alurRoda}cm): Alur roda < 1cm, ditambah 2.5.`);
    } else {
      steps.push(`4. SDI4 (Alur Roda ${laporan.alurRoda}cm): Tidak ada alur roda, tidak ada penambahan.`);
    }
    sdi4 = sdi3 + additionalSDI4;
    sdiTotal = sdi4;
    steps.push(`   SDI Total akhir: ${sdiTotal.toFixed(2)}`);

    let kategoriAksi = "";
    let kategoriKondisi = "";

    // Update SDI category and action based on the provided table
    if (sdiTotal < 50) {
      kategoriKondisi = "Baik (Good)";
      kategoriAksi = "Pemeliharaan rutin; pembersihan, penutupan retak kecil, pemeriksaan berkala.";
    } else if (sdiTotal >= 50 && sdiTotal < 100) {
      kategoriKondisi = "Sedang (Fair)";
      kategoriAksi = "Pemeliharaan rutin intensif dan pemeliharaan berkala; penutupan retak, pengisian lubang kecil, overlay tipis.";
    } else if (sdiTotal >= 100 && sdiTotal < 150) {
      kategoriKondisi = "Rusak Ringan (Poor)";
      kategoriAksi = "Perbaikan terfokus; penambalan lubang/lapis tambal, perbaikan struktural ringan, overlay atau perkerasan ulang sebagian.";
    } else { // sdiTotal >= 150
      kategoriKondisi = "Rusak Berat (Bad)";
      kategoriAksi = "Rehabilitasi mayor atau rekonstruksi; penggantian lapisan permukaan/struktural secara menyeluruh untuk memulihkan kondisi jalan.";
    }
    steps.push(`\nBerdasarkan SDI Total ${sdiTotal.toFixed(2)}, Kategori: ${kategoriKondisi}, Aksi: ${kategoriAksi}`);

    return steps;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#667eea", "#4a55e5"]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Laporan</Text>
        <View style={{ width: 24 }} /> {/* Placeholder for alignment */}
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          {/* Basic Info Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={24} color="#667eea" />
              <Text style={styles.sectionTitle}>Informasi Dasar</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Nama Jalan:</Text>
              <Text style={styles.detailValue}>{laporan.namaJalan}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Jenis Jalan:</Text>
              <Text style={styles.detailValue}>{laporan.jenisJalan}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>STA Awal:</Text>
              <Text style={styles.detailValue}>{laporan.staAwal}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>STA Akhir:</Text>
              <Text style={styles.detailValue}>{laporan.staAkhir}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Tanggal Laporan:</Text>
              <Text style={styles.detailValue}>{new Date(laporan.tanggal).toLocaleDateString()}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Status Laporan:</Text>
              <Text style={styles.detailValue}>{laporan.status}</Text>
            </View>
          </View>

          {/* Lokasi Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={24} color="#667eea" />
              <Text style={styles.sectionTitle}>Lokasi</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Koordinat GPS:</Text>
              <Text style={styles.detailValue}>{laporan.lokasi}</Text>
            </View>
            <View style={styles.mapWrapper}>
              {lat && lng ? (
                <WebView source={{ html: mapHtml(lat, lng) }} style={styles.map} />
              ) : (
                <Text style={styles.noLocationText}>Tidak ada lokasi yang tersedia.</Text>
              )}
            </View>
            <TouchableOpacity onPress={openInMaps} style={styles.mapButton}>
              <Ionicons name="navigate" size={20} color="#ffffff" />
              <Text style={styles.mapButtonText}>Buka di Google Maps</Text>
            </TouchableOpacity>
          </View>

          {/* Damage Assessment Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="warning" size={24} color="#667eea" />
              <Text style={styles.sectionTitle}>Penilaian Kerusakan</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Jenis Retak Dominan:</Text>
              <Text style={styles.detailValue}>{laporan.jenisRetakDominan}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Luas Retak:</Text>
              <Text style={styles.detailValue}>{laporan.luasRetak}% ({getHelpText('luasRetak', laporan.luasRetak)})</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Lebar Retak:</Text>
              <Text style={styles.detailValue}>{laporan.lebarRetak.toFixed(1)} mm ({getHelpText('lebarRetak', laporan.lebarRetak)})</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Jumlah Lubang:</Text>
              <Text style={styles.detailValue}>{laporan.jumlahLubang} per km ({getHelpText('jumlahLubang', laporan.jumlahLubang)})</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Alur Roda:</Text>
              <Text style={styles.detailValue}>{laporan.alurRoda.toFixed(1)} cm ({getHelpText('alurRoda', laporan.alurRoda)})</Text>
            </View>
          </View>

          {/* Traffic & Technical Data Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              {/* Changed 'road' to 'car' as 'road' is not a valid Ionicons name */}
              <Ionicons name="car" size={24} color="#667eea" />
              <Text style={styles.sectionTitle}>Data Teknis & Lalu Lintas</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Volume LHR:</Text>
              <Text style={styles.detailValue}>{laporan.volumeLHR} kendaraan/hari</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Sumber Data:</Text>
              <Text style={styles.detailValue}>{laporan.sumberData}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Jenis Perkerasan:</Text>
              <Text style={styles.detailValue}>{laporan.jenisPerkerasan}</Text>
            </View>
          </View>

          {/* Prioritas & Aksi Section */}
          <LinearGradient colors={["#667eea", "#4a55e5"]} style={styles.priorityGradient}>
            <View style={styles.sectionHeaderWhite}>
              <Ionicons name="analytics" size={24} color="#ffffff" />
              <Text style={styles.sectionTitleWhite}>Hasil Prioritas</Text>
            </View>
            <View style={styles.detailItemWhite}>
              <Text style={styles.detailLabelWhite}>Skor SDI:</Text>
              <Text style={styles.detailValueWhite}>{laporan.prioritas.toFixed(2)}</Text>
            </View>
            <View style={styles.detailItemWhite}>
              <Text style={styles.detailLabelWhite}>Kategori:</Text>
              {/* Display the category based on the SDI calculation logic */}
              <Text style={styles.detailValueWhite}>
                {(() => {
                  const sdiTotal = laporan.prioritas; // Assuming laporan.prioritas is the calculated SDI
                  if (sdiTotal < 50) return "Baik (Good)";
                  if (sdiTotal >= 50 && sdiTotal < 100) return "Sedang (Fair)";
                  if (sdiTotal >= 100 && sdiTotal < 150) return "Rusak Ringan (Poor)";
                  return "Rusak Berat (Bad)";
                })()}
              </Text>
            </View>
            <View style={styles.detailItemWhite}>
              <Text style={styles.detailLabelWhite}>Aksi Rekomendasi:</Text>
              {/* Display the action based on the SDI calculation logic */}
              <Text style={styles.detailValueWhite}>
                {(() => {
                  const sdiTotal = laporan.prioritas; // Assuming laporan.prioritas is the calculated SDI
                  if (sdiTotal < 50) return "Pemeliharaan rutin; pembersihan, penutupan retak kecil, pemeriksaan berkala.";
                  if (sdiTotal >= 50 && sdiTotal < 100) return "Pemeliharaan rutin intensif dan pemeliharaan berkala; penutupan retak, pengisian lubang kecil, overlay tipis.";
                  if (sdiTotal >= 100 && sdiTotal < 150) return "Perbaikan terfokus; penambalan lubang/lapis tambal, perbaikan struktural ringan, overlay atau perkerasan ulang sebagian.";
                  return "Rehabilitasi mayor atau rekonstruksi; penggantian lapisan permukaan/struktural secara menyeluruh untuk memulihkan kondisi jalan.";
                })()}
              </Text>
            </View>
          </LinearGradient>

          {/* SDI Calculation Explanation Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calculator" size={24} color="#667eea" />
              <Text style={styles.sectionTitle}>Alur Perhitungan SDI</Text>
            </View>
            {explainSDICalculation(laporan).map((step, index) => (
              <Text key={index} style={styles.calculationStep}>
                {step}
              </Text>
            ))}
          </View>

          {/* Photo Section */}
          {laporan.foto?.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Ionicons name="camera" size={24} color="#667eea" />
                <Text style={styles.sectionTitle}>Dokumentasi Foto</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScrollView}>
                <View style={styles.photoScrollContent}>
                  {laporan.foto.map((f, idx) => (
                    <View key={idx} style={styles.photoContainer}>
                      <Image source={{ uri: f }} style={styles.photoImage} />
                    </View>
                  ))}
                </View>
              </ScrollView>
              <View style={styles.photoCountContainer}>
                <Text style={styles.photoCountText}>📷 {laporan.foto.length} foto</Text>
              </View>
            </View>
          )}

          {/* Additional Notes Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={24} color="#667eea" />
              <Text style={styles.sectionTitle}>Keterangan Tambahan</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Observasi & Informasi Tambahan:</Text>
              <Text style={styles.detailValue}>{laporan.Keterangan || "Tidak ada keterangan tambahan."}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollView: { flex: 1 },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },

  sectionContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginTop: 24, // Use marginTop instead of margin for consistency
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
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4b5563',
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  mapWrapper: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  map: { flex: 1 },
  noLocationText: {
    textAlign: 'center',
    marginTop: 80,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  mapButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: 'center',
    backgroundColor: '#667eea',
    padding: 14,
    borderRadius: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    gap: 8,
  },
  mapButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },

  priorityGradient: {
    marginTop: 24,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  sectionHeaderWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  sectionTitleWhite: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 12,
  },
  detailItemWhite: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  detailLabelWhite: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e0e7ff',
    flex: 1,
  },
  detailValueWhite: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },

  calculationStep: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },

  photoScrollView: {
    marginBottom: 16,
  },
  photoScrollContent: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  photoContainer: {
    width: 140,
    height: 140,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoCountContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  photoCountText: {
    fontSize: 16,
    color: '#0369a1',
    fontWeight: '600',
  },
});

export default SurveyDetailScreen;