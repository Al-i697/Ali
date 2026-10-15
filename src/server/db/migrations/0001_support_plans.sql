CREATE TABLE `support_plan_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`plan_id` text NOT NULL,
	`date` text NOT NULL,
	`text` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`plan_id`) REFERENCES `support_plans`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `support_notes_plan_date_idx` ON `support_plan_notes` (`plan_id`,`date`);--> statement-breakpoint
CREATE TABLE `support_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`student_id` text NOT NULL,
	`assignment_id` text,
	`term_id` text,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`reason` text,
	`goal` text NOT NULL,
	`strategies` text DEFAULT '[]' NOT NULL,
	`start_date` text NOT NULL,
	`review_date` text,
	`status` text DEFAULT 'open' NOT NULL,
	`outcome` text,
	`baseline_percent` real,
	`closed_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`term_id`) REFERENCES `terms`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "support_plans_kind_chk" CHECK("support_plans"."kind" in ('remedial','enrichment')),
	CONSTRAINT "support_plans_status_chk" CHECK("support_plans"."status" in ('open','done','cancelled'))
);
--> statement-breakpoint
CREATE INDEX `support_plans_owner_status_idx` ON `support_plans` (`owner_id`,`status`,`review_date`);--> statement-breakpoint
CREATE INDEX `support_plans_owner_student_idx` ON `support_plans` (`owner_id`,`student_id`);--> statement-breakpoint
CREATE INDEX `support_plans_assignment_idx` ON `support_plans` (`assignment_id`);