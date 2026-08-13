import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { findVehicle } from "@/lib/catalog";
import { buildTemplateForVehicle } from "@/lib/template";

const schema = z.object({
  brand: z.string().trim().min(1),
  model: z.string().trim().min(1),
  year: z.coerce.number().int().min(1990).max(new Date().getFullYear() + 1),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data kendaraan tidak valid." }, { status: 400 });
  }
  const { brand, model, year } = parsed.data;

  const vehicle = findVehicle(brand, model);
  if (!vehicle) {
    return NextResponse.json({ error: "Model belum ada di katalog." }, { status: 404 });
  }

  const template = buildTemplateForVehicle(vehicle.brand, vehicle.model, String(year), vehicle.tierBSlug);

  const inspection = await prisma.inspection.create({
    data: {
      userId: user.id,
      brand: vehicle.brand,
      model: vehicle.model,
      yearRange: String(year),
      templateSnapshot: JSON.stringify(template),
      templateVersion: template.version,
      answers: "{}",
      status: "draft",
    },
  });

  return NextResponse.json({ id: inspection.id });
}
