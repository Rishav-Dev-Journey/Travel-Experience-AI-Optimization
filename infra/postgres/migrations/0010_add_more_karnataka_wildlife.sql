-- Add more wildlife destinations near Bengaluru (Karnataka region)

-- Nagarhole National Park (Rajiv Gandhi National Park) - 220km from Bengaluru
INSERT INTO destinations (id, name, country, description, image_url, interests, budget_min, budget_max, ideal_days_min, ideal_days_max, best_months, transport_modes, highlights, price_per_person, latitude, longitude)
VALUES (
  gen_random_uuid(),
  'Nagarhole National Park',
  'India',
  'Rich wildlife sanctuary in Karnataka with tigers, elephants, and leopards. Part of the Nilgiri Biosphere Reserve, just 220km from Bengaluru.',
  'https://images.unsplash.com/photo-1549366021-9f761d450615?w=800',
  ARRAY['Wildlife', 'Nature', 'Adventure'],
  6000,
  13000,
  2,
  3,
  ARRAY[10, 11, 12, 1, 2, 3, 4],
  ARRAY['road', 'bus'],
  ARRAY['Tiger reserve', 'Elephant herds', 'Jungle safari', 'Bird watching', 'Kabini river'],
  8000,
  12.0000,
  76.0833
);

-- Bhadra Wildlife Sanctuary - 250km from Bengaluru
INSERT INTO destinations (id, name, country, description, image_url, interests, budget_min, budget_max, ideal_days_min, ideal_days_max, best_months, transport_modes, highlights, price_per_person, latitude, longitude)
VALUES (
  gen_random_uuid(),
  'Bhadra Wildlife Sanctuary',
  'India',
  'Scenic wildlife sanctuary in Chikmagalur district with tigers, leopards, and diverse birdlife. Perfect weekend getaway from Bengaluru.',
  'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=800',
  ARRAY['Wildlife', 'Nature', 'Mountains'],
  5500,
  11000,
  2,
  3,
  ARRAY[10, 11, 12, 1, 2, 3],
  ARRAY['road', 'bus'],
  ARRAY['Tiger sightings', 'Bhadra reservoir', 'Trekking trails', 'Bird sanctuary', 'Coffee plantations'],
  7500,
  13.5667,
  75.6167
);

-- Mudumalai National Park - 160km from Bengaluru
INSERT INTO destinations (id, name, country, description, image_url, interests, budget_min, budget_max, ideal_days_min, ideal_days_max, best_months, transport_modes, highlights, price_per_person, latitude, longitude)
VALUES (
  gen_random_uuid(),
  'Mudumalai National Park',
  'India',
  'Tamil Nadu wildlife sanctuary at the foothills of Nilgiris, closest to Bengaluru. Home to elephants, tigers, and gaur.',
  'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
  ARRAY['Wildlife', 'Nature', 'Adventure'],
  5000,
  10000,
  2,
  3,
  ARRAY[10, 11, 12, 1, 2, 3, 4, 5],
  ARRAY['road', 'bus'],
  ARRAY['Elephant camps', 'Safari rides', 'Tribal settlements', 'Moyar river', 'Dense forests'],
  6500,
  11.5833,
  76.5333
);

-- BR Hills (Biligiri Rangaswamy Temple Wildlife Sanctuary) - 180km from Bengaluru
INSERT INTO destinations (id, name, country, description, image_url, interests, budget_min, budget_max, ideal_days_min, ideal_days_max, best_months, transport_modes, highlights, price_per_person, latitude, longitude)
VALUES (
  gen_random_uuid(),
  'BR Hills Wildlife Sanctuary',
  'India',
  'Biligiri Rangaswamy Temple Wildlife Sanctuary in Karnataka. Excellent for wildlife spotting and trekking, very close to Bengaluru.',
  'https://images.unsplash.com/photo-1551244072-5d12893278ab?w=800',
  ARRAY['Wildlife', 'Nature', 'Adventure', 'Culture'],
  5000,
  9000,
  2,
  3,
  ARRAY[10, 11, 12, 1, 2, 3],
  ARRAY['road', 'bus'],
  ARRAY['Elephant corridor', 'Temple visit', 'Trekking', 'Tribal culture', 'Medicinal plants'],
  6000,
  11.9833,
  77.1333
);

-- Cauvery Wildlife Sanctuary - 120km from Bengaluru
INSERT INTO destinations (id, name, country, description, image_url, interests, budget_min, budget_max, ideal_days_min, ideal_days_max, best_months, transport_modes, highlights, price_per_person, latitude, longitude)
VALUES (
  gen_random_uuid(),
  'Cauvery Wildlife Sanctuary',
  'India',
  'Closest wildlife sanctuary to Bengaluru along the Cauvery river. Great for day trips and weekend getaways with family.',
  'https://images.unsplash.com/photo-1549366021-9f761d450615?w=800',
  ARRAY['Wildlife', 'Nature', 'Adventure'],
  4000,
  8000,
  1,
  2,
  ARRAY[10, 11, 12, 1, 2, 3, 4],
  ARRAY['road', 'bus'],
  ARRAY['River rafting', 'Fishing camps', 'Crocodile sightings', 'Bird watching', 'Coracle rides'],
  5000,
  12.3167,
  77.2833
);

-- Ranganathittu Bird Sanctuary - 130km from Bengaluru
INSERT INTO destinations (id, name, country, description, image_url, interests, budget_min, budget_max, ideal_days_min, ideal_days_max, best_months, transport_modes, highlights, price_per_person, latitude, longitude)
VALUES (
  gen_random_uuid(),
  'Ranganathittu Bird Sanctuary',
  'India',
  'Famous bird sanctuary near Mysore, perfect day trip from Bengaluru. Home to migratory birds and crocodiles.',
  'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800',
  ARRAY['Wildlife', 'Nature', 'Culture'],
  3000,
  6000,
  1,
  2,
  ARRAY[11, 12, 1, 2, 3, 4],
  ARRAY['road', 'bus'],
  ARRAY['Migratory birds', 'Boat rides', 'Photography', 'Crocodiles', 'River islands'],
  4000,
  12.4167,
  76.6833
);
