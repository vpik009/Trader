// Fills the demo database (prisma/demo.db) with games, players and ratings.
// Run through `npm run demo`; it never touches the real database.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// [igdbId, name, year, genres, steamAppId, criticScore, criticCount, igdbScore, igdbCount, summary]
const GAMES = [
  [113112, "Hades", 2020, "Roguelike, Action", 1145360, 93, 41, 91, 1200, "Fight your way out of the Underworld as Zagreus, son of Hades, with help from the gods of Olympus. Every escape attempt plays out differently."],
  [119133, "Elden Ring", 2022, "RPG, Adventure", 1245620, 95, 72, 92, 2600, "An open-world action RPG set in the Lands Between, built by FromSoftware with worldbuilding by George R. R. Martin."],
  [1942, "The Witcher 3: Wild Hunt", 2015, "RPG, Adventure", 292030, 93, 88, 93, 4100, "Geralt of Rivia searches for his adopted daughter across a war-torn continent, taking monster contracts along the way."],
  [26226, "Celeste", 2018, "Platformer, Indie", 504230, 91, 34, 88, 900, "Help Madeline climb Celeste Mountain in a tight, demanding platformer about anxiety and perseverance."],
  [25076, "Red Dead Redemption 2", 2018, "Adventure, Shooter", 1174180, 96, 79, 91, 3100, "Arthur Morgan and the Van der Linde gang are on the run as the age of outlaws comes to an end."],
  [14593, "Hollow Knight", 2017, "Metroidvania, Indie", 367520, 87, 30, 90, 1700, "Explore the ruined insect kingdom of Hallownest in a hand-drawn action adventure."],
  [17000, "Stardew Valley", 2016, "Simulation, RPG", 413150, 89, 25, 87, 1500, "Inherit your grandfather's farm and build a life in Pelican Town: crops, fishing, mines and neighbours."],
  [1877, "Cyberpunk 2077", 2020, "RPG, Shooter", 1091500, 81, 64, 79, 2200, "A mercenary in Night City chases an implant that could make them immortal, or kill them."],
  [119171, "Baldur's Gate 3", 2023, "RPG, Strategy", 1086940, 96, 58, 93, 2000, "Gather a party and resist the Mind Flayers in a sprawling turn-based RPG set in the Forgotten Realms."],
  [72, "Portal 2", 2011, "Puzzle, Platformer", 620, 95, 70, 92, 2800, "Solve physics puzzles with a portal gun in the abandoned Aperture Science labs, alone or co-op."],
  [26472, "Disco Elysium", 2019, "RPG, Adventure", 632470, 91, 40, 89, 1100, "An amnesiac detective tries to solve a murder, and figure out who he is, in a city that has given up."],
  [96437, "Starfield", 2023, "RPG, Shooter", 1716740, 85, 61, 70, 900, "Join Constellation and explore a thousand planets in Bethesda's first new universe in 25 years."],
  [136897, "Redfall", 2023, "Shooter", 1294810, 56, 48, 45, 300, "A vampire-infested island town and four heroes with guns. Co-op open-world shooter."],
];

const PLAYERS = [
  ["demo:player", "Demo Player"],
  ["demo:ana", "Ana"],
  ["demo:kofi", "Kofi"],
  ["demo:mira", "Mira"],
  ["demo:jonas", "Jonas"],
  ["demo:priya", "Priya"],
];

// [player, game, stars, review, daysAgo]
const RATINGS = [
  ["demo:player", 113112, 4, "Every run felt different and the writing is genuinely funny. I kept saying 'one more run' until 3am.", 2],
  ["demo:player", 119171, 4, "Best RPG I've played in a decade. My choices actually mattered.", 9],
  ["demo:player", 26226, 4, null, 30],
  ["demo:player", 1942, 3, "Fantastic side quests, clunky combat. Still glad I played it.", 60],
  ["demo:player", 1877, 3, null, 45],
  ["demo:player", 96437, 2, "Pretty, but too many loading screens and empty planets.", 20],
  ["demo:player", 136897, 1, null, 80],
  ["demo:ana", 113112, 4, "The best combat loop I've played in years.", 5],
  ["demo:ana", 119133, 4, "Margit humbled me. Loved every minute.", 12],
  ["demo:ana", 14593, 4, "Huge world, beautiful music, brutal bosses.", 40],
  ["demo:ana", 72, 4, null, 100],
  ["demo:ana", 96437, 2, null, 22],
  ["demo:kofi", 25076, 4, "Arthur's story wrecked me. Slow, and that's the point.", 3],
  ["demo:kofi", 119133, 3, "Gorgeous, but the late game drags.", 15],
  ["demo:kofi", 113112, 3, null, 50],
  ["demo:kofi", 26472, 4, "Nothing else reads like this. A novel you play.", 33],
  ["demo:kofi", 136897, 1, "Refunded after an hour.", 70],
  ["demo:mira", 113112, 2, "Fine, but I bounced off the repetition after 20 hours.", 1],
  ["demo:mira", 17000, 4, "My comfort game. 300 hours and counting.", 8],
  ["demo:mira", 1877, 2, null, 90],
  ["demo:mira", 119171, 4, null, 25],
  ["demo:jonas", 72, 4, "Still the funniest game ever made.", 6],
  ["demo:jonas", 1942, 4, null, 120],
  ["demo:jonas", 26226, 3, "Hard but fair. The B-sides broke me.", 18],
  ["demo:jonas", 96437, 3, null, 26],
  ["demo:priya", 14593, 3, "Loved it until I got lost for the fifth time.", 4],
  ["demo:priya", 25076, 3, null, 55],
  ["demo:priya", 17000, 3, null, 65],
  ["demo:priya", 119133, 4, null, 14],
];

await db.rating.deleteMany();
await db.user.deleteMany();
await db.game.deleteMany();

for (const [id, name, releaseYear, genres, steamAppId, criticScore, criticCount, igdbScore, igdbCount, summary] of GAMES) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  await db.game.create({
    data: { id, name, slug, releaseYear, genres, steamAppId, criticScore, criticCount, igdbScore, igdbCount, summary },
  });
}
for (const [id, name] of PLAYERS) await db.user.create({ data: { id, name } });
for (const [userId, gameId, stars, review, daysAgo] of RATINGS) {
  const at = new Date(Date.now() - daysAgo * 86_400_000);
  await db.rating.create({ data: { userId, gameId, stars, review, createdAt: at, updatedAt: at } });
}

console.log(`Demo data: ${GAMES.length} games, ${PLAYERS.length} players, ${RATINGS.length} ratings.`);
await db.$disconnect();
