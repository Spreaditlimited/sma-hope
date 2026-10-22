ALTER TABLE donor_accounts ADD CONSTRAINT donor_auth_fk FOREIGN KEY (auth_user_id) REFERENCES account_identity(id) ON DELETE SET NULL;
ALTER TABLE admin_users ADD CONSTRAINT admin_auth_fk FOREIGN KEY (auth_user_id) REFERENCES administrator_identity(id) ON DELETE CASCADE;
ALTER TABLE donations ADD CONSTRAINT donation_owner_fk FOREIGN KEY (donor_account_id) REFERENCES donor_accounts(id) ON DELETE SET NULL, ADD INDEX donation_date_idx (created_at), ADD INDEX donation_owner_date_idx (donor_account_id,created_at);
ALTER TABLE book_orders ADD CONSTRAINT order_owner_fk FOREIGN KEY (donor_account_id) REFERENCES donor_accounts(id) ON DELETE SET NULL, ADD INDEX order_date_idx (created_at), ADD INDEX order_owner_date_idx (donor_account_id,created_at);
ALTER TABLE subscriptions ADD CONSTRAINT subscription_owner_fk FOREIGN KEY (donor_account_id) REFERENCES donor_accounts(id) ON DELETE SET NULL, ADD INDEX subscription_owner_idx (donor_account_id);
