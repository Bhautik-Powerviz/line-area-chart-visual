import { Selection } from "d3-selection";
import { Visual } from "../visual";
import { IVisualCategoryData } from "../visual-data.model";
import { SetAxisLabeImageSize } from "./AxisImageLabel.methods";
import { TransformOutsideDataLabelsG } from "./DataLabels.methods";
type D3Selection<T extends d3.BaseType> = Selection<T, any, any, any>;

export const RenderLabelImageOnStackedBar = (self: Visual, barData: IVisualCategoryData[]): void => {
    if (!self.isPercentageStackedBar) {
        TransformLabelImageGOnStackedBar(self);
    }

    const labelImageSelection = self.labelImageOnStackedBarG.selectAll("foreignObject").data(barData);
    SetAxisLabeImageSize(self);

    labelImageSelection.join(
        (enter) => {
            const foreignObject = enter.append("foreignObject");
            foreignObject
                .attr("width", (d) => {
                    return self.axisLabelImageWidth;
                })
                .attr("height", (d) => {
                    return self.axisLabelImageHeight;
                });

            TransformImageLabelForeignObjectsOnBar(self, foreignObject);

            const div = foreignObject.append("xhtml:div").attr("class", "bar");
            const image = div.append("img").attr("class", "barImageLabel");
            FormattingImageLabelOnBar(self, image);
            return foreignObject;
        },
        (update) => {
            update
                .attr("width", (d) => {
                    return self.axisLabelImageWidth;
                })
                .attr("height", (d) => {
                    return self.axisLabelImageHeight;
                });

            TransformImageLabelForeignObjectsOnBar(self, update);

            const div = update.selectAll(".bar");
            const image = div.selectAll(".barImageLabel");
            FormattingImageLabelOnBar(self, image);
        }
    );

    TransformOutsideDataLabelsG(self);
}

export const TransformLabelImageGOnStackedBar = (self: Visual): void => {
    let x: number = 0;
    let y: number = 0;

    if (self.isHorizontalChart) {
        y = 0;
        if (self.isLeftYAxis) {
            if (self.isLeftLabelImageWithinBar) {
                x = self.axisLabelImageHeight / 4;
            } else {
                x = 0;
            }
        } else {
            if (self.isLeftLabelImageWithinBar) {
                x = -self.axisLabelImageHeight / 4;
            } else {
                x = -self.axisLabelImageHeight / 2;
            }
        }
    }

    if (!self.isHorizontalChart) {
        x = 0;
        if (self.isBottomXAxis) {
            if (self.isBottomLabelImageWithinBar) {
                y = -self.axisLabelImageHeight / 2;
            } else {
                y = 0;
            }
        } else {
            if (self.isBottomLabelImageWithinBar) {
                y = self.axisLabelImageHeight / 2;
            } else {
                y = 0;
            }
        }
    }

    self.labelImageOnStackedBarG.attr("transform", `translate(${x}, ${y})`);
}

export const SetBarImageLabelAttrs = (self: Visual, imageSelection: any, width: number, height: number): void => {
    imageSelection
        .attr("class", "barImageLabel")
        .style("width", width + "px")
        .style("height", height + "px")
        .attr("src", (d) => self.chartData.find((c) => c.category === d.category)?.imageDataUrl)
        .style("border-style", self.isShowImageBorder ? "solid" : "none")
        .style("border-width", `${self.labelImageBorderWidth}px`)
        .style("border-color", self.imageBorderColor);
}

export const TransformImageLabelForeignObjectsOnBar = (self: Visual, foreignObjectSelection: D3Selection<SVGElement>): void => {
    foreignObjectSelection.attr("transform", (d) => {
        if (self.isHorizontalChart) {
            if (self.isLeftLabelImageWithinBar) {
                return `translate(${(self.xScale(self.isLeftYAxis ? 0 : self.isPercentageStackedBar ? 100 : d.value) ?? 0) -
                    self.axisLabelImageHeight / 4
                    }, ${(self.yScale(d.category) ?? 0) - self.scaleBandWidth / 4 + self.axisLabelImageHeight / 4})`;
            } else {
                if (self.isRightImageRightYAxisPosition) {
                    return `translate(${(self.xScale(0) ?? 0) - self.axisLabelImageWidth / 2}, ${(self.yScale(d.category) ?? 0) - self.scaleBandWidth / 4 + self.axisLabelImageHeight / 4
                        })`;
                } else {
                    return `translate(${(self.xScale(self.isPercentageStackedBar ? 100 : d.value) ?? 0) - self.axisLabelImageHeight / 2
                        }, ${(self.yScale(d.category) ?? 0) - self.scaleBandWidth / 4 + self.axisLabelImageHeight / 4})`;
                }
            }
        } else {
            if (!self.isBottomLabelImageWithinBar) {
                return `translate(${self.xScale(d.category) - self.axisLabelImageWidth / 2}, ${self.yScale(self.isPercentageStackedBar ? 100 : d.value) - self.axisLabelImageHeight / 2
                    })`;
            } else {
                return `translate(${self.xScale(d.category) - self.axisLabelImageWidth / 2}, ${self.yScale(0) - self.axisLabelImageHeight / 2
                    })`;
            }
        }
    });
}

export const FormattingImageLabelOnBar = (self: Visual, imagesLabelSelection: D3Selection<SVGElement>): void => {
    imagesLabelSelection
        .style("width", "100%")
        .style("height", "100%")
        .attr("src", (d) => d.imageDataUrl)
        .style("border-style", self.isShowImageBorder ? "solid" : "none")
        .style("border-width", `${self.labelImageBorderWidth}px`)
        .style("border-color", self.imageBorderColor);
}

// drawVerticalBarImageLabel(imageSelection: any): void {
//     SetBarImageLabelAttrs(this, imageSelection, this.axisLabelImageWidth, this.axisLabelImageHeight);
//     if (this.labelImagePositionWithinBar === Position.Top) {
//       imageSelection
//         .style("top", -this.axisLabelImageHeight / 2 + "px")
//         .style("bottom", "unset")
//         .style("left", "unset")
//         .style("right", "unset");
//     } else {
//       imageSelection
//         .style("bottom", -this.axisLabelImageHeight / 2 + "px")
//         .style("top", "unset")
//         .style("left", "unset")
//         .style("right", "unset");
//     }
//   }

//   drawHorizontalBarImageLabel(imageSelection: any): void {
//     SetBarImageLabelAttrs(this, imageSelection, this.axisLabelImageWidth, this.axisLabelImageHeight);
//     if (this.labelImagePositionWithinBar === Position.Right) {
//       imageSelection
//         .style("right", -this.axisLabelImageWidth / 2 + "px")
//         .style("left", "unset")
//         .style("top", "unset")
//         .style("bottom", "unset");
//     } else {
//       imageSelection
//         .style("left", -this.axisLabelImageWidth / 2 + "px")
//         .style("right", "unset")
//         .style("top", "unset")
//         .style("bottom", "unset");
//     }
//   }