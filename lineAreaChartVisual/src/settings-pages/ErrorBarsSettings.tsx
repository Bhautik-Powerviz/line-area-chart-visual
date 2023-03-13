import * as React from "react";
import { ERROR_BARS_SETTINGS } from "../constants";
import {
  EErrorBarsMarkerShape,
  EErrorBarsSettings,
  EErrorBarsTooltipLabelFormat,
  ERelationshipToMeasure,
} from "../enum";
import { adjoinRGB, splitRGB } from "../methods";
import { faCircle, faSquare, faMinus, faPlus, faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IErrorBarsSettings, ILabelValuePair } from "../visual-settings.model";
import OptionsTooltip from "./OptionsTooltip";
import SelectControl from "@truviz/shadow/dist/Components/Editor/Components/SelectControl";
import NumberControl from "@truviz/shadow/dist/Components/Editor/Components/NumberControl";
import ColorPicker from "@truviz/shadow/dist/Components/Editor/Components/ColorPicker";
import Select from "react-select";

const ErrorBarsSettings = (props) => {
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
      ...ERROR_BARS_SETTINGS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...ERROR_BARS_SETTINGS };
  }

  const applyChanges = () => {
    shadow.persistProperties(sectionName, propertyName, configValues);
    closeCurrentSettingHandler();
  };

  const [configValues, setConfigValues] = React.useState<IErrorBarsSettings>({
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

  const handleMarkerChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [EErrorBarsSettings.Markers]: { ...d[EErrorBarsSettings.Markers], [n]: val },
    }));
  };

  const handleMarkerCheckbox = (n) => {
    setConfigValues((d) => ({
      ...d,
      [EErrorBarsSettings.Markers]: { ...d[EErrorBarsSettings.Markers], [n]: !d[EErrorBarsSettings.Markers][n] },
    }));
  };

  const handleMarkerColor = ({ rgb }, n) => {
    setConfigValues((d) => ({
      ...d,
      [EErrorBarsSettings.Markers]: { ...d[EErrorBarsSettings.Markers], [n]: adjoinRGB(rgb) },
    }));
  };

  const handleColor = ({ rgb }, n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: adjoinRGB(rgb),
    }));
  };

  const markerIconsList: { label: any; value: string }[] = [
    {
      label: <FontAwesomeIcon icon={faCircle} />,
      value: EErrorBarsMarkerShape.Circle,
    },
    {
      label: <FontAwesomeIcon icon={faSquare} />,
      value: EErrorBarsMarkerShape.Square,
    },
    {
      label: <FontAwesomeIcon icon={faClose} />,
      value: EErrorBarsMarkerShape.Close,
    },
    {
      label: <FontAwesomeIcon icon={faMinus} />,
      value: EErrorBarsMarkerShape.Minus,
    },
    {
      label: <FontAwesomeIcon icon={faPlus} />,
      value: EErrorBarsMarkerShape.Plus,
    },
  ];

  const RelationshipToMeasureList: ILabelValuePair[] = [
    {
      label: "Absolute",
      value: ERelationshipToMeasure.Absolute,
    },
    {
      label: "Relative",
      value: ERelationshipToMeasure.Relative,
    },
  ];

  const ErrorBarsTooltipLabelFormatList: ILabelValuePair[] = [
    {
      label: "Absolute",
      value: EErrorBarsTooltipLabelFormat.Absolute,
    },
    {
      label: "Relative Numeric",
      value: EErrorBarsTooltipLabelFormat.RelativeNumeric,
    },
    {
      label: "Relative Percentage",
      value: EErrorBarsTooltipLabelFormat.RelativePercentage,
    },
  ];

  const selectedMarker = markerIconsList.find((marker) => marker.value === configValues.markers.shape);

  return (
    <>
      <OptionsTooltip />
      <div className="config-container">
        <div className="config-options-wrapper">
          <div className="config-title" data-tip="Enable to show error bars">
            <p>Show Error Bars</p>
            <label className="switch">
              <input
                type="checkbox"
                onChange={(e: any) => handleCheckbox(EErrorBarsSettings.IsEnabled)}
                checked={configValues[EErrorBarsSettings.IsEnabled]}
              />
              <span className="slider round"></span>
              {configValues[EErrorBarsSettings.IsEnabled] ? (
                <span className="switch-text switch-text-on">On</span>
              ) : (
                <span className="switch-text switch-text-off">Off</span>
              )}
            </label>
          </div>

          <div className="mb-15">
            <p className="config-label">
              <span data-tip="Errors bounds data relationship to measure">Relationship To Measure</span>
            </p>
            <SelectControl
              selectedValue={configValues[EErrorBarsSettings.RelationshipToMeasure]}
              optionsList={RelationshipToMeasureList}
              onChange={(e) => handleChange(e.value, EErrorBarsSettings.RelationshipToMeasure)}
            />
          </div>

          <div className="config-color-label">
            <p className="config-label">
              <span data-tip="Error bounds line color">Line Color</span>
            </p>
            <ColorPicker
              color={splitRGB(configValues[EErrorBarsSettings.LineColor])}
              handleChange={(c) => handleColor(c, EErrorBarsSettings.LineColor)}
            />
          </div>

          <div className="mb-15">
            <p className="config-label">
              <span data-tip="Set width of the error bounds line">Line Width</span>
            </p>
            <NumberControl
              value={configValues[EErrorBarsSettings.LineWidth] + ""}
              controlName={EErrorBarsSettings.LineWidth}
              stepValue={1}
              handleChange={(e: any) => {
                handleChange(+e, EErrorBarsSettings.LineWidth);
              }}
            />
          </div>

          <div className="config-title" data-tip="Show area followed by the error bounds">
            <p>Show Error Bounds Area</p>
            <label className="switch">
              <input
                type="checkbox"
                onChange={(e: any) => handleCheckbox(EErrorBarsSettings.IsShowErrorArea)}
                checked={configValues[EErrorBarsSettings.IsShowErrorArea]}
              />
              <span className="slider round"></span>
              {configValues[EErrorBarsSettings.IsShowErrorArea] ? (
                <span className="switch-text switch-text-on">On</span>
              ) : (
                <span className="switch-text switch-text-off">Off</span>
              )}
            </label>
          </div>

          {configValues[EErrorBarsSettings.IsShowErrorArea] && (
            <>
              <div className="config-color-label">
                <p className="config-label">
                  <span data-tip="Error bounds area color">Area Color</span>
                </p>
                <ColorPicker
                  color={splitRGB(configValues[EErrorBarsSettings.AreaColor])}
                  handleChange={(c) => handleColor(c, EErrorBarsSettings.AreaColor)}
                />
              </div>

              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Error bounds area transparency">Transparency</span>
                </p>
                <div className="range-slider-input mb-15">
                  <input
                    id="barLeftPadding"
                    min="0"
                    max="100"
                    type="range"
                    value={configValues[EErrorBarsSettings.AreaTransparency]}
                    onChange={(e: any) => {
                      handleChange(+e.target.value, EErrorBarsSettings.AreaTransparency);
                    }}
                  />
                  <span className="config-value">{configValues[EErrorBarsSettings.AreaTransparency]}%</span>
                </div>
              </div>
            </>
          )}

          <div className="config-title" data-tip="Show dash line at error bounds point">
            <p>Show Dash Line</p>
            <label className="switch">
              <input
                type="checkbox"
                onChange={(e: any) => handleCheckbox(EErrorBarsSettings.IsShowDashLine)}
                checked={configValues[EErrorBarsSettings.IsShowDashLine]}
              />
              <span className="slider round"></span>
              {configValues[EErrorBarsSettings.IsShowDashLine] ? (
                <span className="switch-text switch-text-on">On</span>
              ) : (
                <span className="switch-text switch-text-off">Off</span>
              )}
            </label>
          </div>

          <div className="config-title" data-tip="Show error bounds data on tooltip">
            <p>Show Tooltip</p>
            <label className="switch">
              <input
                type="checkbox"
                onChange={(e: any) => handleCheckbox(EErrorBarsSettings.IsShowTooltip)}
                checked={configValues[EErrorBarsSettings.IsShowTooltip]}
              />
              <span className="slider round"></span>
              {configValues[EErrorBarsSettings.IsShowTooltip] ? (
                <span className="switch-text switch-text-on">On</span>
              ) : (
                <span className="switch-text switch-text-off">Off</span>
              )}
            </label>
          </div>

          {configValues[EErrorBarsSettings.IsShowTooltip] && (
            <div>
              <p className="config-label">
                <span data-tip="Error bounds data tooltip label format">Tooltip Label Format</span>
              </p>
              <SelectControl
                selectedValue={configValues[EErrorBarsSettings.TooltipLabelFormat]}
                optionsList={ErrorBarsTooltipLabelFormatList}
                onChange={(d) => handleChange(d.value, EErrorBarsSettings.TooltipLabelFormat)}
              />
            </div>
          )}

          <div className="config-title" data-tip="Show markers at error bounds point">
            <p>Show Markers</p>
            <label className="switch">
              <input
                type="checkbox"
                onChange={(e: any) => handleCheckbox(EErrorBarsSettings.IsShowMarkers)}
                checked={configValues[EErrorBarsSettings.IsShowMarkers]}
              />
              <span className="slider round"></span>
              {configValues[EErrorBarsSettings.IsShowMarkers] ? (
                <span className="switch-text switch-text-on">On</span>
              ) : (
                <span className="switch-text switch-text-off">Off</span>
              )}
            </label>
          </div>

          {configValues[EErrorBarsSettings.IsShowMarkers] && (
            <>
              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Select the marker shape">Marker Shape</span>
                </p>
                <div className="config-option">
                  <Select
                    value={selectedMarker}
                    options={markerIconsList}
                    onChange={(val) => {
                      handleMarkerChange(val.value, EErrorBarsSettings.MarkerShape);
                    }}
                    formatOptionLabel={(data) => {
                      return data.label;
                    }}
                  />
                </div>
              </div>

              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Set the marker size">Marker Size</span>
                </p>
                <NumberControl
                  value={configValues[EErrorBarsSettings.Markers][EErrorBarsSettings.MarkerSize + ""]}
                  controlName={EErrorBarsSettings.MarkerSize}
                  stepValue={1}
                  handleChange={(e: any) => handleMarkerChange(+e, EErrorBarsSettings.MarkerSize)}
                />
              </div>

              <div className="config-color-label">
                <p className="config-label">
                  <span data-tip="Set the marker color">Marker Color</span>
                </p>
                <ColorPicker
                  color={splitRGB(configValues[EErrorBarsSettings.Markers][EErrorBarsSettings.MarkerColor])}
                  handleChange={(c) => handleMarkerColor(c, EErrorBarsSettings.MarkerColor)}
                />
              </div>

              <div className="mb-15">
                <p className="config-label">
                  <span data-tip="Set the marker transparency">Marker Transparency</span>
                </p>
                <div className="range-slider-input mb-15">
                  <input
                    id="barLeftPadding"
                    min="0"
                    max="100"
                    type="range"
                    value={configValues[EErrorBarsSettings.Markers][EErrorBarsSettings.MarkerTransparency]}
                    onChange={(e: any) => {
                      handleMarkerChange(+e.target.value, EErrorBarsSettings.MarkerTransparency);
                    }}
                  />
                  <span className="config-value">
                    {configValues[EErrorBarsSettings.Markers][EErrorBarsSettings.MarkerTransparency]}%
                  </span>
                </div>
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
  );
};

export default ErrorBarsSettings;
