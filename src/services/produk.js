import axios from "axios";

const product = () => {
  
}

export const getProduk = (callback) => {
    axios.get('http://localhost:8080/produk')
    .then((res) => {
        callback(res.data)
    })
    .catch((err) => {
        console.log(err)
    })
}


export const NewProduk = async (data) => {
  try {
    const response = await axios.post('http://localhost:8080/produk', data);
  } catch (error) {
    console.log(error);
  }
}

export const deleteProductById = async (id) => {
  try {
    await axios.delete(`http://localhost:8080/produk/${id}`);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete product");
  }
};

export const checkProductName = async (nama) => {
    try {
      const response = await fetch(`http://localhost:8080/produk?nama=${nama}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      return result.exists;
    } catch (error) {
      console.error('Error checking product name:', error);
      return false;
    }
  };

