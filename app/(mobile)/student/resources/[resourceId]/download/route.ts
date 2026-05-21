import { NextResponse } from "next/server";

import { getStudentResourceDetail } from "@/features/resources/queries";
import { createAuthorizedResourceDownloadUrl } from "@/lib/resources/download-authorization";
import { requirePermission } from "@/lib/rbac/require-permission";

type StudentResourceDownloadRouteProps = {
  params: Promise<{
    resourceId: string;
  }>;
};

export async function GET(_request: Request, { params }: StudentResourceDownloadRouteProps) {
  const currentUser = await requirePermission("resources:download", {
    nextPath: "/student/resources",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const { resourceId } = await params;
  const resource = await getStudentResourceDetail(currentUser.tenantId, currentUser.id, resourceId);

  if (!resource) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const signed = await createAuthorizedResourceDownloadUrl(
    {
      tenantId: currentUser.tenantId,
      roleKey: currentUser.roleKey,
      userId: currentUser.id,
    },
    {
      tenantId: resource.tenantId,
      provider: resource.provider,
      bucket: resource.bucket,
      objectKey: resource.objectKey,
      ownerTeacherUserId: resource.lesson?.teacher.userId,
      studentUserIds: [currentUser.id],
    },
  );

  if (!signed.allowed) {
    return NextResponse.json(
      { error: signed.reason },
      { status: signed.reason === "missing_object" ? 404 : 403 },
    );
  }

  return NextResponse.redirect(signed.url);
}
