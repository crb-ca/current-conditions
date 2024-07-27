import {useEffect, useState} from 'react'

import './App.scss';

import {Grid} from "@mui/material";

import Box from "@mui/material/Box";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import {H3} from './components/typographies';
import {DataCard} from "./components/DataCard";
import SnowpackChart from "./components/SnowpackChart";
import TabPanel from "./components/TabPanel";
import OperationsPanel from "./components/OperationsPanel";
import ReservoirStoragePanel from "./components/ReservoirStoragePanel";
import axios from "axios";
import moment from "moment";
import Navbar from "./components/Navbar";

import {reservoirs} from './objects';

// APIs & data sources

const RISEAPI = axios.create({
    baseURL: "https://data.usbr.gov/rise/api/",
    headers: {accept: "application/vnd.api+json"}
})

const objToArrayString = (obj) => {
    return Object.keys(obj).reduce((arr, k) => {
        return [...arr, k, obj[k]];
    }, []).join('.')
}

const theme = createTheme({
    palette: {
        primary: {
            main: '#A15801', // Replace with your desired color
        },
        secondary: {
            main: '#4caf50', // Replace with your desired color
        },
    },
});

const today = moment();
const todayStr = today.format('YYYY-MM-DD');
const tomorrow = today.clone().add(1, 'day');
const tomorrowStr = tomorrow.format('YYYY-MM-DD');

const localStorageKey = 'data';

const getCurrentData = () => {
    const currentStr = localStorage.getItem(localStorageKey) || '{}';
    const current = JSON.parse(currentStr);
    if (current.expiry && current.expiry <= todayStr) {
        localStorage.removeItem(localStorageKey);
        return {}
    } else {
        return current.data || {};
    }
}

let currentData = getCurrentData();

const updateLocalStorage = (obj) => {
    const _currentData = getCurrentData();
    currentData = {
        ..._currentData,
        ...obj
    }
    localStorage.setItem(localStorageKey, JSON.stringify({
        data: currentData,
        expiry: tomorrowStr
    }));
}

function App() {

    const [tabValue, setTabValue] = useState(1);
    const [storageConditions, setStorageConditions] = useState(currentData.storageConditions || {});
    const [storageError, setStorageError] = useState(false);
    const [systemConditions, setSystemConditions] = useState(currentData.systemConditions || {
        storage: 0,
        storage30: 0,
        storage365: 0,
    });

    // initializations
    useEffect(() => {

        if (currentData.storageConditions && currentData.systemConditions) {
            return;
        }
        // see api documentation at https://data.usbr.gov/rise-api
        // Example API call to download all in jsom format:
        // https://data.usbr.gov/rise/api/result/downloadall?query[]=itemId.6124.before.2024-07-18.after.2023-07-18.order.ASC&type=json&filename=RISE%20Time%20Series%20Query%20Package%20(2024-07-25)&order=ASC
        const itemIds = reservoirs.filter(r => r.rise?.storage).map(r => r.rise.storage);
        const oneWeekAgo = moment().subtract(1, 'week');
        const oneYearPrior = oneWeekAgo.clone().subtract(1, 'year');
        const baseQueryParams = {
            before: oneWeekAgo.format('YYYY-MM-DD'),
            after: oneYearPrior.format('YYYY-MM-DD'),
            order: 'ASC',
        }
        const query = itemIds.map(itemId => {
            return objToArrayString({itemId, ...baseQueryParams});
        });

        const params = {query, type: 'json', order: 'ASC'}
        console.log(params);
        RISEAPI.get('result/downloadall', {params}).then(({data}) => {
            let _systemStorage = 0;
            const _storageConditions = {};
            reservoirs.forEach(r => {
                const rData = data.find(d => d.Location.Name.toUpperCase().includes(r.name.toUpperCase()));
                if (!rData) {
                    return;
                }
                const i0 = '365';
                const i30 = '335';
                const i365 = '0';
                const s0 = rData[i0].result / 1e6;
                if (r.system) {
                    _systemStorage += s0
                }
                _storageConditions[r.name] =
                    {
                        time: rData[i0].dateTime,
                        storage: s0,
                        storage30: rData[i30].result / 1e6,
                        storage365: rData[i365].result / 1e6,
                    }
            });
            const _systemConditions = {
                ...systemConditions,
                storage: _systemStorage,
            }
            setSystemConditions(_systemConditions);
            updateLocalStorage({systemConditions: _systemConditions});
            setStorageConditions(_storageConditions);
            updateLocalStorage({storageConditions: _storageConditions});
        }).catch(reason => {
            console.log(reason);
            setStorageError(true);
        })
    }, []);


    const handleChangeTab = (e, v) => setTabValue(Number(v));

    return (
        <ThemeProvider theme={theme}>

            <div>

                <Navbar/>

                <Grid id="main-grid" container columns={12} spacing={2}>

                    <Grid id="outer-column" item xs={0} md={0} lg={1}/>

                    <Grid id="inner-column" item xs={12} md={12} lg={10}>
                        <div>
                            <Box style={{marginLeft: 20, marginRight: 20}}>
                                <Tabs value={tabValue} onChange={handleChangeTab} aria-label="main dashboard tabs">
                                    <Tab label="Storage" value={1}/>
                                    <Tab label="Hydrology" value={2}/>
                                    <Tab label="Operations" value={3}/>
                                </Tabs>
                            </Box>

                            <TabPanel index={1} value={tabValue}>
                                <ReservoirStoragePanel
                                    storageConditions={storageConditions}
                                    systemConditions={systemConditions}
                                    storageError={storageError}
                                />
                            </TabPanel>

                            <TabPanel index={2} value={tabValue}>
                                <DataCard>
                                    <H3>Snow Accumulation</H3>
                                    <SnowpackChart title={"Snowpack - Upper Colorado"} regionTitle="14_Upper_Colorado_Region"/>
                                    <SnowpackChart title={"Snowpack - Lower Colorado"} regionTitle="15_Lower_Colorado_Region"/>
                                </DataCard>
                            </TabPanel>

                            <TabPanel index={3} value={tabValue}>
                                <OperationsPanel/>
                            </TabPanel>
                        </div>

                    </Grid>

                </Grid>

            </div>
        </ThemeProvider>

    )
}

export default App
