# Institute Management System (MERN Stack)

This is a comprehensive MERN stack application to manage all aspects of an educational institute, from student admissions and faculty management to timetables and placements. It features role-based access for Admins, Teachers, and Students.

## Prerequisites

Before you begin, ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MongoDB](https://www.mongodb.com/try/download/community) (or a MongoDB Atlas account for a cloud-based database)

## Getting Started

Follow these steps to get your development environment running.

### 1. Backend Configuration

The backend server requires environment variables to connect to the database and manage authentication.

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Create a new file named `.env`:
    ```bash
    touch .env
    ```
3.  Open the `.env` file and add the following variables, replacing the placeholder values with your own:

    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_jwt_key
    API_KEY=your_google_ai_api_key
    ```
    - `MONGO_URI`: Your connection string for your local or cloud MongoDB database.
    - `JWT_SECRET`: A long, random string used to sign authentication tokens.
    - `API_KEY`: Your API key from Google AI Studio. This is required for all AI-powered features (Quiz Generator, Insights, etc.) to work.

### 2. Install Dependencies

This project has dependencies in the root, `frontend`, and `backend` directories.

1.  From the project's **root directory**, install the root dependencies (for tools like `concurrently`):
    ```bash
    npm install
    ```
2.  Now, install the dependencies for both the frontend and backend. From the **root directory**, run:
    ```bash
    npm run install-all
    ```
    *(This script runs `npm install` in both the `frontend` and `backend` directories for you.)*

### 3. Create the Initial Admin User (Important!)

For security, the administrator account is not created through a public registration form. You must create the first admin user via a secure script.

1.  Make sure you are in the project's **root directory**.
2.  Run the `seed:admin` script:
    ```bash
    npm run seed:admin
    ```
3.  The script will prompt you in the terminal to enter a name, email, and password for the admin account.
4.  This is a one-time setup. The script will not create a new admin if one already exists.

### 4. Run the Application

To run both the frontend and backend servers simultaneously for development:

1.  Make sure you are in the project's **root directory**.
2.  Run the `dev` script:
    ```bash
    npm run dev
    ```

This command will:
- Start the backend API server on `http://localhost:5000`.
- Start the frontend Vite development server, usually on `http://localhost:5173`.

Your default web browser should automatically open the application. If not, open `http://localhost:5173` to view the running app. You can now log in with the admin credentials you created in step 3.