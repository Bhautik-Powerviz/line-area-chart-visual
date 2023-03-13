import { Visual } from "../visual";
import { create, select as d3Select } from "d3-selection";
import { BarType, LassoSelectionMode } from "../enum";
import { BehaviorOptions } from "./Behaviour.methods";
import LassoIcon from "../../assets/icons/lasso.svg";
import ReverseLassoIcon from "../../assets/icons/reverse-lasso.svg";
import { GetStackedBarHeight, GetStackedBarWidth } from "./StackedBar.methods";

export const RenderLassoButton = (self: Visual): void => {
    d3Select(".lasso-button").remove();
    const button = create("button").attr("class", "lasso-button lasso-handler tooltip");
    const img = create("img").attr("class", "lasso-button-img").attr("src", LassoIcon);
    button.node().appendChild(img.node());

    button.on("mouseover", (e) => {
        ShowStaticTooltip(self, e, "Lasso");
    });

    button.on("mouseout", () => {
        HideStaticTooltip(self);
    });

    button.on("click", (e) => {
        const buttonNode = button.node();
        self.reverseLassoButton.classed("selected", false);
        buttonNode.classList.toggle("selected");
        if (buttonNode.classList.contains("selected")) {
            self.isLassoEnabled = true;
            document.querySelector(".visual .lassoselector").classList.add("visible");
        } else {
            self.isLassoEnabled = false;
            self.interactivityService.clearSelection();
            // this.setAndBindChartBehaviorOptions(this.normalBarG, this.stackedBarG, this.groupedBarG);
            document.querySelector(".visual .lassoselector").classList.remove("visible");
        }
        self.lassoSelectionMode = buttonNode.classList.contains("selected")
            ? LassoSelectionMode.Rectangular
            : LassoSelectionMode.ReverseRectangular;
    });

    self.lassoButton = button;
    self.hostContainer.querySelector(".icons-bar #general-icons-wrapper").prepend(button.node());
}

export const RenderReverseLassoButton = (self: Visual): void => {
    d3Select(".reverse-lasso-button").remove();
    const button = create("button").attr("class", "reverse-lasso-button lasso-handler tooltip");
    const img = create("img").attr("class", "reverse-lasso-button-img").attr("src", ReverseLassoIcon);
    button.node().appendChild(img.node());

    button.on("mouseover", (self: Visual, e) => {
        ShowStaticTooltip(self, e, "Reverse Lasso");
    });

    button.on("mouseout", (self: Visual) => {
        HideStaticTooltip(self);
    });

    button.on("click", (e) => {
        const buttonNode = button.node();
        self.lassoButton.classed("selected", false);
        buttonNode.classList.toggle("selected");
        if (buttonNode.classList.contains("selected")) {
            self.isLassoEnabled = true;
            document.querySelector(".visual .lassoselector").classList.add("visible");
        } else {
            self.isLassoEnabled = false;
            self.interactivityService.clearSelection();
            // this.setAndBindChartBehaviorOptions(this.normalBarG, this.stackedBarG, this.groupedBarG);
            document.querySelector(".visual .lassoselector").classList.remove("visible");
        }

        self.lassoSelectionMode = buttonNode.classList.contains("selected")
            ? LassoSelectionMode.ReverseRectangular
            : LassoSelectionMode.Rectangular;
    });

    self.reverseLassoButton = button;
    self.hostContainer.querySelector(".icons-bar #general-icons-wrapper").prepend(button.node());
}

export const InitiateRectangularLasso = (self: Visual): void => {
    const canvasNode = self.lassoCanvas.node();
    const ctx = canvasNode.getContext("2d");

    let rect: any = {};
    let drag = false;

    self.lassoCanvas.on("mousedown", mouseDown);
    self.lassoCanvas.on("mouseup", () => mouseUp());
    self.lassoCanvas.on("mousemove", mouseMove);

    function mouseDown(e: MouseEvent): void {
        rect.startX = e.pageX - this.getBoundingClientRect().x;
        rect.startY = e.pageY - this.getBoundingClientRect().y;
        rect.startX = rect.startX / self.lassoCanvasScale;
        rect.startY = rect.startY / self.lassoCanvasScale;
        drag = true;
    }

    const mouseUp = () => {
        drag = false;
        if (Object.keys(rect).length !== 4) return;
        const { startX: x, startY: y, w, h } = rect;

        const X1 = x;
        const Y1 = y;
        const X2 = x + w;
        const Y2 = y + h;

        const selectedDataPoints: any[] = [];

        const checkIsBarWithinLassoArea = (barX1: number, barX2: number, barY1: number, barY2: number): boolean => {
            if (
                ((barX1 > X1 && barX1 < X2) ||
                    (barX1 > X1 && barX2 < X2) ||
                    (barX1 < X1 && barX2 > X2) ||
                    (barX2 > X1 && barX2 < X2)) &&
                ((barY1 < Y2 && barY2 > Y2) ||
                    (barY1 < Y1 && barY2 > Y2) ||
                    (barY1 > Y1 && barY2 > Y2 && barY1 < Y2) ||
                    (barY2 > Y1 && barY2 < Y2 && barY1 < Y1 && barY1 < Y2))
            ) {
                return true;
            }
            return false;
        };

        const setBarWithinLassoArea = (barElement: any, data: any): boolean | undefined => {
            const barBoundingClientRect = barElement?.node()?.getBoundingClientRect();
            if (!barBoundingClientRect) {
                return false;
            }

            const barX1 = barBoundingClientRect.x;
            const barY1 = barBoundingClientRect.y;
            const barX2 = barX1 + barBoundingClientRect.width;
            const barY2 = barY1 + barBoundingClientRect.height;

            const isBarWithinLassoArea = checkIsBarWithinLassoArea(barX1, barX2, barY1, barY2);
            if (self.lassoSelectionMode === LassoSelectionMode.Rectangular) {
                if (isBarWithinLassoArea) {
                    selectedDataPoints.push(data);
                }
            } else {
                if (!isBarWithinLassoArea) {
                    selectedDataPoints.push(data);
                }
            }
        };

        const getIsStackedBarWithinLassoArea = (barElement: any, d: any): boolean => {
            const barBoundingClientRect = barElement?.node()?.getBoundingClientRect();
            if (!barBoundingClientRect) {
                return false;
            }

            const barX1 = self.isHorizontalChart
                ? barBoundingClientRect.x + barBoundingClientRect.width - GetStackedBarWidth(self, d)
                : barBoundingClientRect.x;
            const barY1 = barBoundingClientRect.y;
            const barX2 = barX1 + (self.isHorizontalChart ? GetStackedBarWidth(self, d) : barBoundingClientRect.width);
            const barY2 = barY1 + (self.isHorizontalChart ? barBoundingClientRect.height : GetStackedBarHeight(self, d));

            return checkIsBarWithinLassoArea(barX1, barX2, barY1, barY2);
        };

        if (self.chartSettings.barType === BarType.Normal) {
            self.normalBarG.selectAll(".bar").each(function () {
                const ele = d3Select(this);
                const data = ele.datum();
                setBarWithinLassoArea(ele, data);
            });
        }

        if (self.chartSettings.barType === BarType.Grouped) {
            self.groupedBarG.selectAll(".groupedBar").each(function () {
                const ele = d3Select(this);
                const data = ele.datum();
                setBarWithinLassoArea(ele, data);
            });
        }

        if (self.chartSettings.barType === BarType.Stacked || self.chartSettings.barType === BarType.GroupedStacked) {
            self.stackedBarG.selectAll(".bar").each(function () {
                const ele = d3Select(this);
                const data = ele.datum();
                setBarWithinLassoArea(ele, data);
            });
        }

        let barSelection;
        if (self.isNormalBarChart) {
            barSelection = self.normalBarG.selectAll(".bar");
        } else if (self.isGroupedBarChart) {
            barSelection = self.groupedBarG.selectAll(".groupedBar");
        } else if (self.isStackedBarChart || self.isGroupedStackedBar) {
            barSelection = self.stackedBarG.selectAll(".bar");
        }

        self.interactivityService.clearSelection();
        const onBarClick = (barElement) => {
            self.handleCreateOwnDynamicDeviationOnBarClick(barElement);
        }

        if (self.interactivityService) {
            const behaviorOptions: BehaviorOptions = {
                selection: barSelection,
                clearCatcher: self.container,
                interactivityService: self.interactivityService,
                dataPoints: selectedDataPoints,
                behavior: self.behavior,
                isLassoEnabled: true,
                isClearPreviousSelection: true,
                onBarClick: onBarClick
            };
            self.interactivityService.bind(behaviorOptions);
        }

        ctx.clearRect(0, 0, canvasNode.width, canvasNode.height);
        rect = {};
    };

    function mouseMove(e: MouseEvent): void {
        if (!Object.keys(rect).length) return;
        if (drag) {
            rect.w = (e.pageX - this.offsetLeft - this.getBoundingClientRect().x) / self.lassoCanvasScale - rect.startX;
            rect.h = (e.pageY - this.offsetTop - this.getBoundingClientRect().y) / self.lassoCanvasScale - rect.startY;
            ctx.clearRect(0, 0, self.lassoCanvas.node().width, self.lassoCanvas.node().height);
            draw();
        }
    }

    function draw(): void {
        ctx.setLineDash([6]);
        ctx.beginPath();
        ctx.fillStyle = "rgba(33, 150, 243,0.4)";
        ctx.fillRect(rect.startX, rect.startY, rect.w, rect.h);
        ctx.stroke();
    }
}

export const ShowAndHideLassoIcon = (self: Visual): void => {
    const SETTINGS: any = self.visualUpdateOptions.formatTab;
    self.lassoButton && SETTINGS.visualSetting.lasso
        ? self.lassoButton.classed("hidden", false)
        : self.lassoButton.classed("hidden", true);

    self.reverseLassoButton && SETTINGS.visualSetting.reverseLasso
        ? self.reverseLassoButton.classed("hidden", false)
        : self.reverseLassoButton.classed("hidden", true);

    if ((self.isLassoEnabled && !SETTINGS.visualSetting.lasso && self.lassoButton.classed("selected"))) {
        self.isLassoEnabled = false;
        self.lassoButton.classed("selected", false);
        self.interactivityService.clearSelection();
        document.querySelector(".visual .lassoselector").classList.remove("visible");
    }

    if ((self.isLassoEnabled && !SETTINGS.visualSetting.reverseLasso && self.reverseLassoButton.classed("selected"))) {
        self.isLassoEnabled = false;
        self.reverseLassoButton.classed("selected", false);
        self.interactivityService.clearSelection();
        document.querySelector(".visual .lassoselector").classList.remove("visible");
    }

    if (!SETTINGS.visualSetting.lasso || !SETTINGS.visualSetting.reverseLasso) {
        self.isLassoEnabled = false;
    }
}

export const ShowStaticTooltip = (self: Visual, event: MouseEvent, displayName: string): void => {
    self.visualHost.tooltipService.show({
        coordinates: [event["clientX"] - 10, event["clientY"]],
        isTouchEvent: false,
        dataItems: [
            {
                displayName: displayName,
                value: "",
            },
        ],
        identities: null,
    });
}

export const HideStaticTooltip = (self: Visual): void => {
    self.visualHost.tooltipService.hide({
        isTouchEvent: false,
        immediately: true,
    });
}