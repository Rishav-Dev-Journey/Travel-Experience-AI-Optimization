-- Add international destinations with various budgets

-- Budget-Friendly International (₹30,000 - ₹80,000)
INSERT INTO destinations (id, name, country, description, image_url, interests, budget_min, budget_max, ideal_days_min, ideal_days_max, best_months, transport_modes, highlights, price_per_person) VALUES

(gen_random_uuid(), 'Bangkok', 'Thailand', 'Vibrant capital with golden temples, bustling markets, street food paradise, and exciting nightlife.', 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=900&q=80', '{Culture,Food,Nightlife}', 30000, 70000, 4, 7, '{11,12,1,2,3}', '{air}', '{Grand Palace,Floating Markets,Street Food,Wat Pho}', 35000),

(gen_random_uuid(), 'Bali', 'Indonesia', 'Tropical paradise with stunning beaches, ancient temples, rice terraces, and wellness retreats.', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80', '{Beach,Wellness,Culture}', 35000, 80000, 5, 10, '{4,5,6,7,8,9}', '{air}', '{Ubud Rice Terraces,Beach Clubs,Temples,Surfing}', 40000),

(gen_random_uuid(), 'Dubai', 'UAE', 'Futuristic city with world-class shopping, luxury hotels, desert safaris, and iconic skyscrapers.', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80', '{Culture,Adventure,Nightlife}', 50000, 150000, 4, 7, '{11,12,1,2,3}', '{air}', '{Burj Khalifa,Desert Safari,Dubai Mall,Palm Jumeirah}', 70000),

(gen_random_uuid(), 'Kathmandu', 'Nepal', 'Historic capital with ancient temples, vibrant culture, gateway to Himalayas, and trekking adventures.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80', '{Culture,Adventure,Mountains}', 25000, 60000, 4, 8, '{3,4,5,9,10,11}', '{air,road}', '{Pashupatinath Temple,Boudhanath Stupa,Trekking,Durbar Square}', 30000),

(gen_random_uuid(), 'Colombo', 'Sri Lanka', 'Coastal capital with colonial architecture, beautiful beaches, tea plantations, and wildlife safaris.', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80', '{Beach,Culture,Wildlife}', 30000, 75000, 5, 10, '{12,1,2,3,4}', '{air}', '{Galle Fort,Tea Plantations,Elephant Safari,Beaches}', 35000),

-- Mid-Range International (₹80,000 - ₹150,000)
(gen_random_uuid(), 'Singapore', 'Singapore', 'Modern city-state with futuristic architecture, world-class dining, gardens, and family attractions.', 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=80', '{Culture,Food,Nightlife}', 80000, 150000, 4, 7, '{1,2,3,4,5,6,7,8,9,10,11,12}', '{air}', '{Marina Bay Sands,Gardens by the Bay,Sentosa,Hawker Centers}', 90000),

(gen_random_uuid(), 'Maldives', 'Maldives', 'Tropical paradise with overwater villas, crystal-clear waters, coral reefs, and luxury resorts.', 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=900&q=80', '{Beach,Wellness,Adventure}', 100000, 300000, 5, 10, '{11,12,1,2,3,4}', '{air,water}', '{Overwater Villas,Snorkeling,Diving,Private Islands}', 150000),

(gen_random_uuid(), 'Istanbul', 'Turkey', 'Historic city bridging Europe and Asia with stunning mosques, bazaars, and rich Ottoman heritage.', 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=80', '{Culture,Food,Adventure}', 70000, 140000, 5, 8, '{4,5,6,9,10}', '{air}', '{Hagia Sophia,Blue Mosque,Grand Bazaar,Bosphorus Cruise}', 80000),

(gen_random_uuid(), 'Phuket', 'Thailand', 'Thailand''s largest island with stunning beaches, vibrant nightlife, water sports, and island hopping.', 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=900&q=80', '{Beach,Adventure,Nightlife}', 40000, 90000, 5, 10, '{11,12,1,2,3}', '{air}', '{Patong Beach,Phi Phi Islands,Diving,Beach Clubs}', 50000),

-- Luxury International (₹150,000+)
(gen_random_uuid(), 'Paris', 'France', 'City of lights with iconic landmarks, world-class museums, fine dining, and romantic ambiance.', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80', '{Culture,Food,Adventure}', 150000, 350000, 5, 10, '{4,5,6,9,10}', '{air}', '{Eiffel Tower,Louvre Museum,Notre-Dame,Seine River}', 180000),

(gen_random_uuid(), 'London', 'United Kingdom', 'Historic capital with royal palaces, world-class museums, diverse culture, and iconic landmarks.', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80', '{Culture,Food,Nightlife}', 180000, 400000, 5, 10, '{5,6,7,8,9}', '{air}', '{Big Ben,Buckingham Palace,British Museum,Tower Bridge}', 200000),

(gen_random_uuid(), 'New York', 'USA', 'The city that never sleeps with iconic skyline, Broadway shows, world-class dining, and culture.', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=900&q=80', '{Culture,Food,Nightlife,Adventure}', 200000, 500000, 5, 10, '{4,5,6,9,10}', '{air}', '{Statue of Liberty,Times Square,Central Park,Broadway}', 250000),

(gen_random_uuid(), 'Tokyo', 'Japan', 'Futuristic metropolis blending ancient temples, cutting-edge technology, anime culture, and cuisine.', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80', '{Culture,Food,Adventure}', 150000, 350000, 6, 12, '{3,4,5,9,10,11}', '{air}', '{Shibuya Crossing,Mount Fuji,Temples,Sushi Markets}', 170000),

(gen_random_uuid(), 'Swiss Alps', 'Switzerland', 'Majestic mountain paradise with skiing, hiking, scenic trains, chocolate, and pristine lakes.', 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=900&q=80', '{Mountains,Adventure,Wellness}', 200000, 500000, 7, 14, '{6,7,8,12,1,2}', '{air,train}', '{Skiing,Jungfraujoch,Scenic Trains,Mountain Hiking}', 250000),

(gen_random_uuid(), 'Santorini', 'Greece', 'Stunning Greek island with white-washed buildings, blue domes, sunsets, and Mediterranean cuisine.', 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=900&q=80', '{Beach,Culture,Wellness}', 120000, 280000, 5, 10, '{4,5,6,9,10}', '{air}', '{Oia Sunset,Caldera Views,Wine Tasting,Black Sand Beaches}', 150000)

ON CONFLICT DO NOTHING;
