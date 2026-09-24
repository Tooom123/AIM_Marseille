/**
 * Profil LinkedIn utilisé partout dans la démo. Les profils membres étant
 * fictifs, tous les liens pointent vers un profil réel et vérifiable plutôt
 * que vers des URL inventées qui mèneraient à des pages 404.
 */
export const DEMO_LINKEDIN = "https://www.linkedin.com/in/celisianerosius/";

/** Normalise n'importe quelle saisie en URL ouvrable. */
export function linkedinUrl(): string {
  return DEMO_LINKEDIN;
}
