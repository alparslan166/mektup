import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserDrafts } from "@/app/actions/draftActions";
import DraftListClient from "./DraftListClient";
import { Archive, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function TaslaklarPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/login?callbackUrl=/taslaklar");
    }

    const drafts = await getUserDrafts();

    return (
        <div className="min-h-screen pt-24 pb-12 sm:pt-32 flex flex-col items-center">
            <div className="w-full max-w-4xl px-4 sm:px-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-wood/10 pb-6">
                    <div className="-mt-10">
                        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-seal hover:text-seal transition-colors mb-4 uppercase tracking-widest">
                            <ArrowLeft size={16} /> Panoya Dön
                        </Link>
                        <h1 className="font-playfair text-4xl font-bold text-wood-dark flex items-center gap-3">
                            <Archive className="text-seal" size={36} />
                            Taslaklarım
                        </h1>
                        <p className="text-ink mt-2 text-lg">
                            Yarım bıraktığınız mektuplara buradan devam edebilirsiniz.
                        </p>
                    </div>
                </div>

                <DraftListClient drafts={drafts} />

            </div>
        </div>
    );
}
