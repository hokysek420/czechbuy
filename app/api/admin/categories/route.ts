import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  CategoryComingSoonConfig,
  DEFAULT_COMING_SOON_CONFIG,
  CATEGORY_COOKIE_NAME,
} from "@/lib/category-settings";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DATA_FILE_PATH = path.join(process.cwd(), "lib", "data", "category-status.json");

// In-memory cache fallback
let memoryCategoryStatus: CategoryComingSoonConfig = { ...DEFAULT_COMING_SOON_CONFIG };

function loadSavedStatus(): CategoryComingSoonConfig {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        memoryCategoryStatus = { ...DEFAULT_COMING_SOON_CONFIG, ...parsed };
        return memoryCategoryStatus;
      }
    }
  } catch {
    // fallback to in-memory
  }
  return memoryCategoryStatus;
}

function persistStatus(config: CategoryComingSoonConfig): void {
  memoryCategoryStatus = { ...config };
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(config, null, 2), "utf-8");
  } catch {
    // In serverless / read-only environment, in-memory cache holds the state
  }
}

export async function GET() {
  const current = loadSavedStatus();
  return NextResponse.json(current, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (data && typeof data === "object") {
      const updated: CategoryComingSoonConfig = {
        parfemy: Boolean(data.parfemy),
        obleceni: Boolean(data.obleceni),
        boty: Boolean(data.boty),
        digital: Boolean(data.digital),
      };

      persistStatus(updated);

      const res = NextResponse.json({
        success: true,
        status: updated,
      });

      // Set cookie for instant server and client access
      res.cookies.set(CATEGORY_COOKIE_NAME, JSON.stringify(updated), {
        path: "/",
        maxAge: 31536000,
        sameSite: "lax",
      });

      return res;
    }
    return NextResponse.json(
      { error: "Neplatný formát dat." },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: "Chyba při ukládání stavu kategorií." },
      { status: 500 }
    );
  }
}
