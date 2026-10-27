import React from 'react';

/**
 * About Page
 * 
 * Explains the AWS Serverless Facial Recognition architecture,
 * detailing how each cloud service collaborates to verify identity.
 */
export default function About() {
  const awsServices = [
    {
      name: 'AWS Amplify',
      role: 'Frontend Hosting & CI/CD',
      desc: 'Hosts the React + Vite frontend application globally with automated continuous deployment from Git.',
      icon: '🚀'
    },
    {
      name: 'Amazon API Gateway',
      role: 'Secure REST Entrypoint',
      desc: 'Receives the POST /verify request with the Base64 image and securely routes it to the Lambda function.',
      icon: '🚪'
    },
    {
      name: 'AWS Lambda',
      role: 'Serverless Business Logic',
      desc: 'Executes the serverless backend, decodes the image, coordinates facial recognition, and queries employee records.',
      icon: '⚡'
    },
    {
      name: 'Amazon Rekognition',
      role: 'Computer Vision & Face Search',
      desc: 'Analyzes facial features against an indexed facial collection (SearchFacesByImage) to determine similarity score.',
      icon: '👁️'
    },
    {
      name: 'Amazon DynamoDB',
      role: 'NoSQL Employee Database',
      desc: 'Stores registered employee metadata (name, department, employee ID, status) mapped to Rekognition FaceId.',
      icon: '🗄️'
    },
    {
      name: 'Amazon S3',
      role: 'Registration Object Storage',
      desc: 'Stores employee reference profile photos used during the initial enrollment phase.',
      icon: '🪣'
    }
  ];

  return (
    <div className="about-page">
      {/* Header */}
      <div className="page-header text-center">
        <h1 className="system-title">About RiteClick FaceGate</h1>
        <p className="system-subtitle">
          AWS Facial Recognition Access-Control System Architecture
        </p>
      </div>

      <div className="about-content">
        {/* Overview Card */}
        <div className="main-card mb-6">
          <h2 className="card-title">Project Overview</h2>
          <p className="about-lead-text">
            <strong>RiteClick FaceGate</strong> demonstrates how AWS services can be combined to create a modern, serverless facial recognition access-control system.
          </p>
          <p className="about-description">
            The frontend captures a live facial image via webcam or file upload, converts it to an optimized JPEG, and sends it as a Base64-encoded payload to an Amazon API Gateway endpoint. The cloud backend performs sub-second matching against a pre-enrolled employee facial collection to grant or deny physical or digital access.
          </p>
        </div>

        {/* Architecture Flow Card */}
        <div className="main-card mb-6">
          <h2 className="card-title">System Architecture Flow</h2>
          <p className="card-subtitle">End-to-end request lifecycle from browser to database</p>

          <div className="architecture-diagram">
            <div className="arch-node arch-frontend">
              <span className="arch-badge">Client</span>
              <span className="arch-name">React (Vite)</span>
              <span className="arch-sub">Camera / Upload</span>
            </div>

            <div className="arch-arrow">
              <span className="arrow-line"></span>
              <span className="arrow-label">POST /verify</span>
              <span className="arrow-head">↓</span>
            </div>

            <div className="arch-node arch-gateway">
              <span className="arch-badge">API</span>
              <span className="arch-name">API Gateway</span>
              <span className="arch-sub">REST Endpoint</span>
            </div>

            <div className="arch-arrow">
              <span className="arrow-line"></span>
              <span className="arrow-label">Invoke</span>
              <span className="arrow-head">↓</span>
            </div>

            <div className="arch-node arch-compute">
              <span className="arch-badge">Compute</span>
              <span className="arch-name">AWS Lambda</span>
              <span className="arch-sub">Orchestrator</span>
            </div>

            <div className="arch-arrow">
              <span className="arrow-line"></span>
              <span className="arrow-label">SearchFaces</span>
              <span className="arrow-head">↓</span>
            </div>

            <div className="arch-node arch-ai">
              <span className="arch-badge">AI / ML</span>
              <span className="arch-name">Amazon Rekognition</span>
              <span className="arch-sub">Face Matching</span>
            </div>

            <div className="arch-arrow">
              <span className="arrow-line"></span>
              <span className="arrow-label">Lookup FaceId</span>
              <span className="arrow-head">↓</span>
            </div>

            <div className="arch-node arch-db">
              <span className="arch-badge">Database</span>
              <span className="arch-name">Amazon DynamoDB</span>
              <span className="arch-sub">Employee Metadata</span>
            </div>
          </div>

          {/* Simple text representation required by project specs */}
          <div className="text-architecture-box">
            <div className="text-arch-title">Architecture Pipeline:</div>
            <div className="text-arch-code">
              React<br />
              &nbsp;&nbsp;↓<br />
              API Gateway<br />
              &nbsp;&nbsp;↓<br />
              Lambda<br />
              &nbsp;&nbsp;↓<br />
              Rekognition<br />
              &nbsp;&nbsp;↓<br />
              DynamoDB
            </div>
          </div>
        </div>

        {/* AWS Services Grid */}
        <div className="main-card">
          <h2 className="card-title">AWS Services Utilized</h2>
          <p className="card-subtitle">Serverless building blocks powering the access control pipeline</p>

          <div className="services-grid">
            {awsServices.map((svc) => (
              <div key={svc.name} className="service-card">
                <div className="service-icon-box">{svc.icon}</div>
                <div className="service-info">
                  <h3 className="service-name">{svc.name}</h3>
                  <span className="service-role">{svc.role}</span>
                  <p className="service-desc">{svc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
