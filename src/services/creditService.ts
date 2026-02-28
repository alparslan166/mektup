import prisma from '@/lib/prisma';
import { encryptBalance, decryptBalance } from '@/lib/encryption';

export class CreditService {
    /**
     * Kullanıcının güncel bakiyesini döndürür.
     * @param userId Kullanıcı ID'si
     * @returns Güncel bakiye (sayı olarak)
     */
    static async getCreditBalance(userId: string): Promise<number> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { encryptedBalance: true },
        });

        if (!user) {
            throw new Error('User not found');
        }

        if (!user.encryptedBalance) {
            return 0;
        }

        const decryptedPattern = encryptBalance(0); // For validation we might not need this, just decrypting directly

        try {
            return decryptBalance(user.encryptedBalance);
        } catch (err) {
            console.error('get balance fallback returning 0 due to error', err);
            return 0; // Şifrelemede bir sorun varsa 0 dönüyoruz (veya loglayıp hata atılabilir)
        }
    }

    /**
     * Kullanıcının bakiyesine kredi ekler ve 'CreditTransaction' tablosuna kaydeder.
     * @param userId Kullanıcı ID
     * @param amount Eklenecek miktar (pozitif olmalı)
     * @param description İşlem açıklaması
     * @param referenceId (Opsiyonel) İlgili sipariş vb id'si
     * @returns Güncel bakiye
     */
    static async addCredits(
        userId: string,
        amount: number,
        description: string,
        referenceId?: string,
        existingTx?: any
    ): Promise<number> {
        if (amount <= 0) {
            throw new Error('Amount must be strictly positive to add credit');
        }

        const execute = async (tx: any) => {
            // Postgres özel row lock işlemi: Bu kullanıcı için diğer transaction'ları beklet
            await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;

            const user = await tx.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                throw new Error('User not found');
            }

            const currentBalance = user.encryptedBalance ? decryptBalance(user.encryptedBalance) : 0;
            const newBalance = currentBalance + amount;

            const encryptedNewBalance = encryptBalance(newBalance);

            await tx.user.update({
                where: { id: userId },
                data: { encryptedBalance: encryptedNewBalance },
            });

            await tx.creditTransaction.create({
                data: {
                    userId,
                    amount,
                    type: 'DEPOSIT',
                    description,
                    referenceId,
                },
            });

            return newBalance;
        };

        if (existingTx) {
            return await execute(existingTx);
        }

        return await prisma.$transaction(async (tx) => {
            return await execute(tx);
        });
    }

    // Keep addCredit for backward compatibility
    static async addCredit(
        userId: string,
        amount: number,
        description: string,
        referenceId?: string
    ): Promise<number> {
        return this.addCredits(userId, amount, description, referenceId);
    }

    /**
     * Kullanıcının bakiyesinden kredi harcaması yapar (düşer) ve işlemi kaydeder.
     * Yetersiz bakiye durumunda hata fırlatır.
     * @param userId Kullanıcı ID
     * @param amount Harcanacak miktar (pozitif olmalı)
     * @param description İşlem açıklaması
     * @param referenceId (Opsiyonel) İlgili sipariş/mektup id'si
     * @returns Güncel bakiye
     */
    static async spendCredit(
        userId: string,
        amount: number,
        description: string,
        referenceId?: string
    ): Promise<number> {
        if (amount <= 0) {
            throw new Error('Amount must be strictly positive to spend credit');
        }

        return await prisma.$transaction(async (tx) => {
            // Postgres özel row lock işlemi: Bu kullanıcı için diğer transaction'ları beklet
            await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;

            const user = await tx.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                throw new Error('User not found');
            }

            const currentBalance = user.encryptedBalance ? decryptBalance(user.encryptedBalance) : 0;

            if (currentBalance < amount) {
                throw new Error('Yetersiz kredi bakiyesi');
            }

            const newBalance = currentBalance - amount;
            const encryptedNewBalance = encryptBalance(newBalance);

            await tx.user.update({
                where: { id: userId },
                data: { encryptedBalance: encryptedNewBalance },
            });

            await tx.creditTransaction.create({
                data: {
                    userId,
                    amount: -amount, // Çıkan bakiye olduğu için negatif göster
                    type: 'SPEND',
                    description,
                    referenceId,
                },
            });

            return newBalance;
        });
    }

    /**
     * (Opsiyonel) İade işlemi. Harcanan krediyi geri yükler.
     */
    static async refundCredit(
        userId: string,
        amount: number,
        description: string,
        referenceId?: string
    ): Promise<number> {
        if (amount <= 0) {
            throw new Error('Amount must be strictly positive to refund credit');
        }

        return await prisma.$transaction(async (tx) => {
            await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;

            const user = await tx.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                throw new Error('User not found');
            }

            const currentBalance = user.encryptedBalance ? decryptBalance(user.encryptedBalance) : 0;
            const newBalance = currentBalance + amount;
            const encryptedNewBalance = encryptBalance(newBalance);

            await tx.user.update({
                where: { id: userId },
                data: { encryptedBalance: encryptedNewBalance },
            });

            await tx.creditTransaction.create({
                data: {
                    userId,
                    amount,
                    type: 'REFUND',
                    description,
                    referenceId,
                },
            });

            return newBalance;
        });
    }
}
