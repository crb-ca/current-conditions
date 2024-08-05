import {Card} from "@mui/material";

export const DataCard = ({children, ...props}) =>
    <Card className="data-card" {...props}>{children}</Card>;