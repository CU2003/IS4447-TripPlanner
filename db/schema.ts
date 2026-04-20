import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: text('created_at').notNull(),
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  colour: text('colour').notNull(),
  icon: text('icon'),
  userId: integer('user_id').notNull().references(() => users.id),
});

export const trips = sqliteTable('trips', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  destination: text('destination').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  notes: text('notes'),
  userId: integer('user_id').notNull().references(() => users.id),
});

export const activities = sqliteTable('activities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tripId: integer('trip_id').notNull().references(() => trips.id),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  name: text('name').notNull(),
  date: text('date').notNull(),
  duration: integer('duration'),
  count: integer('count').notNull().default(1),
  notes: text('notes'),
});

export const targets = sqliteTable('targets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  tripId: integer('trip_id').references(() => trips.id),
  categoryId: integer('category_id').references(() => categories.id),
  type: text('type').notNull(),
  metric: text('metric').notNull(),
  value: integer('value').notNull(),
});
