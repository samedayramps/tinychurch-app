-- Add foreign key constraint for audit_logs.user_id
ALTER TABLE audit_logs
ADD CONSTRAINT audit_logs_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(user_id);

-- Add foreign key constraint for profiles.church_id
ALTER TABLE profiles
ADD CONSTRAINT profiles_church_id_fkey
FOREIGN KEY (church_id) REFERENCES churches(id); 