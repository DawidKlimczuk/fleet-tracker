"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Pobieranie pojazdów i wydatków
export async function getFleetData() {
  const vehicles = await prisma.vehicle.findMany({
    include: {
      expenses: {
        orderBy: { date: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const expenses = await prisma.expense.findMany({
    include: {
      vehicle: {
        select: { plate: true },
      },
    },
    orderBy: { date: "desc" },
  });

  return { vehicles, expenses };
}

// Dodawanie pojazdu
export async function createVehicle(formData: {
  model: string;
  plate: string;
  year: number;
  mileage: number;
}) {
  await prisma.vehicle.create({
    data: {
      model: formData.model,
      plate: formData.plate.toUpperCase(),
      year: formData.year,
      mileage: formData.mileage,
      status: "active",
    },
  });

  revalidatePath("/");
}

// Dodawanie kosztu
export async function createExpense(formData: {
  vehicleId: string;
  type: string;
  amount: number;
  description?: string;
}) {
  await prisma.expense.create({
    data: {
      vehicleId: formData.vehicleId,
      type: formData.type,
      amount: formData.amount,
      description: formData.description,
    },
  });

  revalidatePath("/");
}