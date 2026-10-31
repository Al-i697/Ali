CREATE TABLE `interactive_deck_files` (
	`deck_id` text PRIMARY KEY NOT NULL,
	`html` text NOT NULL,
	FOREIGN KEY (`deck_id`) REFERENCES `interactive_decks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `interactive_decks` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`subject_id` text,
	`title` text NOT NULL,
	`search_text` text DEFAULT '' NOT NULL,
	`description` text,
	`bytes` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "deck_bytes_chk" CHECK("interactive_decks"."bytes" > 0)
);
--> statement-breakpoint
CREATE INDEX `deck_owner_created_idx` ON `interactive_decks` (`owner_id`,`created_at`);