# Chequepilot

Chequepilot is a Node.js + Express backend for cheque processing with authentication, OCR integration, and PostgreSQL storage.

## Features
- User authentication and JWT-based authorization
- Cheque upload and processing endpoints
- OCR pipeline for extracting cheque details
- PostgreSQL database integration

## Prerequisites
Make sure the following are installed on your machine:
- Node.js 18+ and npm
- Python 3.9+ and pip
- PostgreSQL 14+ running locally
- Git

## 1. Clone the project
```bash
git clone <your-repo-url>
cd chequepilot
```

## 2. Install Node.js dependencies
```bash
npm install
```

## 3. Install Python OCR dependencies
```bash
cd py-cheque-ocr
pip install -r requirements.txt
cd ..
```

## 4. Configure environment variables
Create a file named `.env` in the project root with the following values:

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chequepilot
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
```

You can also copy the example file if available:
```bash
copy .env.example .env
```

## 5. Create the PostgreSQL database
Open PostgreSQL and create a database:

```sql
CREATE DATABASE chequepilot;
```

If needed, create a user and grant permissions:

```sql
CREATE USER postgres WITH PASSWORD 'your_password';
ALTER USER postgres WITH SUPERUSER;
```

## 6. Run the backend server
Start the API server:

```bash
npm run dev
```

The server will start on:
```text
http://localhost:3001
```

## 7. Run the OCR service
Open a second terminal and start the Python OCR server:

```bash
cd py-cheque-ocr
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The OCR service will be available at:
```text
http://localhost:8000/docs
```

## 8. Useful commands
```bash
# Install all Node dependencies
npm install

# Start backend in development mode
npm run dev

# Start backend normally
npm start
```

## Project structure
- app.js - Express entry point
- routes/ - API routes
- controllers/ - Business logic
- models/ - Sequelize models
- py-cheque-ocr/ - Python OCR service

## Notes
- The Node backend expects PostgreSQL to be running before startup.
- The OCR service uses the Python model located in the `py-cheque-ocr/model` folder.
- If you encounter missing Python packages, reinstall them with:

```bash
cd py-cheque-ocr
pip install -r requirements.txt
```

