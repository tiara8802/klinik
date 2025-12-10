const mockData = require('../ranap/data/mockdata');
const helper = require('../ranap/helpers/helper');

const kamarController = {
    // Data kamar tersedia
    getKamarTersedia: async (req, res) => {
        try {
            const { kelas, status } = req.query;
            
            console.log(`✅ Data kamar: kelas=${kelas}, status=${status}`);
            
            const kamarList = [
                { no_kamar: '01', kelas: 'VIP DELUXE', no_bed: 'A', status: 'Terisi' },
                { no_kamar: '01', kelas: 'VIP DELUXE', no_bed: 'B', status: 'Kosong' },
                { no_kamar: '02', kelas: 'VIP DELUXE', no_bed: 'A', status: 'Terisi' },
                { no_kamar: '02', kelas: 'VIP DELUXE', no_bed: 'B', status: 'Kosong' },
                { no_kamar: '03', kelas: 'VIP DELUXE', no_bed: 'A', status: 'Terisi' },
                { no_kamar: '03', kelas: 'VIP DELUXE', no_bed: 'B', status: 'Kosong' },
                { no_kamar: '04', kelas: 'VIP DELUXE', no_bed: 'A', status: 'Terisi' },
                { no_kamar: '04', kelas: 'VIP DELUXE', no_bed: 'B', status: 'Kosong' },
                { no_kamar: '05', kelas: 'VIP DELUXE', no_bed: 'A', status: 'Kosong' },
                { no_kamar: '05', kelas: 'VIP DELUXE', no_bed: 'B', status: 'Kosong' },
                { no_kamar: '06', kelas: 'VIP PREMIUM', no_bed: 'A', status: 'Terisi' },
                { no_kamar: '06', kelas: 'VIP PREMIUM', no_bed: 'B', status: 'Kosong' }
            ];
            
            let filteredKamar = [...kamarList];
            
            if (kelas && kelas !== 'all') {
                filteredKamar = filteredKamar.filter(k => k.kelas === kelas);
            }
            
            if (status && status !== 'all') {
                filteredKamar = filteredKamar.filter(k => k.status === status);
            }
            
            const stats = {
                total: filteredKamar.length,
                terisi: filteredKamar.filter(k => k.status === 'Terisi').length,
                kosong: filteredKamar.filter(k => k.status === 'Kosong').length
            };
            
            const response = {
                success: true,
                message: `✅ ${filteredKamar.length} kamar ditemukan`,
                statistik: {
                    total_kamar: stats.total,
                    terisi: stats.terisi,
                    kosong: stats.kosong,
                    persentase: stats.total > 0 ? ((stats.terisi / stats.total) * 100).toFixed(1) + '%' : '0%'
                },
                data_kamar: filteredKamar.map((k, i) => ({
                    no: i + 1,
                    no_kamar: k.no_kamar,
                    kelas: k.kelas,
                    no_bed: k.no_bed,
                    status: k.status,
                    pasien: k.status === 'Terisi' ? 
                        mockData.mockRawatInap.find(p => p.kamar === k.no_kamar && p.no_bed === k.no_bed)?.nama_pasien || '-' 
                        : '-'
                }))
            };
            
            res.json(response);
            
        } catch (error) {
            console.log('⚠️  Error:', error.message);
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil data kamar'
            });
        }
    },

    // Data okupansi kamar
    getOkupansiKamar: async (req, res) => {
        try {
            console.log(`✅ Data okupansi kamar`);
            
            const dataOkupansi = mockData.dataOkupansi;
            const totalJamish = dataOkupansi.reduce((sum, item) => sum + item.jamish, 0);
            const totalTT = dataOkupansi.reduce((sum, item) => sum + item.tt, 0);
            const totalPersentase = dataOkupansi.length > 0 
                ? dataOkupansi.reduce((sum, item) => sum + item.persentase, 0) / dataOkupansi.length 
                : 0;
            
            const response = {
                success: true,
                message: `✅ Data okupansi ${dataOkupansi.length} ruangan ditemukan`,
                data: dataOkupansi.map((item, index) => ({
                    no: index + 1,
                    ruangan: item.ruangan,
                    kode_ruangan: `RG${(index + 1).toString().padStart(2, '0')}`,
                    total_tempat_tidur: item.tt,
                    terisi: item.jamish,
                    kosong: item.tt - item.jamish,
                    persentase_okupansi: item.persentase.toFixed(2) + '%',
                    detail: {
                        d: item.d,
                        u: item.u,
                        epj5: item.epj5,
                        pr3h: item.pr3h,
                        jamish: item.jamish,
                        bor: item.bor
                    }
                })),
                summary: {
                    total_tt: totalTT,
                    total_kosong: totalTT - totalJamish,
                    total_terisi: totalJamish,
                    total_pasien: dataOkupansi.reduce((sum, item) => sum + item.bor, 0),
                    persentase_okupansi: totalPersentase.toFixed(2) + '%'
                }
            };
            
            res.json(response);
            
        } catch (error) {
            console.log('⚠️  Error:', error.message);
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil data okupansi'
            });
        }
    },

    // Data kamar dengan status
    getKamarStatus: async (req, res) => {
        try {
            const { status_kamar, kode_ruangan } = req.query;
            
            console.log(`✅ Data kamar dengan status: status_kamar=${status_kamar}, kode_ruangan=${kode_ruangan}`);
            
            let kamarList = [];
            
            mockData.dataOkupansi.forEach((ruangan, idx) => {
                const kodeRuang = `RG${(idx + 1).toString().padStart(2, '0')}`;
                const jumlahTerisi = ruangan.jamish;
                const jumlahKosong = ruangan.tt - ruangan.jamish;
                
                for (let i = 1; i <= jumlahTerisi; i++) {
                    kamarList.push({
                        kode_kamar: `${kodeRuang}-${i.toString().padStart(2, '0')}`,
                        kode_ruangan: kodeRuang,
                        nama_ruangan: ruangan.ruangan,
                        kode_kelas: helper.getKelasFromRuangan(ruangan.ruangan),
                        nama_kelas: helper.getNamaKelasFromRuangan(ruangan.ruangan),
                        status_kamar: 'terisi',
                        status_text: 1
                    });
                }
                
                for (let i = 1; i <= jumlahKosong; i++) {
                    kamarList.push({
                        kode_kamar: `${kodeRuang}-K${i.toString().padStart(2, '0')}`,
                        kode_ruangan: kodeRuang,
                        nama_ruangan: ruangan.ruangan,
                        kode_kelas: helper.getKelasFromRuangan(ruangan.ruangan),
                        nama_kelas: helper.getNamaKelasFromRuangan(ruangan.ruangan),
                        status_kamar: 'kosong',
                        status_text: 0
                    });
                }
            });
            
            if (status_kamar !== undefined) {
                const statusInt = parseInt(status_kamar);
                kamarList = kamarList.filter(k => k.status_kamar === statusInt);
            }
            
            if (kode_ruangan) {
                kamarList = kamarList.filter(k => k.kode_ruangan === kode_ruangan);
            }
            
            const response = {
                success: true,
                message: `✅ ${kamarList.length} kamar ditemukan`,
                data: kamarList
            };
            
            res.json(response);
            
        } catch (error) {
            console.log('⚠️  Error:', error.message);
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil data kamar'
            });
        }
    }
};

module.exports = kamarController;