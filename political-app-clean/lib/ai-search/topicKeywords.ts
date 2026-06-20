export function getTopicKeywords(query: string) {
  const lowerQuery = query.toLowerCase();

  if (
    lowerQuery.includes("migráció") ||
    lowerQuery.includes("migration") ||
    lowerQuery.includes("bevándorlás") ||
    lowerQuery.includes("asyl") ||
    lowerQuery.includes("flücht") ||
    lowerQuery.includes("fluecht") ||
    lowerQuery.includes("einwanderung")
  ) {
    return [
      "migráció",
      "migration",
      "bevándorlás",
      "menekült",
      "menekültek",
      "határ",
      "migrant",
      "migranten",
      "asyl",
      "flüchtling",
      "flüchtlinge",
      "fluechtling",
      "fluechtlinge",
      "einwanderung",
      "grenze",
      "grenzschutz",
    ];
  }

  return [];
}