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

import { createTeacherAction, updateTeacherAction } from "./actions";
import {
  formatTeacherList,
  teacherStatusLabels,
  teacherStatusValues,
  type TeacherStatusValue,
} from "./teacher-schema";

type TeacherFormTeacher = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  subjects: string[];
  grades: string[];
  status: TeacherStatusValue;
  availableTimeNotes: string | null;
  qualificationFileName: string | null;
  notes: string | null;
};

function TeacherFormFields({ teacher }: { teacher?: TeacherFormTeacher }) {
  return (
    <div className="grid gap-4">
      {teacher ? <input type="hidden" name="teacherId" value={teacher.id} /> : null}
      <div className="grid gap-2">
        <Label htmlFor="teacher-name">姓名</Label>
        <Input
          id="teacher-name"
          name="name"
          defaultValue={teacher?.name}
          placeholder="请输入教师姓名"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="teacher-phone">手机号</Label>
          <Input
            id="teacher-phone"
            name="phone"
            defaultValue={teacher?.phone}
            placeholder="请输入手机号"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="teacher-email">邮箱</Label>
          <Input
            id="teacher-email"
            name="email"
            type="email"
            defaultValue={teacher?.email ?? ""}
            placeholder="可选"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="teacher-subjects">授课科目</Label>
          <Input
            id="teacher-subjects"
            name="subjects"
            defaultValue={formatTeacherList(teacher?.subjects ?? [])}
            placeholder="数学、物理"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="teacher-grades">授课年级</Label>
          <Input
            id="teacher-grades"
            name="grades"
            defaultValue={formatTeacherList(teacher?.grades ?? [])}
            placeholder="初一、初二"
            required
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="teacher-status">状态</Label>
        <select
          id="teacher-status"
          name="status"
          defaultValue={teacher?.status ?? "ACTIVE"}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {teacherStatusValues.map((status) => (
            <option key={status} value={status}>
              {teacherStatusLabels[status]}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="teacher-available-time">可授课时间</Label>
        <Input
          id="teacher-available-time"
          name="availableTimeNotes"
          defaultValue={teacher?.availableTimeNotes ?? ""}
          placeholder="例如：周一至周五晚间"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="teacher-qualification">资质文件占位</Label>
        <Input
          id="teacher-qualification"
          name="qualificationFileName"
          defaultValue={teacher?.qualificationFileName ?? ""}
          placeholder="例如：teacher-cert.pdf"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="teacher-notes">备注</Label>
        <textarea
          id="teacher-notes"
          name="notes"
          rows={4}
          defaultValue={teacher?.notes ?? ""}
          className="min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          placeholder="记录授课特点、沟通偏好等内部备注"
        />
      </div>
    </div>
  );
}

export function TeacherCreateDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" aria-hidden="true" />
          新增教师
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增教师</DialogTitle>
          <DialogDescription>创建教师档案，后续可绑定账号、课程和班级。</DialogDescription>
        </DialogHeader>
        <form action={createTeacherAction} className="grid gap-5">
          <TeacherFormFields />
          <DialogFooter>
            <Button type="submit">保存教师</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TeacherEditDialog({ teacher }: { teacher: TeacherFormTeacher }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pencil className="size-4" aria-hidden="true" />
          编辑档案
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑教师档案</DialogTitle>
          <DialogDescription>更新教师基础信息，变更会写入审计日志。</DialogDescription>
        </DialogHeader>
        <form action={updateTeacherAction} className="grid gap-5">
          <TeacherFormFields teacher={teacher} />
          <DialogFooter>
            <Button type="submit">保存修改</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
