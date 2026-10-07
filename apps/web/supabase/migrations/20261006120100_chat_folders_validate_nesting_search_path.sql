-- Harden chat_folders_validate_nesting search_path (advisor: function_search_path_mutable).
-- Applied remotely via Supabase MCP as chat_folders_validate_nesting_search_path.

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
