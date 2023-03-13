import * as React from "react";
import { SketchPicker } from "react-color";

const ColorPicker = ({ handleChange, color }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleClick = () => setIsOpen((o) => !o);
  const handleClose = () => setIsOpen(false);

  const [inColor, setInColor] = React.useState(color);

  const rgbToString = (color) => {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
  };

  const innerChangeHandler = ({ rgb }) => {
    setInColor(rgb);
  };

  const applyHandler = () => {
    handleChange({ rgb: inColor });
    handleClose();
  };

  return (
    <div className="color-picker-module">
      <div className="swatch" onClick={handleClick}>
        <div className="color" style={{ backgroundColor: rgbToString(color) }} />
      </div>
      {isOpen ? (
        <div className="color-popover">
          <div className="cover" onClick={handleClose} />
          <div className="sketch-picker-container">
            <SketchPicker color={inColor} onChange={innerChangeHandler} />
            <div className="cover-button-container config-btn-group">
              <button className="cancel-btn btn" onClick={handleClose}>
                Cancel
              </button>
              <button className="apply-btn btn" onClick={applyHandler}>
                Apply
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ColorPicker;
