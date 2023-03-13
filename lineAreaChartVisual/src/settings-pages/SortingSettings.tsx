import * as React from "react";
import { SORTING_SETTINGS } from "../constants";
import { ESmallMultiplesAxisType, ESortBy, ESortFor, ESortingSettings, ESortOrder } from "../enum";
import SelectControl from "@truviz/shadow/dist/Components/Editor/Components/SelectControl";
import { ILabelValuePair, ISmallMultiplesSettings, ISortingSettings } from "../visual-settings.model";
import OptionsTooltip from "./OptionsTooltip";

const SortingSettings = (props) => {
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
      ...SORTING_SETTINGS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...SORTING_SETTINGS };
  }

  const smallMultiplesSettings: ISmallMultiplesSettings = shadow.smallMultiplesSettings;

  const applyChanges = () => {
    shadow.persistProperties(sectionName, propertyName, configValues);
    closeCurrentSettingHandler();
  };

  const [configValues, setConfigValues] = React.useState<ISortingSettings>({
    ...initialStates,
  });

  const handleChange = (val, category, n) => {
    setConfigValues((d) => ({
      ...d,
      [category]: { ...d[category], [n]: val },
    }));
  };

  React.useEffect(() => {
    if (!configValues.axis.sortBy || !axisSortByList.some((d) => d.value === configValues.axis.sortBy)) {
      setConfigValues((d) => ({
        ...d,
        [ESortingSettings.Axis]: {
          ...d[ESortingSettings.Axis],
          [ESortingSettings.SortBy]: axisSortByList[1].value,
          [ESortingSettings.IsMeasure]: true,
        },
      }));
    }

    if (shadow.isSmallMultiplesEnabled && shadow.isHasSmallMultiplesData) {
      if (
        !configValues.smallMultiples.sortBy ||
        !smallMultiplesSortByList.some((d) => d.value === configValues.smallMultiples.sortBy)
      ) {
        setConfigValues((d) => ({
          ...d,
          [ESortingSettings.SmallMultiples]: {
            ...d[ESortingSettings.SmallMultiples],
            [ESortingSettings.SortBy]: smallMultiplesSortByList[1].value,
            [ESortingSettings.IsMeasure]: true,
          },
        }));
      }

      if (smallMultiplesSettings.xAxisType === ESmallMultiplesAxisType.Uniform) {
        setConfigValues((d) => ({
          ...d,
          [ESortingSettings.Axis]: {
            ...d[ESortingSettings.Axis],
            [ESortingSettings.SortBy]: axisSortByList[0].value,
            [ESortingSettings.IsMeasure]: false,
          },
        }));
      }
    }
  }, []);

  const SortOrderList: ILabelValuePair[] = [
    {
      label: "Ascending",
      value: ESortOrder.Ascending,
    },
    {
      label: "Descending",
      value: ESortOrder.Descending,
    },
  ];

  const axisSortByList: { label: string; value: string; isMeasure: boolean; isMultiMeasure: boolean }[] = [
    {
      label: shadow.categoryDisplayName,
      value: shadow.categoryDisplayName,
      isMeasure: false,
      isMultiMeasure: false,
    },
  ];

  if (shadow.categoricalMeasureDisplayName?.length) {
    shadow.categoricalMeasureDisplayName.forEach((name: string) => {
      axisSortByList.push({
        label: name,
        value: name,
        isMeasure: true,
        isMultiMeasure: false,
      });
    });

    if (shadow.categoricalMeasureDisplayName.length > 1) {
      axisSortByList.push({
        label: `Total Value (${shadow.categoricalMeasureDisplayName.join(" + ")})`,
        value: ESortBy.TotalValue,
        isMeasure: false,
        isMultiMeasure: true,
      });
    }
  }

  const legendSortByList: { label: string; value: string; isMeasure: boolean }[] = [
    {
      label: "Name",
      value: ESortBy.Name,
      isMeasure: true,
    },
  ];

  const smallMultiplesSortByList: { label: string; value: string; isMeasure: boolean }[] = [
    {
      label: shadow.smallMultiplesCategoricalDataSourceName,
      value: shadow.smallMultiplesCategoricalDataSourceName,
      isMeasure: false,
    },
  ];

  if (shadow.categoricalMeasureDisplayName?.length) {
    shadow.categoricalMeasureDisplayName.forEach((name: string) => {
      smallMultiplesSortByList.push({
        label: name,
        value: name,
        isMeasure: true,
      });
    });
  }

  const handleCheckbox = (n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: !d[n],
    }));
  };

  return (
    <>
      <OptionsTooltip />
      <div className="config-container">
        <div className="config-options-wrapper">
          <div className="config-title" data-tip="Enable to show bars by category data ranking">
            <p>Enable Custom Sorting</p>
            <label className="switch">
              <input
                type="checkbox"
                onChange={(e: any) => handleCheckbox(ESortingSettings.IsCustomSortEnabled)}
                checked={configValues.isCustomSortEnabled}
              />
              <span className="slider round"></span>
              {configValues.isCustomSortEnabled ? (
                <span className="switch-text switch-text-on">On</span>
              ) : (
                <span className="switch-text switch-text-off">Off</span>
              )}
            </label>
          </div>

          <div>
            <p className="config-label mb-15">Axis</p>
            <div className="mb-15">
              <p className="config-label">
                <span data-tip="Select the data for sorting">Sort By</span>
              </p>
              <SelectControl
                selectedValue={configValues[ESortingSettings.Axis][ESortingSettings.SortBy]}
                optionsList={axisSortByList}
                onChange={(e) => {
                  handleChange(e.value, ESortingSettings.Axis, ESortingSettings.SortBy);
                  handleChange(e.isMeasure, ESortingSettings.Axis, ESortingSettings.IsMeasure);
                  handleChange(e.isMultiMeasure, ESortingSettings.Axis, ESortingSettings.IsMultiMeasure);
                }}
              />
            </div>

            <div className="mb-15">
              <p className="config-label">
                <span data-tip="Select the sorting order">Sort Order</span>
              </p>
              <SelectControl
                selectedValue={configValues[ESortingSettings.Axis][ESortingSettings.SortOrder]}
                optionsList={SortOrderList}
                onChange={(e) => handleChange(e.value, ESortingSettings.Axis, ESortingSettings.SortOrder)}
              />
            </div>
          </div>

          {!shadow.isNormalBarChart && (
            <div className="">
              <p className="config-label mb-15">Legend</p>
              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Select the data for sorting">Sort By</span>
                </p>
                <SelectControl
                  selectedValue={configValues[ESortingSettings.Legend][ESortingSettings.SortBy]}
                  optionsList={legendSortByList}
                  onChange={(e) => handleChange(e.value, ESortingSettings.Legend, ESortingSettings.SortBy)}
                />
              </div>

              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Select the sorting order">Sort Order</span>
                </p>
                <SelectControl
                  selectedValue={configValues[ESortingSettings.Legend][ESortingSettings.SortOrder]}
                  optionsList={SortOrderList}
                  onChange={(e) => handleChange(e.value, ESortingSettings.Legend, ESortingSettings.SortOrder)}
                />
              </div>
            </div>
          )}

          {shadow.isSmallMultiplesEnabled && shadow.isHasSmallMultiplesData && (
            <div className="">
              <p className="config-label mb-15">Small Multiples</p>
              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Select the data for sorting">Sort By</span>
                </p>
                <SelectControl
                  selectedValue={configValues[ESortingSettings.SmallMultiples][ESortingSettings.SortBy]}
                  optionsList={smallMultiplesSortByList}
                  onChange={(e) => {
                    handleChange(e.value, ESortingSettings.SmallMultiples, ESortingSettings.SortBy);
                    handleChange(e.isMeasure, ESortingSettings.SmallMultiples, ESortingSettings.IsMeasure);
                  }}
                />
              </div>

              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Select the sorting order">Sort Order</span>
                </p>
                <SelectControl
                  selectedValue={configValues[ESortingSettings.SmallMultiples][ESortingSettings.SortOrder]}
                  optionsList={SortOrderList}
                  onChange={(e) => handleChange(e.value, ESortingSettings.SmallMultiples, ESortingSettings.SortOrder)}
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

export default SortingSettings;
