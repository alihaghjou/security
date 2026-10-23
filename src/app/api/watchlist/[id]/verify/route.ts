import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helper";
import { db } from "@/lib/db";
import { verifyWatchlistFix } from "@/lib/services/fix-verifier";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    const { id } = await params;
    const body = await req.json();
    const { newVersion } = body;

    if (!newVersion || newVersion.trim() === "") {
      return NextResponse.json({ error: "newVersion is required" }, { status: 400 });
    }

    // Ownership check
    const entry = await db.watchlistEntry.findFirst({
      where: { id, userId: user.id },
    });

    if (!entry) {
      return NextResponse.json({ error: "Watchlist entry not found" }, { status: 404 });
    }

    const verification = await verifyWatchlistFix(id, newVersion.trim());

    // Fetch refreshed record
    const refreshed = await db.watchlistEntry.findUnique({
      where: { id },
      include: {
        findings: { orderBy: { detectedAt: "desc" } },
        verifications: { orderBy: { verifiedAt: "desc" } },
      },
    });

    return NextResponse.json({
      success: true,
      verification,
      entry: refreshed,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
