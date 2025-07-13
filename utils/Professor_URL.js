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
    "samuel": "sam"
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
      console.log("🔍 Trying name variant:", nameCombo);

      const results = await searchProfessorsAtSchoolId(nameCombo, schoolId);
      prof = findExactMatch(results, variant, lname);

      if (prof) break;

      // Try flipped
      const flipped = `${lname} ${variant}`;
      console.log("🔁 Trying flipped variant:", flipped);
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
    const profFirst = normalize(prof.firstName).split(' ')[0];
    const profLast = normalize(prof.lastName);

    // Match either: exact match or flipped
    const isDirectMatch = profFirst === inputFirst && profLast === inputLast;
    const isFlippedMatch = profFirst === inputLast && profLast === inputFirst;

    if (isDirectMatch || isFlippedMatch) {
      console.log("✅ Matched professor:", {
        inputFirst, inputLast,
        profFirst: prof.firstName,
        profLast: prof.lastName
      });
      return prof;
    }
  }

  return null;
}

module.exports = searchForProf;
