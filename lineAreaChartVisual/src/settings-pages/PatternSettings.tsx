import * as React from "react";
import PatternSelector from "./PatternSelector";
import { PATTERN_SETTINGS } from "../constants";
import { isEmpty } from "lodash";
import ImageUploader from "react-images-upload";
import { IChartSettings, IPatternProps, IPatternSettings, IRankingSettings } from "../visual-settings.model";
import { BarType, EPatternSettings, ERankingSettings, EVisualSettings, Orientation, PatternType } from "../enum";
import NumberControl from "@truviz/shadow/dist/Components/Editor/Components/NumberControl";
import OptionsTooltip from "./OptionsTooltip";

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      var image = new Image();
      image.src = reader.result + "";
      image.onload = () => {
        resolve({
          base64Data: reader.result,
          dimensions: {
            width: image.width,
            height: image.height,
          },
        });
      };
    };
    reader.onerror = (error) => reject(error);
  });

const getImageSlices = (file: File, col: number, row: number, sliceWidth?: number, sliceHeight?: number) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      var image = new Image();
      image.src = reader.result + "";
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
          base64Data: reader.result,
          slicesBase64Data: imagePieces,
          dimensions: {
            width: width,
            height: height,
          },
        });
      };
      reader.onerror = (error) => reject(error);
    };
  });

const PatternOptions = (props) => {
  const {
    shadow,
    compConfig: { sectionName, propertyName },
    config,
    vizOptions,
    closeCurrentSettingHandler,
    closeAdvancedSettingsHandler,
  } = props;

  let initialStates = vizOptions.formatTab[sectionName][propertyName];
  const chartSettings: IChartSettings = shadow[EVisualSettings.ChartSettings];
  const patternType: PatternType =
    chartSettings.orientation === Orientation.Horizontal
      ? PatternType.HorizontalPatterns
      : PatternType.VerticalPatterns;

  try {
    initialStates = JSON.parse(initialStates);
    const categoryPatterns: IPatternProps[] = shadow.chartData
      .filter((d) => d.category !== shadow.othersBarText)
      .map((d) => ({
        category: d.category,
        patternIdentifier: d.pattern?.patternIdentifier ?? "",
        isImagePattern: d.pattern?.isImagePattern ?? false,
        dimensions: d.pattern?.dimensions,
      }));

    const categoricalSubcategoriesNames = shadow?.categoricalSubcategoriesNames.map((name) => ({ name: name }));
    const subCategoryPatterns: IPatternProps[] = (
      chartSettings.barType === BarType.GroupedStacked ? categoricalSubcategoriesNames : shadow.subCategories
    )
      .filter((d) => !d.name.includes(shadow.othersBarText))
      .map((d) => ({
        category: d.name,
        patternIdentifier: shadow.subCategoriesMap[d.name]?.pattern?.patternIdentifier ?? "",
        isImagePattern: shadow.subCategoriesMap[d.name]?.pattern?.isImagePattern ?? false,
        dimensions: shadow.subCategoriesMap[d.name]?.pattern?.dimensions,
      }));

    if (shadow.isHasSubcategories && chartSettings.barType !== BarType.Normal) {
      initialStates[EPatternSettings.patterns] = subCategoryPatterns;
      initialStates[PatternType.HorizontalPatterns] = subCategoryPatterns;
      initialStates[PatternType.VerticalPatterns] = subCategoryPatterns;
    } else {
      initialStates[EPatternSettings.patterns] = categoryPatterns;
      initialStates[PatternType.HorizontalPatterns] = categoryPatterns;
      initialStates[PatternType.VerticalPatterns] = categoryPatterns;
    }

    initialStates = {
      ...PATTERN_SETTINGS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...PATTERN_SETTINGS };
  }

  const rankingSettings: IRankingSettings = shadow[EVisualSettings.RankingSettings];
  const [configValues, setConfigValues] = React.useState<IPatternSettings>({
    ...initialStates,
  });

  const applyChanges = () => {
    shadow.persistProperties(sectionName, propertyName, configValues);
    closeCurrentSettingHandler();
  };

  const handleCheckbox = (n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: !d[n],
    }));
  };

  const handleByCategoryCheckbox = (n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: !d[n],
    }));
    handleSingleCategoryChange(configValues.singlePattern.patternIdentifier);
  };

  // const handleByCategoryCheckbox = (n) => {
  //     const verticalPatterns = JSON.parse(JSON.stringify([...configValues[PatternType.VerticalPatterns]]));
  //     const horizontalPatterns = JSON.parse(JSON.stringify([...configValues[PatternType.HorizontalPatterns]]));
  //     const singlePattern = configValues.singlePattern;

  //     if (configValues[n]) {
  //         if (!singlePattern.isImagePattern) {
  //             verticalPatterns.forEach((p) => {
  //                 p.patternIdentifier = singlePattern.patternIdentifier;
  //                 p.isImagePattern = singlePattern.isImagePattern;
  //                 p.dimensions = singlePattern?.dimensions;
  //             });
  //             horizontalPatterns.forEach((p) => {
  //                 p.patternIdentifier = singlePattern.patternIdentifier;
  //                 p.isImagePattern = singlePattern.isImagePattern;
  //                 p.dimensions = singlePattern?.dimensions;
  //             });
  //         }

  //         if (singlePattern.imageBase64Url) {
  //             userImageUploadHandler(configValues.imageFile, false, true);
  //         }
  //     }

  //     setConfigValues((d) => ({
  //         ...d,
  //         [n]: !d[n],
  //         verticalPatterns: verticalPatterns,
  //         horizontalPatterns: horizontalPatterns,
  //     }));
  // };

  const handleByCategoryChange = (patternName, index) => {
    let patterns = [...configValues.patterns];
    patterns[index].patternIdentifier = patternName !== "NONE" ? patternName : "";
    setConfigValues((d) => ({
      ...d,
      patterns: patterns,
    }));
  };

  const handleSingleCategoryChange = (patternName) => {
    const verticalPatterns = JSON.parse(JSON.stringify([...configValues[PatternType.VerticalPatterns]]));
    const horizontalPatterns = JSON.parse(JSON.stringify([...configValues[PatternType.HorizontalPatterns]]));

    verticalPatterns.forEach((p) => {
      p.patternIdentifier = patternName !== "NONE" ? patternName : "";
      p.isImagePattern = false;
    });
    horizontalPatterns.forEach((p) => {
      p.patternIdentifier = patternName !== "NONE" ? patternName : "";
      p.isImagePattern = false;
    });
    setConfigValues((d) => ({
      ...d,
      verticalPatterns: verticalPatterns,
      horizontalPatterns: horizontalPatterns,
      singlePattern: { ...d.singlePattern, patternIdentifier: patternName !== "NONE" ? patternName : "" },
    }));
  };

  const handleChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: val,
    }));
  };

  const [imageStatus, setImageStatus] = React.useState(configValues.imageData ? "INITIALIZED" : "NOTPRESENT");
  const userImageUploadHandler = (
    file: any,
    othersPatternFlag = false,
    isSinglePattern: boolean = false,
    index: number = 0
  ) => {
    let patterns = [...configValues[patternType]];
    let verticalPatterns = JSON.parse(JSON.stringify([...configValues[PatternType.VerticalPatterns]]));
    let horizontalPatterns = JSON.parse(JSON.stringify([...configValues[PatternType.HorizontalPatterns]]));

    if (chartSettings.orientation === Orientation.Horizontal) {
      verticalPatterns = verticalPatterns.reverse();
    } else if (chartSettings.orientation === Orientation.Vertical) {
      horizontalPatterns = horizontalPatterns.reverse();
    }

    if (isEmpty(file)) {
      if (othersPatternFlag) {
        handleChange(
          {
            patternIdentifier: "",
            isImagePattern: false,
            dimensions: {},
          },
          "othersPattern"
        );
      } else {
        if (isSinglePattern) {
          patterns.forEach((p) => {
            p.patternIdentifier = "";
            p.isImagePattern = false;
          });
          setConfigValues((d) => ({
            ...d,
            singlePattern: { ...d.singlePattern, patternIdentifier: "", isImagePattern: false },
          }));
        } else {
          patterns[index].patternIdentifier = "";
          patterns[index].isImagePattern = false;
          setConfigValues((d) => ({
            ...d,
            patterns: patterns,
          }));
        }
      }
      return;
    }

    setImageStatus("UPLOADING");

    if (file && file[0]) {
      if (configValues.byCategory || chartSettings.barType === BarType.Stacked) {
        toBase64(file[0])
          .then(({ base64Data, dimensions }) => {
            if (othersPatternFlag) {
              handleChange(
                {
                  patternIdentifier: base64Data,
                  isImagePattern: true,
                  dimensions: dimensions,
                },
                "othersPattern"
              );
            } else {
              setConfigValues((d) => ({
                ...d,
                imageBase64Url: base64Data,
              }));

              if (isSinglePattern) {
                setConfigValues((d) => ({
                  ...d,
                  singlePattern: {
                    ...d.singlePattern,
                    patternIdentifier: base64Data,
                    isImagePattern: true,
                    dimensions: dimensions,
                  },
                }));
              } else {
                patterns[index].patternIdentifier = base64Data;
                patterns[index].isImagePattern = true;
                patterns[index].dimensions = dimensions;
                setConfigValues((d) => ({
                  ...d,
                  patterns: patterns,
                }));
              }
            }
            setImageStatus("INITIALIZED");
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        // Vertical Image Slices
        if (chartSettings.orientation === Orientation.Vertical) {
          getImageSlices(file[0], patterns.length, 1)
            .then(({ base64Data, slicesBase64Data, dimensions }) => {
              if (othersPatternFlag) {
                handleChange(
                  {
                    patternIdentifier: base64Data,
                    isImagePattern: true,
                    dimensions: dimensions,
                  },
                  "othersPattern"
                );
              } else {
                setConfigValues((d) => ({
                  ...d,
                  imageBase64Url: base64Data,
                }));

                if (isSinglePattern) {
                  setConfigValues((d) => ({
                    ...d,
                    singlePattern: {
                      ...d.singlePattern,
                      patternIdentifier: base64Data,
                      isImagePattern: true,
                      dimensions: dimensions,
                    },
                  }));
                  const getPatternIdentifier = (category: string) =>
                    shadow.categoricalSubCategoriesList.findIndex((p) => p === category);
                  verticalPatterns.forEach((p, i) => {
                    if (chartSettings.barType === BarType.Normal) {
                      p.patternIdentifier = slicesBase64Data[i];
                    } else if (chartSettings.barType === BarType.Grouped) {
                      p.patternIdentifier = slicesBase64Data[getPatternIdentifier(p.category)];
                    }

                    p.isImagePattern = true;
                    p.dimensions = dimensions;
                  });

                  setConfigValues((d) => ({
                    ...d,
                    verticalPatterns: verticalPatterns,
                  }));
                } else {
                  verticalPatterns[index].patternIdentifier = slicesBase64Data;
                  verticalPatterns[index].isImagePattern = true;
                  verticalPatterns[index].dimensions = dimensions;
                  setConfigValues((d) => ({
                    ...d,
                    verticalPatterns: verticalPatterns,
                  }));
                }
              }
              setImageStatus("INITIALIZED");
            })
            .catch((error) => {
              console.log(error);
            });
        }

        // Horizontal Image Slices
        if (chartSettings.orientation === Orientation.Horizontal) {
          getImageSlices(file[0], 1, patterns.length)
            .then(({ base64Data, slicesBase64Data, dimensions }) => {
              setConfigValues((d) => ({
                ...d,
                imageBase64Url: base64Data,
              }));

              if (othersPatternFlag) {
                handleChange(
                  {
                    patternIdentifier: base64Data,
                    isImagePattern: true,
                    dimensions: dimensions,
                  },
                  "othersPattern"
                );
              } else {
                if (isSinglePattern) {
                  setConfigValues((d) => ({
                    ...d,
                    singlePattern: {
                      ...d.singlePattern,
                      patternIdentifier: base64Data,
                      isImagePattern: true,
                      dimensions: dimensions,
                    },
                  }));
                  const getPatternIdentifier = (category: string) =>
                    shadow.categoricalSubCategoriesList.findIndex((p) => p === category);
                  horizontalPatterns.forEach((p, i) => {
                    if (chartSettings.barType === BarType.Normal) {
                      p.patternIdentifier = slicesBase64Data[horizontalPatterns.length - 1 - i];
                    } else if (chartSettings.barType === BarType.Grouped) {
                      p.patternIdentifier = slicesBase64Data[getPatternIdentifier(p.category)];
                    }

                    p.isImagePattern = true;
                    p.dimensions = dimensions;
                  });
                  setConfigValues((d) => ({
                    ...d,
                    horizontalPatterns: horizontalPatterns,
                  }));
                } else {
                  horizontalPatterns[index].patternIdentifier = slicesBase64Data;
                  horizontalPatterns[index].isImagePattern = true;
                  horizontalPatterns[index].dimensions = dimensions;
                  setConfigValues((d) => ({
                    ...d,
                    horizontalPatterns: horizontalPatterns,
                  }));
                }
              }
              setImageStatus("INITIALIZED");
            })
            .catch((error) => {
              console.log(error);
            });
        }
      }
    }
  };

  return (
    <>
      <OptionsTooltip />
      <div className="config-container config-container-vertical config-container-colors">
        <div className="config-options-wrapper">
          <div>
            <div className="config-title">
              <p data-tip="Enable to apply the bar pattern">Enable/Disable</p>
              <label className="switch">
                <input
                  type="checkbox"
                  onChange={(e: any) => {
                    handleCheckbox("enable");
                  }}
                  checked={configValues.enable}
                />
                <span className="slider round"></span>
                {configValues.enable ? (
                  <span className="switch-text switch-text-on">On</span>
                ) : (
                  <span className="switch-text switch-text-off">Off</span>
                )}
              </label>
            </div>
          </div>

          {configValues.enable && (
            <React.Fragment>
              <div className="config-title">
                <p data-tip="Enable to show bar pattern border">Show Pattern Border</p>
                <label className="switch">
                  <input
                    type="checkbox"
                    onChange={(e: any) => {
                      handleCheckbox(EPatternSettings.showBorder);
                    }}
                    checked={configValues[EPatternSettings.showBorder]}
                  />
                  <span className="slider round"></span>
                  {configValues[EPatternSettings.showBorder] ? (
                    <span className="switch-text switch-text-on">On</span>
                  ) : (
                    <span className="switch-text switch-text-off">Off</span>
                  )}
                </label>
              </div>

              {configValues[EPatternSettings.showBorder] && (
                <React.Fragment>
                  <div className="mb-15">
                    <p className="config-label">
                      <span data-tip="Set pattern border width">Pattern Border Width</span>
                    </p>
                    <NumberControl
                      value={configValues[EPatternSettings.borderWidth] + ""}
                      controlName={EPatternSettings.borderWidth}
                      stepValue={1}
                      handleChange={(e: any) => {
                        handleChange(+e, EPatternSettings.borderWidth);
                      }}
                    />
                  </div>
                </React.Fragment>
              )}

              {/* {chartSettings.barType !== BarType.Stacked && */}
              {/* ( */}
              <div data-tip="Check to apply bar pattern by category">
                <label htmlFor="enable-popout-checkbox" className="checkbox-container">
                  <input
                    type="checkbox"
                    id="enable-popout-checkbox"
                    checked={configValues[EPatternSettings.byCategory]}
                    onChange={() => handleByCategoryCheckbox(EPatternSettings.byCategory)}
                  />
                  By Category
                  <span></span>
                </label>
              </div>
              {/* )} */}

              {!configValues[EPatternSettings.byCategory] && (
                <React.Fragment>
                  <div className="pattern-wrapper">
                    <div className="pattern-selector">
                      <PatternSelector
                        value={configValues[EPatternSettings.singlePattern][EPatternSettings.patternIdentifier]}
                        disabled={configValues[EPatternSettings.singlePattern][EPatternSettings.isImagePattern]}
                        handleChange={(d) => {
                          handleSingleCategoryChange(d.value);
                        }}
                      />
                    </div>
                    <div>
                      <ImageUploader
                        withIcon={false}
                        onChange={(file) => userImageUploadHandler(file, false, true)}
                        imgExtension={[".jpg", ".gif", ".png", ".jpeg"]}
                        maxFileSize={500000}
                        singleImage={true}
                        withPreview={true}
                        withLabel={false}
                        buttonText=""
                        {...(configValues.singlePattern.isImagePattern
                          ? {
                              defaultImages: [configValues.singlePattern.patternIdentifier],
                            }
                          : {})}
                      />
                      {imageStatus === "UPLOADING" && <span>Uploading Image</span>}
                    </div>
                  </div>

                  {configValues.enable &&
                    ((rankingSettings[ERankingSettings.isCategoriesRanking] &&
                      rankingSettings[ERankingSettings.showRemainingAsOthers]) ||
                      (rankingSettings[ERankingSettings.isSubcategoriesRanking] &&
                        rankingSettings[ERankingSettings.subCategoriesRanking][
                          ERankingSettings.showRemainingAsOthers
                        ])) && (
                      <>
                        <div className="pattern-wrapper">
                          <div className="pattern-selector">
                            <p className="config-label">Others</p>
                            <PatternSelector
                              value={configValues.othersPattern.patternIdentifier}
                              disabled={configValues.othersPattern.isImagePattern}
                              handleChange={(d) => {
                                handleChange(
                                  {
                                    patternIdentifier: d.value,
                                    isImagePattern: false,
                                    dimensions: {},
                                  },
                                  "othersPattern"
                                );
                              }}
                            />
                          </div>
                          <div>
                            <ImageUploader
                              withIcon={false}
                              onChange={(file) => userImageUploadHandler(file, true, false, 0)}
                              imgExtension={[".jpg", ".gif", ".png", ".jpeg"]}
                              maxFileSize={500000}
                              singleImage={true}
                              withPreview={true}
                              withLabel={false}
                              buttonText=""
                              {...(configValues.othersPattern.isImagePattern
                                ? {
                                    defaultImages: [configValues.othersPattern.patternIdentifier],
                                  }
                                : {})}
                            />
                            {imageStatus === "UPLOADING" && <span>Uploading Image</span>}
                          </div>
                        </div>
                      </>
                    )}
                </React.Fragment>
              )}

              {configValues[EPatternSettings.byCategory] && (
                <React.Fragment>
                  {configValues.patterns.map((category, index) => {
                    let defaultImages = {};
                    if (category.isImagePattern) {
                      defaultImages = {
                        defaultImages: [category.patternIdentifier],
                      };
                    }
                    return (
                      <>
                        <div className="pattern-wrapper">
                          <div className="pattern-selector">
                            <p className="config-label">{category.category}</p>
                            <PatternSelector
                              value={category.patternIdentifier}
                              disabled={category.isImagePattern}
                              handleChange={(d) => {
                                handleByCategoryChange(d.value, index);
                              }}
                            />
                          </div>
                          <div>
                            <ImageUploader
                              withIcon={false}
                              onChange={(file) => userImageUploadHandler(file, false, false, index)}
                              imgExtension={[".jpg", ".gif", ".png", ".jpeg"]}
                              maxFileSize={500000}
                              singleImage={true}
                              withPreview={true}
                              withLabel={false}
                              buttonText=""
                              {...defaultImages}
                            />
                            {imageStatus === "UPLOADING" && <span>Uploading Image</span>}
                          </div>
                        </div>
                      </>
                    );
                  })}

                  {configValues.enable &&
                    ((rankingSettings[ERankingSettings.isCategoriesRanking] &&
                      rankingSettings[ERankingSettings.showRemainingAsOthers]) ||
                      (rankingSettings[ERankingSettings.isSubcategoriesRanking] &&
                        rankingSettings[ERankingSettings.subCategoriesRanking][
                          ERankingSettings.showRemainingAsOthers
                        ])) && (
                      <>
                        <div className="pattern-wrapper">
                          <div className="pattern-selector">
                            <p className="config-label">Others</p>
                            <PatternSelector
                              value={configValues.othersPattern.patternIdentifier}
                              disabled={configValues.othersPattern.isImagePattern}
                              handleChange={(d) => {
                                handleChange(
                                  {
                                    patternIdentifier: d.value,
                                    isImagePattern: false,
                                    dimensions: {},
                                  },
                                  "othersPattern"
                                );
                              }}
                            />
                          </div>
                          <div>
                            <ImageUploader
                              withIcon={false}
                              onChange={(file) => userImageUploadHandler(file, true, false, 0)}
                              imgExtension={[".jpg", ".gif", ".png", ".jpeg"]}
                              maxFileSize={500000}
                              singleImage={true}
                              withPreview={true}
                              withLabel={false}
                              buttonText=""
                              {...(configValues.othersPattern.isImagePattern
                                ? {
                                    defaultImages: [configValues.othersPattern.patternIdentifier],
                                  }
                                : {})}
                            />
                            {imageStatus === "UPLOADING" && <span>Uploading Image</span>}
                          </div>
                        </div>
                      </>
                    )}
                </React.Fragment>
              )}
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

export default PatternOptions;
