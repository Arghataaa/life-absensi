CREATE TABLE `activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`type` varchar(50),
	`action` text NOT NULL,
	`detail` text,
	`ip_address` varchar(45),
	`timestamp` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `presensi_cloud` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`nama` varchar(255) NOT NULL,
	`tanggal` varchar(10) NOT NULL,
	`status` varchar(10) DEFAULT 'H',
	`jam_masuk` varchar(8),
	`jam_pulang` varchar(8),
	`shift` varchar(50) DEFAULT '-',
	`type` varchar(50),
	`employee_name` varchar(255),
	`timestamp` timestamp DEFAULT (now()),
	CONSTRAINT `presensi_cloud_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `devices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`device_id` varchar(255),
	`name` varchar(255) NOT NULL,
	`location` varchar(255),
	`ip_address` varchar(45),
	`status` varchar(50) DEFAULT 'OFFLINE',
	`last_seen` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `devices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `karyawan_cloud` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nip` varchar(50),
	`nama_lengkap` varchar(255) NOT NULL,
	`divisi` varchar(100) NOT NULL,
	`user_id` int DEFAULT 0,
	`employee_id` varchar(50),
	`department` varchar(100),
	`position` varchar(100),
	`phone` varchar(20),
	`join_date` varchar(20),
	`face_photo` text,
	CONSTRAINT `karyawan_cloud_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`type` varchar(50),
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`is_read` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`company_name` varchar(255),
	`timezone` varchar(100),
	`work_days` varchar(255),
	`work_start_time` varchar(10),
	`work_end_time` varchar(10),
	`late_tolerance` int DEFAULT 15,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL DEFAULT '',
	`email` varchar(255) NOT NULL DEFAULT '',
	`role` varchar(50) DEFAULT 'EMPLOYEE',
	`avatar` text,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
