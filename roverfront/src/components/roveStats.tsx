import * as React from "react";
import * as highcharts from "highcharts";

import { RangeFinder, IRangeMeasurement, Firehose, IFirehoseData } from "src/modules/connections";

export default class RoverStats extends React.Component<{}, {}> {
    private container: HTMLDivElement | null;
    private chart: highcharts.ChartObject;

    private latestMeasurement: IRangeMeasurement;
    public latestFirehoseData: IFirehoseData;

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

        Firehose.globalHook.push((data) => {
            this.latestFirehoseData = data;
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
                    type: "spline"
                },
                yAxis: [
                    {
                        title: { text: "Range" },
                        min: 0,
                        max: 600
                    },
                    {
                        title: { text: "Acceleration" },
                        min: -15,
                        max: 15,
                        opposite: true
                    }
                ],
                series: [{
                    id: "rangeSeries",
                    name: "Range",
                    data: [],
                    yAxis: 0
                },
                {
                    id: "accelSeriesX",
                    name: "Acceleration X",
                    data: [],
                    yAxis: 1
                },
                {
                    id: "accelSeriesY",
                    name: "Acceleration Y",
                    data: [],
                    yAxis: 1
                }]
            });
        }

        this.syncChartWithProps();
    }

    private last(data: number[], count: number) {
        if (data.length <= count) {
            return data;
        }

        return data.slice(Math.max(data.length - count, 1))
    }


    private syncChartWithProps() {
        if (!this.chart) {
            return;
        }

        const chartElement = this.chart;

        const rangeSeries = chartElement.get("rangeSeries") as highcharts.SeriesObject;
        const accelSeriesX = chartElement.get("accelSeriesX") as highcharts.SeriesObject;
        const accelSeriesY = chartElement.get("accelSeriesY") as highcharts.SeriesObject;

        const count = 30;

        if (this.latestMeasurement) {
            const existingData = this.last(rangeSeries.data.map(d => d.y), count);
            rangeSeries.setData(existingData.concat([this.latestMeasurement.value]));
        }

        if (this.latestFirehoseData) {
            const existingDataX = this.last(accelSeriesX.data.map(d => d.y), count);
            const existingDataY = this.last(accelSeriesY.data.map(d => d.y), count);

            accelSeriesX.setData(existingDataX.concat([this.latestFirehoseData.accelerometer.x]));
            accelSeriesY.setData(existingDataY.concat([this.latestFirehoseData.accelerometer.y]));
        }

        chartElement.redraw();
        window.dispatchEvent(new Event('resize'));
    }

    public render() {
        return <div ref={container => this.container = container} />
    }
}