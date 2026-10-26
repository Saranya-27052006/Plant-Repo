const fs = require("fs");
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp({
  projectId: "plantdoctor-5e41b",
  credential: applicationDefault(),
});

const db = getFirestore();

const records = JSON.parse(
  fs.readFileSync("./plant_diagnosis_288_reviewed_draft.json", "utf8"),
);

async function main() {
  if (
    records.length !== 288 ||
    new Set(records.map((r) => r.id)).size !== 288
  ) {
    throw new Error("Expected 288 unique records.");
  }

  console.log(`Validated ${records.length} records.`);

  if (!process.argv.includes("--apply")) {
    console.log("DRY RUN: Nothing uploaded. Review the dataset first.");
    return;
  }

  let created = 0;
  let skipped = 0;

  for (let start = 0; start < records.length; start += 400) {
    const part = records.slice(start, start + 400);
    const refs = part.map((r) => db.collection("plant_diagnosis").doc(r.id));
    const snapshots = await db.getAll(...refs);
    const batch = db.batch();
    let writes = 0;

    for (let i = 0; i < part.length; i++) {
      if (snapshots[i].exists) {
        skipped++;
        continue;
      }

      const { id, ...data } = part[i];
      batch.create(refs[i], data);
      writes++;
    }

    if (writes > 0) await batch.commit();
    created += writes;
  }

  console.log(`Created: ${created}`);
  console.log(`Skipped existing documents: ${skipped}`);
}

main().catch((error) => {
  console.error("Upload failed:", error);
  process.exitCode = 1;
});
