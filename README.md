# CSV Importer for GrowEasy CRM

This is my submission for the Software Developer (Intern/Full-Time) assignment at GrowEasy. It's a full-stack application that allows users to upload any lead CSV, parses it, and uses AI to map the columns and extract the data into a standard CRM format.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- A Gemini API key (from Google AI Studio)

### Backend Setup
1. Navigate into the backend directory:
   ```bash
   cd backend
   ```
2. Copy the sample environment file:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and add your `GEMINI_API_KEY`.
4. Install dependencies and start the server:
   ```bash
   npm install
   npm run dev
   ```
   The backend will run on `http://localhost:3001`.

### Frontend Setup
1. Navigate into the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies and start the development server:
   ```bash
   npm install
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`.

*Note: The frontend is pre-configured to point to `http://localhost:3001` for the backend API in local development.*

## Running with Docker (Alternative)
If you prefer Docker, you can spin up both services from the root folder:
```bash
GEMINI_API_KEY=your_key_here docker-compose up
```

## How It Works

1. **Upload & Preview**: The user drops a CSV file on the frontend. The app parses it client-side (using PapaParse) and displays a responsive preview table with sticky headers. No AI processing happens at this stage.
2. **AI Processing**: Once the user clicks "Import", the backend takes the raw records and sends them in batches to the Gemini API. The prompt is engineered to handle messy data, infer the correct mapping for various column names (like "Mobile No.", "Phone", "Contact"), and normalize statuses to the allowed enums.
3. **Results**: The frontend displays the successfully parsed records and a breakdown of any records that were skipped (e.g., missing both email and mobile number).

## Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Vanilla CSS Modules
- **Backend**: Node.js, Express, TypeScript
- **AI**: Google Gemini 1.5 Flash API
