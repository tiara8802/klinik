const { 
  masterPasien, 
  pasienRalan, 
  masterDokter, 
  masterPoli 
} = require('../data/mockdata');
const {
  formatRupiah,
  hitungUmur,
  formatTanggal,
  formatTanggalOnly,
  formatJam,
  getNamaDokter,
  getNamaPoli,
  getLokasiPoli,
  getSpesialisasiDokter,
  getNamaGolongan,
  getNamaBulan,
  getKodePoli
} = require('../helpers/helper');

const raianController = {
  // API 1: GET PELAYANAN PASIEN
  getPelayanan: async (req, res) => {
    try {
      const { no_pasien, tanggal_pelayanan } = req.query;
      
      console.log(`✅ Get pelayanan: no_pasien=${no_pasien}, tanggal_pelayanan=${tanggal_pelayanan}`);

      if (!no_pasien) {
        return res.json({
          success: false,
          message: 'Parameter no_pasien diperlukan'
        });
      }

      // Cari data master pasien
      const pasien = masterPasien.find(p => p.no_pasien === no_pasien);
      
      if (!pasien) {
        return res.json({
          success: false,
          message: 'Pasien tidak ditemukan'
        });
      }

      // Filter data pelayanan
      let filteredPelayanan = pasienRalan.filter(p => p.no_pasien === no_pasien);
      
      if (tanggal_pelayanan) {
        filteredPelayanan = filteredPelayanan.filter(p => {
          const tgl = new Date(p.tgl_periksa).toISOString().split('T')[0];
          return tgl === tanggal_pelayanan.split('T')[0];
        });
      }

      filteredPelayanan.sort((a, b) => new Date(b.tgl_periksa) - new Date(a.tgl_periksa));

      // Join dengan data dokter dan poli
      const pelayananDetail = filteredPelayanan.map(pelayanan => {
        const dokter = masterDokter.find(d => d.kode_dokter === pelayanan.kode_dokter);
        const poli = masterPoli.find(p => p.kode_poli === pelayanan.kode_poli);
        
        return {
          ...pelayanan,
          nama_dokter_lengkap: dokter ? dokter.nama_dokter : 'Dokter tidak ditemukan',
          spesialisasi_dokter: dokter ? dokter.spesialisasi : '-',
          nama_poli_lengkap: poli ? poli.nama_poli : 'POLI TIDAK DIKETAHUI',
          lokasi_poli: poli ? poli.lokasi : '-'
        };
      });

      const response = {
        success: true,
        message: `✅ ${pelayananDetail.length} pelayanan ditemukan untuk pasien ${no_pasien}`,
        data: {
          info_pasien: {
            no_pasien: pasien.no_pasien,
            nama_pasien: pasien.nama_pasien,
            tgl_lahir: formatTanggalOnly(pasien.tgl_lahir),
            usia: hitungUmur(pasien.tgl_lahir),
            jenis_kelamin: pasien.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
            alamat: pasien.alamat,
            telepon: pasien.telepon,
            gol_darah: pasien.gol_darah,
            alergi: pasien.alergi,
            pekerjaan: pasien.pekerjaan,
            status_perkawinan: pasien.status_perkawinan,
            tgl_daftar: formatTanggalOnly(pasien.tgl_daftar),
            status_pasien: pasien.status_pasien
          },
          
          ringkasan: {
            total_kunjungan: filteredPelayanan.length,
            total_tarif: filteredPelayanan.reduce((sum, p) => sum + p.tarif_bpjs + p.tarif_rumahsakit, 0),
            terakhir_periksa: filteredPelayanan.length > 0 ? 
              formatTanggal(filteredPelayanan[0].tgl_periksa) : 'Belum ada kunjungan'
          },
          
          pelayanan: pelayananDetail.map((p, index) => ({
            no: index + 1,
            no_reg: p.no_reg,
            tgl_periksa: formatTanggal(p.tgl_periksa),
            jam_periksa: formatJam(p.jam_periksa),
            
            info_poli: {
              kode_poli: p.kode_poli,
              nama_poli: p.nama_poli_lengkap,
              lokasi: p.lokasi_poli
            },
            
            info_dokter: {
              kode_dokter: p.kode_dokter,
              nama_dokter: p.nama_dokter_lengkap,
              spesialisasi: p.spesialisasi_dokter
            },
            
            info_medis: {
              status_pasien: p.status_pasien,
              jenis_kunjungan: p.jenis_kunjungan,
              keluhan: p.keluhan,
              diagnosa: p.diagnosa,
              tindakan: p.tindakan
            },
            
            info_administrasi: {
              kode_tarif: p.kode_tarif,
              tarif_bpjs: formatRupiah(p.tarif_bpjs),
              tarif_rumahsakit: formatRupiah(p.tarif_rumahsakit),
              total_tarif: formatRupiah(p.tarif_bpjs + p.tarif_rumahsakit),
              status_bayar: p.status_bayar,
              tgl_bayar: p.tgl_bayar ? formatTanggal(p.tgl_bayar) : '-'
            },
            
            info_system: {
              user_entry: p.user_entry,
              tgl_entry: formatTanggal(p.tgl_entry)
            }
          }))
        }
      };
      
      res.json(response);
      
    } catch (error) {
      console.log('⚠️  Error:', error.message);
      res.json({
        success: false,
        message: 'Gagal mengambil data pelayanan'
      });
    }
  },

  // API 2: LIST PASIEN
  listPasien: async (req, res) => {
    try {
      const { tanggal, poli } = req.query;
      
      console.log(`✅ API dipanggil: /api/list-pasien?tanggal=${tanggal}&poli=${poli}`);

      if (!tanggal) {
        return res.json({
          success: true,
          message: 'Silakan pilih tanggal',
          data_pasien: []
        });
      }

      let filteredData = pasienRalan.filter(p => {
        const tgl = new Date(p.tgl_periksa).toISOString().split('T')[0];
        return tgl === tanggal.split('T')[0];
      });

      if (poli && poli !== 'all') {
        filteredData = filteredData.filter(p => p.kode_poli === poli);
      }

      // Join dengan masterPasien untuk data lengkap
      const dataLengkap = filteredData.map(pelayanan => {
        const pasien = masterPasien.find(p => p.no_pasien === pelayanan.no_pasien) || {};
        const dokter = masterDokter.find(d => d.kode_dokter === pelayanan.kode_dokter) || {};
        const poli = masterPoli.find(p => p.kode_poli === pelayanan.kode_poli) || {};
        
        return {
          ...pelayanan,
          nama_pasien: pasien.nama_pasien || pelayanan.no_pasien,
          tgl_lahir: pasien.tgl_lahir,
          jenis_kelamin: pasien.jenis_kelamin,
          alamat: pasien.alamat,
          dokter_poli: dokter.nama_dokter || 'Dokter tidak ditemukan',
          tujuan_poli: pelayanan.kode_poli,
          nama_poli: poli.nama_poli || 'POLI TIDAK DIKETAHUI',
          status_pasien: pelayanan.status_pasien,
          diagnosa: pelayanan.diagnosa,
          no_antrian: pelayanan.no_reg.substring(8, 11) || '-',
          tarif_bpjs: pelayanan.tarif_bpjs,
          tarif_rumahsakit: pelayanan.tarif_rumahsakit
        };
      });

      const response = {
        success: true,
        message: `✅ ${dataLengkap.length} pasien ditemukan`,
        jumlah_pasien: dataLengkap.length,
        filter: {
          tanggal: tanggal,
          poli: poli ? getNamaPoli(poli) : 'Semua Poli'
        },
        data_pasien: dataLengkap.map((row, index) => ({
          no: index + 1,
          registrasi: row.no_reg,
          no_pasien: row.no_pasien,
          nama_pasien: row.nama_pasien,
          tgl_periksa: formatTanggal(row.tgl_periksa),
          gol_pasien: getNamaGolongan(row.tarif_bpjs > 0 ? 'BPJS' : 'UMUM'),
          nama_dokter: row.dokter_poli,
          
          detail: {
            poli: {
              kode: row.tujuan_poli,
              nama: row.nama_poli
            },
            no_antrian: row.no_antrian,
            status_pasien: row.status_pasien || '-',
            usia: hitungUmur(row.tgl_lahir),
            jenis_kelamin: row.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
            diagnosa: row.diagnosa || '-'
          }
        }))
      };
      
      res.json(response);
      
    } catch (error) {
      console.log('⚠️  Error ditangani:', error.message);
      res.json({
        success: false,
        message: 'Gagal mengambil data pasien'
      });
    }
  },

  // API 3: DETAIL PASIEN BY NO_REG
  detailPasien: async (req, res) => {
    try {
      const { no_reg } = req.params;
      
      console.log(`✅ Detail pasien: ${no_reg}`);

      const pelayanan = pasienRalan.find(p => p.no_reg === no_reg);
      
      if (!pelayanan) {
        return res.json({
          success: false,
          message: 'Data pelayanan tidak ditemukan'
        });
      }

      const pasien = masterPasien.find(p => p.no_pasien === pelayanan.no_pasien);
      
      if (!pasien) {
        return res.json({
          success: false,
          message: 'Data pasien tidak ditemukan'
        });
      }

      const dokter = masterDokter.find(d => d.kode_dokter === pelayanan.kode_dokter);
      const poli = masterPoli.find(p => p.kode_poli === pelayanan.kode_poli);
      
      const response = {
        success: true,
        message: '✅ Detail pasien ditemukan',
        data: {
          registrasi: pelayanan.no_reg,
          no_pasien: pasien.no_pasien,
          nama_pasien: pasien.nama_pasien,
          tgl_periksa: formatTanggal(pelayanan.tgl_periksa),
          gol_pasien: getNamaGolongan(pelayanan.tarif_bpjs > 0 ? 'BPJS' : 'UMUM'),
          nama_dokter: dokter ? dokter.nama_dokter : 'Dokter tidak ditemukan',
          
          info_pasien: {
            tgl_lahir: formatTanggalOnly(pasien.tgl_lahir),
            usia: hitungUmur(pasien.tgl_lahir),
            jenis_kelamin: pasien.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
            alamat: pasien.alamat,
            telepon: pasien.telepon,
            pekerjaan: pasien.pekerjaan,
            gol_darah: pasien.gol_darah,
            alergi: pasien.alergi
          },
          
          info_pelayanan: {
            no_antrian: pelayanan.no_reg.substring(8, 11),
            tujuan_poli: {
              kode: pelayanan.kode_poli,
              nama: poli ? poli.nama_poli : 'POLI TIDAK DIKETAHUI',
              lokasi: poli ? poli.lokasi : '-'
            },
            jam: {
              masuk: formatJam(pelayanan.jam_periksa),
              keluar: pelayanan.tgl_bayar ? formatJam(pelayanan.tgl_bayar) : '-'
            },
            status_pasien: pelayanan.status_pasien,
            status_bayar: pelayanan.status_bayar
          },
          
          info_medis: {
            diagnosa: pelayanan.diagnosa || '-',
            tindakan: pelayanan.tindakan || '-',
            keterangan: 'Kontrol rutin',
            keadaan_pulang: 'Baik',
            icd_10: '-'
          },
          
          info_tarif: {
            tarif_bpjs: formatRupiah(pelayanan.tarif_bpjs),
            tarif_rumahsakit: formatRupiah(pelayanan.tarif_rumahsakit),
            total: formatRupiah(pelayanan.tarif_bpjs + pelayanan.tarif_rumahsakit)
          }
        }
      };
      
      res.json(response);
      
    } catch (error) {
      res.json({
        success: false,
        message: 'Gagal mengambil detail pasien'
      });
    }
  },

  // API 4: RIWAYAT PASIEN BY NO_PASIEN
  riwayatPasien: async (req, res) => {
    try {
      const { no_pasien } = req.params;
      
      console.log(`✅ Riwayat pasien: ${no_pasien}`);
      
      const pasien = masterPasien.find(p => p.no_pasien === no_pasien);
      
      if (!pasien) {
        return res.json({
          success: false,
          message: 'Pasien tidak ditemukan'
        });
      }
      
      const riwayat = pasienRalan.filter(p => p.no_pasien === no_pasien)
        .sort((a, b) => new Date(b.tgl_periksa) - new Date(a.tgl_periksa));
      
      const riwayatLengkap = riwayat.map(pelayanan => {
        const dokter = masterDokter.find(d => d.kode_dokter === pelayanan.kode_dokter);
        const poli = masterPoli.find(p => p.kode_poli === pelayanan.kode_poli);
        
        return {
          ...pelayanan,
          nama_dokter: dokter ? dokter.nama_dokter : 'Dokter tidak ditemukan',
          nama_poli: poli ? poli.nama_poli : 'POLI TIDAK DIKETAHUI'
        };
      });
      
      const response = {
        success: true,
        message: `✅ ${riwayatLengkap.length} kunjungan ditemukan`,
        info_pasien: {
          no_pasien: pasien.no_pasien,
          nama_pasien: pasien.nama_pasien,
          tgl_lahir: formatTanggalOnly(pasien.tgl_lahir),
          usia: hitungUmur(pasien.tgl_lahir),
          jenis_kelamin: pasien.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
          alamat: pasien.alamat,
          telepon: pasien.telepon,
          pekerjaan: pasien.pekerjaan,
          status_pasien: pasien.status_pasien
        },
        
        riwayat_kunjungan: riwayatLengkap.map((row, index) => ({
          no: index + 1,
          registrasi: row.no_reg,
          tgl_periksa: formatTanggal(row.tgl_periksa),
          gol_pasien: getNamaGolongan(row.tarif_bpjs > 0 ? 'BPJS' : 'UMUM'),
          nama_dokter: row.nama_dokter,
          poli: row.nama_poli,
          diagnosa: row.diagnosa || '-',
          status: row.status_pasien || '-',
          tarif_total: formatRupiah(row.tarif_bpjs + row.tarif_rumahsakit)
        }))
      };
      
      res.json(response);
      
    } catch (error) {
      res.json({
        success: false,
        message: 'Gagal mengambil riwayat pasien'
      });
    }
  },

  // API 5: LIST POLI
  listPoli: (req, res) => {
    console.log('✅ Daftar poli diminta');
    
    res.json({
      success: true,
      message: '✅ Daftar poli tersedia',
      data: masterPoli.map(poli => ({
        kode: poli.kode_poli,
        nama: poli.nama_poli,
        lokasi: poli.lokasi
      }))
    });
  },

  // API 6: SEARCH PASIEN
  searchPasien: async (req, res) => {
    try {
      const { keyword } = req.query;
      
      console.log(`✅ Search: ${keyword}`);

      if (!keyword) {
        return res.json({
          success: true,
          message: 'Masukkan kata kunci pencarian',
          hasil_pencarian: []
        });
      }

      const search = keyword.toLowerCase();
      
      let results = masterPasien.filter(p => 
        p.nama_pasien.toLowerCase().includes(search) ||
        p.no_pasien.includes(search) ||
        p.alamat.toLowerCase().includes(search)
      );

      const resultsWithPelayanan = results.map(pasien => {
        const pelayananTerakhir = pasienRalan
          .filter(p => p.no_pasien === pasien.no_pasien)
          .sort((a, b) => new Date(b.tgl_periksa) - new Date(a.tgl_periksa))[0];
        
        const dokter = pelayananTerakhir ? 
          masterDokter.find(d => d.kode_dokter === pelayananTerakhir.kode_dokter) : null;
        const poli = pelayananTerakhir ? 
          masterPoli.find(p => p.kode_poli === pelayananTerakhir.kode_poli) : null;
        
        return {
          ...pasien,
          pelayanan_terakhir: pelayananTerakhir ? {
            tgl_periksa: pelayananTerakhir.tgl_periksa,
            dokter: dokter ? dokter.nama_dokter : '-',
            poli: poli ? poli.nama_poli : '-',
            diagnosa: pelayananTerakhir.diagnosa || '-'
          } : null
        };
      });
      
      res.json({
        success: true,
        message: `✅ ${results.length} hasil ditemukan`,
        keyword: keyword,
        hasil_pencarian: resultsWithPelayanan.map(pasien => ({
          no_pasien: pasien.no_pasien,
          nama_pasien: pasien.nama_pasien,
          tgl_lahir: formatTanggalOnly(pasien.tgl_lahir),
          usia: hitungUmur(pasien.tgl_lahir),
          jenis_kelamin: pasien.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
          alamat: pasien.alamat,
          telepon: pasien.telepon,
          pelayanan_terakhir: pasien.pelayanan_terakhir ? {
            tgl_periksa: formatTanggal(pasien.pelayanan_terakhir.tgl_periksa),
            dokter: pasien.pelayanan_terakhir.dokter,
            poli: pasien.pelayanan_terakhir.poli,
            diagnosa: pasien.pelayanan_terakhir.diagnosa
          } : { tgl_periksa: 'Belum ada kunjungan' }
        }))
      });
      
    } catch (error) {
      res.json({
        success: false,
        message: 'Gagal melakukan pencarian'
      });
    }
  },

  // API 7: REKAP BULANAN
  rekapBulanan: async (req, res) => {
    try {
      const { tahun, bulan } = req.query;
      
      console.log(`✅ Rekap bulanan: ${tahun}-${bulan}`);

      const tahunFilter = tahun || '2025';
      const bulanFilter = bulan ? parseInt(bulan) : 12;
      
      const pelayananBulanIni = pasienRalan.filter(p => {
        const tgl = new Date(p.tgl_periksa);
        return tgl.getFullYear() == tahunFilter && 
               (tgl.getMonth() + 1) == bulanFilter;
      });

      const rekapPerPoli = {};
      
      pelayananBulanIni.forEach(pelayanan => {
        const poli = masterPoli.find(p => p.kode_poli === pelayanan.kode_poli);
        const namaPoli = poli ? poli.nama_poli : 'LAINNYA';
        
        if (!rekapPerPoli[namaPoli]) {
          rekapPerPoli[namaPoli] = {
            baru: 0,
            lama: 0,
            umum: 0,
            bpjs: 0,
            perusahaan: 0,
            pendapatan_bpjs: 0,
            pendapatan_rs: 0,
            sudah_bayar: 0,
            belum_bayar: 0
          };
        }
        
        const rekap = rekapPerPoli[namaPoli];
        
        if (pelayanan.status_pasien === 'BARU') rekap.baru++;
        else if (pelayanan.status_pasien === 'LAMA') rekap.lama++;
        
        if (pelayanan.tarif_bpjs > 0) rekap.bpjs++;
        else rekap.umum++;
        
        rekap.pendapatan_bpjs += pelayanan.tarif_bpjs;
        rekap.pendapatan_rs += pelayanan.tarif_rumahsakit;
        
        if (pelayanan.status_bayar === 'LUNAS') rekap.sudah_bayar++;
        else rekap.belum_bayar++;
      });

      const rekapData = Object.entries(rekapPerPoli).map(([namaPoli, data]) => ({
        poli: namaPoli,
        ...data
      }));

      const totalKeseluruhan = {
        total_pasien: pelayananBulanIni.length,
        status: {
          baru: rekapData.reduce((sum, item) => sum + item.baru, 0),
          lama: rekapData.reduce((sum, item) => sum + item.lama, 0)
        },
        golongan: {
          umum: rekapData.reduce((sum, item) => sum + item.umum, 0),
          bpjs: rekapData.reduce((sum, item) => sum + item.bpjs, 0),
          perusahaan: rekapData.reduce((sum, item) => sum + item.perusahaan, 0)
        },
        pendapatan: {
          bpjs: rekapData.reduce((sum, item) => sum + item.pendapatan_bpjs, 0),
          rumah_sakit: rekapData.reduce((sum, item) => sum + item.pendapatan_rs, 0),
          total: rekapData.reduce((sum, item) => sum + item.pendapatan_bpjs + item.pendapatan_rs, 0)
        }
      };
      
      const response = {
        success: true,
        message: `✅ Rekap ${getNamaBulan(bulanFilter)} ${tahunFilter}`,
        periode: {
          tahun: tahunFilter,
          bulan: bulanFilter,
          nama_bulan: getNamaBulan(bulanFilter)
        },
        total_keseluruhan: {
          ...totalKeseluruhan,
          pendapatan: {
            bpjs: formatRupiah(totalKeseluruhan.pendapatan.bpjs),
            rumah_sakit: formatRupiah(totalKeseluruhan.pendapatan.rumah_sakit),
            total: formatRupiah(totalKeseluruhan.pendapatan.total)
          }
        },
        rekap_per_bulan: [
          {
            bulan: bulanFilter,
            nama_bulan: getNamaBulan(bulanFilter),
            data_poli: rekapData.map((item, index) => ({
              no: index + 1,
              poli: { kode: getKodePoli(item.poli), nama: item.poli },
              status: { baru: item.baru, lama: item.lama, total: item.baru + item.lama },
              golongan: { 
                umum: item.umum, 
                bpjs: item.bpjs, 
                perusahaan: item.perusahaan,
                lain: 0
              },
              pendapatan: {
                bpjs: item.pendapatan_bpjs,
                rumah_sakit: item.pendapatan_rs,
                total: item.pendapatan_bpjs + item.pendapatan_rs
              },
              pembayaran: {
                sudah: item.sudah_bayar,
                belum: item.belum_bayar,
                persentase: item.sudah_bayar + item.belum_bayar > 0 ?
                  `${Math.round((item.sudah_bayar / (item.sudah_bayar + item.belum_bayar)) * 100)}%` : '0%'
              }
            }))
          }
        ]
      };
      
      res.json(response);
      
    } catch (error) {
      res.json({
        success: false,
        message: 'Gagal mengambil data rekap'
      });
    }
  }
};

module.exports = raianController;