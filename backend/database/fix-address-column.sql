-- Fix address column từ JSON sang TEXT
ALTER TABLE profiles MODIFY COLUMN address TEXT NULL COMMENT 'Địa chỉ người dùng';
