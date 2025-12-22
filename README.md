## AI Summarizer – Backend (NestJS)

A NestJS API for authentication, summaries, database storage, and resume extraction using LlamaExtract.

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
LLAMA_CLOUD_API_KEY=your_llama_cloud_api_key
FRONTEND_URL=your_FE_URL
```
- Make sure these match what you use in `src/database/typeorm.config.ts` and your AI service.

### 4. Run the backend (development)
```bash
npm run start:dev
```
The API will usually be available on `http://localhost:3001`.

### 5. Resume Extraction API

The backend includes resume extraction functionality using LlamaExtract API:

**Endpoints:**
- `POST /resumes` - Upload and extract resume (requires JWT authentication)
  - Accepts: PDF or Word documents (max 10MB)
  - Returns: Extracted experience, education, and tech stack
- `GET /resumes` - Get all resumes for authenticated user
- `GET /resumes/:id` - Get specific resume by ID

**Extracted Data:**
- **Experience**: Company, title, dates, description, location
- **Education**: Institution, field of study, degree type, dates, GPA
- **Tech Stack**: Programming languages, frameworks, and tools

**Example Request:**
```bash
curl -X POST http://localhost:3001/resumes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@resume.pdf"
```

### 6. Other useful scripts
```bash
npm run build      # Build for production
npm run start:prod # Start production server
npm run lint       # Run linter
```

That's it – after this, the frontend can point to your backend base URL for all API calls.
