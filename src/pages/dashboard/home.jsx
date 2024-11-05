import React, { useEffect, useState } from "react";
import {
  Card,
  CardFooter,
  CardBody,
  Typography,
  Button,
  Checkbox,
  Input,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  CardHeader
} from "@material-tailwind/react";
import { getProduk, deleteProductById } from "@/services/produk";
import CheckoutForm from "@/widgets/form/CheckoutForm";
import Delete from "@/widgets/form/Delete";
import axios from "axios";


export function Home() {
  const [produk, setProduk] = useState([]);

  useEffect(() => {
    getProduk((data) => {
      setProduk(data.listproduk);
    });
  }, []);


  const handleDelete = async (id) => {
    try {
      await deleteProductById(id);
      setProduk((prevProduk) => prevProduk.filter((item) => item.id_produk !== id));
    } catch (error) {
      console.error(error);
      alert("GAGAL");
    }
  };

  return (
    <>
    <div className="relative flex flex-col md:flex-row justify-end text-right mt-2 gap-2">
      <CheckoutForm/>
    </div>
    <Card>
      <CardHeader>
        test
      </CardHeader>
      <CardBody className="overflow-x-scroll px-0 m-3 ">
      <div className="mt-4 mb-8 flex justify-center">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {produk.map((item, index) => (
            <Card key={index} className="w-40 md:w-64 bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="absolute top-0 right-0">
                <Delete 
                onClickk={() => handleDelete(item.id_produk)}
                />
              </div>
              <CardBody>
                <Typography variant="h5" color="white" className="font-semibold">
                  {item.nama_produk}
                </Typography>
                <Typography className="mt-1" color="white">
                  Stok : {item.stok}
                </Typography>
               </CardBody>
              <CardFooter className="mt-auto pt-0">
                <Typography color="white">
                  Rp.{item.harga}
                </Typography>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      </CardBody>
      </Card>
      
    </>
  );
}

export default Home;
