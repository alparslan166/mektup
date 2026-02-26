import { getLetters } from "@/app/actions/letterActions";
import GonderilenlerClient from "./GonderilenlerClient";

export default async function GonderilenlerPage() {
    const letters = await getLetters();

    return (
        <div className="container mx-auto px-4 py-12 pt-0 max-w-5xl mt-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-12 text-center">
                <h1 className="font-kurale text-4xl sm:text-5xl font-bold text-white italic mb-4 drop-shadow-lg">
                    Gönderilen Mektuplar
                </h1>
                <p className="text-white/90 max-w-2xl mx-auto font-medium drop-shadow-md">
                    Göndermiş olduğunuz tüm mektupları buradan takip edebilirsiniz. Admin ekibimiz mektubunuzu hazırlayıp yola çıkardığında durum bilgisi anlık olarak güncellenecektir.
                </p>
            </header>

            <GonderilenlerClient initialLetters={letters} />
        </div>
    );
}

// Added force dynamic to ensure users see status changes immediately
export const dynamic = "force-dynamic";
export const revalidate = 0;
