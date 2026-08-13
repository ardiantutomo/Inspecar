import { mkdir, writeFile, readFile, readdir } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import type { Inspection } from "@/lib/types";

const DIR = path.join(process.cwd(), "data", "shares");

async function ensureDir() {
  await mkdir(DIR, { recursive: true });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Inspection;
    if (!body?.id || !body?.brand || !body?.model) {
      return NextResponse.json({ error: "Data inspeksi tidak lengkap" }, { status: 400 });
    }
    await ensureDir();
    const shareId = body.id;
    const file = path.join(DIR, `${shareId}.json`);
    await writeFile(file, JSON.stringify(body, null, 2), "utf8");
    return NextResponse.json({ id: shareId });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    try {
      await ensureDir();
      const files = await readdir(DIR);
      return NextResponse.json({ count: files.filter((f) => f.endsWith(".json")).length });
    } catch {
      return NextResponse.json({ count: 0 });
    }
  }

  try {
    const file = path.join(DIR, `${id}.json`);
    const raw = await readFile(file, "utf8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ error: "Laporan tidak ditemukan" }, { status: 404 });
  }
}
