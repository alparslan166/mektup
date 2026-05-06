"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";

type StatusResponse = {
  success: boolean;
  uiStatus: "success" | "failed" | "processing";
  status: string;
  orderNumber?: string;
  letterId?: string | null;
  checkResponseCode?: string | null;
  checkResponseDescription?: string | null;
};

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 20;

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const order = searchParams.get("order") || "";
  const conversationId = searchParams.get("conversationId") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StatusResponse | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [isTimedOut, setIsTimedOut] = useState(false);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (order) params.set("order", order);
    if (conversationId) params.set("conversationId", conversationId);
    return params.toString();
  }, [order, conversationId]);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      setError("Sipariş bilgisi bulunamadı.");
      return;
    }

    setLoading(true);
    setError(null);
    setIsTimedOut(false);

    let canceled = false;
    let timer: NodeJS.Timeout | null = null;
    let attempts = 0;

    const poll = async () => {
      try {
        attempts += 1;

        const res = await fetch(`/api/payments/status?${query}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (!res.ok) {
          if (!canceled) {
            setError(data?.error || "Ödeme durumu alınamadı.");
            setLoading(false);
          }
          return;
        }

        if (canceled) return;

        setResult(data as StatusResponse);
        setLoading(false);

        if ((data as StatusResponse).uiStatus === "processing") {
          if (attempts >= MAX_POLL_ATTEMPTS) {
            setIsTimedOut(true);
            return;
          }

          timer = setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch {
        if (!canceled) {
          setError("Ödeme durumu sorgulanırken bir hata oluştu.");
          setLoading(false);
        }
      }
    };

    poll();

    return () => {
      canceled = true;
      if (timer) clearTimeout(timer);
    };
  }, [query, retryKey]);

  const uiStatus = result?.uiStatus || "processing";

  const handleManualRetry = () => {
    setRetryKey((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="bg-paper border border-paper-dark rounded-xl p-8 text-center shadow-sm">
        {loading && (
          <>
            <Clock3
              className="mx-auto text-seal mb-4 animate-pulse"
              size={52}
            />
            <h1 className="font-playfair text-3xl font-bold text-wood-dark mb-2">
              Ödeme Durumu Kontrol Ediliyor
            </h1>
            <p className="text-ink-light">
              Lütfen bekleyin, işleminizi doğruluyoruz.
            </p>
          </>
        )}

        {!loading && error && (
          <>
            <XCircle className="mx-auto text-red-500 mb-4" size={52} />
            <h1 className="font-playfair text-3xl font-bold text-wood-dark mb-2">
              Durum Alınamadı
            </h1>
            <p className="text-ink-light mb-6">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-seal hover:bg-seal-hover text-white font-bold px-6 py-3 rounded-lg"
            >
              Ana Sayfaya Dön
            </Link>
          </>
        )}

        {!loading && !error && uiStatus === "processing" && (
          <>
            <Clock3
              className="mx-auto text-amber-500 mb-4 animate-pulse"
              size={52}
            />
            <h1 className="font-playfair text-3xl font-bold text-wood-dark mb-2">
              Ödeme İşleniyor
            </h1>
            <p className="text-ink-light">
              Banka onayı bekleniyor. Bu sayfa otomatik güncellenecektir.
            </p>
            {isTimedOut && (
              <div className="mt-6 space-y-3">
                <p className="text-sm text-ink-light">
                  Bekleme süresi doldu. Ödeme sonucu geç düşebilir, manuel
                  sorgulama yapabilirsiniz.
                </p>
                <button
                  onClick={handleManualRetry}
                  className="inline-flex items-center justify-center bg-seal hover:bg-seal-hover text-white font-bold px-6 py-3 rounded-lg"
                >
                  Yeniden Sorgula
                </button>
              </div>
            )}
          </>
        )}

        {!loading && !error && uiStatus === "success" && (
          <>
            <CheckCircle2 className="mx-auto text-emerald-600 mb-4" size={52} />
            <h1 className="font-playfair text-3xl font-bold text-wood-dark mb-2">
              Ödeme Başarılı
            </h1>
            <p className="text-ink-light mb-2">
              Mektubunuz başarıyla onaylandı.
            </p>
            {result?.orderNumber && (
              <p className="text-sm text-ink-light mb-6">
                Sipariş: {result.orderNumber}
              </p>
            )}
            <Link
              href="/gonderilenler"
              className="inline-flex items-center justify-center bg-seal hover:bg-seal-hover text-white font-bold px-6 py-3 rounded-lg"
            >
              Mektuplarıma Git
            </Link>
          </>
        )}

        {!loading && !error && uiStatus === "failed" && (
          <>
            <XCircle className="mx-auto text-red-500 mb-4" size={52} />
            <h1 className="font-playfair text-3xl font-bold text-wood-dark mb-2">
              Ödeme Başarısız
            </h1>
            <p className="text-ink-light mb-2">
              Ödeme onaylanmadı. Lütfen yeniden deneyin.
            </p>
            {result?.checkResponseCode && result?.checkResponseDescription && (
              <p className="text-sm text-ink-light mb-6">
                {result.checkResponseCode} - {result.checkResponseDescription}
              </p>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/mektup-yaz/akisi"
                className="inline-flex items-center justify-center bg-seal hover:bg-seal-hover text-white font-bold px-6 py-3 rounded-lg"
              >
                Yeniden Dene
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center border border-paper-dark text-ink font-bold px-6 py-3 rounded-lg"
              >
                Ana Sayfa
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PaymentResultFallback() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="bg-paper border border-paper-dark rounded-xl p-8 text-center shadow-sm">
        <Clock3 className="mx-auto text-seal mb-4 animate-pulse" size={52} />
        <h1 className="font-playfair text-3xl font-bold text-wood-dark mb-2">
          Ödeme Durumu Kontrol Ediliyor
        </h1>
        <p className="text-ink-light">
          Lütfen bekleyin, işleminizi doğruluyoruz.
        </p>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<PaymentResultFallback />}>
      <PaymentResultContent />
    </Suspense>
  );
}
