## AI Summarizer – Backend (NestJS)

A simple NestJS API for authentication, summaries, and database storage.

### 1. Prerequisites
- **Node.js & npm**: Install the latest LTS version from the official site.
- **PostgreSQL**: Have a running Postgres instance and a database created.

### 2. Install dependencies
```bash
cd ai-summarizer-backend
npm install
```

### 3. Configure environment
- **Create a `.env` file** in the project root (next to `package.json`).
- Add your own values, for example:
```bash

PORT=your_available_port
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=required_port
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=ai_summarizer
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=Your_gemini_api_key
FRONTEND_URL=your_FE_URL
```
- Make sure these match what you use in `src/database/typeorm.config.ts` and your AI service.

### 4. Run the backend (development)
```bash
npm run start:dev
```
The API will usually be available on `http://localhost:3001`.

### 5. Other useful scripts
```bash

```

That’s it – after this, the frontend can point to your backend base URL for all API calls.