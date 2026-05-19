"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/audit-log";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/require-permission";

import {
  campusIdSchema,
  getCampusFormValues,
  getRoomFormValues,
  roomIdSchema,
  type CampusFormValues,
  type RoomFormValues,
} from "./campus-schema";

function redirectWithCampusError(path: string, error: string): never {
  redirect(`${path}?error=${error}`);
}

function toCampusMutationData(values: CampusFormValues) {
  return {
    name: values.name,
    address: values.address ?? null,
    businessHours: values.businessHours ?? null,
    status: values.status,
  };
}

function toRoomMutationData(values: RoomFormValues) {
  return {
    name: values.name,
    capacity: values.capacity ?? null,
    equipment: values.equipment ?? null,
    status: values.status,
  };
}

function campusSnapshot(campus: {
  id: string;
  tenantId: string;
  name: string;
  address: string | null;
  businessHours: string | null;
  status: string;
}) {
  return {
    id: campus.id,
    tenantId: campus.tenantId,
    name: campus.name,
    address: campus.address,
    businessHours: campus.businessHours,
    status: campus.status,
  };
}

function roomSnapshot(room: {
  id: string;
  tenantId: string;
  campusId: string;
  name: string;
  capacity: number | null;
  equipment: string | null;
  status: string;
}) {
  return {
    id: room.id,
    tenantId: room.tenantId,
    campusId: room.campusId,
    name: room.name,
    capacity: room.capacity,
    equipment: room.equipment,
    status: room.status,
  };
}

export async function createCampusAction(formData: FormData) {
  const currentUser = await requirePermission("campus:manage", {
    nextPath: "/dashboard/campuses",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsed = getCampusFormValues(formData);

  if (!parsed.success) {
    redirectWithCampusError("/dashboard/campuses", "invalid_input");
  }

  const campus = await prisma.$transaction(async (tx) => {
    const createdCampus = await tx.campus.create({
      data: {
        tenantId: currentUser.tenantId,
        ...toCampusMutationData(parsed.data),
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "campus.create",
        entityType: "campus",
        entityId: createdCampus.id,
        afterJson: campusSnapshot(createdCampus),
      },
      tx,
    );

    return createdCampus;
  });

  revalidatePath("/dashboard/campuses");
  redirect(`/dashboard/campuses/${campus.id}`);
}

export async function updateCampusAction(formData: FormData) {
  const currentUser = await requirePermission("campus:manage", {
    nextPath: "/dashboard/campuses",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsedCampusId = campusIdSchema.safeParse(formData.get("campusId"));
  const parsed = getCampusFormValues(formData);

  if (!parsedCampusId.success || !parsed.success) {
    redirectWithCampusError("/dashboard/campuses", "invalid_input");
  }

  const campus = await prisma.$transaction(async (tx) => {
    const beforeCampus = await tx.campus.findFirst({
      where: {
        id: parsedCampusId.data,
        tenantId: currentUser.tenantId,
      },
    });

    if (!beforeCampus) {
      return null;
    }

    const updatedCampus = await tx.campus.update({
      where: {
        id: beforeCampus.id,
      },
      data: toCampusMutationData(parsed.data),
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "campus.update",
        entityType: "campus",
        entityId: updatedCampus.id,
        beforeJson: campusSnapshot(beforeCampus),
        afterJson: campusSnapshot(updatedCampus),
      },
      tx,
    );

    return updatedCampus;
  });

  if (!campus) {
    redirectWithCampusError("/dashboard/campuses", "not_found");
  }

  revalidatePath("/dashboard/campuses");
  revalidatePath(`/dashboard/campuses/${campus.id}`);
  redirect(`/dashboard/campuses/${campus.id}`);
}

export async function createRoomAction(formData: FormData) {
  const currentUser = await requirePermission("campus:manage", {
    nextPath: "/dashboard/campuses",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsed = getRoomFormValues(formData);

  if (!parsed.success) {
    redirectWithCampusError("/dashboard/campuses", "invalid_room");
  }

  const room = await prisma.$transaction(async (tx) => {
    const campus = await tx.campus.findFirst({
      where: {
        id: parsed.data.campusId,
        tenantId: currentUser.tenantId,
      },
    });

    if (!campus) {
      return null;
    }

    const createdRoom = await tx.room.create({
      data: {
        tenantId: currentUser.tenantId,
        campusId: campus.id,
        ...toRoomMutationData(parsed.data),
      },
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "room.create",
        entityType: "room",
        entityId: createdRoom.id,
        afterJson: roomSnapshot(createdRoom),
      },
      tx,
    );

    return createdRoom;
  });

  if (!room) {
    redirectWithCampusError("/dashboard/campuses", "not_found");
  }

  revalidatePath(`/dashboard/campuses/${room.campusId}`);
  redirect(`/dashboard/campuses/${room.campusId}`);
}

export async function updateRoomAction(formData: FormData) {
  const currentUser = await requirePermission("campus:manage", {
    nextPath: "/dashboard/campuses",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const parsedRoomId = roomIdSchema.safeParse(formData.get("roomId"));
  const parsed = getRoomFormValues(formData);

  if (!parsedRoomId.success || !parsed.success) {
    redirectWithCampusError("/dashboard/campuses", "invalid_room");
  }

  const room = await prisma.$transaction(async (tx) => {
    const beforeRoom = await tx.room.findFirst({
      where: {
        id: parsedRoomId.data,
        campusId: parsed.data.campusId,
        tenantId: currentUser.tenantId,
      },
    });

    if (!beforeRoom) {
      return null;
    }

    const updatedRoom = await tx.room.update({
      where: {
        id: beforeRoom.id,
      },
      data: toRoomMutationData(parsed.data),
    });

    await writeAuditLog(
      {
        tenantId: currentUser.tenantId,
        actorUserId: currentUser.id,
        action: "room.update",
        entityType: "room",
        entityId: updatedRoom.id,
        beforeJson: roomSnapshot(beforeRoom),
        afterJson: roomSnapshot(updatedRoom),
      },
      tx,
    );

    return updatedRoom;
  });

  if (!room) {
    redirectWithCampusError("/dashboard/campuses", "not_found");
  }

  revalidatePath(`/dashboard/campuses/${room.campusId}`);
  redirect(`/dashboard/campuses/${room.campusId}`);
}
