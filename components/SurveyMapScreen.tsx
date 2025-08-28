// File: /SurveyListScreen.tsx

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// IMPOR SUPABASE
import { supabase } from './utils/supabase';

const { width } = Dimensions.get('window');

// ✅ INTERFACE YANG DIPERLUAS DENGAN FIELD BARU
interface Laporan {
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
  kategori: string;
  aksi: string;
  prioritas: number;
  tanggal: string;
  status: string;
  foto_urls: string[];
  // ✅ FIELD BARU YANG DITAMBAHKAN
  tanggal_survey?: string;
  waktu_survey?: string;
  cuaca_survey?: string;
  kondisi_drainase?: string;
  kondisi_bahu?: string;
  kondisi_markah?: string;
}

const SurveyListScreen = () => {
  const [data, setData] = useState<Laporan[]>([]);
  const [filteredData, setFilteredData] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("semua");
  const navigation = useNavigation<any>();

  // ✅ PERBAIKAN: Fetch data yang lebih optimal
  const fetchData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('laporan_jalan')
        .select('*')
        .order('tanggal', { ascending: false }); // Order by tanggal terbaru

      if (error) {
        throw error;
      }

      if (data) {
        setData(data as Laporan[]);
        setFilteredData(data as Laporan[]);
      }

    } catch (err) {
      console.error("Error fetching data:", err);
      Alert.alert("Error", "Gagal memuat data laporan");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ✅ PULL TO REFRESH
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // ✅ SEARCH & FILTER FUNCTION
  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
    filterData(text, selectedFilter);
  }, [selectedFilter, data]);

  const handleFilterChange = useCallback((filter: string) => {
    setSelectedFilter(filter);
    filterData(searchText, filter);
  }, [searchText, data]);

  const filterData = useCallback((search: string, filter: string) => {
    let filtered = [...data];

    // Filter by search text
    if (search.trim()) {
      filtered = filtered.filter(item => 
        item.nama_jalan.toLowerCase().includes(search.toLowerCase()) ||
        item.jenis_retak_dominan.toLowerCase().includes(search.toLowerCase()) ||
        item.kategori.toLowerCase().includes(search.toLowerCase())
      );
    }

    // ✅ PERBAIKAN: Filter by category sesuai 4 kategori SDI
    if (filter !== "semua") {
      filtered = filtered.filter(item => {
        switch (filter) {
          case "baik": return item.kategori.includes("Baik");
          case "sedang": return item.kategori.includes("Sedang");
          case "rusak_ringan": return item.kategori.includes("Rusak Ringan") || item.kategori.includes("Poor");
          case "rusak_berat": return item.kategori.includes("Rusak Berat") || item.kategori.includes("Bad");
          case "draft": return item.status === "draft";
          case "pending": return item.status === "pending";
          default: return true;
        }
      });
    }

    setFilteredData(filtered);
  }, [data]);

  useEffect(() => {
    fetchData();
    
    // ✅ PERBAIKAN: Set up real-time subscription untuk perubahan data
    const subscription = supabase
      .channel('laporan_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'laporan_jalan'
      }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  // Update filtered data ketika data berubah
  useEffect(() => {
    filterData(searchText, selectedFilter);
  }, [data, filterData]);

  // FUNGSI UNTUK EDIT DAN HAPUS
  const handleDelete = async (laporanId: string) => {
    try {
      const { error } = await supabase
        .from('laporan_jalan')
        .delete()
        .eq('_id', laporanId);

      if (error) {
        throw error;
      }

      Alert.alert("Berhasil", "Laporan berhasil dihapus.");
      fetchData();
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
          onPress: () => handleDelete(laporan._id),
        },
      ]
    );
  };

  const handleEdit = (laporan: Laporan) => {
    navigation.navigate("Lapor", { laporanToEdit: laporan });
  };

  const showActionSheet = (laporan: Laporan) => {
    const options = ["Batal", "Lihat Detail", "Edit", "Hapus"];
    const destructiveButtonIndex = 3;
    const cancelButtonIndex = 0;

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

  // ✅ PERBAIKAN: Warna sesuai 4 kategori SDI
  const getPriorityColor = (kategori: string): readonly [string, string] => {
    switch (kategori) {
      case "Baik (Good)": return ["#10b981", "#34d399"] as const; // Hijau - SDI < 50
      case "Sedang (Fair)": return ["#f59e0b", "#fbbf24"] as const; // Kuning - SDI 50-100
      case "Rusak Ringan (Poor)": return ["#f97316", "#fb923c"] as const; // Oranye - SDI 100-150
      case "Rusak Berat (Bad)": return ["#ef4444", "#f87171"] as const; // Merah - SDI ≥ 150
      default: return ["#9E9E9E", "#BDBDBD"] as const;
    }
  };

  // ✅ PERBAIKAN: Icon sesuai 4 kategori SDI
  const getPriorityIcon = (kategori: string) => {
    switch (kategori) {
      case "Baik (Good)": return "checkmark-circle"; // SDI < 50
      case "Sedang (Fair)": return "information-circle"; // SDI 50-100
      case "Rusak Ringan (Poor)": return "alert-circle"; // SDI 100-150
      case "Rusak Berat (Bad)": return "warning"; // SDI ≥ 150
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

  // ✅ HELPER FUNCTION UNTUK FORMAT KONDISI
  const formatConditionValue = (condition: string | undefined) => {
    if (!condition) return null;
    
    const conditionMap: { [key: string]: string } = {
      'baik': '✅',
      'sedang': '⚠️', 
      'buruk': '❌',
      'rusak': '⚠️',
      'tidak_ada': '🚫',
      'jelas': '✅',
      'pudar': '⚠️',
      'hilang': '❌',
      'cerah': '☀️',
      'berawan': '⛅',
      'hujan_ringan': '🌦️',
      'hujan_lebat': '🌧️'
    };
    
    return conditionMap[condition] || null;
  };

  // ✅ STATISTIK DATA SESUAI 4 KATEGORI SDI
  const getStatistics = () => {
    const baik = data.filter(item => item.kategori.includes("Baik")).length;
    const sedang = data.filter(item => item.kategori.includes("Sedang")).length;
    const rusakRingan = data.filter(item => 
      item.kategori.includes("Rusak Ringan") || item.kategori.includes("Poor")
    ).length;
    const rusakBerat = data.filter(item => 
      item.kategori.includes("Rusak Berat") || item.kategori.includes("Bad")
    ).length;
    
    return { baik, sedang, rusakRingan, rusakBerat };
  };

  const stats = getStatistics();

  const renderFilterButton = (title: string, value: string, icon: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === value && styles.filterButtonActive
      ]}
      onPress={() => handleFilterChange(value)}
    >
      <Ionicons 
        name={icon as any} 
        size={16} 
        color={selectedFilter === value ? "#fff" : "#667eea"} 
      />
      <Text style={[
        styles.filterButtonText,
        selectedFilter === value && styles.filterButtonTextActive
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={80} color="#ddd" />
      <Text style={styles.emptyText}>
        {searchText || selectedFilter !== "semua" 
          ? "Tidak ada hasil yang ditemukan" 
          : "Belum ada laporan"
        }
      </Text>
      <Text style={styles.emptySubtext}>
        {searchText || selectedFilter !== "semua"
          ? "Coba ubah filter atau kata kunci pencarian"
          : "Data akan muncul setelah ada laporan baru"
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ✅ ENHANCED HEADER TANPA TOTAL LAPORAN */}
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="document-text" size={28} color="#fff" />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Survei Kondisi Jalan</Text>
              <Text style={styles.headerSubtitle}>Dengan Evaluasi Jalan Surface Distress Index</Text>
            </View>
          </View>
          
          {/* ✅ STATISTIK 4 KATEGORI SDI */}
          <View style={styles.miniStats}>
            <View style={styles.miniStatItem}>
              <Text style={styles.miniStatNumber}>{stats.baik}</Text>
              <Text style={styles.miniStatLabel}>Baik</Text>
            </View>
            <View style={styles.miniStatItem}>
              <Text style={styles.miniStatNumber}>{stats.sedang}</Text>
              <Text style={styles.miniStatLabel}>Sedang</Text>
            </View>
            <View style={styles.miniStatItem}>
              <Text style={styles.miniStatNumber}>{stats.rusakRingan}</Text>
              <Text style={styles.miniStatLabel}>R. Ringan</Text>
            </View>
            <View style={styles.miniStatItem}>
              <Text style={styles.miniStatNumber}>{stats.rusakBerat}</Text>
              <Text style={styles.miniStatLabel}>R. Berat</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* ✅ SEARCH & FILTER SECTION */}
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama jalan..."
            value={searchText}
            onChangeText={handleSearch}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* ✅ FILTER 4 KATEGORI SDI + SEMUA */}
        <View style={styles.filterContainer}>
          {renderFilterButton("Semua", "semua", "apps")}
          {renderFilterButton("Baik", "baik", "checkmark-circle")}
          {renderFilterButton("Sedang", "sedang", "information-circle")}
          {renderFilterButton("R. Ringan", "rusak_ringan", "alert-circle")}
          {renderFilterButton("R. Berat", "rusak_berat", "warning")}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Memuat data...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#667eea"]}
              tintColor="#667eea"
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("SurveyDetail", { laporan: item })}
              onLongPress={() => showActionSheet(item)}
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
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.nama_jalan}
                  </Text>
                </View>
                {/* ✅ TAMBAHKAN SDI VALUE */}
                <View style={styles.sdiValueContainer}>
                  <Text style={styles.sdiValueText}>SDI</Text>
                  <Text style={styles.sdiValue}>{item.prioritas?.toFixed(0) || 'N/A'}</Text>
                </View>
              </View>

              {/* ✅ METADATA SURVEY INDICATORS */}
              {(item.cuaca_survey || item.kondisi_drainase || item.kondisi_bahu) && (
                <View style={styles.metadataContainer}>
                  {item.cuaca_survey && (
                    <View style={styles.metadataItem}>
                      <Text style={styles.metadataIcon}>
                        {formatConditionValue(item.cuaca_survey)}
                      </Text>
                    </View>
                  )}
                  {item.kondisi_drainase && (
                    <View style={styles.metadataItem}>
                      <Ionicons name="water" size={12} color="#999" />
                      <Text style={styles.metadataText}>
                        {formatConditionValue(item.kondisi_drainase)}
                      </Text>
                    </View>
                  )}
                  {item.kondisi_bahu && (
                    <View style={styles.metadataItem}>
                      <Ionicons name="trail-sign" size={12} color="#999" />
                      <Text style={styles.metadataText}>
                        {formatConditionValue(item.kondisi_bahu)}
                      </Text>
                    </View>
                  )}
                </View>
              )}

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
                    {item.tanggal_survey 
                      ? item.tanggal_survey
                      : new Date(item.tanggal).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                    }
                  </Text>
                </View>
                <View style={styles.photoIndicator}>
                  <Ionicons name="camera" size={14} color="#999" />
                  <Text style={styles.photoCount}>{item?.foto_urls?.length || 0} foto</Text>
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
    marginBottom: 16,
  },
  headerTextContainer: {
    marginLeft: 12,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
    marginTop: 2,
  },
  
  // ✅ MINI STATISTICS STYLES UNTUK 4 KATEGORI
  miniStats: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  miniStatItem: {
    alignItems: "center",
    flex: 1,
  },
  miniStatNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },
  miniStatLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
    textAlign: "center",
  },

  // ✅ SEARCH & FILTER STYLES
  searchFilterContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },
  filterContainer: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 4,
  },
  filterButtonActive: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  filterButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#667eea",
  },
  filterButtonTextActive: {
    color: "#fff",
  },

  // ✅ SDI VALUE CONTAINER
  sdiValueContainer: {
    alignItems: "center",
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sdiValueText: {
    fontSize: 8,
    color: "#667eea",
    fontWeight: "600",
  },
  sdiValue: {
    fontSize: 14,
    color: "#667eea",
    fontWeight: "800",
  },

  // ✅ METADATA STYLES
  metadataContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  metadataIcon: {
    fontSize: 12,
  },
  metadataText: {
    fontSize: 10,
    color: "#999",
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
    marginBottom: 8,
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
    paddingHorizontal: 32,
  },
});

export default SurveyListScreen;
