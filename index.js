const professorURL = require('./utils/Professor_URL')
const professorData = require('./utils/Professor_Data')
const express = require('express');
var app = express();
const cors = require('cors');

app.use(cors());

app.get('/', function (req, res) {
    res.json('WELCOME TO THE RATE MY PROFESSOR API' );
});



app.get('/professor', function (req, res) {
    const fname = req.query.fname;
    const lname = req.query.lname;
    const university = req.query.university;

    console.log("Incoming request:", fname, lname, university);

    professorURL(fname, lname, university, (response) => {
        console.log("↪ professorURL callback:", response);

        if (!response || !response.URL) {
            console.log("No professor URL found.");
            return res.status(404).json({ error: "Professor not found." });
        }

        professorData(response.professorNode, (data) => {
            console.log("↪ professorData callback:", data);

            if (!data) {
                console.log("No professor data found.");
                return res.status(500).json({ error: "Failed to fetch professor data." });
            }

            console.log("Sending JSON response");
            res.json({
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
});


app.listen(3000, () => {
    console.log("Server running on port 3000");
});
