import * as React from "react";
import { Y_AXIS_SETTINGS } from "../constants";
import {
  AxisCategoryType,
  EVisualConfig,
  EVisualSettings,
  EYAxisSettings,
  ImageLabelType,
  Orientation,
  Position,
} from "../enum";
import { adjoinRGB, splitRGB } from "../methods";
import { IChartSettings, ILabelValuePair, IXAxisSettings, IYAxisSettings } from "../visual-settings.model";
import SelectControl from "@truviz/shadow/dist/Components/Editor/Components/SelectControl";
import NumberControl from "@truviz/shadow/dist/Components/Editor/Components/NumberControl";
import ColorPicker from "@truviz/shadow/dist/Components/Editor/Components/ColorPicker";
import FontSelector from "@truviz/shadow/dist/Components/Editor/Components/FontSelector";
import OptionsTooltip from "./OptionsTooltip";

const YAxisSettings = (props) => {
  const {
    shadow,
    compConfig: { sectionName, propertyName },
    config,
    vizOptions,
    closeCurrentSettingHandler,
    closeAdvancedSettingsHandler,
  } = props;
  let initialStates = vizOptions.formatTab[sectionName][propertyName];

  try {
    initialStates = JSON.parse(initialStates);
    initialStates = {
      ...Y_AXIS_SETTINGS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...Y_AXIS_SETTINGS };
  }

  const applyChanges = () => {
    const xAxisSettings: IXAxisSettings = {
      ...shadow.xAxisSettings,
      minimumRange: configValues.minimumRange,
      maximumRange: configValues.maximumRange,
      isLogarithmScale: configValues.isLogarithmScale,
      categoryType: configValues.categoryType,
    };
    shadow.persistProperties(EVisualConfig.XAxisConfig, EVisualSettings.XAxisSettings, xAxisSettings);
    shadow.persistProperties(sectionName, propertyName, configValues);
    closeCurrentSettingHandler();
  };

  const [configValues, setConfigValues] = React.useState<IYAxisSettings>({
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

  const handleImageColor = ({ rgb }, n) => {
    setConfigValues((d) => ({
      ...d,
      [EYAxisSettings.ImageStyle]: { ...d[EYAxisSettings.ImageStyle], [n]: adjoinRGB(rgb) },
    }));
  };

  const handleImageChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [EYAxisSettings.ImageStyle]: { ...d[EYAxisSettings.ImageStyle], [n]: val },
    }));
  };

  const handleRadioButtonChange = (key: string, value: string) => {
    setConfigValues((d) => ({
      ...d,
      [ImageLabelType.IsImageWithinAxis]: value === ImageLabelType.IsImageWithinAxis,
      [ImageLabelType.IsImageWithinBar]: value === ImageLabelType.IsImageWithinBar,
    }));
  };

  const chartSettings: IChartSettings = JSON.parse(
    vizOptions.formatTab[EVisualConfig.ChartConfig][EVisualSettings.ChartSettings]
  );

  const PositionsList: ILabelValuePair[] = [
    {
      label: "Left",
      value: Position.Left,
    },
    {
      label: "Right",
      value: Position.Right,
    },
  ];

  let ImagePositionsList: ILabelValuePair[] = [];
  if (chartSettings.orientation === Orientation.Vertical) {
    ImagePositionsList = [
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
    ImagePositionsList = [
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

  React.useEffect(() => {
    if (
      chartSettings.orientation === Orientation.Vertical &&
      (configValues.imageWithinBarPosition === Position.Left || configValues.imageWithinBarPosition === Position.Right)
    ) {
      handleChange(Position.Bottom, EYAxisSettings.ImageWithinBarPosition);
    } else if (
      configValues.imageWithinBarPosition === Position.Bottom ||
      configValues.imageWithinBarPosition === Position.Top
    ) {
      handleChange(Position.Left, EYAxisSettings.ImageWithinBarPosition);
    }
  }, []);

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
              selectedValue={configValues[EYAxisSettings.position]}
              optionsList={PositionsList}
              onChange={(e) => handleChange(e.value, EYAxisSettings.position)}
            />
          </div>

          {shadow.isHorizontalChart && shadow.isYIsNumericAxis && (
            <div className="mb-15">
              <p className="config-label">
                <span data-tip="Select axis (numeric) category type">Axis Type</span>
              </p>
              <SelectControl
                selectedValue={configValues.categoryType}
                optionsList={AxisCategoryModeList}
                onChange={(d) => handleChange(d.value, EYAxisSettings.CategoryType)}
              />
            </div>
          )}

          {!shadow.isHorizontalChart && !chartSettings.isPercentageStackedBar && (
            <>
              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Set axis minimum range">Minimum Range</span>
                </p>
                <NumberControl
                  value={configValues[EYAxisSettings.MinimumRange] + ""}
                  controlName={EYAxisSettings.MinimumRange}
                  stepValue={1}
                  handleChange={(e: any) => handleChange(+e, EYAxisSettings.MinimumRange)}
                />
              </div>

              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Set axis maximum range">Maximum Range</span>
                </p>
                <NumberControl
                  value={configValues[EYAxisSettings.MaximumRange] + ""}
                  controlName={EYAxisSettings.MaximumRange}
                  stepValue={1}
                  handleChange={(e: any) => handleChange(+e, EYAxisSettings.MaximumRange)}
                />
              </div>

              <div className="config-title" data-tip="Enable to transform axis to logarithm scale">
                <p>Logarithm Scale</p>
                <label className="switch">
                  <input
                    type="checkbox"
                    onChange={(e: any) => handleCheckbox(EYAxisSettings.IsLogarithmScale)}
                    checked={configValues[EYAxisSettings.IsLogarithmScale]}
                  />
                  <span className="slider round"></span>
                  {configValues[EYAxisSettings.IsLogarithmScale] ? (
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
                onChange={(e: any) => handleCheckbox(EYAxisSettings.isDisplayTitle)}
                checked={configValues[EYAxisSettings.isDisplayTitle]}
              />
              <span className="slider round"></span>
              {configValues[EYAxisSettings.isDisplayTitle] ? (
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
                  value={configValues[EYAxisSettings.titleName]}
                  className="form-control"
                  onChange={(e: any) => {
                    handleChange(e.target.value, EYAxisSettings.titleName);
                  }}
                  placeholder="Add your text here..."
                />
              </div>

              <div className="config-color-label mb-15">
                <p className="config-label">
                  <span data-tip="Choose axis title font color">Title Color</span>
                </p>
                <ColorPicker
                  color={splitRGB(configValues[EYAxisSettings.titleColor])}
                  handleChange={(c) => handleColor(c, EYAxisSettings.titleColor)}
                />
              </div>

              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Set axis title font size">Title Font Size</span>
                </p>
                <NumberControl
                  value={configValues[EYAxisSettings.titleFontSize] + ""}
                  controlName={EYAxisSettings.titleFontSize}
                  stepValue={1}
                  handleChange={(e: any) => {
                    handleChange(+e, EYAxisSettings.titleFontSize);
                  }}
                />
              </div>

              <div className="mb10">
                <p className="config-label" data-tip="Set axis title font family">
                  Title Font Family
                </p>
                <FontSelector
                  value={configValues[EYAxisSettings.titleFontFamily]}
                  handleChange={(d) => {
                    handleChange(d.value, EYAxisSettings.titleFontFamily);
                  }}
                />
              </div>
            </div>
          )}

          {shadow.isHasImagesData && shadow.isHorizontalChart && (
            <React.Fragment>
              <div className="config-title" data-tip="Enable to show image within axis">
                <p>Image</p>
                <label className="switch">
                  <input
                    type="checkbox"
                    onChange={(e: any) => handleCheckbox(EYAxisSettings.isDisplayImage)}
                    checked={configValues[EYAxisSettings.isDisplayImage]}
                  />
                  <span className="slider round"></span>
                  {configValues[EYAxisSettings.isDisplayImage] ? (
                    <span className="switch-text switch-text-on">On</span>
                  ) : (
                    <span className="switch-text switch-text-off">Off</span>
                  )}
                </label>
              </div>

              {configValues[EYAxisSettings.isDisplayImage] && (
                <React.Fragment>
                  <div
                    className="mt-20"
                    onChange={(e: any) => handleRadioButtonChange(EYAxisSettings.IsImageWithinAxis, e.target.value)}
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
                        checked={configValues[EYAxisSettings.IsImageWithinAxis] === true}
                        disabled={!shadow.isHorizontalChart}
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
                        checked={configValues[EYAxisSettings.IsImageWithinBar] === true}
                        disabled={!shadow.isHorizontalChart}
                        id="apply-background-color-radio-2"
                      />
                      Image On Bar
                      <span></span>
                    </label>
                  </div>

                  {configValues[EYAxisSettings.IsImageWithinBar] && (
                    <React.Fragment>
                      <div className="mb-15">
                        <p className="config-label">
                          <span data-tip="Select image position within bar area">Image Position</span>
                        </p>
                        <SelectControl
                          selectedValue={configValues[EYAxisSettings.ImageWithinBarPosition]}
                          optionsList={ImagePositionsList}
                          onChange={(e) => handleChange(e.value, EYAxisSettings.ImageWithinBarPosition)}
                        />
                      </div>

                      <div className="config-color-label">
                        <p className="config-label">
                          <span data-tip="Choose image border color">Image Border Color</span>
                        </p>
                        <ColorPicker
                          color={splitRGB(configValues[EYAxisSettings.ImageStyle][EYAxisSettings.BorderColor])}
                          handleChange={(c) => handleImageColor(c, EYAxisSettings.BorderColor)}
                        />
                      </div>

                      <div className="config-title" data-tip="Enable image border color">
                        <p>Image Border</p>
                        <label className="switch">
                          <input
                            type="checkbox"
                            onChange={(e: any) => handleCheckbox(EYAxisSettings.IsShowImageBorder)}
                            checked={configValues[EYAxisSettings.IsShowImageBorder]}
                          />
                          <span className="slider round"></span>
                          {configValues[EYAxisSettings.IsShowImageBorder] ? (
                            <span className="switch-text switch-text-on">On</span>
                          ) : (
                            <span className="switch-text switch-text-off">Off</span>
                          )}
                        </label>
                      </div>

                      {configValues[EYAxisSettings.IsShowImageBorder] && (
                        <div className="mb-15">
                          <p className="config-label">
                            <span data-tip="Set image border width">Image Border Width</span>
                          </p>
                          <NumberControl
                            value={configValues[EYAxisSettings.ImageStyle][EYAxisSettings.BorderWidth] + ""}
                            controlName={EYAxisSettings.BorderWidth}
                            stepValue={1}
                            handleChange={(e: any) => handleImageChange(+e, EYAxisSettings.BorderWidth)}
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
                onChange={(e: any) => handleCheckbox(EYAxisSettings.isDisplayLabel)}
                checked={configValues[EYAxisSettings.isDisplayLabel]}
              />
              <span className="slider round"></span>
              {configValues[EYAxisSettings.isDisplayLabel] ? (
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
                  value={configValues[EYAxisSettings.labelFontFamily]}
                  handleChange={(d) => {
                    handleChange(d.value, EYAxisSettings.labelFontFamily);
                  }}
                />
              </div>

              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Set axis label font size">Label Font Size</span>
                </p>
                <NumberControl
                  value={configValues[EYAxisSettings.labelFontSize] + ""}
                  controlName={EYAxisSettings.labelFontSize}
                  stepValue={1}
                  handleChange={(e: any) => {
                    handleChange(+e, EYAxisSettings.labelFontSize);
                  }}
                />
              </div>

              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Enable to apply auto chart limit to label">Label Character Limit</span>
                </p>
                <NumberControl
                  value={configValues.labelCharLimit + ""}
                  controlName={EYAxisSettings.labelCharLimit}
                  stepValue={1}
                  handleChange={(e: any) => {
                    handleChange(+e, EYAxisSettings.labelCharLimit);
                  }}
                />
              </div>
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

export default YAxisSettings;
