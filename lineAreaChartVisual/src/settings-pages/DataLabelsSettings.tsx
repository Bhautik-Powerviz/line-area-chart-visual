import * as React from "react";
import { DATA_LABELS_SETTINGS } from "../constants";
import {
  BarType,
  DataLabelsFontSizeType,
  DataLabelsPlacement,
  DataLabelsType,
  EDataLabelsDisplayStyleType,
  EDataLabelsSettings,
  EVisualSettings,
  Orientation,
} from "../enum";
import { adjoinRGB, splitRGB } from "../methods";
import { IChartSettings, IDataLabelsSettings, ILabelValuePair } from "../visual-settings.model";
import OptionsTooltip from "./OptionsTooltip";
import SelectControl from "@truviz/shadow/dist/Components/Editor/Components/SelectControl";
import NumberControl from "@truviz/shadow/dist/Components/Editor/Components/NumberControl";
import ColorPicker from "@truviz/shadow/dist/Components/Editor/Components/ColorPicker";
import FontSelector from "@truviz/shadow/dist/Components/Editor/Components/FontSelector";
import Radio from "./Radio";

const DataLabelsSettings = (props) => {
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
      ...DATA_LABELS_SETTINGS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...DATA_LABELS_SETTINGS };
  }

  const sliderRef = React.useRef(null);

  const applyChanges = () => {
    shadow.persistProperties(sectionName, propertyName, configValues);
    closeCurrentSettingHandler();
  };

  const [configValues, setConfigValues] = React.useState<IDataLabelsSettings>({
    ...initialStates,
  });

  const handleChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [configValues[EDataLabelsSettings.dataLabelsType]]: {
        ...d[configValues[EDataLabelsSettings.dataLabelsType]],
        [n]: val,
      },
    }));
  };

  const handleLabelPlacementChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [configValues[EDataLabelsSettings.dataLabelsType]]: {
        ...d[configValues[EDataLabelsSettings.dataLabelsType]],
        [n]: val,
      },
    }));
  };

  const handleColor = ({ rgb }, n) => {
    setConfigValues((d) => ({
      ...d,
      [configValues[EDataLabelsSettings.dataLabelsType]]: {
        ...d[configValues[EDataLabelsSettings.dataLabelsType]],
        [n]: adjoinRGB(rgb),
      },
    }));
  };

  const handleCheckbox = (n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: !d[n],
      [configValues[EDataLabelsSettings.dataLabelsType]]: {
        ...d[configValues[EDataLabelsSettings.dataLabelsType]],
        [n]: !d[n],
      },
    }));
  };

  const handleRadioButtonChange = (key: string, value: string) => {
    setConfigValues((d) => ({
      ...d,
      [key]: value,
    }));
  };

  let dataValues = configValues[configValues[EDataLabelsSettings.dataLabelsType]];
  const chartSettings: IChartSettings = shadow[EVisualSettings.ChartSettings];

  if (
    (chartSettings.barType === BarType.Stacked || chartSettings.barType === BarType.GroupedStacked) &&
    configValues.dataLabels.placement === DataLabelsPlacement.OutSide
  ) {
    configValues.dataLabels.placement = DataLabelsPlacement.End;
  }

  if (chartSettings.barType === BarType.Normal || chartSettings.barType === BarType.Grouped) {
    configValues.dataLabelsType = DataLabelsType.DataLabels;
  }

  React.useEffect(() => {
    if (chartSettings.barType === BarType.Normal) {
      dataValues = configValues[EDataLabelsSettings.dataLabels];
      setConfigValues((d) => ({
        ...d,
        [EDataLabelsSettings.dataLabelsType]: DataLabelsType.DataLabels,
      }));
    }
  }, []);

  const DataLabelsPlacementList: ILabelValuePair[] = [
    {
      label: "End",
      value: DataLabelsPlacement.End,
    },
    {
      label: "Center",
      value: DataLabelsPlacement.Center,
    },
    {
      label: "Base",
      value: DataLabelsPlacement.Base,
    },
  ];

  if (chartSettings.barType === BarType.Normal || chartSettings.barType === BarType.Grouped) {
    DataLabelsPlacementList.push({
      label: "OutSide",
      value: DataLabelsPlacement.OutSide,
    });
  }

  const DataLabelsFontSizeTypeList: ILabelValuePair[] = [
    {
      label: "Auto",
      value: DataLabelsFontSizeType.Auto,
    },
    {
      label: "Custom",
      value: DataLabelsFontSizeType.Custom,
    },
  ];

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

  const OrientationList: ILabelValuePair[] = [
    {
      label: "Horizontal",
      value: Orientation.Horizontal,
    },
    {
      label: "Vertical",
      value: Orientation.Vertical,
    },
  ];

  const DataLabelsStylesTypeList: ILabelValuePair[] = [
    {
      label: "All",
      value: EDataLabelsDisplayStyleType.All,
    },
    {
      label: "Min Max",
      value: EDataLabelsDisplayStyleType.MinMax,
    },
    {
      label: "First Last",
      value: EDataLabelsDisplayStyleType.FirstLast,
    },
    {
      label: "Last",
      value: EDataLabelsDisplayStyleType.Last,
    },
  ];

  return (
    <>
      <OptionsTooltip />
      <div className="config-container">
        <div className="config-options-wrapper">
          <div className="config-title" data-tip="Enable to show bar data labels">
            <p>Show Data Labels</p>
            <label className="switch">
              <input
                type="checkbox"
                onChange={(e: any) => handleCheckbox(EDataLabelsSettings.showDataLabels)}
                checked={configValues[EDataLabelsSettings.showDataLabels]}
              />
              <span className="slider round"></span>
              {configValues[EDataLabelsSettings.showDataLabels] ? (
                <span className="switch-text switch-text-on">On</span>
              ) : (
                <span className="switch-text switch-text-off">Off</span>
              )}
            </label>
          </div>

          {!chartSettings.isPercentageStackedBar &&
            (chartSettings.barType === BarType.Stacked || chartSettings.barType === BarType.GroupedStacked) && (
              <div className="config-title" data-tip="Enable to show bar total labels">
                <p>Show Total Labels</p>
                <label className="switch">
                  <input
                    type="checkbox"
                    onChange={(e: any) => handleCheckbox(EDataLabelsSettings.showTotalLabels)}
                    checked={configValues[EDataLabelsSettings.showTotalLabels]}
                  />
                  <span className="slider round"></span>
                  {configValues[EDataLabelsSettings.showTotalLabels] ? (
                    <span className="switch-text switch-text-on">On</span>
                  ) : (
                    <span className="switch-text switch-text-off">Off</span>
                  )}
                </label>
              </div>
            )}

          {shadow.referenceLinesData.length > 0 && (
            <div className="config-title" data-tip="Enable to show hidden labels below reference line">
              <p>Show Labels Below Reference Line</p>
              <label className="switch">
                <input
                  type="checkbox"
                  onChange={(e: any) => handleCheckbox(EDataLabelsSettings.showLabelsBelowReferenceLine)}
                  checked={configValues[EDataLabelsSettings.showLabelsBelowReferenceLine]}
                />
                <span className="slider round"></span>
                {configValues[EDataLabelsSettings.showLabelsBelowReferenceLine] ? (
                  <span className="switch-text switch-text-on">On</span>
                ) : (
                  <span className="switch-text switch-text-off">Off</span>
                )}
              </label>
            </div>
          )}

          {configValues.showDataLabels && (
            <React.Fragment>
              {!chartSettings.isPercentageStackedBar &&
                (chartSettings.barType === BarType.Stacked || chartSettings.barType === BarType.GroupedStacked) && (
                  <>
                    <ul className="nav-tab-wrapper">
                      {[
                        { label: "Data Labels", value: DataLabelsType.DataLabels },
                        { label: "Total Labels", value: DataLabelsType.TotalLabels },
                      ].map((type) => {
                        return (
                          <li
                            className={configValues.dataLabelsType === type.value ? "active-tab" : ""}
                            onClick={() => handleRadioButtonChange(EDataLabelsSettings.dataLabelsType, type.value)}
                          >
                            {type.label.toLowerCase()}
                          </li>
                        );
                      })}
                    </ul>

                    {/* <div className="mt-20" onChange={(e: any) => handleRadioButtonChange(EDataLabelsSettings.dataLabelsType, e.target.value)}>
                                        <p className="config-label" data-tip="Select data label type">Select Label Type</p>
                                        <label className="radio-container" htmlFor="apply-background-color-radio-1"
                                            data-tip="Show the bar category data labels">
                                            <input type="radio"
                                                style={{ display: "none" }}
                                                value={DataLabelsType.DataLabels}
                                                checked={configValues[EDataLabelsSettings.dataLabelsType] === DataLabelsType.DataLabels}
                                                id="apply-background-color-radio-1" />
                                            <label className={"radio-label " + (configValues[EDataLabelsSettings.dataLabelsType] === DataLabelsType.DataLabels ? "active" : "")} htmlFor="value2">
                                                Data Labels
                                            </label>
                                            <span></span>
                                        </label>
                                        <label className="radio-container" htmlFor="apply-background-color-radio-2"
                                            data-tip="Show bar sub category data total labels">
                                            <input type="radio"
                                                value={DataLabelsType.TotalLabels}
                                                checked={configValues[EDataLabelsSettings.dataLabelsType] === DataLabelsType.TotalLabels}
                                                id="apply-background-color-radio-2" />
                                            <label className={"radio-label " + (configValues[EDataLabelsSettings.dataLabelsType] === DataLabelsType.TotalLabels ? "active" : "")} htmlFor="value1">
                                                Total Labels
                                            </label>
                                            <span></span>
                                        </label>
                                    </div> */}
                  </>
                )}

              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Select data labels placement within bar">Display Style</span>
                </p>
                <SelectControl
                  selectedValue={dataValues.displayStyleType}
                  optionsList={DataLabelsStylesTypeList}
                  onChange={(e) => handleChange(e.value, EDataLabelsSettings.DisplayStyleType)}
                />
              </div>

              {configValues[EDataLabelsSettings.dataLabelsType] === DataLabelsType.DataLabels && (
                <div className="mb-15">
                  <p className="config-label">
                    <span data-tip="Select data labels placement within bar">Placement</span>
                  </p>
                  <SelectControl
                    selectedValue={dataValues[EDataLabelsSettings.placement]}
                    optionsList={DataLabelsPlacementList}
                    onChange={(e) => handleLabelPlacementChange(e.value, EDataLabelsSettings.placement)}
                  />
                </div>
              )}

              <div className="config-color-label">
                <p className="config-label">
                  <span data-tip="Choose data labels font color">Font Color</span>
                </p>
                <ColorPicker color={splitRGB(dataValues.color)} handleChange={(c) => handleColor(c, "color")} />
              </div>

              {configValues[EDataLabelsSettings.placement] !== DataLabelsType.TotalLabels && (
                <React.Fragment>
                  <div className="mb-15">
                    <p className="config-label">
                      <span data-tip="Select font size type">Font Size Type</span>
                    </p>
                    <SelectControl
                      selectedValue={dataValues[EDataLabelsSettings.fontSizeType]}
                      optionsList={DataLabelsFontSizeTypeList}
                      onChange={(e) => handleChange(e.value, EDataLabelsSettings.fontSizeType)}
                    />
                  </div>
                </React.Fragment>
              )}

              {configValues[configValues.dataLabelsType].fontSizeType === DataLabelsFontSizeType.Custom && (
                <div className="mb-15">
                  <p className="config-label">
                    <span data-tip="Set data labels font size">Font Size</span>
                  </p>
                  <NumberControl
                    value={dataValues[EDataLabelsSettings.fontSize] + ""}
                    controlName={EDataLabelsSettings.fontSize}
                    stepValue={1}
                    handleChange={(e: any) => {
                      handleChange(+e, EDataLabelsSettings.fontSize);
                    }}
                  />
                </div>
              )}

              <div className="mb10">
                <p className="config-label" data-tip="Select data labels font family">
                  Font Family
                </p>
                <FontSelector
                  value={configValues[configValues.dataLabelsType].fontFamily}
                  handleChange={(d) => {
                    handleChange(d.value, EDataLabelsSettings.fontFamily);
                  }}
                />
              </div>

              <div className="font-styling">
                <Radio
                  options={STYLING_OPTIONS}
                  value={configValues[configValues.dataLabelsType].fontStyle}
                  onChange={(v: string) => handleChange(v, EDataLabelsSettings.fontStyle)}
                  multiple
                />
              </div>

              <React.Fragment>
                {(dataValues[EDataLabelsSettings.placement] === DataLabelsPlacement.OutSide ||
                  configValues[EDataLabelsSettings.dataLabelsType] === DataLabelsType.TotalLabels) && (
                  <div className="mb-15">
                    <p className="config-label">
                      <span data-tip="Select data labels orientation">Orientation</span>
                    </p>
                    <SelectControl
                      selectedValue={dataValues[EDataLabelsSettings.orientation]}
                      optionsList={OrientationList}
                      onChange={(e) => handleChange(e.value, EDataLabelsSettings.orientation)}
                    />
                  </div>
                )}

                {shadow.patternSettings.enable && (
                  <>
                    <div className="config-color-label mb-15">
                      <p className="config-label">
                        <span data-tip="Choose data labels border color">Border Color</span>
                      </p>
                      <ColorPicker
                        color={splitRGB(dataValues.textStrokeColor)}
                        handleChange={(c) => handleColor(c, EDataLabelsSettings.TextStrokeColor)}
                      />
                    </div>

                    <div className="mb-15">
                      <p className="config-label">
                        <span data-tip="Set data labels font size">Border Size</span>
                      </p>
                      <NumberControl
                        value={dataValues.textStrokeWidth + ""}
                        controlName={EDataLabelsSettings.TextStrokeWidth}
                        stepValue={1}
                        handleChange={(e: any) => {
                          handleChange(+e, EDataLabelsSettings.TextStrokeWidth);
                        }}
                      />
                    </div>
                  </>
                )}

                <React.Fragment>
                  <div className="config-title" data-tip="Enable to show background within data labels">
                    <p>Show Background</p>
                    <label className="switch">
                      <input
                        type="checkbox"
                        onChange={(e: any) => handleCheckbox(EDataLabelsSettings.showBackground)}
                        checked={dataValues[EDataLabelsSettings.showBackground]}
                      />
                      <span className="slider round"></span>
                      {dataValues[EDataLabelsSettings.showBackground] ? (
                        <span className="switch-text switch-text-on">On</span>
                      ) : (
                        <span className="switch-text switch-text-off">Off</span>
                      )}
                    </label>
                  </div>

                  {dataValues.showBackground && (
                    <div>
                      <div className="config-color-label mb-15">
                        <p className="config-label">
                          <span data-tip="Choose data labels background color">Background Color</span>
                        </p>
                        <ColorPicker
                          color={splitRGB(dataValues.backgroundColor)}
                          handleChange={(c) => handleColor(c, "backgroundColor")}
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
                            value={dataValues[EDataLabelsSettings.transparency]}
                            ref={sliderRef}
                            onChange={(e: any) => {
                              handleChange(+e.target.value, EDataLabelsSettings.transparency);
                            }}
                          />
                          <span className="config-value">{dataValues[EDataLabelsSettings.transparency]}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              </React.Fragment>
            </React.Fragment>
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

export default DataLabelsSettings;
