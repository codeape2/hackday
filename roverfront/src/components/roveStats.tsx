import * as React from "react";
import * as highcharts from "highcharts";
import { RangeFinder, IRangeMeasurement } from "src/modules/connections";

export default class RoverStats extends React.Component<{}, {}> {
    private container: HTMLDivElement | null;
    private chart: highcharts.ChartObject;

    private latestMeasurement: IRangeMeasurement;

    public componentWillUnmount() {
        if (this.chart) {
            this.chart.destroy();
        }
    }

    public componentDidUpdate() {
        this.syncChartWithProps();
    }

    public componentDidMount() {
        RangeFinder.globalHook.push((measurement) => {
            this.latestMeasurement = measurement;
            this.syncChartWithProps();
        });

        if (this.container) {
            this.chart = highcharts.chart(this.container, {
                credits: {
                    enabled: false
                },
                title: {
                    text: undefined
                },
                chart: {
                    type: "column"
                },
                series: [{
                    id: "rangeSeries",
                    name: "Range",
                    data: []
                }]
            });
        }

        this.syncChartWithProps();
    }


    private syncChartWithProps() {
        if (!this.chart) {
            return;
        }

        const chartElement = this.chart;



        const rangeSeries = chartElement.get("rangeSeries") as highcharts.SeriesObject;
        if (this.latestMeasurement) {
            rangeSeries.setData([this.latestMeasurement.value]);
        } else {
            rangeSeries.setData([0]);
        }

        chartElement.redraw();
        window.dispatchEvent(new Event('resize'));
    }

    public render() {
        return <div ref={container => this.container = container} />
    }
}