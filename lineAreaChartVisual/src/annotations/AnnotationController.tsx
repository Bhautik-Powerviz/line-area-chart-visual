import * as React from "react";
import "./style/annotation.css";
import { IConfig, ShadowUpdateOptions } from "@truviz/shadow/dist/types/ShadowUpdateOptions";
import { Shadow } from "@truviz/shadow/dist/Shadow";
import { eventEmitter, Events } from "@truviz/shadow/dist/Events";
import VisualAnnotations from "./VisualAnnotations";

function AnnotationController({
  vizOptions,
  config,
  shadow,
  visualAnnotation,
}: {
  vizOptions: ShadowUpdateOptions;
  config: IConfig;
  shadow: Shadow;
  visualAnnotation: VisualAnnotations;
}) {
  const [isDropdownActive, setDropdownActive] = React.useState(false);
  const [isScreenActivated, setScreenActivated] = React.useState(false);
  const [isHideActive, setIsHideActive] = React.useState(false);

  const handleDropdown = () => {
    setDropdownActive((val) => !val);
  };

  eventEmitter.subscribe(Events.ON_ANNOTATIONS_APPLY, (data) => {
    console.log("event triggerd");
    visualAnnotation.isAnnotationScreenActivated = false;
    setScreenActivated(false);
  });

  const activateAnnotationScreen = () => {
    setScreenActivated((val) => !val);
    setIsHideActive(false);
    setDropdownActive(false);
    visualAnnotation.isAnnotationScreenActivated = !visualAnnotation.isAnnotationScreenActivated;
  };

  const handleHide = () => {
    setDropdownActive(false);
    setScreenActivated(false);
    setIsHideActive((val) => !val);
  };

  React.useEffect(() => {
    if (isHideActive) {
      visualAnnotation.hideAnnotations();
    } else {
      visualAnnotation.showAnnotations();
    }
  }, [isHideActive]);

  React.useEffect(() => {
    if (isScreenActivated) {
      shadow.target.querySelector(".visual-container").classList.add("annotation-cursor");
      shadow.target.querySelector(".visual-container").classList.remove("initial-cursor");
    } else {
      shadow.target.querySelector(".visual-container").classList.add("initial-cursor");
      shadow.target.querySelector(".visual-container").classList.remove("annotation-cursor");
    }
  }, [isScreenActivated]);

  return (
    <>
      <div
        className="icon-wrapper clickable"
        onClick={handleDropdown}
        style={{
          backgroundColor: isScreenActivated ? "#edd100" : "transparent",
        }}
      >
        <div className="annotation-icon" title="Annotations"></div>
      </div>
      {isDropdownActive && (
        <div className="annotation-dropdown">
          <div
            className={`annotation-dropdown-item ${isScreenActivated ? "annotation-dropdown-item-active" : ""}`}
            onClick={activateAnnotationScreen}
          >
            Create
          </div>
          <div
            className={`annotation-dropdown-item ${isHideActive ? "annotation-dropdown-item-active" : ""}`}
            onClick={handleHide}
          >
            Hide
          </div>
        </div>
      )}
    </>
  );
}

export default AnnotationController;
