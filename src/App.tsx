import {useEffect, useState} from 'react'

import './App.scss';

import {Box, Container, Grid, Tab, Tabs, createTheme, ThemeProvider} from "@mui/material";

import {H3} from './components/typographies';
import {DataCard} from "./components/DataCard";
import SnowpackChart from "./components/SnowpackChart";
import TabPanel from "./components/TabPanel";
import OperationsPanel from "./components/OperationsPanel";
import ReservoirStoragePanel from "./components/ReservoirStoragePanel";
import moment from "moment";
import Navbar from "./components/Navbar";
import {getDataFromLocalOrApi} from './utils';
import {reservoirs} from './objects';
import {MAX_SYSTEM_CAPACITY} from './constants';

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

function App() {

    const [tabValue, setTabValue] = useState(1);
    // const [storageConditions, setStorageConditions] = useState(currentData.storageConditions || {});
    const [storageConditions, setStorageConditions] = useState(null);
    const [storageError, setStorageError] = useState(false);
    const [systemConditions, setSystemConditions] = useState(null);

    // initializations
    useEffect(() => {

        if (storageConditions && systemConditions) {
            return;
        }
        // see api documentation at https://data.usbr.gov/rise-api
        // Example API call to download all in jsom format:
        // https://data.usbr.gov/rise/api/result/downloadall?query[]=itemId.6124.before.2024-07-18.after.2023-07-18.order.ASC&type=json&filename=RISE%20Time%20Series%20Query%20Package%20(2024-07-25)&order=ASC
        const itemIds = reservoirs.filter(r => r.rise?.storage).map(r => r.rise.storage);
        const after = moment().subtract(1.2, 'year').format('YYYY-MM-DD');
        const baseQueryParams = {after, order: 'DESC'}
        const query = itemIds.map(itemId => {
            return objToArrayString({itemId, ...baseQueryParams});
        });
        const params = {query, type: 'json', order: 'ASC'}
        getDataFromLocalOrApi("data", "https://data.usbr.gov/rise/api/result/downloadall", params).then(data => {
            let _systemStorage = 0;
            const _storageConditions = {};
            reservoirs.forEach(r => {
                const rData = data.find(d => d.Location.Name.toUpperCase().includes(r.name.toUpperCase()));
                if (!rData) {
                    return;
                }
                const {result: storage, dateTime: time} = rData[0];

                if (r.system) {
                    _systemStorage += storage / 1e6
                }
                _storageConditions[r.name] =
                    {
                        time,
                        storage: storage / 1e6,
                        storage30: rData[30].result / 1e6,
                        storage365: rData[365].result / 1e6,
                    }
            });
            const _systemConditions = {
                ...systemConditions,
                storage: _systemStorage,
                storagePercent: _systemStorage / MAX_SYSTEM_CAPACITY * 100,
            }
            setSystemConditions(_systemConditions);
            setStorageConditions(_storageConditions);
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

                <Container>

                    <Grid id="main-grid" container columns={12} spacing={2}>

                        <Grid id="" item xs={12} md={12} lg={10}>
                            <div>
                                <Box style={{marginLeft: 20, marginRight: 20}}>
                                    <Tabs value={tabValue} onChange={handleChangeTab} aria-label="main dashboard tabs">
                                        <Tab label="Storage" value={1}/>
                                        <Tab label="Operations" value={2}/>
                                        <Tab label="Hydrology" value={3}/>
                                        <Tab label="Flows" value={4}/>
                                    </Tabs>
                                </Box>

                                <TabPanel index={1} value={tabValue}>
                                    <ReservoirStoragePanel
                                        storageConditions={storageConditions}
                                        systemConditions={systemConditions}
                                        storageError={storageError}
                                    />
                                </TabPanel>

                                <TabPanel index={3} value={tabValue}>
                                    <DataCard>
                                        <H3>Snow Accumulation</H3>
                                        <SnowpackChart title={"Snowpack - Upper Colorado"}
                                                       regionTitle="14_Upper_Colorado_Region"/>
                                        <SnowpackChart title={"Snowpack - Lower Colorado"}
                                                       regionTitle="15_Lower_Colorado_Region"/>
                                    </DataCard>
                                </TabPanel>

                                <TabPanel index={2} value={tabValue}>
                                    <OperationsPanel/>
                                </TabPanel>
                            </div>

                        </Grid>

                    </Grid>

                </Container>

            </div>
        </ThemeProvider>

    )
}

export default App
