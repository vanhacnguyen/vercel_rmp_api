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
    const fullName = `${fname} ${lname}`;
    const schools = await searchSchool(university);
    if (!schools.length) {
      return callback(null);
    }

    const schoolId = schools[0].node.id;
    const profResults = await searchProfessorsAtSchoolId(fullName, schoolId);

    if (!profResults.length) {
      return callback(null);
    }

    // first search: normal order (first, last)
    console.log("🔍 Searching (normal):", fullName);
    let prof = findExactMatch(profResults, fname, lname);

    // if not found, try flipped name
    if (!prof) {
      const flippedFullName = `${lname} ${fname}`;
      console.log("🔁 Searching (flipped):", flippedFullName);
      const flippedResults = await searchProfessorsAtSchoolId(flippedFullName, schoolId);
      prof = findExactMatch(flippedResults, lname, fname);
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
