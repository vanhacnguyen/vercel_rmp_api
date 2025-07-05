const { getProfessorById } = require("ratemyprofessor-api");

function getProfData(professorNode, callback) {
  try {
    callback({
      percentage: professorNode.wouldTakeAgainPercent || "N/A",
      difficulty: professorNode.difficulty || "N/A",
      quality: professorNode.avgRating || "N/A",
      mostRecentComment: professorNode.topTag || "No comments"
    });
  } catch (err) {
    console.error("Error fetching professor ratings:", err);
    callback({
      percentage: "N/A",
      difficulty: "N/A",
      quality: "N/A",
      mostRecentComment: "Error fetching data"
    });
  }
}


module.exports = getProfData;
