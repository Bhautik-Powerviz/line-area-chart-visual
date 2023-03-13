import * as React from "react";
import Select from "react-select";
const FONTS_LIST = [
  {
    label: "Arial",
    value: "Arial",
  },
  {
    label: "Arial Black",
    value: "Arial Black",
  },
  {
    label: "Arial Unicode MS",
    value: "Arial Unicode MS",
  },
  {
    label: "Calibri",
    value: "Calibri",
  },
  {
    label: "Cambria",
    value: "Cambria",
  },
  {
    label: "Cambria Math",
    value: "Cambria Math",
  },
  {
    label: "Candara",
    value: "Candara",
  },
  {
    label: "Comic Sans MS",
    value: "Comic Sans MS",
  },
  {
    label: "Consolas",
    value: "Consolas",
  },
  {
    label: "Constantia",
    value: "Constantia",
  },
  {
    label: "Corbel",
    value: "Corbel",
  },
  {
    label: "Courier New",
    value: "Courier New",
  },
  {
    label: "Georgia",
    value: "Georgia",
  },
  {
    label: "Lucida Sans Unicode",
    value: "Lucida Sans Unicode",
  },
  {
    label: "Segoe (Bold)",
    value: "Segoe UI Bold",
  },
  {
    label: "Segoe UI",
    value: "Segoe UI",
  },
  {
    label: "Segoe UI Light",
    value: "Segoe UI Light",
  },
  {
    label: "Symbol",
    value: "Symbol",
  },
  {
    label: "Tahoma",
    value: "Tahoma",
  },
  {
    label: "Times New Roman",
    value: "Times New Roman",
  },
  {
    label: "Trebuchet MS",
    value: "Trebuchet MS",
  },
  {
    label: "Verdana",
    value: "Verdana",
  },
  {
    label: "Wingdings",
    value: "Wingdings",
  },
];

const colorStyles = {
  input: (styles) => ({
    ...styles,
    padding: 0,
    margin: 0,
  }),
  menu: (styles) => ({
    ...styles,
    position: "relative",
  }),
  option: (p, s) => {
    return {
      ...p,
      paddingTop: `3px`,
      paddingBottom: `3px`,
      fontFamily: s.value,
    };
  },
  singleValue: (s, o) => {
    return {
      ...s,
      fontFamily: o.data.value,
      fontSize: "14px",
    };
  },
};

const FontSelector = ({ value, handleChange }) => {
  const selectedObject = FONTS_LIST.find((f) => f.value === value);
  return (
    <div className="font-select-container">
      <Select value={selectedObject} options={FONTS_LIST} styles={colorStyles} onChange={handleChange} />
    </div>
  );
};

export default FontSelector;
