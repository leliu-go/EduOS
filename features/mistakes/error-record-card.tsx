import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  errorReasonLabels,
  errorRecordSourceTypeLabels,
  errorRecordStatusLabels,
} from "./error-record-schema";

type ErrorRecordCardItem = {
  id: string;
  status: keyof typeof errorRecordStatusLabels;
  sourceType: keyof typeof errorRecordSourceTypeLabels;
  sourceTitle: string | null;
  errorReason: keyof typeof errorReasonLabels;
  note: string | null;
  createdAt: Date;
  student: {
    name: string;
  };
  question: {
    stem: string;
  } | null;
  homeworkSubmission: {
    homework: {
      title: string;
    };
  } | null;
  knowledgePoint: {
    name: string;
    chapter: string;
    parent: {
      name: string;
    } | null;
    subject: {
      name: string;
    };
    grade: {
      name: string;
    };
  };
};

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function getErrorRecordTitle(item: ErrorRecordCardItem) {
  return (
    item.question?.stem ?? item.sourceTitle ?? item.homeworkSubmission?.homework.title ?? "错题记录"
  );
}

function getKnowledgePointLabel(item: ErrorRecordCardItem) {
  const parentName = item.knowledgePoint.parent ? ` · ${item.knowledgePoint.parent.name}` : "";

  return `${item.knowledgePoint.subject.name} · ${item.knowledgePoint.grade.name} · ${item.knowledgePoint.chapter}${parentName} · ${item.knowledgePoint.name}`;
}

export function ErrorRecordCard({
  item,
  showStudent = false,
}: {
  item: ErrorRecordCardItem;
  showStudent?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="line-clamp-2">{getErrorRecordTitle(item)}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">{getKnowledgePointLabel(item)}</p>
          </div>
          <Badge variant={item.status === "MASTERED" ? "secondary" : "outline"}>
            {errorRecordStatusLabels[item.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm text-muted-foreground">
        {showStudent ? <p>学生：{item.student.name}</p> : null}
        <p>
          {errorRecordSourceTypeLabels[item.sourceType]} · {errorReasonLabels[item.errorReason]} ·{" "}
          {formatDate(item.createdAt)}
        </p>
        {item.homeworkSubmission ? <p>关联作业：{item.homeworkSubmission.homework.title}</p> : null}
        {item.note ? <p>{item.note}</p> : null}
      </CardContent>
    </Card>
  );
}
