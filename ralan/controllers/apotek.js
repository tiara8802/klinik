// PERBAIKI IMPORT DENGAN BENAR
const { dataApotek, masterObat, masterApoteker } = require('../data/apotek');
const { masterPasien, pasienRalan, masterDokter, masterPoli } = require('../data/mockdata');
const {
  formatRupiah,
  formatTanggal,
  formatTanggalOnly,
  formatJam,
  hitungUmur,
  getNamaDokter,
  getNamaPoli
} = require('../helpers/helper');

const apotekController = {
  // API 1: GET RESEP PASIEN - DIPERBAIKI DENGAN DEBUG
  getResepPasien: async (req, res) => {
    try {
      const { no_pasien, tanggal_pelayanan } = req.query;
      
      console.log(`✅ [APOTEK] Get resep pasien dimulai`);
      console.log(`   Parameters: no_pasien=${no_pasien}, tanggal_pelayanan=${tanggal_pelayanan}`);

      // Debug: Cek apakah data terload
      console.log(`   Jumlah data apotek: ${dataApotek ? dataApotek.length : 'NULL'}`);
      console.log(`   Jumlah data pasien: ${masterPasien ? masterPasien.length : 'NULL'}`);

      if (!no_pasien || no_pasien.trim() === '') {
        console.log('   ❌ Error: Parameter no_pasien kosong');
        return res.json({
          success: false,
          message: 'Parameter no_pasien diperlukan'
        });
      }

      // Cari data master pasien
      const pasien = masterPasien.find(p => p.no_pasien === no_pasien);
      
      if (!pasien) {
        console.log(`   ❌ Error: Pasien ${no_pasien} tidak ditemukan`);
        return res.json({
          success: false,
          message: `Pasien dengan no_pasien ${no_pasien} tidak ditemukan`
        });
      }

      console.log(`   ✅ Pasien ditemukan: ${pasien.nama_pasien}`);

      // Cari semua registrasi pasien di pasienRalan
      let registrasiPasien = pasienRalan.filter(p => p.no_pasien === no_pasien);
      console.log(`   Jumlah registrasi pasien: ${registrasiPasien.length}`);
      
      if (tanggal_pelayanan) {
        const tglFilter = tanggal_pelayanan.split('T')[0];
        console.log(`   Filter tanggal: ${tglFilter}`);
        registrasiPasien = registrasiPasien.filter(p => {
          const tgl = new Date(p.tgl_periksa).toISOString().split('T')[0];
          return tgl === tglFilter;
        });
        console.log(`   Jumlah registrasi setelah filter tanggal: ${registrasiPasien.length}`);
      }

      // Ambil semua no_reg dari registrasi pasien
      const noRegList = registrasiPasien.map(r => r.no_reg);
      console.log(`   Daftar no_reg pasien: ${JSON.stringify(noRegList)}`);
      
      if (noRegList.length === 0) {
        console.log(`   ⚠️  Pasien tidak memiliki kunjungan`);
        return res.json({
          success: true,
          message: 'Pasien tidak memiliki kunjungan pada tanggal tersebut',
          data: {
            info_pasien: {
              no_pasien: pasien.no_pasien,
              nama_pasien: pasien.nama_pasien
            },
            resep: []
          }
        });
      }

      // Cari resep berdasarkan no_reg yang ditemukan
      let resepPasien = dataApotek.filter(resep => {
        const found = noRegList.includes(resep.no_reg);
        if (found) {
          console.log(`   ✅ Resep ditemukan: ${resep.no_resep} untuk no_reg: ${resep.no_reg}`);
        }
        return found;
      });
      
      console.log(`   Jumlah resep ditemukan: ${resepPasien.length}`);

      // Urutkan berdasarkan tanggal resep terbaru
      resepPasien.sort((a, b) => new Date(b.tgl_resep) - new Date(a.tgl_resep));

      // Join dengan data dari pasienRalan untuk setiap resep
      const resepDetail = resepPasien.map(resep => {
        // Cari data pelayanan berdasarkan no_reg
        const pelayanan = pasienRalan.find(p => p.no_reg === resep.no_reg);
        const dokter = masterDokter.find(d => d.kode_dokter === resep.dokter);
        const poli = pelayanan ? masterPoli.find(p => p.kode_poli === pelayanan.kode_poli) : null;
        const apoteker = masterApoteker.find(a => a.kode_apoteker === resep.user_entry);
        
        console.log(`   Processing resep ${resep.no_resep}: dokter=${dokter ? 'found' : 'not found'}, apoteker=${apoteker ? 'found' : 'not found'}`);
        
        return {
          ...resep,
          detail_pelayanan: pelayanan ? {
            tgl_periksa: pelayanan.tgl_periksa,
            kode_poli: pelayanan.kode_poli,
            nama_poli: poli ? poli.nama_poli : '-',
            diagnosa: pelayanan.diagnosa,
            keluhan: pelayanan.keluhan,
            kode_dokter: pelayanan.kode_dokter
          } : null,
          nama_dokter: dokter ? dokter.nama_dokter : 'Dokter tidak ditemukan',
          spesialisasi_dokter: dokter ? dokter.spesialisasi : '-',
          nama_apoteker: apoteker ? apoteker.nama_apoteker : 'Apoteker tidak ditemukan',
          spesialisasi_apoteker: apoteker ? apoteker.spesialisasi : '-'
        };
      });

      // Hitung total semua resep
      const totalSemuaResep = resepDetail.reduce((sum, resep) => sum + resep.total_harga, 0);

      const response = {
        success: true,
        message: `✅ ${resepDetail.length} resep ditemukan untuk pasien ${no_pasien}`,
        metadata: {
          timestamp: new Date().toISOString(),
          no_pasien: no_pasien,
          nama_pasien: pasien.nama_pasien,
          filter_tanggal: tanggal_pelayanan || 'Semua tanggal',
          total_resep: resepDetail.length,
          total_registrasi: noRegList.length
        },
        data: {
          // Info pasien dari masterPasien
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
            status_perkawinan: pasien.status_perkawinan
          },
          
          // Ringkasan
          ringkasan: {
            total_resep: resepDetail.length,
            total_registrasi: noRegList.length,
            total_obat: resepDetail.reduce((sum, resep) => sum + resep.detail_obat.length, 0),
            total_harga: totalSemuaResep,
            total_harga_format: formatRupiah(totalSemuaResep),
            resep_selesai: resepDetail.filter(r => r.status_resep === 'SELESAI').length,
            resep_proses: resepDetail.filter(r => r.status_resep === 'PROSES').length,
            resep_lunas: resepDetail.filter(r => r.status_bayar === 'LUNAS').length,
            resep_belum_bayar: resepDetail.filter(r => r.status_bayar === 'BELUM').length
          },
          
          // Detail resep
          resep: resepDetail.map((resep, index) => ({
            no: index + 1,
            no_resep: resep.no_resep,
            no_reg: resep.no_reg,
            tgl_resep: formatTanggal(resep.tgl_resep),
            jam_resep: formatJam(resep.tgl_resep),
            
            info_dokter: {
              kode_dokter: resep.dokter,
              nama_dokter: resep.nama_dokter,
              spesialisasi: resep.spesialisasi_dokter
            },
            
            info_pelayanan: resep.detail_pelayanan ? {
              tgl_periksa: formatTanggal(resep.detail_pelayanan.tgl_periksa),
              diagnosa: resep.detail_pelayanan.diagnosa,
              keluhan: resep.detail_pelayanan.keluhan,
              poli: resep.detail_pelayanan.nama_poli,
              kode_dokter_periksa: resep.detail_pelayanan.kode_dokter,
              nama_dokter_periksa: getNamaDokter(resep.detail_pelayanan.kode_dokter)
            } : { 
              tgl_periksa: '-', 
              diagnosa: '-', 
              keluhan: '-', 
              poli: '-' 
            },
            
            info_apotek: {
              nama_apoteker: resep.nama_apoteker,
              spesialisasi_apoteker: resep.spesialisasi_apoteker,
              status_resep: resep.status_resep,
              status_bayar: resep.status_bayar,
              tgl_entry: formatTanggal(resep.tgl_entry)
            },
            
            detail_obat: resep.detail_obat.map((obat, idx) => ({
              no_obat: idx + 1,
              kode_obat: obat.kode_obat,
              nama_obat: obat.nama_obat,
              jumlah: obat.jumlah,
              satuan: obat.satuan,
              harga_satuan: formatRupiah(obat.harga_satuan),
              harga_satuan_num: obat.harga_satuan,
              sub_total: formatRupiah(obat.sub_total),
              sub_total_num: obat.sub_total,
              aturan_pakai: obat.aturan_pakai || `3x1 ${obat.satuan}`,
              keterangan: 'Habiskan sesuai anjuran dokter'
            })),
            
            ringkasan_resep: {
              total_item: resep.detail_obat.length,
              total_jumlah: resep.detail_obat.reduce((sum, obat) => sum + obat.jumlah, 0),
              total_harga: formatRupiah(resep.total_harga),
              total_harga_num: resep.total_harga,
              status: resep.status_resep,
              pembayaran: resep.status_bayar
            }
          }))
        }
      };
      
      console.log(`✅ [APOTEK] Response berhasil dibuat dengan ${resepDetail.length} resep`);
      res.json(response);
      
    } catch (error) {
      console.log('❌ [APOTEK] Error:', error.message);
      console.log('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data resep',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  },

  // API 2: LIST RESEP BY TANGGAL - DIPERBAIKI
  listResepByTanggal: async (req, res) => {
    try {
      const { tanggal } = req.query;
      
      console.log(`✅ [APOTEK] List resep by tanggal: ${tanggal}`);

      if (!tanggal || tanggal.trim() === '') {
        return res.json({
          success: false,
          message: 'Parameter tanggal diperlukan',
          data_resep: []
        });
      }

      const tglFilter = tanggal.split('T')[0];
      console.log(`   Filter tanggal: ${tglFilter}`);
      
      // Filter resep berdasarkan tanggal
      let filteredResep = dataApotek.filter(resep => {
        const tgl = new Date(resep.tgl_resep).toISOString().split('T')[0];
        const match = tgl === tglFilter;
        if (match) {
          console.log(`   ✅ Resep ${resep.no_resep} match tanggal`);
        }
        return match;
      });

      console.log(`   Jumlah resep ditemukan: ${filteredResep.length}`);

      // Join dengan data pasienRalan dan masterPasien
      const resepLengkap = filteredResep.map(resep => {
        const pelayanan = pasienRalan.find(p => p.no_reg === resep.no_reg);
        const pasien = pelayanan ? masterPasien.find(p => p.no_pasien === pelayanan.no_pasien) : null;
        const dokter = masterDokter.find(d => d.kode_dokter === resep.dokter);
        const apoteker = masterApoteker.find(a => a.kode_apoteker === resep.user_entry);
        
        return {
          ...resep,
          info_pasien: pasien ? {
            no_pasien: pasien.no_pasien,
            nama_pasien: pasien.nama_pasien,
            jenis_kelamin: pasien.jenis_kelamin,
            usia: hitungUmur(pasien.tgl_lahir)
          } : null,
          nama_dokter: dokter ? dokter.nama_dokter : 'Dokter tidak ditemukan',
          nama_apoteker: apoteker ? apoteker.nama_apoteker : 'Apoteker tidak ditemukan',
          tgl_periksa: pelayanan ? pelayanan.tgl_periksa : null
        };
      });

      // Urutkan berdasarkan waktu
      resepLengkap.sort((a, b) => new Date(a.tgl_resep) - new Date(b.tgl_resep));

      // Hitung statistik
      const statistik = {
        total_resep: resepLengkap.length,
        resep_selesai: resepLengkap.filter(r => r.status_resep === 'SELESAI').length,
        resep_proses: resepLengkap.filter(r => r.status_resep === 'PROSES').length,
        total_pasien: [...new Set(resepLengkap.map(r => r.info_pasien?.no_pasien).filter(Boolean))].length,
        total_harga: resepLengkap.reduce((sum, r) => sum + r.total_harga, 0),
        total_obat: resepLengkap.reduce((sum, r) => sum + r.detail_obat.length, 0)
      };

      const response = {
        success: true,
        message: `✅ ${resepLengkap.length} resep ditemukan untuk tanggal ${tglFilter}`,
        filter: {
          tanggal: tglFilter,
          format_tanggal: formatTanggalOnly(tglFilter)
        },
        statistik: {
          ...statistik,
          total_harga_format: formatRupiah(statistik.total_harga)
        },
        data_resep: resepLengkap.map((resep, index) => ({
          no: index + 1,
          no_resep: resep.no_resep,
          no_reg: resep.no_reg,
          tgl_resep: formatTanggal(resep.tgl_resep),
          
          info_pasien: resep.info_pasien ? {
            no_pasien: resep.info_pasien.no_pasien,
            nama_pasien: resep.info_pasien.nama_pasien,
            jenis_kelamin: resep.info_pasien.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
            usia: resep.info_pasien.usia
          } : { no_pasien: '-', nama_pasien: 'Tidak ditemukan' },
          
          info_dokter: {
            kode_dokter: resep.dokter,
            nama_dokter: resep.nama_dokter
          },
          
          info_apotek: {
            nama_apoteker: resep.nama_apoteker,
            status_resep: resep.status_resep,
            status_bayar: resep.status_bayar,
            total_harga: formatRupiah(resep.total_harga)
          },
          
          ringkasan_obat: {
            jumlah_item: resep.detail_obat.length,
            obat_pertama: resep.detail_obat[0]?.nama_obat || '-',
            jumlah_total: resep.detail_obat.reduce((sum, obat) => sum + obat.jumlah, 0)
          },
          
          detail_obat_singkat: resep.detail_obat.map((obat, idx) => ({
            no: idx + 1,
            nama: obat.nama_obat,
            jumlah: `${obat.jumlah} ${obat.satuan}`,
            harga: formatRupiah(obat.sub_total)
          })).slice(0, 3) // Tampilkan maksimal 3 obat
        }))
      };
      
      res.json(response);
      
    } catch (error) {
      console.log('❌ [APOTEK] Error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data resep',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  },

  // API 3: DETAIL RESEP BY NO_RESEP - DIPERBAIKI
  detailResep: async (req, res) => {
    try {
      const { no_resep } = req.params;
      
      console.log(`✅ [APOTEK] Detail resep: ${no_resep}`);

      // Cari resep
      const resep = dataApotek.find(r => r.no_resep === no_resep);
      
      if (!resep) {
        return res.json({
          success: false,
          message: `Resep ${no_resep} tidak ditemukan`
        });
      }

      console.log(`   ✅ Resep ditemukan: ${resep.no_resep} untuk no_reg: ${resep.no_reg}`);

      // Cari data pelayanan
      const pelayanan = pasienRalan.find(p => p.no_reg === resep.no_reg);
      
      // Cari data pasien
      const pasien = pelayanan ? masterPasien.find(p => p.no_pasien === pelayanan.no_pasien) : null;
      
      // Cari data dokter
      const dokter = masterDokter.find(d => d.kode_dokter === resep.dokter);
      
      // Cari data poli
      const poli = pelayanan ? masterPoli.find(p => p.kode_poli === pelayanan.kode_poli) : null;
      
      // Cari data apoteker
      const apoteker = masterApoteker.find(a => a.kode_apoteker === resep.user_entry);
      
      // Format data detail obat dengan info lengkap
      const detailObatLengkap = resep.detail_obat.map(obat => {
        const obatMaster = masterObat.find(o => o.kode_obat === obat.kode_obat);
        return {
          ...obat,
          golongan: obatMaster ? obatMaster.golongan : '-',
          harga_standar: obatMaster ? obatMaster.harga : 0,
          selisih_harga: obatMaster ? obat.harga_satuan - obatMaster.harga : 0
        };
      });

      const response = {
        success: true,
        message: '✅ Detail resep ditemukan',
        metadata: {
          no_resep: no_resep,
          no_reg: resep.no_reg,
          timestamp: new Date().toISOString()
        },
        data: {
          // Info resep
          info_resep: {
            no_resep: resep.no_resep,
            no_reg: resep.no_reg,
            tgl_resep: formatTanggal(resep.tgl_resep),
            jam_resep: formatJam(resep.tgl_resep),
            status_resep: resep.status_resep,
            status_bayar: resep.status_bayar,
            total_harga: formatRupiah(resep.total_harga),
            total_harga_num: resep.total_harga
          },
          
          // Info pasien
          info_pasien: pasien ? {
            no_pasien: pasien.no_pasien,
            nama_pasien: pasien.nama_pasien,
            tgl_lahir: formatTanggalOnly(pasien.tgl_lahir),
            usia: hitungUmur(pasien.tgl_lahir),
            jenis_kelamin: pasien.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
            alamat: pasien.alamat,
            telepon: pasien.telepon,
            gol_darah: pasien.gol_darah,
            alergi: pasien.alergi
          } : null,
          
          // Info pelayanan
          info_pelayanan: pelayanan ? {
            tgl_periksa: formatTanggal(pelayanan.tgl_periksa),
            jam_periksa: formatJam(pelayanan.jam_periksa),
            diagnosa: pelayanan.diagnosa,
            keluhan: pelayanan.keluhan,
            tindakan: pelayanan.tindakan,
            poli: poli ? poli.nama_poli : '-',
            dokter_periksa: getNamaDokter(pelayanan.kode_dokter),
            kode_dokter_periksa: pelayanan.kode_dokter
          } : null,
          
          // Info dokter peresep
          info_dokter: {
            kode_dokter: resep.dokter,
            nama_dokter: dokter ? dokter.nama_dokter : 'Dokter tidak ditemukan',
            spesialisasi: dokter ? dokter.spesialisasi : '-'
          },
          
          // Info apotek
          info_apotek: {
            nama_apoteker: apoteker ? apoteker.nama_apoteker : 'Apoteker tidak ditemukan',
            spesialisasi_apoteker: apoteker ? apoteker.spesialisasi : '-',
            user_entry: resep.user_entry,
            tgl_entry: formatTanggal(resep.tgl_entry),
            tgl_selesai: resep.status_resep === 'SELESAI' ? formatTanggal(resep.tgl_entry) : '-'
          },
          
          // Detail obat
          detail_obat: detailObatLengkap.map((obat, index) => ({
            no: index + 1,
            kode_obat: obat.kode_obat,
            nama_obat: obat.nama_obat,
            golongan: obat.golongan,
            jumlah: obat.jumlah,
            satuan: obat.satuan,
            harga_satuan: formatRupiah(obat.harga_satuan),
            harga_satuan_num: obat.harga_satuan,
            harga_standar: formatRupiah(obat.harga_standar),
            selisih_harga: formatRupiah(obat.selisih_harga),
            sub_total: formatRupiah(obat.sub_total),
            sub_total_num: obat.sub_total,
            aturan_pakai: obat.aturan_pakai || `3x1 ${obat.satuan}`,
            keterangan: `Habiskan, ${obat.jumlah} ${obat.satuan}`
          })),
          
          // Ringkasan
          ringkasan: {
            total_item: detailObatLengkap.length,
            total_jumlah: detailObatLengkap.reduce((sum, obat) => sum + obat.jumlah, 0),
            total_harga: formatRupiah(resep.total_harga),
            rata_harga: formatRupiah(resep.total_harga / detailObatLengkap.length),
            obat_keras: detailObatLengkap.filter(o => o.golongan === 'OBAT KERAS').length,
            obat_bebas: detailObatLengkap.filter(o => o.golongan === 'OBAT BEBAS').length,
            suplemen: detailObatLengkap.filter(o => o.golongan === 'SUPLEMEN').length
          }
        }
      };
      
      res.json(response);
      
    } catch (error) {
      console.log('❌ [APOTEK] Error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil detail resep',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  },

  // API 4: GET OBAT BY NO_REG - DIPERBAIKI
  getObatByNoReg: async (req, res) => {
    try {
      const { no_reg } = req.params;
      
      console.log(`✅ [APOTEK] Get obat by no_reg: ${no_reg}`);

      // Cari resep berdasarkan no_reg
      const resepList = dataApotek.filter(r => r.no_reg === no_reg);
      
      console.log(`   Jumlah resep ditemukan: ${resepList.length}`);
      
      if (resepList.length === 0) {
        return res.json({
          success: true,
          message: 'Tidak ada resep untuk registrasi ini',
          data: {
            no_reg: no_reg,
            resep: []
          }
        });
      }

      // Cari data pelayanan
      const pelayanan = pasienRalan.find(p => p.no_reg === no_reg);
      
      // Cari data pasien
      const pasien = pelayanan ? masterPasien.find(p => p.no_pasien === pelayanan.no_pasien) : null;
      
      // Gabungkan semua detail obat dari semua resep
      const semuaObat = resepList.flatMap(resep => 
        resep.detail_obat.map(obat => ({
          ...obat,
          no_resep: resep.no_resep,
          tgl_resep: resep.tgl_resep,
          status_resep: resep.status_resep,
          status_bayar: resep.status_bayar
        }))
      );

      console.log(`   Total obat ditemukan: ${semuaObat.length}`);

      const response = {
        success: true,
        message: `✅ ${semuaObat.length} item obat ditemukan untuk registrasi ${no_reg}`,
        metadata: {
          no_reg: no_reg,
          total_resep: resepList.length,
          total_obat: semuaObat.length,
          timestamp: new Date().toISOString()
        },
        data: {
          info_registrasi: {
            no_reg: no_reg,
            no_pasien: pasien ? pasien.no_pasien : '-',
            nama_pasien: pasien ? pasien.nama_pasien : '-',
            tgl_periksa: pelayanan ? formatTanggal(pelayanan.tgl_periksa) : '-',
            diagnosa: pelayanan ? pelayanan.diagnosa : '-',
            keluhan: pelayanan ? pelayanan.keluhan : '-'
          },
          
          ringkasan: {
            jumlah_resep: resepList.length,
            jumlah_obat: semuaObat.length,
            total_harga: semuaObat.reduce((sum, obat) => sum + obat.sub_total, 0),
            total_harga_format: formatRupiah(semuaObat.reduce((sum, obat) => sum + obat.sub_total, 0)),
            resep_selesai: resepList.filter(r => r.status_resep === 'SELESAI').length,
            resep_proses: resepList.filter(r => r.status_resep === 'PROSES').length,
            resep_lunas: resepList.filter(r => r.status_bayar === 'LUNAS').length
          },
          
          daftar_obat: semuaObat.map((obat, index) => ({
            no: index + 1,
            kode_obat: obat.kode_obat,
            nama_obat: obat.nama_obat,
            jumlah: `${obat.jumlah} ${obat.satuan}`,
            harga_satuan: formatRupiah(obat.harga_satuan),
            sub_total: formatRupiah(obat.sub_total),
            no_resep: obat.no_resep,
            tgl_resep: formatTanggal(obat.tgl_resep),
            status_resep: obat.status_resep,
            aturan_pakai: obat.aturan_pakai || `3x1 ${obat.satuan}`,
            keterangan: 'Diminum sesuai anjuran dokter'
          })),
          
          resep_list: resepList.map(resep => ({
            no_resep: resep.no_resep,
            tgl_resep: formatTanggal(resep.tgl_resep),
            status: resep.status_resep,
            pembayaran: resep.status_bayar,
            jumlah_obat: resep.detail_obat.length,
            total_harga: formatRupiah(resep.total_harga)
          }))
        }
      };
      
      res.json(response);
      
    } catch (error) {
      console.log('❌ [APOTEK] Error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data obat',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
};

module.exports = apotekController;