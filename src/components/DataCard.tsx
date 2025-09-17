import { Card } from "@mui/material";

const DataCard = ({ children, source, ...props }) => {
    return (
        <Card className="data-card" {...props}>
            <div>
                {children}
            </div>
            {source && <div>Data source: <a target="_blank" href={source}>{source}</a></div>}
        </Card>
    )
}

export default DataCard;