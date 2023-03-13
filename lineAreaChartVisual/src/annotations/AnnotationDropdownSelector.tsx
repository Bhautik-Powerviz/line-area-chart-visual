import * as React from "react";
import Select, { components } from "react-select";

const CONNECTORTYPES = [
  {
    label: "CONNECTOR",
    options: [
      {
        label: "Straight Line",
        value: "line",
        d: "M 4 4 L 20 20",
        w: 20,
        h: 20,
      },
      {
        label: "Polygonal Line",
        value: "elbow",
        d: "M 2 6 L 13 14 L 22 14",
        w: 20,
        h: 20,
      },
      {
        label: "Curved Line",
        value: "curve",
        d: "M 4 6 C 17 8 9 18 21 19",
        w: 20,
        h: 20,
      },
    ],
  },
];

const STROKETYPES = [
  {
    label: "STROKE",
    options: [
      {
        label: "Solid",
        value: "solid",
        d: "M 2 12 L 24 12",
        w: 20,
        h: 20,
      },
      {
        label: "Dashed",
        value: "dashed",
        d: "M 2 12 L 24 12",
        w: 20,
        h: 20,
        strokeDashArray: "3,1",
      },
    ],
  },
];

const Group = (props) => (
  <div>
    <components.Group {...props} />
  </div>
);

const DropdownIndicator = (props) => {
  return (
    <components.DropdownIndicator {...props}>
      <img src={require("./assets/dropdown-indicator.png")} alt="" />
    </components.DropdownIndicator>
  );
};

const AnnotationDropdownSelector = ({ type, value, color, theme, handleChange }) => {
  const colorStyles = {
    control: (styles, e) => ({
      ...styles,
      maxWidth: "50px",
      minHeight: "28px",
      backgroundColor: theme === "true" ? "#f1F1F1" : "#404246",
      borderColor: theme === "true" ? "#E1E1E1" : "#404246",
      boxShadow: "none",
      paddingRight: "0",
      "&:hover": {
        boxShadow: "none",
        borderColor: theme === "true" ? "#E1E1E1" : "#404246",
      },
    }),
    input: (styles) => ({
      ...styles,
      padding: 0,
      margin: 0,
      textTransform: "capitalize",
      height: "26px",
    }),
    valueContainer: (base, s) => {
      return {
        ...base,
        textTransform: "capitalize",
        padding: "3px",
      };
    },
    dropdownIndicator: (styles, e) => ({
      ...styles,
      padding: "4px",
    }),
    option: (base, s) => {
      return {
        ...base,
        color: "#000",
        textTransform: "capitalize",
        maxHeight: "50px",
        padding: "5px",
        paddingRight: 0,
        background: s.isSelected ? "#e0e3e5b3" : "#FFFFFF",
        "&:hover": {
          backgroundColor: "#e0e3e566",
        },
      };
    },
    singleValue: (s, o) => {
      return {
        ...s,
        color: theme === "true" ? "#000" : "#FFF",
        "& p": {
          display: "none",
        },
      };
    },
    group: (styles) => ({
      ...styles,
      padding: "0px",
    }),
    groupHeading: (styles) => ({
      ...styles,
      fontSize: "10px",
      paddingTop: "5px",
    }),
    menu: (styles) => ({
      ...styles,
      width: "130px",
      marginTop: 0,
      borderRadius: 0,
      paddingLeft: "1px",
    }),
    menuList: (base) => ({
      ...base,
      "::-webkit-scrollbar": {
        width: "14px",
        height: "0px",
      },
      "::-webkit-scrollbar-track": {
        background: "transparent",
      },
      "::-webkit-scrollbar-thumb": {
        border: "4px solid rgba(0, 0, 0, 0)",
        backgroundClip: "padding-box",
        borderRadius: "8px",
        backgroundColor: "rgba(112, 112, 112, 0.4)",
      },
    }),
  };

  let OPTIONS_LIST;
  if (type == "CONNECTOR_TYPE") {
    OPTIONS_LIST = CONNECTORTYPES;
  } else if (type == "STROKE_TYPE") {
    OPTIONS_LIST = STROKETYPES;
  }

  const selectedObject = OPTIONS_LIST[0].options.find((f) => f.value === value);
  return (
    <div className="font-select-container">
      <Select
        value={selectedObject}
        options={OPTIONS_LIST}
        styles={colorStyles}
        onChange={handleChange}
        formatOptionLabel={(data) => {
          return (
            <div style={{ display: "flex" }}>
              {
                <svg
                  className="annotation-connector-style-preview"
                  style={{ width: "20px", height: "20px" }}
                  viewBox="0 0 25 25"
                >
                  <path
                    fill="none"
                    strokeWidth="3"
                    d={data.d}
                    stroke={color}
                    strokeDasharray={data.strokeDashArray ? data.strokeDashArray : ""}
                  />
                </svg>
              }
              <p
                style={{
                  fontSize: "11px",
                  padding: "3px 0px 0px 6px",
                  maxWidth: "115px",
                }}
              >
                {data.label}
              </p>
            </div>
          );
        }}
        defaultValue={OPTIONS_LIST[0].options[0]}
        isSearchable={false}
        components={{
          IndicatorSeparator: () => null,
          DropdownIndicator,
          Group,
        }}
      />
    </div>
  );
};

export default AnnotationDropdownSelector;
