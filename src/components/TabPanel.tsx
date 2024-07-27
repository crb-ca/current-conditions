import {ReactNode, memo} from 'react'
import Box from "@mui/material/Box";

interface TabPanelProps {
    children?: ReactNode;
    index: number;
    value: number;
}


const TabPanel = (props: TabPanelProps) => {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            // style={{display: value === index ? 'block' : 'none'}}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            <Box sx={{p: 3}}>{children}</Box>
        </div>
    );
}

export default TabPanel;
