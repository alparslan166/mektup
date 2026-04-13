import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
    return new PrismaClient({
        datasourceUrl: appendPoolParams(process.env.DATABASE_URL || ""),
    });
};

function appendPoolParams(url: string): string {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}connection_limit=10&pool_timeout=30`;
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
