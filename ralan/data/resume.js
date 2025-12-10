// Data Master Ruangan IGD
const masterRuanganIgd = [
  { kode_ruangan: 'IGD001', nama_ruangan: 'IGD Triage Area', lokasi: 'Lt. 1 - Zona Merah' },
  { kode_ruangan: 'IGD002', nama_ruangan: 'IGD Resusitasi', lokasi: 'Lt. 1 - Zona Merah' },
  { kode_ruangan: 'IGD003', nama_ruangan: 'IGD Observation', lokasi: 'Lt. 1 - Zona Kuning' },
  { kode_ruangan: 'IGD004', nama_ruangan: 'IGD Fast Track', lokasi: 'Lt. 1 - Zona Hijau' },
  { kode_ruangan: 'ICU001', nama_ruangan: 'ICU 1', lokasi: 'Lt. 3 - Bedah' },
  { kode_ruangan: 'ICU002', nama_ruangan: 'ICU 2', lokasi: 'Lt. 3 - Medik' },
  { kode_ruangan: 'HCU001', nama_ruangan: 'HCU 1', lokasi: 'Lt. 2 - Koroner' },
  { kode_ruangan: 'HCU002', nama_ruangan: 'HCU 2', lokasi: 'Lt. 2 - Stroke' }
];

// Data Petugas IGD
const petugasIgd = [
  { id_petugas: 'PET001', nama: 'dr. Rudi Hermawan, Sp.EM', jabatan: 'Kepala IGD', shift: 'Pagi' },
  { id_petugas: 'PET002', nama: 'dr. Maya Indah, Sp.EM', jabatan: 'Dokter IGD', shift: 'Siang' },
  { id_petugas: 'PET003', nama: 'dr. Agus Supriyadi, Sp.EM', jabatan: 'Dokter IGD', shift: 'Malam' },
  { id_petugas: 'PET004', nama: 'Nurul Hidayah, S.Kep', jabatan: 'Perawat IGD', shift: 'Pagi' },
  { id_petugas: 'PET005', nama: 'Budi Santoso, S.Kep', jabatan: 'Perawat IGD', shift: 'Siang' },
  { id_petugas: 'PET006', nama: 'Siti Fatimah, S.Kep', jabatan: 'Perawat IGD', shift: 'Malam' }
];

// Data Tindakan IGD
const tindakanIgd = [
  { kode_tindakan: 'TIGD001', nama_tindakan: 'Resusitasi Jantung Paru', biaya: 500000 },
  { kode_tindakan: 'TIGD002', nama_tindakan: 'Pemasangan Infus', biaya: 75000 },
  { kode_tindakan: 'TIGD003', nama_tindakan: 'Pemasangan DC Shock', biaya: 350000 },
  { kode_tindakan: 'TIGD004', nama_tindakan: 'Intubasi Endotrakeal', biaya: 450000 },
  { kode_tindakan: 'TIGD005', nama_tindakan: 'Pemasangan Chest Tube', biaya: 600000 },
  { kode_tindakan: 'TIGD006', nama_tindakan: 'Pemasangan NGT', biaya: 125000 },
  { kode_tindakan: 'TIGD007', nama_tindakan: 'Pemasangan Foley Catheter', biaya: 100000 },
  { kode_tindakan: 'TIGD008', nama_tindakan: 'Pemeriksaan EKG', biaya: 150000 },
  { kode_tindakan: 'TIGD009', nama_tindakan: 'Nebulizer', biaya: 75000 },
  { kode_tindakan: 'TIGD010', nama_tindakan: 'Pemeriksaan TTV', biaya: 25000 }
];

// Data Pasien IGD (Emergency) - LENGKAP
const pasienIgd = [
  {
    no_rm: '374469',
    no_reg: 'IGD20251202143000',
    tgl_masuk: '2025-12-02 14:30:00',
    jam_masuk: '14:30:00',
    tgl_keluar: '2025-12-02 22:45:00',
    jam_keluar: '22:45:00',
    triase: 'MERAH',
    keluhan_utama: 'Sesak napas berat dan nyeri dada menjalar ke lengan kiri',
    s: 'Pasien mengeluh sesak napas tiba-tiba sejak 2 jam SMRS, disertai nyeri dada seperti ditekan berat menjalar ke lengan kiri dan rahang, berkeringat dingin, mual. Riwayat hipertensi sejak 5 tahun, diabetes tipe 2 sejak 3 tahun, merokok 1 bungkus/hari selama 20 tahun. Tidak ada riwayat alergi obat.',
    o: 'TD: 180/110 mmHg, N: 120x/menit ireguler, RR: 32x/menit, SpO2: 88% dengan udara ruang, Suhu: 37.8°C. Kesadaran: compos mentis, wajah pucat, berkeringat dingin. Jantung: suara jantung melemah, gallop S3. Paru: ronkhi basah halus di basal kedua paru. Ekstremitas: akral dingin, CRT >3 detik. EKG: elevasi ST di lead II, III, aVF. GDS: 280 mg/dL.',
    a: '1. Acute Coronary Syndrome (STEMI inferior)\n2. Hypertensive Emergency\n3. Acute Pulmonary Edema\n4. Diabetes Mellitus tipe 2 dengan hiperglikemia\n5. Gagal napas akut',
    p: '1. O2 5L/mnt via Non-Rebreathing Mask\n2. IV line 2 jalur 18G\n3. Nitroglycerin SL 0.4 mg, bisa diulang 5 menit\n4. Furosemide 40 mg IV\n5. Morphine 2-4 mg IV PRN nyeri\n6. Aspirin 160 mg chewed\n7. Clopidogrel 300 mg loading\n8. Heparin drip 18 unit/kg/jam\n9. Monitor EKG continuous\n10. Rujuk ke ICCU untuk reperfusi\n11. Kontrol gula darah dengan insulin sliding scale',
    dokter_igd: 'PET001',
    perawat_igd: 'PET004',
    ruangan: 'IGD002',
    status_pasien: 'DIRUJUK_ICCU',
    asuransi: 'BPJS',
    penanggung_jawab: 'Budi Santoso (Suami)',
    hubungan_pj: 'Suami',
    telepon_pj: '08123456789',
    user_entry: 'PET004',
    tgl_entry: '2025-12-02 14:35:00',
    tindakan: ['TIGD001', 'TIGD002', 'TIGD008'],
    hasil_lab: {
      hemoglobin: '12.5 g/dL',
      leukosit: '15.200 /uL',
      trombosit: '320.000 /uL',
      kreatinin: '1.4 mg/dL',
      troponin: '8.5 ng/mL (positif)',
      CKMB: '120 U/L'
    },
    catatan_khusus: 'Pasien risiko tinggi, perlu monitoring ketat, sudah diinformkan kondisi kritis kepada keluarga'
  },
  {
    no_rm: '359723',
    no_reg: 'IGD20251203112000',
    tgl_masuk: '2025-12-03 11:20:00',
    jam_masuk: '11:20:00',
    tgl_keluar: '2025-12-03 18:45:00',
    jam_keluar: '18:45:00',
    triase: 'KUNING',
    keluhan_utama: 'Muntah darah segar sekitar 200cc dan BAB hitam',
    s: 'Pasien mengeluh muntah darah segar ±200cc 1 jam SMRS, sebelumnya BAB hitam seperti aspal sejak 2 hari. Lemah, pusing, keringat dingin. Riwayat tukak lambung sejak 3 tahun, sering minum obat anti nyeri, konsumsi alkohol sosial. Tidak ada riwayat operasi lambung.',
    o: 'TD: 100/70 mmHg, N: 110x/menit, RR: 24x/menit, SpO2: 96%, Suhu: 36.8°C. Kesadaran: compos mentis, conjunctiva pucat (+), kulit lembab. Abdomen: nyeri tekan epigastrium, tidak ada defense muscular. Rectal toucher: feses hitam melena. Hb: 8.5 g/dL, Hct: 26%.',
    a: '1. Upper Gastrointestinal Bleeding (varises esofagus vs ulkus peptikum)\n2. Anemia sedang sekunder perdarahan GI\n3. Hemodinamik tidak stabil\n4. Riwayat penggunaan NSAID jangka panjang',
    p: '1. IV line 2 jalur 16G\n2. Transfusi PRC 2 kantong segera\n3. Omeprazole 40 mg IV 2x sehari\n4. Pantang per oral\n5. Terapi somatostatin drip\n6. Endoskopi darurat untuk ligasi varises\n7. Konsul bedah digestif standby\n8. Monitor perdarahan berulang\n9. Monitor tanda vital tiap 15 menit',
    dokter_igd: 'PET002',
    perawat_igd: 'PET005',
    ruangan: 'IGD003',
    status_pasien: 'DIRAWAT_INTERNIS',
    asuransi: 'UMUM',
    penanggung_jawab: 'Ahmad Subagyo (Suami)',
    hubungan_pj: 'Suami',
    telepon_pj: '08129876543',
    user_entry: 'PET005',
    tgl_entry: '2025-12-03 11:25:00',
    tindakan: ['TIGD002', 'TIGD006'],
    hasil_lab: {
      hemoglobin: '8.5 g/dL',
      leukosit: '11.500 /uL',
      trombosit: '210.000 /uL',
      ureum: '65 mg/dL',
      kreatinin: '1.2 mg/dL',
      INR: '1.1'
    },
    catatan_khusus: 'Perlu endoskopi darurat, keluarga sudah setuju transfusi darah'
  },
  {
    no_rm: '374608',
    no_reg: 'IGD20251204190000',
    tgl_masuk: '2025-12-04 19:00:00',
    jam_masuk: '19:00:00',
    tgl_keluar: '2025-12-04 22:30:00',
    jam_keluar: '22:30:00',
    triase: 'HIJAU',
    keluhan_utama: 'Luka bakar tangan kanan akibat tersiram air panas',
    s: 'Pasien memasak air dan tidak sengaja tersiram air mendidih pada tangan kanan 30 menit SMRS. Nyeri seperti terbakar, kulit kemerahan dan melepuh. Tidak ada riwayat penyakit sistemik. Alergi: tidak ada.',
    o: 'TD: 130/85 mmHg, N: 88x/menit, RR: 20x/menit, SpO2: 99%, Suhu: 37.0°C. Luka bakar derajat II superfisial pada tangan kanan dorsal dan volar ±5% BSA, vesikel berisi cairan jernih, dasar luka kemerahan, nyeri tekan (+). Tetanus status: booster 5 tahun lalu.',
    a: '1. Luka bakar termal derajat II area tangan kanan (5% BSA)\n2. Nyeri akut\n3. Risiko infeksi sekunder',
    p: '1. Pembersihan luka dengan NaCl 0.9%\n2. Silver sulfadiazine cream topikal\n3. Pemberian analgesia (paracetamol 1g IV)\n4. Antibiotik profilaksis (cefazolin 1g IV)\n5. Tetanus toxoid 0.5 mL IM\n6. Perban steril\n7. Edukasi perawatan luka di rumah\n8. Kontrol 2 hari lagi di poliklinik bedah',
    dokter_igd: 'PET003',
    perawat_igd: 'PET006',
    ruangan: 'IGD004',
    status_pasien: 'PULANG',
    asuransi: 'BPJS',
    penanggung_jawab: 'Rudi Hartono (Suami)',
    hubungan_pj: 'Suami',
    telepon_pj: '081312345678',
    user_entry: 'PET006',
    tgl_entry: '2025-12-04 19:05:00',
    tindakan: ['TIGD010'],
    hasil_lab: {
      hemoglobin: '13.2 g/dL',
      leukosit: '8.500 /uL',
      gula_darah: '110 mg/dL'
    },
    catatan_khusus: 'Pasien kooperatif, edukasi perawatan luka sudah diberikan'
  },
  {
    no_rm: '374632',
    no_reg: 'IGD20251205083000',
    tgl_masuk: '2025-12-05 08:30:00',
    jam_masuk: '08:30:00',
    tgl_keluar: '2025-12-05 15:00:00',
    jam_keluar: '15:00:00',
    triase: 'MERAH',
    keluhan_utama: 'Anak kejang demam dengan mata melirik ke atas',
    s: 'Anak laki-laki usia 7 tahun, demam sejak kemarin sore (suhu 39°C), tiba-tiba kejang tonik-klonik seluruh tubuh ±3 menit di rumah. Setelah kejang, anak lemas dan mengantuk. Riwayat kejang demam sederhana usia 2 tahun. Imunisasi lengkap. Alergi: tidak ada.',
    o: 'TD: 90/60 mmHg, N: 130x/menit, RR: 30x/menit, SpO2: 95%, Suhu: 39.5°C axilla. Kesadaran: postictal, GCS: 13 (E4, V4, M5). Pupil: isokor 3 mm, reaksi cahaya (+). Tanda rangsang meningeal (-). Fokal neurologis (-).',
    a: '1. Febrile seizure kompleks\n2. Demam (etiologi dicari)\n3. Postictal state\n4. Riwayat kejang demam',
    p: '1. Diazepam rectal 5 mg (sudah diberikan di rumah)\n2. Paracetamol supp 250 mg\n3. Cooling dengan kompres hangat\n4. IV line 22G\n5. Pemeriksaan laboratorium: darah lengkap, elektrolit, gula darah\n6. Observasi kejang ulang selama 4 jam\n7. Edukasi orang tua tentang tatalaksana kejang demam\n8. Rujuk ke poli anak untuk evaluasi lebih lanjut',
    dokter_igd: 'PET001',
    perawat_igd: 'PET004',
    ruangan: 'IGD002',
    status_pasien: 'PULANG',
    asuransi: 'UMUM',
    penanggung_jawab: 'Munandar (Ayah)',
    hubungan_pj: 'Ayah',
    telepon_pj: '081322334455',
    user_entry: 'PET004',
    tgl_entry: '2025-12-05 08:35:00',
    tindakan: ['TIGD002', 'TIGD009'],
    hasil_lab: {
      hemoglobin: '12.0 g/dL',
      leukosit: '14.500 /uL',
      trombosit: '350.000 /uL',
      natrium: '138 mEq/L',
      kalium: '4.0 mEq/L',
      glukosa: '95 mg/dL'
    },
    catatan_khusus: 'Orang tua sangat cemas, sudah dilakukan edukasi dan reassurance'
  },
  {
    no_rm: '374469',
    no_reg: 'IGD20251206140000',
    tgl_masuk: '2025-12-06 14:00:00',
    jam_masuk: '14:00:00',
    tgl_keluar: '2025-12-06 18:00:00',
    jam_keluar: '18:00:00',
    triase: 'KUNING',
    keluhan_utama: 'Vertigo berputar hebat dengan muntah proyektil',
    s: 'Pasien bangun tidur tiba-tiba merasa ruangan berputar, mual muntah 5x, tidak bisa berdiri atau berjalan tanpa pegangan. Tidak ada tinitus, gangguan pendengaran, atau kelemahan anggota gerak. Riwayat vertigo berulang sejak 2 tahun. Obat rutin: amlodipine, metformin.',
    o: 'TD: 130/80 mmHg, N: 90x/menit, RR: 22x/menit, SpO2: 98%, Suhu: 36.7°C. Neurologis: nystagmus horizontal rotatory ke kanan, tes Romberg (+), tes Dix-Hallpike (+). Telinga: membran timpani normal. Tidak ada deficit neurologis fokal.',
    a: '1. Benign Paroxysmal Positional Vertigo (BPPV) kanan\n2. Vestibular neuritis (differential diagnosis)\n3. Hipertensi terkontrol\n4. Diabetes Mellitus tipe 2 terkontrol',
    p: '1. Betahistine 24 mg 3x1\n2. Metoclopramide 10 mg IV PRN mual\n3. Manuver Epley kanan\n4. Posisi kepala elevasi 45 derajat\n5. Istirahat, hindari gerakan kepala mendadak\n6. Rujuk ke poli THT untuk VNG test\n7. Kontrol 1 minggu lagi atau jika gejala memberat',
    dokter_igd: 'PET002',
    perawat_igd: 'PET005',
    ruangan: 'IGD003',
    status_pasien: 'PULANG',
    asuransi: 'BPJS',
    penanggung_jawab: 'Budi Santoso (Suami)',
    hubungan_pj: 'Suami',
    telepon_pj: '08123456789',
    user_entry: 'PET005',
    tgl_entry: '2025-12-06 14:05:00',
    tindakan: ['TIGD010'],
    hasil_lab: {
      hemoglobin: '12.8 g/dL',
      leukosit: '9.200 /uL',
      gula_darah: '150 mg/dL'
    },
    catatan_khusus: 'Pasien sudah diajarkan manuver Epley, gejala membaik 70% setelah manuver'
  }
];

// Data Master Triase
const masterTriase = [
  { kode_triase: 'MERAH', nama_triase: 'Gawat Darurat', deskripsi: 'Mengancam nyawa, harus ditangani segera <10 menit', warna: '#FF0000' },
  { kode_triase: 'KUNING', nama_triase: 'Gawat Tidak Darurat', deskripsi: 'Berpotensi mengancam nyawa, ditangani <60 menit', warna: '#FFFF00' },
  { kode_triase: 'HIJAU', nama_triase: 'Tidak Gawat', deskripsi: 'Tidak mengancam nyawa, ditangani <120 menit', warna: '#00FF00' },
  { kode_triase: 'HITAM', nama_triase: 'Meninggal', deskripsi: 'Pasien sudah meninggal sebelum tiba', warna: '#000000' }
];

module.exports = {
  masterRuanganIgd,
  petugasIgd,
  tindakanIgd,
  pasienIgd,
  masterTriase
};