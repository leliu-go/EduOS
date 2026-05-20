import { Button } from "@/components/ui/button";

import { approveMistakeCorrectionAction, submitMistakeCorrectionAction } from "./actions";

type MistakeCorrectionActionFormProps = {
  errorRecordId: string;
  intent: "submit" | "approve";
  returnTo: "/student/mistakes" | "/teacher/homework";
};

export function MistakeCorrectionActionForm({
  errorRecordId,
  intent,
  returnTo,
}: MistakeCorrectionActionFormProps) {
  const formAction =
    intent === "submit" ? submitMistakeCorrectionAction : approveMistakeCorrectionAction;
  const label = intent === "submit" ? "提交订正" : "确认掌握";

  return (
    <form action={formAction}>
      <input type="hidden" name="errorRecordId" value={errorRecordId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <Button type="submit" size="sm" variant={intent === "submit" ? "secondary" : "default"}>
        {label}
      </Button>
    </form>
  );
}
