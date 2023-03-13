import * as React from "react";
import { SERIES_LABEL_SETTINGS } from "../constants";
import { ESeriesLabelSettings, Position } from "../enum";
import SelectControl from "@truviz/shadow/dist/Components/Editor/Components/SelectControl";
import { ILabelValuePair, ISeriesLabelSettings } from "../visual-settings.model";
import OptionsTooltip from "./OptionsTooltip";
import ColorPicker from "@truviz/shadow/dist/Components/Editor/Components/ColorPicker";
import NumberControl from "@truviz/shadow/dist/Components/Editor/Components/NumberControl";
import FontSelector from "@truviz/shadow/dist/Components/Editor/Components/FontSelector";
import { adjoinRGB, splitRGB } from "../methods";
import Radio from "./Radio";

const SeriesLabelSettings = (props) => {
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
      ...SERIES_LABEL_SETTINGS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...SERIES_LABEL_SETTINGS };
  }

  const applyChanges = () => {
    shadow.persistProperties(sectionName, propertyName, configValues);
    closeCurrentSettingHandler();
  };

  const [configValues, setConfigValues] = React.useState<ISeriesLabelSettings>({
    ...initialStates,
  });

  const handleChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: val,
    }));
  };

  React.useEffect(() => {
    if (
      shadow.isHorizontalChart &&
      (configValues.seriesPosition === Position.Left || configValues.seriesPosition === Position.Right)
    ) {
      setConfigValues((d) => ({
        ...d,
        [ESeriesLabelSettings.SeriesPosition]: Position.Top,
      }));
    }

    if (
      !shadow.isHorizontalChart &&
      (configValues.seriesPosition === Position.Top || configValues.seriesPosition === Position.Bottom)
    ) {
      setConfigValues((d) => ({
        ...d,
        [ESeriesLabelSettings.SeriesPosition]: Position.Left,
      }));
    }
  }, []);

  let PositionsList: ILabelValuePair[] = [];
  if (shadow.isHorizontalChart) {
    PositionsList = [
      {
        label: "Top",
        value: Position.Top,
      },
      {
        label: "Bottom",
        value: Position.Bottom,
      },
    ];
  } else {
    PositionsList = [
      {
        label: "Left",
        value: Position.Left,
      },
      {
        label: "Right",
        value: Position.Right,
      },
    ];
  }

  const STYLING_OPTIONS: ILabelValuePair[] = [
    {
      value: "bold",
      label: "B",
    },
    {
      value: "italic",
      label: "I",
    },
    {
      value: "underline",
      label: "U",
    },
  ];

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
          <div className="config-title" data-tip="Enable to show error bars">
            <p>Enable Series Label</p>
            <label className="switch">
              <input
                type="checkbox"
                onChange={(e: any) => handleCheckbox(ESeriesLabelSettings.IsSeriesLabelEnabled)}
                checked={configValues.isSeriesLabelEnabled}
              />
              <span className="slider round"></span>
              {configValues[ESeriesLabelSettings.IsSeriesLabelEnabled] ? (
                <span className="switch-text switch-text-on">On</span>
              ) : (
                <span className="switch-text switch-text-off">Off</span>
              )}
            </label>
          </div>

          <div className="mb-15">
            <p className="config-label">
              <span data-tip="Select image position within bar area">Series Position</span>
            </p>
            <SelectControl
              selectedValue={configValues.seriesPosition}
              optionsList={PositionsList}
              onChange={(e) => handleChange(e.value, ESeriesLabelSettings.SeriesPosition)}
            />
          </div>

          <div className="config-color-label mb-15">
            <p className="config-label">
              <span data-tip="Choose axis title font color">Font Color</span>
            </p>
            <ColorPicker
              color={splitRGB(configValues.fontColor)}
              handleChange={(c) => handleColor(c, ESeriesLabelSettings.FontColor)}
            />
          </div>

          <div className="mb-15">
            <p className="config-label">
              <span data-tip="Set axis title font size">Font Size</span>
            </p>
            <NumberControl
              value={configValues.fontSize + ""}
              controlName={ESeriesLabelSettings.FontSize}
              stepValue={1}
              handleChange={(e: any) => {
                handleChange(+e, ESeriesLabelSettings.FontSize);
              }}
            />
          </div>

          <div className="mb10">
            <p className="config-label" data-tip="Select data labels font family">
              Font Family
            </p>
            <FontSelector
              value={configValues.fontFamily}
              handleChange={(d) => {
                handleChange(d.value, ESeriesLabelSettings.FontFamily);
              }}
            />
          </div>

          <div className="font-styling">
            <Radio
              options={STYLING_OPTIONS}
              value={configValues.fontStyle}
              onChange={(v: string) => handleChange(v, ESeriesLabelSettings.FontStyle)}
              multiple
            />
          </div>

          <div className="mb-15">
            <p className="config-label">
              <span data-tip="Set axis title font size">Maximum Width</span>
            </p>
            <NumberControl
              value={configValues.maximumWidth + ""}
              controlName={ESeriesLabelSettings.MaximumWidth}
              stepValue={1}
              handleChange={(e: any) => {
                handleChange(+e, ESeriesLabelSettings.MaximumWidth);
              }}
            />
          </div>

          <React.Fragment>
            <div className="config-title" data-tip="Enable to show background within data labels">
              <p>Show Background</p>
              <label className="switch">
                <input
                  type="checkbox"
                  onChange={(e: any) => handleCheckbox(ESeriesLabelSettings.ShowBackground)}
                  checked={configValues.showBackground}
                />
                <span className="slider round"></span>
                {configValues.showBackground ? (
                  <span className="switch-text switch-text-on">On</span>
                ) : (
                  <span className="switch-text switch-text-off">Off</span>
                )}
              </label>
            </div>

            {configValues.showBackground && (
              <div>
                <div className="config-color-label mb-15">
                  <p className="config-label">
                    <span data-tip="Choose data labels background color">Background Color</span>
                  </p>
                  <ColorPicker
                    color={splitRGB(configValues.backgroundColor)}
                    handleChange={(c) => handleColor(c, ESeriesLabelSettings.BackgroundColor)}
                  />
                </div>

                <div>
                  <p className="config-label">
                    <span data-tip="Set data label background color transparency">Transparency</span>
                  </p>
                  <div className="range-slider-input">
                    <input
                      id="barRightPadding"
                      min="0"
                      max="100"
                      type="range"
                      value={configValues.transparency}
                      onChange={(e: any) => {
                        handleChange(+e.target.value, ESeriesLabelSettings.Transparency);
                      }}
                    />
                    <span className="config-value">{configValues.transparency}%</span>
                  </div>
                </div>
              </div>
            )}
          </React.Fragment>
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

export default SeriesLabelSettings;
