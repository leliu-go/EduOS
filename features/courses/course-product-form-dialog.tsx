import { BookOpen, Pencil } from "lucide-react";
import type { ReactNode } from "react";

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

import { createCourseProductAction, updateCourseProductAction } from "./actions";
import {
  classTypeLabels,
  classTypeValues,
  courseProductStatusLabels,
  courseProductStatusValues,
  courseTypeLabels,
  courseTypeValues,
  type ClassTypeValue,
  type CourseProductStatusValue,
  type CourseTypeValue,
} from "./course-product-schema";

type CourseProductOption = {
  id: string;
  name: string;
};

type CourseProductFormOptions = {
  subjects: CourseProductOption[];
  grades: CourseProductOption[];
};

type CourseProductFormCourseProduct = {
  id: string;
  name: string;
  subjectId: string;
  gradeId: string;
  courseType: CourseTypeValue;
  classType: ClassTypeValue;
  totalHours: number;
  price: { toString(): string };
  description: string | null;
  status: CourseProductStatusValue;
};

function SelectField({
  id,
  name,
  label,
  defaultValue,
  children,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        required
      >
        {children}
      </select>
    </div>
  );
}

function CourseProductFormFields({
  options,
  courseProduct,
}: {
  options: CourseProductFormOptions;
  courseProduct?: CourseProductFormCourseProduct;
}) {
  const visibleStatuses = courseProductStatusValues.filter((status) => status !== "ARCHIVED");

  return (
    <div className="grid gap-4">
      {courseProduct ? (
        <input type="hidden" name="courseProductId" value={courseProduct.id} />
      ) : null}
      <div className="grid gap-2">
        <Label htmlFor="course-product-name">课程名称</Label>
        <Input
          id="course-product-name"
          name="name"
          defaultValue={courseProduct?.name}
          placeholder="例如：初二数学秋季班"
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          id="course-product-subject"
          name="subjectId"
          label="科目"
          defaultValue={courseProduct?.subjectId}
        >
          {options.subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </SelectField>
        <SelectField
          id="course-product-grade"
          name="gradeId"
          label="年级"
          defaultValue={courseProduct?.gradeId}
        >
          {options.grades.map((grade) => (
            <option key={grade.id} value={grade.id}>
              {grade.name}
            </option>
          ))}
        </SelectField>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          id="course-product-course-type"
          name="courseType"
          label="课程类型"
          defaultValue={courseProduct?.courseType ?? "SMALL_GROUP"}
        >
          {courseTypeValues.map((courseType) => (
            <option key={courseType} value={courseType}>
              {courseTypeLabels[courseType]}
            </option>
          ))}
        </SelectField>
        <SelectField
          id="course-product-class-type"
          name="classType"
          label="授课方式"
          defaultValue={courseProduct?.classType ?? "OFFLINE"}
        >
          {classTypeValues.map((classType) => (
            <option key={classType} value={classType}>
              {classTypeLabels[classType]}
            </option>
          ))}
        </SelectField>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="course-product-total-hours">总课时</Label>
          <Input
            id="course-product-total-hours"
            name="totalHours"
            type="number"
            min={1}
            defaultValue={courseProduct?.totalHours ?? 40}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="course-product-price">价格</Label>
          <Input
            id="course-product-price"
            name="price"
            inputMode="decimal"
            defaultValue={courseProduct?.price.toString() ?? ""}
            placeholder="例如：9600"
            required
          />
        </div>
        <SelectField
          id="course-product-status"
          name="status"
          label="状态"
          defaultValue={
            courseProduct?.status === "ARCHIVED" ? "INACTIVE" : (courseProduct?.status ?? "ACTIVE")
          }
        >
          {visibleStatuses.map((status) => (
            <option key={status} value={status}>
              {courseProductStatusLabels[status]}
            </option>
          ))}
        </SelectField>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="course-product-description">说明</Label>
        <textarea
          id="course-product-description"
          name="description"
          defaultValue={courseProduct?.description ?? ""}
          placeholder="可选，说明适合人群、授课目标等"
          className="min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </div>
    </div>
  );
}

export function CourseProductCreateDialog({ options }: { options: CourseProductFormOptions }) {
  const hasOptions = options.subjects.length > 0 && options.grades.length > 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={!hasOptions}>
          <BookOpen className="size-4" aria-hidden="true" />
          新增课程
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增课程产品</DialogTitle>
          <DialogDescription>配置面向招生和排班使用的可售课程。</DialogDescription>
        </DialogHeader>
        <form action={createCourseProductAction} className="grid gap-5">
          <CourseProductFormFields options={options} />
          <DialogFooter>
            <Button type="submit">保存课程</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CourseProductEditDialog({
  options,
  courseProduct,
}: {
  options: CourseProductFormOptions;
  courseProduct: CourseProductFormCourseProduct;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pencil className="size-4" aria-hidden="true" />
          编辑课程
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑课程产品</DialogTitle>
          <DialogDescription>更新课程名称、科目年级、课时、价格和上下架状态。</DialogDescription>
        </DialogHeader>
        <form action={updateCourseProductAction} className="grid gap-5">
          <CourseProductFormFields options={options} courseProduct={courseProduct} />
          <DialogFooter>
            <Button type="submit">保存修改</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
