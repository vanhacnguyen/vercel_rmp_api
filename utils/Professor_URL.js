const { searchSchool, searchProfessorsAtSchoolId } = require("ratemyprofessor-api");

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

    // Normalize input name
    const inputFirst = normalize(fname);
    const inputLast = normalize(lname);

    // Find best match by comparing normalized names
    const exactMatch = profResults.find(result => {
      const prof = result.node;
      const profFirst = normalize(prof.firstName);
      const profLast = normalize(prof.lastName);
      return profFirst === inputFirst && profLast === inputLast;
    });

    const prof = exactMatch ? exactMatch.node : null;
    if (!prof) {
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
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[^a-z\s]/g, '') // remove punctuation like apostrophes
        .trim();
}

module.exports = searchForProf;
