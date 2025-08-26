import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import {
  Activity,
  ArrowDown,
  ArrowRight,
  BarChart3,
  Bell,
  Calculator,
  CheckCircle,
  Eye,
  FileText,
  Layers,
  MapPin,
  Search,
  Settings,
  Target,
  User
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const [username, setUsername] = useState<string>('Pengguna');
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('username');
      if (savedUser) setUsername(savedUser);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // SDI Parameters berdasarkan SE 22/SE/Db/2021
  const sdiParameters = [
    {
      name: 'SDI₁: Persentase Luas Retak',
      description: 'Persentase luas area retak terhadap total luas segmen jalan',
      formula: '(Luas retak / Total luas segmen) × 100%',
      criteria: [
        { range: 'None', value: '0', color: '#10B981' },
        { range: '< 10%', value: '5', color: '#3B82F6' },
        { range: '10% - 30%', value: '20', color: '#F59E0B' },
        { range: '> 30%', value: '40', color: '#EF4444' }
      ],
      icon: Activity,
      color: '#EF4444'
    },
    {
      name: 'SDI₂: Rata-rata Lebar Retak',
      description: 'Lebar retak rata-rata pada segmen jalan yang diamati',
      formula: 'Σ(lebar retak) / jumlah retak (mm)',
      criteria: [
        { range: 'None', value: '-', color: '#10B981' },
        { range: 'Fine < 1mm', value: 'SDI₁', color: '#3B82F6' },
        { range: 'Medium 1-5mm', value: 'SDI₁', color: '#F59E0B' },
        { range: 'Wide > 5mm', value: 'SDI₁ × 2', color: '#EF4444' }
      ],
      icon: BarChart3,
      color: '#F59E0B'
    },
    {
      name: 'SDI₃: Jumlah Lubang per KM',
      description: 'Total jumlah lubang per kilometer jalan yang disurvei',
      formula: '(Total lubang / panjang segmen) × 1000m',
      criteria: [
        { range: 'None', value: '-', color: '#10B981' },
        { range: '< 10/km', value: 'SDI₂ + 15', color: '#3B82F6' },
        { range: '10-50/km', value: 'SDI₂ + 75', color: '#F59E0B' },
        { range: '> 50/km', value: 'SDI₂ + 225', color: '#EF4444' }
      ],
      icon: MapPin,
      color: '#8B5CF6'
    },
    {
      name: 'SDI₄: Kedalaman Bekas Roda',
      description: 'Kedalaman rutting rata-rata akibat beban lalu lintas',
      formula: 'Rata-rata kedalaman alur bekas roda (mm)',
      criteria: [
        { range: 'None', value: '-', color: '#10B981' },
        { range: '< 1cm', value: 'SDI₃ + 5×0.5', color: '#3B82F6' },
        { range: '1-3cm', value: 'SDI₃ + 5×2', color: '#F59E0B' },
        { range: '> 3cm', value: 'SDI₃ + 5×5', color: '#EF4444' }
      ],
      icon: Layers,
      color: '#10B981'
    }
  ];

  // Fuzzy Logic Process Diagram
  const fuzzySteps = [
    {
      step: 1,
      title: 'Input Data Survei',
      description: 'Pengumpulan data lapangan 4 parameter SDI',
      details: 'Pengukuran visual dan dimensional kerusakan jalan',
      icon: Eye,
      color: '#3B82F6'
    },
    {
      step: 2,
      title: 'Fuzzifikasi',
      description: 'Konversi data crisp ke himpunan fuzzy',
      details: 'Transformasi nilai terukur menjadi derajat keanggotaan (0-1)',
      icon: Calculator,
      color: '#8B5CF6'
    },
    {
      step: 3,
      title: 'Inference Engine',
      description: 'Penerapan rule-based fuzzy logic',
      details: 'Evaluasi aturan IF-THEN berdasarkan knowledge base',
      icon: Settings,
      color: '#F59E0B'
    },
    {
      step: 4,
      title: 'Defuzzifikasi',
      description: 'Konversi output fuzzy ke nilai SDI',
      details: 'Metode Centroid menghasilkan nilai SDI final (0-400+)',
      icon: Target,
      color: '#10B981'
    }
  ];

  // SDI Classification berdasarkan SE 22/SE/Db/2021
  const sdiClassification = [
    { 
      range: '< 50', 
      condition: 'Baik (B)', 
      action: 'Pemeliharaan Rutin', 
      description: 'Kondisi jalan masih sangat layak dan aman',
      color: '#10B981',
      percentage: '0-12.5%' 
    },
    { 
      range: '50 - 100', 
      condition: 'Sedang (S)', 
      action: 'Pemeliharaan Rutin', 
      description: 'Mulai ada kerusakan ringan yang perlu perhatian',
      color: '#3B82F6',
      percentage: '12.5-25%' 
    },
    { 
      range: '100 - 150', 
      condition: 'Rusak Ringan (RR)', 
      action: 'Pemeliharaan Berkala', 
      description: 'Kerusakan cukup signifikan, perlu tindakan segera',
      color: '#F59E0B',
      percentage: '25-37.5%' 
    },
    { 
      range: '> 150', 
      condition: 'Rusak Berat (RB)', 
      action: 'Rekonstruksi/Rehabilitasi', 
      description: 'Kerusakan parah, perlu perbaikan struktural',
      color: '#EF4444',
      percentage: '37.5%+' 
    }
  ];

  // Tahapan Survei berdasarkan SE 22/SE/Db/2021
  const surveySteps = [
    {
      step: 'A',
      title: 'Persiapan Survei',
      tasks: [
        'Persiapan peralatan survei (meteran, kamera, form)',
        'Penentuan segmentasi jalan (umumnya 100m)',
        'Koordinasi dengan pihak terkait untuk keselamatan survei'
      ]
    },
    {
      step: 'B', 
      title: 'Pelaksanaan Survei Visual',
      tasks: [
        'Identifikasi jenis kerusakan (retak, lubang, rutting)',
        'Pengukuran dimensi kerusakan (panjang, lebar, kedalaman)',
        'Dokumentasi fotografi setiap jenis kerusakan',
        'Pencatatan data dalam form survei terstandar'
      ]
    },
    {
      step: 'C',
      title: 'Pengolahan Data SDI',
      tasks: [
        'Input data ke sistem perhitungan SDI',
        'Aplikasi metode fuzzy logic untuk analisis',
        'Verifikasi hasil perhitungan SDI',
        'Penentuan klasifikasi kondisi jalan'
      ]
    },
    {
      step: 'D',
      title: 'Rekomendasi Penanganan',
      tasks: [
        'Analisis prioritas penanganan berdasarkan nilai SDI',
        'Penentuan jenis penanganan yang sesuai',
        'Estimasi biaya pemeliharaan/rehabilitasi',
        'Penyusunan laporan hasil survei'
      ]
    }
  ];

  const handleNotificationPress = () => {
    Alert.alert('Notifikasi', 'Sistem SDI Fuzzy Logic - Tidak ada notifikasi baru');
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile' as never);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.greeting}>Selamat Datang</Text>
              <Text style={styles.userName}>{username}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={handleNotificationPress}>
              <Bell size={22} color="#FFFFFF" />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleProfilePress}>
              <User size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.searchBar}>
          <Search size={20} color="#9CA3AF" />
          <Text style={styles.searchText}>Cari informasi SDI & Fuzzy Logic...</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* SDI Overview - SE 22/SE/Db/2021 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Surface Distress Index (SDI)</Text>
          <View style={styles.overviewCard}>
            <View style={styles.regulationHeader}>
              <FileText size={20} color="#2563EB" />
              <Text style={styles.regulationText}>
                SE Dirjen Bina Marga No. 22/SE/Db/2021
              </Text>
            </View>
            <Text style={styles.overviewDescription}>
              **Surface Distress Index (SDI)** adalah metode penilaian kondisi jalan berdasarkan **pengamatan visual** kerusakan permukaan perkerasan jalan yang mengintegrasikan **4 parameter kunci** untuk menghasilkan indeks numerik kondisi jalan[25][32].
            </Text>
            
            <View style={styles.keyFeatures}>
              <View style={styles.featureItem}>
                <CheckCircle size={16} color="#10B981" />
                <Text style={styles.featureText}>Metode visual yang objektif dan terstandar</Text>
              </View>
              <View style={styles.featureItem}>
                <CheckCircle size={16} color="#10B981" />
                <Text style={styles.featureText}>Berbasis fuzzy logic untuk akurasi tinggi</Text>
              </View>
              <View style={styles.featureItem}>
                <CheckCircle size={16} color="#10B981" />
                <Text style={styles.featureText}>Sesuai standar PKRMS nasional</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 4 Parameter SDI */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4 Parameter Utama SDI</Text>
          <Text style={styles.sectionSubtitle}>
            Berdasarkan SE 22/SE/Db/2021, perhitungan SDI menggunakan 4 parameter terukur:
          </Text>
          
          {sdiParameters.map((param, index) => {
            const IconComponent = param.icon;
            return (
              <View key={index} style={styles.parameterCard}>
                <View style={styles.parameterHeader}>
                  <View style={[styles.parameterIcon, { backgroundColor: param.color + '20' }]}>
                    <IconComponent size={20} color={param.color} />
                  </View>
                  <View style={styles.parameterTitle}>
                    <Text style={styles.parameterName}>{param.name}</Text>
                    <Text style={styles.parameterFormula}>{param.formula}</Text>
                  </View>
                </View>
                
                <Text style={styles.parameterDescription}>{param.description}</Text>
                
                <View style={styles.criteriaContainer}>
                  <Text style={styles.criteriaTitle}>Kriteria Penilaian:</Text>
                  <View style={styles.criteriaGrid}>
                    {param.criteria.map((criteria, idx) => (
                      <View key={idx} style={styles.criteriaItem}>
                        <View style={[styles.criteriaIndicator, { backgroundColor: criteria.color }]} />
                        <Text style={styles.criteriaRange}>{criteria.range}</Text>
                        <Text style={styles.criteriaValue}>= {criteria.value}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Fuzzy Logic Process Diagram */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diagram Alur Fuzzy Logic untuk SDI</Text>
          <Text style={styles.sectionSubtitle}>
            Proses pengolahan data SDI menggunakan sistem fuzzy logic untuk hasil yang objektif:
          </Text>
          
          <View style={styles.fuzzyFlowContainer}>
            {fuzzySteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <React.Fragment key={step.step}>
                  <View style={styles.fuzzyStepCard}>
                    <View style={styles.fuzzyStepHeader}>
                      <View style={[styles.stepNumber, { backgroundColor: step.color }]}>
                        <Text style={styles.stepText}>{step.step}</Text>
                      </View>
                      <View style={styles.stepIconContainer}>
                        <IconComponent size={24} color={step.color} />
                      </View>
                    </View>
                    
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>{step.title}</Text>
                      <Text style={styles.stepDescription}>{step.description}</Text>
                      <Text style={styles.stepDetails}>{step.details}</Text>
                    </View>
                  </View>
                  
                  {/* Arrow between steps */}
                  {index < fuzzySteps.length - 1 && (
                    <View style={styles.arrowContainer}>
                      <ArrowDown size={24} color="#6B7280" />
                    </View>
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </View>

        {/* SDI Classification & Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Klasifikasi Hasil SDI</Text>
          <Text style={styles.sectionSubtitle}>
            Interpretasi nilai SDI dan rekomendasi tindakan berdasarkan SE 22/SE/Db/2021:
          </Text>
          
          <View style={styles.classificationContainer}>
            {sdiClassification.map((item, index) => (
              <View key={index} style={styles.classificationCard}>
                <View style={styles.classificationHeader}>
                  <View style={[styles.classificationIndicator, { backgroundColor: item.color }]}>
                    <Text style={styles.rangeText}>{item.range}</Text>
                  </View>
                  <View style={styles.classificationInfo}>
                    <Text style={styles.conditionText}>{item.condition}</Text>
                    <Text style={styles.percentageText}>Tingkat Kerusakan: {item.percentage}</Text>
                  </View>
                </View>
                
                <Text style={styles.classificationDescription}>{item.description}</Text>
                
                <View style={styles.actionContainer}>
                  <ArrowRight size={16} color={item.color} />
                  <Text style={[styles.actionText, { color: item.color }]}>{item.action}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Tata Cara Penilaian SDI */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tata Cara Penilaian SDI</Text>
          <Text style={styles.sectionSubtitle}>
            Prosedur standar survei kondisi jalan berdasarkan SE 22/SE/Db/2021:
          </Text>
          
          <View style={styles.procedureContainer}>
            {surveySteps.map((phase, index) => (
              <View key={index} style={styles.procedureCard}>
                <View style={styles.procedureHeader}>
                  <View style={styles.procedureNumber}>
                    <Text style={styles.procedureNumberText}>{phase.step}</Text>
                  </View>
                  <Text style={styles.procedureTitle}>{phase.title}</Text>
                </View>
                
                <View style={styles.tasksList}>
                  {phase.tasks.map((task, taskIndex) => (
                    <View key={taskIndex} style={styles.taskItem}>
                      <View style={styles.taskBullet} />
                      <Text style={styles.taskText}>{task}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Benefits of Fuzzy Logic for SDI */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Keunggulan Fuzzy Logic untuk SDI</Text>
          <View style={styles.benefitsCard}>
            <View style={styles.benefitItem}>
              <Target size={20} color="#10B981" />
              <View>
                <Text style={styles.benefitTitle}>Objektivitas Tinggi</Text>
                <Text style={styles.benefitText}>Mengurangi subjektivitas penilaian visual manusia melalui rule-based system</Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <Activity size={20} color="#3B82F6" />
              <View>
                <Text style={styles.benefitTitle}>Konsistensi Hasil</Text>
                <Text style={styles.benefitText}>Menghasilkan penilaian yang konsisten untuk kondisi jalan yang serupa</Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <Calculator size={20} color="#8B5CF6" />
              <View>
                <Text style={styles.benefitTitle}>Akurasi Tinggi</Text>
                <Text style={styles.benefitText}>Mempertimbangkan multiple parameter secara simultan dan terintegrasi</Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <CheckCircle size={20} color="#F59E0B" />
              <View>
                <Text style={styles.benefitTitle}>Standarisasi Nasional</Text>
                <Text style={styles.benefitText}>Sesuai dengan regulasi PUPR untuk penilaian kondisi jalan Indonesia</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#2563EB',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  greeting: {
    fontSize: 14,
    color: '#E5E7EB',
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchText: {
    marginLeft: 12,
    color: '#9CA3AF',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  regulationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  regulationText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
    marginLeft: 8,
  },
  overviewDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 16,
    lineHeight: 20,
  },
  keyFeatures: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    color: '#4B5563',
    flex: 1,
  },
  parameterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  parameterHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  parameterIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  parameterTitle: {
    flex: 1,
  },
  parameterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  parameterFormula: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  parameterDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 16,
    lineHeight: 18,
  },
  criteriaContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  criteriaTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  criteriaGrid: {
    gap: 6,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  criteriaIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  criteriaRange: {
    fontSize: 12,
    color: '#4B5563',
    minWidth: 60,
  },
  criteriaValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
  },
  fuzzyFlowContainer: {
    alignItems: 'center',
  },
  fuzzyStepCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  fuzzyStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  stepContent: {
    paddingLeft: 42,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  stepDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  stepDetails: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  arrowContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  classificationContainer: {
    gap: 12,
  },
  classificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  classificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  classificationIndicator: {
    minWidth: 80,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    marginRight: 12,
  },
  rangeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  classificationInfo: {
    flex: 1,
  },
  conditionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  percentageText: {
    fontSize: 12,
    color: '#6B7280',
  },
  classificationDescription: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 8,
    lineHeight: 18,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  procedureContainer: {
    gap: 16,
  },
  procedureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  procedureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  procedureNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  procedureNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  procedureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  tasksList: {
    paddingLeft: 20,
    gap: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  taskBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6B7280',
    marginTop: 6,
  },
  taskText: {
    fontSize: 13,
    color: '#4B5563',
    flex: 1,
    lineHeight: 18,
  },
  benefitsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  benefitText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 24,
  },
});

export default HomeScreen;
