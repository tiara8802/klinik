const { masterPasien, pasienRalan, masterDokter, masterPoli } = require('../data/mockdata');
const { pasienIgd, masterRuanganIgd, petugasIgd, tindakanIgd, masterTriase } = require('../data/resume');
const {
  formatRupiah,
  formatTanggal,
  formatTanggalOnly,
  formatJam,
  hitungUmur,
  getNamaDokter,
  getNamaPoli
} = require('../helpers/helper');

const resumeController = {
  // API 1: GET RESUME MEDIS PASIEN - JOIN LENGKAP
  getResumeMedis: async (req, res) => {
    try {
      const { no_pasien, tanggal_pelayanan, jenis_pelayanan } = req.query;
      
      console.log(`✅ Get resume medis: no_pasien=${no_pasien}, tanggal=${tanggal_pelayanan}, jenis=${jenis_pelayanan}`);

      if (!no_pasien) {
        return res.json({
          success: false,
          message: 'Parameter no_pasien (no_rm) diperlukan'
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

      // Data dari pasienRalan (Rawat Jalan)
      let dataRalan = pasienRalan.filter(p => p.no_pasien === no_pasien);
      
      if (tanggal_pelayanan) {
        const tglFilter = tanggal_pelayanan.split('T')[0];
        dataRalan = dataRalan.filter(p => {
          const tgl = new Date(p.tgl_periksa).toISOString().split('T')[0];
          return tgl === tglFilter;
        });
      }

      // Data dari pasienIgd (IGD)
      let dataIgd = pasienIgd.filter(p => p.no_rm === no_pasien);
      
      if (tanggal_pelayanan) {
        const tglFilter = tanggal_pelayanan.split('T')[0];
        dataIgd = dataIgd.filter(p => {
          const tgl = new Date(p.tgl_masuk).toISOString().split('T')[0];
          return tgl === tglFilter;
        });
      }

      // Filter by jenis pelayanan jika ada
      if (jenis_pelayanan === 'ralan') {
        dataIgd = [];
      } else if (jenis_pelayanan === 'igd') {
        dataRalan = [];
      }

      // Format data Ralan dengan detail lengkap
      const ralanFormatted = dataRalan.map((ralan) => {
        const dokter = masterDokter.find(d => d.kode_dokter === ralan.kode_dokter);
        const poli = masterPoli.find(p => p.kode_poli === ralan.kode_poli);
        
        // Generate SOAP dari data Ralan
        const soap = generateSoapFromRalan(ralan);
        
        return {
          jenis_pelayanan: 'RAWAT_JALAN',
          no_reg: ralan.no_reg,
          tgl_pelayanan: ralan.tgl_periksa,
          jam_pelayanan: ralan.jam_periksa,
          tgl_formatted: formatTanggal(ralan.tgl_periksa),
          
          // SOAP Record LENGKAP
          soap_record: {
            keluhan_utama: soap.keluhan_utama,
            subjective: soap.subjective,
            objective: soap.objective,
            assessment: soap.assessment,
            plan: soap.plan
          },
          
          // Informasi Lokasi LENGKAP
          info_lokasi: {
            jenis: 'POLIKLINIK',
            kode_poli: ralan.kode_poli,
            nama_poli: poli ? poli.nama_poli : 'POLI TIDAK DIKETAHUI',
            lokasi_poli: poli ? poli.lokasi : '-',
            tingkat: 'RAWAT JALAN'
          },
          
          // Informasi Dokter LENGKAP
          info_dokter: {
            kode_dokter: ralan.kode_dokter,
            nama_dokter: dokter ? dokter.nama_dokter : 'Dokter tidak ditemukan',
            spesialisasi: dokter ? dokter.spesialisasi : '-',
            jenis: dokter ? (dokter.spesialisasi.includes('Sp.A') ? 'DOKTER SPESIALIS ANAK' : 'DOKTER SPESIALIS PENYAKIT DALAM') : 'DOKTER UMUM'
          },
          
          // Informasi Medis LENGKAP
          info_medis: {
            status_pasien: ralan.status_pasien,
            jenis_kunjungan: ralan.jenis_kunjungan,
            diagnosa_utama: ralan.diagnosa || '-',
            tindakan_medis: ralan.tindakan || '-',
            keluhan: ralan.keluhan || '-',
            kode_tarif: ralan.kode_tarif,
            status_bayar: ralan.status_bayar,
            tgl_bayar: ralan.tgl_bayar ? formatTanggal(ralan.tgl_bayar) : '-'
          },
          
          // Informasi Administrasi
          info_administrasi: {
            user_entry: ralan.user_entry,
            tgl_entry: formatTanggal(ralan.tgl_entry),
            tarif_bpjs: formatRupiah(ralan.tarif_bpjs),
            tarif_rumahsakit: formatRupiah(ralan.tarif_rumahsakit),
            total_tarif: formatRupiah(ralan.tarif_bpjs + ralan.tarif_rumahsakit)
          }
        };
      });

      // Format data IGD dengan detail LENGKAP
      const igdFormatted = dataIgd.map((igd) => {
        const dokter = petugasIgd.find(d => d.id_petugas === igd.dokter_igd);
        const perawat = petugasIgd.find(p => p.id_petugas === igd.perawat_igd);
        const ruangan = masterRuanganIgd.find(r => r.kode_ruangan === igd.ruangan);
        const triase = masterTriase.find(t => t.kode_triase === igd.triase);
        
        // Detail tindakan
        const detailTindakan = igd.tindakan.map(kode => {
          const tindakan = tindakanIgd.find(t => t.kode_tindakan === kode);
          return tindakan ? {
            kode: tindakan.kode_tindakan,
            nama: tindakan.nama_tindakan,
            biaya: formatRupiah(tindakan.biaya)
          } : null;
        }).filter(t => t !== null);
        
        return {
          jenis_pelayanan: 'IGD',
          no_reg: igd.no_reg,
          tgl_pelayanan: igd.tgl_masuk,
          jam_pelayanan: igd.jam_masuk,
          tgl_formatted: formatTanggal(igd.tgl_masuk),
          
          // SOAP Record LENGKAP langsung dari IGD
          soap_record: {
            keluhan_utama: igd.keluhan_utama || '-',
            subjective: igd.s || '-',
            objective: igd.o || '-',
            assessment: igd.a || '-',
            plan: igd.p || '-'
          },
          
          // Informasi Lokasi LENGKAP
          info_lokasi: {
            jenis: 'INSTALASI GAWAT DARURAT',
            kode_ruangan: igd.ruangan,
            nama_ruangan: ruangan ? ruangan.nama_ruangan : 'IGD',
            lokasi_ruangan: ruangan ? ruangan.lokasi : 'Lt. 1 Emergency',
            zona: triase ? triase.nama_triase : '-'
          },
          
          // Informasi Triase LENGKAP
          info_triase: {
            kode_triase: igd.triase,
            nama_triase: triase ? triase.nama_triase : '-',
            deskripsi: triase ? triase.deskripsi : '-',
            warna: triase ? triase.warna : '#000000',
            waktu_respon: triase ? getWaktuRespon(igd.triase) : '-'
          },
          
          // Informasi Tim Medis LENGKAP
          info_tim_medis: {
            dokter_penanggungjawab: dokter ? dokter.nama : 'Dokter tidak ditemukan',
            jabatan_dokter: dokter ? dokter.jabatan : '-',
            shift_dokter: dokter ? dokter.shift : '-',
            perawat_penanggungjawab: perawat ? perawat.nama : 'Perawat tidak ditemukan',
            jabatan_perawat: perawat ? perawat.jabatan : '-',
            shift_perawat: perawat ? perawat.shift : '-'
          },
          
          // Informasi Medis LENGKAP
          info_medis: {
            status_pasien: igd.status_pasien,
            tgl_masuk: formatTanggal(igd.tgl_masuk),
            tgl_keluar: igd.tgl_keluar ? formatTanggal(igd.tgl_keluar) : 'Masih dirawat',
            jam_masuk: formatJam(igd.jam_masuk),
            jam_keluar: igd.jam_keluar ? formatJam(igd.jam_keluar) : '-',
            durasi_perawatan: igd.tgl_keluar ? hitungDurasi(igd.tgl_masuk, igd.tgl_keluar) : 'Sedang berlangsung',
            asuransi: igd.asuransi || '-',
            penanggung_jawab: igd.penanggung_jawab || '-',
            hubungan_pj: igd.hubungan_pj || '-',
            telepon_pj: igd.telepon_pj || '-'
          },
          
          // Hasil Laboratorium LENGKAP
          hasil_laboratorium: igd.hasil_lab || {},
          
          // Tindakan yang dilakukan LENGKAP
          tindakan_dilakukan: {
            daftar_tindakan: detailTindakan,
            total_tindakan: detailTindakan.length,
            biaya_total: formatRupiah(detailTindakan.reduce((sum, t) => {
              const biaya = t.biaya.replace('Rp ', '').replace(/\./g, '');
              return sum + parseInt(biaya) || 0;
            }, 0))
          },
          
          // Catatan Khusus
          catatan_khusus: igd.catatan_khusus || 'Tidak ada catatan khusus',
          
          // Informasi Administrasi
          info_administrasi: {
            user_entry: igd.user_entry,
            tgl_entry: formatTanggal(igd.tgl_entry),
            catatan_administrasi: 'Rekam medis IGD lengkap'
          }
        };
      });

      // Gabungkan dan urutkan semua data
      const semuaPelayanan = [...ralanFormatted, ...igdFormatted];
      semuaPelayanan.sort((a, b) => new Date(b.tgl_pelayanan) - new Date(a.tgl_pelayanan));

      // Hitung statistik LENGKAP
      const statistik = {
        total_pelayanan: semuaPelayanan.length,
        total_ralan: ralanFormatted.length,
        total_igd: igdFormatted.length,
        pelayanan_hari_ini: tanggal_pelayanan ? semuaPelayanan.length : null,
        triase_merah: igdFormatted.filter(p => p.info_triase.kode_triase === 'MERAH').length,
        triase_kuning: igdFormatted.filter(p => p.info_triase.kode_triase === 'KUNING').length,
        triase_hijau: igdFormatted.filter(p => p.info_triase.kode_triase === 'HIJAU').length,
        status_rawat_jalan: {
          baru: ralanFormatted.filter(p => p.info_medis.status_pasien === 'BARU').length,
          lama: ralanFormatted.filter(p => p.info_medis.status_pasien === 'LAMA').length
        }
      };

      // Analisis medis LENGKAP
      const analisisMedis = {
        diagnosa_terbanyak: getDiagnosaTerbanyak(semuaPelayanan),
        keluhan_terbanyak: getKeluhanTerbanyak(semuaPelayanan),
        tingkat_keparahan: getTingkatKeparahanLengkap(semuaPelayanan),
        pola_kunjungan: getPolaKunjungan(semuaPelayanan),
        risiko_kesehatan: getRisikoKesehatan(pasien, semuaPelayanan),
        rekomendasi_tindak_lanjut: getRekomendasiTindakLanjut(semuaPelayanan)
      };

      // Ringkasan timeline LENGKAP
      const timeline = semuaPelayanan.map(p => ({
        tanggal: p.tgl_formatted,
        jenis: p.jenis_pelayanan,
        lokasi: p.info_lokasi.nama_poli || p.info_lokasi.nama_ruangan,
        diagnosa: p.jenis_pelayanan === 'RAWAT_JALAN' ? p.info_medis.diagnosa_utama : p.soap_record.assessment.split('\n')[0],
        status: p.info_medis.status_pasien
      }));

      const response = {
        success: true,
        message: `✅ Resume medis ditemukan untuk pasien ${no_pasien}`,
        metadata: {
          pasien_teridentifikasi: true,
          total_data: semuaPelayanan.length,
          filter_diterapkan: {
            tanggal_pelayanan: tanggal_pelayanan || 'Semua tanggal',
            jenis_pelayanan: jenis_pelayanan || 'Semua jenis',
            periode: tanggal_pelayanan ? `Hari spesifik` : 'Semua waktu'
          },
          timestamp: new Date().toISOString()
        },
        
        data: {
          // INFO PASIEN LENGKAP
          info_pasien: {
            identitas: {
              no_pasien: pasien.no_pasien,
              nama_pasien: pasien.nama_pasien,
              tgl_lahir: formatTanggalOnly(pasien.tgl_lahir),
              tempat_lahir: 'Jakarta',
              usia: hitungUmur(pasien.tgl_lahir),
              jenis_kelamin: pasien.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
              agama: pasien.agama || 'Islam',
              pendidikan: 'SMA',
              pekerjaan: pasien.pekerjaan || '-'
            },
            
            kontak: {
              alamat: pasien.alamat,
              telepon: pasien.telepon,
              email: '-'
            },
            
            data_medis: {
              gol_darah: pasien.gol_darah || 'Tidak diketahui',
              alergi: pasien.alergi || 'Tidak ada',
              riwayat_penyakit_keluarga: 'Hipertensi, Diabetes',
              kebiasaan: {
                merokok: 'Tidak',
                alkohol: 'Tidak',
                obat_terlarang: 'Tidak'
              }
            },
            
            data_keluarga: {
              nama_kk: pasien.nama_kk || '-',
              hubungan_kk: pasien.hubungan_kk || '-',
              status_perkawinan: pasien.status_perkawinan || '-',
              jumlah_anak: '2'
            },
            
            administrasi: {
              tgl_daftar: formatTanggalOnly(pasien.tgl_daftar),
              status_pasien: pasien.status_pasien,
              nomor_bpjs: '0001234567890',
              kelas_bpjs: '3',
              faskes_tingkat1: 'Puskesmas Melati'
            }
          },
          
          // STATISTIK LENGKAP
          statistik: statistik,
          
          // ANALISIS MEDIS LENGKAP
          analisis_medis: analisisMedis,
          
          // TIMELINE KUNJUNGAN
          timeline_kunjungan: timeline,
          
          // RESUME MEDIS DETAIL
          resume_medis: semuaPelayanan.map((pelayanan, index) => ({
            urutan: index + 1,
            jenis_pelayanan: pelayanan.jenis_pelayanan === 'RAWAT_JALAN' ? 'Rawat Jalan' : 'Instalasi Gawat Darurat',
            no_registrasi: pelayanan.no_reg,
            tanggal_waktu: pelayanan.tgl_formatted,
            
            // SOAP RECORD LENGKAP
            catatan_klinis: {
              keluhan_utama: {
                label: 'Keluhan Utama',
                value: pelayanan.soap_record.keluhan_utama,
                tipe: 'utama'
              },
              subjective: {
                label: 'Subjective (S)',
                value: pelayanan.soap_record.subjective,
                tipe: 'subjective',
                komponen: ['Keluhan', 'Riwayat Penyakit', 'Riwayat Pengobatan', 'Riwayat Keluarga']
              },
              objective: {
                label: 'Objective (O)',
                value: pelayanan.soap_record.objective,
                tipe: 'objective',
                komponen: ['Tanda Vital', 'Pemeriksaan Fisik', 'Hasil Laboratorium', 'Hasil Radiologi']
              },
              assessment: {
                label: 'Assessment (A)',
                value: pelayanan.soap_record.assessment,
                tipe: 'assessment',
                komponen: ['Diagnosa Utama', 'Diagnosa Sekunder', 'Masalah Klinis', 'Masalah Potensial']
              },
              plan: {
                label: 'Plan (P)',
                value: pelayanan.soap_record.plan,
                tipe: 'plan',
                komponen: ['Terapi Medikamentosa', 'Terapi Non-Medikamentosa', 'Edukasi', 'Follow Up']
              }
            },
            
            // LOKASI PELAYANAN
            lokasi_pelayanan: {
              jenis: pelayanan.info_lokasi.jenis,
              nama: pelayanan.info_lokasi.nama_poli || pelayanan.info_lokasi.nama_ruangan,
              lokasi: pelayanan.info_lokasi.lokasi_poli || pelayanan.info_lokasi.lokasi_ruangan,
              zona: pelayanan.info_triase ? pelayanan.info_triase.zona : 'REGULER'
            },
            
            // TIM MEDIS
            tim_medis: pelayanan.jenis_pelayanan === 'RAWAT_JALAN' ? {
              dokter_penanggungjawab: pelayanan.info_dokter.nama_dokter,
              spesialisasi: pelayanan.info_dokter.spesialisasi,
              perawat: '-',
              kategori: pelayanan.info_dokter.jenis
            } : {
              dokter_penanggungjawab: pelayanan.info_tim_medis.dokter_penanggungjawab,
              jabatan: pelayanan.info_tim_medis.jabatan_dokter,
              perawat_penanggungjawab: pelayanan.info_tim_medis.perawat_penanggungjawab,
              shift: pelayanan.info_tim_medis.shift_dokter
            },
            
            // STATUS DAN TRIASE
            status: pelayanan.jenis_pelayanan === 'RAWAT_JALAN' ? {
              status_pasien: pelayanan.info_medis.status_pasien,
              jenis_kunjungan: pelayanan.info_medis.jenis_kunjungan,
              status_bayar: pelayanan.info_medis.status_bayar
            } : {
              status_pasien: pelayanan.info_medis.status_pasien,
              triase: pelayanan.info_triase.nama_triase,
              warna_triase: pelayanan.info_triase.warna,
              waktu_respon: pelayanan.info_triase.waktu_respon,
              asuransi: pelayanan.info_medis.asuransi
            },
            
            // HASIL DAN TINDAKAN
            hasil_tindakan: pelayanan.jenis_pelayanan === 'IGD' ? {
              hasil_lab: pelayanan.hasil_laboratorium,
              tindakan: pelayanan.tindakan_dilakukan.daftar_tindakan,
              catatan_khusus: pelayanan.catatan_khusus
            } : null,
            
            // ADMINISTRASI
            administrasi: {
              user_entry: pelayanan.info_administrasi.user_entry,
              tgl_entry: pelayanan.info_administrasi.tgl_entry,
              ...(pelayanan.jenis_pelayanan === 'RAWAT_JALAN' && {
                tarif: pelayanan.info_administrasi.total_tarif
              })
            }
          })),
          
          // RINGKASAN PER JENIS PELAYANAN LENGKAP
          ringkasan_per_jenis: {
            rawat_jalan: {
              total: ralanFormatted.length,
              poli_terbanyak: getPoliTerbanyak(ralanFormatted),
              diagnosa_terbanyak: getDiagnosaRalanTerbanyak(ralanFormatted),
              dokter_terbanyak: getDokterRalanTerbanyak(ralanFormatted),
              rata_rata_kunjungan: ralanFormatted.length > 0 ? (ralanFormatted.length / 30).toFixed(1) + '/bulan' : '0'
            },
            igd: {
              total: igdFormatted.length,
              triase_distribusi: {
                merah: igdFormatted.filter(p => p.info_triase.kode_triase === 'MERAH').length,
                kuning: igdFormatted.filter(p => p.info_triase.kode_triase === 'KUNING').length,
                hijau: igdFormatted.filter(p => p.info_triase.kode_triase === 'HIJAU').length
              },
              penyebab_terbanyak: getPenyebabIgdTerbanyak(igdFormatted),
              rata_durasi: getRataDurasiIgd(igdFormatted),
              status_keluar: {
                pulang: igdFormatted.filter(p => p.info_medis.status_pasien === 'PULANG').length,
                dirawat: igdFormatted.filter(p => p.info_medis.status_pasien.includes('DIRAWAT')).length,
                rujuk: igdFormatted.filter(p => p.info_medis.status_pasien.includes('DIRUJUK')).length
              }
            }
          },
          
          // REKOMENDASI
          rekomendasi: {
            medis: [
              'Kontrol rutin penyakit kronis',
              'Monitoring tekanan darah harian',
              'Diet rendah garam dan gula',
              'Olahraga teratur 3x seminggu'
            ],
            administrasi: [
              'Perbarui data BPJS setiap tahun',
              'Bawa kartu identitas saat berobat',
              'Simpan semua hasil pemeriksaan'
            ]
          }
        }
      };
      
      res.json(response);
      
    } catch (error) {
      console.log('⚠️  Error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil resume medis',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  },

  // API 2: GET DETAIL SOAP BY NO_REG - LENGKAP
  getDetailSoap: async (req, res) => {
    try {
      const { no_reg } = req.params;
      
      console.log(`✅ Get detail SOAP: ${no_reg}`);

      // Cari di pasienRalan
      let pelayanan = pasienRalan.find(p => p.no_reg === no_reg);
      let jenis = 'RAWAT_JALAN';
      let sourceData = 'pasienRalan';
      
      // Jika tidak ditemukan di Ralan, cari di IGD
      if (!pelayanan) {
        pelayanan = pasienIgd.find(p => p.no_reg === no_reg);
        jenis = 'IGD';
        sourceData = 'pasienIgd';
      }
      
      if (!pelayanan) {
        return res.json({
          success: false,
          message: 'Data pelayanan tidak ditemukan',
          detail: `No registrasi ${no_reg} tidak ditemukan di database`
        });
      }

      // Cari data pasien
      const no_pasien = jenis === 'RAWAT_JALAN' ? pelayanan.no_pasien : pelayanan.no_rm;
      const pasien = masterPasien.find(p => p.no_pasien === no_pasien);
      
      if (!pasien) {
        return res.json({
          success: false,
          message: 'Data pasien tidak ditemukan'
        });
      }

      let detailData = {};
      
      if (jenis === 'RAWAT_JALAN') {
        const dokter = masterDokter.find(d => d.kode_dokter === pelayanan.kode_dokter);
        const poli = masterPoli.find(p => p.kode_poli === pelayanan.kode_poli);
        
        detailData = {
          jenis: 'RAWAT_JALAN',
          info_pelayanan: {
            no_reg: pelayanan.no_reg,
            no_pasien: pelayanan.no_pasien,
            tgl_periksa: formatTanggal(pelayanan.tgl_periksa),
            jam_periksa: formatJam(pelayanan.jam_periksa),
            kode_poli: pelayanan.kode_poli,
            kode_dokter: pelayanan.kode_dokter
          },
          
          soap_detail: {
            keluhan_utama: pelayanan.keluhan || '-',
            subjective: generateSubjectiveRalan(pelayanan, pasien),
            objective: generateObjectiveRalan(pelayanan),
            assessment: pelayanan.diagnosa || 'Dalam observasi',
            plan: generatePlanRalan(pelayanan)
          },
          
          info_lokasi: {
            jenis: 'POLIKLINIK',
            kode: pelayanan.kode_poli,
            nama: poli ? poli.nama_poli : 'POLI TIDAK DIKETAHUI',
            lokasi: poli ? poli.lokasi : '-',
            tingkat: 'RAWAT JALAN'
          },
          
          info_dokter: {
            kode: pelayanan.kode_dokter,
            nama: dokter ? dokter.nama_dokter : 'Dokter tidak ditemukan',
            spesialisasi: dokter ? dokter.spesialisasi : '-',
            sip: '12345/SIP/2023'
          },
          
          info_medis: {
            status_pasien: pelayanan.status_pasien,
            jenis_kunjungan: pelayanan.jenis_kunjungan,
            diagnosa: pelayanan.diagnosa || '-',
            tindakan: pelayanan.tindakan || '-',
            kode_tarif: pelayanan.kode_tarif
          },
          
          info_administrasi: {
            tarif_bpjs: formatRupiah(pelayanan.tarif_bpjs),
            tarif_rumahsakit: formatRupiah(pelayanan.tarif_rumahsakit),
            total_tarif: formatRupiah(pelayanan.tarif_bpjs + pelayanan.tarif_rumahsakit),
            status_bayar: pelayanan.status_bayar,
            tgl_bayar: pelayanan.tgl_bayar ? formatTanggal(pelayanan.tgl_bayar) : '-',
            user_entry: pelayanan.user_entry,
            tgl_entry: formatTanggal(pelayanan.tgl_entry)
          }
        };
        
      } else {
        // IGD
        const dokter = petugasIgd.find(d => d.id_petugas === pelayanan.dokter_igd);
        const perawat = petugasIgd.find(p => p.id_petugas === pelayanan.perawat_igd);
        const ruangan = masterRuanganIgd.find(r => r.kode_ruangan === pelayanan.ruangan);
        const triase = masterTriase.find(t => t.kode_triase === pelayanan.triase);
        
        // Detail tindakan
        const detailTindakan = pelayanan.tindakan.map(kode => {
          const tindakan = tindakanIgd.find(t => t.kode_tindakan === kode);
          return tindakan ? {
            kode: tindakan.kode_tindakan,
            nama: tindakan.nama_tindakan,
            biaya: formatRupiah(tindakan.biaya),
            kategori: getKategoriTindakan(tindakan.kode_tindakan)
          } : null;
        }).filter(t => t !== null);
        
        detailData = {
          jenis: 'IGD',
          info_pelayanan: {
            no_reg: pelayanan.no_reg,
            no_rm: pelayanan.no_rm,
            tgl_masuk: formatTanggal(pelayanan.tgl_masuk),
            jam_masuk: formatJam(pelayanan.jam_masuk),
            tgl_keluar: pelayanan.tgl_keluar ? formatTanggal(pelayanan.tgl_keluar) : 'Masih dirawat',
            jam_keluar: pelayanan.jam_keluar ? formatJam(pelayanan.jam_keluar) : '-',
            triase: pelayanan.triase,
            ruangan: pelayanan.ruangan
          },
          
          soap_detail: {
            keluhan_utama: pelayanan.keluhan_utama || '-',
            subjective: pelayanan.s || '-',
            objective: pelayanan.o || '-',
            assessment: pelayanan.a || '-',
            plan: pelayanan.p || '-'
          },
          
          info_triase: {
            kode: pelayanan.triase,
            nama: triase ? triase.nama_triase : '-',
            deskripsi: triase ? triase.deskripsi : '-',
            warna: triase ? triase.warna : '#000000',
            waktu_target: getWaktuRespon(pelayanan.triase)
          },
          
          info_lokasi: {
            jenis: 'INSTALASI GAWAT DARURAT',
            kode: pelayanan.ruangan,
            nama: ruangan ? ruangan.nama_ruangan : 'IGD',
            lokasi: ruangan ? ruangan.lokasi : 'Lt. 1 Emergency',
            zona: pelayanan.triase
          },
          
          info_tim_medis: {
            dokter_penanggungjawab: dokter ? dokter.nama : 'Dokter tidak ditemukan',
            jabatan_dokter: dokter ? dokter.jabatan : '-',
            sip_dokter: '67890/SIP-EM/2023',
            perawat_penanggungjawab: perawat ? perawat.nama : 'Perawat tidak ditemukan',
            jabatan_perawat: perawat ? perawat.jabatan : '-',
            sip_perawat: '54321/SIK/2023'
          },
          
          info_medis: {
            status_pasien: pelayanan.status_pasien,
            asuransi: pelayanan.asuransi || '-',
            penanggung_jawab: pelayanan.penanggung_jawab || '-',
            hubungan_pj: pelayanan.hubungan_pj || '-',
            telepon_pj: pelayanan.telepon_pj || '-',
            durasi: pelayanan.tgl_keluar ? hitungDurasi(pelayanan.tgl_masuk, pelayanan.tgl_keluar) : 'Sedang berlangsung'
          },
          
          hasil_laboratorium: pelayanan.hasil_lab || {},
          
          tindakan_dilakukan: {
            daftar: detailTindakan,
            total: detailTindakan.length,
            biaya_total: formatRupiah(detailTindakan.reduce((sum, t) => {
              const biaya = t.biaya.replace('Rp ', '').replace(/\./g, '');
              return sum + parseInt(biaya) || 0;
            }, 0))
          },
          
          catatan_khusus: pelayanan.catatan_khusus || 'Tidak ada catatan khusus',
          
          info_administrasi: {
            user_entry: pelayanan.user_entry,
            tgl_entry: formatTanggal(pelayanan.tgl_entry),
            catatan: 'Rekam medis IGD lengkap sesuai standar'
          }
        };
      }

      const response = {
        success: true,
        message: `✅ Detail SOAP ditemukan untuk ${no_reg}`,
        metadata: {
          sumber_data: sourceData,
          jenis_pelayanan: jenis,
          timestamp: new Date().toISOString(),
          versi_format: 'SOAP 1.0'
        },
        
        data: {
          // INFO PASIEN
          info_pasien: {
            identitas: {
              no_pasien: no_pasien,
              nama_pasien: pasien.nama_pasien,
              tgl_lahir: formatTanggalOnly(pasien.tgl_lahir),
              usia: hitungUmur(pasien.tgl_lahir),
              jenis_kelamin: pasien.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'
            },
            kontak: {
              alamat: pasien.alamat,
              telepon: pasien.telepon
            },
            medis: {
              gol_darah: pasien.gol_darah,
              alergi: pasien.alergi || 'Tidak ada'
            }
          },
          
          // DETAIL PELAYANAN
          detail_pelayanan: detailData.info_pelayanan,
          
          // REKAM MEDIS SOAP LENGKAP
          rekam_medis: {
            format: 'SOAP (Subjective, Objective, Assessment, Plan)',
            catatan: detailData.soap_detail,
            
            breakdown: {
              subjective: {
                label: 'Data Subjektif',
                komponen: ['Keluhan Utama', 'Riwayat Penyakit Sekarang', 'Riwayat Penyakit Dahulu', 'Riwayat Pengobatan', 'Riwayat Keluarga'],
                nilai: detailData.soap_detail.subjective
              },
              objective: {
                label: 'Data Objektif',
                komponen: ['Tanda Vital', 'Pemeriksaan Fisik', 'Hasil Pemeriksaan Penunjang', 'Observasi Klinis'],
                nilai: detailData.soap_detail.objective
              },
              assessment: {
                label: 'Penilaian Klinis',
                komponen: ['Diagnosa Utama', 'Diagnosa Banding', 'Masalah Klinis', 'Komplikasi'],
                nilai: detailData.soap_detail.assessment
              },
              plan: {
                label: 'Rencana Tatalaksana',
                komponen: ['Terapi Medikamentosa', 'Terapi Non-Medikamentosa', 'Tindakan Medis', 'Edukasi Pasien', 'Follow Up'],
                nilai: detailData.soap_detail.plan
              }
            }
          },
          
          // LOKASI DAN FASILITAS
          lokasi_fasilitas: detailData.info_lokasi,
          
          // TIM MEDIS
          tim_medis: jenis === 'RAWAT_JALAN' ? detailData.info_dokter : detailData.info_tim_medis,
          
          // TRIASE (jika IGD)
          ...(jenis === 'IGD' && { triase: detailData.info_triase }),
          
          // INFORMASI MEDIS
          informasi_medis: detailData.info_medis,
          
          // HASIL DAN TINDAKAN (jika IGD)
          ...(jenis === 'IGD' && {
            hasil_pemeriksaan: detailData.hasil_laboratorium,
            tindakan_medis: detailData.tindakan_dilakukan
          }),
          
          // CATATAN KHUSUS
          ...(jenis === 'IGD' && { catatan_khusus: detailData.catatan_khusus }),
          
          // ADMINISTRASI
          administrasi: detailData.info_administrasi,
          
          // STATUS AKHIR
          status: {
            akhir: detailData.info_medis.status_pasien,
            rekomendasi: getRekomendasiStatus(detailData.info_medis.status_pasien),
            follow_up: getFollowUpRekomendasi(jenis, detailData)
          }
        }
      };
      
      res.json(response);
      
    } catch (error) {
      console.log('⚠️  Error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil detail SOAP',
        error: error.message
      });
    }
  },

  // API 3: GET RIWAYAT SOAP PASIEN - LENGKAP
  getRiwayatSoap: async (req, res) => {
    try {
      const { no_pasien } = req.params;
      const { tahun, bulan, limit } = req.query;
      
      console.log(`✅ Get riwayat SOAP: ${no_pasien}, tahun=${tahun}, bulan=${bulan}`);

      // Cari data master pasien
      const pasien = masterPasien.find(p => p.no_pasien === no_pasien);
      
      if (!pasien) {
        return res.json({
          success: false,
          message: 'Pasien tidak ditemukan'
        });
      }

      // Data dari pasienRalan
      let dataRalan = pasienRalan.filter(p => p.no_pasien === no_pasien);
      
      // Data dari pasienIgd
      let dataIgd = pasienIgd.filter(p => p.no_rm === no_pasien);

      // Filter by tahun dan bulan jika ada
      if (tahun) {
        dataRalan = dataRalan.filter(p => {
          const tgl = new Date(p.tgl_periksa);
          return tgl.getFullYear() == tahun;
        });
        
        dataIgd = dataIgd.filter(p => {
          const tgl = new Date(p.tgl_masuk);
          return tgl.getFullYear() == tahun;
        });
      }
      
      if (bulan) {
        dataRalan = dataRalan.filter(p => {
          const tgl = new Date(p.tgl_periksa);
          return (tgl.getMonth() + 1) == bulan;
        });
        
        dataIgd = dataIgd.filter(p => {
          const tgl = new Date(p.tgl_masuk);
          return (tgl.getMonth() + 1) == bulan;
        });
      }

      // Format data Ralan untuk riwayat
      const riwayatRalan = dataRalan.map(ralan => {
        const dokter = masterDokter.find(d => d.kode_dokter === ralan.kode_dokter);
        const poli = masterPoli.find(p => p.kode_poli === ralan.kode_poli);
        
        return {
          jenis: 'RAWAT_JALAN',
          no_reg: ralan.no_reg,
          tanggal: formatTanggal(ralan.tgl_periksa),
          jam: formatJam(ralan.jam_periksa),
          
          keluhan: ralan.keluhan || '-',
          diagnosa: ralan.diagnosa || '-',
          tindakan: ralan.tindakan || '-',
          
          dokter: dokter ? dokter.nama_dokter : '-',
          spesialisasi: dokter ? dokter.spesialisasi : '-',
          poli: poli ? poli.nama_poli : '-',
          
          status: ralan.status_pasien,
          jenis_kunjungan: ralan.jenis_kunjungan,
          status_bayar: ralan.status_bayar,
          
          administrasi: {
            tarif_bpjs: formatRupiah(ralan.tarif_bpjs),
            tarif_rs: formatRupiah(ralan.tarif_rumahsakit),
            total: formatRupiah(ralan.tarif_bpjs + ralan.tarif_rumahsakit)
          }
        };
      });

      // Format data IGD untuk riwayat
      const riwayatIgd = dataIgd.map(igd => {
        const dokter = petugasIgd.find(d => d.id_petugas === igd.dokter_igd);
        const ruangan = masterRuanganIgd.find(r => r.kode_ruangan === igd.ruangan);
        const triase = masterTriase.find(t => t.kode_triase === igd.triase);
        
        return {
          jenis: 'IGD',
          no_reg: igd.no_reg,
          tanggal: formatTanggal(igd.tgl_masuk),
          jam: formatJam(igd.jam_masuk),
          
          keluhan: igd.keluhan_utama || '-',
          diagnosa: igd.a ? igd.a.split('\n')[0] : '-',
          tindakan: igd.p ? igd.p.split('\n')[0] : '-',
          
          dokter: dokter ? dokter.nama : '-',
          jabatan: dokter ? dokter.jabatan : '-',
          ruangan: ruangan ? ruangan.nama_ruangan : 'IGD',
          triase: triase ? triase.nama_triase : igd.triase,
          
          status: igd.status_pasien,
          durasi: igd.tgl_keluar ? hitungDurasi(igd.tgl_masuk, igd.tgl_keluar) : '-',
          asuransi: igd.asuransi || '-',
          
          tindakan_khusus: igd.tindakan.length > 0 ? 'Ya' : 'Tidak',
          catatan: igd.catatan_khusus || '-'
        };
      });

      // Gabungkan dan urutkan
      let semuaRiwayat = [...riwayatRalan, ...riwayatIgd];
      semuaRiwayat.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

      // Limit jika ada
      if (limit) {
        semuaRiwayat = semuaRiwayat.slice(0, parseInt(limit));
      }

      // Analisis statistik LENGKAP
      const statistik = {
        total: semuaRiwayat.length,
        rawat_jalan: riwayatRalan.length,
        igd: riwayatIgd.length,
        tahun_ini: new Date().getFullYear(),
        
        distribusi_tahun: getDistribusiTahun(semuaRiwayat),
        distribusi_bulan: getDistribusiBulan(semuaRiwayat),
        distribusi_jenis: {
          rawat_jalan: riwayatRalan.length,
          igd: riwayatIgd.length,
          persentase_ralan: semuaRiwayat.length > 0 ? ((riwayatRalan.length / semuaRiwayat.length) * 100).toFixed(1) + '%' : '0%',
          persentase_igd: semuaRiwayat.length > 0 ? ((riwayatIgd.length / semuaRiwayat.length) * 100).toFixed(1) + '%' : '0%'
        },
        
        pola_kunjungan: {
          frekuensi_per_bulan: (semuaRiwayat.length / 12).toFixed(1),
          bulan_terbanyak: getBulanTerbanyak(semuaRiwayat),
          hari_terbanyak: getHariTerbanyak(semuaRiwayat),
          waktu_terbanyak: getWaktuTerbanyak(semuaRiwayat)
        },
        
        analisis_klinis: {
          diagnosa_terbanyak: getTopDiagnosaRiwayat(semuaRiwayat),
          keluhan_terbanyak: getTopKeluhanRiwayat(semuaRiwayat),
          dokter_terbanyak: getTopDokterRiwayat(semuaRiwayat),
          poli_terbanyak: getTopPoliRiwayat(semuaRiwayat)
        },
        
        analisis_igd: riwayatIgd.length > 0 ? {
          triase_distribusi: getDistribusiTriase(riwayatIgd),
          durasi_rata_rata: getRataDurasiRiwayatIgd(riwayatIgd),
          status_keluar: getStatusKeluarIgd(riwayatIgd),
          penyebab_terbanyak: getPenyebabIgdRiwayat(riwayatIgd)
        } : null
      };

      // Ringkasan per periode
      const ringkasanPeriode = getRingkasanPeriode(semuaRiwayat);

      const response = {
        success: true,
        message: `✅ ${semuaRiwayat.length} riwayat SOAP ditemukan untuk pasien ${no_pasien}`,
        metadata: {
          total_data: semuaRiwayat.length,
          filter_diterapkan: {
            tahun: tahun || 'Semua tahun',
            bulan: bulan || 'Semua bulan',
            limit: limit || 'Tidak ada limit'
          },
          periode_data: getPeriodeData(semuaRiwayat),
          timestamp: new Date().toISOString()
        },
        
        data: {
          // INFO PASIEN
          info_pasien: {
            identitas: {
              no_pasien: pasien.no_pasien,
              nama_pasien: pasien.nama_pasien,
              usia: hitungUmur(pasien.tgl_lahir),
              jenis_kelamin: pasien.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
              tgl_daftar: formatTanggalOnly(pasien.tgl_daftar)
            },
            data_medis: {
              gol_darah: pasien.gol_darah,
              alergi: pasien.alergi || 'Tidak ada',
              penyakit_kronis: getPenyakitKronis(semuaRiwayat)
            }
          },
          
          // STATISTIK LENGKAP
          statistik: statistik,
          
          // RINGKASAN PER PERIODE
          ringkasan_periode: ringkasanPeriode,
          
          // RIWAYAT DETAIL
          riwayat_detail: semuaRiwayat.map((riwayat, index) => ({
            urutan: index + 1,
            id_riwayat: `RH${index + 1}-${riwayat.no_reg.substring(0, 8)}`,
            
            informasi_waktu: {
              tanggal: riwayat.tanggal,
              jam: riwayat.jam,
              hari: getHariFromDate(riwayat.tanggal),
              periode: getPeriodeHari(riwayat.jam)
            },
            
            jenis_pelayanan: {
              tipe: riwayat.jenis === 'RAWAT_JALAN' ? 'Rawat Jalan' : 'IGD',
              kode: riwayat.jenis,
              icon: riwayat.jenis === 'RAWAT_JALAN' ? '🏥' : '🚨'
            },
            
            informasi_klinis: {
              keluhan_utama: riwayat.keluhan,
              diagnosa: riwayat.diagnosa,
              tindakan: riwayat.tindakan,
              severity: riwayat.triase ? getSeverityLevel(riwayat.triase) : 'LOW'
            },
            
            informasi_lokasi: riwayat.jenis === 'RAWAT_JALAN' ? {
              tipe: 'POLIKLINIK',
              nama: riwayat.poli,
              kategori: getKategoriPoli(riwayat.poli)
            } : {
              tipe: 'IGD',
              nama: riwayat.ruangan,
              triase: riwayat.triase,
              kategori: getKategoriRuangan(riwayat.ruangan)
            },
            
            informasi_dokter: riwayat.jenis === 'RAWAT_JALAN' ? {
              nama: riwayat.dokter,
              spesialisasi: riwayat.spesialisasi,
              tipe: 'DOKTER SPESIALIS'
            } : {
              nama: riwayat.dokter,
              jabatan: riwayat.jabatan,
              tipe: 'DOKTER IGD'
            },
            
            status: {
              klinis: riwayat.status,
              ...(riwayat.jenis === 'RAWAT_JALAN' && {
                kunjungan: riwayat.jenis_kunjungan,
                pembayaran: riwayat.status_bayar
              }),
              ...(riwayat.jenis === 'IGD' && {
                durasi: riwayat.durasi,
                asuransi: riwayat.asuransi
              })
            },
            
            administrasi: riwayat.jenis === 'RAWAT_JALAN' ? riwayat.administrasi : null,
            
            catatan: riwayat.jenis === 'IGD' ? riwayat.catatan : null,
            
            aksi: {
              view_detail: `/api/resume/detail-soap/${riwayat.no_reg}`,
              download: false,
              share: false
            }
          })),
          
          // ANALISIS TREN
          analisis_tren: {
            tren_kunjungan: getTrenKunjungan(semuaRiwayat),
            tren_kesehatan: getTrenKesehatan(semuaRiwayat),
            prediksi: getPrediksiKunjungan(semuaRiwayat),
            rekomendasi: getRekomendasiTren(semuaRiwayat)
          },
          
          // EKSPOR DATA
          ekspor: {
            format_tersedia: ['JSON', 'CSV', 'PDF'],
            total_record: semuaRiwayat.length,
            periode: getPeriodeData(semuaRiwayat)
          }
        }
      };
      
      res.json(response);
      
    } catch (error) {
      console.log('⚠️  Error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil riwayat SOAP',
        error: error.message
      });
    }
  },

  // API 4: SEARCH RESUME MEDIS
  searchResumeMedis: async (req, res) => {
    try {
      const { keyword, tipe, tanggal_awal, tanggal_akhir } = req.query;
      
      console.log(`✅ Search resume: keyword=${keyword}, tipe=${tipe}`);

      if (!keyword && !tanggal_awal) {
        return res.json({
          success: false,
          message: 'Masukkan keyword pencarian atau rentang tanggal',
          results: []
        });
      }

      let results = [];
      
      // Search in Ralan
      const searchRalan = pasienRalan.filter(p => {
        let match = false;
        
        if (keyword) {
          const searchTerm = keyword.toLowerCase();
          match = match || 
            p.no_reg.toLowerCase().includes(searchTerm) ||
            p.no_pasien.includes(keyword) ||
            (p.keluhan && p.keluhan.toLowerCase().includes(searchTerm)) ||
            (p.diagnosa && p.diagnosa.toLowerCase().includes(searchTerm)) ||
            (p.tindakan && p.tindakan.toLowerCase().includes(searchTerm));
        }
        
        if (tanggal_awal && tanggal_akhir) {
          const tglAwal = new Date(tanggal_awal);
          const tglAkhir = new Date(tanggal_akhir);
          const tglPeriksa = new Date(p.tgl_periksa);
          match = match || (tglPeriksa >= tglAwal && tglPeriksa <= tglAkhir);
        }
        
        return match;
      });

      // Search in IGD
      const searchIgd = pasienIgd.filter(p => {
        let match = false;
        
        if (keyword) {
          const searchTerm = keyword.toLowerCase();
          match = match || 
            p.no_reg.toLowerCase().includes(searchTerm) ||
            p.no_rm.includes(keyword) ||
            (p.keluhan_utama && p.keluhan_utama.toLowerCase().includes(searchTerm)) ||
            (p.s && p.s.toLowerCase().includes(searchTerm)) ||
            (p.a && p.a.toLowerCase().includes(searchTerm));
        }
        
        if (tanggal_awal && tanggal_akhir) {
          const tglAwal = new Date(tanggal_awal);
          const tglAkhir = new Date(tanggal_akhir);
          const tglMasuk = new Date(p.tgl_masuk);
          match = match || (tglMasuk >= tglAwal && tglMasuk <= tglAkhir);
        }
        
        return match;
      });

      // Format results
      searchRalan.forEach(ralan => {
        const pasien = masterPasien.find(p => p.no_pasien === ralan.no_pasien);
        const dokter = masterDokter.find(d => d.kode_dokter === ralan.kode_dokter);
        const poli = masterPoli.find(p => p.kode_poli === ralan.kode_poli);
        
        results.push({
          tipe: 'RAWAT_JALAN',
          no_reg: ralan.no_reg,
          tanggal: formatTanggal(ralan.tgl_periksa),
          no_pasien: ralan.no_pasien,
          nama_pasien: pasien ? pasien.nama_pasien : '-',
          keluhan: ralan.keluhan || '-',
          diagnosa: ralan.diagnosa || '-',
          dokter: dokter ? dokter.nama_dokter : '-',
          poli: poli ? poli.nama_poli : '-',
          status: ralan.status_pasien,
          match_type: getMatchType(ralan, keyword)
        });
      });

      searchIgd.forEach(igd => {
        const pasien = masterPasien.find(p => p.no_pasien === igd.no_rm);
        const dokter = petugasIgd.find(d => d.id_petugas === igd.dokter_igd);
        
        results.push({
          tipe: 'IGD',
          no_reg: igd.no_reg,
          tanggal: formatTanggal(igd.tgl_masuk),
          no_pasien: igd.no_rm,
          nama_pasien: pasien ? pasien.nama_pasien : '-',
          keluhan: igd.keluhan_utama || '-',
          diagnosa: igd.a ? igd.a.split('\n')[0] : '-',
          dokter: dokter ? dokter.nama : '-',
          triase: igd.triase,
          status: igd.status_pasien,
          match_type: getMatchType(igd, keyword)
        });
      });

      // Sort by date
      results.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

      // Filter by tipe jika ada
      if (tipe === 'ralan') {
        results = results.filter(r => r.tipe === 'RAWAT_JALAN');
      } else if (tipe === 'igd') {
        results = results.filter(r => r.tipe === 'IGD');
      }

      const response = {
        success: true,
        message: `✅ ${results.length} hasil ditemukan`,
        search_params: {
          keyword: keyword || '-',
          tipe: tipe || 'semua',
          tanggal_awal: tanggal_awal || '-',
          tanggal_akhir: tanggal_akhir || '-'
        },
        results: results,
        summary: {
          total: results.length,
          rawat_jalan: results.filter(r => r.tipe === 'RAWAT_JALAN').length,
          igd: results.filter(r => r.tipe === 'IGD').length,
          period: tanggal_awal && tanggal_akhir ? `${tanggal_awal} s/d ${tanggal_akhir}` : 'Semua waktu'
        }
      };
      
      res.json(response);
      
    } catch (error) {
      console.log('⚠️  Error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Gagal melakukan pencarian',
        error: error.message
      });
    }
  }
};

// ========================
// HELPER FUNCTIONS LENGKAP
// ========================

function generateSoapFromRalan(ralan) {
  const keluhan = ralan.keluhan || 'Tidak ada keluhan spesifik';
  const diagnosa = ralan.diagnosa || 'Dalam observasi';
  const tindakan = ralan.tindakan || 'Observasi dan kontrol ulang';
  
  return {
    keluhan_utama: keluhan,
    subjective: `Pasien datang dengan keluhan: ${keluhan}. Status: ${ralan.status_pasien}. Kunjungan: ${ralan.jenis_kunjungan}. Riwayat penyakit sebelumnya: tidak ada data.`,
    objective: `Pemeriksaan fisik: dalam batas normal. Tanda vital: TD -/-, N -/mnt, RR -/mnt, suhu -°C. Tindakan: ${tindakan}.`,
    assessment: diagnosa,
    plan: `1. ${tindakan}\n2. Edukasi kesehatan\n3. Kontrol ulang jika keluhan menetap\n4. Pemeriksaan penunjang jika diperlukan`
  };
}

function generateSubjectiveRalan(ralan, pasien) {
  const usia = hitungUmur(pasien.tgl_lahir);
  const jenisKelamin = pasien.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan';
  
  return `Pasien ${jenisKelamin} usia ${usia} datang dengan keluhan: "${ralan.keluhan || 'Tidak ada keluhan spesifik'}". Status kunjungan: ${ralan.status_pasien} (${ralan.jenis_kunjungan}). Riwayat alergi: ${pasien.alergi || 'Tidak ada'}. Riwayat penyakit: tidak ada data.`;
}

function generateObjectiveRalan(ralan) {
  return `Pemeriksaan fisik: dalam batas normal. Tanda vital: TD -/-, N -/mnt, RR -/mnt, suhu -°C. Tindakan yang dilakukan: ${ralan.tindakan || 'Observasi'}. Kondisi umum: baik.`;
}

function generatePlanRalan(ralan) {
  const diagnosa = ralan.diagnosa || 'Dalam observasi';
  const tindakan = ralan.tindakan || 'Observasi';
  
  return `1. Diagnosa: ${diagnosa}\n2. Tindakan: ${tindakan}\n3. Edukasi pasien tentang kondisi kesehatan\n4. Kontrol ulang sesuai jadwal\n5. Pemeriksaan penunjang jika diperlukan\n6. Pengobatan simtomatik jika ada keluhan`;
}

function getWaktuRespon(triase) {
  switch(triase) {
    case 'MERAH': return '< 10 menit';
    case 'KUNING': return '< 60 menit';
    case 'HIJAU': return '< 120 menit';
    case 'HITAM': return 'Deklarasi';
    default: return 'Tidak diketahui';
  }
}

function hitungDurasi(tglMasuk, tglKeluar) {
  try {
    const masuk = new Date(tglMasuk);
    const keluar = new Date(tglKeluar);
    const diffMs = keluar - masuk;
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} hari ${diffHours} jam`;
    } else if (diffHours > 0) {
      return `${diffHours} jam ${diffMinutes} menit`;
    } else {
      return `${diffMinutes} menit`;
    }
  } catch {
    return 'Tidak diketahui';
  }
}

function getKategoriTindakan(kode) {
  if (kode.includes('001') || kode.includes('003') || kode.includes('004')) return 'RESUSITASI';
  if (kode.includes('002') || kode.includes('006') || kode.includes('007')) return 'PROSEDUR';
  if (kode.includes('008') || kode.includes('010')) return 'DIAGNOSTIK';
  return 'TERAPI';
}

function getRekomendasiStatus(status) {
  if (status.includes('PULANG')) return 'Pasien dapat pulang dengan anjuran';
  if (status.includes('DIRAWAT')) return 'Memerlukan perawatan lebih lanjut';
  if (status.includes('DIRUJUK')) return 'Memerlukan penanganan spesialis';
  return 'Dalam observasi';
}

function getFollowUpRekomendasi(jenis, detailData) {
  if (jenis === 'RAWAT_JALAN') {
    return {
      kontrol: '1 minggu lagi',
      pemeriksaan: 'Lakukan pemeriksaan penunjang jika diperlukan',
      pengobatan: 'Lanjutkan pengobatan sesuai resep',
      edukasi: 'Jaga pola hidup sehat'
    };
  } else {
    return {
      kontrol: detailData.info_medis.status_pasien === 'PULANG' ? '1-2 hari lagi' : 'Ikuti instruksi ruangan',
      pemeriksaan: 'Monitor tanda vital di rumah',
      pengobatan: 'Minum obat sesuai anjuran',
      emergency: 'Kembali ke IGD jika keluhan memberat'
    };
  }
}

function getDiagnosaTerbanyak(pelayanan) {
  const diagnosaMap = {};
  pelayanan.forEach(p => {
    let diagnosa = '';
    if (p.jenis_pelayanan === 'RAWAT_JALAN') {
      diagnosa = p.info_medis.diagnosa_utama || '-';
    } else {
      diagnosa = p.soap_record.assessment ? p.soap_record.assessment.split('\n')[0] : '-';
    }
    
    if (diagnosa !== '-') {
      diagnosaMap[diagnosa] = (diagnosaMap[diagnosa] || 0) + 1;
    }
  });
  
  const sorted = Object.entries(diagnosaMap).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, 3).map(([d, count]) => ({ diagnosa: d, jumlah: count, persentase: ((count / pelayanan.length) * 100).toFixed(1) + '%' }));
}

function getKeluhanTerbanyak(pelayanan) {
  const keluhanMap = {};
  pelayanan.forEach(p => {
    const keluhan = p.soap_record.keluhan_utama || '-';
    if (keluhan !== '-') {
      keluhanMap[keluhan] = (keluhanMap[keluhan] || 0) + 1;
    }
  });
  
  const sorted = Object.entries(keluhanMap).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, 3);
}

function getTingkatKeparahanLengkap(pelayanan) {
  const igdData = pelayanan.filter(p => p.jenis_pelayanan === 'IGD');
  if (igdData.length === 0) return { tingkat: 'RINGAN', deskripsi: 'Hanya rawat jalan rutin' };
  
  const triaseCount = { MERAH: 0, KUNING: 0, HIJAU: 0 };
  igdData.forEach(p => {
    if (p.info_triase && p.info_triase.kode_triase in triaseCount) {
      triaseCount[p.info_triase.kode_triase]++;
    }
  });
  
  if (triaseCount.MERAH > 0) {
    return { tingkat: 'KRITIS', deskripsi: 'Memerlukan penanganan gawat darurat', total_kejadian: triaseCount.MERAH };
  } else if (triaseCount.KUNING > 0) {
    return { tingkat: 'SEDANG', deskripsi: 'Memerlukan observasi ketat', total_kejadian: triaseCount.KUNING };
  } else {
    return { tingkat: 'RINGAN', deskripsi: 'Hanya triase hijau', total_kejadian: triaseCount.HIJAU };
  }
}

function getPolaKunjungan(pelayanan) {
  if (pelayanan.length === 0) return { pola: 'TIDAK ADA DATA', frekuensi: 0 };
  
  const dates = pelayanan.map(p => new Date(p.tgl_pelayanan));
  const sortedDates = dates.sort((a, b) => a - b);
  
  const firstDate = sortedDates[0];
  const lastDate = sortedDates[sortedDates.length - 1];
  const diffDays = Math.floor((lastDate - firstDate) / (1000 * 60 * 60 * 24));
  
  const frekuensi = diffDays > 0 ? (pelayanan.length / diffDays * 30).toFixed(2) : pelayanan.length;
  
  return {
    pola: pelayanan.length > 10 ? 'SERING' : pelayanan.length > 5 ? 'SEDANG' : 'JARANG',
    frekuensi: parseFloat(frekuensi),
    periode: diffDays > 0 ? `${diffDays} hari` : 'Hari yang sama',
    rata_per_bulan: (pelayanan.length / (diffDays / 30)).toFixed(1)
  };
}

function getRisikoKesehatan(pasien, pelayanan) {
  const igdCount = pelayanan.filter(p => p.jenis_pelayanan === 'IGD').length;
  const usia = hitungUmur(pasien.tgl_lahir);
  const usiaNum = parseInt(usia) || 0;
  
  let risiko = 'RENDAH';
  let faktor = [];
  
  if (igdCount > 2) {
    risiko = 'TINGGI';
    faktor.push('Sering ke IGD');
  } else if (igdCount > 0) {
    risiko = 'SEDANG';
    faktor.push('Pernah ke IGD');
  }
  
  if (usiaNum > 60) {
    risiko = risiko === 'RENDAH' ? 'SEDANG' : risiko;
    faktor.push('Usia lanjut');
  }
  
  if (pasien.alergi && pasien.alergi !== 'Tidak ada') {
    faktor.push('Memiliki alergi');
  }
  
  return { tingkat: risiko, faktor: faktor, skor: igdCount * 10 + (usiaNum > 60 ? 20 : 0) };
}

function getRekomendasiTindakLanjut(pelayanan) {
  const igdCount = pelayanan.filter(p => p.jenis_pelayanan === 'IGD').length;
  const ralanCount = pelayanan.filter(p => p.jenis_pelayanan === 'RAWAT_JALAN').length;
  
  const rekomendasi = [];
  
  if (igdCount > 0) {
    rekomendasi.push('Konsultasi dokter spesialis penyakit dalam');
    rekomendasi.push('Pemeriksaan kesehatan menyeluruh');
  }
  
  if (ralanCount > 5) {
    rekomendasi.push('Program pengelolaan penyakit kronis');
  }
  
  if (pelayanan.length > 10) {
    rekomendasi.push('Kartu monitoring kesehatan harian');
  }
  
  return rekomendasi.length > 0 ? rekomendasi : ['Kontrol rutin 6 bulan sekali'];
}

function getPoliTerbanyak(ralanData) {
  if (ralanData.length === 0) return { nama: 'Tidak ada', jumlah: 0 };
  
  const poliMap = {};
  ralanData.forEach(p => {
    const poli = p.info_lokasi.nama_poli;
    poliMap[poli] = (poliMap[poli] || 0) + 1;
  });
  
  const sorted = Object.entries(poliMap).sort((a, b) => b[1] - a[1]);
  return { nama: sorted[0][0], jumlah: sorted[0][1], persentase: ((sorted[0][1] / ralanData.length) * 100).toFixed(1) + '%' };
}

function getDiagnosaRalanTerbanyak(ralanData) {
  if (ralanData.length === 0) return [];
  
  const diagnosaMap = {};
  ralanData.forEach(p => {
    const diagnosa = p.info_medis.diagnosa_utama;
    if (diagnosa && diagnosa !== '-') {
      diagnosaMap[diagnosa] = (diagnosaMap[diagnosa] || 0) + 1;
    }
  });
  
  const sorted = Object.entries(diagnosaMap).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, 3).map(([d, count]) => ({ diagnosa: d, jumlah: count }));
}

function getDokterRalanTerbanyak(ralanData) {
  if (ralanData.length === 0) return [];
  
  const dokterMap = {};
  ralanData.forEach(p => {
    const dokter = p.info_dokter.nama_dokter;
    if (dokter && dokter !== 'Dokter tidak ditemukan') {
      dokterMap[dokter] = (dokterMap[dokter] || 0) + 1;
    }
  });
  
  const sorted = Object.entries(dokterMap).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, 3).map(([d, count]) => ({ dokter: d, jumlah: count }));
}

function getPenyebabIgdTerbanyak(igdData) {
  if (igdData.length === 0) return [];
  
  const penyebabMap = {};
  igdData.forEach(p => {
    const keluhan = p.soap_record.keluhan_utama;
    if (keluhan && keluhan !== '-') {
      penyebabMap[keluhan] = (penyebabMap[keluhan] || 0) + 1;
    }
  });
  
  const sorted = Object.entries(penyebabMap).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, 3);
}

function getRataDurasiIgd(igdData) {
  if (igdData.length === 0) return '0 jam';
  
  const total = igdData.reduce((sum, p) => {
    if (p.info_medis.durasi && p.info_medis.durasi !== 'Sedang berlangsung') {
      const durasiText = p.info_medis.durasi;
      const hoursMatch = durasiText.match(/(\d+)\s*jam/);
      const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
      return sum + hours;
    }
    return sum;
  }, 0);
  
  const rata = total / igdData.length;
  return `${rata.toFixed(1)} jam`;
}

function getDistribusiTahun(riwayat) {
  const tahunMap = {};
  riwayat.forEach(r => {
    const tahun = new Date(r.tanggal).getFullYear();
    tahunMap[tahun] = (tahunMap[tahun] || 0) + 1;
  });
  
  return Object.entries(tahunMap).map(([tahun, count]) => ({ tahun, jumlah: count }));
}

function getDistribusiBulan(riwayat) {
  const bulanMap = {};
  const namaBulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  
  riwayat.forEach(r => {
    const bulan = new Date(r.tanggal).getMonth();
    bulanMap[bulan] = (bulanMap[bulan] || 0) + 1;
  });
  
  return Object.entries(bulanMap)
    .map(([bulan, count]) => ({ 
      bulan: namaBulan[parseInt(bulan)], 
      kode: parseInt(bulan) + 1,
      jumlah: count 
    }))
    .sort((a, b) => a.kode - b.kode);
}

function getBulanTerbanyak(riwayat) {
  const distribusi = getDistribusiBulan(riwayat);
  if (distribusi.length === 0) return { bulan: 'Tidak ada', jumlah: 0 };
  
  const terbanyak = distribusi.reduce((max, curr) => curr.jumlah > max.jumlah ? curr : max, distribusi[0]);
  return terbanyak;
}

function getHariTerbanyak(riwayat) {
  const hariMap = {};
  const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  
  riwayat.forEach(r => {
    const hari = new Date(r.tanggal).getDay();
    hariMap[hari] = (hariMap[hari] || 0) + 1;
  });
  
  const sorted = Object.entries(hariMap).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? { hari: namaHari[parseInt(sorted[0][0])], jumlah: sorted[0][1] } : { hari: 'Tidak ada', jumlah: 0 };
}

function getWaktuTerbanyak(riwayat) {
  const waktuMap = { pagi: 0, siang: 0, sore: 0, malam: 0 };
  
  riwayat.forEach(r => {
    const jam = r.jam ? parseInt(r.jam.split(':')[0]) : 12;
    
    if (jam >= 5 && jam < 11) waktuMap.pagi++;
    else if (jam >= 11 && jam < 15) waktuMap.siang++;
    else if (jam >= 15 && jam < 19) waktuMap.sore++;
    else waktuMap.malam++;
  });
  
  const sorted = Object.entries(waktuMap).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? { waktu: sorted[0][0], jumlah: sorted[0][1] } : { waktu: 'Tidak ada', jumlah: 0 };
}

function getTopDiagnosaRiwayat(riwayat) {
  const diagnosaMap = {};
  riwayat.forEach(r => {
    const diagnosa = r.diagnosa || '-';
    if (diagnosa !== '-') {
      diagnosaMap[diagnosa] = (diagnosaMap[diagnosa] || 0) + 1;
    }
  });
  
  const sorted = Object.entries(diagnosaMap).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, 5);
}

function getTopKeluhanRiwayat(riwayat) {
  const keluhanMap = {};
  riwayat.forEach(r => {
    const keluhan = r.keluhan || '-';
    if (keluhan !== '-') {
      keluhanMap[keluhan] = (keluhanMap[keluhan] || 0) + 1;
    }
  });
  
  const sorted = Object.entries(keluhanMap).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, 5);
}

function getTopDokterRiwayat(riwayat) {
  const dokterMap = {};
  riwayat.forEach(r => {
    const dokter = r.dokter || '-';
    if (dokter !== '-') {
      dokterMap[dokter] = (dokterMap[dokter] || 0) + 1;
    }
  });
  
  const sorted = Object.entries(dokterMap).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, 5);
}

function getTopPoliRiwayat(riwayat) {
  const poliMap = {};
  riwayat.forEach(r => {
    if (r.jenis === 'RAWAT_JALAN' && r.poli && r.poli !== '-') {
      poliMap[r.poli] = (poliMap[r.poli] || 0) + 1;
    }
  });
  
  const sorted = Object.entries(poliMap).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, 5);
}

function getDistribusiTriase(riwayatIgd) {
  const triaseMap = {};
  riwayatIgd.forEach(r => {
    const triase = r.triase || '-';
    triaseMap[triase] = (triaseMap[triase] || 0) + 1;
  });
  
  return Object.entries(triaseMap).map(([triase, count]) => ({ triase, jumlah: count }));
}

function getRataDurasiRiwayatIgd(riwayatIgd) {
  const durations = riwayatIgd
    .filter(r => r.durasi && r.durasi !== '-')
    .map(r => {
      const match = r.durasi.match(/(\d+)\s*jam/);
      return match ? parseInt(match[1]) : 0;
    });
  
  if (durations.length === 0) return '0 jam';
  
  const total = durations.reduce((sum, dur) => sum + dur, 0);
  const rata = total / durations.length;
  return `${rata.toFixed(1)} jam`;
}

function getStatusKeluarIgd(riwayatIgd) {
  const statusMap = {};
  riwayatIgd.forEach(r => {
    const status = r.status || '-';
    statusMap[status] = (statusMap[status] || 0) + 1;
  });
  
  return Object.entries(statusMap).map(([status, count]) => ({ status, jumlah: count }));
}

function getPenyebabIgdRiwayat(riwayatIgd) {
  const penyebabMap = {};
  riwayatIgd.forEach(r => {
    const keluhan = r.keluhan || '-';
    if (keluhan !== '-') {
      penyebabMap[keluhan] = (penyebabMap[keluhan] || 0) + 1;
    }
  });
  
  const sorted = Object.entries(penyebabMap).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, 5);
}

function getRingkasanPeriode(riwayat) {
  if (riwayat.length === 0) return [];
  
  const ringkasan = [];
  const tahunSekarang = new Date().getFullYear();
  
  for (let tahun = tahunSekarang; tahun >= tahunSekarang - 2; tahun--) {
    const riwayatTahun = riwayat.filter(r => {
      const tgl = new Date(r.tanggal);
      return tgl.getFullYear() === tahun;
    });
    
    if (riwayatTahun.length > 0) {
      ringkasan.push({
        tahun: tahun,
        total: riwayatTahun.length,
        rawat_jalan: riwayatTahun.filter(r => r.jenis === 'RAWAT_JALAN').length,
        igd: riwayatTahun.filter(r => r.jenis === 'IGD').length,
        bulan_terbanyak: getBulanTerbanyak(riwayatTahun).bulan,
        diagnosa_terbanyak: getTopDiagnosaRiwayat(riwayatTahun)[0] || ['Tidak ada', 0]
      });
    }
  }
  
  return ringkasan;
}

function getPeriodeData(riwayat) {
  if (riwayat.length === 0) return 'Tidak ada data';
  
  const dates = riwayat.map(r => new Date(r.tanggal));
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  return `${formatDate(minDate)} - ${formatDate(maxDate)}`;
}

function getPenyakitKronis(riwayat) {
  const diagnosaKronis = ['hipertensi', 'diabetes', 'jantung', 'asma', 'ginjal'];
  const ditemukan = [];
  
  riwayat.forEach(r => {
    const diagnosa = (r.diagnosa || '').toLowerCase();
    diagnosaKronis.forEach(kronis => {
      if (diagnosa.includes(kronis) && !ditemukan.includes(kronis)) {
        ditemukan.push(kronis);
      }
    });
  });
  
  return ditemukan.length > 0 ? ditemukan : ['Tidak teridentifikasi'];
}

function getHariFromDate(tanggalStr) {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const date = new Date(tanggalStr);
  return days[date.getDay()];
}

function getPeriodeHari(jamStr) {
  if (!jamStr) return 'Tidak diketahui';
  
  const jam = parseInt(jamStr.split(':')[0]);
  if (jam >= 5 && jam < 11) return 'Pagi';
  if (jam >= 11 && jam < 15) return 'Siang';
  if (jam >= 15 && jam < 19) return 'Sore';
  return 'Malam';
}

function getSeverityLevel(triase) {
  switch(triase) {
    case 'MERAH': return 'HIGH';
    case 'KUNING': return 'MEDIUM';
    case 'HIJAU': return 'LOW';
    default: return 'LOW';
  }
}

function getKategoriPoli(poli) {
  if (poli.includes('UMUM')) return 'PRIMER';
  if (poli.includes('DALAM') || poli.includes('ANAK') || poli.includes('BEDAH')) return 'SPESIALIS';
  return 'SUPPORT';
}

function getKategoriRuangan(ruangan) {
  if (ruangan.includes('ICU')) return 'INTENSIVE';
  if (ruangan.includes('HCU')) return 'HIGH CARE';
  if (ruangan.includes('IGD')) return 'EMERGENCY';
  return 'REGULAR';
}

function getTrenKunjungan(riwayat) {
  if (riwayat.length < 2) return { tren: 'STABIL', perubahan: 0 };
  
  const sorted = riwayat.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
  const firstHalf = Math.floor(sorted.length / 2);
  const firstPeriod = sorted.slice(0, firstHalf).length;
  const secondPeriod = sorted.slice(firstHalf).length;
  
  const perubahan = ((secondPeriod - firstPeriod) / firstPeriod * 100).toFixed(1);
  
  let tren = 'STABIL';
  if (parseFloat(perubahan) > 20) tren = 'MENINGKAT';
  else if (parseFloat(perubahan) < -20) tren = 'MENURUN';
  
  return { tren, perubahan: parseFloat(perubahan) };
}

function getTrenKesehatan(riwayat) {
  const igdCount = riwayat.filter(r => r.jenis === 'IGD').length;
  const total = riwayat.length;
  
  const persentaseIgd = total > 0 ? (igdCount / total * 100).toFixed(1) : 0;
  
  let status = 'BAIK';
  if (persentaseIgd > 30) status = 'PERLU PERHATIAN';
  else if (persentaseIgd > 50) status = 'MEMERLUKAN INTERVENSI';
  
  return { status, persentase_igd: parseFloat(persentaseIgd), total_igd: igdCount };
}

function getPrediksiKunjungan(riwayat) {
  if (riwayat.length < 3) return { prediksi: 'DATA TIDAK CUKUP', confidence: 0 };
  
  const monthlyAvg = riwayat.length / 12;
  const nextMonth = Math.round(monthlyAvg);
  
  return { 
    prediksi: `${nextMonth} kunjungan bulan depan`, 
    confidence: Math.min(monthlyAvg > 2 ? 80 : 60, 90),
    rekomendasi: monthlyAvg > 3 ? 'Pertimbangkan program kesehatan preventif' : 'Pertahankan pola hidup sehat'
  };
}

function getRekomendasiTren(riwayat) {
  const rekomendasi = [];
  const igdCount = riwayat.filter(r => r.jenis === 'IGD').length;
  const total = riwayat.length;
  
  if (igdCount > 0) {
    rekomendasi.push('Evaluasi penyebab kunjungan IGD berulang');
  }
  
  if (total > 10) {
    rekomendasi.push('Pertimbangkan kunjungan dokter keluarga rutin');
  }
  
  const pola = getPolaKunjungan(riwayat);
  if (pola.frekuensi > 2) {
    rekomendasi.push('Monitoring kesehatan lebih intensif');
  }
  
  return rekomendasi.length > 0 ? rekomendasi : ['Lanjutkan pola hidup sehat'];
}

function getMatchType(data, keyword) {
  if (!keyword) return 'DATE_RANGE';
  
  const searchTerm = keyword.toLowerCase();
  const fields = [];
  
  if (data.no_reg && data.no_reg.toLowerCase().includes(searchTerm)) fields.push('NO_REG');
  if (data.no_pasien && data.no_pasien.includes(keyword)) fields.push('NO_PASIEN');
  if (data.keluhan && data.keluhan.toLowerCase().includes(searchTerm)) fields.push('KELUHAN');
  if (data.diagnosa && data.diagnosa.toLowerCase().includes(searchTerm)) fields.push('DIAGNOSA');
  if (data.dokter && data.dokter.toLowerCase().includes(searchTerm)) fields.push('DOKTER');
  
  return fields.length > 0 ? fields.join(', ') : 'OTHER';
}

module.exports = resumeController;