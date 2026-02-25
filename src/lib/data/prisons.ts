export interface Prison {
    id: string;
    name: string;
    address: string;
}

export interface CityPrisons {
    city: string;
    prisons: Prison[];
}

export const prisonData: CityPrisons[] = [
    {
        city: "Afyonkarahisar",
        prisons: [
            {
                id: "afyon-1",
                name: "Afyonkarahisar 1 Nolu T Tipi Kapalı Ceza İnfaz Kurumu",
                address: "Ali İhsan Paşa Mah. Sultan Divani Cad. No.8/1 Merkez/AFYONKARAHİSAR"
            },
            {
                id: "afyon-2",
                name: "Afyonkarahisar 2 Nolu T Tipi Kapalı Ceza İnfaz Kurumu",
                address: "Ali İhsan Paşa Mah. Sultan Divani Cad. No.8/2 Merkez/AFYONKARAHİSAR"
            },
            {
                id: "afyon-open",
                name: "Afyonkarahisar Açık Ceza İnfaz Kurumu",
                address: "Eskişehir Karayolu 10. Km. Merkez/AFYONKARAHİSAR"
            }
        ]
    },
    {
        city: "Ankara",
        prisons: [
            {
                id: "ankara-sincan-1",
                name: "Sincan 1 Nolu L Tipi Kapalı Ceza İnfaz Kurumu",
                address: "Ankara Ceza İnfaz Kurumları Kampüsü, Sincan/ANKARA"
            },
            {
                id: "ankara-sincan-2",
                name: "Sincan 2 Nolu L Tipi Kapalı Ceza İnfaz Kurumu",
                address: "Ankara Ceza İnfaz Kurumları Kampüsü, Sincan/ANKARA"
            },
            {
                id: "ankara-sincan-f1",
                name: "Sincan 1 Nolu F Tipi Yüksek Güvenlikli Kapalı Ceza İnfaz Kurumu",
                address: "Ankara Ceza İnfaz Kurumları Kampüsü, Sincan/ANKARA"
            }
        ]
    },
    {
        city: "İstanbul",
        prisons: [
            {
                id: "ist-silivri-1",
                name: "Silivri 1 Nolu L Tipi Kapalı Ceza İnfaz Kurumu",
                address: "Silivri Ceza İnfaz Kurumları Kampüsü, Semizkumlar Mah. Silivri/İSTANBUL"
            },
            {
                id: "ist-maltepe-1",
                name: "Maltepe 1 Nolu L Tipi Kapalı Ceza İnfaz Kurumu",
                address: "Büyükbakkalköy Mah. Maltepe/İSTANBUL"
            },
            {
                id: "ist-metris-1",
                name: "Metris 1 Nolu T Tipi Kapalı Ceza İnfaz Kurumu",
                address: "Eski Edirne Asfaltı No:1 Esenler/İSTANBUL"
            }
        ]
    },
    {
        city: "İzmir",
        prisons: [
            {
                id: "izmir-aliaga-1",
                name: "İzmir 1 Nolu T Tipi Kapalı Ceza İnfaz Kurumu",
                address: "Şakran, Yenişakran Mah. Aliağa/İZMİR"
            },
            {
                id: "izmir-buc-1",
                name: "Buca Kapalı Ceza İnfaz Kurumu",
                address: "Adnan Kahveci Cad. No:1 Buca/İZMİR"
            }
        ]
    },
    {
        city: "Antalya",
        prisons: [
            {
                id: "antalya-l-1",
                name: "Antalya L Tipi Kapalı Ceza İnfaz Kurumu",
                address: "Döşemealtı/ANTALYA"
            }
        ]
    },
    {
        city: "Bursa",
        prisons: [
            {
                id: "bursa-h-1",
                name: "Bursa H Tipi Kapalı Ceza İnfaz Kurumu",
                address: "Bursa-Balıkesir Yolu 15. km Nilüfer/BURSA"
            }
        ]
    }
];

export const getAllCities = () => prisonData.map(d => d.city).sort();
export const getPrisonsByCity = (city: string) => {
    const cityData = prisonData.find(d => d.city === city);
    return cityData ? cityData.prisons : [];
};
