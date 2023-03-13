import { select as d3Select, Selection } from "d3-selection";
import { IVisualCategoryData } from "../visual-data.model";
import { IBehaviorOptions, IInteractiveBehavior, IInteractivityService, ISelectionHandler } from "powerbi-visuals-utils-interactivityutils/lib/interactivityBaseService";
import { SelectableDataPoint } from "powerbi-visuals-utils-interactivityutils/lib/interactivitySelectionService";
import VisualAnnotations from "../annotations/VisualAnnotations";
type D3Selection<T extends d3.BaseType> = Selection<T, any, any, any>;

export interface BehaviorOptions extends IBehaviorOptions<IVisualCategoryData> {
    selection: any;
    clearCatcher: D3Selection<SVGElement>;
    interactivityService: IInteractivityService<SelectableDataPoint>;
    isLassoEnabled: boolean;
    isClearPreviousSelection: boolean;
    onBarClick: Function;
}

export class Behavior implements IInteractiveBehavior {
    private options: BehaviorOptions;
    private visualAnnotations: VisualAnnotations;

    public setVisualAnnotations(ref: VisualAnnotations): void {
        this.visualAnnotations = ref;
    }

    public bindEvents(options: BehaviorOptions, selectionHandler: ISelectionHandler): void {
        this.options = options;
        const self = this;
        const { selection, dataPoints, clearCatcher, isLassoEnabled, onBarClick } = options;
        selection.on("click", function (e) {
            const data: any = d3Select(this).datum();
            if (self.visualAnnotations.isAnnotationScreenActivated) {
                self.visualAnnotations.onAnnotationNodeClick(e);
            } else {
                onBarClick(this);
                selectionHandler.handleSelection(data, e.ctrlKey);
                e.stopPropagation();
            }
        });

        if (isLassoEnabled) {
            selectionHandler.handleSelection(dataPoints, false);
        }

        clearCatcher.on("click", () => {
            selectionHandler.handleClearSelection();
            this.renderSelection(false);
        });
    }

    public renderSelection(hasSelection: boolean): void {
        const { selection, dataPoints, isClearPreviousSelection } = this.options;
        const isHasHighlights = dataPoints.some((d) => d.isHighlight);

        selection?.style("opacity", (dataPoint: any) => {
            const { selected, isHighlight } = dataPoint;
            if (isHasHighlights) {
                return isHighlight ? 1 : 0.4;
            } else {
                return hasSelection ? (selected ? 1 : 0.4) : 1;
                // return !isClearPreviousSelection && hasSelection ? (selected ? 1 : 0.4) : 1;
            }
        });
    }
}