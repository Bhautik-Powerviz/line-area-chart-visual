import * as React from "react";
import { X_AXIS_SETTINGS } from "../constants";
import { AxisCategoryType, EVisualConfig, EVisualSettings, EXAxisSettings, ImageLabelType, Position } from "../enum";
import { adjoinRGB, splitRGB } from "../methods";
import { IChartSettings, ILabelValuePair, IXAxisSettings, IYAxisSettings } from "../visual-settings.model";
import SelectControl from "@truviz/shadow/dist/Components/Editor/Components/SelectControl";
import FontSelector from "@truviz/shadow/dist/Components/Editor/Components/FontSelector";
import NumberControl from "@truviz/shadow/dist/Components/Editor/Components/NumberControl";
import ColorPicker from "@truviz/shadow/dist/Components/Editor/Components/ColorPicker";
import OptionsTooltip from "./OptionsTooltip";

const XAxisSettings = (props) => {
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
      ...X_AXIS_SETTINGS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...X_AXIS_SETTINGS };
  }

  const applyChanges = () => {
    const yAxisSettings: IYAxisSettings = {
      ...shadow.yAxisSettings,
      minimumRange: configValues.minimumRange,
      maximumRange: configValues.maximumRange,
      isLogarithmScale: configValues.isLogarithmScale,
      categoryType: configValues.categoryType,
    };
    shadow.persistProperties(EVisualConfig.YAxisConfig, EVisualSettings.YAxisSettings, yAxisSettings);
    shadow.persistProperties(sectionName, propertyName, configValues);
    closeCurrentSettingHandler();
  };

  const [configValues, setConfigValues] = React.useState<IXAxisSettings>({
    ...initialStates,
  });

  const handleChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: val,
    }));
  };

  const handleImageChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [EXAxisSettings.ImageStyle]: { ...d[EXAxisSettings.ImageStyle], [n]: val },
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

  const handleImageColor = ({ rgb }, n) => {
    setConfigValues((d) => ({
      ...d,
      [EXAxisSettings.ImageStyle]: { ...d[EXAxisSettings.ImageStyle], [n]: adjoinRGB(rgb) },
    }));
  };

  const handleRadioButtonChange = (key: string, value: string) => {
    setConfigValues((d) => ({
      ...d,
      [ImageLabelType.IsImageWithinAxis]: value === ImageLabelType.IsImageWithinAxis,
      [ImageLabelType.IsImageWithinBar]: value === ImageLabelType.IsImageWithinBar,
    }));
  };

  const PositionsList: ILabelValuePair[] = [
    {
      label: "Bottom",
      value: Position.Bottom,
    },
    {
      label: "Top",
      value: Position.Top,
    },
  ];

  const AxisCategoryModeList: ILabelValuePair[] = [
    {
      label: "Continuous",
      value: AxisCategoryType.Continuous,
    },
    {
      label: "Categorical",
      value: AxisCategoryType.Categorical,
    },
  ];

  const chartSettings: IChartSettings = shadow.chartSettings;

  return (
    <>
      <OptionsTooltip />
      <div className="config-container">
        <div className="config-options-wrapper">
          <div className="mb-15">
            <p className="config-label">
              <span data-tip="Select the axis position">Position</span>
            </p>
            <SelectControl
              selectedValue={configValues[EXAxisSettings.position]}
              optionsList={PositionsList}
              onChange={(e) => handleChange(e.value, EXAxisSettings.position)}
            />
          </div>

          {!shadow.isHorizontalChart && shadow.isXIsNumericAxis && (
            <div className="mb-15">
              <p className="config-label">
                <span data-tip="Select axis (numeric) category mode">Axis Mode</span>
              </p>
              <SelectControl
                selectedValue={configValues.categoryType}
                optionsList={AxisCategoryModeList}
                onChange={(d) => handleChange(d.value, EXAxisSettings.CategoryType)}
              />
            </div>
          )}

          {shadow.isHorizontalChart && !chartSettings.isPercentageStackedBar && (
            <>
              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Set axis minimum range">Minimum Range</span>
                </p>
                <NumberControl
                  value={configValues[EXAxisSettings.MinimumRange] + ""}
                  controlName={EXAxisSettings.MinimumRange}
                  stepValue={1}
                  handleChange={(e: any) => handleChange(+e, EXAxisSettings.MinimumRange)}
                />
              </div>

              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Set axis maximum range">Maximum Range</span>
                </p>
                <NumberControl
                  value={configValues[EXAxisSettings.MaximumRange] + ""}
                  controlName={EXAxisSettings.MaximumRange}
                  stepValue={1}
                  handleChange={(e: any) => handleChange(+e, EXAxisSettings.MaximumRange)}
                />
              </div>

              <div className="config-title" data-tip="Enable to transform axis to logarithm scale">
                <p>Logarithm Scale</p>
                <label className="switch">
                  <input
                    type="checkbox"
                    onChange={(e: any) => handleCheckbox(EXAxisSettings.IsLogarithmScale)}
                    checked={configValues[EXAxisSettings.IsLogarithmScale]}
                  />
                  <span className="slider round"></span>
                  {configValues[EXAxisSettings.IsLogarithmScale] ? (
                    <span className="switch-text switch-text-on">On</span>
                  ) : (
                    <span className="switch-text switch-text-off">Off</span>
                  )}
                </label>
              </div>
            </>
          )}

          <div className="config-title" data-tip="Enable to show the axis title">
            <p>Title</p>
            <label className="switch">
              <input
                type="checkbox"
                onChange={(e: any) => handleCheckbox(EXAxisSettings.isDisplayTitle)}
                checked={configValues[EXAxisSettings.isDisplayTitle]}
              />
              <span className="slider round"></span>
              {configValues[EXAxisSettings.isDisplayTitle] ? (
                <span className="switch-text switch-text-on">On</span>
              ) : (
                <span className="switch-text switch-text-off">Off</span>
              )}
            </label>
          </div>

          {configValues.isDisplayTitle && (
            <div>
              <div className="mb-15">
                <p className="config-label" data-tip="Add the title text">
                  Title Name
                </p>
                <input
                  type="text"
                  value={configValues[EXAxisSettings.titleName]}
                  className="form-control"
                  onChange={(e: any) => {
                    handleChange(e.target.value, EXAxisSettings.titleName);
                  }}
                  placeholder="Add your text here..."
                />
              </div>

              <div className="config-color-label mb-15">
                <p className="config-label">
                  <span data-tip="Choose axis title font color">Title Color</span>
                </p>
                <ColorPicker
                  color={splitRGB(configValues[EXAxisSettings.titleColor])}
                  handleChange={(c) => handleColor(c, EXAxisSettings.titleColor)}
                />
              </div>

              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Set axis title font size">Title Font Size</span>
                </p>
                <NumberControl
                  value={configValues[EXAxisSettings.titleFontSize] + ""}
                  controlName={EXAxisSettings.titleFontSize}
                  stepValue={1}
                  handleChange={(e: any) => {
                    handleChange(+e, EXAxisSettings.titleFontSize);
                  }}
                />
              </div>

              <div className="mb10">
                <p className="config-label" data-tip="Set axis title font family">
                  Title Font Family
                </p>
                <FontSelector
                  value={configValues[EXAxisSettings.titleFontFamily]}
                  handleChange={(d) => {
                    handleChange(d.value, EXAxisSettings.titleFontFamily);
                  }}
                />
              </div>
            </div>
          )}

          {shadow.isHasImagesData && !shadow.isHorizontalChart && (
            <React.Fragment>
              <div className="config-title" data-tip="Enable to show image within axis">
                <p>Image</p>
                <label className="switch">
                  <input
                    type="checkbox"
                    onChange={(e: any) => handleCheckbox(EXAxisSettings.isDisplayImage)}
                    checked={configValues[EXAxisSettings.isDisplayImage]}
                  />
                  <span className="slider round"></span>
                  {configValues[EXAxisSettings.isDisplayImage] ? (
                    <span className="switch-text switch-text-on">On</span>
                  ) : (
                    <span className="switch-text switch-text-off">Off</span>
                  )}
                </label>
              </div>

              {configValues[EXAxisSettings.isDisplayImage] && (
                <React.Fragment>
                  <div
                    className="mt-20"
                    onChange={(e: any) => handleRadioButtonChange(EXAxisSettings.IsImageWithinAxis, e.target.value)}
                  >
                    <p className="config-label" data-tip="Select the axis image label type">
                      Select Image Label Type
                    </p>
                    <label
                      className="radio-container"
                      htmlFor="apply-background-color-radio-1"
                      data-tip="Show image on axis line"
                    >
                      <input
                        type="radio"
                        value={ImageLabelType.IsImageWithinAxis}
                        checked={configValues[EXAxisSettings.IsImageWithinAxis] === true}
                        disabled={shadow.isHorizontalChart}
                        id="apply-background-color-radio-1"
                      />
                      Image On Axis
                      <span></span>
                    </label>
                    <label
                      className="radio-container"
                      htmlFor="apply-background-color-radio-2"
                      data-tip="Show image within bar area"
                    >
                      <input
                        type="radio"
                        value={ImageLabelType.IsImageWithinBar}
                        checked={configValues[EXAxisSettings.IsImageWithinBar] === true}
                        disabled={shadow.isHorizontalChart}
                        id="apply-background-color-radio-2"
                      />
                      Image On Bar
                      <span></span>
                    </label>
                  </div>

                  {configValues[EXAxisSettings.IsImageWithinBar] && (
                    <React.Fragment>
                      <div className="mb-15">
                        <p className="config-label">
                          <span data-tip="Select image position within bar area">Image Position</span>
                        </p>
                        <SelectControl
                          selectedValue={configValues[EXAxisSettings.ImageWithinBarPosition]}
                          optionsList={PositionsList}
                          onChange={(e) => handleChange(e.value, EXAxisSettings.ImageWithinBarPosition)}
                        />
                      </div>

                      <div className="config-color-label">
                        <p className="config-label">
                          <span data-tip="Choose image border color">Image Border Color</span>
                        </p>
                        <ColorPicker
                          color={splitRGB(configValues[EXAxisSettings.ImageStyle][EXAxisSettings.BorderColor])}
                          handleChange={(c) => handleImageColor(c, EXAxisSettings.BorderColor)}
                        />
                      </div>

                      <div className="config-title" data-tip="Enable image border color">
                        <p>Image Border</p>
                        <label className="switch">
                          <input
                            type="checkbox"
                            onChange={(e: any) => handleCheckbox(EXAxisSettings.IsShowImageBorder)}
                            checked={configValues[EXAxisSettings.IsShowImageBorder]}
                          />
                          <span className="slider round"></span>
                          {configValues[EXAxisSettings.IsShowImageBorder] ? (
                            <span className="switch-text switch-text-on">On</span>
                          ) : (
                            <span className="switch-text switch-text-off">Off</span>
                          )}
                        </label>
                      </div>

                      {configValues[EXAxisSettings.IsShowImageBorder] && (
                        <div className="mb-15">
                          <p className="config-label">
                            <span data-tip="Set image border width">Image Border Width</span>
                          </p>
                          <NumberControl
                            value={configValues[EXAxisSettings.ImageStyle][EXAxisSettings.BorderWidth] + ""}
                            controlName={EXAxisSettings.BorderWidth}
                            stepValue={1}
                            handleChange={(e: any) => handleImageChange(+e, EXAxisSettings.BorderWidth)}
                          />
                        </div>
                      )}
                    </React.Fragment>
                  )}
                </React.Fragment>
              )}
            </React.Fragment>
          )}

          <div className="config-title" data-tip="Enable to show axis tick label">
            <p>Label</p>
            <label className="switch">
              <input
                type="checkbox"
                onChange={(e: any) => handleCheckbox(EXAxisSettings.isDisplayLabel)}
                checked={configValues[EXAxisSettings.isDisplayLabel]}
              />
              <span className="slider round"></span>
              {configValues[EXAxisSettings.isDisplayLabel] ? (
                <span className="switch-text switch-text-on">On</span>
              ) : (
                <span className="switch-text switch-text-off">Off</span>
              )}
            </label>
          </div>

          {configValues.isDisplayLabel && (
            <div>
              <div className="config-color-label mb-15">
                <p className="config-label">
                  <span data-tip="Set axis label color">Label Color</span>
                </p>
                <ColorPicker
                  color={splitRGB(configValues.labelColor)}
                  handleChange={(c) => handleColor(c, "labelColor")}
                />
              </div>

              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Set the axis label font family">Label Font Family</span>
                </p>
                <FontSelector
                  value={configValues[EXAxisSettings.labelFontFamily]}
                  handleChange={(d) => {
                    handleChange(d.value, EXAxisSettings.labelFontFamily);
                  }}
                />
              </div>

              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Set axis label font size">Label Font Size</span>
                </p>
                <NumberControl
                  value={configValues[EXAxisSettings.labelFontSize] + ""}
                  controlName={EXAxisSettings.labelFontSize}
                  stepValue={1}
                  handleChange={(e: any) => {
                    handleChange(+e, EXAxisSettings.labelFontSize);
                  }}
                />
              </div>

              <React.Fragment>
                <div className="config-title mb-15" data-tip="Enable to auto tilt label">
                  <p>Label Auto Tilt</p>
                  <label className="switch">
                    <input
                      type="checkbox"
                      onChange={(e: any) => handleCheckbox(EXAxisSettings.isLabelAutoTilt)}
                      checked={configValues[EXAxisSettings.isLabelAutoTilt]}
                    />
                    <span className="slider round"></span>
                    {configValues[EXAxisSettings.isLabelAutoTilt] ? (
                      <span className="switch-text switch-text-on">On</span>
                    ) : (
                      <span className="switch-text switch-text-off">Off</span>
                    )}
                  </label>
                </div>

                {!configValues.isLabelAutoTilt && (
                  <div>
                    <p className="config-label">
                      <span data-tip="Set label tilt degree">Tilt</span>
                    </p>
                    <div className="range-slider-input mb-15">
                      <input
                        id={EXAxisSettings.labelTilt}
                        min="0"
                        max="100"
                        type="range"
                        value={configValues[EXAxisSettings.labelTilt]}
                        onChange={(e: any) => {
                          handleChange(+e.target.value, EXAxisSettings.labelTilt);
                        }}
                      />
                      <span className="config-value">{configValues[EXAxisSettings.labelTilt]}%</span>
                    </div>
                  </div>
                )}
              </React.Fragment>

              <React.Fragment>
                <div className="config-title mb-15" data-tip="Enable to apply auto chart limit to label">
                  <p>Label Auto Char Limit</p>
                  <label className="switch">
                    <input
                      type="checkbox"
                      onChange={(e: any) => handleCheckbox(EXAxisSettings.isLabelAutoCharLimit)}
                      checked={configValues[EXAxisSettings.isLabelAutoCharLimit]}
                    />
                    <span className="slider round"></span>
                    {configValues[EXAxisSettings.isLabelAutoCharLimit] ? (
                      <span className="switch-text switch-text-on">On</span>
                    ) : (
                      <span className="switch-text switch-text-off">Off</span>
                    )}
                  </label>
                </div>

                {!configValues.isLabelAutoCharLimit && (
                  <div className="mb-15">
                    <p className="config-label">
                      <span data-tip="Set label character limit">Label Character Limit</span>
                    </p>
                    <NumberControl
                      value={configValues.labelCharLimit + ""}
                      controlName={EXAxisSettings.labelCharLimit}
                      stepValue={1}
                      handleChange={(e: any) => {
                        handleChange(+e, EXAxisSettings.labelCharLimit);
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            </div>
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

export default XAxisSettings;
