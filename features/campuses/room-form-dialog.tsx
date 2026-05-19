import { Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createRoomAction, updateRoomAction } from "./actions";
import { roomStatusLabels, roomStatusValues, type RoomStatusValue } from "./campus-schema";

type RoomFormRoom = {
  id: string;
  campusId: string;
  name: string;
  capacity: number | null;
  equipment: string | null;
  status: RoomStatusValue;
};

function RoomFormFields({ campusId, room }: { campusId: string; room?: RoomFormRoom }) {
  return (
    <div className="grid gap-4">
      <input type="hidden" name="campusId" value={campusId} />
      {room ? <input type="hidden" name="roomId" value={room.id} /> : null}
      <div className="grid gap-2">
        <Label htmlFor="room-name">教室名称</Label>
        <Input
          id="room-name"
          name="name"
          defaultValue={room?.name}
          placeholder="例如：A101"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="room-capacity">容量</Label>
        <Input
          id="room-capacity"
          name="capacity"
          type="number"
          min={1}
          defaultValue={room?.capacity ?? ""}
          placeholder="例如：24"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="room-equipment">设备</Label>
        <Input
          id="room-equipment"
          name="equipment"
          defaultValue={room?.equipment ?? ""}
          placeholder="白板、投影、钢琴等"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="room-status">状态</Label>
        <select
          id="room-status"
          name="status"
          defaultValue={room?.status ?? "ACTIVE"}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {roomStatusValues.map((status) => (
            <option key={status} value={status}>
              {roomStatusLabels[status]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function RoomCreateDialog({ campusId }: { campusId: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" aria-hidden="true" />
          新增教室
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增教室</DialogTitle>
          <DialogDescription>教室信息将用于后续排课选择和冲突检测。</DialogDescription>
        </DialogHeader>
        <form action={createRoomAction} className="grid gap-5">
          <RoomFormFields campusId={campusId} />
          <DialogFooter>
            <Button type="submit">保存教室</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function RoomEditDialog({ room }: { room: RoomFormRoom }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="size-4" aria-hidden="true" />
          编辑
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑教室</DialogTitle>
          <DialogDescription>更新教室容量、设备和可用状态。</DialogDescription>
        </DialogHeader>
        <form action={updateRoomAction} className="grid gap-5">
          <RoomFormFields campusId={room.campusId} room={room} />
          <DialogFooter>
            <Button type="submit">保存修改</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
