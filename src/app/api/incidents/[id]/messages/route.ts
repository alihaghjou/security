import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const messages = await db.incidentMessage.findMany({
      where: { incidentId: id },
      include: {
        sender: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ messages });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { content, senderId, senderRole } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Message content cannot be empty" }, { status: 400 });
    }

    // Resolve sender
    let finalSenderId = senderId;
    if (!finalSenderId) {
      const defaultUser = await db.user.findFirst({
        where: {
          email: senderRole === "TECHNICIAN" ? "alex@secureflow.demo" : "sarah@acme-corp.demo",
        },
      });
      if (defaultUser) finalSenderId = defaultUser.id;
    }

    const message = await db.incidentMessage.create({
      data: {
        incidentId: id,
        senderId: finalSenderId,
        senderRole: (senderRole as UserRole) || UserRole.USER,
        content: content.trim(),
        isRead: false,
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, message });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
