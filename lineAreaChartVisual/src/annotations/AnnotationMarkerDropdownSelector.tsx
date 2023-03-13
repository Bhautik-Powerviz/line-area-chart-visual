import * as React from "react";
import Select, { components } from "react-select";
/* import { ThemeContext } from '@truviz/shadow/dist/Components/Editor/Components/ThemeContext'; */

const OPTIONS_LIST = [
  {
    label: "MARKER",
    options: [
      {
        label: "None",
        value: "none",
      },
      {
        label: "Arrow Marker",
        value: "arrow",
      },
      {
        label: "Dot Marker",
        value: "dot",
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

const AnnotationMarkerDropdownSelector = ({ value, color, theme, handleChange }) => {
  // const themeContext = React.useContext(ThemeContext);
  const colorStyles = {
    control: (styles, e) => ({
      ...styles,
      maxWidth: "50px",
      minHeight: "28px",
      backgroundColor: theme === "true" ? "#f1F1F1" : "#404246",
      borderColor: theme === "true" ? "#E1E1E1" : "#404246",
      border: "none",
      boxShadow: "none",
      paddingRight: "0",
      "&:hover": {
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
        background: s.isSelected ? "#F4F3F0" : "#FFFFFF",
        "&:hover": {
          backgroundColor: "#F4F3F0",
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
              {data.value == "none" && (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 25 25">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(74, 74, 74, 1)"></circle>
                  <path fill="none" stroke="rgba(74, 74, 74, 1)" stroke-width="3" d="M 19 5 L 5 19"></path>
                  <title>Disable Marker</title>
                </svg>
              )}

              {data.value == "arrow" && (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 30 25">
                  <defs>
                    <marker
                      id="arrowMarker"
                      viewBox="0 0 10 10"
                      refX="0"
                      refY="5"
                      markerUnits="strokeWidth"
                      markerWidth="5"
                      markerHeight="4"
                      orient="auto"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill={color}></path>
                    </marker>
                  </defs>
                  <path
                    fill="none"
                    stroke={color}
                    stroke-width="3"
                    d="M 4 12.5 L 16 12.5"
                    marker-end="url(#arrowMarker)"
                  ></path>
                </svg>
              )}

              {data.value == "dot" && (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 30 25">
                  <defs>
                    <marker
                      id="dotMarker"
                      viewBox="0 0 10 10"
                      refX="1"
                      refY="5"
                      markerUnits="strokeWidth"
                      markerWidth="5"
                      markerHeight="4"
                      orient="auto"
                    >
                      <circle cx="5" cy="5" r="4" fill={color}></circle>
                    </marker>
                  </defs>
                  <path
                    fill="none"
                    stroke={color}
                    stroke-width="3"
                    d="M 4 12.5 L 16 12.5"
                    marker-end="url(#dotMarker)"
                  ></path>
                  <title>Dot Marker</title>
                </svg>
              )}

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

export default AnnotationMarkerDropdownSelector;
