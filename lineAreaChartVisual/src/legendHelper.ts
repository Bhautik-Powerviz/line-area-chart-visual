import * as d3 from "d3";
import { generatePattern } from "./methods";
import { textMeasurementService } from "powerbi-visuals-utils-formattingutils";

// export interface LegendDataPoint {
//   label: string;
//   color: string;
//   pattern: string;
// }
let legendWrapper, legend, iconsBar, leftArrow, rightArrow, topArrow, bottomArrow, legendWrapperXOffset;

export const initializeLegends = (parentElement, legendFormattingOptions) => {
  iconsBar = leftArrow = rightArrow = topArrow = bottomArrow = legendWrapperXOffset = null;
  legendWrapper = d3.select("div.legend-wrapper");

  if (!legendWrapper.empty()) {
    legendWrapper.remove();
  }

  legendWrapper = d3
    .select(parentElement)
    .append("div")
    .attr("class", "legend-wrapper")
    .style("display", "flex")
    // .style("position", "absolute")
    // .style("top", "0")
    .style("flex-direction", () => {
      if (
        legendFormattingOptions.legendPosition === "LeftTop" ||
        legendFormattingOptions.legendPosition === "LeftCenter" ||
        legendFormattingOptions.legendPosition === "LeftBottom" ||
        legendFormattingOptions.legendPosition === "RightTop" ||
        legendFormattingOptions.legendPosition === "RightCenter" ||
        legendFormattingOptions.legendPosition === "RightBottom"
      ) {
        return "row";
      } else {
        return "column";
      }
    })
    .style("overflow", "scroll");

  legend = legendWrapper
    .append("svg")
    .attr("class", "legend")
    .style("z-index", 1)
    .attr("height", "26px")
    .style("max-width", () => {
      if (
        legendFormattingOptions.legendPosition === "LeftTop" ||
        legendFormattingOptions.legendPosition === "LeftCenter" ||
        legendFormattingOptions.legendPosition === "LeftBottom" ||
        legendFormattingOptions.legendPosition === "RightTop" ||
        legendFormattingOptions.legendPosition === "RightCenter" ||
        legendFormattingOptions.legendPosition === "RightBottom"
      ) {
        return "30vw";
      }
    });
  // .style("position", "absolute")
  // .style("top", "0");
  // .style("display", "none");
};

export const renderLegends = (
  mainContainer: HTMLElement,
  legendTitle: string,
  legendsData, //: LegendDataPoint[],
  legendFormattingOptions,
  isPatternEnabled,
  isEditorOpened
) => {
  initializeLegends(mainContainer, legendFormattingOptions);

  let circleRadius = 5;
  circleRadius = Math.max(circleRadius, legendFormattingOptions.fontSize / 4);
  legend.selectAll("*").remove();

  let labelOffsetX = 0,
    labelOffsetY = 0;
  let legendTitleElement;
  if (legendFormattingOptions.showTitle) {
    legendTitle = !legendFormattingOptions.showTitle
      ? legendTitle
      : legendFormattingOptions.legendTitle !== ""
        ? legendFormattingOptions.legendTitle
        : legendTitle;
    legendTitleElement = legend
      .append("g")
      .attr("class", "legendTitle")
      .attr("transform", (d, i) => `translate(0, 0)`)
      .append("text")
      .text(() => {
        if (
          legendFormattingOptions.legendPosition === "TopLeft" ||
          legendFormattingOptions.legendPosition === "TopCenter" ||
          legendFormattingOptions.legendPosition === "TopRight" ||
          legendFormattingOptions.legendPosition === "BottomLeft" ||
          legendFormattingOptions.legendPosition === "BottomCenter" ||
          legendFormattingOptions.legendPosition === "BottomRight"
        ) {
          return legendTitle.length > 15 ? legendTitle.slice(0, 15).concat("...") : legendTitle;
        } else {
          return legendTitle;
        }
      })
      .attr("x", 0)
      .attr("y", circleRadius + circleRadius * 0.2)
      .attr(
        "dy",
        legendFormattingOptions.legendPosition === "LeftTop" ||
          legendFormattingOptions.legendPosition === "LeftCenter" ||
          legendFormattingOptions.legendPosition === "LeftBottom" ||
          legendFormattingOptions.legendPosition === "RightTop" ||
          legendFormattingOptions.legendPosition === "RightCenter" ||
          legendFormattingOptions.legendPosition === "RightBottom"
          ? "0.5em"
          : "0.35em"
      )
      .attr("title", legendTitle)
      .style("font-size", `${legendFormattingOptions.fontSize}pt`)
      .style("font-family", legendFormattingOptions.fontFamily)
      .call((textNodes) => {
        if (
          legendFormattingOptions.legendPosition === "LeftTop" ||
          legendFormattingOptions.legendPosition === "LeftCenter" ||
          legendFormattingOptions.legendPosition === "LeftBottom" ||
          legendFormattingOptions.legendPosition === "RightTop" ||
          legendFormattingOptions.legendPosition === "RightCenter" ||
          legendFormattingOptions.legendPosition === "RightBottom"
        ) {
          addEllipsisToLegends(textNodes, legendFormattingOptions, circleRadius, true);
        }
      });

    labelOffsetX = legendTitleElement.node().getBBox().width + 5;
    labelOffsetY = legendTitleElement.node().getBBox().height + 5;
  }

  let legendItemsGroup = legend
    .append("g")
    .attr("class", "legend-group")
    .attr("clip-path", "url(#scrollbox-clip-path)");
  // .attr("");

  let legendItems = legendItemsGroup
    .selectAll(".legendItem")
    .data(legendsData)
    .enter()
    .append("g")
    .attr("class", "legendItem")
    .attr("transform", (d, i) => getTranslateValues(i, legendFormattingOptions));

  legendItems
    .append("circle")
    .attr("cx", (d) => {
      return circleRadius;
    })
    .attr("cy", (d, i) => {
      return circleRadius;
    })
    .attr("r", (d) => circleRadius)
    .attr("fill", (d) => {
      if (isPatternEnabled && d.data.pattern && d.data.pattern.patternIdentifier && d.data.pattern.patternIdentifier !== "NONE" && d.data.pattern.patternIdentifier !== "") {
        return `url('#${generatePattern(legend, d.data.pattern, d.data.color, true)}')`;
      }
      return d.data.color;
    });

  legendItems
    .append("text")
    .attr("x", (d) => {
      return circleRadius * 2 + 2;
    })
    .attr("y", (d, i) => {
      return circleRadius;
    })
    .attr("fill", legendFormattingOptions.legendColor)
    .attr("dy", "0.35em")
    .text((d) => d.data.name)
    .attr("title", (d) => d.data.name)
    .style("font-size", `${legendFormattingOptions.fontSize}pt`)
    .style("font-family", legendFormattingOptions.fontFamily)
    .call((textNodes) => {
      if (
        legendFormattingOptions.legendPosition === "LeftTop" ||
        legendFormattingOptions.legendPosition === "LeftCenter" ||
        legendFormattingOptions.legendPosition === "LeftBottom" ||
        legendFormattingOptions.legendPosition === "RightTop" ||
        legendFormattingOptions.legendPosition === "RightCenter" ||
        legendFormattingOptions.legendPosition === "RightBottom"
      ) {
        addEllipsisToLegends(textNodes, legendFormattingOptions, circleRadius);
      }
    });

  let previousNodeWidth = 0,
    previousNodeHeight = 0,
    horizontalLegendsHeight,
    verticalLegendElementWidth = 0;
  legendItems.each((d, i, nodes) => {
    if (
      legendFormattingOptions.legendPosition === "TopLeft" ||
      legendFormattingOptions.legendPosition === "TopCenter" ||
      legendFormattingOptions.legendPosition === "TopRight" ||
      legendFormattingOptions.legendPosition === "BottomLeft" ||
      legendFormattingOptions.legendPosition === "BottomCenter" ||
      legendFormattingOptions.legendPosition === "BottomRight"
    ) {
      if (i == 0) {
        horizontalLegendsHeight = nodes[i].getBBox().height;
        horizontalLegendsHeight += horizontalLegendsHeight * 0.1;
      }
      d3.select(nodes[i]).attr(
        "transform",
        `translate(${previousNodeWidth + labelOffsetX}, ${horizontalLegendsHeight / 4})`
      );
      previousNodeWidth += nodes[i].getBBox().width + 5;
    } else if (
      legendFormattingOptions.legendPosition === "LeftTop" ||
      legendFormattingOptions.legendPosition === "LeftCenter" ||
      legendFormattingOptions.legendPosition === "LeftBottom" ||
      legendFormattingOptions.legendPosition === "RightTop" ||
      legendFormattingOptions.legendPosition === "RightCenter" ||
      legendFormattingOptions.legendPosition === "RightBottom"
    ) {
      verticalLegendElementWidth = Math.max(nodes[i].getBBox().width, verticalLegendElementWidth);
      d3.select(nodes[i]).attr("transform", `translate(0, ${previousNodeHeight + labelOffsetY})`);
      previousNodeHeight += nodes[i].getBBox().height + 5;
    }
  });

  if (
    legendFormattingOptions.legendPosition === "TopLeft" ||
    legendFormattingOptions.legendPosition === "TopCenter" ||
    legendFormattingOptions.legendPosition === "TopRight" ||
    legendFormattingOptions.legendPosition === "BottomLeft" ||
    legendFormattingOptions.legendPosition === "BottomCenter" ||
    legendFormattingOptions.legendPosition === "BottomRight"
  ) {
    let horizontalLegendsWidth = previousNodeWidth + labelOffsetX;

    legend.attr("height", horizontalLegendsHeight);
    legend.attr("width", horizontalLegendsWidth);

    legendWrapper.style("height", `${horizontalLegendsHeight}px`);
    legendWrapper.style("width", `calc(100% - ${legendFormattingOptions.fontSize * 1.6}px`);

    if (legendWrapperXOffset) {
      legendWrapper
        .style("width", `calc(100% - ${legendFormattingOptions.fontSize * 1.6 - legendWrapperXOffset}px`)
        .style("margin-left", legendWrapperXOffset);
    } else {
      legendWrapper.style("margin-left", "0px");
    }

    if (legendFormattingOptions.showTitle) {
      legendTitleElement.attr("transform", (d, i) => `translate(0, ${horizontalLegendsHeight / 4})`);
    }
  } else if (
    legendFormattingOptions.legendPosition === "LeftTop" ||
    legendFormattingOptions.legendPosition === "LeftCenter" ||
    legendFormattingOptions.legendPosition === "LeftBottom" ||
    legendFormattingOptions.legendPosition === "RightTop" ||
    legendFormattingOptions.legendPosition === "RightCenter" ||
    legendFormattingOptions.legendPosition === "RightBottom"
  ) {
    let verticalLegendsHeight = previousNodeHeight + labelOffsetY;
    verticalLegendElementWidth = Math.max(verticalLegendElementWidth, legendTitleElement.node().getBBox().width);

    legend.attr("height", verticalLegendsHeight);
    legend.attr("width", verticalLegendElementWidth);

    legendWrapper.style("height", `calc(100% - ${legendFormattingOptions.fontSize * 1.6 * 2}px`); // decreaseing on both top and bottom
    legendWrapper.style("margin-top", `${legendFormattingOptions.fontSize * 1.6}px`);
    legendWrapper.style("width", `${verticalLegendElementWidth}px`);

    if (legendFormattingOptions.showTitle) {
      legendTitleElement.attr("transform", (d, i) => `translate(0, ${horizontalLegendsHeight / 4})`);
    }
  }

  iconsBar = document.getElementsByClassName("icons-bar")[0];

  let legendWidth = +legend.attr("width");
  let legendHeight = +legend.attr("height");

  let leftRightArrows = legendWidth > legendWrapper.node().clientWidth;
  let topBottomArrows = legendHeight > legendWrapper.node().clientHeight;

  positionLabels(legendFormattingOptions, mainContainer, iconsBar, leftRightArrows, topBottomArrows);

  /* const parent = legend;
    const rootBBox = {
      x: parseFloat(legendItemsGroup.attr("x")),
      y: parseFloat(legendItemsGroup.attr("y")),
      width: parseFloat(legend.attr("width")),
      height: parseFloat(legend.attr("height")),
    }; */

  // const contentItems = legendItemsGroup.selectAll("*");
  // const content = legendItemsGroup.append("g").attr("transform", `translate(${rootBBox.x},${rootBBox.y})`);
  // contentItems.each(function (e) {
  //   content.node().appendChild(this);
  // });

  /* const clipRect = parent.append("clipPath").attr("id", "scrollbox-clip-path").append("rect");
    clipRect.attr("x", rootBBox.x).attr("y", rootBBox.y).attr("width", rootBBox.width).attr("height", rootBBox.height); */

  /* legendItemsGroup
      .insert("rect", "g")
      .attr("x", rootBBox.x)
      .attr("y", rootBBox.y)
      .attr("width", rootBBox.width)
      .attr("height", rootBBox.height)
      .attr("opacity", 0); */

  plotNavigationArrows(legendWrapper, legend, legendFormattingOptions, leftRightArrows, topBottomArrows);

  return {
    legendWrapper: legendWrapper,
    legendItems: legendItems,
  };
};

export const plotNavigationArrows = (
  legendWrapper,
  legend,
  legendFormattingOptions,
  leftRightArrows,
  topBottomArrows
) => {
  if (
    (legendFormattingOptions.legendPosition === "TopLeft" ||
      legendFormattingOptions.legendPosition === "TopCenter" ||
      legendFormattingOptions.legendPosition === "TopRight" ||
      legendFormattingOptions.legendPosition === "BottomLeft" ||
      legendFormattingOptions.legendPosition === "BottomCenter" ||
      legendFormattingOptions.legendPosition === "BottomRight") &&
    leftRightArrows
  ) {
    rightArrow = legendWrapper
      .append("p")
      .attr("id", "rightArrow")
      .style("position", "absolute")
      .style("right", `0px`)
      .style("font-size", legendFormattingOptions.fontSize * 1.2 + "px")
      .style("color", "#808080")
      .text("▶")
      .on("click", (e, d) => {
        let legendWrapperNode = legendWrapper.node();
        legendWrapperNode.scrollLeft += 50;

        let legendNode = legend.node();
        if (legendNode.clientWidth - legendWrapperNode.scrollLeft <= legendWrapperNode.clientWidth) {
          rightArrow.style("display", "none");
        } else {
          rightArrow.style("display", "block");
        }

        if (legendWrapperNode.scrollLeft == 0) {
          leftArrow.style("display", "none");
        } else {
          leftArrow.style("display", "block");
          legendWrapperXOffset = leftArrow.node().clientWidth;
          legendWrapper
            .style(
              "width",
              `calc(100% - ${(legendFormattingOptions.legendPosition === "TopLeft" ||
                legendFormattingOptions.legendPosition === "TopCenter" ||
                legendFormattingOptions.legendPosition === "TopRight"
                ? iconsBar.clientWidth
                : 0) +
              legendFormattingOptions.fontSize * 1.6 * 2 -
              legendWrapperXOffset
              }px`
            )
            .style("margin-left", `${legendWrapperXOffset}px`);
        }
      });

    leftArrow = legendWrapper
      .append("p")
      .attr("id", "leftArrow")
      .style("position", "absolute")
      .style("left", `0px`)
      .style("font-size", legendFormattingOptions.fontSize * 1.2 + "px")
      .style("color", "#808080")
      .style("display", legendWrapper.node().scrollLeft == 0 ? "none" : "block")
      .text("◀")
      .on("click", (e, d) => {
        let legendWrapperNode = legendWrapper.node();
        let legendNode = legend.node();
        legendWrapperNode.scrollLeft -= 50;

        if (legendWrapperNode.scrollLeft == 0) {
          leftArrow.style("display", "none");
        } else {
          leftArrow.style("display", "block");

          legendWrapperXOffset = leftArrow.node().clientWidth;
          if (legendWrapperXOffset) {
            legendWrapper
              .style("width", `calc(100% - ${legendFormattingOptions.fontSize * 1.6 - legendWrapperXOffset}px`)
              .style("margin-left", legendWrapperXOffset);
          } else {
            legendWrapper.style("margin-left", "0px");
          }
        }

        if (legendNode.clientWidth - legendWrapperNode.scrollLeft <= legendWrapperNode.clientWidth) {
          rightArrow.style("display", "none");
        } else {
          rightArrow.style("display", "block");
        }
      });

    if (
      legendFormattingOptions.legendPosition === "TopLeft" ||
      legendFormattingOptions.legendPosition === "TopCenter" ||
      legendFormattingOptions.legendPosition === "TopRight"
    ) {
      rightArrow.style("top", "0px");
      leftArrow.style("top", "0px");
    } else if (
      legendFormattingOptions.legendPosition === "BottomLeft" ||
      legendFormattingOptions.legendPosition === "BottomCenter" ||
      legendFormattingOptions.legendPosition === "BottomRight"
    ) {
      rightArrow.style("bottom", "0px");
      leftArrow.style("bottom", "0px");
    }
  } else if (
    (legendFormattingOptions.legendPosition === "LeftTop" ||
      legendFormattingOptions.legendPosition === "LeftCenter" ||
      legendFormattingOptions.legendPosition === "LeftBottom" ||
      legendFormattingOptions.legendPosition === "RightTop" ||
      legendFormattingOptions.legendPosition === "RightCenter" ||
      legendFormattingOptions.legendPosition === "RightBottom") &&
    topBottomArrows
  ) {
    bottomArrow = legendWrapper
      .append("p")
      .attr("id", "bottomArrow")
      .style("position", "absolute")
      .style("bottom", `0px`)
      .style("font-size", legendFormattingOptions.fontSize * 1.2 + "px")
      .style("color", "#808080")
      .text("▼")
      .on("click", (e, d) => {
        let legendWrapperNode = legendWrapper.node();
        legendWrapperNode.scrollTop += 50;

        let legendNode = legend.node();
        if (legendNode.clientHeight - legendWrapperNode.scrollTop <= legendWrapperNode.clientHeight) {
          bottomArrow.style("display", "none");
        } else {
          bottomArrow.style("display", "block");
        }

        if (legendWrapperNode.scrollTop == 0) {
          topArrow.style("display", "none");
        } else {
          topArrow.style("display", "block");
        }
      });

    topArrow = legendWrapper
      .append("p")
      .attr("id", "topArrow")
      .style("position", "absolute")
      .style("top", `0px`)
      .style("font-size", legendFormattingOptions.fontSize * 1.2 + "px")
      .style("color", "#808080")
      .style("display", legendWrapper.node().scrollTop == 0 ? "none" : "block")
      .text("▲")
      .on("click", (e, d) => {
        let legendWrapperNode = legendWrapper.node();
        let legendNode = legend.node();
        legendWrapperNode.scrollTop -= 50;

        if (legendNode.clientHeight - legendWrapperNode.scrollTop <= legendWrapperNode.clientHeight) {
          bottomArrow.style("display", "none");
        } else {
          bottomArrow.style("display", "block");
        }

        if (legendWrapperNode.scrollTop == 0) {
          topArrow.style("display", "none");
        } else {
          topArrow.style("display", "block");
        }
      });

    if (
      legendFormattingOptions.legendPosition === "LeftTop" ||
      legendFormattingOptions.legendPosition === "LeftCenter" ||
      legendFormattingOptions.legendPosition === "LeftBottom"
    ) {
      bottomArrow.style("left", `${legend.attr("width") / 2}px`);
      topArrow.style("left", `${legend.attr("width") / 2}px`);
    } else if (
      legendFormattingOptions.legendPosition === "RightTop" ||
      legendFormattingOptions.legendPosition === "RightCenter" ||
      legendFormattingOptions.legendPosition === "RightBottom"
    ) {
      bottomArrow.style("right", `${legend.attr("width") / 2}px`);
      topArrow.style("right", `${legend.attr("width") / 2}px`);
    }
  }
};

export const addEllipsisToLegends = (textNodes, legendFormattingOptions, circleRadius, isLegendTitle = false) => {
  let legendContainerWidth = legend.node().getBoundingClientRect().width;
  legendContainerWidth -= legendContainerWidth * 0.2;

  textNodes.each((d, i, nodes) => {
    let boundingRect = nodes[i].getBoundingClientRect();
    if (boundingRect.width + boundingRect.x > legendContainerWidth) {
      let textProperties = {
        text: nodes[i].textContent,
        fontFamily: legendFormattingOptions.fontFamily,
        fontSize: legendFormattingOptions.fontSize + "px",
      };
      let availableWidth = legendContainerWidth - (isLegendTitle ? 0 : circleRadius * 2);
      let truncatedText = textMeasurementService.getTailoredTextOrDefault(textProperties, availableWidth);
      d3.select(nodes[i]).text(truncatedText);
    }
  });
};

export const positionLabels = (legendFormattingOptions, mainContainer, iconsBar, leftRightArrows, topBottomArrows) => {
  d3.select(".visual")
    .on("mouseover", () => {
      if (
        iconsBar &&
        /* leftRightArrows && */
        (legendFormattingOptions.legendPosition == "TopLeft" ||
          legendFormattingOptions.legendPosition == "TopCenter" ||
          legendFormattingOptions.legendPosition == "TopRight")
      ) {
        if (legendWrapperXOffset) {
          legendWrapper
            .style(
              "width",
              `calc(100% - ${iconsBar.clientWidth + legendFormattingOptions.fontSize * 1.6 * 2 - legendWrapperXOffset
              }px`
            )
            .style("margin-left", `${legendWrapperXOffset}px`);
        } else {
          legendWrapper.style(
            "width",
            `calc(100% - ${iconsBar.clientWidth + legendFormattingOptions.fontSize * 1.6}px)`
          );
          legendWrapper.style("margin-left", "0px");
        }

        if (rightArrow) {
          rightArrow.style("right", `${iconsBar.clientWidth}px`);
        }
      } else if (
        (iconsBar /*  && topBottomArrows */ && legendFormattingOptions.legendPosition === "RightTop") ||
        legendFormattingOptions.legendPosition === "RightCenter" ||
        legendFormattingOptions.legendPosition === "RightBottom"
      ) {
        if (
          legend.node().getBoundingClientRect().y <=
          iconsBar.getBoundingClientRect().y + iconsBar.getBoundingClientRect().height
        ) {
          legendWrapper
            .style("height", `calc(100% - ${iconsBar.clientHeight + legendFormattingOptions.fontSize * 1.6 * 2}px)`)
            .style("margin-top", `${iconsBar.clientHeight + legendFormattingOptions.fontSize * 1.6}px`);
          if (topArrow) {
            topArrow.style("top", `${iconsBar.clientHeight}px`);
          }
        }
      }
    })
    .on("mouseout", () => {
      if (
        iconsBar &&
        /* leftRightArrows && */
        (legendFormattingOptions.legendPosition == "TopLeft" ||
          legendFormattingOptions.legendPosition == "TopCenter" ||
          legendFormattingOptions.legendPosition == "TopRight")
      ) {
        legendWrapper.style("width", `calc(100% - ${legendFormattingOptions.fontSize * 1.6}px)`);
        if (rightArrow) {
          rightArrow.style("right", `${legendFormattingOptions.fontSize / 2}px`);
        }
      } else if (
        (iconsBar /* && topBottomArrows */ && legendFormattingOptions.legendPosition === "RightTop") ||
        legendFormattingOptions.legendPosition === "RightCenter" ||
        legendFormattingOptions.legendPosition === "RightBottom"
      ) {
        legendWrapper
          .style("height", `calc(100% - ${legendFormattingOptions.fontSize * 1.6 * 2}px)`)
          .style("margin-top", `${legendFormattingOptions.fontSize * 1.6}px`);
        if (topArrow) {
          topArrow.style("top", `0px`);
        }
      }
    });

  // Position Legends
  switch (legendFormattingOptions.legendPosition) {
    case "TopLeft":
      legendWrapper.style("align-items", "flex-start");
      break;
    case "BottomLeft":
      legendWrapper
        .style("margin-top", `${mainContainer.clientHeight - legendWrapper.node().clientHeight}px`)
        .style("align-items", "flex-start");
      break;
    case "TopCenter":
      if (mainContainer.clientWidth < legend.node().clientWidth) {
        legendWrapper.style("align-items", "flex-start");
      } else {
        legendWrapper.style("align-items", "center");
      }
      break;
    case "BottomCenter":
      legendWrapper.style("margin-top", `${mainContainer.clientHeight - legendWrapper.node().clientHeight}px`);
      if (mainContainer.clientWidth < legend.node().clientWidth) {
        legendWrapper.style("align-items", "flex-start");
      } else {
        legendWrapper.style("align-items", "center");
      }
      break;
    case "TopRight":
      if (mainContainer.clientWidth < legend.node().clientWidth) {
        legendWrapper.style("align-items", "flex-start");
      } else {
        legendWrapper.style("align-items", "flex-end");
      }
      break;
    case "BottomRight":
      legendWrapper.style("margin-top", `${mainContainer.clientHeight - legendWrapper.node().clientHeight}px`);
      if (mainContainer.clientWidth < legend.node().clientWidth) {
        legendWrapper.style("align-items", "flex-start");
      } else {
        legendWrapper.style("align-items", "flex-end");
      }
      break;
    case "LeftTop":
      legendWrapper.style("align-items", "flex-start");
      break;
    case "LeftCenter":
      legendWrapper.style("align-items", () => {
        if (mainContainer.clientHeight < legend.node().clientHeight) {
          return "flex-start";
        } else {
          return "center";
        }
      });
      break;
    case "LeftBottom":
      legendWrapper.style("align-items", () => {
        if (mainContainer.clientHeight <= legend.node().clientHeight) {
          return "flex-start";
        } else {
          return "flex-end";
        }
      });
      break;
    case "RightTop":
      legendWrapper
        .style("align-items", "flex-start")
        .style("margin-left", `${mainContainer.clientWidth - legendWrapper.node().clientWidth}px`);
      break;
    case "RightCenter":
      legendWrapper
        .style("align-items", () => {
          if (mainContainer.clientHeight < legend.node().clientHeight) {
            return "flex-start";
          } else {
            return "center";
          }
        })
        .style("margin-left", `${mainContainer.clientWidth - legendWrapper.node().clientWidth}px`);
      break;
    case "RightBottom":
      legendWrapper
        .style("align-items", () => {
          if (mainContainer.clientHeight <= legend.node().clientHeight) {
            return "flex-start";
          } else {
            return "flex-end";
          }
        })
        .style("margin-left", `${mainContainer.clientWidth - legendWrapper.node().clientWidth}px`);
      break;
  }
};

export const getTranslateValues = (i, legendFormattingOptions) => {
  if (
    legendFormattingOptions.legendPosition === "TopLeft" ||
    legendFormattingOptions.legendPosition === "TopCenter" ||
    legendFormattingOptions.legendPosition === "TopRight" ||
    legendFormattingOptions.legendPosition === "BottomLeft" ||
    legendFormattingOptions.legendPosition === "BottomCenter" ||
    legendFormattingOptions.legendPosition === "BottomRight"
  ) {
    return `translate(${i * 20}, 0)`;
  } else if (
    legendFormattingOptions.legendPosition === "LeftTop" ||
    legendFormattingOptions.legendPosition === "LeftCenter" ||
    legendFormattingOptions.legendPosition === "LeftBottom" ||
    legendFormattingOptions.legendPosition === "RightTop" ||
    legendFormattingOptions.legendPosition === "RightCenter" ||
    legendFormattingOptions.legendPosition === "RightBottom"
  ) {
    return `translate(0, ${i * 20})`;
  }
};

export const clearLegends = () => {
  if (legendWrapper) {
    legendWrapper.selectAll("*").remove();
  } else {
    d3.select("div.legend-wrapper").selectAll("*").remove();
  }
};
/* 
import { textMeasurementService } from 'powerbi-visuals-utils-formattingutils';
import { TextProperties } from 'powerbi-visuals-utils-formattingutils/lib/src/interfaces';
import { Selection } from "d3-selection";

export type D3Selection<T extends d3.BaseType> = Selection<T, any, any, any>;

export const legendPositionMapper = {
  topLeft: 'topLeft',
  topCenter: 'topCenter',
  topRight: 'topRight',
  bottomLeft: 'bottomLeft',
  bottomCenter: 'bottomCenter',
  bottomRight: 'bottomRight',
  leftTop: 'leftTop',
  leftCenter: 'leftCenter',
  leftBottom: 'leftBottom',
  rightTop: 'rightTop',
  rightCenter: 'rightCenter',
  rightBottom: 'rightBottom',
}

class LegendRenderer {
  legendSettings: any;
  dataPoints: any;
  legendMaxWidth: number;
  defaultTitle: any;
  mainContainer: any;
  legendWrapper: any;
  legendTitleElement: any;
  legendSvg: any;
  legendHeight: number;
  visualHeight: number;
  visualWidth: any;

  constructor(params) {
    this.mainContainer = params.container;
    this.dataPoints = params.dataPoints;
    this.defaultTitle = params.defaultTitle;
    this.legendSettings = params.legendSettings;
    this.visualWidth = params.visualWidth;
    this.visualHeight = params.visualHeight;
    
    this.initializeLegends();
  }

  initializeLegends() {
    if (this.legendSettings.show) {
      this.legendHeight = (this.legendSettings.fontSize * 1.1) + 8;

      let longestLabel =  this.dataPoints.map(e=>e.name).reduce((a,b) => a.length > b.length ? a : b)
      const textProps: TextProperties = {
        fontFamily: this.legendSettings.fontFamily,
        fontSize: this.legendSettings.fontSize + "px"
      }
          
    this.legendMaxWidth = textMeasurementService.measureSvgTextWidth(textProps, ('__' + longestLabel + '__'))  
    this.legendWrapper = this.mainContainer
              .append('div')
              .attr('id', 'legend-div')
              .classed('legend-wrapper', true) 
              .style("text-align", 'left')
              .style("white-space", "nowrap")
              .style("overflow", "auto")
    
    let legendTitleText: string
    if (this.legendSettings.legendTitle === null || this.legendSettings.legendTitle === "") {
      this.legendSettings.legendTitle = this.defaultTitle
    }
    if (this.legendSettings.title) {
      this.legendTitleElement = this.legendWrapper
                .append('p')
                .text(this.legendSettings.legendTitle)
                .style("font-weight", "bold")
    }
    
    this.legendSvg = this.legendWrapper.append('svg')
                              .attr("class", "legend-item-svg")
                              .attr("height", this.legendHeight)
    
    if (this.legendSettings.position.slice(0,1) ==="r"||
    this.legendSettings.position.slice(0,1) ==="l") {
      let verticalAlign: string
      if (this.legendSettings.position === legendPositionMapper.leftTop || this.legendSettings.position === legendPositionMapper.rightTop) {
        verticalAlign = 'top'
      }
      else if(this.legendSettings.position === legendPositionMapper.leftBottom || this.legendSettings.position === legendPositionMapper.rightBottom) {
        verticalAlign = 'bottom'
      }
      else verticalAlign = 'center'
    
      this.legendWrapper.style("vertical-align", verticalAlign).style("text-align", 'left')
      if((this.visualHeight - (this.legendSettings.fontSize*1.5)*3) > this.legendSettings.fontSize*3){ // legend Height Adjustment 
        this.visualWidth = this.visualWidth - this.legendMaxWidth -10;
      }
    
      if (this.legendMaxWidth > this.visualWidth/3) {
        this.legendMaxWidth = this.visualWidth/3
      }

      if (this.legendMaxWidth < 32) { // Legend Width Adjustment
        this.visualWidth = (this.isInFocus? (vizOptions.options.viewport.width - document.querySelector(".popup-container").clientWidth) : vizOptions.options.viewport.width) - (margin * 2)
      }
    
      /* this.svg.style('display', 'inline') */

/* this.legendWrapper
        .style('display', 'inline-block') 
        .style("overflow-x", "hidden")
        .style("overflow-y", "scroll")
        .style('min-height', this.legendSettings.fontSize + 'px')
        .style('max-height', '100%')
    
      this.legendSvg.attr('width', this.legendMaxWidth)
      this.legendHeight = this.legendWrapper.node().getBoundingClientRect().height
      // legendSvg.attr("height", this.legendHeight)
    } else { 
      let textAnchor: string
      if (this.legendSettings.position === legendPositionMapper.topLeft || this.legendSettings.position === legendPositionMapper.bottomLeft) {
        textAnchor = 'left'
      } else if (this.legendSettings.position === legendPositionMapper.topCenter || this.legendSettings.position === legendPositionMapper.bottomCenter) {
        textAnchor = 'center'
      }
      else textAnchor = 'right'
    
      this.legendWrapper.style("overflow-x", "scroll")
                .style("overflow-y", "hidden")
                .style("vertical-align", "middle")
                .style("text-align", textAnchor)
                .style("max-height", this.legendHeight + 'px')
    
      // this.legendHeight = this.legendContainer.node().getBoundingClientRect().height 
      this.visualHeight = this.visualHeight - this.legendHeight 
      /* this.svg.style('display', 'block') // to reduce the extra gap between the svg and legendContainer div */
/* }
    
    }
    else { 
      this.legendHeight = 0; 
    }
  }

} */
