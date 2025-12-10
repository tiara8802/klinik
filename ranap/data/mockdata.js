const mockRawatInap = [
    {
        no_rm: '374608',
        no_reg: '20251205125245',
        nama_pasien: 'SARINAH PASARIBU. NN',
        no_sep: '1019R0021225V001962',
        kelas: 'VIP DELUXE',
        kamar: '01',
        no_bed: 'A',
        gol_pasien: 'BPJS JAMSOSTEK',
        hp: '4',
        tgl_masuk: '2025-12-05 12:52:45',
        tgl_keluar: null,
        alamat: 'Jl. Melati No. 10, Jakarta',
        tgl_lahir: '1975-03-15',
        jenis_kelamin: 'P',
        diagnosa_masuk: 'Hipertensi Grade 2',
        diagnosa_keluar: null,
        dokter: 'dr. Ahmad Santoso, Sp.PD',
        status: 'Dirawat'
    }
    // ... tambahkan data lainnya
];

const dataOkupansi = [
    { ruangan: 'KIRANA', tt: 7, d: 2, u: 0, epj5: 3, pr3h: 0, jamish: 5, bor: 14, persentase: 71.43 },
    { ruangan: 'KARTIKA', tt: 17, d: 1, u: 0, epj5: 9, pr3h: 0, jamish: 10, bor: 36, persentase: 58.82 }
    // ... tambahkan data lainnya
];

module.exports = {
    mockRawatInap,
    dataOkupansi
};