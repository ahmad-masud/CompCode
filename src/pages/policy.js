import React from 'react';
import privacyPolicyData from '../content/policy.json';
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

const Policy = () => {
  const privacyPolicy = privacyPolicyData;

  return (
    <div className="policy-container">
      <h1 className="policy-main-title">Privacy Policy</h1>
      <p className="policy-effective-date">
        <strong>Effective Date: {privacyPolicy.effectiveDate}</strong>
      </p>
      {privacyPolicy.sections.map((section, index) => (
        <PolicySection
          key={index}
          title={section.title}
          content={section.content}
        />
      ))}
    </div>
  );
};

export default Policy;
