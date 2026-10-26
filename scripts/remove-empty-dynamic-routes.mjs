import { rm } from "node:fs/promises";
import { resolve } from "node:path";

const generatedSentinels = [
  ["athletes", "profiles-not-published"],
  ["news", "updates-not-published"],
];

await Promise.all(
  generatedSentinels.map((segments) =>
    rm(resolve("out", ...segments), { force: true, recursive: true }),
  ),
);

console.log(
  "Removed unlinked empty-state route sentinels from the static export.",
);
