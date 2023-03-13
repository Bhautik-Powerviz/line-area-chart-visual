import * as React from "react";
import Select from "react-select";
import { PATTERNS } from "./../patterns";
import { ThemeContext } from "@truviz/shadow/dist/Components/Editor/Components/ThemeContext";

const PATTERNS_LIST = [];
PATTERNS.map((pattern) => {
  PATTERNS_LIST.push({
    label: pattern.patternName.split("_").join(" ").toLowerCase(),
    value: pattern.patternName,
    d: pattern.d,
    w: pattern.w,
    h: pattern.h,
  });
});

const PatternSelector = ({ value, disabled, handleChange }) => {
  let themeContext = React.useContext(ThemeContext);

  const colorStyles = {
    control: (styles, e) => ({
      ...styles,
      backgroundColor: themeContext["theme"] ? "#f1F1F1" : "#404246",
      borderColor: themeContext["theme"] ? "#E1E1E1" : "#404246",
      boxShadow: "none",
      paddingRight: "0",
      "&:hover": {
        boxShadow: "none",
      },
      minHeight: "36px",
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
        color: themeContext["theme"] ? "#000" : "#FFF",
        "& .svg-pattern-preview": {
          borderColor: "transparent !important",
        },
      };
    },
    menu: (styles) => ({
      ...styles,
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

  const selectedObject = PATTERNS_LIST.find((f) => f.value === value);
  return (
    <div className="font-select-container">
      <Select
        value={selectedObject}
        options={PATTERNS_LIST}
        styles={colorStyles}
        onChange={handleChange}
        isDisabled={disabled}
        placeholder={"Select Pattern"}
        formatOptionLabel={(data, { selectValue }) => {
          const svgHeight = 26;
          return (
            // <div style={{height: data.label !== "" ? "40px" : "20px"}}>
            <div style={{ display: "flex", opacity: disabled ? 0.3 : 1 }}>
              {data.label !== "" && (
                <svg
                  className="svg-pattern-preview"
                  style={{
                    width: "30px",
                    height: `${svgHeight}px`,
                    backgroundColor: "#FFF",
                    border: "1px solid",
                    borderColor: selectValue[0].value === data.value ? "#EDD12E" : "#DBDBDB",
                  }}
                >
                  <rect
                    width="30"
                    height={data.h}
                    fill={`url('#${data.value}_PREVIEW')`}
                    transform={`translate(0, ${(svgHeight - data.h) / 2})`}
                  />
                </svg>
              )}
              <p
                style={{
                  fontSize: "13px",
                  padding: "3px 0px 3px 6px",
                  maxWidth: "115px",
                }}
              >
                {data.label !== "" ? data.label : disabled ? "Image Applied" : "None"}
              </p>
            </div>
          );
        }}
        menuPortalTarget={document.querySelector(".popup-container")}
        menuPosition={"fixed"}
        menuShouldBlockScroll={true}
        defaultValue={PATTERNS_LIST[0]}
        components={{
          IndicatorSeparator: () => null,
        }}
      />
    </div>
  );
};

export default PatternSelector;
