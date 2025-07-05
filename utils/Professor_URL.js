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

    const prof = profResults[0].node;
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

module.exports = searchForProf;
