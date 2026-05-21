-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CampusStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "RoleKey" AS ENUM ('SUPER_ADMIN', 'ORG_ADMIN', 'CAMPUS_ADMIN', 'ACADEMIC', 'FINANCE', 'TEACHER', 'STUDENT', 'PARENT');

-- CreateEnum
CREATE TYPE "RoleStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'INVITED', 'DISABLED');

-- CreateEnum
CREATE TYPE "StudentGender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'PAUSED', 'GRADUATED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "GuardianStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "GuardianRelationship" AS ENUM ('FATHER', 'MOTHER', 'GRANDPARENT', 'RELATIVE', 'OTHER');

-- CreateEnum
CREATE TYPE "TeacherStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'RESIGNED');

-- CreateEnum
CREATE TYPE "ConfigStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('ONE_ON_ONE', 'SMALL_GROUP', 'LARGE_GROUP', 'EVENING_TUTORING', 'INTENSIVE');

-- CreateEnum
CREATE TYPE "ClassType" AS ENUM ('OFFLINE', 'ONLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "CourseProductStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ClassGroupStatus" AS ENUM ('PLANNING', 'ACTIVE', 'PAUSED', 'FINISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "CourseAccountStatus" AS ENUM ('ACTIVE', 'FROZEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('PLANNED', 'SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('SCHEDULED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED', 'MAKE_UP');

-- CreateEnum
CREATE TYPE "ScheduleChangeType" AS ENUM ('CREATE', 'RESCHEDULE', 'CANCEL', 'MAKE_UP');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'LATE', 'EXCUSED', 'ABSENT', 'MAKE_UP');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('PPT', 'HANDOUT', 'VIDEO', 'AUDIO', 'WORKSHEET', 'ANSWER', 'EXPLANATION');

-- CreateEnum
CREATE TYPE "ResourceStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ResourcePermissionTarget" AS ENUM ('CLASS_GROUP', 'STUDENT', 'ROLE');

-- CreateEnum
CREATE TYPE "ResourceVisibility" AS ENUM ('PRIVATE', 'TENANT_PUBLIC');

-- CreateEnum
CREATE TYPE "HomeworkStatus" AS ENUM ('DRAFT', 'ASSIGNED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "HomeworkSubmissionStatus" AS ENUM ('SUBMITTED', 'PENDING_CORRECTION', 'CORRECTED', 'NEEDS_REVISION');

-- CreateEnum
CREATE TYPE "HomeworkCorrectionStatus" AS ENUM ('CORRECTED', 'NEEDS_REVISION');

-- CreateEnum
CREATE TYPE "LearningTaskType" AS ENUM ('READING', 'MEMORIZATION', 'PRACTICE', 'SPECIAL_TRAINING');

-- CreateEnum
CREATE TYPE "LearningTaskStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "QuestionDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_IN_BLANK', 'SHORT_ANSWER', 'ESSAY');

-- CreateEnum
CREATE TYPE "ErrorRecordSourceType" AS ENUM ('HOMEWORK_SUBMISSION', 'ASSESSMENT_RESULT', 'MANUAL');

-- CreateEnum
CREATE TYPE "ErrorReason" AS ENUM ('CONCEPT_UNCLEAR', 'CALCULATION_ERROR', 'READING_ERROR', 'METHOD_ERROR', 'CARELESS', 'OTHER');

-- CreateEnum
CREATE TYPE "ErrorRecordStatus" AS ENUM ('PENDING_CORRECTION', 'CORRECTED', 'MASTERED');

-- CreateEnum
CREATE TYPE "NotificationEventType" AS ENUM ('SCHEDULE_CREATED', 'SCHEDULE_CHANGED', 'ATTENDANCE_CONFIRMED', 'COURSE_CONSUMPTION_CREATED', 'HOMEWORK_ASSIGNED', 'HOMEWORK_CORRECTED', 'REPORT_AVAILABLE');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'WECHAT', 'ALIPAY', 'CARD', 'OTHER');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ContractTemplateStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'PENDING_SIGNATURE', 'SIGNED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TeacherCompensationCalculationMode" AS ENUM ('LESSON', 'HOUR', 'STUDENT_COUNT', 'CLASS_TYPE');

-- CreateEnum
CREATE TYPE "TeacherCompensationRuleStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ComplianceRuleType" AS ENUM ('FORBIDDEN_SCHEDULING_WINDOW', 'MAX_PREPAID_HOURS', 'CONTRACT_REQUIRED', 'TEACHER_QUALIFICATION_REQUIRED');

-- CreateEnum
CREATE TYPE "ComplianceRuleSeverity" AS ENUM ('WARN', 'BLOCK');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campus" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "businessHours" TEXT,
    "status" "CampusStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER,
    "equipment" TEXT,
    "status" "RoomStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "key" "RoleKey" NOT NULL,
    "name" TEXT NOT NULL,
    "status" "RoleStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "campusId" TEXT,
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "beforeJson" JSONB,
    "afterJson" JSONB,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "recipientUserId" TEXT,
    "recipientRoleKey" "RoleKey",
    "eventType" "NotificationEventType" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "href" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "gender" "StudentGender",
    "birthday" TIMESTAMP(3),
    "grade" TEXT NOT NULL,
    "school" TEXT,
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuardianProfile" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "status" "GuardianStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuardianProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentGuardian" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "relationship" "GuardianRelationship" NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentGuardian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherProfile" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "subjects" TEXT[],
    "grades" TEXT[],
    "status" "TeacherStatus" NOT NULL DEFAULT 'ACTIVE',
    "availableTimeNotes" TEXT,
    "qualificationFileName" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "status" "ConfigStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grade" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "ConfigStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Term" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "ConfigStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Term_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgePoint" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "gradeId" TEXT NOT NULL,
    "chapter" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    "status" "ConfigStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgePoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "stem" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "explanation" TEXT,
    "difficulty" "QuestionDifficulty" NOT NULL,
    "questionType" "QuestionType" NOT NULL,
    "status" "ConfigStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionKnowledgePoint" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "knowledgePointId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionKnowledgePoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorRecord" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "questionId" TEXT,
    "homeworkSubmissionId" TEXT,
    "sourceType" "ErrorRecordSourceType" NOT NULL,
    "sourceTitle" TEXT,
    "knowledgePointId" TEXT NOT NULL,
    "errorReason" "ErrorReason" NOT NULL,
    "status" "ErrorRecordStatus" NOT NULL DEFAULT 'PENDING_CORRECTION',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ErrorRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseProduct" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "gradeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "courseType" "CourseType" NOT NULL,
    "classType" "ClassType" NOT NULL,
    "totalHours" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "description" TEXT,
    "status" "CourseProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassGroup" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "courseProductId" TEXT NOT NULL,
    "primaryTeacherId" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" "ClassGroupStatus" NOT NULL DEFAULT 'PLANNING',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassGroupStudent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "classGroupId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassGroupStudent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseAccount" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseProductId" TEXT NOT NULL,
    "purchasedHours" INTEGER NOT NULL DEFAULT 0,
    "giftHours" INTEGER NOT NULL DEFAULT 0,
    "usedHours" INTEGER NOT NULL DEFAULT 0,
    "frozenHours" INTEGER NOT NULL DEFAULT 0,
    "status" "CourseAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderNo" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "guardianId" TEXT,
    "courseProductId" TEXT,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "payableAmount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "guardianId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "transactionNo" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderId" TEXT,
    "paymentId" TEXT,
    "courseAccountId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "guardianId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "refundHours" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "approvalNote" TEXT,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "requestedByUserId" TEXT,
    "approvedByUserId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "contentJson" JSONB NOT NULL,
    "status" "ContractTemplateStatus" NOT NULL DEFAULT 'ACTIVE',
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "enrollmentId" TEXT,
    "studentId" TEXT NOT NULL,
    "guardianId" TEXT,
    "status" "ContractStatus" NOT NULL DEFAULT 'PENDING_SIGNATURE',
    "termsSnapshot" JSONB,
    "signedAt" TIMESTAMP(3),
    "signatureUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherCompensationRule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "teacherId" TEXT,
    "courseProductId" TEXT,
    "classGroupId" TEXT,
    "classType" "ClassType",
    "calculationMode" "TeacherCompensationCalculationMode" NOT NULL,
    "rateAmount" DECIMAL(65,30) NOT NULL,
    "classTypeRatesJson" JSONB,
    "status" "TeacherCompensationRuleStatus" NOT NULL DEFAULT 'ACTIVE',
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherCompensationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceRule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ruleType" "ComplianceRuleType" NOT NULL,
    "severity" "ComplianceRuleSeverity" NOT NULL,
    "configJson" JSONB NOT NULL,
    "status" "ConfigStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseProductId" TEXT NOT NULL,
    "classGroupId" TEXT,
    "courseAccountId" TEXT NOT NULL,
    "orderId" TEXT,
    "contractRequired" BOOLEAN NOT NULL DEFAULT false,
    "contractTemplateId" TEXT,
    "purchasedHours" INTEGER NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "enrolledAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "classGroupId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "LessonStatus" NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonFeedback" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "performance" TEXT NOT NULL,
    "mastery" TEXT NOT NULL,
    "homework" TEXT NOT NULL,
    "suggestion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "classGroupId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "lessonId" TEXT,
    "sourceScheduleId" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'SCHEDULED',
    "recurrenceRule" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleChangeLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "changeType" "ScheduleChangeType" NOT NULL,
    "beforeJson" JSONB,
    "afterJson" JSONB,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckIn" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "confirmedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseConsumption" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "attendanceId" TEXT,
    "studentId" TEXT NOT NULL,
    "courseProductId" TEXT NOT NULL,
    "courseAccountId" TEXT NOT NULL,
    "consumedHours" INTEGER NOT NULL,
    "reason" TEXT,
    "reversedAt" TIMESTAMP(3),
    "reversedByUserId" TEXT,
    "reversalReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseConsumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "resourceType" "ResourceType" NOT NULL,
    "status" "ResourceStatus" NOT NULL DEFAULT 'ACTIVE',
    "provider" TEXT,
    "bucket" TEXT,
    "objectKey" TEXT,
    "originalName" TEXT,
    "fileName" TEXT,
    "fileUrl" TEXT,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "size" INTEGER,
    "checksum" TEXT,
    "visibility" "ResourceVisibility" NOT NULL DEFAULT 'PRIVATE',
    "createdById" TEXT,
    "releaseAt" TIMESTAMP(3),
    "courseProductId" TEXT,
    "classGroupId" TEXT,
    "lessonId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourcePermission" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "target" "ResourcePermissionTarget" NOT NULL,
    "classGroupId" TEXT,
    "studentId" TEXT,
    "roleKey" "RoleKey",
    "canView" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourcePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Homework" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "status" "HomeworkStatus" NOT NULL DEFAULT 'ASSIGNED',
    "assignedByUserId" TEXT,
    "classGroupId" TEXT,
    "lessonId" TEXT,
    "studentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Homework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeworkSubmission" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "homeworkId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "status" "HomeworkSubmissionStatus" NOT NULL DEFAULT 'PENDING_CORRECTION',
    "contentText" TEXT,
    "attachmentsJson" JSONB,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeworkSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeworkCorrection" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "teacherId" TEXT,
    "status" "HomeworkCorrectionStatus" NOT NULL,
    "score" INTEGER,
    "comment" TEXT,
    "correctedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeworkCorrection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningTask" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "taskType" "LearningTaskType" NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "status" "LearningTaskStatus" NOT NULL DEFAULT 'ACTIVE',
    "assignedByUserId" TEXT,
    "classGroupId" TEXT,
    "studentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningTaskCheckIn" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningTaskCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE INDEX "Tenant_status_idx" ON "Tenant"("status");

-- CreateIndex
CREATE INDEX "Campus_tenantId_idx" ON "Campus"("tenantId");

-- CreateIndex
CREATE INDEX "Campus_tenantId_status_idx" ON "Campus"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Campus_tenantId_name_key" ON "Campus"("tenantId", "name");

-- CreateIndex
CREATE INDEX "Room_tenantId_idx" ON "Room"("tenantId");

-- CreateIndex
CREATE INDEX "Room_tenantId_campusId_idx" ON "Room"("tenantId", "campusId");

-- CreateIndex
CREATE INDEX "Room_tenantId_status_idx" ON "Room"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Room_tenantId_campusId_name_key" ON "Room"("tenantId", "campusId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "Role_tenantId_idx" ON "Role"("tenantId");

-- CreateIndex
CREATE INDEX "Role_tenantId_status_idx" ON "Role"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Role_tenantId_key_key" ON "Role"("tenantId", "key");

-- CreateIndex
CREATE INDEX "Membership_tenantId_idx" ON "Membership"("tenantId");

-- CreateIndex
CREATE INDEX "Membership_tenantId_userId_idx" ON "Membership"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "Membership_tenantId_roleId_idx" ON "Membership"("tenantId", "roleId");

-- CreateIndex
CREATE INDEX "Membership_tenantId_status_idx" ON "Membership"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_tenantId_userId_roleId_campusId_key" ON "Membership"("tenantId", "userId", "roleId", "campusId");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_createdAt_idx" ON "AuditLog"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_actorUserId_idx" ON "AuditLog"("tenantId", "actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_action_idx" ON "AuditLog"("tenantId", "action");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_entityType_entityId_idx" ON "AuditLog"("tenantId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "Notification_tenantId_idx" ON "Notification"("tenantId");

-- CreateIndex
CREATE INDEX "Notification_tenantId_recipientUserId_status_idx" ON "Notification"("tenantId", "recipientUserId", "status");

-- CreateIndex
CREATE INDEX "Notification_tenantId_recipientRoleKey_status_idx" ON "Notification"("tenantId", "recipientRoleKey", "status");

-- CreateIndex
CREATE INDEX "Notification_tenantId_eventType_idx" ON "Notification"("tenantId", "eventType");

-- CreateIndex
CREATE INDEX "Notification_tenantId_createdAt_idx" ON "Notification"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "StudentProfile_tenantId_idx" ON "StudentProfile"("tenantId");

-- CreateIndex
CREATE INDEX "StudentProfile_tenantId_status_idx" ON "StudentProfile"("tenantId", "status");

-- CreateIndex
CREATE INDEX "StudentProfile_tenantId_name_idx" ON "StudentProfile"("tenantId", "name");

-- CreateIndex
CREATE INDEX "StudentProfile_tenantId_createdAt_idx" ON "StudentProfile"("tenantId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_tenantId_userId_key" ON "StudentProfile"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "GuardianProfile_tenantId_idx" ON "GuardianProfile"("tenantId");

-- CreateIndex
CREATE INDEX "GuardianProfile_tenantId_status_idx" ON "GuardianProfile"("tenantId", "status");

-- CreateIndex
CREATE INDEX "GuardianProfile_tenantId_phone_idx" ON "GuardianProfile"("tenantId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "GuardianProfile_tenantId_userId_key" ON "GuardianProfile"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "StudentGuardian_tenantId_studentId_idx" ON "StudentGuardian"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "StudentGuardian_tenantId_guardianId_idx" ON "StudentGuardian"("tenantId", "guardianId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentGuardian_tenantId_studentId_guardianId_key" ON "StudentGuardian"("tenantId", "studentId", "guardianId");

-- CreateIndex
CREATE INDEX "TeacherProfile_tenantId_idx" ON "TeacherProfile"("tenantId");

-- CreateIndex
CREATE INDEX "TeacherProfile_tenantId_status_idx" ON "TeacherProfile"("tenantId", "status");

-- CreateIndex
CREATE INDEX "TeacherProfile_tenantId_name_idx" ON "TeacherProfile"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_tenantId_userId_key" ON "TeacherProfile"("tenantId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_tenantId_phone_key" ON "TeacherProfile"("tenantId", "phone");

-- CreateIndex
CREATE INDEX "Subject_tenantId_idx" ON "Subject"("tenantId");

-- CreateIndex
CREATE INDEX "Subject_tenantId_status_idx" ON "Subject"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_tenantId_name_key" ON "Subject"("tenantId", "name");

-- CreateIndex
CREATE INDEX "Grade_tenantId_idx" ON "Grade"("tenantId");

-- CreateIndex
CREATE INDEX "Grade_tenantId_status_idx" ON "Grade"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Grade_tenantId_sortOrder_idx" ON "Grade"("tenantId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_tenantId_name_key" ON "Grade"("tenantId", "name");

-- CreateIndex
CREATE INDEX "Term_tenantId_idx" ON "Term"("tenantId");

-- CreateIndex
CREATE INDEX "Term_tenantId_status_idx" ON "Term"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Term_tenantId_startsAt_idx" ON "Term"("tenantId", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "Term_tenantId_name_key" ON "Term"("tenantId", "name");

-- CreateIndex
CREATE INDEX "KnowledgePoint_tenantId_idx" ON "KnowledgePoint"("tenantId");

-- CreateIndex
CREATE INDEX "KnowledgePoint_tenantId_status_idx" ON "KnowledgePoint"("tenantId", "status");

-- CreateIndex
CREATE INDEX "KnowledgePoint_tenantId_subjectId_gradeId_idx" ON "KnowledgePoint"("tenantId", "subjectId", "gradeId");

-- CreateIndex
CREATE INDEX "KnowledgePoint_tenantId_parentId_idx" ON "KnowledgePoint"("tenantId", "parentId");

-- CreateIndex
CREATE INDEX "KnowledgePoint_tenantId_chapter_idx" ON "KnowledgePoint"("tenantId", "chapter");

-- CreateIndex
CREATE INDEX "KnowledgePoint_tenantId_sortOrder_idx" ON "KnowledgePoint"("tenantId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgePoint_tenantId_subjectId_gradeId_chapter_name_pare_key" ON "KnowledgePoint"("tenantId", "subjectId", "gradeId", "chapter", "name", "parentId");

-- CreateIndex
CREATE INDEX "Question_tenantId_idx" ON "Question"("tenantId");

-- CreateIndex
CREATE INDEX "Question_tenantId_status_idx" ON "Question"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Question_tenantId_difficulty_idx" ON "Question"("tenantId", "difficulty");

-- CreateIndex
CREATE INDEX "Question_tenantId_questionType_idx" ON "Question"("tenantId", "questionType");

-- CreateIndex
CREATE INDEX "Question_tenantId_createdAt_idx" ON "Question"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "QuestionKnowledgePoint_tenantId_idx" ON "QuestionKnowledgePoint"("tenantId");

-- CreateIndex
CREATE INDEX "QuestionKnowledgePoint_tenantId_questionId_idx" ON "QuestionKnowledgePoint"("tenantId", "questionId");

-- CreateIndex
CREATE INDEX "QuestionKnowledgePoint_tenantId_knowledgePointId_idx" ON "QuestionKnowledgePoint"("tenantId", "knowledgePointId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionKnowledgePoint_tenantId_questionId_knowledgePointId_key" ON "QuestionKnowledgePoint"("tenantId", "questionId", "knowledgePointId");

-- CreateIndex
CREATE INDEX "ErrorRecord_tenantId_idx" ON "ErrorRecord"("tenantId");

-- CreateIndex
CREATE INDEX "ErrorRecord_tenantId_studentId_idx" ON "ErrorRecord"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "ErrorRecord_tenantId_questionId_idx" ON "ErrorRecord"("tenantId", "questionId");

-- CreateIndex
CREATE INDEX "ErrorRecord_tenantId_homeworkSubmissionId_idx" ON "ErrorRecord"("tenantId", "homeworkSubmissionId");

-- CreateIndex
CREATE INDEX "ErrorRecord_tenantId_knowledgePointId_idx" ON "ErrorRecord"("tenantId", "knowledgePointId");

-- CreateIndex
CREATE INDEX "ErrorRecord_tenantId_sourceType_idx" ON "ErrorRecord"("tenantId", "sourceType");

-- CreateIndex
CREATE INDEX "ErrorRecord_tenantId_errorReason_idx" ON "ErrorRecord"("tenantId", "errorReason");

-- CreateIndex
CREATE INDEX "ErrorRecord_tenantId_status_idx" ON "ErrorRecord"("tenantId", "status");

-- CreateIndex
CREATE INDEX "ErrorRecord_tenantId_createdAt_idx" ON "ErrorRecord"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "CourseProduct_tenantId_idx" ON "CourseProduct"("tenantId");

-- CreateIndex
CREATE INDEX "CourseProduct_tenantId_status_idx" ON "CourseProduct"("tenantId", "status");

-- CreateIndex
CREATE INDEX "CourseProduct_tenantId_subjectId_gradeId_idx" ON "CourseProduct"("tenantId", "subjectId", "gradeId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseProduct_tenantId_name_key" ON "CourseProduct"("tenantId", "name");

-- CreateIndex
CREATE INDEX "ClassGroup_tenantId_idx" ON "ClassGroup"("tenantId");

-- CreateIndex
CREATE INDEX "ClassGroup_tenantId_status_idx" ON "ClassGroup"("tenantId", "status");

-- CreateIndex
CREATE INDEX "ClassGroup_tenantId_status_startsAt_name_idx" ON "ClassGroup"("tenantId", "status", "startsAt", "name");

-- CreateIndex
CREATE INDEX "ClassGroup_tenantId_courseProductId_idx" ON "ClassGroup"("tenantId", "courseProductId");

-- CreateIndex
CREATE INDEX "ClassGroup_tenantId_primaryTeacherId_idx" ON "ClassGroup"("tenantId", "primaryTeacherId");

-- CreateIndex
CREATE INDEX "ClassGroup_tenantId_campusId_idx" ON "ClassGroup"("tenantId", "campusId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassGroup_tenantId_name_key" ON "ClassGroup"("tenantId", "name");

-- CreateIndex
CREATE INDEX "ClassGroupStudent_tenantId_classGroupId_idx" ON "ClassGroupStudent"("tenantId", "classGroupId");

-- CreateIndex
CREATE INDEX "ClassGroupStudent_tenantId_studentId_idx" ON "ClassGroupStudent"("tenantId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassGroupStudent_tenantId_classGroupId_studentId_key" ON "ClassGroupStudent"("tenantId", "classGroupId", "studentId");

-- CreateIndex
CREATE INDEX "CourseAccount_tenantId_idx" ON "CourseAccount"("tenantId");

-- CreateIndex
CREATE INDEX "CourseAccount_tenantId_status_idx" ON "CourseAccount"("tenantId", "status");

-- CreateIndex
CREATE INDEX "CourseAccount_tenantId_studentId_idx" ON "CourseAccount"("tenantId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseAccount_tenantId_studentId_courseProductId_key" ON "CourseAccount"("tenantId", "studentId", "courseProductId");

-- CreateIndex
CREATE INDEX "Order_tenantId_idx" ON "Order"("tenantId");

-- CreateIndex
CREATE INDEX "Order_tenantId_status_idx" ON "Order"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Order_tenantId_studentId_idx" ON "Order"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "Order_tenantId_guardianId_idx" ON "Order"("tenantId", "guardianId");

-- CreateIndex
CREATE INDEX "Order_tenantId_courseProductId_idx" ON "Order"("tenantId", "courseProductId");

-- CreateIndex
CREATE INDEX "Order_tenantId_createdAt_idx" ON "Order"("tenantId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Order_tenantId_orderNo_key" ON "Order"("tenantId", "orderNo");

-- CreateIndex
CREATE INDEX "Payment_tenantId_idx" ON "Payment"("tenantId");

-- CreateIndex
CREATE INDEX "Payment_tenantId_orderId_idx" ON "Payment"("tenantId", "orderId");

-- CreateIndex
CREATE INDEX "Payment_tenantId_studentId_idx" ON "Payment"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "Payment_tenantId_guardianId_idx" ON "Payment"("tenantId", "guardianId");

-- CreateIndex
CREATE INDEX "Payment_tenantId_status_idx" ON "Payment"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Payment_tenantId_paidAt_idx" ON "Payment"("tenantId", "paidAt");

-- CreateIndex
CREATE INDEX "Refund_tenantId_idx" ON "Refund"("tenantId");

-- CreateIndex
CREATE INDEX "Refund_tenantId_orderId_idx" ON "Refund"("tenantId", "orderId");

-- CreateIndex
CREATE INDEX "Refund_tenantId_paymentId_idx" ON "Refund"("tenantId", "paymentId");

-- CreateIndex
CREATE INDEX "Refund_tenantId_courseAccountId_idx" ON "Refund"("tenantId", "courseAccountId");

-- CreateIndex
CREATE INDEX "Refund_tenantId_studentId_idx" ON "Refund"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "Refund_tenantId_guardianId_idx" ON "Refund"("tenantId", "guardianId");

-- CreateIndex
CREATE INDEX "Refund_tenantId_status_idx" ON "Refund"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Refund_tenantId_approvedByUserId_idx" ON "Refund"("tenantId", "approvedByUserId");

-- CreateIndex
CREATE INDEX "Refund_tenantId_createdAt_idx" ON "Refund"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "ContractTemplate_tenantId_idx" ON "ContractTemplate"("tenantId");

-- CreateIndex
CREATE INDEX "ContractTemplate_tenantId_status_idx" ON "ContractTemplate"("tenantId", "status");

-- CreateIndex
CREATE INDEX "ContractTemplate_tenantId_effectiveFrom_idx" ON "ContractTemplate"("tenantId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "ContractTemplate_tenantId_createdAt_idx" ON "ContractTemplate"("tenantId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ContractTemplate_tenantId_name_version_key" ON "ContractTemplate"("tenantId", "name", "version");

-- CreateIndex
CREATE INDEX "Contract_tenantId_idx" ON "Contract"("tenantId");

-- CreateIndex
CREATE INDEX "Contract_tenantId_templateId_idx" ON "Contract"("tenantId", "templateId");

-- CreateIndex
CREATE INDEX "Contract_tenantId_enrollmentId_idx" ON "Contract"("tenantId", "enrollmentId");

-- CreateIndex
CREATE INDEX "Contract_tenantId_studentId_idx" ON "Contract"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "Contract_tenantId_guardianId_idx" ON "Contract"("tenantId", "guardianId");

-- CreateIndex
CREATE INDEX "Contract_tenantId_status_idx" ON "Contract"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Contract_tenantId_signedAt_idx" ON "Contract"("tenantId", "signedAt");

-- CreateIndex
CREATE INDEX "Contract_tenantId_createdAt_idx" ON "Contract"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "TeacherCompensationRule_tenantId_idx" ON "TeacherCompensationRule"("tenantId");

-- CreateIndex
CREATE INDEX "TeacherCompensationRule_tenantId_teacherId_idx" ON "TeacherCompensationRule"("tenantId", "teacherId");

-- CreateIndex
CREATE INDEX "TeacherCompensationRule_tenantId_courseProductId_idx" ON "TeacherCompensationRule"("tenantId", "courseProductId");

-- CreateIndex
CREATE INDEX "TeacherCompensationRule_tenantId_classGroupId_idx" ON "TeacherCompensationRule"("tenantId", "classGroupId");

-- CreateIndex
CREATE INDEX "TeacherCompensationRule_tenantId_classType_idx" ON "TeacherCompensationRule"("tenantId", "classType");

-- CreateIndex
CREATE INDEX "TeacherCompensationRule_tenantId_calculationMode_idx" ON "TeacherCompensationRule"("tenantId", "calculationMode");

-- CreateIndex
CREATE INDEX "TeacherCompensationRule_tenantId_status_idx" ON "TeacherCompensationRule"("tenantId", "status");

-- CreateIndex
CREATE INDEX "TeacherCompensationRule_tenantId_effectiveFrom_idx" ON "TeacherCompensationRule"("tenantId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "TeacherCompensationRule_tenantId_createdAt_idx" ON "TeacherCompensationRule"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "ComplianceRule_tenantId_idx" ON "ComplianceRule"("tenantId");

-- CreateIndex
CREATE INDEX "ComplianceRule_tenantId_ruleType_idx" ON "ComplianceRule"("tenantId", "ruleType");

-- CreateIndex
CREATE INDEX "ComplianceRule_tenantId_severity_idx" ON "ComplianceRule"("tenantId", "severity");

-- CreateIndex
CREATE INDEX "ComplianceRule_tenantId_status_idx" ON "ComplianceRule"("tenantId", "status");

-- CreateIndex
CREATE INDEX "ComplianceRule_tenantId_createdAt_idx" ON "ComplianceRule"("tenantId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceRule_tenantId_ruleType_name_key" ON "ComplianceRule"("tenantId", "ruleType", "name");

-- CreateIndex
CREATE INDEX "Enrollment_tenantId_idx" ON "Enrollment"("tenantId");

-- CreateIndex
CREATE INDEX "Enrollment_tenantId_status_idx" ON "Enrollment"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Enrollment_tenantId_studentId_idx" ON "Enrollment"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "Enrollment_tenantId_courseProductId_idx" ON "Enrollment"("tenantId", "courseProductId");

-- CreateIndex
CREATE INDEX "Enrollment_tenantId_classGroupId_idx" ON "Enrollment"("tenantId", "classGroupId");

-- CreateIndex
CREATE INDEX "Enrollment_tenantId_orderId_idx" ON "Enrollment"("tenantId", "orderId");

-- CreateIndex
CREATE INDEX "Enrollment_tenantId_contractTemplateId_idx" ON "Enrollment"("tenantId", "contractTemplateId");

-- CreateIndex
CREATE INDEX "Lesson_tenantId_idx" ON "Lesson"("tenantId");

-- CreateIndex
CREATE INDEX "Lesson_tenantId_status_idx" ON "Lesson"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Lesson_tenantId_classGroupId_idx" ON "Lesson"("tenantId", "classGroupId");

-- CreateIndex
CREATE INDEX "Lesson_tenantId_teacherId_idx" ON "Lesson"("tenantId", "teacherId");

-- CreateIndex
CREATE INDEX "LessonFeedback_tenantId_idx" ON "LessonFeedback"("tenantId");

-- CreateIndex
CREATE INDEX "LessonFeedback_tenantId_lessonId_idx" ON "LessonFeedback"("tenantId", "lessonId");

-- CreateIndex
CREATE INDEX "LessonFeedback_tenantId_studentId_idx" ON "LessonFeedback"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "LessonFeedback_tenantId_teacherId_idx" ON "LessonFeedback"("tenantId", "teacherId");

-- CreateIndex
CREATE INDEX "LessonFeedback_tenantId_updatedAt_idx" ON "LessonFeedback"("tenantId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "LessonFeedback_tenantId_lessonId_studentId_key" ON "LessonFeedback"("tenantId", "lessonId", "studentId");

-- CreateIndex
CREATE INDEX "Schedule_tenantId_idx" ON "Schedule"("tenantId");

-- CreateIndex
CREATE INDEX "Schedule_tenantId_startAt_idx" ON "Schedule"("tenantId", "startAt");

-- CreateIndex
CREATE INDEX "Schedule_tenantId_status_idx" ON "Schedule"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Schedule_tenantId_classGroupId_idx" ON "Schedule"("tenantId", "classGroupId");

-- CreateIndex
CREATE INDEX "Schedule_tenantId_teacherId_idx" ON "Schedule"("tenantId", "teacherId");

-- CreateIndex
CREATE INDEX "Schedule_tenantId_campusId_roomId_idx" ON "Schedule"("tenantId", "campusId", "roomId");

-- CreateIndex
CREATE INDEX "ScheduleChangeLog_tenantId_scheduleId_idx" ON "ScheduleChangeLog"("tenantId", "scheduleId");

-- CreateIndex
CREATE INDEX "ScheduleChangeLog_tenantId_changeType_idx" ON "ScheduleChangeLog"("tenantId", "changeType");

-- CreateIndex
CREATE INDEX "ScheduleChangeLog_tenantId_createdAt_idx" ON "ScheduleChangeLog"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "Attendance_tenantId_idx" ON "Attendance"("tenantId");

-- CreateIndex
CREATE INDEX "Attendance_tenantId_status_idx" ON "Attendance"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Attendance_tenantId_scheduleId_idx" ON "Attendance"("tenantId", "scheduleId");

-- CreateIndex
CREATE INDEX "Attendance_tenantId_studentId_idx" ON "Attendance"("tenantId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_tenantId_scheduleId_studentId_key" ON "Attendance"("tenantId", "scheduleId", "studentId");

-- CreateIndex
CREATE INDEX "CheckIn_tenantId_idx" ON "CheckIn"("tenantId");

-- CreateIndex
CREATE INDEX "CheckIn_tenantId_scheduleId_idx" ON "CheckIn"("tenantId", "scheduleId");

-- CreateIndex
CREATE INDEX "CheckIn_tenantId_studentId_idx" ON "CheckIn"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "CheckIn_tenantId_confirmedAt_idx" ON "CheckIn"("tenantId", "confirmedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CheckIn_tenantId_scheduleId_studentId_key" ON "CheckIn"("tenantId", "scheduleId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseConsumption_attendanceId_key" ON "CourseConsumption"("attendanceId");

-- CreateIndex
CREATE INDEX "CourseConsumption_tenantId_idx" ON "CourseConsumption"("tenantId");

-- CreateIndex
CREATE INDEX "CourseConsumption_tenantId_studentId_idx" ON "CourseConsumption"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "CourseConsumption_tenantId_courseAccountId_idx" ON "CourseConsumption"("tenantId", "courseAccountId");

-- CreateIndex
CREATE INDEX "CourseConsumption_tenantId_courseProductId_idx" ON "CourseConsumption"("tenantId", "courseProductId");

-- CreateIndex
CREATE INDEX "CourseConsumption_tenantId_createdAt_idx" ON "CourseConsumption"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "CourseConsumption_tenantId_reversedAt_idx" ON "CourseConsumption"("tenantId", "reversedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CourseConsumption_tenantId_scheduleId_studentId_key" ON "CourseConsumption"("tenantId", "scheduleId", "studentId");

-- CreateIndex
CREATE INDEX "Resource_tenantId_idx" ON "Resource"("tenantId");

-- CreateIndex
CREATE INDEX "Resource_tenantId_status_idx" ON "Resource"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Resource_tenantId_provider_idx" ON "Resource"("tenantId", "provider");

-- CreateIndex
CREATE INDEX "Resource_tenantId_objectKey_idx" ON "Resource"("tenantId", "objectKey");

-- CreateIndex
CREATE INDEX "Resource_tenantId_visibility_idx" ON "Resource"("tenantId", "visibility");

-- CreateIndex
CREATE INDEX "Resource_tenantId_createdById_idx" ON "Resource"("tenantId", "createdById");

-- CreateIndex
CREATE INDEX "Resource_tenantId_resourceType_idx" ON "Resource"("tenantId", "resourceType");

-- CreateIndex
CREATE INDEX "Resource_tenantId_courseProductId_idx" ON "Resource"("tenantId", "courseProductId");

-- CreateIndex
CREATE INDEX "Resource_tenantId_classGroupId_idx" ON "Resource"("tenantId", "classGroupId");

-- CreateIndex
CREATE INDEX "Resource_tenantId_lessonId_idx" ON "Resource"("tenantId", "lessonId");

-- CreateIndex
CREATE INDEX "Resource_tenantId_releaseAt_idx" ON "Resource"("tenantId", "releaseAt");

-- CreateIndex
CREATE INDEX "Resource_tenantId_createdAt_idx" ON "Resource"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "ResourcePermission_tenantId_resourceId_idx" ON "ResourcePermission"("tenantId", "resourceId");

-- CreateIndex
CREATE INDEX "ResourcePermission_tenantId_target_idx" ON "ResourcePermission"("tenantId", "target");

-- CreateIndex
CREATE INDEX "ResourcePermission_tenantId_classGroupId_idx" ON "ResourcePermission"("tenantId", "classGroupId");

-- CreateIndex
CREATE INDEX "ResourcePermission_tenantId_studentId_idx" ON "ResourcePermission"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "ResourcePermission_tenantId_roleKey_idx" ON "ResourcePermission"("tenantId", "roleKey");

-- CreateIndex
CREATE INDEX "Homework_tenantId_idx" ON "Homework"("tenantId");

-- CreateIndex
CREATE INDEX "Homework_tenantId_status_idx" ON "Homework"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Homework_tenantId_assignedByUserId_idx" ON "Homework"("tenantId", "assignedByUserId");

-- CreateIndex
CREATE INDEX "Homework_tenantId_classGroupId_idx" ON "Homework"("tenantId", "classGroupId");

-- CreateIndex
CREATE INDEX "Homework_tenantId_lessonId_idx" ON "Homework"("tenantId", "lessonId");

-- CreateIndex
CREATE INDEX "Homework_tenantId_studentId_idx" ON "Homework"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "Homework_tenantId_dueAt_idx" ON "Homework"("tenantId", "dueAt");

-- CreateIndex
CREATE INDEX "HomeworkSubmission_tenantId_idx" ON "HomeworkSubmission"("tenantId");

-- CreateIndex
CREATE INDEX "HomeworkSubmission_tenantId_homeworkId_idx" ON "HomeworkSubmission"("tenantId", "homeworkId");

-- CreateIndex
CREATE INDEX "HomeworkSubmission_tenantId_studentId_idx" ON "HomeworkSubmission"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "HomeworkSubmission_tenantId_status_idx" ON "HomeworkSubmission"("tenantId", "status");

-- CreateIndex
CREATE INDEX "HomeworkSubmission_tenantId_submittedAt_idx" ON "HomeworkSubmission"("tenantId", "submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "HomeworkSubmission_tenantId_homeworkId_studentId_attemptNum_key" ON "HomeworkSubmission"("tenantId", "homeworkId", "studentId", "attemptNumber");

-- CreateIndex
CREATE INDEX "HomeworkCorrection_tenantId_idx" ON "HomeworkCorrection"("tenantId");

-- CreateIndex
CREATE INDEX "HomeworkCorrection_tenantId_submissionId_idx" ON "HomeworkCorrection"("tenantId", "submissionId");

-- CreateIndex
CREATE INDEX "HomeworkCorrection_tenantId_teacherId_idx" ON "HomeworkCorrection"("tenantId", "teacherId");

-- CreateIndex
CREATE INDEX "HomeworkCorrection_tenantId_status_idx" ON "HomeworkCorrection"("tenantId", "status");

-- CreateIndex
CREATE INDEX "HomeworkCorrection_tenantId_correctedAt_idx" ON "HomeworkCorrection"("tenantId", "correctedAt");

-- CreateIndex
CREATE INDEX "LearningTask_tenantId_idx" ON "LearningTask"("tenantId");

-- CreateIndex
CREATE INDEX "LearningTask_tenantId_status_idx" ON "LearningTask"("tenantId", "status");

-- CreateIndex
CREATE INDEX "LearningTask_tenantId_taskType_idx" ON "LearningTask"("tenantId", "taskType");

-- CreateIndex
CREATE INDEX "LearningTask_tenantId_targetDate_idx" ON "LearningTask"("tenantId", "targetDate");

-- CreateIndex
CREATE INDEX "LearningTask_tenantId_classGroupId_idx" ON "LearningTask"("tenantId", "classGroupId");

-- CreateIndex
CREATE INDEX "LearningTask_tenantId_studentId_idx" ON "LearningTask"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "LearningTaskCheckIn_tenantId_idx" ON "LearningTaskCheckIn"("tenantId");

-- CreateIndex
CREATE INDEX "LearningTaskCheckIn_tenantId_taskId_idx" ON "LearningTaskCheckIn"("tenantId", "taskId");

-- CreateIndex
CREATE INDEX "LearningTaskCheckIn_tenantId_studentId_idx" ON "LearningTaskCheckIn"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "LearningTaskCheckIn_tenantId_checkedInAt_idx" ON "LearningTaskCheckIn"("tenantId", "checkedInAt");

-- CreateIndex
CREATE UNIQUE INDEX "LearningTaskCheckIn_tenantId_taskId_studentId_key" ON "LearningTaskCheckIn"("tenantId", "taskId", "studentId");

-- AddForeignKey
ALTER TABLE "Campus" ADD CONSTRAINT "Campus_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardianProfile" ADD CONSTRAINT "GuardianProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardianProfile" ADD CONSTRAINT "GuardianProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGuardian" ADD CONSTRAINT "StudentGuardian_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGuardian" ADD CONSTRAINT "StudentGuardian_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGuardian" ADD CONSTRAINT "StudentGuardian_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "GuardianProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherProfile" ADD CONSTRAINT "TeacherProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherProfile" ADD CONSTRAINT "TeacherProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Term" ADD CONSTRAINT "Term_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgePoint" ADD CONSTRAINT "KnowledgePoint_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgePoint" ADD CONSTRAINT "KnowledgePoint_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgePoint" ADD CONSTRAINT "KnowledgePoint_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgePoint" ADD CONSTRAINT "KnowledgePoint_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "KnowledgePoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionKnowledgePoint" ADD CONSTRAINT "QuestionKnowledgePoint_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionKnowledgePoint" ADD CONSTRAINT "QuestionKnowledgePoint_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionKnowledgePoint" ADD CONSTRAINT "QuestionKnowledgePoint_knowledgePointId_fkey" FOREIGN KEY ("knowledgePointId") REFERENCES "KnowledgePoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorRecord" ADD CONSTRAINT "ErrorRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorRecord" ADD CONSTRAINT "ErrorRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorRecord" ADD CONSTRAINT "ErrorRecord_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorRecord" ADD CONSTRAINT "ErrorRecord_homeworkSubmissionId_fkey" FOREIGN KEY ("homeworkSubmissionId") REFERENCES "HomeworkSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorRecord" ADD CONSTRAINT "ErrorRecord_knowledgePointId_fkey" FOREIGN KEY ("knowledgePointId") REFERENCES "KnowledgePoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseProduct" ADD CONSTRAINT "CourseProduct_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseProduct" ADD CONSTRAINT "CourseProduct_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseProduct" ADD CONSTRAINT "CourseProduct_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassGroup" ADD CONSTRAINT "ClassGroup_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassGroup" ADD CONSTRAINT "ClassGroup_courseProductId_fkey" FOREIGN KEY ("courseProductId") REFERENCES "CourseProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassGroup" ADD CONSTRAINT "ClassGroup_primaryTeacherId_fkey" FOREIGN KEY ("primaryTeacherId") REFERENCES "TeacherProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassGroup" ADD CONSTRAINT "ClassGroup_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassGroupStudent" ADD CONSTRAINT "ClassGroupStudent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassGroupStudent" ADD CONSTRAINT "ClassGroupStudent_classGroupId_fkey" FOREIGN KEY ("classGroupId") REFERENCES "ClassGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassGroupStudent" ADD CONSTRAINT "ClassGroupStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseAccount" ADD CONSTRAINT "CourseAccount_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseAccount" ADD CONSTRAINT "CourseAccount_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseAccount" ADD CONSTRAINT "CourseAccount_courseProductId_fkey" FOREIGN KEY ("courseProductId") REFERENCES "CourseProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "GuardianProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_courseProductId_fkey" FOREIGN KEY ("courseProductId") REFERENCES "CourseProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "GuardianProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_courseAccountId_fkey" FOREIGN KEY ("courseAccountId") REFERENCES "CourseAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "GuardianProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractTemplate" ADD CONSTRAINT "ContractTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ContractTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "GuardianProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherCompensationRule" ADD CONSTRAINT "TeacherCompensationRule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherCompensationRule" ADD CONSTRAINT "TeacherCompensationRule_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherCompensationRule" ADD CONSTRAINT "TeacherCompensationRule_courseProductId_fkey" FOREIGN KEY ("courseProductId") REFERENCES "CourseProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherCompensationRule" ADD CONSTRAINT "TeacherCompensationRule_classGroupId_fkey" FOREIGN KEY ("classGroupId") REFERENCES "ClassGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceRule" ADD CONSTRAINT "ComplianceRule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseProductId_fkey" FOREIGN KEY ("courseProductId") REFERENCES "CourseProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_classGroupId_fkey" FOREIGN KEY ("classGroupId") REFERENCES "ClassGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseAccountId_fkey" FOREIGN KEY ("courseAccountId") REFERENCES "CourseAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_contractTemplateId_fkey" FOREIGN KEY ("contractTemplateId") REFERENCES "ContractTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_classGroupId_fkey" FOREIGN KEY ("classGroupId") REFERENCES "ClassGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonFeedback" ADD CONSTRAINT "LessonFeedback_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonFeedback" ADD CONSTRAINT "LessonFeedback_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonFeedback" ADD CONSTRAINT "LessonFeedback_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonFeedback" ADD CONSTRAINT "LessonFeedback_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_classGroupId_fkey" FOREIGN KEY ("classGroupId") REFERENCES "ClassGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_sourceScheduleId_fkey" FOREIGN KEY ("sourceScheduleId") REFERENCES "Schedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleChangeLog" ADD CONSTRAINT "ScheduleChangeLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleChangeLog" ADD CONSTRAINT "ScheduleChangeLog_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleChangeLog" ADD CONSTRAINT "ScheduleChangeLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_confirmedByUserId_fkey" FOREIGN KEY ("confirmedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseConsumption" ADD CONSTRAINT "CourseConsumption_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseConsumption" ADD CONSTRAINT "CourseConsumption_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseConsumption" ADD CONSTRAINT "CourseConsumption_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseConsumption" ADD CONSTRAINT "CourseConsumption_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseConsumption" ADD CONSTRAINT "CourseConsumption_courseProductId_fkey" FOREIGN KEY ("courseProductId") REFERENCES "CourseProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseConsumption" ADD CONSTRAINT "CourseConsumption_courseAccountId_fkey" FOREIGN KEY ("courseAccountId") REFERENCES "CourseAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_courseProductId_fkey" FOREIGN KEY ("courseProductId") REFERENCES "CourseProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_classGroupId_fkey" FOREIGN KEY ("classGroupId") REFERENCES "ClassGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourcePermission" ADD CONSTRAINT "ResourcePermission_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourcePermission" ADD CONSTRAINT "ResourcePermission_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourcePermission" ADD CONSTRAINT "ResourcePermission_classGroupId_fkey" FOREIGN KEY ("classGroupId") REFERENCES "ClassGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourcePermission" ADD CONSTRAINT "ResourcePermission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_assignedByUserId_fkey" FOREIGN KEY ("assignedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_classGroupId_fkey" FOREIGN KEY ("classGroupId") REFERENCES "ClassGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkSubmission" ADD CONSTRAINT "HomeworkSubmission_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkSubmission" ADD CONSTRAINT "HomeworkSubmission_homeworkId_fkey" FOREIGN KEY ("homeworkId") REFERENCES "Homework"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkSubmission" ADD CONSTRAINT "HomeworkSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkCorrection" ADD CONSTRAINT "HomeworkCorrection_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkCorrection" ADD CONSTRAINT "HomeworkCorrection_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "HomeworkSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkCorrection" ADD CONSTRAINT "HomeworkCorrection_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningTask" ADD CONSTRAINT "LearningTask_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningTask" ADD CONSTRAINT "LearningTask_assignedByUserId_fkey" FOREIGN KEY ("assignedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningTask" ADD CONSTRAINT "LearningTask_classGroupId_fkey" FOREIGN KEY ("classGroupId") REFERENCES "ClassGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningTask" ADD CONSTRAINT "LearningTask_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningTaskCheckIn" ADD CONSTRAINT "LearningTaskCheckIn_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningTaskCheckIn" ADD CONSTRAINT "LearningTaskCheckIn_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "LearningTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningTaskCheckIn" ADD CONSTRAINT "LearningTaskCheckIn_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
