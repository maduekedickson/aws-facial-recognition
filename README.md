# RiteClick FaceGate 🛡️
### AWS Facial Recognition Access System (Frontend)

**RiteClick FaceGate** is a clean, corporate-grade React + Vite frontend for an AWS Serverless Facial Recognition demonstration. It allows users to capture live faces using their webcam or upload a photo, automatically optimizes the image payload, and communicates strictly through Amazon API Gateway.

---

## 🏗️ Architecture Overview

This project is a **frontend-only** client. It requires **no AWS credentials** or AWS SDK in the browser.

```text
React (Vite)
    ↓  POST /verify (Base64 JPEG)
Amazon API Gateway
    ↓
AWS Lambda
    ↓
Amazon Rekognition (SearchFacesByImage)
    ↓
Amazon DynamoDB (Employee Metadata)
```

### AWS Cloud Services in the Ecosystem
- **AWS Amplify Hosting:** Host and deploy this static React frontend with continuous integration.
- **Amazon API Gateway:** Secure REST API entry point exposing the `/verify` route.
- **AWS Lambda:** Serverless execution that parses incoming images and orchestrates Rekognition & DynamoDB queries.
- **Amazon Rekognition:** High-accuracy facial feature analysis and collection matching.
- **Amazon DynamoDB:** Key-value NoSQL database storing registered employee information.
- **Amazon S3:** Object storage holding initial employee enrollment photos.

---

## 📁 Project Structure

```
├── .env.example              # Environment variables template
├── .env                      # Local environment configuration
├── index.html                # Application HTML entry point
├── package.json              # Project scripts & dependencies (React + Vite)
├── vite.config.js            # Vite configuration
└── src/
    ├── App.jsx               # Navigation bar & layout routing
    ├── main.jsx              # React DOM mounting
    ├── index.css             # Corporate security theme (Dark navy + White cards)
    ├── components/
    │   ├── Camera.jsx        # Webcam stream (MediaDevices API) & frame capture
    │   ├── ImageUpload.jsx   # Drag-and-drop & file picker with validation
    │   └── Result.jsx        # ACCESS ALLOWED / ACCESS DENIED status display
    ├── pages/
    │   ├── Verify.jsx        # Main verification workflow
    │   └── About.jsx         # Architecture diagrams & AWS service descriptions
    └── services/
        └── api.js            # Image resizing & API Gateway fetch() client
```

---

## ⚙️ Configuration (.env)

1. Copy the `.env.example` file to create your local `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open [.env](file:///.env) and set your deployed Amazon API Gateway endpoint:
   ```env
   VITE_API_BASE_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
   ```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000` (or `http://localhost:5173`).

### 3. Build for Production (AWS Amplify / S3 Hosting)
```bash
npm run build
```
The optimized production bundle will be generated in the `dist/` directory ready for deployment.
