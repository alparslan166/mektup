import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const cityParam = searchParams.get("city");

        const jsonPath = path.join(process.cwd(), "cezaevleri.json");
        const rawData = fs.readFileSync(jsonPath, "utf-8");
        const categories = JSON.parse(rawData);

        const flatPrisons: any[] = [];

        // Use Turkish-aware normalization if city is provided
        const normalizedCity = cityParam ? cityParam.toLocaleUpperCase('tr-TR').trim() : null;

        categories.forEach((cat: any) => {
            cat.kurumlar.forEach((kurum: any) => {
                const kurumCity = kurum.il.toLocaleUpperCase('tr-TR').trim();

                if (!normalizedCity || kurumCity === normalizedCity) {
                    flatPrisons.push({
                        id: kurum.kurum + "-" + kurum.il,
                        city: kurum.il,
                        name: kurum.kurum,
                        type: cat.kategori,
                        address: ""
                    });
                }
            });
        });

        // Sort by name using Turkish locale
        flatPrisons.sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'));

        return NextResponse.json(flatPrisons);
    } catch (error) {
        console.error("Error fetching prisons from JSON:", error);
        return NextResponse.json({ error: "Failed to fetch prisons" }, { status: 500 });
    }
}
