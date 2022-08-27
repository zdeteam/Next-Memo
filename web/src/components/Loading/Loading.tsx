import React from "react";
import "./loading.less";

const Loading = () => {
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

export default Loading;
