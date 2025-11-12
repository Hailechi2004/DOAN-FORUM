-- Fix gender values in profiles table to match ENUM('male','female','other','unspecified')
-- Convert any existing invalid values to lowercase

UPDATE profiles 
SET gender = LOWER(gender) 
WHERE gender IS NOT NULL 
  AND gender != '';

-- Set any invalid values to 'unspecified'
UPDATE profiles 
SET gender = 'unspecified'
WHERE gender NOT IN ('male', 'female', 'other', 'unspecified')
  OR gender IS NULL 
  OR gender = '';

-- Check the results
SELECT gender, COUNT(*) as count 
FROM profiles 
GROUP BY gender;
