import React from "react";
import "../Style/Spinner.css";

const Spinner = () => {
  return (
    <div className="spinner start">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="spinner-blade"></div>
      ))}
    </div>
  );
};

export default Spinner;
