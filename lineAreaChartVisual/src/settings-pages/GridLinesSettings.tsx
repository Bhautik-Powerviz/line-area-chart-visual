import * as React from "react";
import { GRID_LINES_SETTINGS } from "../constants";
import { EGridLinesSettings, LineType } from "../enum";
import { adjoinRGB, splitRGB } from "../methods";
import OptionsTooltip from "./OptionsTooltip";
import SelectControl from "@truviz/shadow/dist/Components/Editor/Components/SelectControl";
import NumberControl from "@truviz/shadow/dist/Components/Editor/Components/NumberControl";
import ColorPicker from "@truviz/shadow/dist/Components/Editor/Components/ColorPicker";
import { ILabelValuePair } from "../visual-settings.model";

const GridLinesSettings = (props) => {
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
      ...GRID_LINES_SETTINGS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...GRID_LINES_SETTINGS };
  }

  const applyChanges = () => {
    shadow.persistProperties(sectionName, propertyName, configValues);
    closeCurrentSettingHandler();
  };

  const [configValues, setConfigValues] = React.useState({
    ...initialStates,
  });

  const handleChange = (val, n, gridType: string) => {
    setConfigValues((d) => ({
      ...d,
      [gridType]: { ...d[gridType], [n]: val },
    }));
  };

  const handleCheckbox = (n, gridType: string) => {
    setConfigValues((d) => ({
      ...d,
      [gridType]: { ...d[gridType], [n]: !d[gridType][n] },
    }));
  };

  const handleColor = ({ rgb }, n, gridType: string) => {
    setConfigValues((d) => ({
      ...d,
      [gridType]: { ...d[gridType], [n]: adjoinRGB(rgb) },
    }));
  };

  const LineTypes: ILabelValuePair[] = [
    {
      label: "Solid",
      value: LineType.Solid,
    },
    {
      label: "Dotted",
      value: LineType.Dotted,
    },
    {
      label: "Dashed",
      value: LineType.Dashed,
    },
  ];

  return (
    <>
      <OptionsTooltip />
      <div className="config-container">
        <div className="config-options-wrapper">
          <div className="config-title" data-tip="Show grid lines followed by X axis">
            <p>X-axis Grid Lines</p>
            <label className="switch">
              <input
                type="checkbox"
                onChange={(e: any) => handleCheckbox(EGridLinesSettings.show, EGridLinesSettings.xGridLines)}
                checked={configValues[EGridLinesSettings.xGridLines].show}
              />
              <span className="slider round"></span>
              {configValues[EGridLinesSettings.xGridLines].show ? (
                <span className="switch-text switch-text-on">On</span>
              ) : (
                <span className="switch-text switch-text-off">Off</span>
              )}
            </label>
          </div>

          {configValues[EGridLinesSettings.xGridLines].show && (
            <>
              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Select the grid line type">Line Type</span>
                </p>
                <SelectControl
                  selectedValue={configValues[EGridLinesSettings.xGridLines].lineType}
                  optionsList={LineTypes}
                  onChange={(d) => handleChange(d.value, EGridLinesSettings.lineType, EGridLinesSettings.xGridLines)}
                />
              </div>

              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Set the grid line width">Line Width</span>
                </p>
                <NumberControl
                  value={configValues[EGridLinesSettings.xGridLines].lineWidth}
                  controlName={EGridLinesSettings.lineWidth}
                  stepValue={1}
                  handleChange={(e: any) =>
                    handleChange(+e, EGridLinesSettings.lineWidth, EGridLinesSettings.xGridLines)
                  }
                />
              </div>

              <div className="config-color-label">
                <p className="config-label">
                  <span data-tip="Set the grid line color">Line Color</span>
                </p>
                <ColorPicker
                  color={splitRGB(configValues[EGridLinesSettings.xGridLines].lineColor)}
                  handleChange={(c) => handleColor(c, "lineColor", EGridLinesSettings.xGridLines)}
                />
              </div>
            </>
          )}

          <div className="config-title" data-tip="Show grid lines followed by the Y axis">
            <p>Y-axis Grid Lines</p>
            <label className="switch">
              <input
                type="checkbox"
                onChange={(e: any) => handleCheckbox(EGridLinesSettings.show, EGridLinesSettings.yGridLines)}
                checked={configValues[EGridLinesSettings.yGridLines].show}
              />
              <span className="slider round"></span>
              {configValues[EGridLinesSettings.yGridLines].show ? (
                <span className="switch-text switch-text-on">On</span>
              ) : (
                <span className="switch-text switch-text-off">Off</span>
              )}
            </label>
          </div>

          {configValues[EGridLinesSettings.yGridLines].show && (
            <>
              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Select the grid line type">Line Type</span>
                </p>
                <SelectControl
                  selectedValue={configValues[EGridLinesSettings.yGridLines].lineType}
                  optionsList={LineTypes}
                  onChange={(d) => handleChange(d.value, EGridLinesSettings.lineType, EGridLinesSettings.yGridLines)}
                />
              </div>

              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Set the grid line width">Line Width</span>
                </p>
                <NumberControl
                  value={configValues[EGridLinesSettings.yGridLines].lineWidth}
                  controlName={EGridLinesSettings.lineWidth}
                  stepValue={1}
                  handleChange={(e: any) =>
                    handleChange(+e, EGridLinesSettings.lineWidth, EGridLinesSettings.yGridLines)
                  }
                />
              </div>

              <div className="config-color-label">
                <p className="config-label">
                  <span data-tip="Set the grid line color">Line Color</span>
                </p>
                <ColorPicker
                  color={splitRGB(configValues[EGridLinesSettings.yGridLines].lineColor)}
                  handleChange={(c) => handleColor(c, "lineColor", EGridLinesSettings.yGridLines)}
                />
              </div>
            </>
          )}
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

export default GridLinesSettings;
