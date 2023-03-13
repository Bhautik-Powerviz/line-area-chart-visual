import * as React from "react";
import { RANKING_SETTINGS } from "../constants";
import { BarType, ERankingSettings, EVisualConfig, EVisualSettings, Orientation, RankingFilterType } from "../enum";
import { adjoinRGB, splitRGB } from "../methods";
import { IChartSettings, ILabelValuePair, IPatternProps, IPatternSettings } from "../visual-settings.model";
import * as d3 from "d3";
import { IVisualCategoryData, IVisualSubCategoryData } from "../visual-data.model";
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

const RankingSettings = (props) => {
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
      ...RANKING_SETTINGS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...RANKING_SETTINGS };
  }

  const [configValues, setConfigValues] = React.useState({
    ...initialStates,
  });

  const [subCategoriesConfigValues, setSubCategoriesConfigValues] = React.useState(
    configValues[ERankingSettings.subCategoriesRanking]
  );

  React.useEffect(() => {
    setConfigValues((d) => ({
      ...d,
      [ERankingSettings.subCategoriesRanking]: subCategoriesConfigValues,
    }));
  }, [subCategoriesConfigValues]);

  let chartData: IVisualCategoryData[] = [];
  let subCategories: { name: string; color: string }[] = [];
  let subCategoriesMap: { [key: string]: IVisualSubCategoryData } = {};

  const setChartDataByRanking = () => {
    const rankingSettings = configValues;
    if (rankingSettings.isCategoriesRanking) {
      if (rankingSettings.filterType === RankingFilterType.TopN) {
        if (shadow.isHorizontalChart) {
          shadow.othersBarData = shadow.clonedChartData.slice(0, shadow.clonedChartData.length - rankingSettings.count);
          chartData = shadow.clonedChartData.slice(
            shadow.clonedChartData.length - rankingSettings.count,
            shadow.clonedChartData.length
          );
        } else {
          shadow.othersBarData = shadow.clonedChartData.slice(rankingSettings.count, shadow.clonedChartData.length);
          chartData = shadow.clonedChartData.slice(0, rankingSettings.count);
        }
      }
      if (rankingSettings.filterType === RankingFilterType.BottomN) {
        if (shadow.isHorizontalChart) {
          if (rankingSettings.count <= shadow.clonedChartData.length) {
            shadow.othersBarData = shadow.clonedChartData.slice(rankingSettings.count, shadow.clonedChartData.length);
            chartData = shadow.clonedChartData.slice(0, rankingSettings.count);
          }
        } else {
          if (rankingSettings.count <= shadow.clonedChartData.length) {
            shadow.othersBarData = shadow.clonedChartData.slice(
              0,
              shadow.clonedChartData.length - rankingSettings.count
            );
            chartData = shadow.clonedChartData.slice(
              shadow.clonedChartData.length - rankingSettings.count,
              shadow.clonedChartData.length
            );
          }
        }
      }

      const getOthersSubCategoriesDataField = (values: number, i?: number) => {
        return {
          category: shadow.othersBarText + i ?? "",
          value: values,
          styles: { bar: { fillColor: "rgb(84, 84, 84)" } },
          tooltipFields: shadow.chartData[0]?.subCategories[0]?.tooltipFields,
          selectionId: shadow.visualUpdateOptions.host.createSelectionIdBuilder().createSelectionId(),
        };
      };

      if (shadow.chartSettings.barType !== BarType.Normal && rankingSettings.isSubcategoriesRanking) {
        chartData.forEach((data) => {
          data.subCategories.sort((a, b) => b.value - a.value);
        });

        shadow.clonedChartData.forEach((data) => {
          data.subCategories.sort((a, b) => b.value - a.value);
        });

        if (rankingSettings.subCategoriesRanking.filterType === RankingFilterType.TopN) {
          chartData.forEach((data, i) => {
            if (rankingSettings.subCategoriesRanking.showRemainingAsOthers) {
              const othersSubCategoriesData = data.subCategories.slice(
                rankingSettings.subCategoriesRanking.count,
                data.subCategories.length
              );
              data.subCategories = data.subCategories.slice(0, rankingSettings.subCategoriesRanking.count);
              const othersSubCategoriesDataValues = d3.sum(othersSubCategoriesData, (d) => d.value);
              const othersSubCategoriesDataField = getOthersSubCategoriesDataField(othersSubCategoriesDataValues, i);
              if (othersSubCategoriesData.length) {
                data.subCategories.push(othersSubCategoriesDataField);
              }
            } else {
              data.subCategories = data.subCategories.slice(0, rankingSettings.subCategoriesRanking.count);
            }
            data.value = d3.sum(data.subCategories, (d) => d.value);
          });
        }

        if (rankingSettings.subCategoriesRanking.filterType === RankingFilterType.BottomN) {
          chartData.forEach((data, i) => {
            if (rankingSettings.subCategoriesRanking.count <= data.subCategories.length) {
              if (rankingSettings.subCategoriesRanking.showRemainingAsOthers) {
                const othersSubCategoriesData = data.subCategories.slice(
                  0,
                  data.subCategories.length - rankingSettings.subCategoriesRanking.count
                );

                data.subCategories = data.subCategories.slice(
                  data.subCategories.length - rankingSettings.subCategoriesRanking.count,
                  data.subCategories.length
                );
                const othersSubCategoriesDataValues = d3.sum(othersSubCategoriesData, (d) => d.value);
                const othersSubCategoriesDataField = getOthersSubCategoriesDataField(othersSubCategoriesDataValues, i);

                if (othersSubCategoriesData.length) {
                  data.subCategories.push(othersSubCategoriesDataField);
                }
              } else {
                data.subCategories = data.subCategories.slice(
                  data.subCategories.length - rankingSettings.subCategoriesRanking.count,
                  data.subCategories.length
                );
              }
              data.value = d3.sum(data.subCategories, (d) => d.value);
            }
          });
        }
      }

      if (configValues.isCategoriesRanking || configValues.isSubcategoriesRanking) {
        const subCategoriesVal = [];
        subCategories = [];
        chartData.forEach((data) => {
          data.subCategories.forEach((sub) => {
            const isAlreadyHasCategory = subCategories.some((d) => d.name === sub.category);
            if (!isAlreadyHasCategory) {
              subCategoriesVal.push({ name: sub.category, color: "" });
            }
          });
        });
        subCategories = subCategoriesVal;
      }

      chartData.forEach((d) => {
        d.subCategories.forEach((s) => {
          subCategoriesMap[s.category] = s;
        });
      });
    } else {
      chartData = shadow.clonedChartData;
    }
  };

  const chartSettings: IChartSettings = shadow[EVisualSettings.ChartSettings];
  const applyChanges = async () => {
    if (
      configValues.isCategoriesRanking &&
      configValues.count > shadow.originalCategoricalData.categories[0]?.values?.length
    ) {
      closeCurrentSettingHandler();
      return;
    }

    if (
      configValues.isSubcategoriesRanking &&
      configValues.subCategoriesRanking.count > shadow.originalCategoricalData.values.length
    ) {
      closeCurrentSettingHandler();
      return;
    }

    shadow.persistProperties(sectionName, propertyName, configValues);
    setChartDataByRanking();

    const count = configValues.isCategoriesRanking
      ? chartSettings.barType === BarType.Normal
        ? configValues.count
        : configValues.isSubcategoriesRanking
        ? configValues.subCategoriesRanking.count
        : chartData[0]?.subCategories.length
      : chartData.length;

    const patternSettings: IPatternSettings = shadow.patternSettings;
    let verticalPatterns: IPatternProps[] = [];
    let horizontalPatterns: IPatternProps[] = [];
    const categoriesList = chartData.map((d) => d.category);
    const subCategoriesList = chartData[0]?.subCategories.map((d) => d.category);
    const getCategoriesIndex = (category: string) => categoriesList.findIndex((p) => p === category);
    const getSubCategoriesIndex = (category: string) => subCategoriesList.findIndex((p) => p === category);

    const categoryPatterns: IPatternProps[] = chartData
      .filter((d) => d.category !== shadow.othersBarText)
      .map((d) => ({
        category: d.category,
        patternIdentifier: d.pattern?.patternIdentifier ?? "",
        isImagePattern: d.pattern?.isImagePattern ?? false,
        dimensions: d.pattern?.dimensions,
      }));

    const subCategoryPatterns: IPatternProps[] = subCategories
      .filter((d) => !d.name.includes(shadow.othersBarText))
      .map((d) => ({
        category: d.name,
        patternIdentifier: subCategoriesMap[d.name]?.pattern?.patternIdentifier ?? "",
        isImagePattern: subCategoriesMap[d.name]?.pattern?.isImagePattern ?? false,
        dimensions: subCategoriesMap[d.name]?.pattern?.dimensions,
      }));

    if (shadow.isHasSubcategories && chartSettings.barType !== BarType.Normal) {
      horizontalPatterns = subCategoryPatterns;
      verticalPatterns = subCategoryPatterns;
    } else {
      horizontalPatterns = categoryPatterns;
      verticalPatterns = categoryPatterns;
    }

    if (!patternSettings.byCategory && patternSettings.singlePattern.isImagePattern) {
      if (chartSettings.orientation === Orientation.Vertical) {
        getImageSlices(patternSettings.imageBase64Url, count, 1)
          .then(({ base64Data, slicesBase64Data, dimensions }) => {
            verticalPatterns.forEach((p, i) => {
              if (chartSettings.barType === BarType.Normal) {
                p.patternIdentifier = slicesBase64Data[i];
              } else if (chartSettings.barType === BarType.Grouped) {
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
      } else if (chartSettings.orientation === Orientation.Horizontal) {
        categoriesList.reverse();
        getImageSlices(patternSettings.imageBase64Url, 1, count)
          .then(({ base64Data, slicesBase64Data, dimensions }) => {
            horizontalPatterns.forEach((p, i) => {
              if (chartSettings.barType === BarType.Normal) {
                p.patternIdentifier = slicesBase64Data[getCategoriesIndex(p.category)];
              } else if (chartSettings.barType === BarType.Grouped) {
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
    closeCurrentSettingHandler();
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

  const handleColorChange = ({ rgb }, n) => {
    setConfigValues((d: any) => ({
      ...d,
      [n]: adjoinRGB(rgb),
    }));
  };

  const handleSubCategoriesColorChange = ({ rgb }, n) => {
    setSubCategoriesConfigValues((d: any) => ({
      ...d,
      [n]: adjoinRGB(rgb),
    }));
  };

  const handleSubCategoriesCheckbox = (n) => {
    setSubCategoriesConfigValues((d) => ({
      ...d,
      [n]: !d[n],
    }));
  };

  const handleSubCategoriesChange = (val, n) => {
    setSubCategoriesConfigValues((d) => ({
      ...d,
      [n]: val,
    }));
  };

  const RankingFilterTypeList: ILabelValuePair[] = [
    {
      label: "Top N",
      value: RankingFilterType.TopN,
    },
    {
      label: "Bottom N",
      value: RankingFilterType.BottomN,
    },
  ];

  return (
    <>
      <OptionsTooltip />
      <div className="config-container">
        <div className="config-options-wrapper">
          <React.Fragment>
            <div className="config-title" data-tip="Enable to show bars by category data ranking">
              <p>Category Ranking</p>
              <label className="switch">
                <input
                  type="checkbox"
                  onChange={(e: any) => handleCheckbox(ERankingSettings.isCategoriesRanking)}
                  checked={configValues[ERankingSettings.isCategoriesRanking]}
                />
                <span className="slider round"></span>
                {configValues[ERankingSettings.isCategoriesRanking] ? (
                  <span className="switch-text switch-text-on">On</span>
                ) : (
                  <span className="switch-text switch-text-off">Off</span>
                )}
              </label>
            </div>

            {configValues[ERankingSettings.isCategoriesRanking] && (
              <React.Fragment>
                <div className="mb-15">
                  <p className="config-label">
                    <span data-tip="Select the bars ranking filter type">Filter Type</span>
                  </p>
                  <SelectControl
                    selectedValue={configValues[ERankingSettings.filterType]}
                    optionsList={RankingFilterTypeList}
                    onChange={(e) => handleChange(e.value, ERankingSettings.filterType)}
                  />
                </div>

                <React.Fragment>
                  <div className="mb-15">
                    <p className="config-label">
                      <span data-tip="Count for display the number of bars">Count</span>
                    </p>
                    <NumberControl
                      value={configValues[ERankingSettings.count] + ""}
                      controlName={ERankingSettings.count}
                      stepValue={1}
                      handleChange={(e: any) => {
                        handleChange(+e, ERankingSettings.count);
                      }}
                    />
                  </div>

                  <div className="config-title" data-tip="Show remaining bars as combined others bar">
                    <p>Show remaining as Others</p>
                    <label className="switch">
                      <input
                        type="checkbox"
                        onChange={(e: any) => handleCheckbox(ERankingSettings.showRemainingAsOthers)}
                        checked={configValues[ERankingSettings.showRemainingAsOthers]}
                      />
                      <span className="slider round"></span>
                      {configValues[ERankingSettings.showRemainingAsOthers] ? (
                        <span className="switch-text switch-text-on">On</span>
                      ) : (
                        <span className="switch-text switch-text-off">Off</span>
                      )}
                    </label>
                  </div>

                  {configValues[ERankingSettings.showRemainingAsOthers] &&
                    (!configValues[ERankingSettings.isSubcategoriesRanking] ||
                      !configValues[ERankingSettings.subCategoriesRanking][ERankingSettings.showRemainingAsOthers]) && (
                      <React.Fragment>
                        <div className="config-color-label">
                          <p className="config-label">
                            <span data-tip="Choose others bar color">Bar Color</span>
                          </p>
                          <ColorPicker
                            color={splitRGB(configValues[ERankingSettings.barColor])}
                            handleChange={(c) => handleColorChange(c, ERankingSettings.barColor)}
                          />
                        </div>
                      </React.Fragment>
                    )}
                </React.Fragment>
              </React.Fragment>
            )}

            {chartSettings.barType !== BarType.Normal && (
              <React.Fragment>
                <div className="config-title" data-tip="Enable to show bars by sub-category data ranking">
                  <p>Sub Category Ranking</p>
                  <label className="switch">
                    <input
                      type="checkbox"
                      onChange={(e: any) => handleCheckbox(ERankingSettings.isSubcategoriesRanking)}
                      checked={configValues[ERankingSettings.isSubcategoriesRanking]}
                    />
                    <span className="slider round"></span>
                    {configValues[ERankingSettings.isSubcategoriesRanking] ? (
                      <span className="switch-text switch-text-on">On</span>
                    ) : (
                      <span className="switch-text switch-text-off">Off</span>
                    )}
                  </label>
                </div>

                {configValues[ERankingSettings.isSubcategoriesRanking] && (
                  <React.Fragment>
                    <div>
                      <p className="config-label">
                        <span data-tip="Select the bars filter type">Filter Type</span>
                      </p>
                      <SelectControl
                        selectedValue={configValues[ERankingSettings.subCategoriesRanking][ERankingSettings.filterType]}
                        optionsList={RankingFilterTypeList}
                        onChange={(d) => handleSubCategoriesChange(d.value, ERankingSettings.filterType)}
                      />
                    </div>

                    <React.Fragment>
                      <div className="mb-15">
                        <p className="config-label">
                          <span data-tip="Count for display the number of bars">Count</span>
                        </p>
                        <NumberControl
                          value={configValues[ERankingSettings.subCategoriesRanking][ERankingSettings.count] + ""}
                          controlName={ERankingSettings.count}
                          stepValue={1}
                          handleChange={(e: any) => {
                            handleSubCategoriesChange(+e, ERankingSettings.count);
                          }}
                        />
                      </div>

                      <div className="config-title" data-tip="Show remaining bars as combined others bar">
                        <p>Show remaining as Others</p>
                        <label className="switch">
                          <input
                            type="checkbox"
                            onChange={(e: any) => handleSubCategoriesCheckbox(ERankingSettings.showRemainingAsOthers)}
                            checked={
                              configValues[ERankingSettings.subCategoriesRanking][
                                ERankingSettings.showRemainingAsOthers
                              ]
                            }
                          />
                          <span className="slider round"></span>
                          {configValues[ERankingSettings.subCategoriesRanking][
                            ERankingSettings.showRemainingAsOthers
                          ] ? (
                            <span className="switch-text switch-text-on">On</span>
                          ) : (
                            <span className="switch-text switch-text-off">Off</span>
                          )}
                        </label>
                      </div>

                      {configValues[ERankingSettings.subCategoriesRanking][ERankingSettings.showRemainingAsOthers] && (
                        <div className="config-color-label">
                          <p className="config-label">
                            <span data-tip="Set sub category others bar color">Bar Color</span>
                          </p>
                          <ColorPicker
                            color={splitRGB(
                              configValues[ERankingSettings.subCategoriesRanking][ERankingSettings.barColor]
                            )}
                            handleChange={(c) => handleSubCategoriesColorChange(c, ERankingSettings.barColor)}
                          />
                        </div>
                      )}
                    </React.Fragment>
                  </React.Fragment>
                )}
              </React.Fragment>
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

export default RankingSettings;
