import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("homework model", () => {
  const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

  it("defines homework lifecycle enums", () => {
    expect(schema).toContain("enum HomeworkStatus");
    expect(schema).toContain("enum HomeworkSubmissionStatus");
    expect(schema).toContain("enum HomeworkCorrectionStatus");
    expect(schema).toContain("ASSIGNED");
    expect(schema).toContain("PENDING_CORRECTION");
    expect(schema).toContain("NEEDS_REVISION");
  });

  it("creates tenant-scoped Homework that can bind class, lesson, or student", () => {
    expect(schema).toMatch(/model Homework[\s\S]*tenantId\s+String/);
    expect(schema).toMatch(/model Homework[\s\S]*title\s+String/);
    expect(schema).toMatch(/model Homework[\s\S]*instructions\s+String/);
    expect(schema).toMatch(/model Homework[\s\S]*dueAt\s+DateTime/);
    expect(schema).toMatch(/model Homework[\s\S]*classGroupId\s+String\?/);
    expect(schema).toMatch(/model Homework[\s\S]*lessonId\s+String\?/);
    expect(schema).toMatch(/model Homework[\s\S]*studentId\s+String\?/);
    expect(schema).toMatch(/model Homework[\s\S]*submissions\s+HomeworkSubmission\[\]/);
    expect(schema).toMatch(/model Homework[\s\S]*createdAt\s+DateTime\s+@default\(now\(\)\)/);
    expect(schema).toMatch(/model Homework[\s\S]*updatedAt\s+DateTime\s+@updatedAt/);
    expect(schema).toContain("@@index([tenantId, classGroupId])");
    expect(schema).toContain("@@index([tenantId, lessonId])");
    expect(schema).toContain("@@index([tenantId, studentId])");
  });

  it("preserves submission history per student and homework", () => {
    expect(schema).toMatch(/model HomeworkSubmission[\s\S]*tenantId\s+String/);
    expect(schema).toMatch(/model HomeworkSubmission[\s\S]*homeworkId\s+String/);
    expect(schema).toMatch(/model HomeworkSubmission[\s\S]*studentId\s+String/);
    expect(schema).toMatch(/model HomeworkSubmission[\s\S]*attemptNumber\s+Int\s+@default\(1\)/);
    expect(schema).toMatch(/model HomeworkSubmission[\s\S]*status\s+HomeworkSubmissionStatus/);
    expect(schema).toMatch(/model HomeworkSubmission[\s\S]*corrections\s+HomeworkCorrection\[\]/);
    expect(schema).toContain("@@unique([tenantId, homeworkId, studentId, attemptNumber])");
  });

  it("links corrections to concrete submissions and teachers", () => {
    expect(schema).toMatch(/model HomeworkCorrection[\s\S]*tenantId\s+String/);
    expect(schema).toMatch(/model HomeworkCorrection[\s\S]*submissionId\s+String/);
    expect(schema).toMatch(/model HomeworkCorrection[\s\S]*teacherId\s+String\?/);
    expect(schema).toMatch(/model HomeworkCorrection[\s\S]*status\s+HomeworkCorrectionStatus/);
    expect(schema).toMatch(/model HomeworkCorrection[\s\S]*correctedAt\s+DateTime/);
    expect(schema).toContain("@@index([tenantId, submissionId])");
    expect(schema).toContain("@@index([tenantId, teacherId])");
  });

  it("adds relation arrays to existing tenant, class, lesson, student, and teacher models", () => {
    expect(schema).toMatch(/model Tenant[\s\S]*homeworks\s+Homework\[\]/);
    expect(schema).toMatch(/model Tenant[\s\S]*homeworkSubmissions\s+HomeworkSubmission\[\]/);
    expect(schema).toMatch(/model Tenant[\s\S]*homeworkCorrections\s+HomeworkCorrection\[\]/);
    expect(schema).toMatch(/model ClassGroup[\s\S]*homeworks\s+Homework\[\]/);
    expect(schema).toMatch(/model Lesson[\s\S]*homeworks\s+Homework\[\]/);
    expect(schema).toMatch(/model StudentProfile[\s\S]*assignedHomeworks\s+Homework\[\]/);
    expect(schema).toMatch(
      /model StudentProfile[\s\S]*homeworkSubmissions\s+HomeworkSubmission\[\]/,
    );
    expect(schema).toMatch(
      /model TeacherProfile[\s\S]*homeworkCorrections\s+HomeworkCorrection\[\]/,
    );
  });
});
