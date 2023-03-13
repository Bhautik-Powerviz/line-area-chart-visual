import * as React from "react";
import { DYNAMIC_DEVIATION_SETTINGS } from "../constants";
import {
  EDynamicDeviationConnectingLineTypes,
  EDynamicDeviationDisplayTypes,
  EDynamicDeviationLabelDisplayTypes,
  EDynamicDeviationSettings,
  Position,
} from "../enum";
import SelectControl from "@truviz/shadow/dist/Components/Editor/Components/SelectControl";
import { IDynamicDeviationSettings, ILabelValuePair } from "../visual-settings.model";
import OptionsTooltip from "./OptionsTooltip";
import ColorPicker from "@truviz/shadow/dist/Components/Editor/Components/ColorPicker";
import NumberControl from "@truviz/shadow/dist/Components/Editor/Components/NumberControl";
import FontSelector from "@truviz/shadow/dist/Components/Editor/Components/FontSelector";
import { adjoinRGB, splitRGB } from "../methods";
import Radio from "./Radio";

const DynamicDeviationSettings = (props) => {
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
      ...DYNAMIC_DEVIATION_SETTINGS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...DYNAMIC_DEVIATION_SETTINGS };
  }

  const applyChanges = () => {
    configValues.lastDisplayType = shadow.dynamicDeviationSettings.displayType;
    shadow.persistProperties(sectionName, propertyName, configValues);
    closeCurrentSettingHandler();
  };

  const [configValues, setConfigValues] = React.useState<IDynamicDeviationSettings>({
    ...initialStates,
  });

  const handleChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: val,
    }));
  };

  React.useEffect(() => {}, [configValues]);

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

  const DisplayTypesList: ILabelValuePair[] = [
    {
      label: "Auto",
      value: EDynamicDeviationDisplayTypes.Auto,
    },
    {
      label: "Create Your Own",
      value: EDynamicDeviationDisplayTypes.CreateYourOwn,
    },
    {
      label: "Custom Range",
      value: EDynamicDeviationDisplayTypes.CustomRange,
    },
    {
      label: "First To Last",
      value: EDynamicDeviationDisplayTypes.FirstToLast,
    },
    {
      label: "First To Last Actual",
      value: EDynamicDeviationDisplayTypes.FirstToLastActual,
    },
    {
      label: "Last To First",
      value: EDynamicDeviationDisplayTypes.LastToFirst,
    },
    {
      label: "Last To First Actual",
      value: EDynamicDeviationDisplayTypes.LastToFirstActual,
    },
    {
      label: "Min To Max",
      value: EDynamicDeviationDisplayTypes.MinToMax,
    },
    // {
    //     label: "Penultimate To Last",
    //     value: EDynamicDeviationDisplayTypes.PenultimateToLast
    // },
  ];

  const LabelDisplayTypesList: ILabelValuePair[] = [
    {
      label: "Value",
      value: EDynamicDeviationLabelDisplayTypes.Value,
    },
    {
      label: "Percentage",
      value: EDynamicDeviationLabelDisplayTypes.Percentage,
    },
    {
      label: "Both",
      value: EDynamicDeviationLabelDisplayTypes.Both,
    },
  ];

  const ConnectingLineTypesList: ILabelValuePair[] = [
    {
      label: "Arrow",
      value: EDynamicDeviationConnectingLineTypes.Arrow,
    },
    {
      label: "Bar",
      value: EDynamicDeviationConnectingLineTypes.Bar,
    },
    {
      label: "Dots",
      value: EDynamicDeviationConnectingLineTypes.Dots,
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
          <div className="config-title" data-tip="Enable to show dynamic deviation">
            <p>Show Dynamic Deviation</p>
            <label className="switch">
              <input
                type="checkbox"
                onChange={(e: any) => handleCheckbox(EDynamicDeviationSettings.IsEnabled)}
                checked={configValues.isEnabled}
              />
              <span className="slider round"></span>
              {configValues[EDynamicDeviationSettings.IsEnabled] ? (
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
                  <span data-tip="Select image position within bar area">Display Type</span>
                </p>
                <SelectControl
                  selectedValue={configValues.displayType}
                  optionsList={DisplayTypesList}
                  onChange={(e) => handleChange(e.value, EDynamicDeviationSettings.DisplayType)}
                />
              </div>

              {configValues.displayType === EDynamicDeviationDisplayTypes.CustomRange && (
                <>
                  <div className="mb-15">
                    <p className="config-label">
                      <span data-tip="Set axis title font size">From Index</span>
                    </p>
                    <NumberControl
                      value={configValues.fromIndex + ""}
                      controlName={EDynamicDeviationSettings.FromIndex}
                      stepValue={1}
                      handleChange={(e: any) => {
                        handleChange(+e, EDynamicDeviationSettings.FromIndex);
                      }}
                    />
                  </div>

                  <div className="mb-15">
                    <p className="config-label">
                      <span data-tip="Set axis title font size">To Index</span>
                    </p>
                    <NumberControl
                      value={configValues.toIndex + ""}
                      controlName={EDynamicDeviationSettings.ToIndex}
                      stepValue={1}
                      handleChange={(e: any) => {
                        handleChange(+e, EDynamicDeviationSettings.ToIndex);
                      }}
                    />
                  </div>
                </>
              )}

              {/* <div className="mb-15">
                                <p className="config-label"><span data-tip="Select image position within bar area">Position</span></p>
                                <SelectControl
                                    selectedValue={configValues.position}
                                    optionsList={PositionsList}
                                    onChange={(e) => handleChange(e.value, EDynamicDeviationSettings.Position)}
                                />
                            </div> */}

              <div className="config-title" data-tip="Enable to show label background">
                <p>Show Start Indicator</p>
                <label className="switch">
                  <input
                    type="checkbox"
                    onChange={(e: any) => handleCheckbox(EDynamicDeviationSettings.IsShowStartIndicator)}
                    checked={configValues.isShowStartIndicator}
                  />
                  <span className="slider round"></span>
                  {configValues.isShowStartIndicator ? (
                    <span className="switch-text switch-text-on">On</span>
                  ) : (
                    <span className="switch-text switch-text-off">Off</span>
                  )}
                </label>
              </div>

              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Select image position within bar area">Connector Type</span>
                </p>
                <SelectControl
                  selectedValue={configValues.connectorType}
                  optionsList={ConnectingLineTypesList}
                  onChange={(e) => handleChange(e.value, EDynamicDeviationSettings.ConnectorType)}
                />
              </div>

              <div className="config-color-label mb-15">
                <p className="config-label">
                  <span data-tip="Choose axis title font color">Connector Color</span>
                </p>
                <ColorPicker
                  color={splitRGB(configValues.connectorColor)}
                  handleChange={(c) => handleColor(c, EDynamicDeviationSettings.ConnectorColor)}
                />
              </div>

              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Set axis title font size">Connector Width</span>
                </p>
                <NumberControl
                  value={configValues.connectorWidth + ""}
                  controlName={EDynamicDeviationSettings.ConnectorWidth}
                  stepValue={1}
                  handleChange={(e: any) => {
                    handleChange(+e, EDynamicDeviationSettings.ConnectorWidth);
                  }}
                />
              </div>

              <div className="config-color-label mb-15">
                <p className="config-label">
                  <span data-tip="Choose axis title font color">Connecting Line Color</span>
                </p>
                <ColorPicker
                  color={splitRGB(configValues.connectingLineColor)}
                  handleChange={(c) => handleColor(c, EDynamicDeviationSettings.ConnectingLineColor)}
                />
              </div>

              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Set axis title font size">Connecting Line Width</span>
                </p>
                <NumberControl
                  value={configValues.connectingLineWidth + ""}
                  controlName={EDynamicDeviationSettings.connectingLineWidth}
                  stepValue={1}
                  handleChange={(e: any) => {
                    handleChange(+e, EDynamicDeviationSettings.connectingLineWidth);
                  }}
                />
              </div>

              <div className="config-title" data-tip="Enable to show label background">
                <p>Show Bar Border</p>
                <label className="switch">
                  <input
                    type="checkbox"
                    onChange={(e: any) => handleCheckbox(EDynamicDeviationSettings.IsBarBorderEnabled)}
                    checked={configValues.isBarBorderEnabled}
                  />
                  <span className="slider round"></span>
                  {configValues.isBarBorderEnabled ? (
                    <span className="switch-text switch-text-on">On</span>
                  ) : (
                    <span className="switch-text switch-text-off">Off</span>
                  )}
                </label>
              </div>

              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Select image position within bar area">Label Display Type</span>
                </p>
                <SelectControl
                  selectedValue={configValues.labelDisplayType}
                  optionsList={LabelDisplayTypesList}
                  onChange={(e) => handleChange(e.value, EDynamicDeviationSettings.LabelDisplayType)}
                />
              </div>

              <div className="config-color-label mb-15">
                <p className="config-label">
                  <span data-tip="Choose axis title font color">Font Color</span>
                </p>
                <ColorPicker
                  color={splitRGB(configValues.labelFontColor)}
                  handleChange={(c) => handleColor(c, EDynamicDeviationSettings.LabelFontColor)}
                />
              </div>

              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Set axis title font size">Font Size</span>
                </p>
                <NumberControl
                  value={configValues.labelFontSize + ""}
                  controlName={EDynamicDeviationSettings.LabelFontSize}
                  stepValue={1}
                  handleChange={(e: any) => {
                    handleChange(+e, EDynamicDeviationSettings.LabelFontSize);
                  }}
                />
              </div>

              <div className="mb10">
                <p className="config-label" data-tip="Select data labels font family">
                  Font Family
                </p>
                <FontSelector
                  value={configValues.labelFontFamily}
                  handleChange={(d) => {
                    handleChange(d.value, EDynamicDeviationSettings.LabelFontFamily);
                  }}
                />
              </div>

              {configValues.labelDisplayType !== EDynamicDeviationLabelDisplayTypes.Both && (
                <>
                  <div className="config-title" data-tip="Enable to show dynamic deviation">
                    <p>Show Label Border</p>
                    <label className="switch">
                      <input
                        type="checkbox"
                        onChange={(e: any) => handleCheckbox(EDynamicDeviationSettings.IsShowLabelBorder)}
                        checked={configValues.isShowLabelBorder}
                      />
                      <span className="slider round"></span>
                      {configValues[EDynamicDeviationSettings.IsShowLabelBorder] ? (
                        <span className="switch-text switch-text-on">On</span>
                      ) : (
                        <span className="switch-text switch-text-off">Off</span>
                      )}
                    </label>
                  </div>

                  {configValues.isShowLabelBorder && (
                    <>
                      <div className="mb-15">
                        <p className="config-label">
                          <span data-tip="Set axis title font size">Border Width</span>
                        </p>
                        <NumberControl
                          value={configValues.borderWidth + ""}
                          controlName={EDynamicDeviationSettings.BorderWidth}
                          stepValue={1}
                          handleChange={(e: any) => {
                            handleChange(+e, EDynamicDeviationSettings.BorderWidth);
                          }}
                        />
                      </div>

                      <div className="config-color-label mb-15">
                        <p className="config-label">
                          <span data-tip="Choose axis title font color">Border Color</span>
                        </p>
                        <ColorPicker
                          color={splitRGB(configValues.borderColor)}
                          handleChange={(c) => handleColor(c, EDynamicDeviationSettings.BorderColor)}
                        />
                      </div>
                    </>
                  )}

                  <div className="config-title" data-tip="Enable to show label background">
                    <p>Show Label Background</p>
                    <label className="switch">
                      <input
                        type="checkbox"
                        onChange={(e: any) => handleCheckbox(EDynamicDeviationSettings.IsShowLabelBackground)}
                        checked={configValues.isShowLabelBackground}
                      />
                      <span className="slider round"></span>
                      {configValues.isShowLabelBackground ? (
                        <span className="switch-text switch-text-on">On</span>
                      ) : (
                        <span className="switch-text switch-text-off">Off</span>
                      )}
                    </label>
                  </div>

                  {configValues.isShowLabelBackground && (
                    <>
                      <div className="config-color-label mb-15">
                        <p className="config-label">
                          <span data-tip="Choose axis title font color">Background Color</span>
                        </p>
                        <ColorPicker
                          color={splitRGB(configValues.backgroundColor)}
                          handleChange={(c) => handleColor(c, EDynamicDeviationSettings.BackgroundColor)}
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
                            value={configValues.backgroundColorTransparency}
                            onChange={(e: any) => {
                              handleChange(+e.target.value, EDynamicDeviationSettings.BackgroundColorTransparency);
                            }}
                          />
                          <span className="config-value">{configValues.backgroundColorTransparency}%</span>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
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

export default DynamicDeviationSettings;
