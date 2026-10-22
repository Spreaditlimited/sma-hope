-- SMA Hope dedicated MySQL database. Additive migration; no other schema is touched.
create table if not exists donor_accounts (
  id varchar(36) primary key,
  auth_user_id varchar(36) unique,
  email varchar(254) not null unique,
  full_name text,
  created_at datetime(3) not null default CURRENT_TIMESTAMP(3),
  updated_at datetime(3) not null default CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

create table if not exists donations (
  id varchar(36) primary key,
  donor_account_id varchar(36),
  email text not null,
  paystack_reference varchar(254) not null unique,
  amount_major decimal(12, 2) not null,
  currency text not null,
  donation_interval varchar(32) not null default 'one_time',
  status text not null,
  plan_code text,
  subscription_code text,
  paid_at datetime(3),
  metadata json not null default (json_object()),
  created_at datetime(3) not null default CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

create table if not exists subscriptions (
  id varchar(36) primary key,
  donor_account_id varchar(36),
  email text not null,
  subscription_code varchar(254) not null unique,
  customer_code text,
  plan_code text,
  email_token text,
  status text not null,
  next_payment_date datetime(3),
  cancelled_at datetime(3),
  metadata json not null default (json_object()),
  created_at datetime(3) not null default CURRENT_TIMESTAMP(3),
  updated_at datetime(3) not null default CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

create table if not exists book_orders (
  id varchar(36) primary key,
  donor_account_id varchar(36),
  email text not null,
  paystack_reference varchar(254) not null unique,
  status text not null,
  total_ngn decimal(12, 2) not null,
  quantity integer not null default 1,
  delivery_area text,
  phone text,
  address text,
  city text,
  state text,
  note text,
  fez_tracking_id text,
  fez_tracking_url text,
  fez_status text,
  metadata json not null default (json_object()),
  created_at datetime(3) not null default CURRENT_TIMESTAMP(3),
  updated_at datetime(3) not null default CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

create table if not exists payment_events (
  id varchar(36) primary key,
  event_key varchar(254) not null unique,
  event_type text not null,
  payload json not null default (json_object()),
  created_at datetime(3) not null default CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

create table if not exists admin_users (
  id varchar(36) primary key,
  auth_user_id varchar(36) unique,
  email varchar(254) not null unique,
  role varchar(16) not null check (role in ('admin', 'ops')),
  active boolean not null default true,
  created_at datetime(3) not null default CURRENT_TIMESTAMP(3),
  updated_at datetime(3) not null default CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;


CREATE TABLE IF NOT EXISTS account_identity (
 id varchar(36) PRIMARY KEY, name varchar(255) NOT NULL, email varchar(254) NOT NULL UNIQUE,
 emailVerified boolean NOT NULL DEFAULT false, image text,
 createdAt datetime(3) NOT NULL, updatedAt datetime(3) NOT NULL,
 active boolean NOT NULL DEFAULT true
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
CREATE TABLE IF NOT EXISTS account_session (
 id varchar(36) PRIMARY KEY, token varchar(255) NOT NULL UNIQUE, userId varchar(36) NOT NULL,
 expiresAt datetime(3) NOT NULL, createdAt datetime(3) NOT NULL, updatedAt datetime(3) NOT NULL,
 ipAddress text, userAgent text,
 FOREIGN KEY (userId) REFERENCES account_identity(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
CREATE TABLE IF NOT EXISTS account_credential (
 id varchar(36) PRIMARY KEY, accountId varchar(255) NOT NULL, providerId varchar(255) NOT NULL,
 userId varchar(36) NOT NULL, password text, accessToken text, refreshToken text, idToken text,
 accessTokenExpiresAt datetime(3), refreshTokenExpiresAt datetime(3), scope text,
 createdAt datetime(3) NOT NULL, updatedAt datetime(3) NOT NULL,
 UNIQUE KEY provider_account (providerId,accountId),
 FOREIGN KEY (userId) REFERENCES account_identity(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
CREATE TABLE IF NOT EXISTS account_verification (
 id varchar(36) PRIMARY KEY, identifier varchar(255) NOT NULL, value text NOT NULL,
 expiresAt datetime(3) NOT NULL, createdAt datetime(3) NOT NULL, updatedAt datetime(3) NOT NULL,
 INDEX verification_identifier (identifier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS administrator_identity (
 id varchar(36) PRIMARY KEY, name varchar(255) NOT NULL, email varchar(254) NOT NULL UNIQUE,
 emailVerified boolean NOT NULL DEFAULT false, image text,
 createdAt datetime(3) NOT NULL, updatedAt datetime(3) NOT NULL,
 active boolean NOT NULL DEFAULT true
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
CREATE TABLE IF NOT EXISTS administrator_session (
 id varchar(36) PRIMARY KEY, token varchar(255) NOT NULL UNIQUE, userId varchar(36) NOT NULL,
 expiresAt datetime(3) NOT NULL, createdAt datetime(3) NOT NULL, updatedAt datetime(3) NOT NULL,
 ipAddress text, userAgent text,
 FOREIGN KEY (userId) REFERENCES administrator_identity(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
CREATE TABLE IF NOT EXISTS administrator_credential (
 id varchar(36) PRIMARY KEY, accountId varchar(255) NOT NULL, providerId varchar(255) NOT NULL,
 userId varchar(36) NOT NULL, password text, accessToken text, refreshToken text, idToken text,
 accessTokenExpiresAt datetime(3), refreshTokenExpiresAt datetime(3), scope text,
 createdAt datetime(3) NOT NULL, updatedAt datetime(3) NOT NULL,
 UNIQUE KEY provider_account (providerId,accountId),
 FOREIGN KEY (userId) REFERENCES administrator_identity(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
CREATE TABLE IF NOT EXISTS administrator_verification (
 id varchar(36) PRIMARY KEY, identifier varchar(255) NOT NULL, value text NOT NULL,
 expiresAt datetime(3) NOT NULL, createdAt datetime(3) NOT NULL, updatedAt datetime(3) NOT NULL,
 INDEX verification_identifier (identifier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS auth_rate_limit (id varchar(36) PRIMARY KEY, `key` varchar(255) NOT NULL UNIQUE, count int NOT NULL, lastRequest bigint NOT NULL) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS articles (
 id varchar(36) PRIMARY KEY, slug varchar(200) NOT NULL UNIQUE, title varchar(255) NOT NULL,
 status varchar(16) NOT NULL DEFAULT 'draft', content json NOT NULL, revision int NOT NULL DEFAULT 1,
 created_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 updated_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
CREATE TABLE IF NOT EXISTS audit_events (
 id varchar(36) PRIMARY KEY, actor_id varchar(36) NOT NULL, action varchar(80) NOT NULL,
 target_id varchar(200) NOT NULL, created_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
