-- Add latitude and longitude columns for proximity-based recommendations
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add Bandipur National Park (close to Bengaluru)
INSERT INTO destinations (id, name, country, description, image_url, interests, budget_min, budget_max, ideal_days_min, ideal_days_max, best_months, transport_modes, highlights, price_per_person, latitude, longitude)
VALUES (
  gen_random_uuid(),
  'Bandipur National Park',
  'India',
  'Tiger reserve in Karnataka with rich biodiversity, just 220km from Bengaluru. Perfect weekend getaway for wildlife enthusiasts.',
  'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800',
  ARRAY['Wildlife', 'Nature', 'Adventure'],
  5000,
  12000,
  2,
  3,
  ARRAY[10, 11, 12, 1, 2, 3],
  ARRAY['road', 'bus'],
  ARRAY['Tiger sightings', 'Elephant herds', 'Safari drives', 'Bird watching', 'Scenic landscapes'],
  7000,
  11.6667,
  76.6833
);

-- Update existing destinations with coordinates (major Indian cities and destinations)
UPDATE destinations SET latitude = 15.2993, longitude = 74.1240 WHERE name = 'Goa';
UPDATE destinations SET latitude = 32.2190, longitude = 76.3234 WHERE name = 'Manali';
UPDATE destinations SET latitude = 25.3176, longitude = 82.9739 WHERE name = 'Varanasi';
UPDATE destinations SET latitude = 30.0869, longitude = 78.2676 WHERE name = 'Rishikesh';
UPDATE destinations SET latitude = 19.0760, longitude = 72.8777 WHERE name = 'Mumbai';
UPDATE destinations SET latitude = 10.8505, longitude = 76.2711 WHERE name = 'Kerala';
UPDATE destinations SET latitude = 27.1767, longitude = 78.0081 WHERE name = 'Agra';
UPDATE destinations SET latitude = 26.9124, longitude = 75.7873 WHERE name = 'Jaipur';
UPDATE destinations SET latitude = 34.0837, longitude = 74.7973 WHERE name = 'Ladakh';
UPDATE destinations SET latitude = 11.9416, longitude = 79.8083 WHERE name = 'Pondicherry';
UPDATE destinations SET latitude = 23.0225, longitude = 72.5714 WHERE name = 'Ahmedabad';
UPDATE destinations SET latitude = 22.5726, longitude = 88.3639 WHERE name = 'Kolkata';
UPDATE destinations SET latitude = 17.3850, longitude = 78.4867 WHERE name = 'Hyderabad';
UPDATE destinations SET latitude = 13.0827, longitude = 80.2707 WHERE name = 'Chennai';

-- Wildlife destinations
UPDATE destinations SET latitude = 29.4667, longitude = 79.0667 WHERE name = 'Jim Corbett National Park';
UPDATE destinations SET latitude = 26.0173, longitude = 76.5026 WHERE name = 'Ranthambore National Park';
UPDATE destinations SET latitude = 26.5775, longitude = 93.1711 WHERE name = 'Kaziranga National Park';
UPDATE destinations SET latitude = 23.6667, longitude = 81.0167 WHERE name = 'Bandhavgarh National Park';
UPDATE destinations SET latitude = 9.4667, longitude = 77.2667 WHERE name = 'Periyar Wildlife Sanctuary';
UPDATE destinations SET latitude = 21.9497, longitude = 88.9375 WHERE name = 'Sundarbans National Park';
UPDATE destinations SET latitude = 21.1333, longitude = 70.7833 WHERE name = 'Gir National Park';
UPDATE destinations SET latitude = 22.3333, longitude = 80.6167 WHERE name = 'Kanha National Park';
UPDATE destinations SET latitude = 12.4167, longitude = 75.7333 WHERE name = 'Coorg';

-- International destinations
UPDATE destinations SET latitude = 13.7563, longitude = 100.5018 WHERE name = 'Bangkok';
UPDATE destinations SET latitude = -8.3405, longitude = 115.0920 WHERE name = 'Bali';
UPDATE destinations SET latitude = 25.2048, longitude = 55.2708 WHERE name = 'Dubai';
UPDATE destinations SET latitude = 1.3521, longitude = 103.8198 WHERE name = 'Singapore';
UPDATE destinations SET latitude = 3.2028, longitude = 73.2207 WHERE name = 'Maldives';
UPDATE destinations SET latitude = 35.6762, longitude = 139.6503 WHERE name = 'Tokyo';
UPDATE destinations SET latitude = 48.8566, longitude = 2.3522 WHERE name = 'Paris';
UPDATE destinations SET latitude = 51.5074, longitude = -0.1278 WHERE name = 'London';
UPDATE destinations SET latitude = 40.7128, longitude = -74.0060 WHERE name = 'New York';
UPDATE destinations SET latitude = 46.8182, longitude = 8.2275 WHERE name = 'Swiss Alps';
UPDATE destinations SET latitude = -33.8688, longitude = 151.2093 WHERE name = 'Sydney';
UPDATE destinations SET latitude = 41.9028, longitude = 12.4964 WHERE name = 'Rome';
UPDATE destinations SET latitude = 25.2760, longitude = 51.5200 WHERE name = 'Doha';
UPDATE destinations SET latitude = 43.6532, longitude = -79.3832 WHERE name = 'Toronto';
UPDATE destinations SET latitude = 6.9271, longitude = 79.8612 WHERE name = 'Colombo';

-- Major Indian source cities (for distance calculation)
-- Bengaluru: 12.9716, 77.5946
-- Delhi: 28.7041, 77.1025
-- Mumbai: 19.0760, 72.8777
-- Chennai: 13.0827, 80.2707
-- Kolkata: 22.5726, 88.3639
-- Hyderabad: 17.3850, 78.4867
