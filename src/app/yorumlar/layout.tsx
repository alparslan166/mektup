import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Müşteri Yorumları & Deneyimleri | Mektuplaş",
    description: "Mektuplaş kullanıcılarının gerçek deneyimlerini okuyun. Cezaevi mektubu, geleceğe mektup ve hediye gönderimi hakkındaki yorumlar ve puanlamalar.",
};

export default function YorumlarLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
