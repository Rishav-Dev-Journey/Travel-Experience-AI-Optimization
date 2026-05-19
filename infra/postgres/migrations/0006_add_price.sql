-- Add price_per_person column to destinations table
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS price_per_person INTEGER;

-- Update existing destinations with estimated prices
UPDATE destinations SET price_per_person = 
  CASE 
    WHEN name = 'Goa' THEN 8000
    WHEN name = 'Manali' THEN 12000
    WHEN name = 'Varanasi' THEN 6000
    WHEN name = 'Rishikesh' THEN 7000
    WHEN name = 'Mumbai' THEN 15000
    WHEN name = 'Kerala' THEN 18000
    WHEN name = 'Jaipur' THEN 9000
    WHEN name = 'Andaman Islands' THEN 25000
    WHEN name = 'Ladakh' THEN 22000
    WHEN name = 'Coorg' THEN 10000
    WHEN name = 'Kolkata' THEN 7000
    WHEN name = 'Spiti Valley' THEN 20000
    ELSE 10000
  END
WHERE price_per_person IS NULL;
