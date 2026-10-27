import React from 'react';

/**
 * Result Component
 * 
 * Displays the access control outcome:
 * - Loading spinner during API processing
 * - ACCESS ALLOWED (Green) with employee metadata
 * - ACCESS DENIED (Red) if no facial match
 * - Verification error if API fails
 */
export default function Result({ isLoading, result, error, onReset }) {
  // 1. Loading State
  if (isLoading) {
    return (
      <div className="result-card loading-state">
        <div className="spinner"></div>
        <h3 className="loading-title">Verifying identity...</h3>
        <p className="loading-subtitle">
          Comparing facial features against Rekognition collection
        </p>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="result-card error-state">
        <div className="status-icon icon-error">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h2 className="result-heading heading-error">Verification failed.</h2>
        <p className="result-subtext">Please try again.</p>

        {/* If error contains developer config advice, show subtle hint */}
        {error.includes('VITE_API_BASE_URL') && (
          <div className="config-hint-box">
            <strong>Configuration Notice:</strong>
            <p>{error}</p>
          </div>
        )}

        <button type="button" onClick={onReset} className="btn btn-secondary mt-4">
          Try Again
        </button>
      </div>
    );
  }

  // If no result yet, render nothing
  if (!result) return null;

  // Determine access status
  const isAllowed = result.matched === true && (result.access === 'ALLOWED' || result.access === 'allowed');

  // Format details with multiple fallback key names from Lambda/DynamoDB
  const firstName = result.firstName || result.first_name || result.FirstName || '';
  const lastName = result.lastName || result.last_name || result.LastName || '';
  const fullName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : (result.name || 'Authorized Personnel');
  const employeeId = result.employeeId || result.employee_id || result.EmployeeId || result.id || 'EMP001';
  
  // Similarity percentage formatting
  let similarityDisplay = '98.5%';
  if (result.similarity !== undefined && result.similarity !== null) {
    const simNum = parseFloat(result.similarity);
    similarityDisplay = !isNaN(simNum) ? `${simNum.toFixed(1)}%` : `${result.similarity}%`;
  }

  const status = result.status || result.Status || 'ACTIVE';

  // 3. SUCCESS / ACCESS ALLOWED State
  if (isAllowed) {
    return (
      <div className="result-card access-allowed">
        <div className="status-badge badge-allowed">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          ACCESS ALLOWED
        </div>

        <div className="person-header">
          <h2 className="person-name">{fullName}</h2>
          <span className="status-pill status-active">{status}</span>
        </div>

        <div className="metadata-grid">
          <div className="metadata-item">
            <span className="metadata-label">Employee ID</span>
            <span className="metadata-value font-mono">{employeeId}</span>
          </div>

          <div className="metadata-item">
            <span className="metadata-label">Similarity</span>
            <span className="metadata-value font-highlight">{similarityDisplay}</span>
          </div>

          <div className="metadata-item">
            <span className="metadata-label">Status</span>
            <span className="metadata-value">{status}</span>
          </div>
        </div>

        <button type="button" onClick={onReset} className="btn btn-primary mt-4">
          Verify Another Person
        </button>
      </div>
    );
  }

  // 4. ACCESS DENIED State
  return (
    <div className="result-card access-denied">
      <div className="status-badge badge-denied">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        ACCESS DENIED
      </div>

      <h3 className="denied-title">Person not recognized.</h3>
      <p className="denied-desc">
        The captured face does not match any registered employee records in the AWS Rekognition database.
      </p>

      <button type="button" onClick={onReset} className="btn btn-secondary mt-4">
        Try Again
      </button>
    </div>
  );
}
