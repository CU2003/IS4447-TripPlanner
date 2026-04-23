import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { Activity, Trip, Category } from '@/context/app-context';

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function exportActivitiesToCSV(
  activities: Activity[],
  trips: Trip[],
  categories: Category[]
): Promise<void> {
  const tripMap = new Map(trips.map((t) => [t.id, t]));
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const header = ['Date', 'Activity', 'Trip', 'Category', 'Duration (min)', 'Count', 'Notes'].join(',');

  const rows = activities.map((a) => {
    const trip = tripMap.get(a.tripId);
    const category = categoryMap.get(a.categoryId);
    return [
      escapeCSV(a.date),
      escapeCSV(a.name),
      escapeCSV(trip?.name),
      escapeCSV(category?.name),
      escapeCSV(a.duration),
      escapeCSV(a.count),
      escapeCSV(a.notes),
    ].join(',');
  });

  const csv = [header, ...rows].join('\n');
  const fileName = `tripplanner_export_${new Date().toISOString().split('T')[0]}.csv`;
  const fileUri = FileSystem.documentDirectory + fileName;

  await FileSystem.writeAsStringAsync(fileUri, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: 'Export Activities',
    });
  }
}
