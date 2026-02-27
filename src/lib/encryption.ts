import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

// Eğer env'de CREDIT_ENCRYPTION_KEY tanımlı değilse kriptolama çalışamaz.
// 32 byte (256 bit) uzunluğunda hex veya base64 string olmalı.
// Geliştirme ortamında (fallback) olarak rastgele veya sabit bir değer kullanılabilir,
// fakat production ortamında kesinlikle güvenli bir değişken tanımlanmalıdır.
function getEncryptionKey(): Buffer {
    const secret = process.env.CREDIT_ENCRYPTION_KEY;
    if (!secret) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('CREDIT_ENCRYPTION_KEY environment variable is missing');
        }
        // Geliştirici ortamı için 32 byte uzunluğunda geçici bir anahtar (uyarı basar)
        console.warn('WARNING: CREDIT_ENCRYPTION_KEY is not set. Using a fallback key for development ONLY.');
        return crypto.scryptSync('fallback_dev_password', 'salt', 32);
    }

    // 32 byte olmasını garanti altına alalım (Eğer değilse padding uygulanabilir veya hata fırlatılabilir)
    // En iyisi tam 32 byte (64 karakter hex) kullanılmasıdır.
    if (Buffer.from(secret).length !== 32) {
        if (secret.length === 64) {
            return Buffer.from(secret, 'hex'); // Hex formattaysa parse edelim
        }
        return crypto.scryptSync(secret, 'salt', 32); // Değilse 32 byte'lık key üretelim
    }
    return Buffer.from(secret);
}

/**
 * Sayısal bakiye değerini AES-256-GCM ile şifreler.
 * Çıktı formatı: iv (hex) + ':' + authTag (hex) + ':' + encryptedData (hex)
 * 
 * @param balance Şifrelenecek bakiyenin ondalıklı (float) karşılığı
 * @returns Şifrelenmiş metin
 */
export function encryptBalance(balance: number): string {
    if (typeof balance !== 'number' || isNaN(balance)) {
        throw new Error('Invalid balance value for encryption');
    }

    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16); // Initialization Vector
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const balanceString = balance.toString();
    let encrypted = cipher.update(balanceString, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    // Sonuç: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Şifreli bakiye verisini (string) çözer ve sayı (float) olarak döndürür.
 * 
 * @param encryptedData Şifrelenmiş metin (encryptBalance ile oluşturulmuş formda)
 * @returns Çözülen bakiye değeri, hata olursa exception fırlatır veya null kabul edilirse 0 döndürebiliriz ama güvenlik gereği hata fırlatmak daha iyidir.
 */
export function decryptBalance(encryptedData: string | null | undefined): number {
    if (!encryptedData) {
        return 0; // Eğer henüz şifreli veri yoksa (ilk defa bağlanıyorsa vb.) bakiye 0'dır
    }

    try {
        const parts = encryptedData.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted balance format');
        }

        const [ivHex, authTagHex, encryptedHex] = parts;

        const key = getEncryptionKey();
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        const balance = parseFloat(decrypted);
        if (isNaN(balance)) {
            throw new Error('Decrypted balance is not a valid number');
        }

        return balance;
    } catch (error) {
        console.error('Bakiye çözme hatası (Muhtemelen key değişti veya veri bozuldu):', error);
        // Güvenlik gereği bakiye çözülemediğinde işlemi durdurmak (throw) önemlidir, 
        // ancak kullanıcı deneyimi için (bakiye sıfırlanmış kabul edilebilir) bu senaryo
        // duruma göre yönetilmelidir. Şimdilik hata fırlatıyoruz.
        throw new Error('Kredi/Bakiye bilgisi doğrulanamadı.');
    }
}
