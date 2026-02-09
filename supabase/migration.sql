-- ============================================================
-- Tonnage Supabase Migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- User Profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  last_synced_at TIMESTAMPTZ,
  settings      JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "insert_own_profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "update_own_profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Workouts
CREATE TABLE IF NOT EXISTS public.workouts (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  local_id      BIGINT,
  name          TEXT NOT NULL,
  notes         TEXT,
  start_time    BIGINT NOT NULL,
  date          BIGINT NOT NULL,
  duration_ms   BIGINT NOT NULL,
  exercises     JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  deleted_at    TIMESTAMPTZ
);

CREATE INDEX idx_workouts_user_date ON public.workouts(user_id, date DESC) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_workouts_user_local ON public.workouts(user_id, local_id) WHERE deleted_at IS NULL;

ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_workouts" ON public.workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_workouts" ON public.workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_workouts" ON public.workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_workouts" ON public.workouts FOR DELETE USING (auth.uid() = user_id);

-- Exercises
CREATE TABLE IF NOT EXISTS public.exercises (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  local_id      BIGINT,
  name          TEXT NOT NULL,
  body_part     TEXT NOT NULL,
  category      TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  deleted_at    TIMESTAMPTZ
);

CREATE INDEX idx_exercises_user ON public.exercises(user_id) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_exercises_user_name ON public.exercises(user_id, name) WHERE deleted_at IS NULL;

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_exercises" ON public.exercises FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_exercises" ON public.exercises FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_exercises" ON public.exercises FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_exercises" ON public.exercises FOR DELETE USING (auth.uid() = user_id);

-- Folders
CREATE TABLE IF NOT EXISTS public.folders (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  local_id      TEXT,
  name          TEXT NOT NULL,
  parent_id     TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  deleted_at    TIMESTAMPTZ
);

CREATE INDEX idx_folders_user ON public.folders(user_id) WHERE deleted_at IS NULL;

ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_folders" ON public.folders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_folders" ON public.folders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_folders" ON public.folders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_folders" ON public.folders FOR DELETE USING (auth.uid() = user_id);

-- Templates
CREATE TABLE IF NOT EXISTS public.templates (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  local_id      BIGINT,
  name          TEXT NOT NULL,
  folder_id     TEXT,
  estimated_time INT,
  notes         TEXT,
  exercises     JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  deleted_at    TIMESTAMPTZ
);

CREATE INDEX idx_templates_user ON public.templates(user_id) WHERE deleted_at IS NULL;

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_templates" ON public.templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_templates" ON public.templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_templates" ON public.templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_templates" ON public.templates FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Done. Configure auth providers in Dashboard → Authentication
-- ============================================================
