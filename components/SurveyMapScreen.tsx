import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList, // Tambahkan Alert untuk Android
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// IMPOR SUPABASE
import { supabase } from './utils/supabase';

const { width } = Dimensions.get('window');

// PERBAIKAN: Sesuaikan interface dengan skema tabel Supabase
interface Laporan {
  id: string; // id adalah primary key di Supabase
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
  kategori: string;
  aksi: string;
  prioritas: number;
  tanggal: string;
  status: string;
  foto_urls: string[]; // Menggunakan nama kolom yang sesuai
}

const SurveyListScreen = () => {
  const [data, setData] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  // PERBAIKAN: Fungsi fetch data untuk mengambil dari Supabase
  const fetchData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('laporan_jalan') // Nama tabel Anda
        .select('*'); // Ambil semua kolom

      if (error) {
        throw error;
      }

      // Pastikan data tidak null sebelum set state
      if (data) {
        setData(data as Laporan[]);
      }

    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Set interval untuk auto refresh setiap 0.5 detik
    const intervalId = setInterval(() => {
      fetchData();
    }, 500); // 500ms = 0.5 detik

    // Cleanup interval saat komponen di-unmount
    return () => clearInterval(intervalId);
  }, [fetchData]);

  // FUNGSI BARU UNTUK EDIT DAN HAPUS
  const handleDelete = async (laporanId: string) => {
    try {
      const { error } = await supabase
        .from('laporan_jalan')
        .delete()
        .eq('id', laporanId); // Hapus baris dengan ID yang sesuai

      if (error) {
        throw error;
      }

      Alert.alert("Berhasil", "Laporan berhasil dihapus.");
      fetchData(); // Muat ulang data setelah penghapusan berhasil
    } catch (err) {
      console.error("Error deleting data:", err);
      Alert.alert("Error", "Gagal menghapus laporan.");
    }
  };

  const showDeleteConfirm = (laporan: Laporan) => {
    Alert.alert(
      "Konfirmasi Hapus",
      `Apakah Anda yakin ingin menghapus laporan untuk "${laporan.nama_jalan}"?`,
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => handleDelete(laporan.id),
        },
      ]
    );
  };

  const handleEdit = (laporan: Laporan) => {
    // Navigasi ke LaporScreen dan kirim data laporan sebagai parameter
    // Di LaporScreen, Anda harus menangani data ini untuk mengisi form
    navigation.navigate("Lapor", { laporanToEdit: laporan });
  };

  const showActionSheet = (laporan: Laporan) => {
    const options = ["Batal", "Lihat Detail", "Edit", "Hapus"];
    const destructiveButtonIndex = 3; // Index for 'Hapus'
    const cancelButtonIndex = 0; // Index for 'Batal'

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          destructiveButtonIndex,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            navigation.navigate("SurveyDetail", { laporan });
          } else if (buttonIndex === 2) {
            handleEdit(laporan);
          } else if (buttonIndex === destructiveButtonIndex) {
            showDeleteConfirm(laporan);
          }
        }
      );
    } else {
      Alert.alert("Opsi Laporan", `Pilih aksi untuk laporan "${laporan.nama_jalan}"`, [
        {
          text: "Lihat Detail",
          onPress: () => navigation.navigate("SurveyDetail", { laporan }),
        },
        {
          text: "Edit",
          onPress: () => handleEdit(laporan),
        },
        {
          text: "Hapus",
          onPress: () => showDeleteConfirm(laporan),
          style: "destructive",
        },
        {
          text: "Batal",
          style: "cancel",
        },
      ]);
    }
  };


  const getPriorityColor = (kategori: string): readonly [string, string] => {
    switch (kategori) {
      case "Baik (Good)": return ["#4CAF50", "#8BC34A"] as const;
      case "Sedang (Fair)": return ["#FFC107", "#FFEB3B"] as const;
      case "Rusak Ringan (Poor)": return ["#FF9800", "#FF5722"] as const;
      case "Rusak Berat (Bad)": return ["#F44336", "#D32F2F"] as const;
      default: return ["#9E9E9E", "#BDBDBD"] as const;
    }
  };

  const getPriorityIcon = (kategori: string) => {
    switch (kategori) {
      case "Baik (Good)": return "checkmark-circle";
      case "Sedang (Fair)": return "information-circle";
      case "Rusak Ringan (Poor)": return "alert-circle";
      case "Rusak Berat (Bad)": return "warning";
      default: return "help-circle";
    }
  };

  const getJenisJalanIcon = (jenisJalan: string) => {
    switch (jenisJalan) {
      case "jalan_nasional": return "map";
      case "jalan_provinsi": return "trail-sign";
      case "jalan_kabupaten_kota": return "location";
      default: return "map-outline";
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={80} color="#ddd" />
      <Text style={styles.emptyText}>Belum ada laporan</Text>
      <Text style={styles.emptySubtext}>Data akan muncul setelah ada laporan baru</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="document-text" size={28} color="#fff" />
            <Text style={styles.headerTitle}>Survei Kondisi Jalan</Text>
          </View>
          <View style={styles.refreshIndicator}>
            <View style={styles.pulseContainer}>
              <View style={styles.pulse} />
              <Ionicons name="refresh" size={16} color="#fff" />
            </View>
            <Text style={styles.refreshText}>Live Update</Text>
          </View>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Memuat data...</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("SurveyDetail", { laporan: item })}
              onLongPress={() => showActionSheet(item)} // Tambahkan onLongPress di sini
              activeOpacity={0.7}
            >
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Ionicons
                    name={getJenisJalanIcon(item.jenis_jalan)}
                    size={20}
                    color="#667eea"
                  />
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.nama_jalan}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#bbb" />
              </View>

              {/* Road Type & Damage Info */}
              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <Ionicons name="construct" size={16} color="#666" />
                  <Text style={styles.infoText}>{item.jenis_retak_dominan}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="car" size={16} color="#666" />
                  <Text style={styles.infoText}>LHR: {item.volume_lhr} kendaraan/hari</Text>
                </View>
              </View>

              {/* Priority Badge */}
              <LinearGradient
                colors={getPriorityColor(item.kategori)}
                style={styles.priorityBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons
                  name={getPriorityIcon(item.kategori)}
                  size={16}
                  color="#fff"
                />
                <Text style={styles.priorityText}>{item.kategori}</Text>
              </LinearGradient>

              {/* Card Footer */}
              <View style={styles.cardFooter}>
                <View style={styles.dateContainer}>
                  <Ionicons name="calendar" size={14} color="#999" />
                  <Text style={styles.dateText}>
                    {new Date(item.tanggal).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
                <View style={styles.photoIndicator}>
                  <Ionicons name="camera" size={14} color="#999" />
                  <Text style={styles.photoCount}>{item?.foto_urls?.length} foto</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc"
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  refreshIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  pulseContainer: {
    position: "relative",
    marginRight: 8,
  },
  pulse: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    left: -2,
    top: -2,
  },
  refreshText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#667eea",
    fontWeight: "500",
  },
  listContainer: {
    padding: 16,
  },
  listHeader: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2d3748",
    marginBottom: 12,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#667eea",
  },
  statLabel: {
    fontSize: 10,
    color: "#666",
    marginTop: 2,
    textAlign: "center",
  },
  separator: {
    height: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.1)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2d3748",
    marginLeft: 8,
    flex: 1,
  },
  cardContent: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  priorityText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    color: "#999",
    marginLeft: 4,
  },
  photoIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  photoCount: {
    fontSize: 12,
    color: "#999",
    marginLeft: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#bbb",
    marginTop: 8,
    textAlign: "center",
  },
});

export default SurveyListScreen;