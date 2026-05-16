/**
 * Daftar kota-kota besar di Indonesia beserta koordinat dan provinsi.
 * Digunakan sebagai fallback picker ketika GPS tidak bisa menentukan nama kota.
 */
export const INDONESIA_CITIES = [
  // ─── DKI Jakarta & Sekitar ───
  { city: 'Jakarta Pusat',    province: 'DKI Jakarta',        lat: -6.1865,  lng: 106.8341  },
  { city: 'Jakarta Selatan',  province: 'DKI Jakarta',        lat: -6.2615,  lng: 106.8106  },
  { city: 'Jakarta Barat',    province: 'DKI Jakarta',        lat: -6.1682,  lng: 106.7636  },
  { city: 'Jakarta Timur',    province: 'DKI Jakarta',        lat: -6.2250,  lng: 106.9004  },
  { city: 'Jakarta Utara',    province: 'DKI Jakarta',        lat: -6.1382,  lng: 106.8671  },
  { city: 'Bogor',            province: 'Jawa Barat',         lat: -6.5971,  lng: 106.8060  },
  { city: 'Depok',            province: 'Jawa Barat',         lat: -6.4025,  lng: 106.7942  },
  { city: 'Tangerang',        province: 'Banten',             lat: -6.1702,  lng: 106.6402  },
  { city: 'Tangerang Selatan',province: 'Banten',             lat: -6.2878,  lng: 106.7164  },
  { city: 'Bekasi',           province: 'Jawa Barat',         lat: -6.2383,  lng: 106.9756  },
  { city: 'Cikarang',         province: 'Jawa Barat',         lat: -6.3060,  lng: 107.1470  },

  // ─── Jawa Barat ───
  { city: 'Bandung',          province: 'Jawa Barat',         lat: -6.9175,  lng: 107.6191  },
  { city: 'Cimahi',           province: 'Jawa Barat',         lat: -6.8722,  lng: 107.5428  },
  { city: 'Sukabumi',         province: 'Jawa Barat',         lat: -6.9278,  lng: 106.9299  },
  { city: 'Cirebon',          province: 'Jawa Barat',         lat: -6.7063,  lng: 108.5570  },
  { city: 'Tasikmalaya',      province: 'Jawa Barat',         lat: -7.3274,  lng: 108.2207  },
  { city: 'Garut',            province: 'Jawa Barat',         lat: -7.2172,  lng: 107.9071  },
  { city: 'Karawang',         province: 'Jawa Barat',         lat: -6.3216,  lng: 107.3383  },
  { city: 'Cianjur',          province: 'Jawa Barat',         lat: -6.8177,  lng: 107.1426  },
  { city: 'Kuningan',         province: 'Jawa Barat',         lat: -6.9760,  lng: 108.4815  },

  // ─── Banten ───
  { city: 'Serang',           province: 'Banten',             lat: -6.1200,  lng: 106.1503  },
  { city: 'Cilegon',          province: 'Banten',             lat: -6.0027,  lng: 106.0016  },

  // ─── Jawa Tengah ───
  { city: 'Semarang',         province: 'Jawa Tengah',        lat: -6.9932,  lng: 110.4203  },
  { city: 'Solo',             province: 'Jawa Tengah',        lat: -7.5755,  lng: 110.8243  },
  { city: 'Magelang',         province: 'Jawa Tengah',        lat: -7.4698,  lng: 110.2178  },
  { city: 'Pekalongan',       province: 'Jawa Tengah',        lat: -6.8886,  lng: 109.6753  },
  { city: 'Tegal',            province: 'Jawa Tengah',        lat: -6.8694,  lng: 109.1402  },
  { city: 'Kudus',            province: 'Jawa Tengah',        lat: -6.8057,  lng: 110.8389  },
  { city: 'Salatiga',         province: 'Jawa Tengah',        lat: -7.3305,  lng: 110.5084  },
  { city: 'Purwokerto',       province: 'Jawa Tengah',        lat: -7.4248,  lng: 109.2355  },
  { city: 'Cilacap',          province: 'Jawa Tengah',        lat: -7.7269,  lng: 109.0150  },

  // ─── DI Yogyakarta ───
  { city: 'Yogyakarta',       province: 'DI Yogyakarta',      lat: -7.7971,  lng: 110.3688  },
  { city: 'Sleman',           province: 'DI Yogyakarta',      lat: -7.7167,  lng: 110.3544  },
  { city: 'Bantul',           province: 'DI Yogyakarta',      lat: -7.8892,  lng: 110.3286  },

  // ─── Jawa Timur ───
  { city: 'Surabaya',         province: 'Jawa Timur',         lat: -7.2575,  lng: 112.7521  },
  { city: 'Malang',           province: 'Jawa Timur',         lat: -7.9666,  lng: 112.6326  },
  { city: 'Sidoarjo',         province: 'Jawa Timur',         lat: -7.4478,  lng: 112.7183  },
  { city: 'Gresik',           province: 'Jawa Timur',         lat: -7.1577,  lng: 112.6531  },
  { city: 'Kediri',           province: 'Jawa Timur',         lat: -7.8168,  lng: 112.0110  },
  { city: 'Blitar',           province: 'Jawa Timur',         lat: -8.0958,  lng: 112.1608  },
  { city: 'Madiun',           province: 'Jawa Timur',         lat: -7.6298,  lng: 111.5239  },
  { city: 'Mojokerto',        province: 'Jawa Timur',         lat: -7.4706,  lng: 112.4340  },
  { city: 'Jember',           province: 'Jawa Timur',         lat: -8.1724,  lng: 113.7016  },
  { city: 'Banyuwangi',       province: 'Jawa Timur',         lat: -8.2192,  lng: 114.3691  },
  { city: 'Pasuruan',         province: 'Jawa Timur',         lat: -7.6454,  lng: 112.9073  },
  { city: 'Probolinggo',      province: 'Jawa Timur',         lat: -7.7548,  lng: 113.2156  },
  { city: 'Lumajang',         province: 'Jawa Timur',         lat: -8.1326,  lng: 113.2227  },

  // ─── Bali ───
  { city: 'Denpasar',         province: 'Bali',               lat: -8.6705,  lng: 115.2126  },
  { city: 'Singaraja',        province: 'Bali',               lat: -8.1123,  lng: 115.0878  },
  { city: 'Gianyar',          province: 'Bali',               lat: -8.5362,  lng: 115.3308  },

  // ─── NTB & NTT ───
  { city: 'Mataram',          province: 'NTB',                lat: -8.5833,  lng: 116.1167  },
  { city: 'Bima',             province: 'NTB',                lat: -8.4644,  lng: 118.7238  },
  { city: 'Kupang',           province: 'NTT',                lat: -10.1718, lng: 123.6070  },

  // ─── Sumatera Utara ───
  { city: 'Medan',            province: 'Sumatera Utara',     lat: 3.5952,   lng: 98.6722   },
  { city: 'Binjai',           province: 'Sumatera Utara',     lat: 3.6003,   lng: 98.4835   },
  { city: 'Pematang Siantar', province: 'Sumatera Utara',     lat: 2.9595,   lng: 99.0687   },
  { city: 'Tebing Tinggi',    province: 'Sumatera Utara',     lat: 3.3285,   lng: 99.1625   },

  // ─── Sumatera Barat ───
  { city: 'Padang',           province: 'Sumatera Barat',     lat: -0.9471,  lng: 100.4172  },
  { city: 'Bukittinggi',      province: 'Sumatera Barat',     lat: -0.3061,  lng: 100.3692  },
  { city: 'Padang Panjang',   province: 'Sumatera Barat',     lat: -0.4597,  lng: 100.4054  },

  // ─── Riau & Kepri ───
  { city: 'Pekanbaru',        province: 'Riau',               lat: 0.5071,   lng: 101.4478  },
  { city: 'Dumai',            province: 'Riau',               lat: 1.6667,   lng: 101.4500  },
  { city: 'Batam',            province: 'Kepulauan Riau',     lat: 1.0456,   lng: 104.0305  },
  { city: 'Tanjungpinang',    province: 'Kepulauan Riau',     lat: 0.9168,   lng: 104.4384  },

  // ─── Sumatera Selatan ───
  { city: 'Palembang',        province: 'Sumatera Selatan',   lat: -2.9761,  lng: 104.7754  },
  { city: 'Lubuklinggau',     province: 'Sumatera Selatan',   lat: -3.3000,  lng: 102.8667  },
  { city: 'Prabumulih',       province: 'Sumatera Selatan',   lat: -3.4349,  lng: 104.2389  },

  // ─── Jambi, Bengkulu, Lampung ───
  { city: 'Jambi',            province: 'Jambi',              lat: -1.6101,  lng: 103.6131  },
  { city: 'Bengkulu',         province: 'Bengkulu',           lat: -3.7928,  lng: 102.2608  },
  { city: 'Bandar Lampung',   province: 'Lampung',            lat: -5.4296,  lng: 105.2617  },
  { city: 'Metro',            province: 'Lampung',            lat: -5.1133,  lng: 105.3069  },

  // ─── Aceh ───
  { city: 'Banda Aceh',       province: 'Aceh',               lat: 5.5477,   lng: 95.3238   },
  { city: 'Lhokseumawe',      province: 'Aceh',               lat: 5.1800,   lng: 97.1500   },
  { city: 'Langsa',           province: 'Aceh',               lat: 4.4776,   lng: 97.9694   },

  // ─── Kalimantan ───
  { city: 'Pontianak',        province: 'Kalimantan Barat',   lat: -0.0263,  lng: 109.3425  },
  { city: 'Singkawang',       province: 'Kalimantan Barat',   lat: 0.9054,   lng: 108.9949  },
  { city: 'Balikpapan',       province: 'Kalimantan Timur',   lat: -1.2675,  lng: 116.8289  },
  { city: 'Samarinda',        province: 'Kalimantan Timur',   lat: -0.5022,  lng: 117.1536  },
  { city: 'Bontang',          province: 'Kalimantan Timur',   lat: 0.1338,   lng: 117.5005  },
  { city: 'Banjarmasin',      province: 'Kalimantan Selatan', lat: -3.3186,  lng: 114.5944  },
  { city: 'Banjarbaru',       province: 'Kalimantan Selatan', lat: -3.4421,  lng: 114.8317  },
  { city: 'Palangkaraya',     province: 'Kalimantan Tengah',  lat: -2.2161,  lng: 113.9151  },

  // ─── Sulawesi ───
  { city: 'Makassar',         province: 'Sulawesi Selatan',   lat: -5.1477,  lng: 119.4327  },
  { city: 'Parepare',         province: 'Sulawesi Selatan',   lat: -4.0135,  lng: 119.6330  },
  { city: 'Palopo',           province: 'Sulawesi Selatan',   lat: -3.0041,  lng: 120.1969  },
  { city: 'Manado',           province: 'Sulawesi Utara',     lat: 1.4748,   lng: 124.8421  },
  { city: 'Bitung',           province: 'Sulawesi Utara',     lat: 1.4435,   lng: 125.1879  },
  { city: 'Palu',             province: 'Sulawesi Tengah',    lat: -0.8917,  lng: 119.8707  },
  { city: 'Kendari',          province: 'Sulawesi Tenggara',  lat: -3.9450,  lng: 122.4989  },
  { city: 'Gorontalo',        province: 'Gorontalo',          lat: 0.5435,   lng: 123.0595  },

  // ─── Maluku & Papua ───
  { city: 'Ambon',            province: 'Maluku',             lat: -3.6554,  lng: 128.1908  },
  { city: 'Ternate',          province: 'Maluku Utara',       lat: 0.7833,   lng: 127.3667  },
  { city: 'Jayapura',         province: 'Papua',              lat: -2.5337,  lng: 140.7181  },
  { city: 'Sorong',           province: 'Papua Barat',        lat: -0.8762,  lng: 131.2519  },
  { city: 'Timika',           province: 'Papua Tengah',       lat: -4.5268,  lng: 136.8826  },
  { city: 'Manokwari',        province: 'Papua Barat',        lat: -0.8615,  lng: 134.0625  },
]
