const professorURL = require('../utils/Professor_URL');
const professorData = require('../utils/Professor_Data');

module.exports = async (req, res) => {
  const { fname, lname, university } = req.query;

  if (!fname || !lname || !university) {
    return res.status(400).json({ error: "Missing query parameters." });
  }

  professorURL(fname, lname, university, (response) => {
    if (!response || !response.URL) {
      return res.status(404).json({ error: "Professor not found." });
    }

    professorData(response.professorNode, (data) => {
      if (!data) {
        return res.status(500).json({ error: "Failed to fetch professor data." });
      }

      res.status(200).json({
        URL: response.URL,
        first_name: response.fname,
        last_name: response.lname,
        university: response.university,
        would_take_again: data.percentage,
        difficulty: data.difficulty,
        overall_quality: data.quality + "/5",
        most_recent_comment: data.mostRecentComment
      });
    });
  });
};
