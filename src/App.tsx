import {useState} from 'react'

import './App.scss';

import {Grid} from "@mui/material";

import Box from "@mui/material/Box";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import {H1, H3} from './components/typographies';
import {DataCard} from "./components/DataCard";
import SnowpackChart from "./components/SnowpackChart";
import {TabContext, TabPanel} from "@mui/lab";
import OperationsPanel from "./components/OperationsPanel";
import ReservoirStoragePanel from "./components/ReservoirStoragePanel";

function App() {

    const [tabValue, setTabValue] = useState("1");

    return (
        <div>

            <H1>Colorado River conditions</H1>

            <Grid container columns={12} spacing={2}>

                <Grid item xs={0} md={0} lg={1}/>

                <Grid item xs={12} md={12} lg={10}>
                    <TabContext value={tabValue}>
                        <Box>
                            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} aria-label="basic tabs example">
                                <Tab label="Reservoir Storage" value="1"/>
                                <Tab label="Hydrology" value="2"/>
                                <Tab label="Operations" value="3"/>
                            </Tabs>
                        </Box>

                        <TabPanel value="1">
                            <ReservoirStoragePanel/>
                        </TabPanel>

                        <TabPanel value="2">
                            <DataCard>
                                <H3>Snow accumulation</H3>
                                <SnowpackChart/>
                            </DataCard>
                        </TabPanel>

                        <TabPanel value="3">
                            <OperationsPanel/>
                        </TabPanel>
                    </TabContext>

                </Grid>

            </Grid>

        </div>
    )
}

export default App
