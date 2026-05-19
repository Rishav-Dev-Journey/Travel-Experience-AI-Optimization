create table if not exists destinations (
  id uuid primary key,
  name text not null,
  country text not null default 'India',
  description text not null,
  image_url text not null,
  interests text[] not null default '{}',
  budget_min integer not null,
  budget_max integer not null,
  ideal_days_min integer not null,
  ideal_days_max integer not null,
  best_months integer[] not null default '{}',
  transport_modes text[] not null default '{}',
  highlights text[] not null default '{}'
);

insert into destinations (id, name, country, description, image_url, interests, budget_min, budget_max, ideal_days_min, ideal_days_max, best_months, transport_modes, highlights) values
(gen_random_uuid(), 'Goa', 'India', 'Sun-soaked beaches, vibrant nightlife, Portuguese heritage and fresh seafood on India''s favourite coast.', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80', '{"Beach","Nightlife","Food"}', 8000, 50000, 3, 7, '{11,12,1,2,3}', '{"air","train","road","bus"}', '{"Baga Beach","Dudhsagar Falls","Old Goa Churches","Anjuna Flea Market"}'),
(gen_random_uuid(), 'Manali', 'India', 'Snow-capped peaks, adventure sports, river valleys and the gateway to Spiti and Leh.', 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=900&q=80', '{"Mountains","Adventure"}', 10000, 60000, 4, 8, '{5,6,7,8,9}', '{"air","road","bus"}', '{"Rohtang Pass","Solang Valley","Hadimba Temple","Old Manali"}'),
(gen_random_uuid(), 'Varanasi', 'India', 'One of the world''s oldest cities — ancient ghats, spiritual rituals and rich cultural heritage on the Ganges.', 'https://images.unsplash.com/photo-1561361058-c24e01238a46?auto=format&fit=crop&w=900&q=80', '{"Culture","Wellness"}', 5000, 30000, 3, 5, '{10,11,12,1,2,3}', '{"air","train","road"}', '{"Dashashwamedh Ghat","Kashi Vishwanath Temple","Sarnath","Evening Aarti"}'),
(gen_random_uuid(), 'Rishikesh', 'India', 'The adventure capital of India — white water rafting, bungee jumping, yoga and the Himalayas.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80', '{"Adventure","Wellness"}', 6000, 35000, 3, 6, '{3,4,5,9,10,11}', '{"air","train","road","bus"}', '{"River Rafting","Laxman Jhula","Bungee Jumping","Yoga Ashrams"}'),
(gen_random_uuid(), 'Mumbai', 'India', 'India''s financial capital — iconic street food, Bollywood culture, colonial architecture and coastal vibes.', 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=900&q=80', '{"Food","Culture","Nightlife"}', 10000, 80000, 3, 5, '{10,11,12,1,2,3}', '{"air","train","road","bus"}', '{"Marine Drive","Dharavi","Gateway of India","Juhu Beach"}'),
(gen_random_uuid(), 'Kerala', 'India', 'God''s own country — serene backwaters, Ayurveda retreats, lush hill stations and pristine beaches.', 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=80', '{"Wellness","Beach","Culture"}', 12000, 70000, 5, 10, '{9,10,11,12,1,2}', '{"air","train","road","water"}', '{"Alleppey Backwaters","Munnar Tea Gardens","Kovalam Beach","Periyar Wildlife"}'),
(gen_random_uuid(), 'Jaipur', 'India', 'The Pink City — majestic forts, royal palaces, vibrant bazaars and Rajasthani cuisine.', 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=900&q=80', '{"Culture","Food"}', 7000, 45000, 3, 5, '{10,11,12,1,2,3}', '{"air","train","road","bus"}', '{"Amber Fort","Hawa Mahal","City Palace","Jantar Mantar"}'),
(gen_random_uuid(), 'Andaman Islands', 'India', 'Crystal-clear waters, pristine coral reefs, white sand beaches and rich marine biodiversity.', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80', '{"Beach","Adventure","Wellness"}', 20000, 100000, 5, 8, '{10,11,12,1,2,3,4}', '{"air","water"}', '{"Radhanagar Beach","Cellular Jail","Scuba Diving","Neil Island"}'),
(gen_random_uuid(), 'Ladakh', 'India', 'High-altitude desert, ancient monasteries, dramatic landscapes and the world''s highest motorable roads.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80', '{"Adventure","Mountains","Culture"}', 20000, 90000, 7, 14, '{6,7,8,9}', '{"air","road"}', '{"Pangong Lake","Nubra Valley","Khardung La","Thiksey Monastery"}'),
(gen_random_uuid(), 'Coorg', 'India', 'Scotland of India — misty coffee plantations, waterfalls, wildlife and cool mountain air.', 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=900&q=80', '{"Wellness","Mountains","Wildlife"}', 8000, 40000, 3, 5, '{10,11,12,1,2,3}', '{"road","bus"}', '{"Abbey Falls","Raja''s Seat","Coffee Estates","Nagarhole Wildlife"}'),
(gen_random_uuid(), 'Kolkata', 'India', 'City of Joy — colonial architecture, literary culture, Durga Puja grandeur and iconic street food.', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80', '{"Culture","Food"}', 5000, 30000, 3, 5, '{10,11,12,1,2}', '{"air","train","road","bus"}', '{"Victoria Memorial","Howrah Bridge","Park Street","Kumartuli"}'),
(gen_random_uuid(), 'Spiti Valley', 'India', 'Remote high-altitude cold desert with ancient monasteries, dramatic landscapes and starlit skies.', 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=900&q=80', '{"Adventure","Mountains"}', 15000, 60000, 7, 12, '{6,7,8,9}', '{"road"}', '{"Key Monastery","Chandratal Lake","Pin Valley","Kaza Town"}')
on conflict do nothing;
