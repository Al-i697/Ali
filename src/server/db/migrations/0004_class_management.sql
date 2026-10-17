CREATE TABLE `class_participation` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`student_id` text NOT NULL,
	`assignment_id` text,
	`date` text NOT NULL,
	`period` integer DEFAULT 0 NOT NULL,
	`count` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "class_part_count_chk" CHECK("class_participation"."count" between 0 and 50),
	CONSTRAINT "class_part_period_chk" CHECK("class_participation"."period" between 0 and 12)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `class_part_unique_uq` ON `class_participation` (`student_id`,`assignment_id`,`date`,`period`);--> statement-breakpoint
CREATE INDEX `class_part_session_idx` ON `class_participation` (`owner_id`,`assignment_id`,`date`);--> statement-breakpoint
CREATE INDEX `class_part_student_idx` ON `class_participation` (`owner_id`,`student_id`,`date`);--> statement-breakpoint
CREATE TABLE `class_records` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`student_id` text NOT NULL,
	`assignment_id` text,
	`date` text NOT NULL,
	`period` integer DEFAULT 0 NOT NULL,
	`kind` text NOT NULL,
	`reason` text,
	`note` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "class_rec_kind_chk" CHECK("class_records"."kind" in ('positive','negative','note')),
	CONSTRAINT "class_rec_period_chk" CHECK("class_records"."period" between 0 and 12),
	CONSTRAINT "class_rec_text_chk" CHECK("class_records"."reason" is not null or "class_records"."note" is not null)
);
--> statement-breakpoint
CREATE INDEX `class_rec_session_idx` ON `class_records` (`owner_id`,`assignment_id`,`date`);--> statement-breakpoint
CREATE INDEX `class_rec_student_idx` ON `class_records` (`owner_id`,`student_id`,`date`);