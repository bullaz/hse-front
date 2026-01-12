import { Box, Grid } from "@mui/material";
import PageContainer from "./PageContainer";
import TopProblemEncountered from "./TopProblemEncountered";
import PercentageActiveWorker from "./stats/PercentageActiveWorker";


export default function Stat() {
    return (
        <PageContainer
            title="Statistiques"
            breadcrumbs={[{ title: 'Statistiques' }]}
        >
            <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
                {/* <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
                    Overview
                </Typography> */}
                <Grid
                    container
                    spacing={2}
                    columns={12}
                    sx={{ mb: (theme) => theme.spacing(2) }}
                >
                    <Grid size={{ xs: 12, md: 6 }}>
                        <PercentageActiveWorker />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TopProblemEncountered />
                    </Grid>
                </Grid>
            </Box>
        </PageContainer>
    )
}