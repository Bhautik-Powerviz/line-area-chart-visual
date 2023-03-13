import { Visual } from "../visual";
import { select as d3Select, Selection } from "d3-selection";
import { BarType, FontStyle, Position } from "../enum";
type D3Selection<T extends d3.BaseType> = Selection<T, any, any, any>;

export const RenderSeriesLabels = (self: Visual, stackedBarData: any[]): void => {
    const isLeftSeriesLabel = self.seriesLabelSettings.seriesPosition === Position.Left;
    const isTopSeriesLabel = self.seriesLabelSettings.seriesPosition === Position.Top;

    let dataLabelsData = [];
    if (stackedBarData.length) {
        const xScaleDomain = self.xScale.domain();
        const yScaleDomain = self.yScale.domain();
        const groupedBarBandScaleDomain = self.groupedBarBandScale.domain();

        if (self.isHorizontalChart) {
            if (self.chartSettings.barType === BarType.Stacked) {
                if (self.isBottomXAxis) {
                    dataLabelsData = stackedBarData[!isTopSeriesLabel ? 0 : stackedBarData.length - 1].components;
                } else {
                    dataLabelsData = stackedBarData[!isTopSeriesLabel ? stackedBarData.length - 1 : 0].components;
                }
            } else {
                if (self.isBottomXAxis) {
                    const category = yScaleDomain[!isTopSeriesLabel ? 0 : yScaleDomain.length - 1];
                    const groupedCategory =
                        groupedBarBandScaleDomain[isTopSeriesLabel ? 0 : groupedBarBandScaleDomain.length - 1];
                    const dataByKeys = stackedBarData.find(
                        (d) => d.category === category && d.groupedCategory === groupedCategory
                    );
                    dataLabelsData = dataByKeys.components;
                } else {
                    const category = yScaleDomain[isTopSeriesLabel ? 0 : yScaleDomain.length - 1];
                    const groupedCategory =
                        groupedBarBandScaleDomain[isTopSeriesLabel ? 0 : groupedBarBandScaleDomain.length - 1];
                    const dataByKeys = stackedBarData.find(
                        (d) => d.category === category && d.groupedCategory === groupedCategory
                    );
                    dataLabelsData = dataByKeys.components;
                }
            }
        } else {
            if (self.chartSettings.barType === BarType.Stacked) {
                if (self.isLeftYAxis) {
                    dataLabelsData = stackedBarData[isLeftSeriesLabel ? 0 : stackedBarData.length - 1].components;
                } else {
                    dataLabelsData = stackedBarData[isLeftSeriesLabel ? stackedBarData.length - 1 : 0].components;
                }
            } else if (self.chartSettings.barType === BarType.GroupedStacked) {
                if (self.isLeftYAxis) {
                    const category = xScaleDomain[isLeftSeriesLabel ? 0 : xScaleDomain.length - 1];
                    const groupedCategory =
                        groupedBarBandScaleDomain[isLeftSeriesLabel ? 0 : groupedBarBandScaleDomain.length - 1];
                    const dataByKeys = stackedBarData.find(
                        (d) => d.category === category && d.groupedCategory === groupedCategory
                    );
                    dataLabelsData = dataByKeys.components;
                } else {
                    const category = xScaleDomain[isLeftSeriesLabel ? xScaleDomain.length - 1 : 0];
                    const groupedCategory =
                        groupedBarBandScaleDomain[!isLeftSeriesLabel ? groupedBarBandScaleDomain.length - 1 : 0];
                    const dataByKeys = stackedBarData.find(
                        (d) => d.category === category && d.groupedCategory === groupedCategory
                    );
                    dataLabelsData = dataByKeys.components;
                }
            }
        }
    }

    const seriesLabelGSelection = self.seriesLabelG
        .selectAll(".seriesLabelG")
        .data(dataLabelsData, (d) => d?.label?.value);
    seriesLabelGSelection.join(
        (enter) => {
            const dataLabelGSelection = enter.append("g").attr("id", "seriesLabel").attr("class", "seriesLabelG");
            const rectSelection = dataLabelGSelection.append("rect").attr("class", "seriesLabelRect");
            const textSelection = dataLabelGSelection.append("text").attr("class", "seriesLabelText");

            SetSeriesLabelFormatting(self, dataLabelGSelection, textSelection, rectSelection, true);

            if (self.isHorizontalChart) {
                TransformHorizontalChartSeriesLabel(self, dataLabelGSelection);
            } else {
                TransformVerticalChartSeriesLabel(self, dataLabelGSelection);
            }
        },
        (update) => {
            const dataLabelGSelection = update.attr("id", "seriesLabel").attr("class", "seriesLabelG");
            const textSelection = dataLabelGSelection.select(".seriesLabelText");
            const rectSelection = dataLabelGSelection.select(".seriesLabelRect");

            SetSeriesLabelFormatting(self, dataLabelGSelection, textSelection, rectSelection, true);

            if (self.isHorizontalChart) {
                TransformHorizontalChartSeriesLabel(self, dataLabelGSelection);
            } else {
                TransformVerticalChartSeriesLabel(self, dataLabelGSelection);
            }
        }
    );
}

export const SetSeriesLabelFormatting = (
    self: Visual,
    labelSelection: D3Selection<SVGElement>,
    textSelection: D3Selection<SVGElement>,
    rectSelection: D3Selection<SVGElement>,
    isOutsideDataLabel: boolean,
    textBorderSelection: D3Selection<SVGElement> = null
): void => {
    const seriesLabelSettings = self.seriesLabelSettings;
    textSelection
        .attr("fill", seriesLabelSettings.fontColor)
        .attr("text-anchor", "middle")
        .attr("dy", "0.9em")
        .attr("font-size", seriesLabelSettings.fontSize)
        .attr("display", "block")
        .attr("font-family", seriesLabelSettings.fontFamily)
        .attr("font-weight", seriesLabelSettings.fontStyle.includes(FontStyle.Bold) ? "bold" : "")
        .attr("font-style", seriesLabelSettings.fontStyle.includes(FontStyle.Italic) ? "italic" : "")
        .text((d) => d.category)
        // .each((d, i, nodes) => {
        //   if (!self.isHorizontalChart) {
        //     self.wrapSeriesLabel(nodes[i], self.seriesLabelSettings.maximumWidth);
        //   }
        // })
        .each((d, i, nodes) => {
            TrimSeriesLabel(self, nodes[i], self.seriesLabelSettings.maximumWidth - self.scaleBandWidth * 0.1);
        });

    rectSelection
        .attr("width", 0)
        .attr("width", function () {
            const getBBox = (d3Select(this.parentNode as any).select(".seriesLabelText").node() as SVGSVGElement).getBBox();
            return getBBox.width + seriesLabelSettings.fontSize;
        })
        .attr("height", 0)
        .attr("height", function () {
            const getBBox = (d3Select(this.parentNode as any).select(".seriesLabelText").node() as SVGSVGElement).getBBox();
            return getBBox.height + seriesLabelSettings.fontSize * 0.4;
        })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("fill", seriesLabelSettings.backgroundColor)
        .attr("opacity", "0");

    rectSelection
        .attr("fill-opacity", `${100 - seriesLabelSettings.transparency}% `)
        .attr("opacity", seriesLabelSettings.showBackground ? "1" : "0");

    textSelection.attr("transform", function () {
        const bBox = (d3Select(this.parentNode as any).select("rect").node() as SVGSVGElement).getBBox();
        return `translate(${bBox.width / 2},
    ${- (1.5 - seriesLabelSettings.fontSize * 0.4)})`;
    });
}

export const TransformHorizontalChartSeriesLabel = (self: Visual, dataLabelSelection: D3Selection<SVGSVGElement>): void => {
    const getBarWidth = (d) => {
        if (self.isLeftYAxis) {
            const calcWidth = Math.abs((self.xScale(d[1]) ?? 0) - (self.xScale(d[0]) ?? 0));
            return calcWidth > 0 ? calcWidth : 0;
        } else {
            const calcWidth = Math.abs((self.xScale(d[0]) ?? 0) - (self.xScale(d[1]) ?? 0));
            return calcWidth > 0 ? calcWidth : 0;
        }
    };
    const barHeight = self.scaleBandWidth / 2;
    const getDataLabelXY = (dataLabelEle: SVGSVGElement, data: any) => {
        const d = data;
        const labelBBox = dataLabelEle.getBBox();
        const barWidth = getBarWidth(d);
        let x = 0;
        const labelWidth = labelBBox.width;
        const labelHeight = labelBBox.height;
        const isTopSeriesLabel = self.seriesLabelSettings.seriesPosition === Position.Top;
        let y =
            (self.yScale(d.data?.category) ?? 0) -
            self.scaleBandWidth / 4 +
            barHeight / 2 -
            labelBBox.height / 2 +
            (self.isGroupedStackedBar
                ? self.groupedBarBandScale(d.data?.groupedCategory) + self.groupedBarScaleBandWidth / 2
                : 0);
        x = (self.xScale(self.isLeftYAxis ? d[1] : d[0]) ?? 0) + barWidth / 2 - labelWidth / 2;

        if (isTopSeriesLabel) {
            y -= self.scaleBandWidth / 4 + labelHeight / 2 + self.scaleBandWidth * 0.1;
        } else {
            y += self.scaleBandWidth / 4 + labelHeight / 2 + self.scaleBandWidth * 0.1;
        }

        return { x, y };
    };

    dataLabelSelection
        // .transition()
        // .duration(self.tickDuration)
        // .ease(d3.easeLinear)
        .attr("transform", function (data) {
            const { x, y } = getDataLabelXY(this, data);
            return `translate(${x ?? 0}, ${y ?? 0})`;
        })
    // .attr("opacity", function (d) {
    //   const labelBBox = self.getBBox();
    //   return labelBBox.width < getBarWidth(d) ? 1 : 0;
    // });
}

export const TransformVerticalChartSeriesLabel = (self: Visual, dataLabelSelection: D3Selection<SVGSVGElement>): void => {
    const getLabelHeight = (d) => {
        if (self.isBottomXAxis) {
            return Math.abs(self.yScale(d[0] ?? 0) - self.yScale(d[1]) ?? 0);
        } else {
            const calcHeight = Math.abs(self.yScale(d[1] ?? 0) - self.yScale(d[0]) ?? 0);
            return calcHeight > 0 ? calcHeight : 0;
        }
    };

    const getDataLabelXY = (dataLabelEle: SVGSVGElement, data: any) => {
        const labelBBox = dataLabelEle.getBBox();
        const d = data;
        let x =
            self.xScale(d.data?.category) +
            (self.isGroupedStackedBar
                ? self.groupedBarBandScale(d.data?.groupedCategory) + self.groupedBarScaleBandWidth / 2
                : 0);
        const height = getLabelHeight(d);
        let y: number = 0;
        const labelWidth = labelBBox.width;
        const labelHeight = labelBBox.height;
        const isLeftSeriesLabel = self.seriesLabelSettings.seriesPosition === Position.Left;

        if (isLeftSeriesLabel) {
            x -= (labelWidth + self.scaleBandWidth * 0.1 + self.scaleBandWidth / 4);
        } else {
            x += self.scaleBandWidth + self.scaleBandWidth * 0.1;
        }

        y = (self.yScale(self.isBottomXAxis ? d[0] : d[1]) ?? 0) + height / 2 - labelHeight / 2;

        return { x, y };
    };

    dataLabelSelection
        // .transition()
        // .duration(this.tickDuration)
        // .ease(d3.easeLinear)
        .attr("transform", function (data) {
            const { x, y } = getDataLabelXY(this, data);
            return `translate(${x ?? 0}, ${y ?? 0})`;
        })
        .each(function (d) {
            const ele = d3Select(this);
            const labelBBox = this.getBBox();
            const barHeight = getLabelHeight(d);
            if (labelBBox.height > barHeight) {
                const text = d3Select(this).select(".seriesLabelText");
                const textHeight = (text.node() as SVGSVGElement).getBBox().height;
                if (textHeight > barHeight) {
                    d3Select(this).select(".seriesLabelRect").attr("opacity", "0");
                    text.attr("opacity", 0);
                }
            }
        });
}

const TrimSeriesLabel = (self: Visual, tickEle: any, width: number): void => {
    const ele = d3Select(tickEle);
    const textLength = ele.node().getComputedTextLength();
    const text = ele.text();
    const minCharLen = Math.round(width / (textLength / text.length));

    let charLen = minCharLen;
    if (textLength > self.seriesLabelSettings.maximumWidth) {
        if (text.length > charLen) {
            const newText = text.substr(0, charLen);
            ele.text(newText + "..");
        }
    }
}

const WrapSeriesLabel = (self: Visual, textEle: any, width: number): void => {
    width -= width * 0.16;
    const text = d3Select(textEle);
    let words = text.text().split(/\s+/).reverse();
    let word;
    let line = [];
    const y = text.attr("y");
    let tspan = text
        .text(null)
        .append("tspan")
        .attr("x", 0)
        .attr("y", y)
        .attr("dy", 1 + "em")
        .style("font-family", self.seriesLabelSettings.fontFamily);
    while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width - width * 0.1) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text
                .append("tspan")
                .attr("x", 0)
                .attr("y", y)
                .attr("dy", 1 + "em")
                .style("font-family", self.seriesLabelSettings.fontFamily)
                .text(word);
        }
    }
}