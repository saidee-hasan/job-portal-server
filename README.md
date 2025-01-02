# Job Portal Server

This is the backend for the Job Portal application. It allows users to browse, filter, and apply for jobs, as well as provides HRs with the ability to post job openings. This project is built using Node.js, Express, and MongoDB for the database.

## Features

- Job listings with the ability to filter by job title, location, salary range, and more.
- Sorting job listings by salary.
- HR can add new job postings.
- Users can view detailed job descriptions and requirements.
- Salary range filtering (min and max salary).
- Search functionality for job titles and locations.

## Technologies Used

- **Node.js** - Backend runtime environment.
- **Express** - Web framework for Node.js.
- **MongoDB** - NoSQL database to store job listings.
- **Mongoose** - ODM (Object Data Modeling) library to interact with MongoDB.
- **Cors** - Middleware for enabling Cross-Origin Resource Sharing.
- **Axios** - For making HTTP requests from the client-side.

## Getting Started

### Prerequisites

- **Node.js**: Make sure that Node.js is installed on your machine. You can download it from [here](https://nodejs.org/).
- **MongoDB**: You should have a MongoDB database set up (either locally or via a cloud service like MongoDB Atlas).

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/saidee-hasan/job-portal-server.git
