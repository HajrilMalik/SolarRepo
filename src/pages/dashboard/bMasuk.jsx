import React, { useEffect, useState } from "react";
import {CardBody,Typography, Card, Button} from "@material-tailwind/react";
import { getProduk } from "@/services/produk";
import CheckoutForm from "@/widgets/form/CheckoutForm";


export function BMasuk () {
  const [produk, setProduk] = useState([])
  
  useEffect(() => {
    getProduk((data) => {
      setProduk(data.listproduk)
    })
  }, [])

    return (
      <>
    <div className="relative flex flex-col md:flex-row justify-end text-right mt-2 gap-2 ">
      <CheckoutForm/>
    </div>
        <div className="mt-3 mb-8 flex flex-col gap-12">
        <Card>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
      <table className="w-full min-w-[640px] table-auto">
        <thead>
          <tr>
            {["No","Nama", "harga", "Stok" ,"Time"].map((el) => (
              <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                  {el}
                </Typography>
              </th>
            ))}
          </tr>
          
        </thead>
        <tbody>
          {produk.map((item ,key) => {
            const className = `py-3 px-5 ${key === produk.length - 1? "": "border-b border-blue-gray-50"}`;
              return (
                <tr key={item.id_produk}>
                <td className={className}>
                    <Typography className="text-xs font-semibold text-blue-gray-600">
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
                          {item.nama_produk}
                        </Typography>
                      </div>
                    </div>
                  </td>
                  <td className={className}>
                    <Typography className="text-xs font-semibold text-blue-gray-600">
                      {item.harga}
                    </Typography>
                  </td>
                  <td className={className}>
                    <Typography className="text-xs font-semibold text-blue-gray-600">
                      {item.stok}
                    </Typography>
                  </td>
                  <td className={className}>
                    <Typography className="text-xs font-semibold text-blue-gray-600">
                      {item.createdAt}
                    </Typography>
                  </td>
                  <td className={className}>
                    <Typography as="a" href="#" className="text-xs font-semibold text-blue-gray-600">
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
    </>
    )
}

export default BMasuk;