import React from 'react';
import termsConditionsData from '../content/terms.json';
import '../styles/policy.css';

const PolicySection = ({ title, content }) => (
  <div className="policy-section">
    <h3 className="policy-section-title">{title}</h3>
    {content.map((paragraph, index) => (
      <p key={index} className="policy-section-paragraph">
        {paragraph}
      </p>
    ))}
  </div>
);

const Terms = () => {
  const termsConditions = termsConditionsData;

  return (
    <div className="policy-container">
      <h1 className="policy-main-title">Terms and Conditions</h1>
      <p className="policy-effective-date">
        <strong>Effective Date: {termsConditions.effectiveDate}</strong>
      </p>
      {termsConditions.sections.map((section, index) => (
        <PolicySection
          key={index}
          title={section.title}
          content={section.content}
        />
      ))}
    </div>
  );
};

export default Terms;
