import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { StudentLearningReport } from "./student-learning-report";

function MetricBlock({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold leading-none text-foreground">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

export function StudentLearningReportCard({ report }: { report: StudentLearningReport }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{report.student.name}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">学习报告</p>
          </div>
          <Badge variant="secondary">基础版</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-3 gap-2">
          <MetricBlock
            label="出勤"
            value={`${report.attendance.rate}%`}
            detail={`${report.attendance.attended}/${report.attendance.total} 次`}
          />
          <MetricBlock
            label="作业完成"
            value={`${report.homework.completionRate}%`}
            detail={`${report.homework.completed}/${report.homework.total} 次`}
          />
          <MetricBlock label="错题" value={`${report.mistakeCount}`} detail="累计记录" />
        </div>

        <section className="grid gap-2">
          <h3 className="text-sm font-semibold tracking-normal text-foreground">薄弱知识点</h3>
          {report.weakKnowledgePoints.length > 0 ? (
            report.weakKnowledgePoints.map((item) => (
              <div key={item.knowledgePointId} className="flex justify-between gap-3 text-sm">
                <span className="line-clamp-2 text-muted-foreground">{item.label}</span>
                <span className="shrink-0 font-medium text-foreground">{item.count} 次</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">暂无薄弱知识点</p>
          )}
        </section>

        <section className="grid gap-2">
          <h3 className="text-sm font-semibold tracking-normal text-foreground">老师评语</h3>
          {report.teacherComments.length > 0 ? (
            report.teacherComments.map((comment) => (
              <div
                key={comment.id}
                className="grid gap-1 rounded-lg border bg-background p-3 text-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-foreground">{comment.lessonTitle}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {comment.teacherName}
                  </span>
                </div>
                <p className="text-muted-foreground">课堂内容：{comment.content}</p>
                <p className="text-muted-foreground">课堂表现：{comment.performance}</p>
                <p className="text-muted-foreground">掌握情况：{comment.mastery}</p>
                <p className="text-muted-foreground">课后作业：{comment.homework}</p>
                <p className="text-muted-foreground">学习建议：{comment.suggestion}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">暂无老师评语</p>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
