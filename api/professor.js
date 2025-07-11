const professorURL = require('../utils/Professor_URL');
const professorData = require('../utils/Professor_Data');

module.exports = async (req, res) => {
    // allow any website to access this API
    res.setHeader('Access-Control-Allow-Origin', '*');
    // optionally allow credentials and headers:
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request (some browsers do this)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return
    }
    const { fname, lname, university } = req.query;

    if (!fname || !lname || !university) {
    return res.status(400).json({ error: "Missing query parameters." });
    }

    professorURL(fname, lname, university, (response) => {
        if (!response || !response.URL) {
            return res.status(404).json({ error: "Professor not found." });
        }

        const siteFirst = normalize(fname);
        const siteLast = normalize(lname);
        const apiFirst = normalize(response.fname || "");
        const apiLast = normalize(response.lname || "");

        if (siteFirst !== apiFirst || siteLast !== apiLast) {
            return res.status(404).json({
                error: "Professor name does not match exactly.",
                siteFirst,
                siteLast,
                apiFirst,
                apiLast
            });
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

function normalize(name) {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[^a-z]/g, '') // remove all non-letters
        .split(' ')[0]
        .trim();
}
