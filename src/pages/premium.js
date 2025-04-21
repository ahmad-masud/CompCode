import React from "react";
import "../styles/premium.css";
import { useUser } from "../context/usercontext";
import usePayment from "../hooks/usePayment";

const Premium = () => {
  const { user, premiumInfo } = useUser();
  const { createCheckout, openCustomerPortal } = usePayment();

  return (
    <div className="premium-page">
      <p className="premium-title">Premium</p>
      <p className="premium-info">Choose your subscription plan</p>
      <div className="subscription-options">
        <div className="subscription-option">
          <p className="subscription-title">Free</p>
          <p className="subscription-cost">
            <span>$</span>0<span>USD | month</span>
          </p>
          <button className="checkout-button disabled">
            {user
              ? premiumInfo.premium
                ? "Previous Plan"
                : "Current Plan"
              : "Free Plan"}
          </button>
          <div className="subscription-features">
            <p className="subscription-feature">
              <i className="fa-solid fa-check"></i> Company-wise problems
            </p>
            <p className="subscription-feature">
              <i className="fa-solid fa-check"></i> Roadmap problems and
              solutions
            </p>
            <p className="subscription-feature">
              <i className="fa-solid fa-check"></i> Free-tier lessons
            </p>
          </div>
        </div>
        <div className="subscription-option">
          <p className="subscription-title">Premium</p>
          <p className="subscription-cost">
            <span>$</span>5<span>USD | month</span>
          </p>
          <button
            className={
              "checkout-button" + (premiumInfo.premium ? " disabled" : "")
            }
            onClick={() =>
              createCheckout("price_1Q9xzfFyVXgjLrCzwNw8Hrxc", true)
            }
          >
            {premiumInfo.premium ? "Current Plan" : "Upgrade to Premium"}
          </button>
          <div className="subscription-features">
            <p className="subscription-feature">
              <i className="fa-solid fa-check"></i> Company-wise problems
            </p>
            <p className="subscription-feature">
              <i className="fa-solid fa-check"></i> Roadmap problems and
              solutions
            </p>
            <p className="subscription-feature">
              <i className="fa-solid fa-check"></i> Free-tier lessons
            </p>
            <p className="subscription-feature">
              <i className="fa-solid fa-check"></i> Frequency count for
              company-wise problems
            </p>
            <p className="subscription-feature">
              <i className="fa-solid fa-check"></i> Premium-tier lessons
            </p>
          </div>
          {premiumInfo.premium && (
            <button className="manage-button" onClick={openCustomerPortal}>
              Manage my subscription
            </button>
          )}
          {premiumInfo.premium &&
            premiumInfo.canceled &&
            premiumInfo.subscriptionEnd && (
              <p className="cancel-info">
                You will have access to premium until{" "}
                {premiumInfo.subscriptionEnd.toDate().toLocaleDateString()}.
              </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default Premium;
