import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import {
  Activity,
  AlertTriangle,
  Calculator,
  Camera,
  CheckSquare,
  Clock,
  Eye,
  LogOut,
  MapPin,
  Ruler,
  Settings,
  Target
} from 'lucide-react-native';
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get('window');

export default function Profile() {
  const [username, setUsername] = useState<string | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    const getUser = async () => {
      const savedUser = await AsyncStorage.getItem("username");
      if (savedUser) setUsername(savedUser);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("username");
    await AsyncStorage.removeItem("password");
    Alert.alert("✅ Logout berhasil");
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" as never }],
    });
  };

  // Peralatan Survei SDI (tanpa formulir SKJ dan alat tulis)
  const surveyEquipment = [
    {
      name: 'Roll Meter/Meteran',
      description: 'Mengukur panjang, lebar kerusakan (min. 30m)',
      icon: Ruler,
      color: '#10B981',
      essential: true
    },
    {
      name: 'Jangka Sorong',
      description: 'Mengukur lebar retak dengan presisi (mm)',
      icon: Target,
      color: '#8B5CF6',
      essential: true
    },
    {
      name: 'Mistar/Penggaris',
      description: 'Mengukur kedalaman bekas roda/rutting',
      icon: Calculator,
      color: '#F59E0B',
      essential: true
    },
    {
      name: 'Kamera/HP',
      description: 'Dokumentasi visual setiap jenis kerusakan',
      icon: Camera,
      color: '#EF4444',
      essential: true
    },
    {
      name: 'Cat Semprot/Pylox',
      description: 'Menandai batas segmen dan kerusakan',
      icon: Activity,
      color: '#06B6D4',
      essential: false
    },
    {
      name: 'GPS/Smartphone',
      description: 'Menentukan koordinat STA dengan akurat',
      icon: MapPin,
      color: '#F97316',
      essential: false
    }
  ];

  // Jenis Keretakan berdasarkan SE 22/SE/Db/2021
  const crackTypes = [
    {
      name: 'Retak Rambut (Hair Crack)',
      description: 'Retakan sangat halus, lebar < 1mm',
      measurement: 'Diukur panjang total, tidak mempengaruhi SDI₂',
      severity: 'Rendah',
      color: '#10B981'
    },
    {
      name: 'Retak Halus (Fine Crack)', 
      description: 'Retakan lebar 1-3mm, terlihat jelas',
      measurement: 'SDI₂ = SDI₁ (tidak ada multiplier)',
      severity: 'Sedang',
      color: '#3B82F6'
    },
    {
      name: 'Retak Sedang (Medium Crack)',
      description: 'Retakan lebar 3-5mm, mulai mengkhawatirkan',
      measurement: 'SDI₂ = SDI₁ (perlu perhatian khusus)',
      severity: 'Sedang',
      color: '#F59E0B'
    },
    {
      name: 'Retak Lebar (Wide Crack)',
      description: 'Retakan lebar > 5mm, kondisi kritis',
      measurement: 'SDI₂ = SDI₁ × 2 (penalti ganda)',
      severity: 'Tinggi',
      color: '#EF4444'
    },
    {
      name: 'Retak Kulit Buaya',
      description: 'Pola retak saling berpotongan seperti sisik',
      measurement: 'Dihitung sebagai luas total area retak',
      severity: 'Tinggi',
      color: '#DC2626'
    },
    {
      name: 'Retak Memanjang',
      description: 'Retak sejajar arah lalu lintas',
      measurement: 'Panjang × lebar rata-rata untuk luas',
      severity: 'Sedang',
      color: '#7C3AED'
    },
    {
      name: 'Retak Melintang',
      description: 'Retak tegak lurus arah lalu lintas',
      measurement: 'Lebar jalan × lebar retak untuk luas',
      severity: 'Sedang',
      color: '#059669'
    }
  ];

  // Prosedur STA (Stasiun) Survei
  const staProcess = [
    {
      step: 1,
      title: 'Penentuan Segmen',
      description: 'Bagi jalan menjadi segmen 100m (standar) atau sesuai kondisi homogen',
      detail: 'STA 0+000, 0+100, 0+200, dst. Jika ada perubahan kondisi signifikan, buat segmen baru.',
      icon: MapPin
    },
    {
      step: 2,
      title: 'Marking & Positioning',
      description: 'Tandai setiap STA dengan cat semprot dan GPS',
      detail: 'Catat koordinat setiap STA untuk referensi future surveys dan pemetaan digital.',
      icon: Target
    },
    {
      step: 3,
      title: 'Pengukuran Per Segmen',
      description: 'Ukur semua parameter SDI dalam satu segmen',
      detail: 'Luas retak, lebar retak, jumlah lubang, kedalaman rutting per 100m segmen.',
      icon: Ruler
    },
    {
      step: 4,
      title: 'Input Data ke Aplikasi',
      description: 'Masukkan hasil pengukuran langsung ke aplikasi SDI',
      detail: 'Input data real-time untuk perhitungan otomatis dan dokumentasi digital.',
      icon: Camera
    }
  ];

  // Parameter Pengukuran SDI Detail
  const measurementParams = [
    {
      param: 'SDI₁: Luas Retak (%)',
      method: 'Visual + Pengukuran',
      tools: ['Roll meter', 'Jangka sorong', 'Kamera'],
      steps: [
        'Identifikasi semua jenis retak dalam segmen 100m',
        'Ukur panjang dan lebar setiap retak individual', 
        'Hitung: Luas retak = Σ(panjang × lebar retak)',
        'Persentase = (Luas retak / Luas segmen) × 100%'
      ],
      notes: 'Pisahkan perhitungan untuk setiap jenis retak',
      color: '#EF4444'
    },
    {
      param: 'SDI₂: Lebar Retak (mm)',
      method: 'Pengukuran Presisi',
      tools: ['Jangka sorong', 'Penggaris'],
      steps: [
        'Ukur lebar setiap retak di 3 titik berbeda',
        'Ambil rata-rata lebar per retak individual',
        'Hitung rata-rata keseluruhan: Σ(lebar retak) / total retak',
        'Klasifikasi: <1mm, 1-5mm, atau >5mm untuk multiplier'
      ],
      notes: 'Retak >5mm mendapat penalty 2x lipat',
      color: '#F59E0B'
    },
    {
      param: 'SDI₃: Jumlah Lubang/km',
      method: 'Counting + Ekstrapolasi',
      tools: ['Counter manual'],
      steps: [
        'Hitung semua lubang dalam segmen 100m',
        'Definisi lubang: diameter ≥5cm, kedalaman ≥2cm',
        'Konversi: Jumlah per km = (jumlah/100m) × 1000m',
        'Klasifikasi: <10, 10-50, atau >50 lubang/km'
      ],
      notes: 'Lubang kecil (<5cm) tidak dihitung dalam SDI',
      color: '#8B5CF6'
    },
    {
      param: 'SDI₄: Kedalaman Rutting (mm)', 
      method: 'Pengukuran Langsung',
      tools: ['Mistar/straight edge', 'Penggaris'],
      steps: [
        'Letakkan mistar melintang jalur roda kendaraan',
        'Ukur kedalaman maksimum dari mistar ke permukaan',
        'Ukur minimal 5 titik per segmen 100m',
        'Rata-rata: Σ(kedalaman) / jumlah pengukuran'
      ],
      notes: 'Rutting >3cm sangat mempengaruhi nilai SDI',
      color: '#10B981'
    }
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Profil Surveyor Kota Binjai</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutIcon}>
          <LogOut size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Avatar & Info Teknisi */}
      <View style={styles.profileSection}>
        <View style={styles.avatarCard}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face" }}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.welcomeText}>Selamat datang Surveyor</Text>
        <Text style={styles.name}>{username || "Teknisi"}</Text>
      </View>

      {/* Peralatan Survei SDI */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Settings size={20} color="#2563EB" />
          <Text style={styles.sectionTitle}>Peralatan Wajib di Lapangan </Text>
        </View>
        <Text style={styles.sectionDesc}>
          Peralatan lapangan untuk survei kondisi jalan dengan metode Surface Distress Index:
        </Text>
        
        <View style={styles.equipmentGrid}>
          {surveyEquipment.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <View key={index} style={[
                styles.equipmentCard, 
                item.essential && styles.essentialCard
              ]}>
                <View style={styles.equipmentHeader}>
                  <View style={[styles.equipmentIcon, { backgroundColor: item.color + '20' }]}>
                    <IconComponent size={20} color={item.color} />
                  </View>
                  {item.essential && (
                    <View style={styles.essentialBadge}>
                      <Text style={styles.essentialText}>WAJIB</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.equipmentName}>{item.name}</Text>
                <Text style={styles.equipmentDesc}>{item.description}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Jenis-Jenis Keretakan */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AlertTriangle size={20} color="#EF4444" />
          <Text style={styles.sectionTitle}>Jenis Keretakan & Cara Ukur</Text>
        </View>
        <Text style={styles.sectionDesc}>
          Klasifikasi keretakan berdasarkan SE 22/SE/Db/2021 dan pengaruhnya terhadap perhitungan SDI:
        </Text>
        
        {crackTypes.map((crack, index) => (
          <View key={index} style={styles.crackCard}>
            <View style={styles.crackHeader}>
              <View style={[styles.severityIndicator, { backgroundColor: crack.color }]} />
              <Text style={styles.crackName}>{crack.name}</Text>
              <View style={[styles.severityBadge, { backgroundColor: crack.color + '20' }]}>
                <Text style={[styles.severityText, { color: crack.color }]}>{crack.severity}</Text>
              </View>
            </View>
            <Text style={styles.crackDescription}>{crack.description}</Text>
            <Text style={styles.crackMeasurement}>
              <Text style={styles.bold}>Pengukuran:</Text> {crack.measurement}
            </Text>
          </View>
        ))}
      </View>

      {/* Prosedur STA */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MapPin size={20} color="#10B981" />
          <Text style={styles.sectionTitle}>Prosedur Segmentasi STA</Text>
        </View>
        <Text style={styles.sectionDesc}>
          Tata cara pembagian segmen jalan (Station/STA) untuk survei SDI yang sistematis:
        </Text>
        
        <View style={styles.staContainer}>
          {staProcess.map((process, index) => {
            const IconComponent = process.icon;
            return (
              <View key={index} style={styles.staCard}>
                <View style={styles.staHeader}>
                  <View style={styles.staNumber}>
                    <Text style={styles.staNumberText}>{process.step}</Text>
                  </View>
                  <IconComponent size={24} color="#10B981" />
                </View>
                <Text style={styles.staTitle}>{process.title}</Text>
                <Text style={styles.staDescription}>{process.description}</Text>
                <Text style={styles.staDetail}>{process.detail}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Parameter Pengukuran Detail */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Calculator size={20} color="#8B5CF6" />
          <Text style={styles.sectionTitle}>Detail Pengukuran 4 Parameter SDI</Text>
        </View>
        <Text style={styles.sectionDesc}>
          Panduan praktis mengukur setiap parameter SDI sesuai standar SE 22/SE/Db/2021:
        </Text>
        
        {measurementParams.map((param, index) => (
          <View key={index} style={styles.paramCard}>
            <View style={styles.paramHeader}>
              <View style={[styles.paramIndicator, { backgroundColor: param.color }]}>
                <Text style={styles.paramNumber}>{index + 1}</Text>
              </View>
              <Text style={styles.paramName}>{param.param}</Text>
            </View>
            
            <View style={styles.paramMethod}>
              <Text style={styles.methodTitle}>Metode: {param.method}</Text>
              <View style={styles.toolsList}>
                <Text style={styles.toolsLabel}>Alat:</Text>
                {param.tools.map((tool, toolIndex) => (
                  <Text key={toolIndex} style={styles.toolItem}>• {tool}</Text>
                ))}
              </View>
            </View>
            
            <View style={styles.stepsList}>
              <Text style={styles.stepsLabel}>Langkah Pengukuran:</Text>
              {param.steps.map((step, stepIndex) => (
                <Text key={stepIndex} style={styles.stepItem}>
                  {stepIndex + 1}. {step}
                </Text>
              ))}
            </View>
            
            <View style={styles.paramNotes}>
              <Text style={styles.notesLabel}>⚠️ Catatan Penting:</Text>
              <Text style={styles.notesText}>{param.notes}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Tips Surveyor */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Eye size={20} color="#06B6D4" />
          <Text style={styles.sectionTitle}>Tips Surveyor Berpengalaman</Text>
        </View>
        
        <View style={styles.tipsCard}>
          <View style={styles.tipItem}>
            <Clock size={16} color="#10B981" />
            <Text style={styles.tipText}>
              Survei terbaik dilakukan pagi hari (07:00-10:00) dengan pencahayaan optimal
            </Text>
          </View>
          
          <View style={styles.tipItem}>
            <Camera size={16} color="#3B82F6" />
            <Text style={styles.tipText}>
              Foto dengan skala: letakkan penggaris/koin sebagai referensi ukuran
            </Text>
          </View>
          
          <View style={styles.tipItem}>
            <CheckSquare size={16} color="#8B5CF6" />
            <Text style={styles.tipText}>
              Input data langsung ke aplikasi untuk menghindari kesalahan pencatatan manual
            </Text>
          </View>
          
          <View style={styles.tipItem}>
            <Target size={16} color="#F59E0B" />
            <Text style={styles.tipText}>
              Gunakan GPS smartphone untuk backup koordinat setiap STA
            </Text>
          </View>
          
          <View style={styles.tipItem}>
            <AlertTriangle size={16} color="#EF4444" />
            <Text style={styles.tipText}>
              Perhatikan keselamatan: gunakan rompi safety dan koordinasi dengan lalu lintas
            </Text>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={18} color="#FFFFFF" />
        <Text style={styles.logoutText}>Logout dari Aplikasi</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F9FAFB" 
  },
  header: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerText: { 
    color: "#FFFFFF", 
    fontSize: 20, 
    fontWeight: "700" 
  },
  logoutIcon: {
    padding: 8,
  },
  profileSection: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  avatarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 15,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: "#2563EB",
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
    textAlign: "center",
  },
  name: { 
    fontSize: 24, 
    fontWeight: "700", 
    color: "#1F2937",
    textAlign: "center",
  },
  section: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  sectionDesc: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  equipmentCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  essentialCard: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  equipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  equipmentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  essentialBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  essentialText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
  },
  equipmentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  equipmentDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  crackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  crackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  severityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  crackName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '500',
  },
  crackDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
    lineHeight: 18,
  },
  crackMeasurement: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 16,
  },
  bold: {
    fontWeight: '600',
  },
  staContainer: {
    gap: 12,
  },
  staCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  staHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  staNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  staNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  staTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  staDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
    lineHeight: 18,
  },
  staDetail: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  paramCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paramHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  paramIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paramNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  paramName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  paramMethod: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  toolsList: {
    gap: 2,
  },
  toolsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  toolItem: {
    fontSize: 12,
    color: '#4B5563',
    marginLeft: 8,
  },
  stepsList: {
    marginBottom: 12,
  },
  stepsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  stepItem: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 4,
    lineHeight: 18,
  },
  paramNotes: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 16,
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipText: {
    fontSize: 13,
    color: '#4B5563',
    flex: 1,
    lineHeight: 18,
  },
  logoutButton: {
    backgroundColor: "#EF4444",
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoutText: { 
    color: "#FFFFFF", 
    fontWeight: "600",
    fontSize: 16,
  },
  bottomSpacing: {
    height: 32,
  },
});
