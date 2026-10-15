CREATE TABLE `academic_years` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`is_current` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "years_dates_chk" CHECK("academic_years"."start_date" < "academic_years"."end_date")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `years_owner_name_uq` ON `academic_years` (`owner_id`,`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `years_one_current_uq` ON `academic_years` (`owner_id`) WHERE "academic_years"."is_current" = 1;--> statement-breakpoint
CREATE TABLE `assessment_results` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`assessment_id` text NOT NULL,
	`student_id` text NOT NULL,
	`score` real,
	`level` integer,
	`status` text DEFAULT 'graded' NOT NULL,
	`note` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "results_score_chk" CHECK("assessment_results"."score" is null or "assessment_results"."score" >= 0),
	CONSTRAINT "results_level_chk" CHECK("assessment_results"."level" is null or "assessment_results"."level" between 1 and 4)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `results_assessment_student_uq` ON `assessment_results` (`assessment_id`,`student_id`);--> statement-breakpoint
CREATE INDEX `results_student_idx` ON `assessment_results` (`owner_id`,`student_id`);--> statement-breakpoint
CREATE TABLE `assessment_skills` (
	`assessment_id` text NOT NULL,
	`skill_id` text NOT NULL,
	PRIMARY KEY(`assessment_id`, `skill_id`),
	FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `assessment_skills_skill_idx` ON `assessment_skills` (`skill_id`);--> statement-breakpoint
CREATE TABLE `assessments` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`assignment_id` text NOT NULL,
	`term_id` text NOT NULL,
	`title` text NOT NULL,
	`type` text DEFAULT 'written' NOT NULL,
	`mode` text DEFAULT 'score' NOT NULL,
	`max_score` real,
	`weight` real DEFAULT 0 NOT NULL,
	`date` text,
	`description` text,
	`counts_toward_total` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`term_id`) REFERENCES `terms`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "assessments_max_chk" CHECK("assessments"."max_score" is null or "assessments"."max_score" > 0),
	CONSTRAINT "assessments_weight_chk" CHECK("assessments"."weight" >= 0),
	CONSTRAINT "assessments_mode_chk" CHECK(("assessments"."mode" = 'score' and "assessments"."max_score" is not null) or "assessments"."mode" = 'mastery')
);
--> statement-breakpoint
CREATE INDEX `assessments_assignment_term_idx` ON `assessments` (`assignment_id`,`term_id`,`date`);--> statement-breakpoint
CREATE INDEX `assessments_owner_date_idx` ON `assessments` (`owner_id`,`date`);--> statement-breakpoint
CREATE TABLE `assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`section_id` text NOT NULL,
	`subject_id` text NOT NULL,
	`weekly_periods` integer,
	`created_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assignments_section_subject_uq` ON `assignments` (`section_id`,`subject_id`);--> statement-breakpoint
CREATE INDEX `assignments_owner_idx` ON `assignments` (`owner_id`);--> statement-breakpoint
CREATE INDEX `assignments_subject_idx` ON `assignments` (`subject_id`);--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`at` text NOT NULL,
	`user_id` text,
	`user_email` text,
	`action` text NOT NULL,
	`entity_type` text,
	`entity_id` text,
	`meta` text,
	`ip` text
);
--> statement-breakpoint
CREATE INDEX `audit_at_idx` ON `audit_log` (`at`);--> statement-breakpoint
CREATE INDEX `audit_user_idx` ON `audit_log` (`user_id`);--> statement-breakpoint
CREATE TABLE `enrollments` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`student_id` text NOT NULL,
	`section_id` text NOT NULL,
	`year_id` text NOT NULL,
	`roll_no` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`year_id`) REFERENCES `academic_years`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `enrollments_student_year_uq` ON `enrollments` (`student_id`,`year_id`);--> statement-breakpoint
CREATE INDEX `enrollments_section_idx` ON `enrollments` (`section_id`,`roll_no`);--> statement-breakpoint
CREATE TABLE `lesson_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`assignment_id` text NOT NULL,
	`term_id` text,
	`date` text NOT NULL,
	`period` integer,
	`title` text NOT NULL,
	`unit_name` text,
	`lesson_number` text,
	`search_text` text DEFAULT '' NOT NULL,
	`duration_minutes` integer,
	`outcomes` text DEFAULT '[]' NOT NULL,
	`objectives` text DEFAULT '[]' NOT NULL,
	`concepts` text DEFAULT '[]' NOT NULL,
	`strategies` text DEFAULT '[]' NOT NULL,
	`resources` text DEFAULT '[]' NOT NULL,
	`activities` text DEFAULT '[]' NOT NULL,
	`assessment_methods` text DEFAULT '[]' NOT NULL,
	`assessment_notes` text,
	`homework` text,
	`support_plan` text,
	`enrichment_plan` text,
	`notes` text,
	`reflection` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`is_template` integer DEFAULT false NOT NULL,
	`source_lesson_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`term_id`) REFERENCES `terms`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `lessons_owner_date_idx` ON `lesson_plans` (`owner_id`,`date`);--> statement-breakpoint
CREATE INDEX `lessons_assignment_date_idx` ON `lesson_plans` (`assignment_id`,`date`);--> statement-breakpoint
CREATE INDEX `lessons_template_idx` ON `lesson_plans` (`owner_id`,`is_template`);--> statement-breakpoint
CREATE TABLE `sections` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`year_id` text NOT NULL,
	`grade_level` integer NOT NULL,
	`name` text NOT NULL,
	`notes` text,
	`is_archived` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`year_id`) REFERENCES `academic_years`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "sections_grade_chk" CHECK("sections"."grade_level" between 1 and 12)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sections_unique_uq` ON `sections` (`owner_id`,`year_id`,`grade_level`,`name`);--> statement-breakpoint
CREATE INDEX `sections_year_idx` ON `sections` (`owner_id`,`year_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text NOT NULL,
	`last_seen_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`remember` integer DEFAULT false NOT NULL,
	`ip` text,
	`user_agent` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_expires_idx` ON `sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `skills` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`subject_id` text NOT NULL,
	`grade_level` integer,
	`code` text,
	`title` text NOT NULL,
	`description` text,
	`is_archived` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `skills_subject_idx` ON `skills` (`owner_id`,`subject_id`);--> statement-breakpoint
CREATE TABLE `student_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`student_id` text NOT NULL,
	`assignment_id` text,
	`date` text NOT NULL,
	`category` text DEFAULT 'academic' NOT NULL,
	`text` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `student_notes_student_idx` ON `student_notes` (`owner_id`,`student_id`,`date`);--> statement-breakpoint
CREATE TABLE `students` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`full_name` text NOT NULL,
	`name_normalized` text NOT NULL,
	`student_number` text,
	`gender` text,
	`birth_date` text,
	`guardian_name` text,
	`guardian_phone` text,
	`notes` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `students_owner_name_idx` ON `students` (`owner_id`,`name_normalized`);--> statement-breakpoint
CREATE UNIQUE INDEX `students_owner_number_uq` ON `students` (`owner_id`,`student_number`) WHERE "students"."student_number" is not null;--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`color` text DEFAULT 'teal' NOT NULL,
	`is_archived` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subjects_owner_name_uq` ON `subjects` (`owner_id`,`name`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`kind` text DEFAULT 'task' NOT NULL,
	`due_date` text,
	`due_time` text,
	`priority` text DEFAULT 'normal' NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`assignment_id` text,
	`completed_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `tasks_owner_status_due_idx` ON `tasks` (`owner_id`,`status`,`due_date`);--> statement-breakpoint
CREATE TABLE `terms` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`year_id` text NOT NULL,
	`number` integer NOT NULL,
	`name` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`year_id`) REFERENCES `academic_years`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "terms_number_chk" CHECK("terms"."number" in (1, 2)),
	CONSTRAINT "terms_dates_chk" CHECK("terms"."start_date" < "terms"."end_date")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `terms_year_number_uq` ON `terms` (`year_id`,`number`);--> statement-breakpoint
CREATE TABLE `timetable_slots` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`year_id` text NOT NULL,
	`assignment_id` text NOT NULL,
	`weekday` integer NOT NULL,
	`period` integer NOT NULL,
	`room` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`year_id`) REFERENCES `academic_years`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "slots_weekday_chk" CHECK("timetable_slots"."weekday" between 0 and 6),
	CONSTRAINT "slots_period_chk" CHECK("timetable_slots"."period" between 1 and 12)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `slots_unique_uq` ON `timetable_slots` (`owner_id`,`year_id`,`weekday`,`period`);--> statement-breakpoint
CREATE INDEX `slots_assignment_idx` ON `timetable_slots` (`assignment_id`);--> statement-breakpoint
CREATE TABLE `user_settings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`school_name` text,
	`directorate` text,
	`job_title` text,
	`specialization` text,
	`senior_teacher_name` text,
	`principal_name` text,
	`theme` text DEFAULT 'system' NOT NULL,
	`digits` text DEFAULT 'latn' NOT NULL,
	`grading` text,
	`schedule` text,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`full_name` text NOT NULL,
	`role` text DEFAULT 'teacher' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`is_demo` integer DEFAULT false NOT NULL,
	`must_change_password` integer DEFAULT false NOT NULL,
	`failed_logins` integer DEFAULT 0 NOT NULL,
	`locked_until` text,
	`last_login_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT "users_role_chk" CHECK("users"."role" in ('admin','teacher'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);