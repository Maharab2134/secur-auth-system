import React from "react";

const Card = ({ children, className = "" }) => {
  return <section className={`nova-card ${className}`}>{children}</section>;
};

export default Card;
