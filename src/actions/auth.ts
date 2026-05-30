"use server";

import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/validators/auth";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { authRatelimit, checkRateLimit } from "@/lib/ratelimit";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function registerUser(
  formData: FormData
): Promise<ActionResult<{ email: string }>> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const rateCheck = await checkRateLimit(
    authRatelimit,
    `register:${parsed.data.email}`
  );
  if (!rateCheck.success) {
    return { success: false, error: "Too many attempts. Please try again later." };
  }

  const existing = await db.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { success: false, error: "An account with this email already exists" };
  }

  const hashedPassword = await hash(parsed.data.password, 12);

  await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
    },
  });

  return { success: true, data: { email: parsed.data.email } };
}

export async function loginWithCredentials(
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get("email") as string;

  const rateCheck = await checkRateLimit(authRatelimit, `login:${email}`);
  if (!rateCheck.success) {
    return { success: false, error: "Too many login attempts. Please wait." };
  }

  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Invalid email or password" };
    }
    throw error;
  }
}
