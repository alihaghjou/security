import { db } from "./db";
import { SecurityMode } from "@prisma/client";

export async function getCurrentUser(req?: Request) {
  // Check for custom header or cookie if present
  let userEmail = "demo-user@secureflow.local";
  let userMode: SecurityMode = SecurityMode.PERSONAL;

  if (req) {
    const customUser = req.headers.get("x-user-email");
    if (customUser) userEmail = customUser;

    const customMode = req.headers.get("x-user-mode");
    if (customMode === "DEVELOPER") userMode = SecurityMode.DEVELOPER;
  }

  let user = await db.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        email: userEmail,
        name: userEmail.split("@")[0].replace(/[._-]/g, " "),
        mode: userMode,
      },
    });
  }

  return user;
}
