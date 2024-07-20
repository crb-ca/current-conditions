import {useEffect, useState} from "react";
// import axios from "axios";
import moment from "moment";

import * as d3 from 'd3';
import Plot from 'react-plotly.js';

const today = moment();
const todayStr = today.format(today.month() >= 10 ? '1999-' : '2000-' + 'MM-DD');
const todayLine = {
    name: 'Today',
    x: [todayStr],
    y: [0, 25],
    mode: 'lines',
    line: {
        color: 'black',
        width: 2,
        dash: 'dash',
    },
    opacity: 0.75
}

const stats = {
    "Max": {
        line: {
            color: 'blue',
            width: 1,
        },
    },
    "Median (POR)": {
        line: {
            dash: 'dash',
            color: 'green'
        }
    },
    "Median ('91-'20)": {
        line: {
            color: 'green',
        }
    },
    "Min": {
        line: {
            color: 'red',
            width: 1
        },
    }
}

const medianPeakSWETraceProps = {
    name: 'Median Peak SWE',
    type: 'scatter',
    mode: 'markers',
    marker: {
        color: 'red',
        symbol: 'x',
        size: 10
    }
}

// Plot layout
const layout = {
    // title: 'Snowpack Chart',
    xaxis: {
        title: 'Date',
        range: ['1999-10-01', '2000-09-30'],
        type: 'date',
        tickformat: '%b %-d',
        tick0: '1999-10-01',
        dtick: 'M1'
    },
    yaxis: {
        title: 'Snow Water Equivalent (in.)'
    },
    legend: {
        traceorder: 'reversed',
    },
    shapes: [
        {
            type: 'line',
            x0: todayStr,
            y0: todayLine.y[0],
            x1: todayStr,
            y1: todayLine.y[1],
            line: todayLine.line,
            opacity: todayLine.opacity,
        }
    ]
}

const SnowpackChart = () => {
    // const [data, setData] = useState({});
    // const [medianPeakSWE, setMedianPeakSWE] = useState({});
    const [traces, setTraces] = useState([]);
    useEffect(() => {
        d3.csv('https://nwcc-apps.sc.egov.usda.gov/awdb/basin-plots/POR/WTEQ/assocHUC2/14_Upper_Colorado_Region.csv')
            .then(data => {
                    const dates = data.map(d => (d.date >= '10-01' ? '1999-' : '2000-') + d.date);

                    // quantiles
                    const percentTraces = Object.keys(stats).map(stat => {
                        return (
                            {
                                name: stat,
                                x: dates,
                                y: data.map(d => d[stat]),
                                opacity: 0.33,
                                ...stats[stat]
                            }
                        )
                    });

                    // annual traces; note that we are only doing the last 3 years, since it's unclear how valuable previous years are
                    // TODO: double check that the data maps to water years correctly
                    const currentYear = data.columns.slice(-10)[0];
                    const currentYearData = data.filter(d => !!d[currentYear]);
                    const years = data.columns.slice(1, -9);
                    const annualTraces = years.toReversed().map((year, i) => {
                        const isCurrentYear = year === currentYear;
                        return ({
                            name: year,
                            x: isCurrentYear ? dates.slice(0, currentYearData.length) : dates,
                            y: isCurrentYear ? currentYearData.map(d => d[currentYear]) : data.map(d => d[year]),
                            type: 'scatter',
                            mode: 'lines',
                            line: {
                                width: i <= 1 ? 4 : 3,
                                color: isCurrentYear ? 'black' : i == 1 ? 'grey' : 'lightgrey'
                            },
                            visible: i <= 2,
                        })
                    })

                    // Median Peak SWE
                    const medianPeakSWEDatum = data.find(d => !!d[medianPeakSWETraceProps.name]);
                    const medianPeakSWETrace = {
                        x: ['2000-' + medianPeakSWEDatum.date],
                        y: [Number(medianPeakSWEDatum[medianPeakSWETraceProps.name])],
                        ...medianPeakSWETraceProps
                    }

                    setTraces([todayLine, ...percentTraces, ...annualTraces.toReversed(), medianPeakSWETrace]);
                }
            )
    }, []);
    return (
        <div>
            <Plot
                data={traces}
                layout={layout}
                style={{width: '100%'}}
            />
            <div>Source data: <a target="_blank"
                                 href="https://nwcc-apps.sc.egov.usda.gov/awdb/basin-plots/POR/WTEQ/assocHUC2/14_Upper_Colorado_Region.html">https://nwcc-apps.sc.egov.usda.gov/awdb/basin-plots/POR/WTEQ/assocHUC2/14_Upper_Colorado_Region.html</a>
            </div>
        </div>
    )
}

export default SnowpackChart;