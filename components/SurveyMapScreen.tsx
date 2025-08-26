import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get('window');

interface Laporan {
  _id: string;
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
  jenisPerkerasan: string;
  kategori: string;
  aksi: string;
  prioritas: number;
  tanggal: string;
  status: string;
  foto: string[];
}

const SurveyListScreen = () => {
  const [data, setData] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Fungsi fetch data
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("https://klark-dev.up.railway.app/api/instance/h3fh50m/api/laporan");
      const json: Laporan[] = await response.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch data pertama kali
    fetchData();

    // Set interval untuk auto refresh setiap 0.5 detik
    const intervalId = setInterval(() => {
      fetchData();
    }, 500); // 500ms = 0.5 detik

    // Cleanup interval saat komponen di-unmount
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const getPriorityColor = (kategori: string) => {
    switch (kategori) {
      case "Baik (Good)": return ["#4CAF50", "#8BC34A"];
      case "Sedang (Fair)": return ["#FFC107", "#FFEB3B"];
      case "Rusak Ringan (Poor)": return ["#FF9800", "#FF5722"];
      case "Rusak Berat (Bad)": return ["#F44336", "#D32F2F"];
      default: return ["#9E9E9E", "#BDBDBD"];
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
      default: return "map-outline"; // Menggunakan ikon yang pasti valid
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={80} color="#ddd" />
      <Text style={styles.emptyText}>Belum ada laporan</Text>
      <Text style={styles.emptySubtext}>Data akan muncul setelah ada laporan baru</Text>
    </View>
  );

  // --- PERBAIKAN: Fungsi renderHeader dihapus sepenuhnya ---
  // const renderHeader = () => (
  //   <View style={styles.listHeader}>
  //     <View style={styles.statsContainer}>
  //       <View style={styles.statItem}>
  //         <Text style={styles.statNumber}>{data.filter(item => item.kategori === 'Baik (Good)').length}</Text>
  //         <Text style={styles.statLabel}>Baik</Text>
  //       </View>
  //       <View style={styles.statItem}>
  //         <Text style={styles.statNumber}>{data.filter(item => item.kategori === 'Sedang (Fair)').length}</Text>
  //         <Text style={styles.statLabel}>Sedang</Text>
  //       </View>
  //       <View style={styles.statItem}>
  //         <Text style={styles.statNumber}>{data.filter(item => item.kategori === 'Rusak Ringan (Poor)').length}</Text>
  //         <Text style={styles.statLabel}>Rusak Ringan</Text>
  //       </View>
  //       <View style={styles.statItem}>
  //         <Text style={styles.statNumber}>{data.filter(item => item.kategori === 'Rusak Berat (Bad)').length}</Text>
  //         <Text style={styles.statLabel}>Rusak Berat</Text>
  //       </View>
  //     </View>
  //   </View>
  // );

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
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          // --- PERBAIKAN: ListHeaderComponent dihapus ---
          // ListHeaderComponent={data.length > 0 ? renderHeader : null}
          ListEmptyComponent={renderEmptyState}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[styles.card, { transform: [{ scale: 0.98 }] }]}
              onPress={() =>
                navigation.navigate("SurveyDetail" as never, { laporan: item } as never)
              }
              activeOpacity={0.7}
            >
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Ionicons
                    name={getJenisJalanIcon(item.jenisJalan)}
                    size={20}
                    color="#667eea"
                  />
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.namaJalan}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#bbb" />
              </View>

              {/* Road Type & Damage Info */}
              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <Ionicons name="construct" size={16} color="#666" />
                  <Text style={styles.infoText}>{item.jenisRetakDominan}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="car" size={16} color="#666" />
                  <Text style={styles.infoText}>LHR: {item.volumeLHR} kendaraan/hari</Text>
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
                  <Text style={styles.photoCount}>{item.foto.length} foto</Text>
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
    // Note: Animation would require Animated API
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
  listHeader: { // Style ini tidak lagi digunakan jika renderHeader dihapus
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
  totalText: { // Style ini tidak lagi digunakan jika renderHeader dihapus
    fontSize: 18,
    fontWeight: "700",
    color: "#2d3748",
    marginBottom: 12,
    textAlign: "center",
  },
  statsContainer: { // Style ini tidak lagi digunakan jika renderHeader dihapus
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: { // Style ini tidak lagi digunakan jika renderHeader dihapus
    alignItems: "center",
  },
  statNumber: { // Style ini tidak lagi digunakan jika renderHeader dihapus
    fontSize: 20,
    fontWeight: "800",
    color: "#667eea",
  },
  statLabel: { // Style ini tidak lagi digunakan jika renderHeader dihapus
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
