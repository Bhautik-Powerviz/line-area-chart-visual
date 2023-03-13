import { Visual } from "../visual";
import { create, select as d3Select, Selection } from "d3-selection";
import { EDynamicDeviationConnectingLineTypes, EDynamicDeviationDisplayTypes, EDynamicDeviationLabelDisplayTypes } from "../enum";
import { ICategoryValuePair } from "../visual-settings.model";
import DynamicDeviationIcon from "../../assets/icons/DeviationIcon.svg";
import { GetFormattedNumber } from "./NumberFormat.methods";
import { HideStaticTooltip, ShowStaticTooltip } from "./Lasso.methods";
type D3Selection<T extends d3.BaseType> = Selection<T, any, any, any>;

export const RenderDynamicDeviation = (self: Visual, from: ICategoryValuePair, to: ICategoryValuePair): void => {
    self.fromCategoryValueDataPair = from;
    self.toCategoryValueDataPair = to;
    RemoveDynamicDeviation(self);

    const dynamicDeviationSettings = self.dynamicDeviationSettings;
    const isPositiveDeviation = from.value < to.value;
    const isBothLabelDisplayType =
        dynamicDeviationSettings.labelDisplayType === EDynamicDeviationLabelDisplayTypes.Both;

    const getDataLabelValue = (displayType: EDynamicDeviationLabelDisplayTypes) => {
        const dataValue = isPositiveDeviation ? to.value - from.value : -(from.value - to.value);
        if (displayType === EDynamicDeviationLabelDisplayTypes.Value) {
            return (dataValue >= 0 ? "+" : "") + GetFormattedNumber(self, dataValue, false);
        } else if (displayType === EDynamicDeviationLabelDisplayTypes.Percentage) {
            if (isPositiveDeviation) {
                return "+" + ((to.value * 100) / from.value).toFixed(2) + "%";
            } else {
                return (100 - (to.value * 100) / from.value).toFixed(2) + "%";
            }
        }
    };

    const dataLabelG = self.dynamicDeviationG.append("g");

    let dataLabelBorderText;
    let dataLabelText;
    let dataLabelRect;

    if (dynamicDeviationSettings.isShowLabelBorder && !isBothLabelDisplayType) {
        dataLabelBorderText = dataLabelG
            .append("text")
            .attr("stroke", dynamicDeviationSettings.borderColor)
            .attr("stroke-width", dynamicDeviationSettings.borderWidth)
            .attr("stroke-linejoin", "round")
            .attr("text-anchor", "middle")
            .attr("dy", "0.02em")
            .attr("font-size", dynamicDeviationSettings.labelFontSize)
            .style("font-family", dynamicDeviationSettings.labelFontFamily)
            .attr("display", dynamicDeviationSettings.isShowLabelBorder ? "block" : "none")
            .text(getDataLabelValue(dynamicDeviationSettings.labelDisplayType));
    }

    dataLabelText = dataLabelG
        .append("text")
        .attr("fill", self.dynamicDeviationSettings.labelFontColor)
        .attr("text-anchor", "middle")
        .attr("dy", "0.02em")
        .attr("font-size", self.dynamicDeviationSettings.labelFontSize)
        .attr("display", "block")
        .attr("font-family", self.dynamicDeviationSettings.labelFontFamily)
        .text(!isBothLabelDisplayType ? getDataLabelValue(dynamicDeviationSettings.labelDisplayType) : "");

    if (isBothLabelDisplayType) {
        dataLabelText
            .append("tspan")
            .attr("x", 0)
            .attr("dy", "1em")
            .text(getDataLabelValue(EDynamicDeviationLabelDisplayTypes.Value));
        dataLabelText
            .append("tspan")
            .attr("x", 0)
            .attr("dy", "1.2em")
            .text(`(${getDataLabelValue(EDynamicDeviationLabelDisplayTypes.Percentage)})`);
    }

    dataLabelRect = dataLabelG
        .append("rect")
        .attr("width", 0)
        .attr("width", function () {
            const getBBox = (d3Select(this.parentNode).select("text").node() as SVGSVGElement).getBBox();
            return getBBox.width + dynamicDeviationSettings.labelFontSize;
        })
        .attr("height", 0)
        .attr("height", function () {
            const getBBox = (d3Select(this.parentNode).select("text").node() as SVGSVGElement).getBBox();
            return getBBox.height + dynamicDeviationSettings.labelFontSize * 0.4;
        })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("fill", dynamicDeviationSettings.backgroundColor)
        .attr("opacity", "0");

    if (!isBothLabelDisplayType) {
        dataLabelRect
            .attr("fill-opacity", `${100 - dynamicDeviationSettings.backgroundColorTransparency}% `)
            .attr("opacity", dynamicDeviationSettings.isShowLabelBackground ? "1" : "0");
    }

    dataLabelText.attr("transform", function () {
        const bBox = (d3Select(this.parentNode).select("rect").node() as SVGSVGElement).getBBox();
        return `translate(${bBox.width / 2},
      ${isBothLabelDisplayType
                ? dynamicDeviationSettings.labelFontSize * 0.4
                : bBox.height - 1.5 - dynamicDeviationSettings.labelFontSize * 0.4
            })`;
    });

    if (dynamicDeviationSettings.isShowLabelBorder && !isBothLabelDisplayType) {
        dataLabelBorderText.attr("transform", function () {
            const bBox = (d3Select(this.parentNode).select("rect").node() as SVGSVGElement).getBBox();
            return `translate(${bBox.width / 2},
      ${bBox.height - 1.5 - dynamicDeviationSettings.labelFontSize * 0.4})`;
        });
    }

    if (self.isHorizontalChart) {
        RenderHorizontalDynamicDeviationLines(self, from, to, dataLabelG);
    } else {
        RenderVerticalDynamicDeviationLines(self, from, to, dataLabelG);
    }

    self.normalBarG
        .selectAll(".bar")
        .style("border-color", (d) => self.getBarBorderColor(d.styles?.bar?.fillColor, d.pattern))
        .style("border-width", (d) => self.getBarBorderWidth(d.pattern) + "px");

    if (dynamicDeviationSettings.isBarBorderEnabled) {
        self.normalBarG
            .select(`#bar${self.getTrimmedString(from.category)} `)
            .style("border-color", dynamicDeviationSettings.connectingLineColor)
            .style("border-width", dynamicDeviationSettings.connectingLineWidth + "px");

        self.normalBarG
            .select(`#bar${self.getTrimmedString(to.category)} `)
            .style("border-color", dynamicDeviationSettings.connectingLineColor)
            .style("border-width", dynamicDeviationSettings.connectingLineWidth + "px");
    }
}

export const RemoveDynamicDeviation = (self: Visual): void => {
    self.dynamicDeviationG.selectAll("*").remove();
}

export const RenderHorizontalDynamicDeviationLines = (self: Visual, from: ICategoryValuePair, to: ICategoryValuePair, dataLabelG: D3Selection<SVGElement>): void => {
    const dynamicDeviationSettings = self.dynamicDeviationSettings;
    const dataLabelBBox = (dataLabelG.node() as SVGSVGElement).getBBox();
    const labelToConnectorDistance = 10;
    const start = dataLabelBBox.height + labelToConnectorDistance;
    const isPositiveDeviation = from.value < to.value;

    dataLabelG.attr(
        "transform",
        `translate(${(self.xScale(from.value) + self.xScale(to.value)) / 2 - dataLabelBBox.width / 2}, ${0})`
    );

    self.dynamicDeviationG
        .append("line")
        .attr("class", "connecting-line-1")
        .attr("x1", self.xScale(from.value))
        .attr("x2", self.xScale(from.value))
        .attr("y1", start)
        .attr("y2", self.yScale(from.category) ?? 0)
        .attr("stroke", self.dynamicDeviationSettings.connectingLineColor)
        .attr("stroke-width", self.dynamicDeviationSettings.connectingLineWidth);

    self.dynamicDeviationG
        .append("line")
        .attr("class", "connecting-line-2")
        .attr("x1", self.xScale(to.value))
        .attr("x2", self.xScale(to.value))
        .attr("y1", start)
        .attr("y2", self.yScale(to.category) ?? 0)
        .attr("stroke", self.dynamicDeviationSettings.connectingLineColor)
        .attr("stroke-width", self.dynamicDeviationSettings.connectingLineWidth);

    if (dynamicDeviationSettings.isShowStartIndicator) {
        self.dynamicDeviationG
            .append("circle")
            .attr("class", "connecting-circle-1")
            .attr("r", dynamicDeviationSettings.connectingLineWidth * 1.25)
            .attr("transform", `translate(${self.xScale(from.value) ?? 0}, ${self.yScale(from.category) ?? 0})`)
            .attr("fill", dynamicDeviationSettings.connectingLineColor)
            .attr("stroke", "rgb(102,102,102)")
            .attr("stroke-width", "1px")
            .attr("opacity", self.xScale(from.value) && self.yScale(from.category) ? 1 : 0);

        self.dynamicDeviationG
            .append("circle")
            .attr("class", "connecting-circle-2")
            .attr("r", dynamicDeviationSettings.connectingLineWidth * 1.25)
            .attr("transform", `translate(${self.xScale(to.value) ?? 0}, ${self.yScale(to.category) ?? 0})`)
            .attr("fill", dynamicDeviationSettings.connectingLineColor)
            .attr("stroke", "rgb(102,102,102)")
            .attr("stroke-width", "1px")
            .attr("opacity", self.xScale(to.value) && self.yScale(to.category) ? 1 : 0);
    }

    const connectorFill = isPositiveDeviation ? "rgb(142, 185, 0)" : "rgb(255, 0, 10)";

    const connectorLine = self.dynamicDeviationG
        .append("line")
        .attr("class", "connector")
        .attr("y1", start)
        .attr("y2", start)
        .attr("stroke", connectorFill)
        .attr("stroke-width", self.dynamicDeviationSettings.connectorWidth);

    if (isPositiveDeviation) {
        connectorLine
            .attr("x1", self.xScale(from.value) - dynamicDeviationSettings.connectingLineWidth / 2)
            .attr("x2", self.xScale(to.value) + dynamicDeviationSettings.connectingLineWidth / 2);
    } else {
        connectorLine
            .attr("x1", self.xScale(from.value) + dynamicDeviationSettings.connectingLineWidth / 2)
            .attr("x2", self.xScale(to.value) - dynamicDeviationSettings.connectingLineWidth / 2);
    }

    if (dynamicDeviationSettings.connectorType === EDynamicDeviationConnectingLineTypes.Arrow) {
        const drawLeftArrow = () => {
            const w = self.dynamicDeviationSettings.connectorWidth;
            self.dynamicDeviationG
                .append("polygon")
                .attr("class", "arrow-down")
                .attr("points", `${(w * 3) / 2} ${w}, ${w * 3} ${w * 3}, ${0} ${w * 3} `)
                .attr("transform", `translate(${self.xScale(to.value) - w}, ${start + (w * 3) / 2}) rotate(270)`)
                .attr("fill", connectorFill);
            connectorLine
                .attr("x1", self.xScale(from.value) + dynamicDeviationSettings.connectingLineWidth / 2)
                .attr("x2", self.xScale(to.value) + dynamicDeviationSettings.connectingLineWidth / 2 + w);
        };

        const drawRightArrow = () => {
            const w = self.dynamicDeviationSettings.connectorWidth;
            self.dynamicDeviationG
                .append("polygon")
                .attr("class", "arrow-up")
                .attr("points", `${(w * 3) / 2} ${w}, ${w * 3} ${w * 3}, ${0} ${w * 3} `)
                .attr("transform", `translate(${self.xScale(to.value) + w}, ${start - (w * 3) / 2}) rotate(90)`)
                .attr("fill", connectorFill);
            connectorLine
                .attr("x1", self.xScale(from.value) - dynamicDeviationSettings.connectingLineWidth / 2)
                .attr("x2", self.xScale(to.value) - w);
        };

        if ((isPositiveDeviation && self.isLeftYAxis) || (!isPositiveDeviation && !self.isLeftYAxis)) {
            drawRightArrow();
        } else {
            drawLeftArrow();
        }
    }

    if (dynamicDeviationSettings.connectorType === EDynamicDeviationConnectingLineTypes.Dots) {
        self.dynamicDeviationG
            .append("circle")
            .attr("class", "circle-1")
            .attr("r", dynamicDeviationSettings.connectorWidth * 0.7)
            .attr("transform", `translate(${self.xScale(from.value)}, ${start})`)
            .attr("fill", connectorFill)
            .attr("stroke", "rgb(102,102,102)")
            .attr("stroke-width", dynamicDeviationSettings.connectingLineWidth + "px");

        self.dynamicDeviationG
            .append("circle")
            .attr("class", "circle-2")
            .attr("r", dynamicDeviationSettings.connectorWidth * 0.7)
            .attr("transform", `translate(${self.xScale(to.value)}, ${start})`)
            .attr("fill", connectorFill)
            .attr("stroke", "rgb(102,102,102)")
            .attr("stroke-width", dynamicDeviationSettings.connectingLineWidth + "px");
    }
}

export const RenderVerticalDynamicDeviationLines = (self: Visual, from: ICategoryValuePair, to: ICategoryValuePair, dataLabelG: D3Selection<SVGElement>): void => {
    const dynamicDeviationSettings = self.dynamicDeviationSettings;
    const dataLabelBBox = (dataLabelG.node() as SVGSVGElement).getBBox();
    const labelToConnectorDistance = 10;
    const end = self.xScaleWidth - dataLabelBBox.width - labelToConnectorDistance;
    const isPositiveDeviation = from.value < to.value;

    dataLabelG.attr(
        "transform",
        `translate(${self.xScaleWidth - dataLabelBBox.width}, ${(self.yScale(from.value) + self.yScale(to.value)) / 2 - dataLabelBBox.height / 2
        })`
    );

    self.dynamicDeviationG
        .append("line")
        .attr("class", "connecting-line-1")
        .attr("x1", self.xScale(from.category) ?? 0)
        .attr("x2", end)
        .attr("y1", self.yScale(from.value))
        .attr("y2", self.yScale(from.value))
        .attr("stroke", self.dynamicDeviationSettings.connectingLineColor)
        .attr("stroke-width", self.dynamicDeviationSettings.connectingLineWidth);

    self.dynamicDeviationG
        .append("line")
        .attr("class", "connecting-line-2")
        .attr("x1", self.xScale(to.category) ?? 0)
        .attr("x2", end)
        .attr("y1", self.yScale(to.value))
        .attr("y2", self.yScale(to.value))
        .attr("stroke", self.dynamicDeviationSettings.connectingLineColor)
        .attr("stroke-width", self.dynamicDeviationSettings.connectingLineWidth);

    if (dynamicDeviationSettings.isShowStartIndicator) {
        self.dynamicDeviationG
            .append("circle")
            .attr("class", "connecting-circle-1")
            .attr("r", dynamicDeviationSettings.connectingLineWidth * 1.25)
            .attr("transform", `translate(${self.xScale(from.category) ?? 0}, ${self.yScale(from.value) ?? 0})`)
            .attr("fill", dynamicDeviationSettings.connectingLineColor)
            .attr("stroke", "rgb(102,102,102)")
            .attr("stroke-width", "1px")
            .attr("opacity", self.xScale(from.category) && self.yScale(from.value) ? 1 : 0);

        self.dynamicDeviationG
            .append("circle")
            .attr("class", "connecting-circle-2")
            .attr("r", dynamicDeviationSettings.connectingLineWidth * 1.25)
            .attr("transform", `translate(${self.xScale(to.category) ?? 0}, ${self.yScale(to.value) ?? 0})`)
            .attr("fill", dynamicDeviationSettings.connectingLineColor)
            .attr("stroke", "rgb(102,102,102)")
            .attr("stroke-width", "1px")
            .attr("opacity", self.xScale(to.category) && self.yScale(to.value) ? 1 : 0);
    }

    const connectorFill = isPositiveDeviation ? "rgb(142, 185, 0)" : "rgb(255, 0, 10)";

    const connectorLine = self.dynamicDeviationG
        .append("line")
        .attr("class", "connector")
        .attr("x1", end)
        .attr("x2", end)
        .attr("stroke", connectorFill)
        .attr("stroke-width", self.dynamicDeviationSettings.connectorWidth);

    if (isPositiveDeviation) {
        connectorLine
            .attr("y1", self.yScale(from.value) + dynamicDeviationSettings.connectingLineWidth / 2)
            .attr("y2", self.yScale(to.value) - dynamicDeviationSettings.connectingLineWidth / 2);
    } else {
        connectorLine
            .attr("y1", self.yScale(from.value) - dynamicDeviationSettings.connectingLineWidth / 2)
            .attr("y2", self.yScale(to.value) + dynamicDeviationSettings.connectingLineWidth / 2);
    }

    if (dynamicDeviationSettings.connectorType === EDynamicDeviationConnectingLineTypes.Arrow) {
        const drawUpArrow = () => {
            const w = self.dynamicDeviationSettings.connectorWidth;
            self.dynamicDeviationG
                .append("polygon")
                .attr("class", "arrow-up")
                .attr("points", `${(w * 3) / 2} ${w}, ${w * 3} ${w * 3}, ${0} ${w * 3} `)
                .attr("transform", `translate(${end - (w * 3) / 2}, ${self.yScale(to.value) - w})`)
                .attr("fill", connectorFill);
            connectorLine
                .attr("y1", self.yScale(from.value) + dynamicDeviationSettings.connectingLineWidth / 2)
                .attr("y2", self.yScale(to.value) + w * 2);
        };

        const drawDownArrow = () => {
            const w = self.dynamicDeviationSettings.connectorWidth;
            self.dynamicDeviationG
                .append("polygon")
                .attr("class", "arrow-down")
                .attr("points", `${(w * 3) / 2} ${w}, ${w * 3} ${w * 3}, ${0} ${w * 3} `)
                .attr("transform", `translate(${end + (w * 3) / 2}, ${self.yScale(to.value) + w}) rotate(180)`)
                .attr("fill", connectorFill);
            connectorLine
                .attr("y1", self.yScale(from.value) - dynamicDeviationSettings.connectingLineWidth / 2)
                .attr("y2", self.yScale(to.value) + dynamicDeviationSettings.connectingLineWidth / 2 - w * 2);
        };

        if ((isPositiveDeviation && self.isBottomXAxis) || (!isPositiveDeviation && !self.isBottomXAxis)) {
            drawUpArrow();
        } else {
            drawDownArrow();
        }
    }

    if (dynamicDeviationSettings.connectorType === EDynamicDeviationConnectingLineTypes.Dots) {
        self.dynamicDeviationG
            .append("circle")
            .attr("class", "circle-1")
            .attr("r", dynamicDeviationSettings.connectorWidth * 0.7)
            .attr("transform", `translate(${end}, ${self.yScale(from.value)})`)
            .attr("fill", connectorFill)
            .attr("stroke", "rgb(102,102,102)")
            .attr("stroke-width", "1px");

        self.dynamicDeviationG
            .append("circle")
            .attr("class", "circle-2")
            .attr("r", dynamicDeviationSettings.connectorWidth * 0.7)
            .attr("transform", `translate(${end}, ${self.yScale(to.value)})`)
            .attr("fill", connectorFill)
            .attr("stroke", "rgb(102,102,102)")
            .attr("stroke-width", "1px");
    }
}

export const RenderDynamicDeviationIcon = (self: Visual): void => {
    d3Select(".dynamic-deviation-button").remove();

    const button = create("button").attr("class", "dynamic-deviation-button tooltip");

    const img = create("img").attr("class", "dynamic-deviation-button-img").attr("src", DynamicDeviationIcon);

    button.node().appendChild(img.node());

    button.on("mouseover", (e) => {
        ShowStaticTooltip(self, e, "Dynamic Deviation");
    });

    button.on("mouseout", () => {
        HideStaticTooltip(self);
    });

    button.on("click", (e) => {
        const buttonNode = button.node();
        buttonNode.classList.toggle("selected");
        if (buttonNode.classList.contains("selected")) {
            self.isDynamicDeviationButtonSelected = true;
            RemoveDynamicDeviation(this);
            self.fromCategoryValueDataPair = undefined;
            self.toCategoryValueDataPair = undefined;
            self.normalBarG
                .selectAll(".bar")
                .style("cursor", "cell")
                .style("border-color", (d) => self.getBarBorderColor(d.styles?.bar?.fillColor, d.pattern))
                .style("border-width", (d) => self.getBarBorderWidth(d.pattern) + "px");
            self.isDeviationCreatedAfterButtonClicked = false;
        } else {
            self.normalBarG.selectAll(".bar").style("cursor", "auto");
        }
    });

    self.hostContainer.querySelector(".icons-bar #general-icons-wrapper").prepend(button.node());
}

export const SetDynamicDeviationDataAndDrawLines = (self: Visual): void => {
    const dynamicDeviationSettings = self.dynamicDeviationSettings;
    const chartDataLength = self.chartData.length;

    switch (dynamicDeviationSettings.displayType) {
        case EDynamicDeviationDisplayTypes.Auto:
            {
                const from = self.chartData[chartDataLength - 2];
                const to = self.chartData[chartDataLength - 1];
                RenderDynamicDeviation(
                    self,
                    { category: from.category, value: from.value },
                    { category: to.category, value: to.value }
                );
            }
            break;
        case EDynamicDeviationDisplayTypes.CreateYourOwn:
            {
                if (
                    self.lastDynamicDeviationSettings?.displayType !== EDynamicDeviationDisplayTypes.CreateYourOwn ||
                    self.isDynamicDeviationButtonSelected
                ) {
                    RemoveDynamicDeviation(self);
                    self.fromCategoryValueDataPair = undefined;
                    self.toCategoryValueDataPair = undefined;
                    self.normalBarG
                        .selectAll(".bar")
                        .style("cursor", "cell")
                        .style("border-color", (d) => self.getBarBorderColor(d.styles?.bar?.fillColor, d.pattern))
                        .style("border-width", (d) => self.getBarBorderWidth(d.pattern) + "px");
                }

                if (self.fromCategoryValueDataPair && self.toCategoryValueDataPair) {
                    RenderDynamicDeviation(self, self.fromCategoryValueDataPair, self.toCategoryValueDataPair);
                }
            }
            break;
        case EDynamicDeviationDisplayTypes.CustomRange:
            {
                const chartData = self.isHorizontalChart ? self.chartData.reverse() : self.chartData;
                const fromIndex =
                    dynamicDeviationSettings.fromIndex <= chartDataLength
                        ? dynamicDeviationSettings.fromIndex - 1
                        : chartDataLength - 1;
                const toIndex =
                    dynamicDeviationSettings.toIndex <= chartDataLength
                        ? dynamicDeviationSettings.toIndex - 1
                        : chartDataLength - 1;
                const from = chartData[fromIndex];
                const to = chartData[toIndex];
                RenderDynamicDeviation(
                    this,
                    { category: from.category, value: from.value },
                    { category: to.category, value: to.value }
                );
            }
            break;
        case EDynamicDeviationDisplayTypes.FirstToLast:
            {
                const from = self.chartData[0];
                const to = self.chartData[chartDataLength - 1];
                RenderDynamicDeviation(
                    self,
                    { category: from.category, value: from.value },
                    { category: to.category, value: to.value }
                );
            }
            break;
        case EDynamicDeviationDisplayTypes.LastToFirst:
            {
                const from = self.chartData[chartDataLength - 1];
                const to = self.chartData[0];
                RenderDynamicDeviation(
                    self,
                    { category: from.category, value: from.value },
                    { category: to.category, value: to.value }
                );
            }
            break;
        case EDynamicDeviationDisplayTypes.FirstToLastActual:
            {
                RenderDynamicDeviation(self, self.firstCategoryValueDataPair, self.lastCategoryValueDataPair);
            }
            break;
        case EDynamicDeviationDisplayTypes.LastToFirstActual:
            {
                RenderDynamicDeviation(self, self.lastCategoryValueDataPair, self.firstCategoryValueDataPair);
            }
            break;
        case EDynamicDeviationDisplayTypes.MinToMax:
            {
                RenderDynamicDeviation(self, self.minCategoryValueDataPair, self.maxCategoryValueDataPair);
            }
            break;
    }
}