-- Add wildlife-specific destinations
INSERT INTO destinations (id, name, country, description, image_url, interests, budget_min, budget_max, ideal_days_min, ideal_days_max, best_months, transport_modes, highlights, price_per_person) VALUES

-- Jim Corbett National Park
(gen_random_uuid(), 'Jim Corbett National Park', 'India', 'India''s oldest national park, home to Bengal tigers, elephants, and diverse wildlife in the Himalayan foothills.', 'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=900&q=80', '{Wildlife,Adventure,Nature}', 8000, 35000, 2, 4, '{11,12,1,2,3,4,5}', '{road,bus}', '{Tiger Safari,Elephant Sighting,Dhikala Zone,Bird Watching}', 9000),

-- Ranthambore National Park
(gen_random_uuid(), 'Ranthambore National Park', 'India', 'Famous tiger reserve with ancient fort ruins, offering excellent wildlife photography and tiger sightings.', 'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=900&q=80', '{Wildlife,Adventure,Culture}', 10000, 45000, 2, 4, '{10,11,12,1,2,3,4}', '{air,train,road}', '{Tiger Sightings,Ranthambore Fort,Jeep Safari,Leopard Spotting}', 11000),

-- Kaziranga National Park
(gen_random_uuid(), 'Kaziranga National Park', 'India', 'UNESCO World Heritage Site, home to two-thirds of the world''s one-horned rhinoceros population.', 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&w=900&q=80', '{Wildlife,Nature,Adventure}', 12000, 50000, 3, 5, '{11,12,1,2,3,4}', '{air,road}', '{One-Horned Rhino,Elephant Safari,Bird Watching,Brahmaputra River}', 13000),

-- Bandhavgarh National Park
(gen_random_uuid(), 'Bandhavgarh National Park', 'India', 'Highest density of Bengal tigers in India, ancient fort, and rich biodiversity in Madhya Pradesh.', 'https://images.unsplash.com/photo-1551316679-9c6ae9dec224?auto=format&fit=crop&w=900&q=80', '{Wildlife,Adventure}', 9000, 40000, 2, 4, '{10,11,12,1,2,3,4}', '{air,train,road}', '{Tiger Reserve,Bandhavgarh Fort,White Tigers,Jungle Safari}', 10000),

-- Periyar Wildlife Sanctuary
(gen_random_uuid(), 'Periyar Wildlife Sanctuary', 'India', 'Scenic wildlife sanctuary in Kerala with elephants, tigers, and boat safaris on Periyar Lake.', 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&w=900&q=80', '{Wildlife,Nature,Wellness}', 10000, 40000, 2, 4, '{9,10,11,12,1,2,3,4}', '{air,train,road}', '{Elephant Herds,Boat Safari,Spice Plantations,Tiger Trail}', 11000),

-- Sundarbans National Park
(gen_random_uuid(), 'Sundarbans National Park', 'India', 'World''s largest mangrove forest, home to Royal Bengal tigers, crocodiles, and unique ecosystem.', 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=900&q=80', '{Wildlife,Nature,Adventure}', 8000, 35000, 2, 3, '{9,10,11,12,1,2,3}', '{road,water}', '{Royal Bengal Tiger,Mangrove Forest,Boat Safari,Crocodile Spotting}', 9000),

-- Gir National Park
(gen_random_uuid(), 'Gir National Park', 'India', 'Only natural habitat of Asiatic lions in the world, located in Gujarat with diverse wildlife.', 'https://images.unsplash.com/photo-1534188753412-5de0eddd6e8a?auto=format&fit=crop&w=900&q=80', '{Wildlife,Adventure}', 10000, 45000, 2, 4, '{10,11,12,1,2,3,4}', '{air,train,road}', '{Asiatic Lions,Jeep Safari,Leopard Sightings,Bird Sanctuary}', 12000),

-- Kanha National Park
(gen_random_uuid(), 'Kanha National Park', 'India', 'Inspiration for Jungle Book, home to tigers, barasingha deer, and stunning sal forests.', 'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=900&q=80', '{Wildlife,Nature,Adventure}', 9000, 40000, 2, 4, '{10,11,12,1,2,3,4}', '{air,train,road}', '{Tiger Sightings,Barasingha Deer,Jungle Safari,Bamni Dadar}', 10000)

ON CONFLICT DO NOTHING;
