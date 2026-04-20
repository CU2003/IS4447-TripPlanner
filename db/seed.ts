import { db } from './client';
import { users, categories, trips, activities, targets } from './schema';

export async function seedIfEmpty() {
  const existing = await db.select().from(users);
  if (existing.length > 0) return;

  const [user] = await db
    .insert(users)
    .values({
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'password123',
      createdAt: '2026-01-01',
    })
    .returning();

  const insertedCategories = await db
    .insert(categories)
    .values([
      { name: 'Sightseeing', colour: '#E74C3C', icon: 'binoculars', userId: user.id },
      { name: 'Outdoor', colour: '#27AE60', icon: 'walk', userId: user.id },
      { name: 'Food & Drink', colour: '#F39C12', icon: 'restaurant', userId: user.id },
      { name: 'Transport', colour: '#3498DB', icon: 'bus', userId: user.id },
      { name: 'Accommodation', colour: '#9B59B6', icon: 'bed', userId: user.id },
    ])
    .returning();

  const catId = (name: string) =>
    insertedCategories.find((c) => c.name === name)!.id;

  const insertedTrips = await db
    .insert(trips)
    .values([
      {
        name: 'Paris Spring Break',
        destination: 'Paris, France',
        startDate: '2026-03-10',
        endDate: '2026-03-17',
        notes: 'Spring holiday in the city of lights',
        userId: user.id,
      },
      {
        name: 'London Weekend',
        destination: 'London, UK',
        startDate: '2026-04-01',
        endDate: '2026-04-06',
        notes: 'Quick city break to London',
        userId: user.id,
      },
      {
        name: 'Barcelona Getaway',
        destination: 'Barcelona, Spain',
        startDate: '2026-05-15',
        endDate: '2026-05-22',
        notes: 'Sun, culture and tapas',
        userId: user.id,
      },
    ])
    .returning();

  const tripId = (name: string) =>
    insertedTrips.find((t) => t.name === name)!.id;

  await db.insert(activities).values([
    // Paris
    { tripId: tripId('Paris Spring Break'), categoryId: catId('Sightseeing'), name: 'Eiffel Tower', date: '2026-03-10', duration: 180, count: 1 },
    { tripId: tripId('Paris Spring Break'), categoryId: catId('Outdoor'), name: 'Seine Boat Tour', date: '2026-03-10', duration: 90, count: 1 },
    { tripId: tripId('Paris Spring Break'), categoryId: catId('Food & Drink'), name: 'Café de Flore Breakfast', date: '2026-03-11', duration: 60, count: 1 },
    { tripId: tripId('Paris Spring Break'), categoryId: catId('Sightseeing'), name: 'Louvre Museum', date: '2026-03-11', duration: 240, count: 1 },
    { tripId: tripId('Paris Spring Break'), categoryId: catId('Sightseeing'), name: 'Palace of Versailles', date: '2026-03-12', duration: 300, count: 1 },
    { tripId: tripId('Paris Spring Break'), categoryId: catId('Outdoor'), name: 'Montmartre Walk', date: '2026-03-12', duration: 120, count: 1 },
    { tripId: tripId('Paris Spring Break'), categoryId: catId('Sightseeing'), name: 'Arc de Triomphe', date: '2026-03-13', duration: 60, count: 1 },
    { tripId: tripId('Paris Spring Break'), categoryId: catId('Food & Drink'), name: 'Fine Dining at Le Jules Verne', date: '2026-03-13', duration: 120, count: 1 },
    { tripId: tripId('Paris Spring Break'), categoryId: catId('Outdoor'), name: 'Day Trip to Giverny', date: '2026-03-14', duration: 360, count: 1 },
    { tripId: tripId('Paris Spring Break'), categoryId: catId('Sightseeing'), name: "Musée d'Orsay", date: '2026-03-15', duration: 180, count: 1 },
    { tripId: tripId('Paris Spring Break'), categoryId: catId('Food & Drink'), name: 'Champs-Élysées Lunch', date: '2026-03-15', duration: 90, count: 1 },
    { tripId: tripId('Paris Spring Break'), categoryId: catId('Food & Drink'), name: 'Farewell Dinner', date: '2026-03-16', duration: 120, count: 1 },

    // London
    { tripId: tripId('London Weekend'), categoryId: catId('Sightseeing'), name: 'Tower of London', date: '2026-04-01', duration: 180, count: 1 },
    { tripId: tripId('London Weekend'), categoryId: catId('Outdoor'), name: 'Thames Riverside Walk', date: '2026-04-02', duration: 120, count: 1 },
    { tripId: tripId('London Weekend'), categoryId: catId('Sightseeing'), name: 'British Museum', date: '2026-04-02', duration: 240, count: 1 },
    { tripId: tripId('London Weekend'), categoryId: catId('Food & Drink'), name: 'Borough Market', date: '2026-04-03', duration: 90, count: 1 },
    { tripId: tripId('London Weekend'), categoryId: catId('Outdoor'), name: 'Hyde Park Stroll', date: '2026-04-03', duration: 90, count: 1 },
    { tripId: tripId('London Weekend'), categoryId: catId('Sightseeing'), name: 'Buckingham Palace', date: '2026-04-04', duration: 60, count: 1 },
    { tripId: tripId('London Weekend'), categoryId: catId('Sightseeing'), name: 'West End Show', date: '2026-04-05', duration: 180, count: 1 },
    { tripId: tripId('London Weekend'), categoryId: catId('Food & Drink'), name: 'Traditional Pub Dinner', date: '2026-04-05', duration: 120, count: 1 },

    // Barcelona (planned)
    { tripId: tripId('Barcelona Getaway'), categoryId: catId('Sightseeing'), name: 'Sagrada Família', date: '2026-05-15', duration: 180, count: 1 },
    { tripId: tripId('Barcelona Getaway'), categoryId: catId('Sightseeing'), name: 'Gothic Quarter Tour', date: '2026-05-16', duration: 120, count: 1 },
    { tripId: tripId('Barcelona Getaway'), categoryId: catId('Outdoor'), name: 'Barceloneta Beach', date: '2026-05-17', duration: 240, count: 1 },
    { tripId: tripId('Barcelona Getaway'), categoryId: catId('Food & Drink'), name: 'La Boqueria Market', date: '2026-05-18', duration: 60, count: 1 },
  ]);

  await db.insert(targets).values([
    { userId: user.id, tripId: tripId('Paris Spring Break'), categoryId: null, type: 'weekly', metric: 'duration', value: 600 },
    { userId: user.id, tripId: tripId('Paris Spring Break'), categoryId: catId('Sightseeing'), type: 'weekly', metric: 'count', value: 3 },
    { userId: user.id, tripId: tripId('London Weekend'), categoryId: null, type: 'weekly', metric: 'duration', value: 480 },
    { userId: user.id, tripId: null, categoryId: catId('Food & Drink'), type: 'monthly', metric: 'count', value: 5 },
    { userId: user.id, tripId: null, categoryId: null, type: 'monthly', metric: 'duration', value: 3000 },
  ]);
}
