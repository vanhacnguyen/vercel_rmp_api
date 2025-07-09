# RMP-API
Scrapped https://www.ratemyprofessors.com for fetching data of professors on this website. Created a simple API to use with this data

## Getting Started

### Prerequisites
Node.js and npm

### Installing
For running on your local machine or any hosting server for development and testing purpose follow the below steps.

1) Clone this repo with ```git clone https://github.com/vanhacnguyen/vercel_rmp_api.git```
2) Change directory to ```RPM-API```
3) Run ```npm install``` to install all neccesary packages

### Running the Server
```node index.js```


## APIs Endpoints

#### /
intro URL `http://localhost:3000/`

#### /professor
* `fname` : first name of professor
* `lname` : last name of professor
* `university` : university of professor

professor URL: ```http://localhost:3000/professor?fname=<first_name>&lname=<last_name>&university=<university>```

## Example Output

![Image of Sample Output](https://github.com/vmani273/RMP-API/blob/master/Sample%20Output.png)


