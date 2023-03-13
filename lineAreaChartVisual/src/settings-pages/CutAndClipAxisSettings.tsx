import * as React from "react";
import { CUT_AND_CLIP_AXIS_SETTINGS } from "../constants";
import { ECutAndClipAxisSettings } from "../enum";
import OptionsTooltip from "./OptionsTooltip";
import NumberControl from "@truviz/shadow/dist/Components/Editor/Components/NumberControl";
import { ICutAndClipAxisSettings } from "../visual-settings.model";
import ColorPicker from "@truviz/shadow/dist/Components/Editor/Components/ColorPicker";
import { adjoinRGB, splitRGB } from "../methods";

const CutAndClipAxisSettings = (props) => {
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
      ...CUT_AND_CLIP_AXIS_SETTINGS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...CUT_AND_CLIP_AXIS_SETTINGS };
  }

  const applyChanges = () => {
    if (configValues.breakEnd > configValues.breakStart) {
      shadow.persistProperties(sectionName, propertyName, configValues);
      closeCurrentSettingHandler();
    }
  };

  const [configValues, setConfigValues] = React.useState<ICutAndClipAxisSettings>({
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

  return (
    <>
      <OptionsTooltip />
      <div className="config-container">
        <div className="config-options-wrapper">
          <div className="config-title" data-tip="Enable to show dynamic deviation">
            <p>Enable Cut And Clip Axis</p>
            <label className="switch">
              <input
                type="checkbox"
                onChange={(e: any) => handleCheckbox(ECutAndClipAxisSettings.IsEnabled)}
                checked={configValues.isEnabled}
              />
              <span className="slider round"></span>
              {configValues[ECutAndClipAxisSettings.IsEnabled] ? (
                <span className="switch-text switch-text-on">On</span>
              ) : (
                <span className="switch-text switch-text-off">Off</span>
              )}
            </label>
          </div>

          {configValues.isEnabled && (
            <>
              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Set axis title font size">Break Start</span>
                </p>
                <NumberControl
                  value={configValues.breakStart + ""}
                  controlName={ECutAndClipAxisSettings.BreakStart}
                  stepValue={1}
                  handleChange={(e: any) => {
                    handleChange(+e, ECutAndClipAxisSettings.BreakStart);
                  }}
                />
              </div>

              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Set axis title font size">Break End</span>
                </p>
                <NumberControl
                  value={configValues.breakEnd + ""}
                  controlName={ECutAndClipAxisSettings.BreakEnd}
                  stepValue={1}
                  handleChange={(e: any) => {
                    handleChange(+e, ECutAndClipAxisSettings.BreakEnd);
                  }}
                />
              </div>

              <div className="config-color-label">
                <p className="config-label">
                  <span data-tip="Set border around the bar">Marker Line Color</span>
                </p>
                <ColorPicker
                  color={splitRGB(configValues.markerStrokeColor)}
                  handleChange={(c) => handleColor(c, ECutAndClipAxisSettings.MarkerStrokeColor)}
                />
              </div>

              <div className="config-color-label">
                <p className="config-label">
                  <span data-tip="Set border around the bar">Marker Background Color</span>
                </p>
                <ColorPicker
                  color={splitRGB(configValues.markerBackgroundColor)}
                  handleChange={(c) => handleColor(c, ECutAndClipAxisSettings.MarkerBackgroundColor)}
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

export default CutAndClipAxisSettings;
