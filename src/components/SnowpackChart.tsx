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
        visible: 'legendonly'
    },
    "Median (POR)": {
        line: {
            dash: 'dash',
            color: 'green'
        },
        visible: 'legendonly'
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
        visible: 'legendonly'
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

const SnowpackChart = ({title, regionTitle}) => {
    // const [data, setData] = useState({});
    // const [medianPeakSWE, setMedianPeakSWE] = useState({});
    const [traces, setTraces] = useState([]);
    const dataSourceCsv = `https://nwcc-apps.sc.egov.usda.gov/awdb/basin-plots/POR/WTEQ/assocHUC2/${regionTitle}.csv`;
    useEffect(() => {
        d3.csv(dataSourceCsv)
            .then(data => {
                    const dates = data.map(d => (d.date >= '10-01' ? '1999-' : '2000-') + d.date);

                    // quantiles
                    const statValues = Object.keys(stats).reduce((obj, stat) => {
                        return {
                            ...obj,
                            [stat]: data.map(d => d[stat]),
                        }
                    }, {})
                    const percentTraces = Object.keys(stats).map(stat => {
                        return (
                            {
                                name: stat,
                                x: dates,
                                y: statValues[stat],
                                opacity: 0.33,
                                ...stats[stat]
                            }
                        )
                    });

                    // shaded area for historical range
                    const historicalRange = [
                        {
                            x: dates,
                            y: statValues['Min'], // Minimum values
                            type: 'scatter',
                            fill: 'tozeroy',
                            fillcolor: 'rgba(255, 0, 0, 0)',
                            line: {width: 0},
                            showlegend: false,
                        },
                        {
                            name: "Range",
                            x: dates,
                            y: statValues['Max'], // Maximum values
                            type: 'scatter',
                            fill: 'tonexty',
                            fillcolor: 'rgba(0, 0, 0, 0.1)',
                            line: {width: 0}
                        }
                    ];

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

                    setTraces([...historicalRange, todayLine, ...percentTraces, ...annualTraces.toReversed(), medianPeakSWETrace]);
                }
            )
    }, [dataSourceCsv]);
    const dataSourceHtml = `https://nwcc-apps.sc.egov.usda.gov/awdb/basin-plots/POR/WTEQ/assocHUC2/${regionTitle}.html`
    return (
        <div style={{width: "100%"}}>
            <Plot
                data={traces}
                layout={{...layout, title}}
                style={{width: '100%'}}
            />
            <div>Data source: <a target="_blank"
                                 href={dataSourceHtml}>{dataSourceHtml}</a>
            </div>
        </div>
    )
}

export default SnowpackChart;