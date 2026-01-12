import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts";

export default function PercentageActiveWorker() {

    return (
        <Card variant="outlined" sx={{ width: '100%' }}>
            <CardContent>
                <Typography component="h2" variant="subtitle2" gutterBottom>
                    Pourcentage des travailleurs actifs (ayant validé leur takee 5)
                </Typography>
                <Stack sx={{ justifyContent: 'space-between' }}>
                    <Stack
                        direction="row"
                        sx={{
                            alignContent: { xs: 'center', sm: 'flex-start' },
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <Typography variant="h4" component="p">
                            1.3M
                        </Typography>
                        <Chip size="small" color="error" label="-8%" />
                    </Stack>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Page views and downloads for the last 6 months
                    </Typography>
                </Stack>
                <LineChart
                    xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
                    series={[
                        {
                            data: [2, 5.5, 2, 8.5, 1.5, 5],
                        },
                    ]}
                    height={300}
                />
            </CardContent>
        </Card>
    );
}