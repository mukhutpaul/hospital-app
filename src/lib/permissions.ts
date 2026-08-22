import { prisma } from "@/lib/prisma";

export async function hasPermission(
  userId: number,
  permissionCode: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  if (!user || !user.actif || !user.role) {
    return false;
  }

  return user.role.permissions.some(
    (rp) => rp.permission.code === permissionCode
  );
}