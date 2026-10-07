-- Folder colors, nesting (max 2 levels), and brand-profile default folder link.
-- Applied remotely via Supabase MCP as chat_folders_color_nesting_brand.
-- RLS stays owner-scoped on chat_folders; conversation policies already check folder ownership.

ALTER TABLE public.chat_folders
  ADD COLUMN IF NOT EXISTS color text NOT NULL DEFAULT 'coral',
  ADD COLUMN IF NOT EXISTS parent_folder_id uuid NULL,
  ADD COLUMN IF NOT EXISTS brand_profile_id uuid NULL;

ALTER TABLE public.chat_folders
  DROP CONSTRAINT IF EXISTS chat_folders_color_allowed;

ALTER TABLE public.chat_folders
  ADD CONSTRAINT chat_folders_color_allowed
  CHECK (color = ANY (ARRAY[
    'coral'::text,
    'amber'::text,
    'lime'::text,
    'teal'::text,
    'sky'::text,
    'violet'::text,
    'rose'::text,
    'slate'::text
  ]));

ALTER TABLE public.chat_folders
  DROP CONSTRAINT IF EXISTS chat_folders_parent_folder_id_fkey;

ALTER TABLE public.chat_folders
  ADD CONSTRAINT chat_folders_parent_folder_id_fkey
  FOREIGN KEY (parent_folder_id)
  REFERENCES public.chat_folders(id)
  ON DELETE CASCADE;

ALTER TABLE public.chat_folders
  DROP CONSTRAINT IF EXISTS chat_folders_brand_profile_id_fkey;

ALTER TABLE public.chat_folders
  ADD CONSTRAINT chat_folders_brand_profile_id_fkey
  FOREIGN KEY (brand_profile_id)
  REFERENCES public.brand_profiles(id)
  ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS chat_folders_owner_brand_profile_uidx
  ON public.chat_folders (owner_user_id, brand_profile_id)
  WHERE brand_profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS chat_folders_owner_parent_idx
  ON public.chat_folders (owner_user_id, parent_folder_id);

CREATE OR REPLACE FUNCTION public.chat_folders_validate_nesting()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $fn$
DECLARE
  parent_owner uuid;
  parent_parent uuid;
  brand_owner uuid;
BEGIN
  IF NEW.parent_folder_id IS NOT NULL THEN
    IF NEW.id IS NOT NULL AND NEW.parent_folder_id = NEW.id THEN
      RAISE EXCEPTION 'Folder cannot be its own parent.';
    END IF;

    SELECT f.owner_user_id, f.parent_folder_id
      INTO parent_owner, parent_parent
    FROM public.chat_folders f
    WHERE f.id = NEW.parent_folder_id;

    IF parent_owner IS NULL THEN
      RAISE EXCEPTION 'Parent folder not found.';
    END IF;

    IF parent_owner <> NEW.owner_user_id THEN
      RAISE EXCEPTION 'Parent folder must belong to the same owner.';
    END IF;

    IF parent_parent IS NOT NULL THEN
      RAISE EXCEPTION 'Folders can only nest two levels deep.';
    END IF;

    IF NEW.id IS NOT NULL AND EXISTS (
      SELECT 1
      FROM public.chat_folders child
      WHERE child.parent_folder_id = NEW.id
    ) THEN
      RAISE EXCEPTION 'Cannot nest a folder that already has subfolders.';
    END IF;
  END IF;

  IF NEW.brand_profile_id IS NOT NULL THEN
    SELECT bp.owner_user_id
      INTO brand_owner
    FROM public.brand_profiles bp
    WHERE bp.id = NEW.brand_profile_id;

    IF brand_owner IS NULL THEN
      RAISE EXCEPTION 'Brand profile not found.';
    END IF;

    IF brand_owner <> NEW.owner_user_id THEN
      RAISE EXCEPTION 'Brand profile must belong to the same owner.';
    END IF;
  END IF;

  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS chat_folders_validate_nesting_trg ON public.chat_folders;

CREATE TRIGGER chat_folders_validate_nesting_trg
  BEFORE INSERT OR UPDATE OF parent_folder_id, brand_profile_id, owner_user_id
  ON public.chat_folders
  FOR EACH ROW
  EXECUTE FUNCTION public.chat_folders_validate_nesting();
