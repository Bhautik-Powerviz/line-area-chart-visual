import * as React from "react";
import * as ReactDOM from "react-dom";
import "./style/annotation.css";
import { IConfig, ShadowUpdateOptions } from "@truviz/shadow/dist/types/ShadowUpdateOptions";
import ReactQuill, { Quill } from "react-quill";
import BlotFormatter from "quill-blot-formatter";
import "react-quill/dist/quill.snow.css";
import { Shadow } from "@truviz/shadow/dist/Shadow";
import AnnotationToolbar, { modules, formats } from "./AnnotationToolbar";
import { adjoinRGB, splitRGB } from "./methods";
import { AnnotationData } from "./types/AnnotationType";
import AnnotationDropdownSelector from "./AnnotationDropdownSelector";
import AnnotationMarkerDropdownSelector from "./AnnotationMarkerDropdownSelector";

import ColorPicker from "@truviz/shadow/dist/Components/Editor/Components/ColorPicker";
import { eventEmitter, Events } from "@truviz/shadow/dist/Events";
import VisualAnnotations from "./VisualAnnotations";

let DirectionAttribute = Quill.import("attributors/attribute/direction");
Quill.register(DirectionAttribute, true);
let AlignClass = Quill.import("attributors/class/align");
Quill.register(AlignClass, true);
let BackgroundClass = Quill.import("attributors/class/background");
Quill.register(BackgroundClass, true);
let ColorClass = Quill.import("attributors/class/color");
Quill.register(ColorClass, true);
let DirectionClass = Quill.import("attributors/class/direction");
Quill.register(DirectionClass, true);
let FontClass = Quill.import("attributors/class/font");
Quill.register(FontClass, true);
let SizeClass = Quill.import("attributors/class/size");
Quill.register(SizeClass, true);
let AlignStyle = Quill.import("attributors/style/align");
Quill.register(AlignStyle, true);
let BackgroundStyle = Quill.import("attributors/style/background");
Quill.register(BackgroundStyle, true);
let ColorStyle = Quill.import("attributors/style/color");
Quill.register(ColorStyle, true);
let DirectionStyle = Quill.import("attributors/style/direction");
Quill.register(DirectionStyle, true);
let FontStyle = Quill.import("attributors/style/font");
Quill.register(FontStyle, true);

/* Data values span tag */

let Embed = Quill.import("blots/embed");
class SpanEmbed extends Embed {
  static create(value) {
    const node = super.create();
    node.innerText = value;
    return node;
  }
  static value(domNode) {
    return domNode.innerText;
  }
}

SpanEmbed.blotName = "span-embed";
SpanEmbed.tagName = "span";
SpanEmbed.className = "annotation-measure-datavalue";

Quill.register({
  "formats/span-embed": SpanEmbed,
});

/* Data values span tag */

window["Quill"] = Quill;

// Quill.register('modules/imageActions', ImageActions);
// Quill.register('modules/imageFormats', ImageFormats);

Quill.register("modules/blotFormatter", BlotFormatter);

// // // // // // // // // // // // // // // // // // // //
const Image = Quill.import("formats/image"); // Had to get the class this way, instead of ES6 imports, so that quill could register it without errors

const ATTRIBUTES = [
  "alt",
  "height",
  "width",
  "class",
  "style", // Had to add this line because the style was inlined
];

class CustomImage extends Image {
  static formats(domNode) {
    return ATTRIBUTES.reduce((formats, attribute) => {
      const copy = { ...formats };

      if (domNode.hasAttribute(attribute)) {
        copy[attribute] = domNode.getAttribute(attribute);
      }

      return copy;
    }, {});
  }

  format(name, value) {
    if (ATTRIBUTES.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}

Quill.register({
  // ... other formats
  "formats/image": CustomImage,
});

// // // // // // // // // // // // // // // // // // // //

let fontSizeStyle = Quill.import("attributors/style/size");
fontSizeStyle.whitelist = [
  "8px",
  "9px",
  "10px",
  "11px",
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "22px",
  "24px",
  "26px",
  "28px",
  "36px",
  "48px",
  "72px",
];
Quill.register(fontSizeStyle, true);

let boldFormat = Quill.import("formats/bold");
Quill.register(boldFormat, true);

let italicFormat = Quill.import("formats/italic");
Quill.register(italicFormat, true);

let underlineFormat = Quill.import("formats/underline");
Quill.register(underlineFormat, true);

const Font = Quill.import("formats/font");
Font.whitelist = [
  "arial",
  "arial black",
  "calibri",
  "cambria",
  "cambria math",
  "candara",
  "comic sans ms",
  "consolas",
  "constantia",
  "corbel",
  "courier new",
  "georgia",
  "lucida sans",
  "segoe ui",
  "segoe ui light",
  "tahoma",
  "times new roman",
  "trebuchet ms",
  "verdana",
];
Quill.register(Font, true);

function AnnotationWindow({
  vizOptions,
  config,
  shadow,
  coordinates,
  uniqueIndex,
  editMode,
  dataPoint,
  visualAnnotation,
}: {
  vizOptions: ShadowUpdateOptions;
  config: IConfig;
  shadow: Shadow;
  coordinates: { xPosition: number; yPosition: number };
  uniqueIndex: string;
  editMode: boolean;
  dataPoint: any;
  visualAnnotation: VisualAnnotations;
}) {
  let initialStates =
    vizOptions.formatTab["editor"]["annotations"] == "" ? [] : vizOptions.formatTab["editor"]["annotations"];
  let currentAnnotation: AnnotationData;
  try {
    initialStates = JSON.parse(initialStates);
  } catch (e) {
    initialStates = [];
  }

  if (initialStates.length > 0 && uniqueIndex !== null) {
    currentAnnotation = initialStates.find((e) => e.uniqueIndex == uniqueIndex);
  } else {
    currentAnnotation = {
      uniqueIndex: Math.random().toString(16).slice(2),
      connectorType: "STRAIGHT_LINE",
      connectorStyle: "solid",
      markerType: "arrow",
      badgeStyle: "default",
      badgeSize: 14,
      content: "",
      badgeColor: "rgb(74, 144, 226)",
      color: "rgb(74, 144, 226)",
      backgroundColor: "rgb(255, 255, 255)",
      coordinates: {
        xPosition: coordinates.xPosition,
        yPosition: coordinates.yPosition,
      },
      dataPoint: dataPoint,
    };
  }

  const [currentAnnotationValues, setCurrentAnnotationValues] = React.useState(currentAnnotation);

  const handleChange = (value, type) => {
    let changedAnnotationValue = { [type]: value };
    setCurrentAnnotationValues((d) => ({
      ...d,
      ...changedAnnotationValue,
    }));
  };

  const handleContentChange = (content) => {
    setCurrentAnnotationValues((d) => ({
      ...d,
      ...{ content: content },
    }));
  };

  const handleClose = () => {
    // setIsOpen(false);
    ReactDOM.unmountComponentAtNode(document.querySelector(".annotation-window"));
  };

  const applyHandler = () => {
    let changedAnnotationIndex = initialStates.findIndex((e) => e.uniqueIndex == currentAnnotationValues.uniqueIndex);
    visualAnnotation.lastModifiedAnnotationUniqueIndex = currentAnnotationValues.uniqueIndex;
    if (changedAnnotationIndex == -1) {
      // if the annotation does not exist, create new element in array
      initialStates.push(currentAnnotationValues);
    } else {
      // if the annotation already exists, update it using splice
      initialStates.splice(changedAnnotationIndex, 1, currentAnnotationValues);
    }
    shadow.persistProperties("editor", "annotations", initialStates);

    eventEmitter.dispatch(Events.ON_ANNOTATIONS_APPLY, { inactive: true });

    handleClose();
  };

  const annotationWindow = (
    <div className="color-popover">
      <div className="cover" onClick={handleClose} />
      <div className="annotation-window-wrapper">
        <div className="annotation-close-btn">
          <button onClick={handleClose}>X</button>
        </div>
        {/* Provide support for categorical below */}
        <AnnotationToolbar
          columns={
            (vizOptions.options.dataViews[0].categorical && vizOptions.options.dataViews[0].categorical.values) ||
            vizOptions.options.dataViews[0].matrix.valueSources
          }
          currentAnnotation={currentAnnotation}
          handleChange={handleChange}
        />
        <div className="quill-editor-wrapper">
          <ReactQuill
            theme="snow"
            modules={modules}
            formats={formats}
            value={currentAnnotationValues.content}
            onChange={handleContentChange}
            placeholder="Enter the text"
            style={{ minHeight: "140px" }}
          />
        </div>
        <div className="annotation-window-footer">
          <div className="annotation-footer-section-wrapper">
            <p className="annotation-footer-section-title">CONNECTOR</p>
            <div>
              <AnnotationDropdownSelector
                type="CONNECTOR_TYPE"
                value={currentAnnotationValues.connectorType}
                color={currentAnnotationValues.color}
                handleChange={(d) => {
                  handleChange(d.value, "connectorType");
                }}
                theme={vizOptions.formatTab["editor"]["theme"]}
              />
            </div>

            {currentAnnotationValues.connectorType !== "none" && (
              <>
                <div>
                  <AnnotationDropdownSelector
                    type="STROKE_TYPE"
                    value={currentAnnotationValues.connectorStyle}
                    color={currentAnnotationValues.color}
                    handleChange={(d) => {
                      handleChange(d.value, "connectorStyle");
                    }}
                    theme={vizOptions.formatTab["editor"]["theme"]}
                  />
                </div>

                <div>
                  <AnnotationMarkerDropdownSelector
                    value={currentAnnotationValues.markerType}
                    color={currentAnnotationValues.color}
                    handleChange={(d) => {
                      handleChange(d.value, "markerType");
                    }}
                    theme={vizOptions.formatTab["editor"]["theme"]}
                  />
                </div>
                <div>
                  <ColorPicker
                    color={splitRGB(currentAnnotationValues.color)}
                    handleChange={({ rgb }) => handleChange(adjoinRGB(rgb), "color")}
                  />
                </div>
              </>
            )}
          </div>

          <div className="annotation-footer-section-wrapper">
            <p className="annotation-footer-section-title">BADGE</p>
            <div className="badge-selector">
              <div className="marker-option">
                <div
                  className={`marker-option-wrapper marker-info-option-wrapper ${
                    currentAnnotationValues.badgeStyle == "default" ? "annotation-style-selected" : ""
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="25"
                    viewBox="0 0 30 30"
                    onClick={() => handleChange("default", "badgeStyle")}
                    className="default-badge-selector"
                  >
                    <circle cx="16.5" cy="14.5" r="8" fill={currentAnnotationValues.badgeColor}></circle>
                    <path
                      fill="none"
                      stroke={currentAnnotationValues.badgeColor}
                      stroke-width="3"
                      d="m 5 17 a 12 12 0 1 1 6 8 l -9 0 l 3 -8"
                    ></path>
                    <text
                      x="55%"
                      y="50%"
                      text-anchor="middle"
                      dy=".3em"
                      font-size="11px"
                      stroke="#FFF"
                      font-family="ui-monospace"
                    >
                      i
                    </text>
                    <title>Info Badge</title>
                  </svg>
                </div>

                <div
                  className={`marker-option-wrapper marker-numeric-option-wrapper ${
                    currentAnnotationValues.badgeStyle == "numeric" ? "annotation-style-selected" : ""
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="25"
                    viewBox="0 0 30 30"
                    onClick={() => handleChange("numeric", "badgeStyle")}
                    className="numeric-badge-selector"
                  >
                    <circle cx="16.5" cy="14.5" r="8" fill={currentAnnotationValues.badgeColor}></circle>
                    <path
                      fill="none"
                      stroke={currentAnnotationValues.badgeColor}
                      stroke-width="3"
                      d="m 5 17 a 12 12 0 1 1 6 8 l -9 0 l 3 -8"
                    ></path>
                    <text
                      x="55%"
                      y="50%"
                      text-anchor="middle"
                      dy=".3em"
                      font-size="11px"
                      stroke="#FFF"
                      font-family="ui-monospace"
                    >
                      1
                    </text>
                    <title>Counter Badge</title>
                  </svg>
                </div>
                <div className="badgesize-input">
                  <input
                    type="number"
                    value={currentAnnotationValues.badgeSize}
                    onChange={(e) => handleChange(e.target.value, "badgeSize")}
                    max="50"
                  />
                  <span>pt</span>
                </div>
                <div style={{ marginLeft: "5px" }}>
                  <ColorPicker
                    color={splitRGB(currentAnnotationValues.badgeColor)}
                    handleChange={({ rgb }) => handleChange(adjoinRGB(rgb), "badgeColor")}
                  />
                </div>
              </div>
            </div>
          </div>
          <button className="annotation-save-btn" onClick={applyHandler}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
  return annotationWindow;
}

export default AnnotationWindow;
