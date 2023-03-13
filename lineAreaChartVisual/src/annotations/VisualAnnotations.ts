import * as d3 from "d3";
import * as d3Annotation from "d3-svg-annotation";
import * as React from "react";
import * as ReactDOM from "react-dom";
import AnnotationWindow from "./AnnotationWindow";
import AnnotationController from "./AnnotationController";
import { AnnotationInstanceType, AnnotationData } from "./types/AnnotationType";

class VisualAnnotations {
  private annotationInstance: AnnotationInstanceType;
  private shadow;
  private annotationsConfig;
  private annotationWrapper: HTMLElement;
  private annotationContainer: HTMLElement;
  private annotationController: React.FunctionComponentElement<any>;
  public isAnnotationScreenActivated: boolean;
  public lastModifiedAnnotationUniqueIndex: string;

  constructor(annotationInstance: AnnotationInstanceType) {
    this.annotationInstance = annotationInstance;
    this.shadow = this.annotationInstance.shadow;
    this.annotationsConfig =
      this.shadow.visualSettings[this.annotationInstance.annotationSettings.object][
      this.annotationInstance.annotationSettings.key
      ];
    if (!this.annotationInstance.offsetValues) {
      this.annotationInstance.offsetValues = [0, 0];
    }

    if (!document.querySelector(".annotation-window")) {
      this.annotationContainer = document.createElement("div");
      this.annotationContainer.className = "annotation-window";
      this.shadow.target.append(this.annotationContainer);
      this.lastModifiedAnnotationUniqueIndex = null;
    }

    if (!document.querySelector("#annotation-wrapper")) {
      this.annotationWrapper = document.createElement("div");
      this.annotationWrapper.id = "annotation-wrapper";
      this.annotationWrapper.classList.add("clickable");
      this.shadow.generalIconsWrapper.prepend(this.annotationWrapper);
    }

    this.renderAnnotationDropdown();
  }

  public hideAnnotations() {
    d3.select(".annotation-group").style("display", "none");
  }

  public showAnnotations() {
    d3.select(".annotation-group").style("display", "block");
  }

  public clearAnnotations() {
    const annotationGroup = this.annotationInstance.rootElement.select(".annotation-group");
    if (!annotationGroup.empty()) {
      annotationGroup.remove();
    }
  }

  public initializeAnnotations() {
    this.makeNodesAnnotable();
    this.renderAnnotations();
  }

  public onAnnotationNodeClick(event: MouseEvent): void {
    this.annotationInstance.nodeElements
      .classed("annotable-node", true)
      .each((dataPoint, i, nodes) => {
        const node: Element = d3.select(nodes[i]).node();
        if (this.isAnnotationScreenActivated) {
          let xPosition, yPosition;
          if (this.annotationInstance.viewBoxWithCenterCoordinates) {
            let viewBoxValues = this.annotationInstance.rootElement.attr("viewBox").split(" ");
            xPosition = event.clientX - Math.abs(viewBoxValues[0]);
            yPosition = event.clientY - Math.abs(viewBoxValues[1]);
          } else {
            xPosition = event.clientX;
            yPosition = event.clientY;
          }
          let annotationDataPoint = this.annotationInstance.getAnnotationData(dataPoint);
          this.renderAnnotationWindow(xPosition, yPosition, annotationDataPoint, false);
          event.stopPropagation();
        }
      });
  }

  public makeNodesAnnotable() {
    this.annotationInstance.nodeElements
      .classed("annotable-node", true)
      .each((dataPoint, i, nodes) => {
        const node: Element = d3.select(nodes[i]).node();
        // node.addEventListener("click", (event: MouseEvent) => {
        //   if (this.isAnnotationScreenActivated) {
        //     let xPosition, yPosition;
        //     if (this.annotationInstance.viewBoxWithCenterCoordinates) {
        //       let viewBoxValues = this.annotationInstance.rootElement.attr("viewBox").split(" ");
        //       xPosition = event.clientX - Math.abs(viewBoxValues[0]);
        //       yPosition = event.clientY - Math.abs(viewBoxValues[1]);
        //     } else {
        //       xPosition = event.clientX;
        //       yPosition = event.clientY;
        //     }
        //     let annotationDataPoint = this.annotationInstance.getAnnotationData(dataPoint);
        //     this.renderAnnotationWindow(xPosition, yPosition, annotationDataPoint, false);
        //     event.stopPropagation();
        //   }
        // });
      });
    // .on("click", (event: MouseEvent, dataPoint) => {
    //   debugger;
    //   if (this.isAnnotationScreenActivated) {
    //     let xPosition, yPosition;
    //     if (this.annotationInstance.viewBoxWithCenterCoordinates) {
    //       let viewBoxValues = this.annotationInstance.rootElement.attr("viewBox").split(" ");
    //       xPosition = event.clientX - Math.abs(viewBoxValues[0]);
    //       yPosition = event.clientY - Math.abs(viewBoxValues[1]);
    //     } else {
    //       xPosition = event.clientX;
    //       yPosition = event.clientY;
    //     }
    //     let annotationDataPoint = this.annotationInstance.getAnnotationData(dataPoint);
    //     this.renderAnnotationWindow(xPosition, yPosition, annotationDataPoint, false);
    //     event.stopPropagation();
    //   }
    // });
  }

  public renderAnnotations() {
    this.clearAnnotations();
    let annotationValues = JSON.parse(this.annotationsConfig == "" ? [] : this.annotationsConfig);

    if (annotationValues.length === 0) return;

    let annotations: any[] = [];
    let incrementalBadgeIndex = 0;
    annotationValues.map((currentAnnotation) => {
      let classList: string[] = [];
      let currentNodeElement = this.annotationInstance.nodeElements.filter((node) => {
        let nodeData = this.annotationInstance.getAnnotationData(node);
        if (currentAnnotation.dataPoint.name == nodeData.name && currentAnnotation.dataPoint.value == nodeData.value) {
          return true;
        } else {
          return false;
        }
      });

      if (currentNodeElement.empty()) return;

      // let viewBoxValues = rootElement.attr("viewBox").split(" ");
      // let { x, y, width, height } = currentNodeElement._groups[0][0].getBoundingClientRect();
      // let xPos = (x) - Math.abs(viewBoxValues[0]) + currentAnnotation.badgeSize;
      // let yPos = (y) - Math.abs(viewBoxValues[1]) + currentAnnotation.badgeSize;

      // if(!(xPos >= currentAnnotation.coordinates.xPosition && xPos <= currentAnnotation.coordinates.xPosition)){
      //     currentAnnotation.coordinates.xPosition = xPos + width / 2;
      // }
      // if(!(yPos >= currentAnnotation.coordinates.yPosition && yPos <= currentAnnotation.coordinates.yPosition)){
      //     currentAnnotation.coordinates.yPosition = yPos + height / 2;
      // }

      // Approach 2 - failed in many cases
      /* let nodeBBox = currentNodeElement.node().getBBox();
        if(
            !(
                (currentAnnotation.coordinates.xPosition >= nodeBBox.x && currentAnnotation.coordinates.xPosition <= nodeBBox.x + nodeBBox.width) &&
                (currentAnnotation.coordinates.yPosition >= nodeBBox.y && currentAnnotation.coordinates.yPosition <= nodeBBox.y + nodeBBox.height)
   
                // (Math.abs(currentAnnotation.coordinates.xPosition) >= Math.abs(nodeBBox.x) || Math.abs(currentAnnotation.coordinates.xPosition) <= Math.abs(nodeBBox.x) + Math.abs(nodeBBox.width)) &&
                // (Math.abs(currentAnnotation.coordinates.yPosition) >= Math.abs(nodeBBox.y) || Math.abs(currentAnnotation.coordinates.yPosition) <= Math.abs(nodeBBox.y) + Math.abs(nodeBBox.height))
            )
        ){
            currentAnnotation.coordinates.xPosition = nodeBBox.x + (nodeBBox.width/2);
            currentAnnotation.coordinates.yPosition = nodeBBox.y + (nodeBBox.height/2);
        } */

      let nodeBBox = currentNodeElement.node().getBoundingClientRect();
      let rootBBox = this.annotationInstance.rootElement.node().getBoundingClientRect();

      if (this.annotationInstance.arcMethod) {
        const centroidPoint = this.annotationInstance.arcMethod.centroid(currentNodeElement.node().__data__);
        if (
          !(
            currentAnnotation.coordinates.xPosition >= centroidPoint[0] &&
            currentAnnotation.coordinates.xPosition <= centroidPoint[0] &&
            currentAnnotation.coordinates.yPosition >= nodeBBox.y &&
            currentAnnotation.coordinates.yPosition <= nodeBBox.y + nodeBBox.height
          )
        ) {
          currentAnnotation.coordinates.xPosition = centroidPoint[0];
          currentAnnotation.coordinates.yPosition = centroidPoint[1];
        }
      }

      if (this.annotationInstance.isNodeCentricAnnotation) {
        const nodeData = this.annotationInstance.getAnnotationData(currentNodeElement.datum());
        if (nodeData) {
          currentAnnotation.coordinates.xPosition = nodeBBox.x + nodeData?.width / 2 - rootBBox.left;
          currentAnnotation.coordinates.yPosition = nodeBBox.y + nodeData?.height / 2 - rootBBox.top;
        }
      }

      currentAnnotation.coordinates.xPosition += this.annotationInstance.offsetValues[0];
      currentAnnotation.coordinates.yPosition += this.annotationInstance.offsetValues[1];

      if (currentAnnotation.connectorStyle == "dashed") {
        classList.push("annotation-connector-dashed");
      } else if (currentAnnotation.badgeStyle == "numeric") {
        classList.push("annotation-badge-numeric");
      }

      let customType = {
        className: classList.join(" "),
        subject: { type: "circle" },
        connector: { type: "line", end: "" },
        // "note":{"align":"middle"}
      };
      if (currentAnnotation.connectorType == "line") {
        customType.connector.type = "line";
      } else if (currentAnnotation.connectorType == "elbow") {
        customType.connector.type = "elbow";
      } else if (currentAnnotation.connectorType == "curve") {
        customType.connector.type = "curve";
      }

      if (currentAnnotation.markerType == "dot") {
        customType.connector.end = "dot";
      } else if (currentAnnotation.markerType == "arrow") {
        customType.connector.end = "arrow";
      }

      const type = new d3Annotation.annotationCustomType(d3Annotation.annotationCalloutCircle, customType);

      annotations.push({
        note: {
          label: currentAnnotation.content.replace(/<[^>]+>/g, ""),
          bgPadding: 30,
          // title: "Annotations :)"
          // wrap: 400,  // try something smaller to see text split in several lines
          // padding: 2   // More = text lower
        },
        //can use x, y directly instead of data
        data: currentAnnotation,
        color: [currentAnnotation.color],
        dy: currentAnnotation.coordinates.dy ? currentAnnotation.coordinates.dy : -80,
        dx: currentAnnotation.coordinates.dx ? currentAnnotation.coordinates.dx : 60,
        type: type,
        subject: {
          text: currentAnnotation.badgeStyle == "numeric" ? ++incrementalBadgeIndex : "i",
          y: "top",
          radius: Number(currentAnnotation.badgeSize),
          radiusPadding: 8,
        },
      });
    });

    const makeAnnotations = (
      d3Annotation
        .annotation()
        .editMode(true)
        //accessors & accessorsInverse not needed
        //if using x, y in annotations JSON
        .accessors({
          x: (d: any) => {
            debugger;
            // return xScale(d["category"])
            return d.coordinates.xPosition;
          },
          y: (d: any) => {
            debugger;
            // return yScale(d["value"])
            return d.coordinates.yPosition;
          },
        }) as any
    )
      .on("subjectover", function (annotation) {
        annotation.type.a.selectAll("g.annotation-connector, g.annotation-note").classed("hide-annotation", false);
      })
      .on("subjectout", function (annotation) {
        // annotation.type.a.selectAll("g.annotation-connector, g.annotation-note")
      })
      .on("dragend", (annotation, x, y, z) => {
        let annotationValues = JSON.parse(this.annotationsConfig);
        let index = annotationValues.findIndex((element) => element.uniqueIndex == annotation.data.uniqueIndex);
        annotationValues[index].coordinates.dx = annotation.dx;
        annotationValues[index].coordinates.dy = annotation.dy;
        this.lastModifiedAnnotationUniqueIndex = annotationValues[index].uniqueIndex;
        this.shadow.persistProperties("editor", "annotations", JSON.stringify(annotationValues));
      })
      // .accessorsInverse({
      //     xPos: d => xScale.invert(d.x),
      //     value: d => yScale.invert(d.y)
      // })
      .annotations(annotations);

    this.annotationInstance.rootElement.select(".annotation-group").remove();

    this.annotationInstance.rootElement.append("g").attr("class", "annotation-group").call(makeAnnotations);

    // const addPaddingToConnector = (connectorGroup) => {
    //   let connectorPath = d3.select(connectorGroup).select("path.connector");
    //   let connectorEnd = d3.select(connectorGroup).select("path.connector-end");
    //   let dValue = connectorPath.attr("d"); //'M-20,-40L-159.30099606513977,-124.4039309322834'
    //   let moveToValues = dValue.split("L")[0].substring(1).split(",").map(Number); //['-20', '-40']
    //   let lineToValues = dValue.split("L")[1].split(",").map(Number); //['-159.30099606513977', '-124.4039309322834']
    //   moveToValues = moveToValues.map(Number);
    //   lineToValues = lineToValues.map(Number);
    //   if (lineToValues[0] <= 0 && lineToValues[1] <= 0) {
    //       if (lineToValues[1] >= -100) {
    //           moveToValues[0] = -15;
    //           moveToValues[1] = -30;
    //       }
    //       else if (lineToValues[1] >= -100) {
    //           moveToValues[0] = -20;
    //           moveToValues[1] = -15;
    //       }
    //       else {
    //           moveToValues[0] = -20;
    //           moveToValues[1] = -40;
    //       }
    //   }
    //   else if (lineToValues[0] >= 0 && lineToValues[1] <= 0) {
    //       if (lineToValues[1] >= -35) {
    //           moveToValues[0] = 20;
    //           moveToValues[1] = -20;
    //       }
    //       else {
    //           moveToValues[0] = 10;
    //           moveToValues[1] = -40;
    //       }
    //   }
    //   else if (lineToValues[0] >= 0 && lineToValues[1] >= 0) {
    //       if (lineToValues[0] <= 60) {
    //           moveToValues[0] = 5;
    //           moveToValues[1] = 5;
    //       }
    //       moveToValues[0] = 20;
    //       moveToValues[1] = 0;
    //   }
    //   else if (lineToValues[0] <= 0 && lineToValues[1] >= 0) {
    //       if (lineToValues[1] <= 50) {
    //           moveToValues[0] = -20;
    //           moveToValues[1] = -10;
    //       }
    //       else if (lineToValues[0] <= -100) {
    //           moveToValues[0] = -10;
    //           moveToValues[1] = 0;
    //       }
    //       else if (lineToValues[0] >= -35 && lineToValues[0] <= 0) {
    //           moveToValues[0] = 0;
    //           moveToValues[1] = 10;
    //       }
    //       else {
    //           moveToValues[0] = -20;
    //           moveToValues[1] = 0;
    //       }
    //   }
    //   connectorPath.attr("d", "M" + moveToValues.join() + "L" + lineToValues.join());
    //   connectorEnd.attr("transform", `translate(${moveToValues.join()})`);
    // };

    // rootElement.selectAll(".annotation-connector").each((d, i, nodes) => {
    //     addPaddingToConnector(nodes[i]);
    // })

    this.annotationInstance.rootElement
      .selectAll(".annotation-note-content")
      .style("transform", "none")
      .each((d, i, nodes) => {
        let currentNode = d3.select(nodes[i]);
        let currentNoteBg = currentNode.select(".annotation-note-bg");
        d3.select(nodes[i]).selectAll(".annotation-note-label tspan").remove();

        let currentNoteBgWidth = (currentNoteBg.node() as HTMLElement).getAttribute("width") as string;
        let currentNoteBgHeight = (currentNoteBg.node() as HTMLElement).getAttribute("height") as string;
        let currentNoteBgXvalue = (currentNoteBg.node() as HTMLElement).getAttribute("x") as string;
        let currentNoteBgYvalue = (currentNoteBg.node() as HTMLElement).getAttribute("y") as string;

        let editHeader = d3
          .select(nodes[i])
          .append("g")
          .attr("transform", `translate(${Math.min(parseInt(currentNoteBgWidth), 350) - 50}, -15)`)
          .style("display", "none");

        currentNode
          .on("mouseover", () => {
            editHeader
              // .transition()
              .attr("transform", `translate(${Math.min(parseInt(currentNoteBgWidth), 350) - 25}, -15)`)
              .style("display", "block");
          })
          .on("mouseleave", () => {
            editHeader.style("display", "none");
          });

        let foreignObject = d3
          .select(nodes[i])
          .append("foreignObject")
          .attr("class", "annotation-foreign-object")
          .attr("x", currentNoteBgXvalue)
          .attr("y", currentNoteBgYvalue)
          .attr("width", Math.min(parseInt(currentNoteBgWidth), 350))
          .attr("height", Math.min(parseInt(currentNoteBgHeight), 150))
          .style("background-color", d.data.backgroundColor);

        const rightRoundedRect = (x, y, width, height, radius) => {
          return (
            "M" +
            x +
            "," +
            y +
            "h" +
            (width - radius) +
            "a" +
            radius +
            "," +
            radius +
            " 0 0 1 " +
            radius +
            "," +
            radius +
            "v" +
            (height - 2 * radius) +
            "a" +
            radius +
            "," +
            radius +
            " 0 0 1 " +
            -radius +
            "," +
            radius +
            "h" +
            (radius - width) +
            "z"
          );
        };
        // editHeader
        //   .append("rect")
        //   .attr("width", 24)
        //   .attr("height", 65)
        //   .attr("x", -5)
        //   .attr("y", -15)
        //   .attr("fill", "#ebebeb")

        editHeader
          .append("path")
          .attr("d", rightRoundedRect(-5, -15, 24, 65, 3))
          .attr("height", 65)
          .attr("x", -5)
          .attr("y", -15)
          .attr("fill", "#efefef")
          .attr("stroke", "#D3D3D3")
          .style("cursor", "pointer");

        editHeader
          .append("text")
          .attr("class", "annotation-control-close")
          .text("X")
          .attr("x", 3)
          .style("font-size", "11px")
          .style("font-family", "cursive")
          .style("cursor", "pointer")
          .on("mousedown", (event, d) => {
            let annotationMainGroup =
              event.target.parentElement.parentElement.parentElement.parentElement.parentElement;
            annotationMainGroup
              .querySelectorAll("g.annotation-connector, g.annotation-note")
              .forEach((e) => e.classList.add("hide-annotation"));
            event.stopPropagation();
          });
        editHeader
          .append("image")
          .attr("class", "annotation-control-edit")
          .attr("href", require("./assets/dark-black-edit.svg"))
          .attr("width", 12)
          .attr("height", 12)
          .attr("x", 1)
          .attr("y", 8)
          .style("cursor", "pointer")
          .on("mousedown", (event: MouseEvent, annotationData: any) => {
            this.renderAnnotationWindow(event.clientX, event.clientY, null, true, annotationData["data"]);
            event.stopPropagation();
          });

        editHeader
          .append("image")
          .attr("class", "annotation-control-delete")
          .attr("href", require("./assets/dark-black-delete.svg"))
          .attr("width", 12)
          .attr("height", 12)
          .attr("x", 1)
          .attr("y", 28)
          .style("cursor", "pointer")
          .on("mousedown", (event, d: any) => {
            let data = d["data"];
            let index = JSON.parse(this.annotationsConfig).findIndex(
              (element) => element.uniqueIndex == data.uniqueIndex
            );
            if (index != -1) {
              annotationValues.splice(index, 1);
              this.shadow.persistProperties("editor", "annotations", JSON.stringify(annotationValues));
              this.renderAnnotations();
              event.stopPropagation();
            }
          });

        let noteRotationIcon: any = currentNode
          .append("image")
          .attr("href", require("./assets/annotation-note-rotate-icon.png"))
          .attr("width", 12)
          .attr("height", 12)
          .attr("x", 10)
          .attr("y", -50);
        let startDragX, startDragY;
        let noteRotationIcondragHandler = d3
          .drag()
          .on("start", (event) => {
            debugger;
            startDragX = event.sourceEvent["clientX"];
            startDragY = event.sourceEvent["clientY"];
            /* let draggingElement = rootElement.selectAll(".annotations .annotation").filter(d => d.data == data);
                    let xPos, yPos;
                    if(viewBoxWithCenterCoordinates){
                      let viewBoxValues = rootElement.attr("viewBox").split(" ");
                      xPos = event.sourceEvent["clientX"] - Math.abs(viewBoxValues[0]) + data.badgeSize;
                      yPos = event.sourceEvent["clientY"] - Math.abs(viewBoxValues[1]) + data.badgeSize;
                    }
                    else{
                      xPos = event.sourceEvent["clientX"] + data.badgeSize;
                      yPos = event.sourceEvent["clientY"] + data.badgeSize;
                    }
                    
                    xPos += offsetValues[0];
                    yPos += offsetValues[1];
          
                    let transformValue = draggingElement.attr("transform");
                    let transformValuesArray =  transformValue.substr(10).slice(0, -1).split(",");
          
                    deltaX = Number(transformValuesArray[0]) - xPos;
                    deltaY = Number(transformValuesArray[1]) - yPos; */
          })
          .on("drag", (event) => {
            debugger;
            let width = Math.min(parseInt((currentNoteBg.node() as HTMLElement).getAttribute("width") as string), 350);
            let viewBoxValues = this.annotationInstance.viewBoxWithCenterCoordinates
              ? this.annotationInstance.rootElement.attr("viewBox").split(" ")
              : [0, 0];
            let xPos = Number(event.sourceEvent["clientX"] /*  - Math.abs(viewBoxValues[0]) + offsetValues[0] */);
            let yPos = Number(event.sourceEvent["clientY"] /*  - Math.abs(viewBoxValues[1]) + offsetValues[1] */);
            if (xPos < startDragX) {
              xPos -= 40;
            }
            if (Math.abs(xPos - startDragX) > 30 && Math.abs(yPos - startDragY) > 30) {
              // xPos = Math.abs(xPos - startDragX) > 30 ? xPos : xPos + 30;
              // yPos = Math.abs(yPos - startDragY) > 30 ? yPos : yPos + 30;
              let currentNodeBoundingClientRect = currentNode.node().getBoundingClientRect();
              let getAtan = Math.atan2(
                yPos - currentNodeBoundingClientRect.y - 50,
                xPos - currentNodeBoundingClientRect.x - 50
              );

              let getDeg = getAtan * (180 / Math.PI);
              currentNode.style("transform", `rotate(${getDeg}deg)`);

              if (getDeg > -30 && getDeg <= 90) {
                editHeader
                  .selectAll(".annotation-control-close, .annotation-control-edit, .annotation-control-delete")
                  .style("transform", `rotate(0deg)`);
              } else if (getDeg > 90 && getDeg <= 180) {
                editHeader
                  .selectAll(".annotation-control-close, .annotation-control-edit, .annotation-control-delete")
                  .style("transform", `rotate(-90deg)`);
              } else if (getDeg > -180 && getDeg <= -90) {
                editHeader
                  .selectAll(".annotation-control-close, .annotation-control-edit, .annotation-control-delete")
                  .style("transform", `rotate(180deg)`);
              } else if (getDeg > -90 && getDeg <= -30) {
                editHeader
                  .selectAll(".annotation-control-close, .annotation-control-edit, .annotation-control-delete")
                  .style("transform", `rotate(90deg)`);
              }

              /* let draggingElement = rootElement.selectAll(".annotations .annotation").filter(d => d.data == data);
                      
                      let viewBoxValues = viewBoxWithCenterCoordinates ? rootElement.attr("viewBox").split(" ") : [0, 0];
                      
                      let xPos = Number(event.sourceEvent["clientX"] - Math.abs(viewBoxValues[0]) + offsetValues[0] + data.badgeSize);
                      let yPos = Number(event.sourceEvent["clientY"] - Math.abs(viewBoxValues[1]) + offsetValues[1] + data.badgeSize);
                      draggingElement.attr("transform", `translate(${xPos + deltaX},${yPos + deltaY})`); */
            }
          });

        noteRotationIcondragHandler(noteRotationIcon);

        let wrapper = foreignObject
          .append("xhtml:div")
          .attr("class", "annotation-foreign-object-wrapper")
          .style("width", Math.min(parseInt(currentNoteBgWidth), 350) + "px")
          .style("height", Math.min(parseInt(currentNoteBgHeight), 150) + "px")
          .style("overflow", "auto");
        /*  let editHeader = wrapper.append("xhtml:div").classed("annotation-edit-header", true)
   
              editHeader.append("xhtml:div")
                .classed("annotation-edit-header-edit-icon", true)
                .style("display", this.isViewMode ? "block" : "none")
                .on("mousedown", (event: MouseEvent, annotationData) => {
                  this.renderAnnotationWindow(event.clientX, event.clientY, null, true, annotationData["data"]);
                  event.stopPropagation();
                })
   
              editHeader.append("xhtml:div")
                .classed("annotation-edit-header-delete-icon", true)
                .style("display", this.isViewMode ? "block" : "none")
                .on("mousedown", (event, { data }) => {
                  let index = JSON.parse(this.annotationsConfig).findIndex(element => element.uniqueIndex == data.uniqueIndex);
                  if (index != -1) {
                      annotationValues.splice(index, 1);
                      this.persistProperties("editor", "annotations", JSON.stringify(annotationValues))
                      this.renderAnnotations(rootElement, nodeElements, annotationValues, arcMethod, viewBoxWithCenterCoordinates, getAnnotationDatapoint)
                      event.stopPropagation();
                  }
                }); */

        /* editHeader.append("xhtml:div")
                .classed("annotation-edit-header-close-icon", true)
                .text("X")
                .on("mousedown", (event, d) => {
                  let annotationMainGroup = event.target.parentElement.parentElement.parentElement.parentElement.parentElement;
                  annotationMainGroup.querySelectorAll("g.annotation-connector, g.annotation-note").forEach(e => e.classList.add("hide-annotation"));
                  event.stopPropagation();
                }) */

        const getFormattedAnnotationContent = (content) => {
          let updatedString = content.replace(
            /\<span class="annotation-measure-datavalue">(.+?)\<\/span>/g,
            function (occurence, columnName) {
              columnName = columnName.replace('<span contenteditable="false">', "").replaceAll("\uFEFF", "");
              return d.data.dataPoint[columnName];
            }
          );
          return updatedString;
        };

        wrapper
          .append("xhtml:div")
          .classed("annotation-foreign-object-content", true)
          .style("height", currentNoteBgHeight)
          .html(getFormattedAnnotationContent(d.data.content));

        wrapper.select("a").on("mousedown", (event) => {
          this.shadow.host.launchUrl(event.target.getAttribute("href"));
          event.stopPropagation();
        });
      });

    let deltaX, deltaY;

    let annotationSubjectdragHandler = d3
      .drag()
      .on("start", (event, d: any) => {
        let data = d["data"];
        debugger;
        let draggingElement = this.annotationInstance.rootElement
          .selectAll(".annotations .annotation")
          .filter((d) => d.data == data);
        let xPos, yPos;
        if (this.annotationInstance.viewBoxWithCenterCoordinates) {
          let viewBoxValues = this.annotationInstance.rootElement.attr("viewBox").split(" ");
          xPos = event.sourceEvent["clientX"] - Math.abs(viewBoxValues[0]) + data.badgeSize;
          yPos = event.sourceEvent["clientY"] - Math.abs(viewBoxValues[1]) + data.badgeSize;
        } else {
          xPos = event.sourceEvent["clientX"] + data.badgeSize;
          yPos = event.sourceEvent["clientY"] + data.badgeSize;
        }

        xPos += this.annotationInstance.offsetValues[0];
        yPos += this.annotationInstance.offsetValues[1];

        let transformValue = draggingElement.attr("transform");
        let transformValuesArray = transformValue.substr(10).slice(0, -1).split(",");

        deltaX = Number(transformValuesArray[0]) - xPos;
        deltaY = Number(transformValuesArray[1]) - yPos;
      })
      .on("drag", (event, d: any) => {
        let data = d["data"];
        debugger;
        let draggingElement = this.annotationInstance.rootElement
          .selectAll(".annotations .annotation")
          .filter((d) => d.data == data);

        let viewBoxValues = this.annotationInstance.viewBoxWithCenterCoordinates
          ? this.annotationInstance.rootElement.attr("viewBox").split(" ")
          : [0, 0];

        let xPos = Number(
          event.sourceEvent["clientX"] -
          Math.abs(viewBoxValues[0]) +
          this.annotationInstance.offsetValues[0] +
          data.badgeSize
        );
        let yPos = Number(
          event.sourceEvent["clientY"] -
          Math.abs(viewBoxValues[1]) +
          this.annotationInstance.offsetValues[1] +
          data.badgeSize
        );
        draggingElement.attr("transform", `translate(${xPos + deltaX},${yPos + deltaY})`);
      })
      .on("end", (event, d: any) => {
        debugger;
        let data = d["data"];
        let elementsAtDroppedPosition = document.elementsFromPoint(
          event.sourceEvent.clientX,
          event.sourceEvent.clientY
        );
        let currentDataPoint = elementsAtDroppedPosition.find((element) =>
          element.classList.contains("annotable-node")
        );

        let annotationValues = JSON.parse(this.annotationsConfig);
        let index = annotationValues.findIndex((element) => element.uniqueIndex == data.uniqueIndex);

        if (!currentDataPoint) {
          let draggingElement = this.annotationInstance.rootElement
            .selectAll(".annotations .annotation")
            .filter((d) => d.data == data);
          draggingElement.attr(
            "transform",
            `translate(${annotationValues[index].coordinates.xPosition},${annotationValues[index].coordinates.yPosition})`
          );
          return;
        }

        if (index !== -1) {
          let xPos, yPos;
          let viewBoxValues = this.annotationInstance.viewBoxWithCenterCoordinates
            ? this.annotationInstance.rootElement.attr("viewBox").split(" ")
            : [0, 0];
          xPos =
            event.sourceEvent["clientX"] -
            Math.abs(viewBoxValues[0]) +
            this.annotationInstance.offsetValues[0] +
            data.badgeSize;
          yPos =
            event.sourceEvent["clientY"] -
            Math.abs(viewBoxValues[1]) +
            this.annotationInstance.offsetValues[1] +
            data.badgeSize;
          annotationValues[index].coordinates.xPosition = xPos + deltaX;
          annotationValues[index].coordinates.yPosition = yPos + deltaY;

          annotationValues[index].dataPoint = this.annotationInstance.getAnnotationData(
            (currentDataPoint as any).__data__
          );
        }
        this.lastModifiedAnnotationUniqueIndex = annotationValues[index].uniqueIndex;
        this.shadow.persistProperties("editor", "annotations", JSON.stringify(annotationValues));
      });

    let annotationSubject = this.annotationInstance.rootElement.selectAll(".annotation-subject");
    annotationSubject
      // .each((d, i, nodes) => {
      //     let currentSubject = d3.select(nodes[i]);
      //     currentSubject.selectAll("path.subject-pointer, path.subject").attr("fill", d.data.color).attr("stroke", d.data.color);
      //     currentSubject.select(".subject-ring").attr("stroke", d.data.color);
      // })
      .append("circle")
      .attr("r", (d, i) => d.subject.radius * 0.8)
      .attr("fill", (d, i) => d.data.badgeColor);
    annotationSubject
      .append("text")
      .attr("dx", (d) => -d.data.badgeSize * 0.2)
      .attr("dy", (d) => d.data.badgeSize * 0.3)
      .attr("fill", "#FFF")
      .style("font-size", (d) => d.data.badgeSize)
      .text((d, i) => d.subject.text);
    annotationSubject
      .insert("path", "path.subject")
      .attr("d", (d) => {
        let triangleSymbol = d3
          .symbol()
          .type(d3.symbolTriangle)
          .size(Number(d.data.badgeSize) * 5);
        return triangleSymbol();
      })
      .attr("fill", (d, i) => d.data.badgeColor)
      .style("transform", (d, i) => `rotate(180deg) translate(0, -${d.subject.radius}px)`);
    annotationSubject
      .select(".subject")
      .attr("stroke", (d, i) => d.data.badgeColor)
      .style("stroke-width", "2px")
      .style("fill-opacity", 1)
      .style("fill", "#FFF");
    annotationSubjectdragHandler(annotationSubject);

    let connectorsNoteSelection = this.annotationInstance.rootElement.selectAll(
      "g.annotation-connector, g.annotation-note"
    );
    connectorsNoteSelection.select(".note-line").style("display", "none");
    connectorsNoteSelection.classed("hide-annotation", ({ data }) =>
      this.lastModifiedAnnotationUniqueIndex != null && data.uniqueIndex == this.lastModifiedAnnotationUniqueIndex
        ? false
        : true
    );

    this.annotationInstance.rootElement
      .selectAll(".annotation-subject .badge-text")
      .style("font-size", ({ data }) => data.badgeSize + "pt");
    // rootElement.selectAll(".annotation-subject").select("circle.handle:last-of-type").attr("r", ({ data }) => data.badgeSize).attr("cy", ({ data }) => Number(data.badgeSize) + 10);
  }

  public renderAnnotationWindow(
    xPosition: number,
    yPosition: number,
    dataPoint,
    editMode: boolean,
    data: AnnotationData = null
  ) {
    this.shadow.target.style.cursor = "url(https://i.ibb.co/qmB2hVV/cursor2.jpg), auto";
    let annotationWindow: HTMLElement = document.querySelector(".annotation-window");
    let annotationRoot = React.createElement(AnnotationWindow, {
      vizOptions: this.shadow.updateOptions,
      config: this.shadow.config,
      shadow: this.shadow,
      coordinates: { xPosition: xPosition, yPosition: yPosition },
      uniqueIndex: data !== null ? data.uniqueIndex : null,
      editMode: editMode,
      dataPoint: dataPoint,
      visualAnnotation: this,
    });
    annotationWindow.style.display = "block";
    ReactDOM.render(annotationRoot, annotationWindow);
  }

  private renderAnnotationDropdown() {
    let annotationWrapper: HTMLElement = document.querySelector("#annotation-wrapper");
    this.annotationController = React.createElement(AnnotationController, {
      vizOptions: this.shadow.updateOptions,
      config: this.shadow.config,
      shadow: this.shadow,
      visualAnnotation: this,
    });
    ReactDOM.render(this.annotationController, annotationWrapper);
  }

  public updateNodeElements(newNodes) {
    this.annotationInstance.nodeElements = newNodes;
    this.lastModifiedAnnotationUniqueIndex = null;
  }
}

export default VisualAnnotations;
