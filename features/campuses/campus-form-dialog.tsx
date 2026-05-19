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

import { createCampusAction, updateCampusAction } from "./actions";
import { campusStatusLabels, campusStatusValues, type CampusStatusValue } from "./campus-schema";

type CampusFormCampus = {
  id: string;
  name: string;
  address: string | null;
  businessHours: string | null;
  status: CampusStatusValue;
};

function CampusFormFields({ campus }: { campus?: CampusFormCampus }) {
  return (
    <div className="grid gap-4">
      {campus ? <input type="hidden" name="campusId" value={campus.id} /> : null}
      <div className="grid gap-2">
        <Label htmlFor="campus-name">校区名称</Label>
        <Input
          id="campus-name"
          name="name"
          defaultValue={campus?.name}
          placeholder="例如：总部校区"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="campus-address">地址</Label>
        <Input
          id="campus-address"
          name="address"
          defaultValue={campus?.address ?? ""}
          placeholder="可选"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="campus-business-hours">营业时间</Label>
        <Input
          id="campus-business-hours"
          name="businessHours"
          defaultValue={campus?.businessHours ?? ""}
          placeholder="例如：周一至周五 13:00-21:00"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="campus-status">状态</Label>
        <select
          id="campus-status"
          name="status"
          defaultValue={campus?.status ?? "ACTIVE"}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {campusStatusValues.map((status) => (
            <option key={status} value={status}>
              {campusStatusLabels[status]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function CampusCreateDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" aria-hidden="true" />
          新增校区
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增校区</DialogTitle>
          <DialogDescription>创建可用于后续排课和教室管理的校区。</DialogDescription>
        </DialogHeader>
        <form action={createCampusAction} className="grid gap-5">
          <CampusFormFields />
          <DialogFooter>
            <Button type="submit">保存校区</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CampusEditDialog({ campus }: { campus: CampusFormCampus }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pencil className="size-4" aria-hidden="true" />
          编辑校区
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑校区</DialogTitle>
          <DialogDescription>更新校区地址、营业时间和启用状态。</DialogDescription>
        </DialogHeader>
        <form action={updateCampusAction} className="grid gap-5">
          <CampusFormFields campus={campus} />
          <DialogFooter>
            <Button type="submit">保存修改</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
