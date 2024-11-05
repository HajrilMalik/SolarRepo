import React, {useState} from "react";
import {
  CardBody,
  Input,
  Button,
  Typography,
  Tabs,
  TabPanel,
} from "@material-tailwind/react";
import { NewProduk } from "@/services/produk";
 
 
export default function CheckoutForm() {
  const [type, setType] = React.useState("card");
  const [isOpen, setIsOpen] = useState(false);
  const [produk, setProduk] = useState({
    nama: "",
    harga: "",
    stok: 0,
  });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await NewProduk(produk);
      window.location.reload();

      //mereset setelah berhasil
      setProduk({
        nama: "",
        harga: "",
        stok: "",
      })
    } catch(err){
      alert("Gagal")
    }
  }

  const handleChange = (e) => {
    const {name, value} = e.target;
    setProduk((prevProduct) =>({
      ...prevProduct,
      [name]: value
    }));
  }
 
  return (
    <div className="">
    <Button color="blue" className="w-40"
      onClick={() => setIsOpen(!isOpen)}>
      Add Product
    </Button>
    {isOpen && (
      <div className="absolute z-10 top-full right-0 mt-2 w-64 ">
      <CardBody className="bg-white rounded-xl">
      <Tabs value={type} className="overflow-visible">
        <TabPanel value="card" className="p-0">
          <form className="mt-1 flex flex-col gap-4" onSubmit={submit}>
            <div>
              <Typography
                variant="small"
                color="blue-gray"
                className="mb-2 font-medium"
              >
                Product
              </Typography>
              <Input
                name="nama"
                value={produk.nama}
                onChange={handleChange}
                className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>

            <div className="my-4 flex items-center gap-4">
              <div>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="mb-2 font-medium"
                >
                  Harga
                </Typography>
                <Input
                  name="harga"
                  value={produk.harga}
                  onChange={handleChange}
                  type="number"
                  containerProps={{ className: "min-w-[72px]" }}
                  className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                />
              </div>
              <div>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="mb-2 font-medium"
                >
                  Stok
                </Typography>
                <Input
                  name="stok"
                  value={produk.stok === 0 ? '' : produk.stok}
                  onChange={handleChange}
                  type="number"
                  containerProps={{ className: "min-w-[72px]" }}
                  className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                />
              </div>
            </div>
            <Button size="lg" type="submit">Tambah Produk</Button>
          </form>
        </TabPanel>
      </Tabs>
    </CardBody>
    </div>
    )}
    </div>

  );
}