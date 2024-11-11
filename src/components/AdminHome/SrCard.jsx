import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Typography,
    Button,
  } from "@material-tailwind/react";
  import { ChartSR } from "../AdminHome/chart";
   
  export function CardDefault({ srData, srKey }) {

    const timestampCount = Object.keys(srData.readings || {}).length;
    return (
<Card className="mt-6 w-96" color="light-blue">
            <CardHeader color="blue-gray" className="relative h-56">
                <ChartSR readings={srData.readings} /> {/* Kirim data readings ke ChartSR */}
            </CardHeader>
            <CardBody>
                <Typography variant="h5" color="blue-gray" className="mb-2">
                    {srKey} - Total Timestamps: {timestampCount}
                </Typography>
                <Typography>
                    Range: {srData.charts?.range || "N/A"}
                </Typography>
            </CardBody>
            <CardFooter className="pt-0">
                <Button>EDIT</Button>
            </CardFooter>
        </Card>
    );
  }