import * as React from "react";
import ReactTooltip from "react-tooltip";

const OptionTooltip = () => {
  return (
    <ReactTooltip place="top" effect="solid" className="shadow-option-tooltip" type="light" offset={{ top: -5 }} />
  );
};

export default OptionTooltip;
