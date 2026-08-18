import { prisma } from "../../db/prisma";

export async function isAssignedToIndicator(userId: string, indicatorId: string): Promise<boolean> {
  const assignment = await prisma.assignment.findUnique({
    where: { userId_indicatorId: { userId, indicatorId } },
  });
  return assignment !== null;
}
