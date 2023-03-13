import { Visual } from "../visual";
import { select as d3Select, Selection } from "d3-selection";
import { BarType, DataLabelsPlacement, FontStyle, Orientation, Position } from "../enum";
import { IVisualCategoryData } from "../visual-data.model";
import { easeLinear } from "d3";
import { BBox } from "d3-svg-annotation";
import { GetFormattedNumber } from "./NumberFormat.methods";
type D3Selection<T extends d3.BaseType> = Selection<T, any, any, any>;

export const RenderDataLabels = (self: Visual, data: any[]): void => {
    self.insideDataLabelsG.selectAll("*").attr("display", "block");
    self.outsideDataLabelsG.selectAll("*").attr("display", "block");
    if (self.chartSettings.barType === BarType.Normal || self.chartSettings.barType === BarType.Grouped) {
        if (self.dataLabelsSettings.dataLabels.placement !== DataLabelsPlacement.OutSide) {
            RenderInsideDataLabels(self, data);
            RenderOutsideDataLabels(self, []);
        } else {
            RenderOutsideDataLabels(self, data);
            RenderInsideDataLabels(self, []);
        }
    }
}

export const RenderInsideDataLabels = (self: Visual, data: IVisualCategoryData[]): void => {
    self.setScaleBandWidth();
    const labelsData = data.filter((data) => {
        return self.isHorizontalChart ? self.yScale(data.category) : self.xScale(data.category);
    });
    const dataLabelGSelection = self.insideDataLabelsG
        .selectAll(".insideDataLabelG")
        .data(labelsData, (d) => d.category + d?.subCategory);

    dataLabelGSelection.join(
        (enter) => {
            const dataLabelGSelection = enter
                .append("g")
                .attr("id", "dataLabel")
                .attr("opacity", 0)
                .attr("class", "insideDataLabelG");
            const rectSelection = dataLabelGSelection.append("rect").attr("class", "dataLabelRect");
            const textBorderSelection = dataLabelGSelection.append("text").attr("class", "dataLabelTextBorder");
            const textSelection = dataLabelGSelection.append("text").attr("class", "dataLabelText");

            FormattingDataLabels(self, dataLabelGSelection, textSelection, rectSelection, false, textBorderSelection);
            TransformDataLabelInside(self, dataLabelGSelection, false);
        },
        (update) => {
            const dataLabelGSelection = update.attr("id", "dataLabel").attr("class", "insideDataLabelG");
            const textSelection = dataLabelGSelection.select(".dataLabelText");
            const textBorderSelection = dataLabelGSelection.select(".dataLabelTextBorder");
            const rectSelection = dataLabelGSelection.select(".dataLabelRect");

            FormattingDataLabels(self, dataLabelGSelection, textSelection, rectSelection, false, textBorderSelection);
            TransformDataLabelInside(self, dataLabelGSelection, true);
        }
    );
}

export const RenderOutsideDataLabels = (self: Visual, data: IVisualCategoryData[]): void => {
    self.outsideDataLabelsG.selectAll("*").attr("display", "block");
    self.setScaleBandWidth();

    const labelsData = data.filter((data) => {
        return self.isHorizontalChart ? self.yScale(data.category) : self.xScale(data.category);
    });

    const dataLabelGSelection = self.outsideDataLabelsG
        .selectAll(".outsideDataLabelG")
        .data(labelsData, (d) => d.category + d?.subCategory + d?.groupedCategory);

    dataLabelGSelection.join(
        (enter) => {
            const dataLabelGSelection = enter.append("g").attr("id", "dataLabel").attr("class", "outsideDataLabelG");
            const rectSelection = dataLabelGSelection.append("rect").attr("class", "dataLabelRect");
            const textSelection = dataLabelGSelection.append("text").attr("class", "dataLabelText");

            FormattingDataLabels(self, dataLabelGSelection, textSelection, rectSelection, true);
            TransformDataLabelOutside(self, dataLabelGSelection, false);
        },
        (update) => {
            const dataLabelGSelection = update.attr("id", "dataLabel").attr("class", "outsideDataLabelG");
            const textSelection = dataLabelGSelection.select(".dataLabelText");
            const rectSelection = dataLabelGSelection.select(".dataLabelRect");

            FormattingDataLabels(self, dataLabelGSelection, textSelection, rectSelection, true);
            TransformDataLabelOutside(self, dataLabelGSelection, true);
        }
    );
}

export const FormattingDataLabels = (
    self: Visual,
    labelSelection: D3Selection<SVGElement>,
    textSelection: D3Selection<SVGElement>,
    rectSelection: D3Selection<SVGElement>,
    isOutsideDataLabel: boolean,
    textBorderSelection: D3Selection<SVGElement> = null
): void => {
    const dataLabelsSettings = isOutsideDataLabel
        ? self.chartSettings.barType === BarType.Normal
            ? self.dataLabelsSettings.dataLabels
            : self.dataLabelsSettings.totalLabels
        : self.dataLabelsSettings.dataLabels;
    const fontSize = self.getDataLabelsFontSize(dataLabelsSettings);

    labelSelection.style("pointer-events", "none");
    textSelection
        .attr("fill", (d) => self.getDataLabelTextColors(d.value, dataLabelsSettings.color))
        .attr("text-anchor", "middle")
        .attr("dy", "0.02em")
        .attr("font-size", fontSize)
        .attr("display", "block")
        .style("font-family", dataLabelsSettings.fontFamily)
        .style("font-weight", dataLabelsSettings.fontStyle.includes(FontStyle.Bold) ? "bold" : "")
        .style("font-style", dataLabelsSettings.fontStyle.includes(FontStyle.Italic) ? "italic" : "")
        .text((d) => GetFormattedNumber(self, self.isGroupedStackedBar ? d["maxValue"] : d["value"], true));

    if (textBorderSelection) {
        textBorderSelection
            .attr("stroke", dataLabelsSettings.textStrokeColor)
            .attr("stroke-width", dataLabelsSettings.textStrokeWidth)
            .attr("stroke-linejoin", "round")
            .attr("text-anchor", "middle")
            .attr("dy", "0.02em")
            .attr("font-size", fontSize)
            .style("font-family", dataLabelsSettings.fontFamily)
            .style("font-weight", dataLabelsSettings.fontStyle.includes(FontStyle.Bold) ? "bold" : "")
            .style("font-style", dataLabelsSettings.fontStyle.includes(FontStyle.Italic) ? "italic" : "")
            .attr("display", (d) => {
                return self.patternSettings.enable && d?.pattern?.patternIdentifier ? "block" : "none";
            })
            .text((d) => GetFormattedNumber(self, self.isGroupedStackedBar ? d["maxValue"] : d["value"], true));
    }

    // .transition()
    // .duration(this.tickDuration)
    // .ease(d3.easeLinear)
    // .tween('text', function (d) {
    //     const ele = d3.select(this);
    //     const currentValue = this.isGroupedStackedBar ? d["maxValue"] : d["value"];
    //     const previousValue = parseInt(ele.attr("dataLabelOrigValue")) || 0;
    //     ele.attr("dataLabelOrigValue", currentValue);
    //     const i = d3.interpolateRound(previousValue, currentValue);
    //     return function (t) {
    //         this.textContent = THIS.getFormattedNumber(i(t));
    //     };
    // });

    rectSelection
        .attr("width", 0)
        .attr("width", function () {
            const getBBox = (d3Select(this.parentNode as any).select(".dataLabelText").node() as SVGSVGElement).getBBox();
            return getBBox.width + fontSize;
        })
        .attr("height", 0)
        .attr("height", function () {
            const getBBox = (d3Select(this.parentNode as any).select(".dataLabelText").node() as SVGSVGElement).getBBox();
            return getBBox.height + fontSize * 0.4;
        })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("fill", dataLabelsSettings.backgroundColor)
        .attr("opacity", "0");

    rectSelection
        .attr("fill-opacity", `${100 - dataLabelsSettings.transparency}% `)
        .attr("opacity", dataLabelsSettings.showBackground ? "1" : "0");

    textSelection.attr("transform", function () {
        const bBox = (d3Select(this.parentNode as any).select("rect").node() as SVGSVGElement).getBBox();
        return `translate(${bBox.width / 2},
                    ${bBox.height - 1.5 - fontSize * 0.4})`;
    });

    if (textBorderSelection) {
        textBorderSelection.attr("transform", function () {
            const bBox = (d3Select(this.parentNode as any).select("rect").node() as SVGSVGElement).getBBox();
            return `translate(${bBox.width / 2},
                        ${bBox.height - 1.5 - fontSize * 0.4})`;
        });
    }
}

export const TransformDataLabelInside = (self: Visual, labelsSelection: D3Selection<SVGElement>, isUpdateMode: boolean): void => {
    const THIS = self;
    const dataLabelsSettings = self.dataLabelsSettings.dataLabels;
    const isXAxisPosBottom = self.xAxisSettings.position === Position.Bottom;
    const isYAxisPosLeft = self.yAxisSettings.position === Position.Left;

    const getDataLabelXY = (dataLabelEle: any, d: any) => {
        const labelBBox: BBox = dataLabelEle.getBBox();
        let x = THIS.xScale(THIS.isHorizontalChart ? d.value : d.category);
        let y = THIS.yScale(THIS.isHorizontalChart ? d.category : d.value) + labelBBox.height;
        const barWidth = isYAxisPosLeft ? THIS.xScale(d.value) - THIS.xScale(0) : THIS.xScale(0) - THIS.xScale(d.value);
        const barHeight = isXAxisPosBottom
            ? THIS.yScale(0) - THIS.yScale(d.value)
            : THIS.yScale(0) - THIS.yScale(d.value);

        let transX: number = 0;
        let transY: number = 0;

        if (THIS.chartSettings.orientation === Orientation.Vertical) {
            // if (this.isNormalBarChart) {
            //   x += this.groupedBarScaleBandWidth / 2;
            // }

            if (self.isGroupedBarChart) {
                x -= self.scaleBandWidth / 2;
            }

            if (THIS.xAxisSettings.position === Position.Bottom) {
                switch (dataLabelsSettings.placement) {
                    case DataLabelsPlacement.End:
                        transX = x - labelBBox.width / 2 + self.scaleBandWidth / 2;
                        transY = y - labelBBox.height / 2;
                        break;

                    case DataLabelsPlacement.Center:
                        transX = x - labelBBox.width / 2 + self.scaleBandWidth / 2;
                        transY = y + barHeight / 2 - labelBBox.height * 1.5;
                        break;

                    case DataLabelsPlacement.Base:
                        transX = x - labelBBox.width / 2 + self.scaleBandWidth / 2;
                        transY = y - labelBBox.height * 2 + barHeight - 10;
                        break;
                }
            } else {
                switch (dataLabelsSettings.placement) {
                    case DataLabelsPlacement.End:
                        transX = x - labelBBox.width / 2;
                        transY = y - labelBBox.height * 2.5;
                        break;

                    case DataLabelsPlacement.Center:
                        transX = x - labelBBox.width / 2;
                        transY = y + barHeight / 2 - labelBBox.height * 1.5;
                        break;

                    case DataLabelsPlacement.Base:
                        transX = x - labelBBox.width / 2;
                        transY = self.yScale(0) + 10;
                        break;
                }
            }
        } else if (THIS.chartSettings.orientation === Orientation.Horizontal) {
            if (self.isNormalBarChart) {
                y += self.scaleBandWidth / 2;
            }

            if (THIS.yAxisSettings.position === Position.Left) {
                switch (dataLabelsSettings.placement) {
                    case DataLabelsPlacement.End:
                        transX = x - labelBBox.width - 10;
                        transY = y - labelBBox.height * 1.5;
                        break;

                    case DataLabelsPlacement.Center:
                        transX = x - barWidth / 2 - labelBBox.width / 2;
                        transY = y - labelBBox.height * 1.5;
                        break;

                    case DataLabelsPlacement.Base:
                        transX = self.xScale(0) + 10;
                        transY = y - labelBBox.height * 1.5;
                        break;
                }
            } else {
                switch (dataLabelsSettings.placement) {
                    case DataLabelsPlacement.End:
                        transX = x - labelBBox.width + labelBBox.width * 1.5;
                        transY = y - labelBBox.height * 1.5;
                        break;

                    case DataLabelsPlacement.Center:
                        transX = x + barWidth / 2 - labelBBox.width / 2;
                        transY = y - labelBBox.height * 1.5;
                        break;

                    case DataLabelsPlacement.Base:
                        transX = x + barWidth - labelBBox.width - 10;
                        transY = y - labelBBox.height * 1.5;
                        break;
                }
            }
        }

        const groupedBarTrans =
            THIS.chartSettings.barType === BarType.Grouped
                ? THIS.groupedBarBandScale(d.bandScaleKey) + THIS.groupedBarScaleBandWidth / 2
                : 0;

        return {
            x: transX + (THIS.isHorizontalChart ? 0 : groupedBarTrans),
            y: transY + (THIS.isHorizontalChart ? groupedBarTrans : 0),
        };
    };

    if (!isUpdateMode) {
        labelsSelection
            .attr("transform", function (d) {
                const { x, y } = getDataLabelXY(this, d);
                return `translate(${THIS.isHorizontalChart ? 0 : x}, ${THIS.isHorizontalChart ? y : THIS.height})`;
            })
            .transition()
            .duration(self.tickDuration)
            .ease(easeLinear)
            .attr("transform", function (d) {
                const { x, y } = getDataLabelXY(this, d);
                return `translate(${x}, ${y})`;
            })
            .on("end", function (d) {
                SetDataLabelOpacityBasedOnBarArea(self, d3Select(this), d);
            });
    } else {
        labelsSelection
            .transition()
            .duration(self.tickDuration)
            .ease(easeLinear)
            .attr("transform", function (d) {
                const { x, y } = getDataLabelXY(this, d);
                return `translate(${x}, ${y})`;
            })
            .on("end", function (d) {
                SetDataLabelOpacityBasedOnBarArea(self, d3Select(this), d);
            });
    }
}

export const TransformDataLabelOutside = (self: Visual, labelSelection: D3Selection<SVGSVGElement>, isUpdateMode: boolean): void => {
    const dataLabelsSettings = self.dataLabelsSettings.dataLabels;
    let labelDistance = 10;

    const setDataLabelXY = (dataLabelEle: SVGSVGElement, d: any): { x: number, y: number, rotateDeg: number } => {
        const groupedBarTrans =
            self.chartSettings.barType === BarType.Grouped
                ? self.groupedBarBandScale(d.bandScaleKey) + self.groupedBarScaleBandWidth / 2
                : 0;

        const bBox = dataLabelEle.getBBox();

        const XY = self.getDataLabelXY(d);
        const x = XY.x + (self.isHorizontalChart ? 0 : groupedBarTrans);
        const y = XY.y + (self.isHorizontalChart ? groupedBarTrans : 0);
        let transX = 0;
        let transY = 0;
        let rotateDeg = 0;

        if (self.isHorizontalChart) {
            if (
                (self.yAxisSettings.position === Position.Left && d.value >= 0) ||
                (self.yAxisSettings.position === Position.Right && d.value < 0)
            ) {
                if (dataLabelsSettings.orientation === Orientation.Horizontal) {
                    transX = x + labelDistance;
                    transY = y - bBox.height / 2;
                    rotateDeg = 0;
                } else {
                    transX = x + labelDistance;
                    transY = y + bBox.width / 2;
                    rotateDeg = 270;
                }
            } else {
                if (dataLabelsSettings.orientation === Orientation.Horizontal) {
                    transX = x - bBox.width - labelDistance;
                    transY = y - bBox.height / 2;
                    rotateDeg = 0;
                } else {
                    transX = x - bBox.height - labelDistance;
                    transY = y + bBox.width / 2;
                    rotateDeg = 270;
                }
            }
        } else {
            if (
                (self.xAxisSettings.position === Position.Bottom && d.value >= 0) ||
                (self.xAxisSettings.position === Position.Top && d.value < 0)
            ) {
                if (dataLabelsSettings.orientation === Orientation.Horizontal) {
                    transX = x - bBox.width / 2;
                    transY = y - labelDistance - bBox.height;
                    rotateDeg = 0;
                } else {
                    transX = x - bBox.height / 2;
                    transY = y - labelDistance;
                    rotateDeg = 270;
                }
            } else {
                if (dataLabelsSettings.orientation === Orientation.Horizontal) {
                    transX = x - bBox.width / 2;
                    transY = y + labelDistance;
                    rotateDeg = 0;
                } else {
                    transX = x - bBox.height / 2;
                    transY = y + bBox.width + labelDistance;
                    rotateDeg = 270;
                }
            }
        }
        return { x: transX, y: transY, rotateDeg };
    };

    if (!isUpdateMode) {
        labelSelection
            .attr("transform", function (d) {
                const { x, y, rotateDeg } = setDataLabelXY(this, d);
                return `translate(${self.isHorizontalChart ? 0 : x
                    }, ${self.isHorizontalChart ? y : self.height}), rotate(${rotateDeg})`;
            })
            .transition()
            .duration(self.tickDuration)
            .ease(easeLinear)
            .attr("transform", function (d) {
                const { x, y, rotateDeg } = setDataLabelXY(this, d);
                return `translate(${x}, ${y}), rotate(${rotateDeg})`;
            });
    } else {
        labelSelection
            .transition()
            .duration(self.tickDuration)
            .ease(easeLinear)
            .attr("transform", function (d) {
                const { x, y, rotateDeg } = setDataLabelXY(this, d);
                return `translate(${x}, ${y}), rotate(${rotateDeg})`;
            });
    }
}

export const SetDataLabelOpacityBasedOnBarArea = (self: Visual, dataLabelEle: D3Selection<SVGElement>, d: any): void => {
    const barType = self.chartSettings.barType;
    if (barType === BarType.Normal || barType === BarType.Grouped) {
        const dataLabelBBox = (dataLabelEle.node() as SVGSVGElement).getBBox();
        let barBBox;
        const scaleBandWidth: number = Math.round(
            barType === BarType.Normal ? self.scaleBandWidth : self.groupedBarScaleBandWidth
        );
        if (barType === BarType.Normal) {
            barBBox = (
                self.normalBarG?.select(`#${self.getBarIdByCategory(d?.category)}`).node() as SVGSVGElement
            )?.getBoundingClientRect();
        } else {
            barBBox = (
                self.groupedBarG
                    ?.select(`#${self.getTrimmedString(d?.subCategory)}-${self.getTrimmedString(d?.category)}`)
                    ?.node() as SVGSVGElement
            )?.getBoundingClientRect();
        }
        if (barBBox) {
            const opacity =
                (barType === BarType.Grouped
                    ? Math.round(barBBox.width) < scaleBandWidth || Math.round(barBBox.height) < scaleBandWidth
                    : false) ||
                    dataLabelBBox.height > barBBox.height ||
                    dataLabelBBox.width > barBBox.width
                    ? 0
                    : 1;
            dataLabelEle
                .transition()
                .duration(self.tickDuration / 2)
                .ease(easeLinear)
                .attr("opacity", opacity);
        }
    }
}

export const TransformOutsideDataLabelsG = (self: Visual): void => {
    if (self.isShowLabelImage && self.isLabelImageWithinBar) {
        if (self.isHorizontalChart) {
            if (self.isLeftLabelImageWithinBar) {
                self.outsideDataLabelsG.attr(
                    "transform",
                    `translate(${self.isLeftYAxis ? self.axisLabelImageWidth / 2 : -self.axisLabelImageWidth / 2}, 0)`
                );
            } else {
                if (!self.isRightImageRightYAxisPosition) {
                    self.outsideDataLabelsG.attr("transform", `translate(${self.axisLabelImageHeight / 2}, 0)`);
                } else {
                    self.outsideDataLabelsG.attr("transform", `translate(${-self.axisLabelImageHeight / 2}, 0)`);
                }
            }
        } else {
            if (self.isBottomXAxis) {
                self.outsideDataLabelsG.attr("transform", `translate(0, ${-self.axisLabelImageHeight / 2})`);
            } else {
                self.outsideDataLabelsG.attr("transform", `translate(0, ${self.axisLabelImageHeight / 2})`);
            }
        }
    } else {
        self.outsideDataLabelsG.attr("transform", `translate(0, 0)`);
    }
}