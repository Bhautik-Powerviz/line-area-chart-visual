import * as React from "react";
import { BAR_CHART_RACE_SETTINGS } from "../constants";
import { EAutoCustomType, EBarChartRaceSettings } from "../enum";
import { adjoinRGB, splitRGB } from "../methods";
import OptionsTooltip from "./OptionsTooltip";
import SelectControl from "@truviz/shadow/dist/Components/Editor/Components/SelectControl";
import NumberControl from "@truviz/shadow/dist/Components/Editor/Components/NumberControl";
import ColorPicker from "@truviz/shadow/dist/Components/Editor/Components/ColorPicker";
import FontSelector from "@truviz/shadow/dist/Components/Editor/Components/FontSelector";
import { ILabelValuePair } from "../visual-settings.model";

const BarChartRaceSettings = (props) => {
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
      ...BAR_CHART_RACE_SETTINGS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...BAR_CHART_RACE_SETTINGS };
  }

  const applyChanges = () => {
    shadow.persistProperties(sectionName, propertyName, configValues);
    closeCurrentSettingHandler();
  };

  const [configValues, setConfigValues] = React.useState({
    ...initialStates,
  });

  const handleChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: val,
    }));
  };

  const handleCheckbox = (n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: !d[n],
    }));
  };

  const handleColor = ({ rgb }, n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: adjoinRGB(rgb),
    }));
  };

  const LabelsFontSizeTypeList: ILabelValuePair[] = [
    {
      label: "Auto",
      value: EAutoCustomType.Auto,
    },
    {
      label: "Custom",
      value: EAutoCustomType.Custom,
    },
  ];

  return (
    <>
      <OptionsTooltip />
      <div className="config-container">
        <div className="config-options-wrapper">
          <div className="config-title" data-tip="Enable to apply the bar transition">
            <p>Allow Transition</p>
            <label className="switch">
              <input
                type="checkbox"
                onChange={(e: any) => handleCheckbox(EBarChartRaceSettings.AllowTransition)}
                checked={configValues[EBarChartRaceSettings.AllowTransition]}
              />
              <span className="slider round"></span>
              {configValues[EBarChartRaceSettings.AllowTransition] ? (
                <span className="switch-text switch-text-on">On</span>
              ) : (
                <span className="switch-text switch-text-off">Off</span>
              )}
            </label>
          </div>

          <div className="mb-15">
            <p className="config-label">
              <span data-tip="Set the bar transition duration">Transition Duration</span>
            </p>
            <NumberControl
              value={configValues[EBarChartRaceSettings.BarTransitionDuration] + ""}
              controlName={EBarChartRaceSettings.BarTransitionDuration}
              stepValue={1}
              handleChange={(e: any) => {
                handleChange(+e, EBarChartRaceSettings.BarTransitionDuration);
              }}
            />
          </div>

          <div className="mb-15">
            <p className="config-label">
              <span data-tip="Set bar race data change interval in milliseconds">Data Change Interval (in ms)</span>
            </p>
            <NumberControl
              value={configValues[EBarChartRaceSettings.DataChangeInterval] + ""}
              controlName={EBarChartRaceSettings.DataChangeInterval}
              stepValue={1}
              handleChange={(e: any) => {
                handleChange(+e, EBarChartRaceSettings.DataChangeInterval);
              }}
            />
          </div>

          <div className="config-color-label">
            <p className="config-label">
              <span data-tip="Choose the label color">Label Color</span>
            </p>
            <ColorPicker
              color={splitRGB(configValues[EBarChartRaceSettings.LabelColor])}
              handleChange={(c) => handleColor(c, EBarChartRaceSettings.LabelColor)}
            />
          </div>

          <div className="mb-15">
            <p className="config-label">
              <span data-tip="Select the label font size type">Label Font Size Type</span>
            </p>
            <SelectControl
              selectedValue={configValues[EBarChartRaceSettings.LabelFontSizeType]}
              optionsList={LabelsFontSizeTypeList}
              onChange={(e) => handleChange(e.value, EBarChartRaceSettings.LabelFontSizeType)}
            />
          </div>

          {configValues[EBarChartRaceSettings.LabelFontSizeType] === EAutoCustomType.Custom && (
            <div className="mb-15">
              <p className="config-label">
                <span data-tip="Set the label font size">Label Font Size</span>
              </p>
              <NumberControl
                value={configValues[EBarChartRaceSettings.LabelFontSize] + ""}
                controlName={EBarChartRaceSettings.LabelFontSize}
                stepValue={1}
                handleChange={(e: any) => {
                  handleChange(+e, EBarChartRaceSettings.LabelFontSize);
                }}
              />
            </div>
          )}

          <div className="mb10">
            <p className="config-label" data-tip="Select the label font family">
              Label Font Family
            </p>
            <FontSelector
              value={configValues[EBarChartRaceSettings.LabelFontFamily]}
              handleChange={(d) => {
                handleChange(d.value, EBarChartRaceSettings.LabelFontFamily);
              }}
            />
          </div>

          <div className="mb-15">
            <p className="config-label">
              <span data-tip="Set bar play/pause ticker button radius type">Ticker Button Radius Type</span>
            </p>
            <SelectControl
              selectedValue={configValues[EBarChartRaceSettings.TickerButtonRadiusType]}
              optionsList={LabelsFontSizeTypeList}
              onChange={(e) => handleChange(e.value, EBarChartRaceSettings.TickerButtonRadiusType)}
            />
          </div>

          {configValues[EBarChartRaceSettings.TickerButtonRadiusType] === EAutoCustomType.Custom && (
            <div className="mb-15">
              <p className="config-label">
                <span data-tip="Set bar play/pause ticker button radius">Ticker Button Radius</span>
              </p>
              <NumberControl
                value={configValues[EBarChartRaceSettings.TickerButtonRadius] + ""}
                controlName={EBarChartRaceSettings.TickerButtonRadius}
                stepValue={1}
                handleChange={(e: any) => {
                  handleChange(+e, EBarChartRaceSettings.TickerButtonRadius);
                }}
              />
            </div>
          )}

          <div className="config-color-label">
            <p className="config-label">
              <span data-tip="Choose ticker button color">Ticker Button Color</span>
            </p>
            <ColorPicker
              color={splitRGB(configValues[EBarChartRaceSettings.TickerButtonColor])}
              handleChange={(c) => handleColor(c, EBarChartRaceSettings.TickerButtonColor)}
            />
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

export default BarChartRaceSettings;
