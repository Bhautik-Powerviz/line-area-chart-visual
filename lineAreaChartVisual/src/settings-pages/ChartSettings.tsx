import * as React from "react";
import { CHART_SETTINGS } from "../constants";
import {
  EBarComparisonMode,
  BarDistanceType,
  BarType,
  ColorPaletteType,
  EChartSettings,
  EVisualConfig,
  EVisualSettings,
  Orientation,
  EAutoCustomType,
  EBarHighlightType,
} from "../enum";
// import horizontalBar from "../../assets/horizontal-bar-chart-icon.png";
// import verticalBar from "../../assets/vertical-bar-chart-icon.png";
// import groupedBar from "../../assets/grouped-bar-chart-icon.png";
// import stackedBar from "../../assets/stacked-bar-chart-icon.png";

import VerticalRegularBarChart from "../../assets/icons/VerticalRegularBarChart.svg";
import HorizontalRegularBarChart from "../../assets/icons/HorizontalRegularBarChart.svg";
import VerticalGroupedBarChart from "../../assets/icons/VerticalGroupedBarChart.svg";
import HorizontalGroupedBarChart from "../../assets/icons/HorizontalGroupedBarChart.svg";
import VerticalStackedBarChart from "../../assets/icons/VerticalStackedBarChart.svg";
import HorizontalStackedBarChart from "../../assets/icons/HorizontalStackedBarChart.svg";
import VerticalStackedGroupBarChart from "../../assets/icons/VerticalStackedGroupBarChart.svg";
import HorizontalStackedGroupBarChart from "../../assets/icons/HorizontalStackedGroupBarChart.svg";

// import verticalBar from "../../assets/vertical-bar-chart-icon.png";

import {
  IChartSettings,
  IDataColorsSettings,
  ILabelValuePair,
  IPatternProps,
  IPatternSettings,
} from "../visual-settings.model";
import { adjoinRGB, splitRGB } from "../methods";
import OptionsTooltip from "./OptionsTooltip";
import SelectControl from "@truviz/shadow/dist/Components/Editor/Components/SelectControl";
import NumberControl from "@truviz/shadow/dist/Components/Editor/Components/NumberControl";
import ColorPicker from "@truviz/shadow/dist/Components/Editor/Components/ColorPicker";

const getImageSlices = (base64Url: string, col: number, row: number, sliceWidth?: number, sliceHeight?: number) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.src = base64Url + "";
    image.onload = () => {
      const width = sliceWidth ?? image?.naturalWidth / col;
      const height = sliceHeight ?? image?.naturalHeight / row;
      const imagePieces = [];
      for (var x = 0; x < col; ++x) {
        for (var y = 0; y < row; ++y) {
          var canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          var context = canvas.getContext("2d");
          context.drawImage(image, x * width, y * height, width, height, 0, 0, canvas.width, canvas.height);
          imagePieces.push(canvas.toDataURL());
        }
      }
      resolve({
        base64Data: base64Url,
        slicesBase64Data: imagePieces,
        dimensions: {
          width: width,
          height: height,
        },
      });
    };
  });

const ChartSettings = (props) => {
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
      ...CHART_SETTINGS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...CHART_SETTINGS };
  }

  const applyChanges = () => {
    const patternSettings: IPatternSettings = shadow.patternSettings;
    let verticalPatterns: IPatternProps[] = [];
    let horizontalPatterns: IPatternProps[] = [];
    const getCategoriesIndex = (category: string) => shadow.categoriesList.findIndex((p) => p === category);
    const getSubCategoriesIndex = (category: string) =>
      shadow.categoricalSubCategoriesList.findIndex((p) => p === category);

    const categoryPatterns: IPatternProps[] = shadow.chartData
      ?.filter((d) => d.category !== shadow.othersBarText)
      .map((d) => ({
        category: d.category,
        patternIdentifier: d.pattern?.patternIdentifier ?? "",
        isImagePattern: d.pattern?.isImagePattern ?? false,
        dimensions: d.pattern?.dimensions,
      }));

    const subCategoryPatterns: IPatternProps[] = shadow.subCategories
      .filter((d) => !d.name.includes(shadow.othersBarText))
      .map((d) => ({
        category: d.name,
        patternIdentifier: shadow.subCategoriesMap[d.name]?.pattern?.patternIdentifier ?? "",
        isImagePattern: shadow.subCategoriesMap[d.name]?.pattern?.isImagePattern ?? false,
        dimensions: shadow.subCategoriesMap[d.name]?.pattern?.dimensions,
      }));

    if (shadow.isHasSubcategories && configValues.barType !== BarType.Normal) {
      horizontalPatterns = subCategoryPatterns;
      verticalPatterns = subCategoryPatterns;
    } else {
      horizontalPatterns = categoryPatterns;
      verticalPatterns = categoryPatterns;
    }

    if (
      (shadow.chartSettings.orientation !== configValues.orientation ||
        shadow.chartSettings.barType !== configValues.barType) &&
      !patternSettings.byCategory &&
      patternSettings.singlePattern.isImagePattern
    ) {
      if (configValues.orientation === Orientation.Vertical) {
        if (shadow.chartSettings.orientation !== configValues.orientation) {
          shadow.categoriesList.reverse();
          shadow.categoricalSubCategoriesList.reverse();
        }
        getImageSlices(patternSettings.imageBase64Url, verticalPatterns.length, 1)
          .then(({ base64Data, slicesBase64Data, dimensions }) => {
            verticalPatterns.forEach((p, i) => {
              if (configValues.barType === BarType.Normal) {
                p.patternIdentifier = slicesBase64Data[getCategoriesIndex(p.category)];
              } else if (configValues.barType === BarType.Grouped) {
                p.patternIdentifier = slicesBase64Data[getSubCategoriesIndex(p.category)];
              }
              p.isImagePattern = true;
              p.dimensions = dimensions;
            });
            const patternConfigValues: IPatternSettings = {
              ...patternSettings,
              verticalPatterns: verticalPatterns,
            };
            shadow.persistProperties(EVisualConfig.PatternConfig, EVisualSettings.PatternSettings, patternConfigValues);
          })
          .catch((error) => {
            console.log(error);
          });
      } else if (configValues.orientation === Orientation.Horizontal) {
        getImageSlices(patternSettings.imageBase64Url, 1, horizontalPatterns.length)
          .then(({ base64Data, slicesBase64Data, dimensions }) => {
            horizontalPatterns.forEach((p, i) => {
              if (configValues.barType === BarType.Normal) {
                p.patternIdentifier = slicesBase64Data[getCategoriesIndex(p.category)];
              } else if (configValues.barType === BarType.Grouped) {
                p.patternIdentifier = slicesBase64Data[getSubCategoriesIndex(p.category)];
              }
              p.isImagePattern = true;
              p.dimensions = dimensions;
            });
            const patternConfigValues: IPatternSettings = {
              ...patternSettings,
              horizontalPatterns: horizontalPatterns,
            };
            shadow.persistProperties(EVisualConfig.PatternConfig, EVisualSettings.PatternSettings, patternConfigValues);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    }

    const toggleDisplayErrorBarsSettings = (isShow: boolean): void => {
      shadow.persistProperties("errorBarsConfig", "errorBarsSettings", {
        ...shadow.errorBarsSettings,
        SHOW_IN_LEFT_MENU: isShow,
      });
    };

    // const toggleSeriesLabelSettings = (isShow: boolean): void => {
    //   shadow.persistProperties("seriesLabelConfig", "seriesLabelSettings", {
    //     ...shadow.seriesLabelSettings,
    //     SHOW_IN_LEFT_MENU: isShow,
    //   });
    // };

    const toggleCutAndClipAxisSettings = (isShow: boolean): void => {
      shadow.persistProperties(EVisualConfig.CutAndClipAxisConfig, EVisualSettings.CutAndClipAxisSettings, {
        ...shadow.cutAndClipAxisSettings,
        SHOW_IN_LEFT_MENU: isShow,
      });
    };

    const toggleDynamicDeviationSettings = (isShow: boolean): void => {
      shadow.persistProperties(EVisualConfig.DynamicDeviationConfig, EVisualSettings.DynamicDeviationSettings, {
        ...shadow.dynamicDeviationSettings,
        SHOW_IN_LEFT_MENU: isShow,
      });
    };

    if (
      configValues[EChartSettings.BarType] === BarType.Stacked ||
      configValues[EChartSettings.BarType] === BarType.GroupedStacked
    ) {
      toggleDisplayErrorBarsSettings(false);
      toggleCutAndClipAxisSettings(false);
    } else {
      toggleDisplayErrorBarsSettings(true);
      toggleCutAndClipAxisSettings(true);
    }

    if (configValues.barType === BarType.Normal || shadow.isNormalBarChart) {
      toggleDynamicDeviationSettings(true);
    } else {
      toggleDynamicDeviationSettings(false);
    }

    // if (configValues.isIBCSThemeEnabled) {
    //   toggleSeriesLabelSettings(true);
    // } else {
    //   toggleSeriesLabelSettings(false);
    // }

    shadow.persistProperties(sectionName, propertyName, configValues);
    closeCurrentSettingHandler();
  };

  const [configValues, setConfigValues] = React.useState<IChartSettings>({
    ...initialStates,
  });

  const handleLollipopDistanceChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: val,
      isLollipopDistanceChange: true,
    }));
  };

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

  const sliderRef = React.useRef(null);
  const [isHasSubCategories] = React.useState(shadow.isHasSubcategories);
  const dataColorsSettings: IDataColorsSettings = shadow[EVisualSettings.DataColorsSettings];
  const isBarWithNoColor = dataColorsSettings.fillType === ColorPaletteType.NoColor;
  const isGroupedStackedBar = shadow.isMultiMeasureValues && !!shadow.categoricalLegendsData;

  React.useEffect(() => {
    if (isGroupedStackedBar) {
      setConfigValues((d) => ({
        ...d,
        [EChartSettings.BarType]: BarType.GroupedStacked,
      }));
    }
  }, []);

  if (isBarWithNoColor) {
    configValues[EChartSettings.IsShowBarBorder] = true;
  }

  if (configValues.barType === BarType.Normal && shadow.isHasSubcategories) {
    configValues.barType = BarType.Grouped;
  } else if (configValues.barType !== BarType.Normal && !shadow.isHasCategories) {
    configValues.barType = BarType.Normal;
  }

  if (!shadow.isHasSubcategories) {
    configValues.barType = BarType.Normal;
  }

  const BarComparisonModes: ILabelValuePair[] = [
    {
      label: "Auto",
      value: EBarComparisonMode.Auto,
    },
    {
      label: "Compare",
      value: EBarComparisonMode.Compare,
    },
  ];

  const DistanceBetweenBars: ILabelValuePair[] = [
    {
      label: "Auto",
      value: EAutoCustomType.Auto,
    },
    {
      label: "Custom",
      value: EAutoCustomType.Custom,
    },
  ];

  const BarHighlightTypeList: ILabelValuePair[] = [
    {
      label: "None",
      value: EBarHighlightType.None,
    },
    {
      label: "Min/Max",
      value: EBarHighlightType.MinMax,
    },
    {
      label: "First/Last",
      value: EBarHighlightType.FirstLast,
    },
    {
      label: "Last",
      value: EBarHighlightType.Last,
    },
  ];

  const isHorizontalBarChart = configValues.orientation === Orientation.Horizontal;

  return (
    <>
      <OptionsTooltip />
      <div className="config-container">
        <div className="config-options-wrapper">
          <div className="mb-15">
            <div className="mb-15">
              <p className="config-label">
                <span data-tip="Orientation of the bar chart">Orientation</span>
              </p>
              <div className="image-option-container">
                <div
                  role="button"
                  data-tip="Horizontal"
                  className={`image-option ${configValues.orientation === Orientation.Horizontal ? "active" : ""}`}
                >
                  <div
                    className="image-block"
                    onClick={() => handleChange(Orientation.Horizontal, EChartSettings.orientation)}
                  >
                    <img src={HorizontalRegularBarChart}></img>
                  </div>
                </div>

                <div
                  role="button"
                  data-tip="Vertical"
                  className={`image-option ${configValues.orientation === Orientation.Vertical ? "active" : ""}`}
                >
                  <div
                    className="image-block"
                    onClick={() => handleChange(Orientation.Vertical, EChartSettings.orientation)}
                  >
                    <img src={VerticalRegularBarChart}></img>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-15">
              <p className="config-label">
                <span data-tip="Types of the bar chart">Bar Type</span>
              </p>
              <div className="image-option-container">
                <div
                  role="button"
                  data-tip="Grouped"
                  className={`image-option ${
                    configValues.barType === BarType.Grouped ||
                    configValues.barType === BarType.Normal ||
                    (!isGroupedStackedBar && configValues.barType !== BarType.Stacked)
                      ? "active"
                      : ""
                  } ${isGroupedStackedBar ? "disabled" : ""}`}
                >
                  <div
                    className="image-block"
                    onClick={() =>
                      handleChange(shadow.isHasSubcategories ? BarType.Grouped : BarType.Normal, EChartSettings.BarType)
                    }
                  >
                    <img src={isHorizontalBarChart ? HorizontalGroupedBarChart : VerticalGroupedBarChart}></img>
                  </div>
                </div>

                <div
                  role="button"
                  data-tip="Stacked"
                  className={`image-option ${configValues.barType === BarType.Stacked ? "active" : ""} ${
                    !isHasSubCategories ? "disabled" : ""
                  } ${isGroupedStackedBar ? "disabled" : ""}`}
                >
                  <div className={`image-block`} onClick={() => handleChange(BarType.Stacked, EChartSettings.BarType)}>
                    <img src={isHorizontalBarChart ? HorizontalStackedBarChart : VerticalStackedBarChart}></img>
                  </div>
                </div>

                <div
                  role="button"
                  data-tip="Grouped + Stacked"
                  className={`image-option ${
                    configValues.barType === BarType.GroupedStacked && isGroupedStackedBar ? "active" : ""
                  } ${!isGroupedStackedBar ? "disabled" : ""}`}
                >
                  <div
                    className="image-block"
                    onClick={() => handleChange(BarType.GroupedStacked, EChartSettings.BarType)}
                  >
                    <img
                      src={isHorizontalBarChart ? HorizontalStackedGroupBarChart : VerticalStackedGroupBarChart}
                    ></img>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="config-title" data-tip="Enable to apply the IBCS theme">
            <p>Apply IBCS Theme</p>
            <label className="switch">
              <input
                type="checkbox"
                onChange={(e: any) => handleCheckbox(EChartSettings.IsIBCSThemeEnabled)}
                checked={configValues.isIBCSThemeEnabled}
              />
              <span className="slider round"></span>
              {configValues.isIBCSThemeEnabled ? (
                <span className="switch-text switch-text-on">On</span>
              ) : (
                <span className="switch-text switch-text-off">Off</span>
              )}
            </label>
          </div>

          {!shadow.rankingSettings.isSubcategoriesRanking && (
            <div className="mb-15">
              <p className="config-label">
                <span data-tip="Set the distance value between each bar">Max Subcategories Length</span>
              </p>
              <NumberControl
                value={configValues.maxSubcategoriesLength + ""}
                controlName={EChartSettings.MaxSubcategoriesLength}
                stepValue={1}
                handleChange={(e: any) => {
                  handleLollipopDistanceChange(+e, EChartSettings.MaxSubcategoriesLength);
                }}
              />
            </div>
          )}

          {(configValues.barType === BarType.Stacked || configValues.barType === BarType.GroupedStacked) && (
            <div data-tip="Transform chart to 100% stacked bar chart">
              <label htmlFor="enable-popout-checkbox" className="checkbox-container">
                <input
                  type="checkbox"
                  id="enable-popout-checkbox"
                  checked={configValues[EChartSettings.IsPercentageStackedBar]}
                  onChange={() => handleCheckbox(EChartSettings.IsPercentageStackedBar)}
                />
                100% Stacked Bar
                <span></span>
              </label>
            </div>
          )}

          <div className="mb-15">
            {configValues.barType === BarType.Grouped && (
              <>
                <p className="config-label">
                  <span data-tip="Grouped chart bar's comparison mode">Bar Comparison Mode</span>
                </p>
                <SelectControl
                  selectedValue={configValues.barComparisonMode}
                  optionsList={BarComparisonModes}
                  onChange={(d) => handleChange(d.value, EChartSettings.BarComparisonMode)}
                />
              </>
            )}
          </div>

          {/* <div className="mb-15">
            <p className="config-label">
              <span data-tip="Select the distance type between each bar">Distance Between Bar</span>
            </p>
            <SelectControl
              selectedValue={configValues.barDistanceType}
              optionsList={DistanceBetweenBars}
              onChange={(d) => handleChange(d.value, EChartSettings.barDistanceType)}
            />
          </div> */}

          {configValues.barDistanceType === BarDistanceType.Custom && (
            <>
              <p className="config-label">
                <span data-tip="Set the bar top corner's radius">Distance Value (%)</span>
              </p>
              <div className="range-slider-input mb-15">
                <input
                  id="barDistance"
                  min="0"
                  max="100"
                  type="range"
                  value={configValues.barDistance}
                  ref={sliderRef}
                  onChange={(e: any) => {
                    handleChange(+e.target.value, EChartSettings.barDistance);
                  }}
                />
                <span className="config-value">{configValues.barDistance}%</span>
              </div>
            </>
          )}

          {(configValues.barType === BarType.Grouped ||
            shadow.isGroupedBarChart ||
            configValues.barType === BarType.GroupedStacked ||
            shadow.isGroupedStackedBar) && (
            <>
              {/* <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Select the distance type between each bar">Distance Between Grouped Bar</span>
                </p>
                <SelectControl
                  selectedValue={configValues.groupedBarDistanceType}
                  optionsList={DistanceBetweenBars}
                  onChange={(d) => handleChange(d.value, EChartSettings.GroupedBarDistanceType)}
                />
              </div> */}

              {configValues.groupedBarDistanceType === BarDistanceType.Custom && (
                <>
                  <p className="config-label">
                    <span data-tip="Set the bar top corner's radius">Distance Value (Grouped Bar) (%)</span>
                  </p>
                  <div className="range-slider-input mb-15">
                    <input
                      id="barDistance"
                      min="0"
                      max="100"
                      type="range"
                      value={configValues.groupedBarDistance}
                      ref={sliderRef}
                      onChange={(e: any) => {
                        handleChange(+e.target.value, EChartSettings.GroupedBarDistance);
                      }}
                    />
                    <span className="config-value">{configValues.groupedBarDistance}%</span>
                  </div>
                </>
              )}
            </>
          )}

          <div className="mb-15">
            {configValues.orientation === Orientation.Vertical && (
              <React.Fragment>
                <p className="config-label">
                  <span data-tip="Set the bar top corner's radius">Bar Top Radius</span>
                </p>
                <div className="range-slider-input mb-15">
                  <input
                    id="barTopPadding"
                    min="0"
                    max="100"
                    type="range"
                    value={configValues.barXPadding}
                    ref={sliderRef}
                    onChange={(e: any) => {
                      handleChange(+e.target.value, EChartSettings.BarXPadding);
                    }}
                  />
                  <span className="config-value">{configValues.barXPadding}%</span>
                </div>

                <p className="config-label">
                  <span data-tip="Set the bar bottom corner's radius">Bar Bottom Radius</span>
                </p>
                <div className="range-slider-input">
                  <input
                    id="barBottomPadding"
                    min="0"
                    max="100"
                    type="range"
                    value={configValues.barYPadding}
                    ref={sliderRef}
                    onChange={(e: any) => {
                      handleChange(+e.target.value, EChartSettings.BarYPadding);
                    }}
                  />
                  <span className="config-value">{configValues[EChartSettings.BarYPadding]}%</span>
                </div>
              </React.Fragment>
            )}
          </div>

          <div className="mb-15">
            {configValues.orientation === Orientation.Horizontal && (
              <React.Fragment>
                <p className="config-label">
                  <span data-tip="Set the bar left corner's radius">Bar Left Radius</span>
                </p>
                <div className="range-slider-input mb-15">
                  <input
                    id="barLeftPadding"
                    min="0"
                    max="100"
                    type="range"
                    value={configValues.barXPadding}
                    ref={sliderRef}
                    onChange={(e: any) => {
                      handleChange(+e.target.value, EChartSettings.BarXPadding);
                    }}
                  />
                  <span className="config-value">{configValues[EChartSettings.BarXPadding]}%</span>
                </div>

                <p className="config-label">
                  <span data-tip="Set the bar right corner's radius">Bar Right Radius</span>
                </p>
                <div className="range-slider-input">
                  <input
                    id="barRightPadding"
                    min="0"
                    max="100"
                    type="range"
                    value={configValues[EChartSettings.BarYPadding]}
                    ref={sliderRef}
                    onChange={(e: any) => {
                      handleChange(+e.target.value, EChartSettings.BarYPadding);
                    }}
                  />
                  <span className="config-value">{configValues[EChartSettings.BarYPadding]}%</span>
                </div>
              </React.Fragment>
            )}
          </div>

          <div className="config-title" data-tip="Turn on to show the borders around the bars">
            <p>Show Bar Border</p>
            <label className="switch">
              <input
                type="checkbox"
                onChange={(e: any) => handleCheckbox(EChartSettings.IsShowBarBorder)}
                checked={isBarWithNoColor ? true : configValues[EChartSettings.IsShowBarBorder]}
              />
              <span className="slider round"></span>
              {(isBarWithNoColor ? true : configValues[EChartSettings.IsShowBarBorder]) ? (
                <span className="switch-text switch-text-on">On</span>
              ) : (
                <span className="switch-text switch-text-off">Off</span>
              )}
            </label>
          </div>

          {configValues[EChartSettings.IsShowBarBorder] && (
            <React.Fragment>
              <div className="config-color-label">
                <p className="config-label">
                  <span data-tip="Set border around the bar">Bar Border Color</span>
                </p>
                <ColorPicker
                  color={splitRGB(configValues[EChartSettings.BarBorderColor])}
                  handleChange={(c) => handleColor(c, EChartSettings.BarBorderColor)}
                />
              </div>

              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Set width of the border around bar">Bar Border Width</span>
                </p>
                <NumberControl
                  value={configValues[EChartSettings.BarBorderWidth] + ""}
                  controlName={EChartSettings.BarBorderWidth}
                  stepValue={1}
                  handleChange={(e: any) => {
                    handleChange(+e, EChartSettings.BarBorderWidth);
                  }}
                />
              </div>
            </React.Fragment>
          )}

          <div className="mb-15">
            <p className="config-label">
              <span data-tip="Select data labels placement within bar">Bar Highlights</span>
            </p>
            <SelectControl
              selectedValue={configValues.barHighlightType}
              optionsList={BarHighlightTypeList}
              onChange={(e) => handleChange(e.value, EChartSettings.BarHighlightType)}
            />
          </div>

          {configValues.barHighlightType !== EBarHighlightType.None && (
            <>
              {configValues.barHighlightType === EBarHighlightType.MinMax && (
                <>
                  <div className="config-color-label mb-15">
                    <p className="config-label">
                      <span data-tip="Choose data labels background color">Min Color</span>
                    </p>
                    <ColorPicker
                      color={splitRGB(configValues.highlightedBarMinColor)}
                      handleChange={(c) => handleColor(c, EChartSettings.HighlightedBarMinColor)}
                    />
                  </div>

                  <div className="config-color-label mb-15">
                    <p className="config-label">
                      <span data-tip="Choose data labels background color">Max Color</span>
                    </p>
                    <ColorPicker
                      color={splitRGB(configValues.highlightedBarMaxColor)}
                      handleChange={(c) => handleColor(c, EChartSettings.HighlightedBarMaxColor)}
                    />
                  </div>
                </>
              )}

              {configValues.barHighlightType !== EBarHighlightType.MinMax && (
                <div className="config-color-label mb-15">
                  <p className="config-label">
                    <span data-tip="Choose data labels background color">Recent Color</span>
                  </p>
                  <ColorPicker
                    color={splitRGB(configValues.highlightedBarRecentColor)}
                    handleChange={(c) => handleColor(c, EChartSettings.HighlightedBarRecentColor)}
                  />
                </div>
              )}

              <div data-tip="Transform chart to 100% stacked bar chart">
                <label htmlFor="enable-popout-checkbox" className="checkbox-container">
                  <input
                    type="checkbox"
                    id="enable-popout-checkbox"
                    checked={configValues.isShowDataLabelForHighlightedBars}
                    onChange={() => handleCheckbox(EChartSettings.IsShowDataLabelForHighlightedBars)}
                  />
                  Show Data-Label For Highlighted Bars
                  <span></span>
                </label>
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

    // <>
    //     <div className="config-container">
    //         <div className="config">
    //             <label className="config-label" htmlFor={EChartSettings.orientation}>
    //                 Orientation
    //             </label>
    // <div className="image-option-container">
    //     <div className={`image-option ${configValues.orientation === Orientation.Horizontal ? "active" : ""}`}>
    //         <div className="image-block" onClick={() => handleChange(Orientation.Horizontal, EChartSettings.orientation)}>
    //             <img src={horizontalBar}></img>
    //         </div>
    //         <span>Horizontal</span>
    //     </div>

    //     <div className={`image-option ${configValues.orientation === Orientation.Vertical ? "active" : ""}`}>
    //         <div className="image-block" onClick={() => handleChange(Orientation.Vertical, EChartSettings.orientation)}>
    //             <img src={verticalBar}></img>
    //         </div>
    //         <span>Vertical</span>
    //     </div>
    // </div>
    //         </div>

    //         <div className="config">
    //             <label className="config-label" htmlFor={EChartSettings.BarType}>
    //                 Bar Type
    //             </label>
    //         <div className="image-option-container">
    //             {/* <div className={`image-option ${configValues.barType === BarType.Normal ? "active" : ""}`}>
    //                 <div className="image-block" onClick={() => handleChange(BarType.Normal, EChartSettings.BarType)}>
    //                     <img src={horizontalBar}></img>
    //                 </div>
    //                 <span>Regular</span>
    //             </div> */}

    //             <div
    //                 className={`image-option ${
    //                     configValues.barType === BarType.Grouped ||
    //                     configValues.barType === BarType.Normal ||
    //                     (!isGroupedStackedBar && configValues.barType !== BarType.Stacked)
    //                         ? "active"
    //                         : ""
    //                 }`}
    //             >
    //         <div
    //             className="image-block"
    //             onClick={() =>
    //                 handleChange(shadow.isHasSubcategories ? BarType.Grouped : BarType.Normal, EChartSettings.BarType)
    //             }
    //         >
    //             <img src={groupedBar}></img>
    //         </div>
    //         <span>Grouped</span>
    //     </div>

    //     <div
    //         className={`image-option ${configValues.barType === BarType.Stacked ? "active" : ""} ${
    //             !isHasSubCategories ? "disabled" : ""
    //         }`}
    //     >
    //         <div className={`image-block`} onClick={() => handleChange(BarType.Stacked, EChartSettings.BarType)}>
    //             <img src={stackedBar}></img>
    //         </div>
    //         <span>Stacked</span>
    //     </div>

    //     <div
    //         className={`image-option ${
    //             configValues.barType === BarType.GroupedStacked && isGroupedStackedBar ? "active" : ""
    //         } ${!isGroupedStackedBar ? "disabled" : ""}`}
    //     >
    //         <div className="image-block" onClick={() => handleChange(BarType.GroupedStacked, EChartSettings.BarType)}>
    //             <img src={groupedBar}></img>
    //         </div>
    //         <span>Grouped + Stacked</span>
    //     </div>
    // </div>
    // </div>

    //         {(configValues.barType === BarType.Stacked || configValues.barType === BarType.GroupedStacked) && (
    //             <div className="config config-checkbox">
    //                 <label className="config-label" htmlFor="isPercentageStackedBar">
    //                     100% Stacked Bar
    //                 </label>
    //                 <div className="config-option">
    //                     <input
    //                         id="isPercentageStackedBar"
    //                         type="checkbox"
    //                         checked={configValues[EChartSettings.IsPercentageStackedBar]}
    //                         onChange={() => handleCheckbox(EChartSettings.IsPercentageStackedBar)}
    //                     />
    //                 </div>
    //             </div>
    //         )}

    //         {configValues.barType === BarType.Grouped && (
    //             <div className="config">
    //                 <label className="config-label" htmlFor={EChartSettings.BarComparisonMode}>
    //                     Bar Comparison Mode
    //                 </label>
    //                 <div className="config-option">
    //                     <select
    //                         id={EChartSettings.BarComparisonMode}
    //                         value={configValues.barComparisonMode}
    //                         onChange={(e) => handleChange(e.target.value, EChartSettings.BarComparisonMode)}
    //                     >
    //                         <option value={EBarComparisonMode.Auto}>Auto</option>
    //                         <option value={EBarComparisonMode.Compare}>Compare</option>
    //                     </select>
    //                 </div>
    //             </div>
    //         )}

    //         <div className="config">
    //             <label className="config-label" htmlFor={EChartSettings.barDistanceType}>
    //                 Distance Between Bar
    //             </label>
    //             <div className="config-option">
    //                 <select
    //                     id={EChartSettings.barDistanceType}
    //                     value={configValues.barDistanceType}
    //                     onChange={(e) => handleChange(e.target.value, EChartSettings.barDistanceType)}
    //                 >
    //                     <option value={BarDistanceType.Auto}>Auto</option>
    //                     <option value={BarDistanceType.Custom}>Custom</option>
    //                 </select>
    //             </div>
    //         </div>

    //         {configValues[EChartSettings.barDistanceType] === BarDistanceType.Custom && (
    //             <div className="config">
    //                 <label className="config-label" htmlFor={EChartSettings.barDistance}>
    //                     Distance Value
    //                 </label>
    //                 <div className="config-option">
    //                     <input
    //                         id={EChartSettings.barDistance}
    //                         type="number"
    //                         value={configValues[EChartSettings.barDistance]}
    //                         onChange={(e: any) => {
    //                             handleLollipopDistanceChange(+e.target.value, EChartSettings.barDistance);
    //                         }}
    //                     />
    //                 </div>
    //             </div>
    //         )}

    // {configValues.orientation === Orientation.Vertical && (
    //     <React.Fragment>
    //         <div className="config">
    //             <label className="config-label" htmlFor="barTopPadding">
    //                 Bar Top Padding
    //             </label>
    //             <div className="config-option">
    //                 <input
    //                     id="barTopPadding"
    //                     className={"range-slider"}
    //                     min="0"
    //                     max="100"
    //                     type="range"
    //                     value={configValues[EChartSettings.BarTopPadding]}
    //                     ref={sliderRef}
    //                     onChange={(e: any) => {
    //                         handleChange(+e.target.value, EChartSettings.BarTopPadding);
    //                     }}
    //                 />
    //                 <span className="config-value">{configValues[EChartSettings.BarTopPadding]}%</span>
    //             </div>
    //         </div>

    //         <div className="config">
    //             <label className="config-label" htmlFor="barBottomPadding">
    //                 Bar Bottom Padding
    //             </label>
    //             <div className="config-option">
    //                 <input
    //                     id="barBottomPadding"
    //                     className={"range-slider"}
    //                     min="0"
    //                     max="100"
    //                     type="range"
    //                     value={configValues[EChartSettings.BarBottomPadding]}
    //                     ref={sliderRef}
    //                     onChange={(e: any) => {
    //                         handleChange(+e.target.value, EChartSettings.BarBottomPadding);
    //                     }}
    //                 />
    //                 <span className="config-value">{configValues[EChartSettings.BarBottomPadding]}%</span>
    //             </div>
    //         </div>
    //     </React.Fragment>
    // )}

    //         {configValues.orientation === Orientation.Horizontal && (
    //             <React.Fragment>
    //                 <div className="config">
    //                     <label className="config-label" htmlFor="barLeftPadding">
    //                         Bar Left Padding
    //                     </label>
    //                     <div className="config-option">
    //                         <input
    //                             id="barLeftPadding"
    //                             className={"range-slider"}
    //                             min="0"
    //                             max="100"
    //                             type="range"
    //                             value={configValues[EChartSettings.BarLeftPadding]}
    //                             ref={sliderRef}
    //                             onChange={(e: any) => {
    //                                 handleChange(+e.target.value, EChartSettings.BarLeftPadding);
    //                             }}
    //                         />
    //                         <span className="config-value">{configValues[EChartSettings.BarLeftPadding]}%</span>
    //                     </div>
    //                 </div>

    //                 <div className="config">
    //                     <label className="config-label" htmlFor="barRightPadding">
    //                         Bar Right Padding
    //                     </label>
    //                     <div className="config-option">
    //                         <input
    //                             id="barRightPadding"
    //                             className={"range-slider"}
    //                             min="0"
    //                             max="100"
    //                             type="range"
    //                             value={configValues[EChartSettings.BarRightPadding]}
    //                             ref={sliderRef}
    //                             onChange={(e: any) => {
    //                                 handleChange(+e.target.value, EChartSettings.BarRightPadding);
    //                             }}
    //                         />
    //                         <span className="config-value">{configValues[EChartSettings.BarRightPadding]}%</span>
    //                     </div>
    //                 </div>
    //             </React.Fragment>
    //         )}

    //         <React.Fragment>
    //             <div className="config config-switch">
    //                 <label className="config-label" htmlFor={EChartSettings.IsShowBarBorder}>
    //                     Show Bar Border
    //                 </label>
    //                 <div className="config-option">
    //                     <label className={isBarWithNoColor ? "disabled switch" : "switch"}>
    //                         <input
    //                             id={EChartSettings.IsShowBarBorder}
    //                             type="checkbox"
    //                             disabled={isBarWithNoColor}
    //                             checked={isBarWithNoColor ? true : configValues[EChartSettings.IsShowBarBorder]}
    //                             onChange={(e: any) => {
    //                                 handleCheckbox(EChartSettings.IsShowBarBorder);
    //                             }}
    //                         />
    //                         <span className="slider round"></span>
    //                     </label>
    //                 </div>
    //             </div>

    //             {configValues[EChartSettings.IsShowBarBorder] && (
    //                 <React.Fragment>
    //                     <div className="config">
    //                         <label className="config-label" htmlFor={EChartSettings.BarBorderColor}>
    //                             Bar Border Color
    //                         </label>
    //                         <div className="config-option" id={EChartSettings.BarBorderColor}>
    //                             <ColorPicker
    //                                 color={splitRGB(configValues[EChartSettings.BarBorderColor])}
    //                                 handleChange={(c) => handleColor(c, EChartSettings.BarBorderColor)}
    //                             />
    //                         </div>
    //                     </div>

    //                     <div className="config">
    //                         <label className="config-label" htmlFor={EChartSettings.BarBorderWidth}>
    //                             Bar Border Width
    //                         </label>
    //                         <div className="config-option">
    //                             <input
    //                                 id={EChartSettings.BarBorderWidth}
    //                                 type="number"
    //                                 value={configValues[EChartSettings.BarBorderWidth]}
    //                                 onChange={(e: any) => {
    //                                     handleChange(+e.target.value, EChartSettings.BarBorderWidth);
    //                                 }}
    //                             />
    //                         </div>
    //                     </div>
    //                 </React.Fragment>
    //             )}
    //         </React.Fragment>

    //         <div className="config-btn-group">
    //             <button className="cancel-btn btn" onClick={closeCurrentSettingHandler}>
    //                 Cancel
    //             </button>
    //             <button className="apply-btn btn" onClick={applyChanges}>
    //                 Apply
    //             </button>
    //         </div>
    //     </div>
    // </>
  );
};

export default ChartSettings;
