import * as d3 from "d3";
import "./../style/tooltip.less";

export function addTooltip(selection, rootElement, getTooltipInfo, patternFlag = false) {
  if (!selection) {
    return;
  }
  let rootNode = rootElement;
  let internalSelection = d3.selectAll(selection.nodes());

  //
  d3.select(".tooltip-wrapper").remove();
  var tooltip = d3
    .select(rootElement)
    .append("div")
    .attr("class", "tooltip-wrapper")
    .style("transition", "display 1s")
    .style("visibility", "hidden");
  //

  // Mouse events
  internalSelection.on("mouseover", (event, data) => {
    tooltip.style("visibility", "visible");
    let tooltipInfo = getTooltipInfo(data);
    if (tooltipInfo == null) {
      return;
    }

    document.querySelector(".tooltip-wrapper").innerHTML = "";

    tooltipInfo.map((data) => {
      let tooltipRow = tooltip.append("div").attr("class", "tooltip-row");

      if (patternFlag && data.pattern && data.pattern != "") {
        let tooltipCircle = tooltipRow.append("div").attr("class", "tooltip-circle-pattern");
        tooltipCircle
          .append("svg")
          .attr("width", 14)
          .attr("height", 14)
          .append("circle")
          .attr("cx", 7)
          .attr("cy", 7)
          .attr("r", 7)
          .attr("fill", (d) => {
            return event.currentTarget.getAttribute("fill");
          });
      } else {
        tooltipRow
          .append("div")
          .attr("class", "tooltip-circle-color")
          .style("background", () => {
            return data.color;
          });
      }

      tooltipRow.append("div").attr("class", "tooltip-title-cell").text(data.displayName);

      tooltipRow.append("div").attr("class", "tooltip-value-cell").text(data.value);
    });

    tooltip.style("visibility", "visible");
  });
  internalSelection.on("mouseout", (event, data) => {
    tooltip.style("visibility", "hidden");
  });
  internalSelection.on("mousemove", (event, data) => {
    // Ignore mousemove while handling touch events
    if (!canDisplayTooltip(event)) {
      return;
    }
    let coordinates = getCoordinates(event, rootNode);
    let tooltipInfo = getTooltipInfo(data);
    if (tooltipInfo == null) {
      return;
    }

    tooltip
      .style("visibility", "visible")
      .style("left", `${coordinates[0]}px`)
      .style("top", coordinates[1] + "px");

    alignTooltip(event, rootNode, tooltip);
  });
}
function alignTooltip(event, rootElement, tooltipElement) {
  let tooltipBoundaries = tooltipElement.node().getBoundingClientRect();
  let rootElementBoundaries = rootElement.getBoundingClientRect();

  // Right side tooltip flip condition
  if (tooltipBoundaries.x + tooltipBoundaries.width > rootElementBoundaries.width) {
    tooltipElement
      .style("visibility", "visible")
      .style("left", "auto")
      .style("right", `${rootElementBoundaries.width - event.clientX}px`);
  }

  // Bottom side tooltip flip condition
  if (tooltipBoundaries.y + tooltipBoundaries.height > rootElementBoundaries.height) {
    tooltipElement
      .style("visibility", "visible")
      .style("top", "auto")
      .style("bottom", `${rootElementBoundaries.height - event.clientY}px`);
  }
}
function canDisplayTooltip(event) {
  let canDisplay = true;
  const mouseEvent = event;
  if (mouseEvent.buttons !== undefined) {
    // Check mouse buttons state
    let hasMouseButtonPressed = mouseEvent.buttons !== 0;
    canDisplay = !hasMouseButtonPressed;
  }
  return canDisplay;
}
function getCoordinates(event, rootNode) {
  let coordinates,
    e = event,
    s;
  while ((s = e.sourceEvent)) e = s;
  let rect = rootNode.getBoundingClientRect();
  coordinates = [e.clientX - rect.left - rootNode.clientLeft + 10, e.clientY - rect.top - rootNode.clientTop + 10];
  return coordinates;
}
