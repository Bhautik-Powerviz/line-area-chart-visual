import * as React from "react";
import { BarType, ColorPaletteType, EBarSettings, EVisualConfig, EVisualSettings, Orientation } from "../enum";
import { IChartSettings, IDataColorsSettings, IPatternProps, IPatternSettings } from "../visual-settings.model";
import ColorPicker from "./ColorPicker";
import { adjoinRGB, splitRGB } from "../methods";

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

const BarSettings = (props) => {
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
      ...initialStates,
    };
  } catch (e) {}

  const applyChanges = () => {
    shadow.setChartDataByRanking();
    const chartSettings: IChartSettings = shadow[EVisualSettings.ChartSettings];
    const patternSettings: IPatternSettings = shadow.patternSettings;
    let verticalPatterns: IPatternProps[] = [];
    let horizontalPatterns: IPatternProps[] = [];
    const getCategoriesIndex = (category: string) => shadow.categoriesList.findIndex((p) => p === category);
    const getSubCategoriesIndex = (category: string) =>
      shadow.categoricalSubCategoriesList.findIndex((p) => p === category);

    const categoryPatterns: IPatternProps[] = shadow.chartData
      .filter((d) => d.category !== shadow.othersBarText)
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

    // if (
    //     shadow.barSettings.barType !== configValues.barType &&
    //     !patternSettings.byCategory &&
    //     patternSettings.singlePattern.isImagePattern
    // ) {
    //     if (chartSettings.orientation === Orientation.Vertical) {
    //         getImageSlices(patternSettings.imageBase64Url, verticalPatterns.length, 1)
    //             .then(({ base64Data, slicesBase64Data, dimensions }) => {
    //                 verticalPatterns.forEach((p, i) => {
    //                     if (configValues.barType === BarType.Normal) {
    //                         p.patternIdentifier = slicesBase64Data[getCategoriesIndex(p.category)];
    //                     } else if (configValues.barType === BarType.Grouped) {
    //                         p.patternIdentifier = slicesBase64Data[getSubCategoriesIndex(p.category)];
    //                     }
    //                     p.isImagePattern = true;
    //                     p.dimensions = dimensions;
    //                 });
    //                 const patternConfigValues: IPatternSettings = {
    //                     ...patternSettings,
    //                     verticalPatterns: verticalPatterns,
    //                 };
    //                 shadow.persistProperties(EVisualConfig.PatternConfig, EVisualSettings.PatternSettings, patternConfigValues);
    //             })
    //             .catch((error) => {
    //                 console.log(error);
    //             });
    //     } else if (chartSettings.orientation === Orientation.Horizontal) {
    //         getImageSlices(patternSettings.imageBase64Url, 1, horizontalPatterns.length)
    //             .then(({ base64Data, slicesBase64Data, dimensions }) => {
    //                 horizontalPatterns.forEach((p, i) => {
    //                     if (configValues.barType === BarType.Normal) {
    //                         p.patternIdentifier = slicesBase64Data[getCategoriesIndex(p.category)];
    //                     } else if (configValues.barType === BarType.Grouped) {
    //                         p.patternIdentifier = slicesBase64Data[getSubCategoriesIndex(p.category)];
    //                     }
    //                     p.isImagePattern = true;
    //                     p.dimensions = dimensions;
    //                 });
    //                 const patternConfigValues: IPatternSettings = {
    //                     ...patternSettings,
    //                     horizontalPatterns: horizontalPatterns,
    //                 };
    //                 shadow.persistProperties(EVisualConfig.PatternConfig, EVisualSettings.PatternSettings, patternConfigValues);
    //             })
    //             .catch((error) => {
    //                 console.log(error);
    //             });
    //     }
    // }

    shadow.persistProperties(sectionName, propertyName, configValues);
    closeCurrentSettingHandler();
  };

  const [configValues, setConfigValues] = React.useState({
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

  const sliderRef = React.useRef(null);
  const [isHasSubCategories] = React.useState(!!vizOptions.options.dataViews[0].categorical.categories[1]);
  const chartSettings: IChartSettings = shadow[EVisualSettings.ChartSettings];
  const dataColorsSettings: IDataColorsSettings = shadow[EVisualSettings.DataColorsSettings];
  const isBarWithNoColor = dataColorsSettings.fillType === ColorPaletteType.NoColor;

  if (isBarWithNoColor) {
    configValues[EBarSettings.IsShowBarBorder] = true;
  }

  return (
    <>
      <div className="config-container">
        <div className="config">
          <label className="config-label" htmlFor={EBarSettings.BarType}>
            Bar Type
          </label>
          <div className="config-option">
            <select
              id="barType"
              value={configValues.barType}
              onChange={(e) => handleChange(e.target.value, EBarSettings.BarType)}
            >
              <option value={BarType.Normal}>Regular</option>
              <option
                value={BarType.Stacked}
                className={!isHasSubCategories ? "disabled" : ""}
                disabled={!isHasSubCategories}
              >
                Stacked
              </option>
              <option
                value={BarType.Grouped}
                className={!isHasSubCategories ? "disabled" : ""}
                disabled={!isHasSubCategories}
              >
                Grouped
              </option>
            </select>
          </div>
        </div>

        {chartSettings.orientation === Orientation.Vertical && (
          <React.Fragment>
            <div className="config">
              <label className="config-label" htmlFor="barTopPadding">
                Bar Top Padding
              </label>
              <div className="config-option">
                <input
                  id="barTopPadding"
                  className={"range-slider"}
                  min="0"
                  max="100"
                  type="range"
                  value={configValues[EBarSettings.BarTopPadding]}
                  ref={sliderRef}
                  onChange={(e: any) => {
                    handleChange(+e.target.value, EBarSettings.BarTopPadding);
                  }}
                />
                <span className="config-value">{configValues[EBarSettings.BarTopPadding]}%</span>
              </div>
            </div>

            <div className="config">
              <label className="config-label" htmlFor="barBottomPadding">
                Bar Bottom Padding
              </label>
              <div className="config-option">
                <input
                  id="barBottomPadding"
                  className={"range-slider"}
                  min="0"
                  max="100"
                  type="range"
                  value={configValues[EBarSettings.BarBottomPadding]}
                  ref={sliderRef}
                  onChange={(e: any) => {
                    handleChange(+e.target.value, EBarSettings.BarBottomPadding);
                  }}
                />
                <span className="config-value">{configValues[EBarSettings.BarBottomPadding]}%</span>
              </div>
            </div>
          </React.Fragment>
        )}

        {chartSettings.orientation === Orientation.Horizontal && (
          <React.Fragment>
            <div className="config">
              <label className="config-label" htmlFor="barLeftPadding">
                Bar Left Padding
              </label>
              <div className="config-option">
                <input
                  id="barLeftPadding"
                  className={"range-slider"}
                  min="0"
                  max="100"
                  type="range"
                  value={configValues[EBarSettings.BarLeftPadding]}
                  ref={sliderRef}
                  onChange={(e: any) => {
                    handleChange(+e.target.value, EBarSettings.BarLeftPadding);
                  }}
                />
                <span className="config-value">{configValues[EBarSettings.BarLeftPadding]}%</span>
              </div>
            </div>

            <div className="config">
              <label className="config-label" htmlFor="barRightPadding">
                Bar Right Padding
              </label>
              <div className="config-option">
                <input
                  id="barRightPadding"
                  className={"range-slider"}
                  min="0"
                  max="100"
                  type="range"
                  value={configValues[EBarSettings.BarRightPadding]}
                  ref={sliderRef}
                  onChange={(e: any) => {
                    handleChange(+e.target.value, EBarSettings.BarRightPadding);
                  }}
                />
                <span className="config-value">{configValues[EBarSettings.BarRightPadding]}%</span>
              </div>
            </div>
          </React.Fragment>
        )}

        <React.Fragment>
          <div className="config config-switch">
            <label className="config-label" htmlFor={EBarSettings.IsShowBarBorder}>
              Show Bar Border
            </label>
            <div className="config-option">
              <label className={isBarWithNoColor ? "disabled switch" : "switch"}>
                <input
                  id={EBarSettings.IsShowBarBorder}
                  type="checkbox"
                  disabled={isBarWithNoColor}
                  checked={isBarWithNoColor ? true : configValues[EBarSettings.IsShowBarBorder]}
                  onChange={(e: any) => {
                    handleCheckbox(EBarSettings.IsShowBarBorder);
                  }}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          {configValues[EBarSettings.IsShowBarBorder] && (
            <React.Fragment>
              <div className="config">
                <label className="config-label" htmlFor={EBarSettings.BarBorderColor}>
                  Bar Border Color
                </label>
                <div className="config-option" id={EBarSettings.BarBorderColor}>
                  <ColorPicker
                    color={splitRGB(configValues[EBarSettings.BarBorderColor])}
                    handleChange={(c) => handleColor(c, EBarSettings.BarBorderColor)}
                  />
                </div>
              </div>

              <div className="config">
                <label className="config-label" htmlFor={EBarSettings.BarBorderWidth}>
                  Bar Border Width
                </label>
                <div className="config-option">
                  <input
                    id={EBarSettings.BarBorderWidth}
                    type="number"
                    value={configValues[EBarSettings.BarBorderWidth]}
                    onChange={(e: any) => {
                      handleChange(+e.target.value, EBarSettings.BarBorderWidth);
                    }}
                  />
                </div>
              </div>
            </React.Fragment>
          )}
        </React.Fragment>

        <div className="config-btn-group">
          <button className="cancel-btn btn" onClick={closeCurrentSettingHandler}>
            Cancel
          </button>
          <button className="apply-btn btn" onClick={applyChanges}>
            Apply
          </button>
        </div>
      </div>
    </>
  );
};

export default BarSettings;
