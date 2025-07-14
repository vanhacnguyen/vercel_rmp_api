const { searchSchool, searchProfessorsAtSchoolId } = require("ratemyprofessor-api");

const nicknameMap = {
    "chris": "christopher",
    "christopher": "chris",
    "zack": "zachary",
    "zachary": "zack",
    "mike": "michael",
    "michael": "mike",
    "will": "william",
    "ed": "edward",
    "edward": "ed",
    "alex": "alexander",
    "alexander": "alex",
    "sam": "samuel",
    "samuel": "sam",
    "jeff": "jeffrey",
    "jeffrey": "jeff"
};

async function searchForProf(fname, lname, university, callback) {
  try {
    const schools = await searchSchool(university);
    if (!schools.length) {
      return callback(null);
    }

    const schoolId = schools[0].node.id;
    const variants = getNameVariants(fname);
    let prof = null;

    for (let variant of variants) {
      const nameCombo = `${variant} ${lname}`;

      const results = await searchProfessorsAtSchoolId(nameCombo, schoolId);
      prof = findExactMatch(results, variant, lname);

      if (prof) break;

      // Try flipped
      const flipped = `${lname} ${variant}`;
      const flippedResults = await searchProfessorsAtSchoolId(flipped, schoolId);
      prof = findExactMatch(flippedResults, lname, variant);

      if (prof) break;
    }

    if (!prof) { // if still cant find, there's none
      return callback(null);
    }
    
    const decodedId = Buffer.from(prof.id, 'base64').toString('utf-8').split('-')[1];
    callback({
        professorNode: prof,
        URL: `https://www.ratemyprofessors.com/professor/${decodedId}`,
        fname: prof.firstName,
        lname: prof.lastName,
        university: prof.school.name
    });
  } catch (err) {
    console.error("Error fetching professor data:", err);
    callback(null);
  }
}

function getNameVariants(name) {
  const normalized = normalize(name);
  const variants = new Set([normalized]);

  if (nicknameMap[normalized]) variants.add(nicknameMap[normalized]);
  const reverse = getKeyByValue(nicknameMap, normalized);
  if (reverse) variants.add(reverse);

  return Array.from(variants);
}

function normalize(name) {
    const cleaned = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[^a-z\s]/g, '')   // remove punctuation
      .split(/\s+/)[0]            // get first word only (skip middle name)
      .trim();
    // try both nickname -> full and full -> nickname
    return nicknameMap[cleaned] || getKeyByValue(nicknameMap, cleaned) || cleaned;
}

function getKeyByValue(obj, value) {
  return Object.keys(obj).find(key => obj[key] === value);
}


// find exact match based on normalized names
function findExactMatch(results, fname, lname) {
  const inputFirst = normalize(fname).split(' ')[0];
  const inputLast = normalize(lname);

  for (let result of results) {
    const prof = result.node;
    const profFirstRaw = prof.firstName;
    const profLast = normalize(prof.lastName);

    // extract variants from parentheses (Jianbo (Paul) -> ["jianbo", "paul"])
    const profFirstVariants = extractNameVariants(profFirstRaw);
    for (let variant of profFirstVariants) {
      const profFirst = normalize(variant);

      const isDirectMatch = profFirst === inputFirst && profLast === inputLast;
      const isFlippedMatch = profFirst === inputLast && profLast === inputFirst;

      if (isDirectMatch || isFlippedMatch) {
        return prof;
      }
    }
  }
  return null;
}
function extractNameVariants(name) {
  const variants = new Set();

  // normalize entire first name (e.g., "L. Scott")
  const normalizedFull = normalize(name);
  variants.add(normalizedFull);

  // split parts (e.g., "L. Scott" => ["L.", "Scott"])
  const parts = name.split(/\s+/);
  for (const part of parts) {
    const cleaned = normalize(part);
    if (cleaned) variants.add(cleaned);
  }

  // check for name in parentheses (e.g., "Jianbo (Paul)")
  const parenMatch = name.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const parenName = normalize(parenMatch[1]);
    variants.add(parenName);
  }

  return Array.from(variants);
}


module.exports = searchForProf;
