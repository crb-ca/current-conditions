import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

function Navbar() {

    return (
        <AppBar position="static" id="appbar">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <a href="https://crb.ca.gov">
                        <img alt="CRB logo" style={{ height: 60, background: "white" }} src="/current-conditions/images/crb-logo.png" />
                    </a>
                    <Typography className="title" noWrap>
                        Current Conditions
                    </Typography>
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default Navbar;
