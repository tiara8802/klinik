const mockData = require('../ranap/data/mockdata');
const helper = require('../ranap/helpers/helper');

const rawatInapController = {
    // List pasien rawat inap
    listPasien: async (req, res) => {
        try {
            const { status, kamar, tanggal } = req.query;
            
            console.log(`✅ List rawat inap: status=${status}, kamar=${kamar}, tanggal=${tanggal}`);
            
            let filteredData = [...mockData.mockRawatInap];
            
            if (status && status !== 'all') {
                filteredData = filteredData.filter(p => p.status === status);
            }
            
            if (kamar && kamar !== 'all') {
                filteredData = filteredData.filter(p => p.kamar === kamar);
            }
            
            if (tanggal) {
                filteredData = filteredData.filter(p => {
                    const tgl = new Date(p.tgl_masuk).toISOString().split('T')[0];
                    return tgl === tanggal;
                });
            }
            
            const response = {
                success: true,
                message: `✅ ${filteredData.length} pasien rawat inap ditemukan`,
                jumlah_pasien: filteredData.length,
                filter: {
                    status: status || 'Semua',
                    kamar: kamar || 'Semua',
                    tanggal: tanggal || 'Semua'
                },
                data_pasien: filteredData.map((pasien, index) => ({
                    no: index + 1,
                    no_rm: pasien.no_rm,
                    no_reg: pasien.no_reg,
                    nama_pasien: pasien.nama_pasien,
                    no_sep: pasien.no_sep,
                    kelas: pasien.kelas,
                    kamar: pasien.kamar,
                    no_bed: pasien.no_bed,
                    gol_pasien: pasien.gol_pasien,
                    hp: pasien.hp,
                    status: pasien.status,
                    tgl_masuk: helper.formatTanggal(pasien.tgl_masuk),
                    lama_dirawat: helper.hitungLamaDirawat(pasien.tgl_masuk, pasien.tgl_keluar),
                    dokter: pasien.dokter
                }))
            };
            
            res.json(response);
            
        } catch (error) {
            console.log('⚠️  Error:', error.message);
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil data pasien'
            });
        }
    },

    // Detail pasien by no_reg
    detailPasien: async (req, res) => {
        try {
            const { no_reg } = req.params;
            
            console.log(`✅ Detail rawat inap: ${no_reg}`);
            
            const pasien = mockData.mockRawatInap.find(p => p.no_reg === no_reg);
            
            if (!pasien) {
                return res.json({
                    success: false,
                    message: 'Pasien tidak ditemukan'
                });
            }
            
            // Data mock untuk detail
            const riwayatPemeriksaan = [
                {
                    tanggal: '2025-12-06 08:00:00',
                    dokter: pasien.dokter,
                    tekanan_darah: '120/80 mmHg',
                    nadi: '78 bpm',
                    suhu: '36.5°C',
                    pernapasan: '18 bpm',
                    catatan: 'Keadaan umum baik, keluhan nyeri berkurang'
                }
            ];
            
            const pengobatan = [
                {
                    obat: 'Paracetamol 500mg',
                    dosis: '1 tablet',
                    frekuensi: '3x sehari',
                    route: 'Oral',
                    tanggal_mulai: '2025-12-05',
                    tanggal_selesai: '2025-12-08'
                }
            ];
            
            const pemeriksaanPenunjang = [
                {
                    jenis: 'Laboratorium',
                    pemeriksaan: 'Darah Lengkap',
                    hasil: 'Hb: 13.5 g/dL, Leukosit: 8.200/μL, Trombosit: 250.000/μL',
                    tanggal: '2025-12-05'
                }
            ];
            
            const response = {
                success: true,
                message: '✅ Detail pasien rawat inap ditemukan',
                data: {
                    identitas: {
                        no_rm: pasien.no_rm,
                        no_reg: pasien.no_reg,
                        nama_pasien: pasien.nama_pasien,
                        tgl_lahir: helper.formatTanggalOnly(pasien.tgl_lahir),
                        usia: helper.hitungUmur(pasien.tgl_lahir),
                        jenis_kelamin: pasien.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
                        alamat: pasien.alamat,
                        no_sep: pasien.no_sep,
                        gol_pasien: pasien.gol_pasien,
                        hp: pasien.hp
                    },
                    
                    rawat_inap: {
                        status: pasien.status,
                        kelas: pasien.kelas,
                        kamar: pasien.kamar,
                        no_bed: pasien.no_bed,
                        dokter_penanggungjawab: pasien.dokter,
                        tgl_masuk: helper.formatTanggal(pasien.tgl_masuk),
                        tgl_keluar: pasien.tgl_keluar ? helper.formatTanggal(pasien.tgl_keluar) : '-',
                        lama_dirawat: helper.hitungLamaDirawat(pasien.tgl_masuk, pasien.tgl_keluar)
                    },
                    
                    medis: {
                        diagnosa_masuk: pasien.diagnosa_masuk,
                        diagnosa_keluar: pasien.diagnosa_keluar || '-',
                        alergi: 'Tidak ada',
                        riwayat_penyakit: 'Hipertensi 5 tahun',
                        kondisi_sekarang: 'Stabil'
                    },
                    
                    riwayat_pemeriksaan: riwayatPemeriksaan.map((r, i) => ({
                        no: i + 1,
                        tanggal: helper.formatTanggal(r.tanggal),
                        dokter: r.dokter,
                        tanda_vital: {
                            tekanan_darah: r.tekanan_darah,
                            nadi: r.nadi,
                            suhu: r.suhu,
                            pernapasan: r.pernapasan
                        },
                        catatan: r.catatan
                    })),
                    
                    pengobatan: pengobatan.map((o, i) => ({
                        no: i + 1,
                        obat: o.obat,
                        dosis: o.dosis,
                        frekuensi: o.frekuensi,
                        route: o.route,
                        periode: `${helper.formatTanggalOnly(o.tanggal_mulai)} - ${helper.formatTanggalOnly(o.tanggal_selesai)}`
                    })),
                    
                    pemeriksaan_penunjang: pemeriksaanPenunjang.map((p, i) => ({
                        no: i + 1,
                        jenis: p.jenis,
                        pemeriksaan: p.pemeriksaan,
                        hasil: p.hasil,
                        tanggal: helper.formatTanggalOnly(p.tanggal)
                    })),
                    
                    biaya: {
                        kamar: {
                            tarif_harian: helper.formatRupiah(500000),
                            lama: helper.hitungLamaDirawat(pasien.tgl_masuk, pasien.tgl_keluar).split(' ')[0],
                            total: helper.formatRupiah(500000 * parseInt(helper.hitungLamaDirawat(pasien.tgl_masuk, pasien.tgl_keluar).split(' ')[0] || 1))
                        },
                        obat: helper.formatRupiah(750000),
                        tindakan: helper.formatRupiah(1200000),
                        laboratorium: helper.formatRupiah(450000),
                        total: helper.formatRupiah(2900000)
                    }
                }
            };
            
            res.json(response);
            
        } catch (error) {
            console.log('⚠️  Error:', error.message);
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil detail pasien'
            });
        }
    },

    // Riwayat pasien by no_rm
    riwayatPasien: async (req, res) => {
        try {
            const { no_rm } = req.params;
            
            console.log(`✅ Riwayat rawat inap pasien: ${no_rm}`);
            
            const riwayat = mockData.mockRawatInap.filter(p => p.no_rm === no_rm);
            
            if (riwayat.length === 0) {
                return res.json({
                    success: false,
                    message: 'Tidak ada riwayat rawat inap untuk pasien ini'
                });
            }
            
            const pasien = riwayat[0];
            
            const response = {
                success: true,
                message: `✅ ${riwayat.length} riwayat rawat inap ditemukan`,
                info_pasien: {
                    no_rm: pasien.no_rm,
                    nama_pasien: pasien.nama_pasien,
                    tgl_lahir: helper.formatTanggalOnly(pasien.tgl_lahir),
                    usia: helper.hitungUmur(pasien.tgl_lahir),
                    jenis_kelamin: pasien.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
                    alamat: pasien.alamat
                },
                riwayat_rawat_inap: riwayat.map((r, index) => ({
                    no: index + 1,
                    no_reg: r.no_reg,
                    tgl_masuk: helper.formatTanggal(r.tgl_masuk),
                    tgl_keluar: r.tgl_keluar ? helper.formatTanggal(r.tgl_keluar) : '-',
                    lama_dirawat: helper.hitungLamaDirawat(r.tgl_masuk, r.tgl_keluar),
                    kelas: r.kelas,
                    kamar: r.kamar,
                    no_bed: r.no_bed,
                    dokter: r.dokter,
                    diagnosa: r.diagnosa_masuk,
                    status: r.status,
                    no_sep: r.no_sep,
                    gol_pasien: r.gol_pasien
                }))
            };
            
            res.json(response);
            
        } catch (error) {
            console.log('⚠️  Error:', error.message);
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil riwayat pasien'
            });
        }
    },

    // Statistik rawat inap
    statistik: async (req, res) => {
        try {
            const { tanggal } = req.query;
            
            console.log(`✅ Statistik rawat inap: ${tanggal || 'all'}`);
            
            const stats = {
                total_pasien: mockData.mockRawatInap.length,
                dirawat: mockData.mockRawatInap.filter(p => p.status === 'Dirawat').length,
                pulang: mockData.mockRawatInap.filter(p => p.status === 'Pulang').length,
                pindah: mockData.mockRawatInap.filter(p => p.status === 'Pindah').length,
                
                per_kelas: {
                    'VIP DELUXE': mockData.mockRawatInap.filter(p => p.kelas === 'VIP DELUXE').length,
                    'VIP PREMIUM': mockData.mockRawatInap.filter(p => p.kelas === 'VIP PREMIUM').length,
                    'KELAS I': mockData.mockRawatInap.filter(p => p.kelas === 'KELAS I').length,
                    'KELAS II': mockData.mockRawatInap.filter(p => p.kelas === 'KELAS II').length
                },
                
                per_golongan: {
                    'BPJS': mockData.mockRawatInap.filter(p => p.gol_pasien.includes('BPJS')).length,
                    'UMUM': mockData.mockRawatInap.filter(p => !p.gol_pasien.includes('BPJS')).length
                },
                
                occupancy_rate: (4 / 20 * 100).toFixed(1) + '%'
            };
            
            const response = {
                success: true,
                message: '✅ Statistik rawat inap',
                periode: tanggal ? `Tanggal ${tanggal}` : 'Keseluruhan',
                statistik: stats,
                trend: {
                    hari_ini: 5,
                    kemarin: 4,
                    rata_per_bulan: 120,
                    pertumbuhan: '+25%'
                }
            };
            
            res.json(response);
            
        } catch (error) {
            console.log('⚠️  Error:', error.message);
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil statistik'
            });
        }
    }
};

module.exports = rawatInapController;