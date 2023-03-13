import { Visual } from "../visual";
import { select as d3Select } from "d3-selection";
import { min as d3Min } from "d3-array";
import { Position } from "../enum";

export const RenderXAxisImagesLabel = (self: Visual): void => {
    const imageWidth = self.scaleBandWidth * 0.2 < 40 ? self.scaleBandWidth * 0.2 : 40;
    const imageHeight = self.scaleBandWidth * 0.2 < 40 ? self.scaleBandWidth * 0.2 : 40;
    RemoveXAxisImagesLabel(self);
    self.xAxisG
        .selectAll(".tick")
        .append("svg:image")
        .attr("class", "labelImage")
        .attr("x", -imageWidth / 2)
        .attr("y", self.isBottomXAxis ? 5 - imageHeight : -5)
        .attr("width", imageWidth)
        .attr("height", imageHeight)
        .attr("xlink:href", (tick: string) => self.chartData.find((d) => d.category === tick)?.imageDataUrl);
}

export const RenderYAxisImagesLabel = (self: Visual): void => {
    const THIS = self;
    const labelTextImageMargin = 15;
    const maxImageWidth = d3Min([self.scaleBandWidth - self.yAxisTickHeight - labelTextImageMargin, 40])!;
    const maxImageHeight = d3Min([self.scaleBandWidth - self.yAxisTickHeight - labelTextImageMargin, 40])!;
    const imageWidth = self.scaleBandWidth * 0.5 < maxImageWidth ? self.scaleBandWidth * 0.5 : maxImageWidth;
    const imageHeight = self.scaleBandWidth * 0.5 < maxImageHeight ? self.scaleBandWidth * 0.5 : maxImageHeight;

    RemoveYAxisImagesLabel(self);
    self.yAxisG
        .selectAll(".tick")
        .append("svg:image")
        .attr("class", "labelImage")
        .attr("x", function () {
            if (THIS.isLeftYAxis) {
                const labelText = d3Select(this.parentNode).select("text");
                return -imageWidth + parseFloat(labelText.attr("x"));
            } else {
                return 9;
            }
        })
        .attr("y", function () {
            const labelText = (d3Select(this.parentNode).select("text").node() as SVGSVGElement).getBBox();
            const y = (THIS.scaleBandWidth - (labelTextImageMargin + labelText.height + imageHeight)) / 2;
            return -(THIS.scaleBandWidth / 2 - y);
        })
        .attr("width", imageWidth)
        .attr("height", imageHeight)
        .attr("xlink:href", function (tick: string) {
            return THIS.chartData.find((d) => d.category === tick)!.imageDataUrl;
        });
}

export const RemoveXAxisImagesLabel = (self: Visual): void => {
    self.xAxisG.selectAll(".tick").selectAll(".labelImage").remove();
}

export const RemoveYAxisImagesLabel = (self: Visual): void => {
    self.yAxisG.selectAll(".tick").selectAll(".labelImage").remove();
}

export const RemoveXYAxisImagesLabel = (self: Visual): void => {
    if (!self.isHasImagesData || !self.isLabelImageWithinAxis) {
        RemoveXAxisImagesLabel(self);
        RemoveYAxisImagesLabel(self);
    }

    if (!self.xAxisSettings.isDisplayImage) {
        RemoveXAxisImagesLabel(self);
    }

    if (!self.yAxisSettings.isDisplayImage) {
        RemoveYAxisImagesLabel(self);
    }
}

export const SetXYAxisTickPositionForImageLabel = (self: Visual): void => {
    const THIS = self;
    const imageHeight = self.scaleBandWidth * 0.2 < 40 ? self.scaleBandWidth * 0.2 : 40;
    if (self.isLabelImageWithinAxis) {
        if (self.isHorizontalChart) {
            // this.yAxisG.attr("transform", function () {
            //     if (THIS.yAxisSettings.position === Position.Left) {
            //         return `translate(0, 0)`;
            //     } else {
            //         return `translate(${THIS.width}, 0)`;
            //     }
            // })
        } else {
            self.xAxisG.attr("transform", function () {
                if (THIS.xAxisSettings.position === Position.Bottom) {
                    return "translate(0," + (+THIS.height + +imageHeight) + ")";
                } else {
                    return "translate(0," + (0 - +imageHeight) + ")";
                }
            });
        }
    }

    // this.xAxisG
    //     .selectAll(".tick")
    //     .selectAll("text")
    //     .selectAll("tspan")
    //     .each(function () {
    //         const ele = d3.select(this);
    //         ele.attr("y", function () {
    //             const defaultY = 9;
    //             if (THIS.isShowLabelImage && THIS.isLabelImageWithinAxis) {
    //                 if (THIS.isBottomXAxis) {
    //                     return +defaultY + imageHeight;
    //                 } else {
    //                     return -(+defaultY + imageHeight) - (THIS.isBottomXAxis ? 0 : THIS.xAxisTickHeight);
    //                 }
    //             } else {
    //                 return defaultY;
    //             }
    //         });
    //     });

    self.yAxisG
        .selectAll(".tick")
        .selectAll("text")
        .each(function () {
            const ele = d3Select(this);
            ele.attr("y", () => {
                const defaultY: string = ele.attr("y");
                // const labelImageHeight = (d3.select(this.parentNode).select(".labelImage").node() as SVGSVGElement).getBBox()
                //     .height;
                // const labelTextHeight = (d3.select(this.parentNode).select("text").node() as SVGSVGElement).getBBox().height;
                // const y = (THIS.scaleBandWidth - (15 + labelTextHeight + labelImageHeight)) / 2;
                // return THIS.scaleBandWidth / 2 - y;
                if (THIS.isShowLabelImage && THIS.isLabelImageWithinAxis) {
                    return THIS.scaleBandWidth * 0.2;
                } else {
                    return defaultY;
                }
            });
        });
}

export const SetAxisLabeImageSize = (self: Visual): void => {
    if (self.isHorizontalChart) {
        self.axisLabelImageWidth = self.scaleBandWidth * 0.35;
        self.axisLabelImageHeight = self.scaleBandWidth * 0.35;
    } else {
        self.axisLabelImageWidth = Math.min(self.scaleBandWidth * 0.225, self.height * 0.15);
        self.axisLabelImageHeight = Math.min(self.scaleBandWidth * 0.225, self.height * 0.15);
    }
}
