// src/utils/fuzzyEngine.js

export function getPrioritas(Z) {
  if (Z >= 25 && Z < 50) {
    return {
      kategori: "Prioritas Rendah",
      aksi: "Pemeliharaan rutin: pembersihan, pengecatan marka jalan, dan perbaikan minor",
      color: "green",
    };
  } else if (Z >= 50 && Z < 100) {
    return {
      kategori: "Prioritas Sedang",
      aksi: "Pemeliharaan berkala: penambalan lubang, perbaikan retak, dan overlay tipis",
      color: "yellow",
    };
  } else if (Z >= 100 && Z < 170) {
    return {
      kategori: "Prioritas Tinggi",
      aksi: "Rehabilitasi: overlay tebal, perbaikan struktural, dan penggantian lapisan permukaan",
      color: "orange",
    };
  } else if (Z >= 170 && Z <= 250) {
    return {
      kategori: "Prioritas Sangat Tinggi",
      aksi: "Rekonstruksi: pembongkaran total dan pembangunan ulang struktur jalan",
      color: "red",
    };
  } else {
    return {
      kategori: "Tidak Ada Prioritas",
      aksi: "Data tidak masuk dalam rentang perbaikan",
      color: "gray",
    };
  }
}
