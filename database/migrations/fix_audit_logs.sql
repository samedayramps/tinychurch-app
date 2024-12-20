-- Drop existing constraint if it exists
ALTER TABLE audit_logs
DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;

-- Add correct foreign key constraint
ALTER TABLE audit_logs
ADD CONSTRAINT audit_logs_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(user_id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id 
ON audit_logs(record_id);

-- Add index for the foreign key
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id 
ON audit_logs(user_id); 