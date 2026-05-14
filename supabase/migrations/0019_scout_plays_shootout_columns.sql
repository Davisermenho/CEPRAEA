-- migration: 0019_scout_plays_shootout_columns
-- Add shootout detail columns to scout_plays

alter table public.scout_plays
  add column if not exists shootout_type text,
  add column if not exists shootout_result text,
  add column if not exists shootout_decision text,
  add column if not exists shootout_execution text;
