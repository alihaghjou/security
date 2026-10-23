import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  try {
    const sarah = await db.user.findFirst({
      where: { email: "sarah@acme-corp.demo" },
    });

    if (sarah) {
      await db.notification.updateMany({
        where: { userId: sarah.id, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
