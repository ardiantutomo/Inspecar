"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/db";

export type AuthState = { error?: string };

const daftarSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 huruf"),
  email: z.string().trim().toLowerCase().email("Alamat email belum benar"),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
});

function safePath(raw: FormDataEntryValue | null): string {
  const value = typeof raw === "string" ? raw : "";
  return value.startsWith("/") && !value.startsWith("//") ? value : "/inspeksi";
}

export async function daftarAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = daftarSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data belum lengkap" };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { error: "Email ini sudah terdaftar. Masuk saja dengan email tersebut." };
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
    },
  });

  await createSession(user.id);
  redirect(safePath(formData.get("lanjut")));
}

export async function masukAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email dan kata sandi harus diisi" };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Email atau kata sandi tidak cocok" };
  }

  await createSession(user.id);
  redirect(safePath(formData.get("lanjut")));
}

export async function keluarAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
