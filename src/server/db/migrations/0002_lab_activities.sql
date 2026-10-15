CREATE TABLE `lab_activities` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`assignment_id` text,
	`date` text NOT NULL,
	`period` integer,
	`kind` text DEFAULT 'experiment' NOT NULL,
	`title` text NOT NULL,
	`search_text` text DEFAULT '' NOT NULL,
	`location` text,
	`objectives` text DEFAULT '[]' NOT NULL,
	`materials` text DEFAULT '[]' NOT NULL,
	`safety` text DEFAULT '[]' NOT NULL,
	`procedure` text,
	`results` text,
	`participants` integer,
	`notes` text,
	`status` text DEFAULT 'planned' NOT NULL,
	`source_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "lab_kind_chk" CHECK("lab_activities"."kind" in ('experiment','demo','activity','project','field_trip','competition','other')),
	CONSTRAINT "lab_status_chk" CHECK("lab_activities"."status" in ('planned','done','cancelled')),
	CONSTRAINT "lab_period_chk" CHECK("lab_activities"."period" is null or "lab_activities"."period" between 1 and 12),
	CONSTRAINT "lab_participants_chk" CHECK("lab_activities"."participants" is null or "lab_activities"."participants" >= 0)
);
--> statement-breakpoint
CREATE INDEX `lab_owner_date_idx` ON `lab_activities` (`owner_id`,`date`);--> statement-breakpoint
CREATE INDEX `lab_assignment_date_idx` ON `lab_activities` (`assignment_id`,`date`);--> statement-breakpoint
CREATE INDEX `lab_owner_status_idx` ON `lab_activities` (`owner_id`,`status`,`date`);