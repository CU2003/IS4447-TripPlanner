// fills the db with some sample trips and activites if its empty
import { db } from './client';
import { users, categories, trips, activities, targets } from './schema';

export async function seedIfEmpty() {
  // bail out early if theres already data in the db
  const existing = await db.select().from(users);
  if (existing.length > 0) return;

  const now = new Date().toISOString();

  const [user] = await db
    .insert(users)
    .values({ name: 'Demo User', email: 'demo@example.com', password: 'password123', createdAt: now })
    .returning();

  const insertedCategories = await db
    .insert(categories)
    .values([
      { userId: user.id, name: 'Sightseeing', color: '#E74C3C', icon: 'binoculars', createdAt: now },
      { userId: user.id, name: 'Outdoor', color: '#27AE60', icon: 'walk', createdAt: now },
      { userId: user.id, name: 'Food & Drink', color: '#F39C12', icon: 'restaurant', createdAt: now },
      { userId: user.id, name: 'Transport', color: '#3498DB', icon: 'bus', createdAt: now },
      { userId: user.id, name: 'Accommodation', color: '#9B59B6', icon: 'bed', createdAt: now },
    ])
    .returning();

  const catId = (name: string) => insertedCategories.find((c) => c.name === name)!.id;

  const insertedTrips = await db
    .insert(trips)
    .values([
      { userId: user.id, name: 'Paris Spring Break', destination: 'Paris, France', startDate: '2026-03-10', endDate: '2026-03-17', notes: 'Spring holiday in the city of lights', createdAt: now },
      { userId: user.id, name: 'London Weekend', destination: 'London, UK', startDate: '2026-04-01', endDate: '2026-04-06', notes: 'Quick city break to London', createdAt: now },
      { userId: user.id, name: 'Barcelona Getaway', destination: 'Barcelona, Spain', startDate: '2026-05-15', endDate: '2026-05-22', notes: 'Sun, culture and tapas', createdAt: now },
    ])
    .returning();

  const tripId = (name: string) => insertedTrips.find((t) => t.name === name)!.id;

  await db.insert(activities).values([
    // Paris
    { tripId: tripId('Paris Spring Break'), categoryId: catId('Sightseeing'), userId: user.id, name: 'Eiffel Tower', date: '2026-03-10', duration: 180, count: 1, createdAt: now },
    { tripId: tripId('Paris Spring Break'), categoryId: catId('Outdoor'), userId: user.id, name: 'Seine Boat Tour', date: '2026-03-10', duration: 90, count: 1, createdAt: now },
    { tripId: tripId('Paris Spring Break'), categoryId: catId('Food & Drink'), userId: user.id, name: 'Café de Flore Breakfast', date: '2026-03-11', duration: 60, count: 1, createdAt: now },
    { tripId: tripId('Paris Spring Break'), categoryId: catId('Sightseeing'), userId: user.id, name: 'Louvre Museum', date: '2026-03-11', duration: 240, count: 1, createdAt: now },
    { tripId: tripId('Paris Spring Break'), categoryId: catId('Sightseeing'), userId: user.id, name: 'Palace of Versailles', date: '2026-03-12', duration: 300, count: 1, createdAt: now },
    { tripId: tripId('Paris Spring Break'), categoryId: catId('Outdoor'), userId: user.id, name: 'Montmartre Walk', date: '2026-03-12', duration: 120, count: 1, createdAt: now },
    { tripId: tripId('Paris Spring Break'), categoryId: catId('Sightseeing'), userId: user.id, name: 'Arc de Triomphe', date: '2026-03-13', duration: 60, count: 1, createdAt: now },
    { tripId: tripId('Paris Spring Break'), categoryId: catId('Food & Drink'), userId: user.id, name: 'Fine Dining at Le Jules Verne', date: '2026-03-13', duration: 120, count: 1, createdAt: now },
    { tripId: tripId('Paris Spring Break'), categoryId: catId('Outdoor'), userId: user.id, name: 'Day Trip to Giverny', date: '2026-03-14', duration: 360, count: 1, createdAt: now },
    { tripId: tripId('Paris Spring Break'), categoryId: catId('Sightseeing'), userId: user.id, name: "Musée d'Orsay", date: '2026-03-15', duration: 180, count: 1, createdAt: now },
    { tripId: tripId('Paris Spring Break'), categoryId: catId('Food & Drink'), userId: user.id, name: 'Champs-Élysées Lunch', date: '2026-03-15', duration: 90, count: 1, createdAt: now },
    { tripId: tripId('Paris Spring Break'), categoryId: catId('Food & Drink'), userId: user.id, name: 'Farewell Dinner', date: '2026-03-16', duration: 120, count: 1, createdAt: now },
    // London
    { tripId: tripId('London Weekend'), categoryId: catId('Sightseeing'), userId: user.id, name: 'Tower of London', date: '2026-04-01', duration: 180, count: 1, createdAt: now },
    { tripId: tripId('London Weekend'), categoryId: catId('Outdoor'), userId: user.id, name: 'Thames Riverside Walk', date: '2026-04-02', duration: 120, count: 1, createdAt: now },
    { tripId: tripId('London Weekend'), categoryId: catId('Sightseeing'), userId: user.id, name: 'British Museum', date: '2026-04-02', duration: 240, count: 1, createdAt: now },
    { tripId: tripId('London Weekend'), categoryId: catId('Food & Drink'), userId: user.id, name: 'Borough Market', date: '2026-04-03', duration: 90, count: 1, createdAt: now },
    { tripId: tripId('London Weekend'), categoryId: catId('Outdoor'), userId: user.id, name: 'Hyde Park Stroll', date: '2026-04-03', duration: 90, count: 1, createdAt: now },
    { tripId: tripId('London Weekend'), categoryId: catId('Sightseeing'), userId: user.id, name: 'Buckingham Palace', date: '2026-04-04', duration: 60, count: 1, createdAt: now },
    { tripId: tripId('London Weekend'), categoryId: catId('Sightseeing'), userId: user.id, name: 'West End Show', date: '2026-04-05', duration: 180, count: 1, createdAt: now },
    { tripId: tripId('London Weekend'), categoryId: catId('Food & Drink'), userId: user.id, name: 'Traditional Pub Dinner', date: '2026-04-05', duration: 120, count: 1, createdAt: now },
    // Barcelona
    { tripId: tripId('Barcelona Getaway'), categoryId: catId('Sightseeing'), userId: user.id, name: 'Sagrada Família', date: '2026-05-15', duration: 180, count: 1, createdAt: now },
    { tripId: tripId('Barcelona Getaway'), categoryId: catId('Sightseeing'), userId: user.id, name: 'Gothic Quarter Tour', date: '2026-05-16', duration: 120, count: 1, createdAt: now },
    { tripId: tripId('Barcelona Getaway'), categoryId: catId('Outdoor'), userId: user.id, name: 'Barceloneta Beach', date: '2026-05-17', duration: 240, count: 1, createdAt: now },
    { tripId: tripId('Barcelona Getaway'), categoryId: catId('Food & Drink'), userId: user.id, name: 'La Boqueria Market', date: '2026-05-18', duration: 60, count: 1, createdAt: now },
  ]);

  await db.insert(targets).values([
    { userId: user.id, tripId: tripId('Paris Spring Break'), categoryId: null, type: 'weekly', metric: 'duration', value: 600, createdAt: now },
    { userId: user.id, tripId: tripId('Paris Spring Break'), categoryId: catId('Sightseeing'), type: 'weekly', metric: 'count', value: 3, createdAt: now },
    { userId: user.id, tripId: tripId('London Weekend'), categoryId: null, type: 'weekly', metric: 'duration', value: 480, createdAt: now },
    { userId: user.id, tripId: null, categoryId: catId('Food & Drink'), type: 'monthly', metric: 'count', value: 5, createdAt: now },
    { userId: user.id, tripId: null, categoryId: null, type: 'monthly', metric: 'duration', value: 3000, createdAt: now },
  ]);
}
