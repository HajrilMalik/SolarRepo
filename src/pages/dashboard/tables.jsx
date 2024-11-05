import React from "react";
import {CardBody,Typography,Chip, Card,} from "@material-tailwind/react";
import { authorsTableData } from "@/data";


export function Tables() {
  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>       
      <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
    <table className="w-full min-w-[640px] table-auto">
      <thead>
        <tr>
          {["No","Penerima", "Tipe", "Jumlah" ,"Pembayaran", "Harga", ""].map((el) => (
            <th
              key={el}
              className="border-b border-blue-gray-50 py-3 px-5 text-left"
            >
              <Typography
                variant="small"
                className="text-[11px] font-bold uppercase text-blue-gray-400"
              >
                {el}
              </Typography>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {authorsTableData.map(
          ({name, tipe, jumlah, online, harga }, key) => {
            const className = `py-3 px-5 ${
              key === authorsTableData.length - 1
                ? ""
                : "border-b border-blue-gray-50"
            }`;

            return (
              <tr key={name}>
                <td className={className}>
                  <Typography className="">
                    {key+1}
                  </Typography>
                </td>
                <td className={className}>
                  <div className="flex items-center gap-4">
                    <div>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold"
                      >
                        {name}
                      </Typography>
                    </div>
                  </div>
                </td>
                <td className={className}>
                {tipe.map((tipe, index) => (
              <Typography
                key={index}
                className="text-xs font-semibold text-blue-gray-600"
              >
                {tipe}
              </Typography>
            ))}
                </td>
                <td className={className}>
                  <Typography className="text-xs font-semibold text-blue-gray-600">
                    {jumlah}
                  </Typography>
                </td>
                <td className={className}>
                  <Chip
                    variant="gradient"
                    color={online ? "green" : "red"}
                    value={online ? "succes" : "unsucces"}
                    className="py-0.5 px-2 text-[11px] font-medium w-fit"
                  />
                </td>
                <td className={className}>
                  <Typography className="text-xs font-semibold text-blue-gray-600">
                    {harga}
                  </Typography>
                </td>
                <td className={className}>
                  <Typography
                    as="a"
                    href="#"
                    className="text-xs font-semibold text-blue-gray-600"
                  >
                    Edit
                  </Typography>
                </td>
              </tr>
            );
          }
        )}
      </tbody>
    </table>
  </CardBody>
  </Card> 
  </div>
  );
}

export default Tables;
