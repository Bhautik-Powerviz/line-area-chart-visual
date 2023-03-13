import * as React from "react";
import chroma from "chroma-js";
import { CHART_SETTINGS, DATA_COLORS } from "../constants";
import { adjoinRGB, isValidHexColor, splitRGB } from "../methods";
import { COLORBREWER } from "../color-schemes";
import { BarType, ColorPaletteType, EDataColorsSettings, EVisualConfig, EVisualSettings } from "../enum";
import { IChartSettings } from "../visual-settings.model";
import OptionsTooltip from "./OptionsTooltip";
import SelectControl from "@truviz/shadow/dist/Components/Editor/Components/SelectControl";
import ColorPicker from "@truviz/shadow/dist/Components/Editor/Components/ColorPicker";
import { hexToRGBString } from "powerbi-visuals-utils-colorutils";

const DataColorsSettings = (props) => {
  const {
    shadow,
    compConfig: { sectionName, propertyName },
    vizOptions,
    closeCurrentSettingHandler,
  } = props;

  let initialStates = vizOptions.formatTab[sectionName][propertyName];
  try {
    initialStates = JSON.parse(initialStates);
    initialStates = {
      ...DATA_COLORS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...DATA_COLORS };
  }

  const [dataColorsValues, setDataColorValues] = React.useState({
    ...initialStates,
  });

  const [isReverseColor, setIsReverseColor] = React.useState(dataColorsValues[EDataColorsSettings.reverse]);
  const [schemeColors, setSchemeColors] = React.useState([]);

  React.useEffect(() => {
    setDataColorValues((d) => ({
      ...d,
      [EDataColorsSettings.SubCategoriesColorMap]: shadow.subCategoriesColorMap,
    }));
  }, []);

  React.useEffect(() => {
    setDataColorValues((d) => ({
      ...d,
      [EDataColorsSettings.reverse]: isReverseColor,
    }));
  }, [isReverseColor]);

  const getSchemeColors = (reverse: boolean) => {
    return Object.keys(COLORBREWER[dataColorsValues.fillType] ?? {}).map((colorScheme, index) => {
      if (dataColorsValues.colorBlindSafe && !COLORBREWER[dataColorsValues.fillType][colorScheme].colorBlindSafe) {
        return;
      }
      let colorScale = chroma.scale(COLORBREWER[dataColorsValues.fillType][colorScheme].colors).domain([0, 1]);
      let noOfClasses = 8;

      if (reverse) {
        colorScale.domain([1, 0]);
      }
      let colors = [];
      [...Array(noOfClasses)].map((e, i) => {
        colors.push(
          "rgb(" +
            colorScale(i / noOfClasses)
              .rgb()
              .join() +
            ")"
        );
      });

      return { colorScheme, index, colors };
    });
  };

  React.useEffect(() => {
    if (["diverging", "qualitative", "sequential", "ibcsTheme"].includes(dataColorsValues.fillType)) {
      const schemeColors = getSchemeColors(dataColorsValues.reverse);
      setSchemeColors(schemeColors);
    }
  }, []);

  React.useEffect(() => {
    if (["diverging", "qualitative", "sequential", "ibcsTheme"].includes(dataColorsValues.fillType)) {
      const schemeColors = getSchemeColors(dataColorsValues.reverse);
      setSchemeColors(schemeColors);
    }
  }, [dataColorsValues.fillType]);

  React.useEffect(() => {
    if (["diverging", "qualitative", "sequential"].includes(dataColorsValues.fillType)) {
      const schemeColors = getSchemeColors(isReverseColor);
      const index = schemeColors.find((c) => c.colorScheme === dataColorsValues.colorScheme);
      setSchemeColors(schemeColors);
      setDataColorValues((d) => ({
        ...d,
        [EDataColorsSettings.schemeColors]: index.colors,
      }));
    }
  }, [isReverseColor]);

  let subCategories =
    vizOptions.options.dataViews[0].categorical?.categories[1]?.values.map((value) => value.toString()) ?? [];
  subCategories = subCategories.filter((v, i, a) => a.findIndex((t) => t === v) === i);
  subCategories.sort((a, b) => a.localeCompare(b));

  const applyChanges = () => {
    if (!dataColorsValues[EDataColorsSettings.selectedCategoryName]) {
      dataColorsValues[EDataColorsSettings.selectedCategoryName] = subCategories[0];
    }
    shadow.persistProperties(sectionName, propertyName, dataColorsValues);
    closeCurrentSettingHandler();
  };

  let chartSettings: IChartSettings = shadow[EVisualSettings.ChartSettings];

  if (!Object.keys(chartSettings).length) {
    chartSettings = { ...CHART_SETTINGS };
  }

  const handleValue = (v, n) => {
    setDataColorValues((d) => ({
      ...d,
      [n]: v,
    }));
  };

  const handleColorChange = ({ rgb }, n) => {
    setDataColorValues((d) => ({
      ...d,
      [n]: adjoinRGB(rgb),
    }));
  };

  const handleCheckbox = (key) => {
    setDataColorValues((d) => ({
      ...d,
      [key]: !d[key],
    }));
  };

  const handleSubcategoriesMapColorChange = (key: string, color: string): void => {
    setDataColorValues((d) => ({
      ...d,
      [EDataColorsSettings.SubCategoriesColorMap]: { ...d[EDataColorsSettings.SubCategoriesColorMap], [key]: color },
    }));
  };

  const setColorPalette = (colorScheme, co) => {
    setDataColorValues((d) => ({ ...d, colorScheme: colorScheme, schemeColors: co }));
  };

  const selectedColorPaletteRef = React.useRef(null);

  React.useEffect(() => {
    if (selectedColorPaletteRef.current && dataColorsValues.colorScheme !== "") {
      selectedColorPaletteRef.current.scrollIntoView();
    }
  }, []);

  const colorPaletteDropdownList = [
    {
      label: "Single",
      value: "single",
    },
    {
      label: "Power BI Theme",
      value: "powerBi",
    },
    {
      label: "Gradient",
      value: "gradient",
    },

    {
      label: "Sequential",
      value: "sequential",
    },
    {
      label: "Diverging",
      value: "diverging",
    },
    {
      label: "Qualitative",
      value: "qualitative",
    },
  ];

  if (chartSettings.isIBCSThemeEnabled) {
    colorPaletteDropdownList.push({
      label: "IBCS Theme",
      value: "ibcsTheme",
    });
  }

  colorPaletteDropdownList.push({
    label:
      chartSettings.barType === BarType.Normal
        ? `By ${shadow.categoryDisplayName}`
        : shadow.categoricalLegendsData
        ? `By ${shadow.subCategoryDisplayName}`
        : "By Measures",
    value: "byCategory",
  });

  return (
    <>
      <OptionsTooltip />
      <div className="config-container config-container-vertical config-container-colors data-colors-settings">
        <div className="config-options-wrapper">
          <div>
            <div className="mb-15">
              <p className="config-label">
                <span data-tip="Choose a color schema to apply">Color Palette</span>
              </p>
              <SelectControl
                selectedValue={dataColorsValues.fillType}
                optionsList={colorPaletteDropdownList}
                onChange={(d) => handleValue(d.value, "fillType")}
              />
            </div>

            {dataColorsValues.fillType === ColorPaletteType.Single && (
              <div className="config-color-label">
                <p className="config-label" data-tip="Choose a color for single color schema">
                  Color
                </p>
                <ColorPicker
                  color={splitRGB(dataColorsValues.barColor)}
                  handleChange={(c) => handleColorChange(c, "barColor")}
                />
              </div>
            )}

            {dataColorsValues.fillType === ColorPaletteType.IBCSTheme && (
              <div className="color-palettes-container">
                {schemeColors.map((data, index) => {
                  const colorScheme = data.colorScheme;
                  const colors = data.colors;
                  let dynamicAttr = {
                    ...(colorScheme === dataColorsValues.colorScheme && { ref: selectedColorPaletteRef }),
                  };

                  return (
                    <fieldset
                      key={index}
                      className={`color-palette-wrapper ${
                        colorScheme === dataColorsValues.colorScheme ? "color-palette-selected" : ""
                      }`}
                      onClick={() => setColorPalette(colorScheme, colors)}
                      {...dynamicAttr}
                    >
                      <legend className="config-label">{colorScheme}</legend>
                      <div className={`color-palette`}>
                        {colors.map((cs) => {
                          return (
                            <>
                              <div className="color-palette-individual" style={{ backgroundColor: cs }}></div>
                            </>
                          );
                        })}
                      </div>
                    </fieldset>
                  );
                })}
              </div>
            )}

            {dataColorsValues.fillType === "gradient" && (
              <>
                {chartSettings.barType !== BarType.Stacked && chartSettings.barType !== BarType.GroupedStacked && (
                  <div data-tip="Enable the gradient within bar">
                    <label htmlFor="enable-popout-checkbox" className="checkbox-container">
                      <input
                        type="checkbox"
                        id="enable-popout-checkbox"
                        checked={dataColorsValues.isGradientWithinBar}
                        onChange={() => handleCheckbox("isGradientWithinBar")}
                      />
                      Gradient Within Bar
                      <span></span>
                    </label>
                  </div>
                )}

                <label
                  htmlFor="mid-color-checkbox"
                  className="checkbox-container"
                  data-tip="Add mid color point to the gradient color schema"
                >
                  <input
                    id="mid-color-checkbox"
                    type="checkbox"
                    checked={dataColorsValues.midcolor}
                    onClick={() => handleCheckbox("midcolor")}
                  />
                  Mid Color
                  <span></span>
                </label>

                <div
                  className={`gradient-color-picker-wrapper ${
                    dataColorsValues.midcolor ? `three-color-gradient` : `two-color-gradient`
                  }`}
                >
                  <div className="gradient-color-picker">
                    <ColorPicker
                      color={splitRGB(dataColorsValues.fillmin)}
                      handleChange={(c) => handleColorChange(c, "fillmin")}
                    />
                    <p data-tip="Choose the gradient start color">Minimum</p>
                  </div>
                  {dataColorsValues.midcolor && (
                    <div className="gradient-color-picker">
                      <ColorPicker
                        color={splitRGB(dataColorsValues.fillmid)}
                        handleChange={(c) => handleColorChange(c, "fillmid")}
                      />
                      <p data-tip="CChoose the gradient middle color">Middle</p>
                    </div>
                  )}

                  <div className="gradient-color-picker">
                    <ColorPicker
                      color={splitRGB(dataColorsValues.fillmax)}
                      handleChange={(c) => handleColorChange(c, "fillmax")}
                    />
                    <p data-tip="Choose the gradient end color">Maximum</p>
                  </div>
                </div>
              </>
            )}

            {dataColorsValues.fillType === ColorPaletteType.ByCategory && (
              <React.Fragment>
                <div className="color-palettes-container">
                  <div className="categories-color-list">
                    {Object.keys(dataColorsValues[EDataColorsSettings.SubCategoriesColorMap]).map((key) => {
                      const color = dataColorsValues[EDataColorsSettings.SubCategoriesColorMap][key];
                      return (
                        <div className="config-color-label mb-15">
                          <p className="config-label">
                            <span> {key} </span>
                          </p>
                          <ColorPicker
                            color={splitRGB(isValidHexColor(color) ? hexToRGBString(color) : color)}
                            handleChange={(c) => handleSubcategoriesMapColorChange(key, adjoinRGB(c.rgb))}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </React.Fragment>
            )}

            {["diverging", "qualitative", "sequential"].includes(dataColorsValues.fillType) && (
              <>
                {dataColorsValues.fillType !== "sequential" && (
                  <label
                    data-tip="Show color blind safe only"
                    htmlFor="color-blind-safe-checkbox"
                    className="checkbox-container sm-text"
                  >
                    <input
                      type="checkbox"
                      id="color-blind-safe-checkbox"
                      onChange={(e: any) => handleCheckbox("colorBlindSafe")}
                      checked={dataColorsValues.colorBlindSafe}
                    />
                    Show color blind safe only
                    <span></span>
                  </label>
                )}

                <div className="color-palettes-container">
                  {schemeColors.map((data, index) => {
                    const colorScheme = data.colorScheme;
                    const colors = data.colors;
                    let dynamicAttr = {
                      ...(colorScheme === dataColorsValues.colorScheme && { ref: selectedColorPaletteRef }),
                    };

                    return (
                      <fieldset
                        key={index}
                        className={`color-palette-wrapper ${
                          colorScheme === dataColorsValues.colorScheme ? "color-palette-selected" : ""
                        }`}
                        onClick={() => setColorPalette(colorScheme, colors)}
                        {...dynamicAttr}
                      >
                        <legend className="config-label">{colorScheme}</legend>
                        <div className={`color-palette`}>
                          {colors.map((cs) => {
                            return (
                              <>
                                <div className="color-palette-individual" style={{ backgroundColor: cs }}></div>
                              </>
                            );
                          })}
                        </div>
                      </fieldset>
                    );
                  })}
                </div>

                <label
                  data-tip="Reverse colors of the selected color schema"
                  htmlFor="reverse-colors-checkbox"
                  className="checkbox-container"
                >
                  <input
                    type="checkbox"
                    id="reverse-colors-checkbox"
                    checked={dataColorsValues.reverse}
                    onClick={() => setIsReverseColor((d) => !d)}
                  />
                  Reverse Colors
                  <span></span>
                </label>
              </>
            )}
          </div>
        </div>

        <div className="config-btn-wrapper">
          <button className="btn-cancel" onClick={closeCurrentSettingHandler}>
            Cancel
          </button>
          <button className="btn-apply" onClick={applyChanges}>
            Apply
          </button>
        </div>
      </div>
    </>
  );
};

export default DataColorsSettings;
