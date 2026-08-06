/**
 * Shared helpers for the Cloudinary -> Cloudflare R2 migration.
 *
 * The object key we derive from a Cloudinary URL is deliberately identical to the
 * path `cld sync --pull` wrote to disk (`<public_id>.<format>`), so `cld-full-dump/`
 * can be uploaded to R2 as-is and every DB URL rewrites to `${R2_PUBLIC_URL}/${key}`.
 */

export const CLOUDINARY_HOST = 'res.cloudinary.com';

export const isCloudinary = (u: unknown): u is string =>
  typeof u === 'string' && u.includes(CLOUDINARY_HOST);

/**
 * Cloudinary delivery URL -> R2 object key.
 *
 *   https://res.cloudinary.com/<cloud>/image/upload/[transforms/][v123/]folder/name.jpg
 *     -> folder/name.jpg
 *
 * Returns null if the URL is not a recognisable Cloudinary delivery URL, so callers
 * can report it rather than silently producing a wrong key.
 */
export function cloudinaryKey(url: string): string | null {
  const m =
    /^https?:\/\/res\.cloudinary\.com\/[^/]+\/(?:image|video|raw)\/(?:upload|authenticated|private)\/(.+)$/.exec(
      url,
    );
  if (!m) return null;

  const segs = m[1].split('/');

  // Drop the version segment (v1712345678) and any transformation segments
  // (w_500, c_fill,q_auto, f_auto). Checked against the real folder names in this
  // account -- onboarding_images, property_images, user_photos, amenity_icons,
  // transport_icons, surrounding_icons, chat-attachments, badges -- none of which
  // match these patterns.
  while (
    segs.length > 1 &&
    (/^v\d+$/.test(segs[0]) ||
      segs[0].includes(',') ||
      /^[a-z]{1,3}_[a-z0-9.]+$/.test(segs[0]))
  ) {
    segs.shift();
  }

  const key = segs.join('/');
  return key.length > 0 ? key : null;
}

/** One place in the database that points at a Cloudinary asset. */
export interface AssetRef {
  model: string;
  id: string;
  field: string;
  /** Set when the field is an array (Onboarding.homeImages, Property.images). */
  index?: number;
  url: string;
  key: string;
}
