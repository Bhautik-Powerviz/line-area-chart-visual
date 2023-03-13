import * as React from "react";
import { SMALL_MULTIPLES_SETTINGS } from "../constants";
import {
  EDataLabelsSettings,
  ESmallMultiplesAxisType,
  ESmallMultiplesBackgroundType,
  ESmallMultiplesDisplayType,
  ESmallMultiplesHeaderAlignment,
  ESmallMultiplesHeaderDisplayType,
  ESmallMultiplesHeaderPosition,
  ESmallMultiplesLayoutType,
  ESmallMultiplesSettings,
  ESmallMultiplesShadowType,
  ESmallMultiplesViewType,
  ESmallMultiplesXAxisPosition,
  ESmallMultiplesYAxisPosition,
  FontStyle,
  LineType,
} from "../enum";
import { ILabelValuePair, ISmallMultiplesSettings } from "../visual-settings.model";
import OptionsTooltip from "./OptionsTooltip";
import { adjoinRGB, splitRGB } from "../methods";
import NumberControl from "@truviz/shadow/dist/Components/Editor/Components/NumberControl";
import SelectControl from "@truviz/shadow/dist/Components/Editor/Components/SelectControl";
import FontSelector from "@truviz/shadow/dist/Components/Editor/Components/FontSelector";
import ColorPicker from "@truviz/shadow/dist/Components/Editor/Components/ColorPicker";

const SmallMultiplesSettings = (props) => {
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
      ...SMALL_MULTIPLES_SETTINGS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...SMALL_MULTIPLES_SETTINGS };
  }

  const applyChanges = () => {
    shadow.persistProperties(sectionName, propertyName, configValues);
    closeCurrentSettingHandler();
  };

  const [configValues, setConfigValues] = React.useState<ISmallMultiplesSettings>({
    ...initialStates,
  });

  const [mainTab, setMainTab] = React.useState<string>(ESmallMultiplesSettings.LayoutPane);
  const [viewTab, setViewTab] = React.useState<string>(ESmallMultiplesSettings.AxisPane);
  const [styleTab, setStyleTab] = React.useState<string>(ESmallMultiplesSettings.BackgroundPane);

  const handleChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: val,
    }));
  };

  const handleHeaderChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [ESmallMultiplesSettings.Header]: {
        ...d[ESmallMultiplesSettings.Header],
        [n]: val,
      },
    }));
  };

  const handleBackgroundChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [ESmallMultiplesSettings.Background]: {
        ...d[ESmallMultiplesSettings.Background],
        [n]: val,
      },
    }));
  };

  const handleBorderChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [ESmallMultiplesSettings.Border]: {
        ...d[ESmallMultiplesSettings.Border],
        [n]: val,
      },
    }));
  };

  const handleShadowChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [ESmallMultiplesSettings.Shadow]: {
        ...d[ESmallMultiplesSettings.Shadow],
        [n]: val,
      },
    }));
  };

  const handleCheckbox = (n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: !d[n],
    }));
  };

  const handleHeaderCheckbox = (n) => {
    setConfigValues((d) => ({
      ...d,
      [ESmallMultiplesSettings.Header]: {
        ...d[ESmallMultiplesSettings.Header],
        [n]: !d[ESmallMultiplesSettings.Header][n],
      },
    }));
  };

  const handleBorderCheckbox = (n) => {
    setConfigValues((d) => ({
      ...d,
      [ESmallMultiplesSettings.Border]: {
        ...d[ESmallMultiplesSettings.Border],
        [n]: !d[ESmallMultiplesSettings.Border][n],
      },
    }));
  };

  const handleShadowCheckbox = (n) => {
    setConfigValues((d) => ({
      ...d,
      [ESmallMultiplesSettings.Shadow]: {
        ...d[ESmallMultiplesSettings.Shadow],
        [n]: !d[ESmallMultiplesSettings.Shadow][n],
      },
    }));
  };

  const handleColor = ({ rgb }, n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: adjoinRGB(rgb),
    }));
  };

  const handleHeaderColor = ({ rgb }, n) => {
    setConfigValues((d) => ({
      ...d,
      [ESmallMultiplesSettings.Header]: {
        ...d[ESmallMultiplesSettings.Header],
        [n]: adjoinRGB(rgb),
      },
    }));
  };

  const handleBackgroundColor = ({ rgb }, n) => {
    setConfigValues((d) => ({
      ...d,
      [ESmallMultiplesSettings.Background]: {
        ...d[ESmallMultiplesSettings.Background],
        [n]: adjoinRGB(rgb),
      },
    }));
  };

  const handleBorderColor = ({ rgb }, n) => {
    setConfigValues((d) => ({
      ...d,
      [ESmallMultiplesSettings.Border]: {
        ...d[ESmallMultiplesSettings.Border],
        [n]: adjoinRGB(rgb),
      },
    }));
  };

  const handleShadowColor = ({ rgb }, n) => {
    setConfigValues((d) => ({
      ...d,
      [ESmallMultiplesSettings.Shadow]: {
        ...d[ESmallMultiplesSettings.Shadow],
        [n]: adjoinRGB(rgb),
      },
    }));
  };

  React.useEffect(() => {
    if (configValues.layoutType !== ESmallMultiplesLayoutType.Grid) {
      setConfigValues((d) => ({
        ...d,
        [ESmallMultiplesSettings.xAxisType]: ESmallMultiplesAxisType.Individual,
        [ESmallMultiplesSettings.yAxisType]: ESmallMultiplesAxisType.Individual,
      }));
    }
  }, []);

  React.useEffect(() => {
    if (
      configValues.layoutType !== ESmallMultiplesLayoutType.Grid &&
      configValues.viewType === ESmallMultiplesViewType.Pagination
    ) {
      setConfigValues((d) => ({
        ...d,
        [ESmallMultiplesSettings.ViewType]: ESmallMultiplesViewType.Scroll,
      }));
    }
  }, [configValues]);

  const PanelClassList: ILabelValuePair[] = [
    {
      value: ESmallMultiplesAxisType.Uniform,
      label: "Uniform",
    },
    {
      value: ESmallMultiplesAxisType.Individual,
      label: "Individual",
    },
  ];

  const DisplayTypeList: ILabelValuePair[] = [
    {
      value: ESmallMultiplesDisplayType.Fixed,
      label: "Fixed",
    },
    {
      value: ESmallMultiplesDisplayType.Fluid,
      label: "Fluid",
    },
  ];

  const ViewTypeList: ILabelValuePair[] = [
    {
      value: ESmallMultiplesViewType.Scroll,
      label: "Scroll",
    },
  ];

  if (configValues.layoutType === ESmallMultiplesLayoutType.Grid) {
    ViewTypeList.push({
      value: ESmallMultiplesViewType.Pagination,
      label: "Pagination",
    });
  }

  const XAxisPositionList: ILabelValuePair[] = [
    {
      value: ESmallMultiplesXAxisPosition.All,
      label: "All",
    },
    {
      value: ESmallMultiplesXAxisPosition.FrozenBottomColumn,
      label: "Frozen Bottom Column",
    },
    {
      value: ESmallMultiplesXAxisPosition.FrozenTopColumn,
      label: "Frozen Top Column",
    },
  ];

  const YAxisPositionList: ILabelValuePair[] = [
    {
      value: ESmallMultiplesYAxisPosition.All,
      label: "All",
    },
    {
      value: ESmallMultiplesYAxisPosition.FrozenLeftColumn,
      label: "Frozen Left Column",
    },
    {
      value: ESmallMultiplesYAxisPosition.FrozenRightColumn,
      label: "Frozen Right Column",
    },
  ];

  const HeaderDisplayType: ILabelValuePair[] = [
    {
      value: ESmallMultiplesHeaderDisplayType.None,
      label: "None",
    },
    {
      value: ESmallMultiplesHeaderDisplayType.TitleOnly,
      label: "Title Only",
    },
    {
      value: ESmallMultiplesHeaderDisplayType.TitleAndTotalValue,
      label: "Title And Total Value",
    },
    {
      value: ESmallMultiplesHeaderDisplayType.TitleAndAverageValue,
      label: "Title And Average Value",
    },
  ];

  const HeaderFontStyleList: ILabelValuePair[] = [
    {
      value: FontStyle.None,
      label: "None",
    },
    {
      value: FontStyle.Bold,
      label: "Bold",
    },
    {
      value: FontStyle.Italic,
      label: "Italic",
    },
    {
      value: FontStyle.UnderLine,
      label: "UnderLine",
    },
  ];

  const HeaderAlignmentList: ILabelValuePair[] = [
    {
      value: ESmallMultiplesHeaderAlignment.Left,
      label: "Left",
    },
    {
      value: ESmallMultiplesHeaderAlignment.Center,
      label: "Center",
    },
    {
      value: ESmallMultiplesHeaderAlignment.Right,
      label: "Right",
    },
  ];

  const HeaderPositionList: ILabelValuePair[] = [
    {
      value: ESmallMultiplesHeaderPosition.Bottom,
      label: "Bottom",
    },
    {
      value: ESmallMultiplesHeaderPosition.Top,
      label: "Top",
    },
  ];

  const BackgroundTypeList: ILabelValuePair[] = [
    {
      value: ESmallMultiplesBackgroundType.All,
      label: "All",
    },
    {
      value: ESmallMultiplesBackgroundType.AlternateItem,
      label: "Alternate Item",
    },
    // {
    //   value: ESmallMultiplesBackgroundType.AlternateRows,
    //   label: "Alternate Rows",
    // },
    // {
    //   value: ESmallMultiplesBackgroundType.AlternateColumns,
    //   label: "Alternate Columns",
    // },
  ];

  const BorderLineTypeList: ILabelValuePair[] = [
    {
      value: LineType.Solid,
      label: "Solid",
    },
    {
      value: LineType.Dashed,
      label: "Dashed",
    },
    {
      value: LineType.Dotted,
      label: "Dotted",
    },
  ];

  const ShadowTypeList: ILabelValuePair[] = [
    {
      value: ESmallMultiplesShadowType.None,
      label: "None",
    },
    {
      value: ESmallMultiplesShadowType.Simple,
      label: "Simple",
    },
    {
      value: ESmallMultiplesShadowType.StandOut,
      label: "StandOut",
    },
    {
      value: ESmallMultiplesShadowType.Custom,
      label: "Custom",
    },
  ];

  return (
    <>
      <OptionsTooltip />
      <div className="config-container">
        <div className="config-options-wrapper">
          <div className="config-title" data-tip="Enable to show error bars">
            <p>Enable Small Multiples</p>
            <label className="switch">
              <input
                type="checkbox"
                onChange={(e: any) => handleCheckbox(ESmallMultiplesSettings.IsSmallMultiplesEnabled)}
                checked={configValues.isSmallMultiplesEnabled}
              />
              <span className="slider round"></span>
              {configValues[ESmallMultiplesSettings.IsSmallMultiplesEnabled] ? (
                <span className="switch-text switch-text-on">On</span>
              ) : (
                <span className="switch-text switch-text-off">Off</span>
              )}
            </label>
          </div>

          {configValues.isSmallMultiplesEnabled && (
            <React.Fragment>
              <ul className="nav-tab-wrapper">
                {[
                  { label: "Layout", value: ESmallMultiplesSettings.LayoutPane },
                  { label: "Style", value: ESmallMultiplesSettings.StylePane },
                ].map((type) => {
                  return (
                    <li className={mainTab === type.value ? "active-tab" : ""} onClick={() => setMainTab(type.value)}>
                      {type.label.toLowerCase()}
                    </li>
                  );
                })}
              </ul>

              {mainTab === ESmallMultiplesSettings.LayoutPane && (
                <>
                  <ul className="nav-tab-wrapper">
                    {[
                      { label: "View", value: ESmallMultiplesSettings.ViewPane },
                      { label: "Axis", value: ESmallMultiplesSettings.AxisPane },
                    ].map((type) => {
                      return (
                        <li
                          className={viewTab === type.value ? "active-tab" : ""}
                          onClick={() => setViewTab(type.value)}
                        >
                          {type.label.toLowerCase()}
                        </li>
                      );
                    })}
                  </ul>

                  {viewTab === ESmallMultiplesSettings.ViewPane && (
                    <>
                      <div className="mb-15">
                        <p className="config-label">
                          <span data-tip="Types of the bar chart">Layout Type</span>
                        </p>
                        <div className="image-option-container">
                          <div
                            role="button"
                            data-tip="Grid"
                            className={`image-option ${
                              configValues.layoutType === ESmallMultiplesLayoutType.Grid ? "active" : ""
                            }`}
                          >
                            <div
                              className="image-block"
                              onClick={() =>
                                handleChange(ESmallMultiplesLayoutType.Grid, ESmallMultiplesSettings.LayoutType)
                              }
                            >
                              Grid
                              {/* <img src={HorizontalGroupedBarChart}></img> */}
                            </div>
                          </div>

                          <div
                            role="button"
                            data-tip="Scaled Rows"
                            className={`image-option ${
                              configValues.layoutType === ESmallMultiplesLayoutType.ScaledRows ? "active" : ""
                            }`}
                          >
                            <div
                              className={`image-block`}
                              onClick={() =>
                                handleChange(ESmallMultiplesLayoutType.ScaledRows, ESmallMultiplesSettings.LayoutType)
                              }
                            >
                              Scaled Rows
                              {/* <img src={HorizontalGroupedBarChart}></img> */}
                            </div>
                          </div>

                          <div
                            role="button"
                            data-tip="Ranked Panels"
                            className={`image-option ${
                              configValues.layoutType === ESmallMultiplesLayoutType.RankedPanels ? "active" : ""
                            }`}
                          >
                            <div
                              className="image-block"
                              onClick={() =>
                                handleChange(ESmallMultiplesLayoutType.RankedPanels, ESmallMultiplesSettings.LayoutType)
                              }
                            >
                              Ranked Scale
                              {/* <img src={HorizontalGroupedBarChart}></img> */}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-15">
                        <p className="config-label">
                          <span data-tip="Select image position within bar area">Display Type</span>
                        </p>
                        <SelectControl
                          selectedValue={configValues.displayType}
                          optionsList={DisplayTypeList}
                          onChange={(e) => handleChange(e.value, ESmallMultiplesSettings.DisplayType)}
                        />
                      </div>

                      <div className="mb-15">
                        <p className="config-label">
                          <span data-tip="Select image position within bar area">View Type</span>
                        </p>
                        <SelectControl
                          selectedValue={configValues.viewType}
                          optionsList={ViewTypeList}
                          onChange={(e) => handleChange(e.value, ESmallMultiplesSettings.ViewType)}
                        />
                      </div>

                      {configValues.displayType === ESmallMultiplesDisplayType.Fixed && (
                        <>
                          {configValues.layoutType === ESmallMultiplesLayoutType.Grid && (
                            <div className="mb-15">
                              <p className="  config-label">
                                <span data-tip="Set axis title font size">Rows</span>
                              </p>
                              <NumberControl
                                value={configValues.rows + ""}
                                controlName={ESmallMultiplesSettings.Rows}
                                stepValue={1}
                                handleChange={(e: any) => {
                                  handleChange(+e, ESmallMultiplesSettings.Rows);
                                }}
                              />
                            </div>
                          )}

                          <div className="mb-15">
                            <p className="config-label">
                              <span data-tip="Set axis title font size">Columns</span>
                            </p>
                            <NumberControl
                              value={configValues.columns + ""}
                              controlName={ESmallMultiplesSettings.Columns}
                              stepValue={1}
                              handleChange={(e: any) => {
                                handleChange(+e, ESmallMultiplesSettings.Columns);
                              }}
                            />
                          </div>
                        </>
                      )}

                      <div className="mb-15">
                        <p className="config-label">
                          <span data-tip="Set the distance value between each bar">Inner Spacing</span>
                        </p>
                        <NumberControl
                          value={configValues.innerSpacing + ""}
                          controlName={ESmallMultiplesSettings.InnerSpacing}
                          stepValue={1}
                          handleChange={(e: any) => {
                            handleChange(+e, ESmallMultiplesSettings.InnerSpacing);
                          }}
                        />
                      </div>

                      <div className="mb-15">
                        <p className="config-label">
                          <span data-tip="Set the distance value between each bar">Outer Spacing</span>
                        </p>
                        <NumberControl
                          value={configValues.outerSpacing + ""}
                          controlName={ESmallMultiplesSettings.OuterSpacing}
                          stepValue={1}
                          handleChange={(e: any) => {
                            handleChange(+e, ESmallMultiplesSettings.OuterSpacing);
                          }}
                        />
                      </div>
                    </>
                  )}

                  {viewTab === ESmallMultiplesSettings.AxisPane && (
                    <>
                      <div className="mb-15">
                        <p className="config-label">
                          <span data-tip="Select image position within bar area">X Axis Type</span>
                        </p>
                        <SelectControl
                          selectedValue={configValues.xAxisType}
                          optionsList={PanelClassList}
                          onChange={(e) => handleChange(e.value, ESmallMultiplesSettings.xAxisType)}
                        />
                      </div>

                      <div className="mb-15">
                        <p className="config-label">
                          <span data-tip="Select image position within bar area">Y Axis Type</span>
                        </p>
                        <SelectControl
                          selectedValue={configValues.yAxisType}
                          optionsList={PanelClassList}
                          onChange={(e) => handleChange(e.value, ESmallMultiplesSettings.yAxisType)}
                        />
                      </div>

                      {configValues.xAxisType === ESmallMultiplesAxisType.Uniform && (
                        <div className="mb-15">
                          <p className="config-label">
                            <span data-tip="Select image position within bar area">X Axis Position</span>
                          </p>
                          <SelectControl
                            selectedValue={configValues.xAxisPosition}
                            optionsList={XAxisPositionList}
                            onChange={(e) => handleChange(e.value, ESmallMultiplesSettings.xAxisPosition)}
                          />
                        </div>
                      )}

                      {configValues.yAxisType === ESmallMultiplesAxisType.Uniform && (
                        <div className="mb-15">
                          <p className="config-label">
                            <span data-tip="Select image position within bar area">Y Axis Position</span>
                          </p>
                          <SelectControl
                            selectedValue={configValues.yAxisPosition}
                            optionsList={YAxisPositionList}
                            onChange={(e) => handleChange(e.value, ESmallMultiplesSettings.yAxisPosition)}
                          />
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {mainTab === ESmallMultiplesSettings.StylePane && (
                <>
                  <ul className="nav-tab-wrapper">
                    {[
                      { label: "Header", value: ESmallMultiplesSettings.HeaderPane },
                      { label: "Background", value: ESmallMultiplesSettings.BackgroundPane },
                      { label: "Border", value: ESmallMultiplesSettings.BorderPane },
                      { label: "Shadow", value: ESmallMultiplesSettings.ShadowPane },
                    ].map((type) => {
                      return (
                        <li
                          className={styleTab === type.value ? "active-tab" : ""}
                          onClick={() => setStyleTab(type.value)}
                        >
                          {type.label.toLowerCase()}
                        </li>
                      );
                    })}
                  </ul>

                  {styleTab === ESmallMultiplesSettings.HeaderPane && (
                    <>
                      <div className="mb-15">
                        <p className="config-label">
                          <span data-tip="Select image position within bar area">Display Type</span>
                        </p>
                        <SelectControl
                          selectedValue={configValues.header.displayType}
                          optionsList={HeaderDisplayType}
                          onChange={(e) => handleHeaderChange(e.value, ESmallMultiplesSettings.DisplayType)}
                        />
                      </div>

                      {configValues.header.displayType !== ESmallMultiplesHeaderDisplayType.None && (
                        <>
                          <div className="mb10">
                            <p className="config-label" data-tip="Select data labels font family">
                              Font Family
                            </p>
                            <FontSelector
                              value={configValues.header.fontFamily}
                              handleChange={(d) => {
                                handleHeaderChange(d.value, EDataLabelsSettings.fontFamily);
                              }}
                            />
                          </div>

                          <div className="mb-15">
                            <p className="config-label">
                              <span data-tip="Set the distance value between each bar">Font Size</span>
                            </p>
                            <NumberControl
                              value={configValues.header.fontSize + ""}
                              controlName={ESmallMultiplesSettings.FontSize}
                              stepValue={1}
                              handleChange={(e: any) => {
                                handleHeaderChange(+e, ESmallMultiplesSettings.FontSize);
                              }}
                            />
                          </div>

                          <div className="config-color-label">
                            <p className="config-label">
                              <span data-tip="Choose data labels font color">Font Color</span>
                            </p>
                            <ColorPicker
                              color={splitRGB(configValues.header.fontColor)}
                              handleChange={(c) => handleHeaderColor(c, ESmallMultiplesSettings.FontColor)}
                            />
                          </div>

                          <div className="mb-15">
                            <p className="config-label">
                              <span data-tip="Select data labels placement within bar">Font Style</span>
                            </p>
                            <SelectControl
                              selectedValue={configValues.header.fontStyle}
                              optionsList={HeaderFontStyleList}
                              onChange={(e) => handleHeaderChange(e.value, ESmallMultiplesSettings.FontStyle)}
                            />
                          </div>

                          <div className="mb-15">
                            <p className="config-label">
                              <span data-tip="Select data labels placement within bar">Alignment</span>
                            </p>
                            <SelectControl
                              selectedValue={configValues.header.alignment}
                              optionsList={HeaderAlignmentList}
                              onChange={(e) => handleHeaderChange(e.value, ESmallMultiplesSettings.Alignment)}
                            />
                          </div>

                          <div className="mb-15">
                            <p className="config-label">
                              <span data-tip="Select data labels placement within bar">Position</span>
                            </p>
                            <SelectControl
                              selectedValue={configValues.header.position}
                              optionsList={HeaderPositionList}
                              onChange={(e) => handleHeaderChange(e.value, ESmallMultiplesSettings.Position)}
                            />
                          </div>

                          <div className="config-title" data-tip="Enable to show bar total labels">
                            <p>Text Wrap</p>
                            <label className="switch">
                              <input
                                type="checkbox"
                                onChange={(e: any) => handleHeaderCheckbox(ESmallMultiplesSettings.IsTextWrapEnabled)}
                                checked={configValues.header.isTextWrapEnabled}
                              />
                              <span className="slider round"></span>
                              {configValues.header.isTextWrapEnabled ? (
                                <span className="switch-text switch-text-on">On</span>
                              ) : (
                                <span className="switch-text switch-text-off">Off</span>
                              )}
                            </label>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {styleTab === ESmallMultiplesSettings.BackgroundPane && (
                    <>
                      <div className="mb-15">
                        <p className="config-label">
                          <span data-tip="Select data labels placement within bar">Type</span>
                        </p>
                        <SelectControl
                          selectedValue={configValues.background.type}
                          optionsList={BackgroundTypeList}
                          onChange={(e) => handleBackgroundChange(e.value, ESmallMultiplesSettings.BackgroundType)}
                        />
                      </div>

                      <div className="config-color-label">
                        <p className="config-label">
                          <span data-tip="Choose data labels font color">Panel Color</span>
                        </p>
                        <ColorPicker
                          color={splitRGB(configValues.background.panelColor)}
                          handleChange={(c) => handleBackgroundColor(c, ESmallMultiplesSettings.PanelColor)}
                        />
                      </div>

                      {configValues.background.type !== ESmallMultiplesBackgroundType.All && (
                        <div className="config-color-label">
                          <p className="config-label">
                            <span data-tip="Choose data labels font color">Alternative Color</span>
                          </p>
                          <ColorPicker
                            color={splitRGB(configValues.background.alternateColor)}
                            handleChange={(c) => handleBackgroundColor(c, ESmallMultiplesSettings.AlternateColor)}
                          />
                        </div>
                      )}

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
                            value={configValues.background.transparency}
                            onChange={(e: any) => {
                              handleBackgroundChange(+e.target.value, ESmallMultiplesSettings.Transparency);
                            }}
                          />
                          <span className="config-value">{configValues.background.transparency}%</span>
                        </div>
                      </div>
                    </>
                  )}

                  {styleTab === ESmallMultiplesSettings.BorderPane && (
                    <>
                      <div className="config-title" data-tip="Enable to show bar total labels">
                        <p>Border</p>
                        <label className="switch">
                          <input
                            type="checkbox"
                            onChange={(e: any) => handleBorderCheckbox(ESmallMultiplesSettings.IsShowBorder)}
                            checked={configValues.border.isShowBorder}
                          />
                          <span className="slider round"></span>
                          {configValues.border.isShowBorder ? (
                            <span className="switch-text switch-text-on">On</span>
                          ) : (
                            <span className="switch-text switch-text-off">Off</span>
                          )}
                        </label>
                      </div>

                      {configValues.border.isShowBorder && (
                        <>
                          <div className="mb-15">
                            <p className="config-label">
                              <span data-tip="Select data labels placement within bar">Style</span>
                            </p>
                            <SelectControl
                              selectedValue={configValues.border.style}
                              optionsList={BorderLineTypeList}
                              onChange={(e) => handleBorderChange(e.value, ESmallMultiplesSettings.Style)}
                            />
                          </div>

                          <div className="mb-15">
                            <p className="config-label">
                              <span data-tip="Set the distance value between each bar">Width</span>
                            </p>
                            <NumberControl
                              value={configValues.border.width + ""}
                              controlName={ESmallMultiplesSettings.Width}
                              stepValue={1}
                              handleChange={(e: any) => {
                                handleBorderChange(+e, ESmallMultiplesSettings.Width);
                              }}
                            />
                          </div>

                          <div className="mb-15">
                            <p className="config-label">
                              <span data-tip="Set the distance value between each bar">Radius</span>
                            </p>
                            <NumberControl
                              value={configValues.border.radius + ""}
                              controlName={ESmallMultiplesSettings.Radius}
                              stepValue={1}
                              handleChange={(e: any) => {
                                handleBorderChange(+e, ESmallMultiplesSettings.Radius);
                              }}
                            />
                          </div>

                          <div className="config-color-label">
                            <p className="config-label">
                              <span data-tip="Choose data labels font color">Color</span>
                            </p>
                            <ColorPicker
                              color={splitRGB(configValues.border.color)}
                              handleChange={(c) => handleBorderColor(c, ESmallMultiplesSettings.Color)}
                            />
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {styleTab === ESmallMultiplesSettings.ShadowPane && (
                    <>
                      <div className="mb-15">
                        <p className="config-label">
                          <span data-tip="Select data labels placement within bar">Type</span>
                        </p>
                        <SelectControl
                          selectedValue={configValues.shadow.type}
                          optionsList={ShadowTypeList}
                          onChange={(e) => handleShadowChange(e.value, ESmallMultiplesSettings.Type)}
                        />
                      </div>

                      {configValues.shadow.type === ESmallMultiplesShadowType.Custom && (
                        <>
                          <div className="mb-15">
                            <p className="config-label">
                              <span data-tip="Set the distance value between each bar">Vertical Offset</span>
                            </p>
                            <NumberControl
                              value={configValues.shadow.verticalOffset + ""}
                              controlName={ESmallMultiplesSettings.VerticalOffset}
                              stepValue={1}
                              handleChange={(e: any) => {
                                handleShadowChange(+e, ESmallMultiplesSettings.VerticalOffset);
                              }}
                            />
                          </div>

                          <div className="mb-15">
                            <p className="config-label">
                              <span data-tip="Set the distance value between each bar">Horizontal Offset</span>
                            </p>
                            <NumberControl
                              value={configValues.shadow.horizontalOffset + ""}
                              controlName={ESmallMultiplesSettings.HorizontalOffset}
                              stepValue={1}
                              handleChange={(e: any) => {
                                handleShadowChange(+e, ESmallMultiplesSettings.HorizontalOffset);
                              }}
                            />
                          </div>

                          <div className="mb-15">
                            <p className="config-label">
                              <span data-tip="Set the distance value between each bar">Blur</span>
                            </p>
                            <NumberControl
                              value={configValues.shadow.blur + ""}
                              controlName={ESmallMultiplesSettings.Blur}
                              stepValue={1}
                              handleChange={(e: any) => {
                                handleShadowChange(+e, ESmallMultiplesSettings.Blur);
                              }}
                            />
                          </div>

                          <div className="mb-15">
                            <p className="config-label">
                              <span data-tip="Set the distance value between each bar">Spread</span>
                            </p>
                            <NumberControl
                              value={configValues.shadow.spread + ""}
                              controlName={ESmallMultiplesSettings.Spread}
                              stepValue={1}
                              handleChange={(e: any) => {
                                handleShadowChange(+e, ESmallMultiplesSettings.Spread);
                              }}
                            />
                          </div>

                          <div className="config-color-label">
                            <p className="config-label">
                              <span data-tip="Choose data labels font color">Color</span>
                            </p>
                            <ColorPicker
                              color={splitRGB(configValues.shadow.color)}
                              handleChange={(c) => handleShadowColor(c, ESmallMultiplesSettings.Color)}
                            />
                          </div>

                          <div className="config-title" data-tip="Enable to show bar total labels">
                            <p>Inset</p>
                            <label className="switch">
                              <input
                                type="checkbox"
                                onChange={(e: any) => handleShadowCheckbox(ESmallMultiplesSettings.Inset)}
                                checked={configValues.shadow.inset}
                              />
                              <span className="slider round"></span>
                              {configValues.shadow.inset ? (
                                <span className="switch-text switch-text-on">On</span>
                              ) : (
                                <span className="switch-text switch-text-off">Off</span>
                              )}
                            </label>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </React.Fragment>
          )}

          <div className="config-btn-wrapper">
            <button className="btn-cancel" onClick={closeCurrentSettingHandler}>
              Cancel
            </button>
            <button className="btn-apply" onClick={applyChanges}>
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SmallMultiplesSettings;
