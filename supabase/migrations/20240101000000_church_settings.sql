-- Create a type for church customization settings
CREATE TYPE church_customization AS (
  primary_color text,
  logo text
);

-- Create a type for church settings
CREATE TYPE church_settings AS (
  features text[],
  customization church_customization
);

-- Update the churches table
ALTER TABLE churches
  -- Add check constraint for subscription_status
  ADD CONSTRAINT valid_subscription_status CHECK (
    subscription_status IN ('pending', 'active', 'suspended', 'cancelled')
  ),
  -- Add check constraint for timezone
  ADD CONSTRAINT valid_timezone CHECK (
    timezone IN (
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Phoenix',
      'America/Los_Angeles'
    )
  ),
  -- Add validation for settings column
  ADD CONSTRAINT valid_settings CHECK (
    (settings->>'features') IS NULL OR jsonb_typeof(settings->'features') = 'array'
  ),
  -- Add validation for domain name
  ADD CONSTRAINT valid_domain_name CHECK (
    domain_name ~ '^[a-z0-9-]+$'
  );

-- Add RLS policies
ALTER TABLE churches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Churches are viewable by authenticated users"
  ON churches FOR SELECT
  USING (
    auth.role() = 'authenticated'
  );

CREATE POLICY "Churches are editable by superadmin"
  ON churches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'superadmin'
    )
  );

CREATE POLICY "Churches are viewable by their members"
  ON churches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.church_id = churches.id
    )
  );

-- Add indexes
CREATE INDEX churches_domain_name_idx ON churches (domain_name);
CREATE INDEX churches_subscription_status_idx ON churches (subscription_status);

-- Add function to validate church settings
CREATE OR REPLACE FUNCTION validate_church_settings()
RETURNS trigger AS $$
BEGIN
  -- Validate features array
  IF NEW.settings ? 'features' AND 
     NOT (jsonb_typeof(NEW.settings->'features') = 'array') THEN
    RAISE EXCEPTION 'features must be an array';
  END IF;

  -- Validate customization object
  IF NEW.settings ? 'customization' THEN
    -- Validate primary_color format (hex color)
    IF NEW.settings->'customization'->>'primaryColor' IS NOT NULL AND
       NOT (NEW.settings->'customization'->>'primaryColor' ~ '^#[0-9a-fA-F]{6}$') THEN
      RAISE EXCEPTION 'primaryColor must be a valid hex color';
    END IF;

    -- Validate logo URL format
    IF NEW.settings->'customization'->>'logo' IS NOT NULL AND
       NOT (NEW.settings->'customization'->>'logo' ~ '^https?://') THEN
      RAISE EXCEPTION 'logo must be a valid URL';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for settings validation
CREATE TRIGGER validate_church_settings_trigger
  BEFORE INSERT OR UPDATE ON churches
  FOR EACH ROW
  EXECUTE FUNCTION validate_church_settings();

-- Add comment for documentation
COMMENT ON TABLE churches IS 'Churches managed by the platform';
COMMENT ON COLUMN churches.settings IS 'JSON object containing church-specific settings including features and customization options';
COMMENT ON COLUMN churches.subscription_status IS 'Church subscription status: pending, active, suspended, or cancelled';
  