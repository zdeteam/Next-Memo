import React from "react";
import "./index.less";

const Index = () => {
  const text = "LOADING";
  return (
    <div className="loading-wrapper">
      <div className="loading-text">
        {text.split("").map((key, index) => (
          <span key={key} className="loading-text-words">
            {key}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Index;
