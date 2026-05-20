import { CalendarCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createStudentQrCheckInAction } from "@/features/attendance/actions";

type StudentQrCheckInPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function StudentQrCheckInPage({ params }: StudentQrCheckInPageProps) {
  const { token } = await params;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarCheck className="size-4" aria-hidden="true" />
          课堂签到
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={createStudentQrCheckInAction} className="grid gap-3">
          <input type="hidden" name="token" value={token} />
          <p className="text-sm leading-6 text-muted-foreground">
            确认后将使用当前学生账号完成本节课签到。
          </p>
          <Button type="submit" className="w-full">
            <CalendarCheck aria-hidden="true" />
            确认签到
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
