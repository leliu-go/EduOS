import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { useForm } from "react-hook-form";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { DataTable } from "../components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { ErrorState } from "../components/ui/error-state";
import { EmptyState } from "../components/ui/empty-state";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { LoadingState } from "../components/ui/loading-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Toaster } from "../components/ui/sonner";

type StudentRow = {
  id: string;
  name: string;
  status: string;
};

function DialogTriggerFixture() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          新增作业
        </Button>
      </DialogTrigger>
    </Dialog>
  );
}

function DemoForm() {
  const form = useForm<{ name: string }>({
    defaultValues: {
      name: "",
    },
  });

  return (
    <Form {...form}>
      <form>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>姓名</FormLabel>
              <FormControl>
                <Input placeholder="请输入姓名" {...field} />
              </FormControl>
              <FormDescription>用于展示表单基础样式。</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

describe("UI foundation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders card, button, input, label, and badge primitives", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>基础组件</CardTitle>
          <CardDescription>用于 EduOS 的通用界面元素。</CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="student-name">学生姓名</Label>
          <Input id="student-name" placeholder="请输入姓名" />
          <Badge>启用</Badge>
          <Button>保存</Button>
        </CardContent>
      </Card>,
    );

    expect(screen.getByText("基础组件")).toBeInTheDocument();
    expect(screen.getByLabelText("学生姓名")).toHaveAttribute("placeholder", "请输入姓名");
    expect(screen.getByText("启用")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存" })).toBeEnabled();
  });

  it("renders select and tabs primitives", () => {
    render(
      <>
        <Select defaultValue="math">
          <SelectTrigger aria-label="学科">
            <SelectValue placeholder="选择学科" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="math">数学</SelectItem>
          </SelectContent>
        </Select>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">总览</TabsTrigger>
            <TabsTrigger value="detail">详情</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">今日概览</TabsContent>
          <TabsContent value="detail">详细信息</TabsContent>
        </Tabs>
      </>,
    );

    expect(screen.getByRole("combobox", { name: "学科" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "总览" })).toHaveAttribute("data-state", "active");
    expect(screen.getByText("今日概览")).toBeInTheDocument();
  });

  it("renders dialog primitive as an accessible modal", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>创建记录</DialogTitle>
          <DialogDescription>确认后保存当前表单。</DialogDescription>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByRole("dialog", { name: "创建记录" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "关闭" })).toBeInTheDocument();
  });

  it("renders Button dialog triggers as a single stable trigger button", () => {
    render(<DialogTriggerFixture />);

    const trigger = screen.getByRole("button", { name: "新增作业" });

    expect(trigger).toHaveAttribute("data-slot", "dialog-trigger");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveClass("border");
  });

  it("hydrates Button dialog triggers without replacing server markup", async () => {
    const html = renderToString(<DialogTriggerFixture />);
    const root = document.createElement("div");
    root.innerHTML = html;
    document.body.appendChild(root);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    hydrateRoot(root, <DialogTriggerFixture />);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(
      consoleError.mock.calls.some((call) =>
        call.some((entry) => String(entry).includes("Hydration failed")),
      ),
    ).toBe(false);
  });

  it("renders table wrapper and reusable page states", () => {
    render(
      <>
        <DataTable<StudentRow>
          columns={[
            { key: "name", header: "姓名", cell: (row) => row.name },
            { key: "status", header: "状态", cell: (row) => row.status },
          ]}
          data={[{ id: "student-1", name: "张三", status: "在读" }]}
          getRowKey={(row) => row.id}
        />
        <EmptyState title="暂无数据" description="当前没有可展示内容。" />
        <LoadingState title="加载中" description="正在读取数据。" />
        <ErrorState title="加载失败" description="请刷新后重试。" />
      </>,
    );

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("张三")).toBeInTheDocument();
    expect(screen.getByText("暂无数据")).toBeInTheDocument();
    expect(screen.getByText("加载中")).toBeInTheDocument();
    expect(screen.getByText("加载失败")).toBeInTheDocument();
  });

  it("renders form wrapper and toast host", () => {
    render(
      <>
        <DemoForm />
        <Toaster />
      </>,
    );

    expect(screen.getByLabelText("姓名")).toHaveAttribute("placeholder", "请输入姓名");
    expect(screen.getByLabelText(/通知/)).toBeInTheDocument();
  });
});
