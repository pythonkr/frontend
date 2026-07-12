export const resourceLabel = (o: {
  name_ko?: string | null;
  name_en?: string | null;
  title_ko?: string | null;
  title_en?: string | null;
  str_repr: string;
}): string => o.name_ko || o.title_ko || o.name_en || o.title_en || o.str_repr;
