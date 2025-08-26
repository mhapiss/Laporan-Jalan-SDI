// app/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// IMPOR SUPABASE
import { supabase } from './utils/supabase';

const { width } = Dimensions.get('window');

// Definisikan tipe untuk navigasi
type RootStackParamList = {
  Home: undefined;
  PetaList: { laporanData: LaporanData[] };
  SurveyMap: { laporan: LaporanData };
};

// PERBAIKAN: Sesuaikan interface dengan skema tabel Supabase
interface LaporanData {
  id: string;
  nama_jalan: string;
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
  foto_urls: string[]; // Menggunakan nama kolom yang sesuai
  prioritas: number;
  kategori: string;
  aksi: string;
  tanggal: string;
  status: string;
}

interface KondisiStats {
  total: number;
  baik: number; // Kategori "Baik (Good)"
  sedang: number; // Kategori "Sedang (Fair)"
  rusakRingan: number; // Kategori "Rusak Ringan (Poor)"
  rusakBerat: number; // Kategori "Rusak Berat (Bad)"
}

export default function HomeScreen() {
  const [laporanData, setLaporanData] = useState<LaporanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Home'>>();

  // PERBAIKAN: Gunakan klien Supabase untuk mengambil data
  const fetchLaporanData = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('laporan_jalan') // Nama tabel Anda di Supabase
        .select('*');

      if (error) {
        throw error;
      }

      if (data) {
        setLaporanData(data as LaporanData[]);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLaporanData();
  }, []);

  // PERBAIKAN: Hitung statistik berdasarkan kategori baru
  const calculateStats = (): KondisiStats => {
    const stats: KondisiStats = {
      total: laporanData.length,
      baik: 0,
      sedang: 0,
      rusakRingan: 0,
      rusakBerat: 0,
    };

    laporanData.forEach((laporan) => {
      const kategori = laporan.kategori.toLowerCase();
      if (kategori.includes("baik")) stats.baik++;
      else if (kategori.includes("sedang")) stats.sedang++;
      else if (kategori.includes("rusak ringan")) stats.rusakRingan++;
      else if (kategori.includes("rusak berat")) stats.rusakBerat++;
    });

    return stats;
  };

  const stats = calculateStats();

  // PERBAIKAN: Perbarui data card
  const cards = [
    {
      icon: "document-text",
      color: "#6c5ce7",
      title: "Total Laporan",
      value: `${stats.total} Laporan`,
      onPress: () => { },
    },
    {
      icon: "checkmark-circle",
      color: "#2ecc71", // Hijau
      title: "Kondisi Baik",
      value: `${stats.baik} Laporan`,
      onPress: () => { },
    },
    {
      icon: "information-circle",
      color: "#f1c40f", // Kuning
      title: "Kondisi Sedang",
      value: `${stats.sedang} Laporan`,
      onPress: () => { },
    },
    {
      icon: "alert-circle",
      color: "#e67e22", // Oranye
      title: "Rusak Ringan",
      value: `${stats.rusakRingan} Laporan`,
      onPress: () => { },
    },
    {
      icon: "warning",
      color: "#e74c3c", // Merah
      title: "Rusak Berat",
      value: `${stats.rusakBerat} Laporan`,
      onPress: () => { },
    },
  ];

  // PERBAIKAN: Perbarui data chart
  const chartData = [
    { value: stats.baik, color: "#2ecc71", text: "Baik" },
    { value: stats.sedang, color: "#f1c40f", text: "Sedang" },
    { value: stats.rusakRingan, color: "#e67e22", text: "Ringan" },
    { value: stats.rusakBerat, color: "#e74c3c", text: "Berat" },
  ].filter((item) => item.value > 0);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <StatusBar barStyle="light-content" backgroundColor="#6c5ce7" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6c5ce7" />
          <Text style={styles.loadingText}>Memuat data...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <StatusBar barStyle="light-content" backgroundColor="#e74c3c" />
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={64} color="#e74c3c" />
          <Text style={styles.errorTitle}>Terjadi Kesalahan</Text>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchLaporanData}>
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#6c5ce7" />

      {/* Header Section - Diperkecil */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Evaluasi Kondisi Jalan Raya</Text>
        <Text style={styles.headerSubtitle}>Metode SDI</Text>

        {/* Refresh */}
        <TouchableOpacity style={styles.refreshButton} onPress={fetchLaporanData}>
          <Ionicons name="refresh" size={18} color="#6c5ce7" />
          <Text style={styles.refreshText}>Refresh Data</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Cards */}
          <View style={styles.cardsSection}>
            <Text style={styles.sectionTitle}>📊 Dashboard Statistik</Text>
            <View style={styles.grid}>
              {cards.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.card, { backgroundColor: item.color }]}
                  onPress={item.onPress}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardIconContainer}>
                    <Ionicons name={item.icon as any} size={24} color="white" />
                  </View>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  {item.value !== "" && <Text style={styles.cardValue}>{item.value}</Text>}
                  <View style={styles.cardGlow} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Chart - Diganti dengan Bar Chart */}
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>📊 Diagram Kondisi Jalan</Text>
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Kondisi Jalan</Text>
              {chartData.length > 0 ? (
                <View style={styles.chartContent}>
                  {/* Bar Chart Custom */}
                  <View style={styles.barChart}>
                    {chartData.map((item, idx) => {
                      const maxValue = Math.max(...chartData.map(d => d.value));
                      const barHeight = maxValue > 0 ? (item.value / maxValue) * 120 : 0;

                      return (
                        <View key={idx} style={styles.barContainer}>
                          <View style={styles.barWrapper}>
                            <View
                              style={[
                                styles.bar,
                                {
                                  height: barHeight,
                                  backgroundColor: item.color
                                }
                              ]}
                            />
                          </View>
                          <Text style={styles.barValue}>{item.value}</Text>
                          <Text style={styles.barLabel}>{item.text}</Text>
                        </View>
                      );
                    })}
                  </View>

                  {/* Summary */}
                  <View style={styles.chartSummary}>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Total Laporan</Text>
                      <Text style={styles.summaryValue}>{stats.total}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Kondisi Terparah</Text>
                      <Text style={styles.summaryValue}>
                        {Math.max(stats.rusakBerat, stats.rusakRingan, stats.sedang, stats.baik)}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.noDataContainer}>
                  <View style={styles.noDataIconContainer}>
                    <Ionicons name="document" size={48} color="#ccc" />
                  </View>
                  <Text style={styles.noDataText}>Tidak ada data untuk ditampilkan</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  // Header diperkecil
  headerSection: {
    backgroundColor: "#6c5ce7",
    paddingTop: 45,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 6,
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#f8fafc"
  },
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc"
  },

  // Loading Styles
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#374151",
    fontWeight: '600'
  },

  // Error Styles
  errorContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 16,
    marginHorizontal: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 12,
    marginBottom: 6,
  },
  errorText: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 18,
  },

  // Header Styles - diperkecil
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    color: 'white',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: "center",
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    marginBottom: 16,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  refreshText: {
    marginLeft: 6,
    color: "#6c5ce7",
    fontWeight: "600",
    fontSize: 13,
  },

  // Section Styles
  cardsSection: {
    marginBottom: 28,
  },
  chartSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 14,
    letterSpacing: 0.3,
  },

  // Card Styles
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  card: {
    width: (width - 50) / 2,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    minHeight: 110,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  cardIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 6,
    lineHeight: 14,
  },
  cardValue: {
    color: "white",
    fontSize: 13,
    fontWeight: '600',
    textAlign: "center",
  },
  cardGlow: {
    position: 'absolute',
    top: -25,
    right: -25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // Chart Styles - Bar Chart
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
    color: '#1f2937',
    textAlign: 'center',
  },
  chartContent: {
    alignItems: 'center',
  },

  // Bar Chart Custom
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    width: '100%',
    height: 160,
    marginBottom: 20,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  barWrapper: {
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '80%',
  },
  bar: {
    width: '100%',
    borderRadius: 6,
    minHeight: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  barValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 8,
  },
  barLabel: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 12,
  },

  // Chart Summary
  chartSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },

  // Retry Button
  retryButton: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },

  // No Data Styles
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  noDataIconContainer: {
    backgroundColor: '#f3f4f6',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  noDataText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    fontWeight: '500',
  },
});