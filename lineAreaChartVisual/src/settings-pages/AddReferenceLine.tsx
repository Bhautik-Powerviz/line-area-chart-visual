import * as React from "react";
import { isEmpty } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAlignLeft,
  faAlignRight,
  faAlignCenter,
  faBold,
  faItalic,
  faStrikethrough,
  faUnderline,
} from "@fortawesome/free-solid-svg-icons";
import { REFERENCE_LINES_SETTINGS } from "../constants";
import { adjoinRGB, splitRGB } from "../methods";
import Radio from "./Radio";
import {
  EBeforeAfterPosition,
  ELabelPosition,
  EReferenceLineComputation,
  EReferenceLinesType,
  EStartEndPosition,
  EVisualSettings,
  EXYAxisNames,
  LineType,
  Orientation,
  Position,
} from "../enum";
import { IChartSettings, IReferenceLinesSettings } from "../visual-settings.model";
import SelectControl from "@truviz/shadow/dist/Components/Editor/Components/SelectControl";
import NumberControl from "@truviz/shadow/dist/Components/Editor/Components/NumberControl";
import ColorPicker from "@truviz/shadow/dist/Components/Editor/Components/ColorPicker";
import FontSelector from "@truviz/shadow/dist/Components/Editor/Components/FontSelector";
import { ILabelValuePair } from "../visual-settings.model";
import OptionsTooltip from "./OptionsTooltip";

const AddReferenceLines = ({ shadow, details, onAdd, onDelete, onUpdate, index }) => {
  const isAddNew = isEmpty(details);
  const isInitialRender = React.useRef(0);
  const [configValues, setConfigValues] = React.useState<IReferenceLinesSettings>(
    isAddNew ? REFERENCE_LINES_SETTINGS : details
  );
  const [errors, setErros] = React.useState({
    value: "",
    rank: "",
  });

  React.useEffect(() => {
    if (configValues.type === "value") {
      setErros((s) => ({
        ...s,
        rank: "",
      }));
    } else {
      setErros((s) => ({
        ...s,
        value: "",
      }));
    }
  }, [configValues]);

  const sliderRef = React.useRef(null);

  React.useEffect(() => {
    if (isInitialRender.current < 2) {
      isInitialRender.current++;
    } else {
      validateField("rank");
    }
  }, [configValues.rank]);

  React.useEffect(() => {
    if (isInitialRender.current < 2) {
      isInitialRender.current++;
    } else {
      validateField("value");
    }
  }, [configValues.value]);

  const isError = React.useMemo(() => {
    return Object.values(errors).some((el) => !!el);
  }, [errors]);

  let chartSettings: IChartSettings = shadow[EVisualSettings.ChartSettings];

  const axisNameList: { label: string; value: string; axis: string }[] = [
    {
      label: shadow.categoryDisplayName,
      value: shadow.categoryDisplayName,
      axis: EXYAxisNames.X,
    },
  ];

  if (shadow.isHasSubcategories) {
    shadow?.categoricalSubCategoriesList?.forEach((subCategory) => {
      axisNameList.push({
        label: subCategory,
        value: subCategory,
        axis: EXYAxisNames.Y,
      });
    });
  } else {
    axisNameList.push({
      label: shadow.categoricalMeasureDisplayName[0],
      value: shadow.categoricalMeasureDisplayName[0],
      axis: EXYAxisNames.Y,
    });
  }

  if (shadow.categoricalReferenceLinesNames?.length) {
    shadow.categoricalReferenceLinesNames.forEach((name) => {
      axisNameList.push({
        label: name,
        value: name,
        axis: EXYAxisNames.Y,
      });
    });
  }

  const ReferenceLinesTypeList: ILabelValuePair[] = [
    {
      label: "Ranking",
      value: EReferenceLinesType.Ranking,
    },
    {
      label: "Value",
      value: EReferenceLinesType.Value,
    },
  ];

  const ComputationTypeList: ILabelValuePair[] = [
    {
      label: "Min",
      value: EReferenceLineComputation.Min,
    },
    {
      label: "Max",
      value: EReferenceLineComputation.Max,
    },
    {
      label: "Average",
      value: EReferenceLineComputation.Average,
    },
    {
      label: "Median",
      value: EReferenceLineComputation.Median,
    },
    {
      label: "Fixed",
      value: EReferenceLineComputation.Fixed,
    },
  ];

  let LabelPositionList: ILabelValuePair[];
  if (chartSettings.orientation === Orientation.Vertical) {
    LabelPositionList = [
      {
        label: "Before",
        value: EBeforeAfterPosition.Before,
      },
      {
        label: "After",
        value: EBeforeAfterPosition.After,
      },
    ];
  } else {
    LabelPositionList = [
      {
        label: "Top",
        value: EBeforeAfterPosition.Before,
      },
      {
        label: "Below",
        value: EBeforeAfterPosition.After,
      },
    ];
  }

  const LineStyleList: ILabelValuePair[] = [
    {
      label: "Solid",
      value: LineType.Solid,
    },
    {
      label: "Dashed",
      value: LineType.Dashed,
    },
  ];

  const RankOrderList: ILabelValuePair[] = [];
  if (configValues.axis === "Y" && !shadow.isHorizontalChart) {
    RankOrderList.push({
      label: "Bottom",
      value: Position.Bottom,
    });

    RankOrderList.push({
      label: "Top",
      value: Position.Top,
    });
  } else {
    RankOrderList.push({
      label: "Start",
      value: Position.Start,
    });

    RankOrderList.push({
      label: "End",
      value: Position.End,
    });
  }

  const BarAreaPositionToHighlightList: ILabelValuePair[] = [];
  if (
    (configValues["axis"] === EXYAxisNames.X && !shadow.isHorizontalChart) ||
    (configValues["axis"] === EXYAxisNames.Y && shadow.isHorizontalChart)
  ) {
    BarAreaPositionToHighlightList.push({
      label: "Left",
      value: Position.Left,
    });

    BarAreaPositionToHighlightList.push({
      label: "Right",
      value: Position.Right,
    });
  }

  if (
    (configValues["axis"] === EXYAxisNames.X && shadow.isHorizontalChart) ||
    (configValues["axis"] === EXYAxisNames.Y && !shadow.isHorizontalChart)
  ) {
    BarAreaPositionToHighlightList.push({
      label: "Top",
      value: Position.Top,
    });

    BarAreaPositionToHighlightList.push({
      label: "Bottom",
      value: Position.Bottom,
    });
  }

  const LinePositionOnBarList: ILabelValuePair[] = [];
  if (chartSettings.orientation === Orientation.Vertical) {
    LinePositionOnBarList.push({
      label: "Left",
      value: Position.Left,
    });

    LinePositionOnBarList.push({
      label: "Right",
      value: Position.Right,
    });
  }

  if (chartSettings.orientation === Orientation.Horizontal) {
    LinePositionOnBarList.push({
      label: "Top",
      value: Position.Top,
    });

    LinePositionOnBarList.push({
      label: "Bottom",
      value: Position.Bottom,
    });
  }

  const ALIGNMENT_OPTIONS = [
    {
      value: "left",
      label: <FontAwesomeIcon icon={faAlignLeft} />,
    },
    {
      value: "center",
      label: <FontAwesomeIcon icon={faAlignCenter} />,
    },
    {
      value: "right",
      label: <FontAwesomeIcon icon={faAlignRight} />,
    },
  ];

  const STYLING_OPTIONS = [
    {
      value: "bold",
      label: <FontAwesomeIcon icon={faBold} />,
    },
    {
      value: "italic",
      label: <FontAwesomeIcon icon={faItalic} />,
    },
    {
      value: "underline",
      label: <FontAwesomeIcon icon={faUnderline} />,
    },
    {
      value: "strike",
      label: <FontAwesomeIcon icon={faStrikethrough} />,
    },
  ];

  if (
    configValues.axis == EXYAxisNames.X &&
    !shadow.isHorizontalChart &&
    (configValues.barAreaPositionToHighlight === Position.Bottom ||
      configValues.barAreaPositionToHighlight === Position.Top)
  ) {
    configValues.barAreaPositionToHighlight = Position.Left;
  }

  if (
    configValues.axis == EXYAxisNames.X &&
    shadow.isHorizontalChart &&
    (configValues.barAreaPositionToHighlight === Position.Left ||
      configValues.barAreaPositionToHighlight === Position.Right)
  ) {
    configValues.barAreaPositionToHighlight = Position.Bottom;
  }

  if (
    configValues.axis == EXYAxisNames.Y &&
    !shadow.isHorizontalChart &&
    (configValues.barAreaPositionToHighlight === Position.Left ||
      configValues.barAreaPositionToHighlight === Position.Right)
  ) {
    configValues.barAreaPositionToHighlight = Position.Bottom;
  }

  if (
    configValues.axis == EXYAxisNames.Y &&
    shadow.isHorizontalChart &&
    (configValues.barAreaPositionToHighlight === Position.Bottom ||
      configValues.barAreaPositionToHighlight === Position.Top)
  ) {
    configValues.barAreaPositionToHighlight = Position.Left;
  }

  const validateField = (fieldName) => {
    if (!Object.keys(errors).includes(fieldName)) return true;

    if (!configValues[fieldName]) {
      setErros((s) => ({
        ...s,
        [fieldName]: "This field can not be empty.",
      }));
      return false;
    } else {
      setErros((s) => ({
        ...s,
        [fieldName]: "",
      }));
    }
    return true;
  };

  const handleAdd = () => {
    if (configValues.type === "ranking" && !validateField("rank")) return;

    if (isAddNew) {
      onAdd(configValues);
      return;
    }
    onUpdate(index, configValues);
  };

  const handleDelete = () => {
    onDelete(index);
  };

  const handleChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: val,
    }));
  };

  const handleColor = ({ rgb }, n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: adjoinRGB(rgb),
    }));
  };

  const handleCheckbox = (n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: !d[n],
    }));
  };

  const handleAxisChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: val,
    }));
  };

  React.useEffect(() => {
    setConfigValues({ ...configValues, measureName: axisNameList[0].value });
  }, []);

  return (
    <>
      <div>
        <div className="mb-15">
          <p className="config-label">
            <span data-tip="Select the axis to apply reference line">Measure</span>
          </p>
          <SelectControl
            selectedValue={configValues.measureName}
            optionsList={axisNameList}
            onChange={(e) => {
              handleChange(e.axis, "axis");
              handleChange(e.value, "measureName");

              if (shadow.isHorizontalChart) {
                if (
                  e.axis === EXYAxisNames.Y &&
                  (configValues.rankOrder === Position.Top || configValues.rankOrder === Position.Bottom)
                ) {
                  handleChange("start", "rankOrder");
                } else if (
                  e.axis === EXYAxisNames.X &&
                  (configValues.rankOrder === Position.Start || configValues.rankOrder === Position.End)
                ) {
                  handleChange("start", "rankOrder");
                }
              } else {
                if (
                  e.axis === EXYAxisNames.X &&
                  (configValues.rankOrder === Position.Top || configValues.rankOrder === Position.Bottom)
                ) {
                  handleChange("start", "rankOrder");
                } else if (
                  e.axis === EXYAxisNames.Y &&
                  (configValues.rankOrder === Position.Start || configValues.rankOrder === Position.End)
                ) {
                  handleChange("top", "rankOrder");
                }
              }
            }}
          />
        </div>

        <div className="mb-15">
          <p className="config-label">
            <span data-tip="Select the reference line type">At</span>
          </p>
          <SelectControl
            selectedValue={configValues.type}
            optionsList={ReferenceLinesTypeList}
            onChange={(e) => handleChange(e.value, "type")}
          />
        </div>

        {configValues.type === "value" && configValues.axis === EXYAxisNames.X && (
          <div className="mb-15">
            <p className="config-label" data-tip="Add the data category value">
              Value
            </p>
            <input
              type="text"
              value={configValues.value}
              className="form-control"
              onChange={(e: any) => {
                handleChange(e.target.value, "value");
              }}
              placeholder="Add your text here..."
            />
          </div>
        )}

        {configValues.type === "value" && configValues.axis === EXYAxisNames.Y && (
          <>
            <div className="mb-15">
              <p className="config-label">
                <span data-tip="Select the distance type between each bar">Computation</span>
              </p>
              <SelectControl
                selectedValue={configValues.computation}
                optionsList={ComputationTypeList}
                onChange={(d) => handleChange(d.value, "computation")}
              />
            </div>

            {configValues.computation === EReferenceLineComputation.Fixed && (
              <div className="mb-15">
                <p className="config-label" data-tip="Add the data category value">
                  Value
                </p>
                <input
                  type="text"
                  value={configValues.value}
                  className="form-control"
                  onChange={(e: any) => {
                    handleChange(e.target.value, "value");
                  }}
                  placeholder="Add your text here..."
                />
              </div>
            )}
          </>
        )}

        {configValues.type === "ranking" && (
          <>
            <div className="mb-15">
              <p className="config-label">
                <span data-tip="Select the rank order list">Rank From</span>
              </p>
              <SelectControl
                selectedValue={configValues.rankOrder}
                optionsList={RankOrderList}
                onChange={(e) => handleChange(e.value, "rankOrder")}
              />
            </div>

            <div className="mb-15">
              <p className="config-label">
                <span data-tip="Set the rank value">Rank</span>
              </p>
              <NumberControl
                value={configValues.rank + ""}
                controlName={configValues.rank}
                stepValue={1}
                handleChange={(e: any) => {
                  handleChange(+e, "rank");
                }}
              />
            </div>
          </>
        )}

        <div className="mb-15">
          <p className="config-label" data-tip="Set the reference line label">
            Label
          </p>
          <input
            type="text"
            value={configValues.label}
            className="form-control"
            onChange={(e: any) => {
              handleChange(e.target.value, "label");
            }}
            placeholder="Add your text here..."
          />
        </div>

        <div className="config-color-label mb-15">
          <p className="config-label">
            <span data-tip="Choose label color">Label Color</span>
          </p>
          <ColorPicker color={splitRGB(configValues.labelColor)} handleChange={(c) => handleColor(c, "labelColor")} />
        </div>

        <div className="mb10">
          <p className="config-label" data-tip="Choose label font type">
            Label Font Type
          </p>
          <FontSelector
            value={configValues.labelFontFamily}
            handleChange={(d) => {
              handleChange(d.value, "labelFontFamily");
            }}
          />
        </div>

        <div>
          <div className="mb-15" data-tip="Checked to label auto font size">
            <label htmlFor="enable-popout-checkbox" className="checkbox-container">
              <input
                type="checkbox"
                id="enable-popout-checkbox"
                checked={configValues.autoFontSize}
                onChange={() => handleCheckbox("autoFontSize")}
              />
              Label Auto Font Size
              <span></span>
            </label>
          </div>
        </div>

        {!configValues.autoFontSize && (
          <div className="mb-15">
            <p className="config-label">
              <span data-tip="Set the label font size">Label Font Size</span>
            </p>
            <NumberControl
              value={configValues.labelFontSize + ""}
              controlName={configValues.labelFontSize}
              stepValue={1}
              handleChange={(e: any) => {
                handleChange(+e, "labelFontSize");
              }}
            />
          </div>
        )}

        <div className="mb-15">
          <p className="config-label">
            <span data-tip="Select the label position">Label Position</span>
          </p>
          <SelectControl
            selectedValue={configValues.labelPosition}
            optionsList={LabelPositionList}
            onChange={(e) => handleChange(e.value, "labelPosition")}
          />
        </div>

        <div className="mb-15 config-section">
          <p className="config-label" data-tip="Select the label alignment">
            Label Alignment
          </p>
          <Radio
            options={ALIGNMENT_OPTIONS}
            value={configValues.labelAlignment}
            onChange={(v: string) => handleChange(v, "labelAlignment")}
          />
        </div>

        <div className="mb-15">
          <p className="config-label" data-tip="Select the label styling">
            Label Styling
          </p>
          <Radio
            options={STYLING_OPTIONS}
            value={configValues.styling}
            onChange={(v: string) => handleChange(v, "styling")}
            multiple
          />
        </div>

        <div className="mb-15">
          <p className="config-label">
            <span data-tip="Select the line style option">Line Style</span>
          </p>
          <SelectControl
            selectedValue={configValues.lineStyle}
            optionsList={LineStyleList}
            onChange={(e) => handleChange(e.value, "lineStyle")}
          />
        </div>

        <div className="config-color-label mb-15">
          <p className="config-label">
            <span data-tip="Choose the line color">Line Color</span>
          </p>
          <ColorPicker color={splitRGB(configValues.lineColor)} handleChange={(c) => handleColor(c, "lineColor")} />
        </div>

        <div className="mb-15">
          <p className="config-label">
            <span data-tip="Set width of reference line">Line Width</span>
          </p>
          <NumberControl
            value={configValues.lineWidth + ""}
            controlName={configValues.lineWidth}
            stepValue={1}
            handleChange={(e: any) => {
              handleChange(+e, "lineWidth");
            }}
          />
        </div>
      </div>

      <React.Fragment>
        <div className="config-title" data-tip="Enable to highlight bar covered within reference lines">
          <p>Highlight Bar</p>
          <label className="switch">
            <input
              id="isHighlightBarArea"
              type="checkbox"
              checked={configValues["isHighlightBarArea"]}
              onChange={(e: any) => {
                handleCheckbox("isHighlightBarArea");
              }}
            />
            <span className="slider round"></span>
            {configValues["isHighlightBarArea"] ? (
              <span className="switch-text switch-text-on">On</span>
            ) : (
              <span className="switch-text switch-text-off">Off</span>
            )}
          </label>
        </div>

        {configValues["isHighlightBarArea"] && (
          <React.Fragment>
            <div className="mb-15">
              <p className="config-label">
                <span data-tip="Select bar area to highlight">Bar Area To Highlight</span>
              </p>
              <SelectControl
                selectedValue={configValues["barAreaPositionToHighlight"]}
                optionsList={BarAreaPositionToHighlightList}
                onChange={(e) => handleChange(e.value, "barAreaPositionToHighlight")}
              />
            </div>

            <div className="mb-15">
              <p className="config-label">
                <span data-tip="Select line position on bar">Line Position On Bar</span>
              </p>
              <SelectControl
                selectedValue={configValues["linePositionOnBar"]}
                optionsList={LinePositionOnBarList}
                onChange={(e) => handleChange(e.value, "linePositionOnBar")}
              />
            </div>

            <div className="config-color-label mb-15">
              <p className="config-label">
                <span data-tip="Choose shade color for highlighted area">Shade Color</span>
              </p>
              <ColorPicker
                color={splitRGB(configValues.shadeColor)}
                handleChange={(c) => handleColor(c, "shadeColor")}
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
                  ref={sliderRef}
                  onChange={(e: any) => {
                    handleChange(+e.target.value, "transparency");
                  }}
                />
                <span className="config-value">{configValues.transparency}%</span>
              </div>
            </div>
          </React.Fragment>
        )}
      </React.Fragment>

      <div className="config-btn-wrapper" style={{ paddingRight: 0 }}>
        {!isAddNew && (
          <button className="btn-cancel" onClick={handleDelete}>
            Delete
          </button>
        )}
        <button className="btn-apply" onClick={handleAdd}>
          Apply
        </button>
      </div>

      <div className="config-btn-group"></div>
    </>
  );
};

export default AddReferenceLines;
