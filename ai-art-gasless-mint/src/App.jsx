import { useState } from 'react'
import axios from 'axios'


const App = () => {
  const [prompt , setPrompt] = useState("");
  const [imageBlob, setImageBlob] = useState("")
  const [file, setFile] = useState("")
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [minted, setMinted] = useState(false);

  console.log(prompt);

  const cleanupIPFS = (url) => {
    if(url.includes("ipfs://")) {
    return url.replace("ipfs://", "https://ipfs.io/ipfs/")
    }
    return url;
  }

  const generateArt = async()=>{
    try{
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
        {
          headers: { 
            Authorization: `Bearer ${import.meta.env.REACT_APP_HUGGING_FACE}`,
           },
           method: "POST",
           inputs: prompt,
        },
        { responseType : "blob" }
      );
      // convert blob to a image file type
      const file = new File([response.data], "image.png",{
        type: "image/png",
      })
      setFile(file);
      const url = URL.createObjectURL(response.data)
      console.log(url)
      setImageBlob(url)
    }catch(err){
      console.log(err);
      setError(true)
    }finally{
      setLoading(false);
    }
  };

  const uploadArtToIpfs = async () => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const metadata = JSON.stringify({
        name: "AI NFT",
        description: "AI generated NFT",
      });
      formData.append('pinataMetadata', metadata);
      
      const options = JSON.stringify({
        cidVersion: 0,
      });
      formData.append('pinataOptions', options);

      const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`
        },
        body: formData,
      });
      
      console.log(res.data);


      const ipfsCid = res.data.IpfsHash;
      console.log("IPFS CID:", ipfsCid);

      // Construct the IPFS URL and clean it up
      const ipfsUrl = `ipfs://${ipfsCid}`;
      return cleanupIPFS(ipfsUrl);
    } catch (err) {
      console.log(err);
      return null
    }
  };


const mintNft = async () => {
  try {
    const imageURL = await uploadArtToIpfs();
  // mint as an NFT on nftport
  const response = await axios.post(
  `https://api.nftport.xyz/v0/mints/easy/urls`,
  {
    file_url: imageURL,
    chain: "polygon",
    name: "Sample NFT",
    description: "Build with NFTPort!",
    mint_to_address: "0x3d0b45Bc914457E027094E509eBE631E356cbB03",
  },
  {
    headers: {
      Authorization: import.meta.env.REACT_APP_NFT_PORT,
      }
    }
  );
  const data = await response.data;
  setMinted(true)
  console.log(data);
  }catch(err) {
  console.log(err);
  }
};
console.log(name)
console.log(description)
console.log(address)



  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-extrabold">AI Art Gasless mints</h1>
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center justify-center gap-4">
          <input
            className="border-2 border-black rounded-md p-2"
            onChange={(e) => setPrompt(e.target.value)}
            type="text"
            placeholder="Enter a prompt"
          />
      <button onClick={generateArt} className="bg-black text-white rounded-md p-2">Next
      </button>
      {loading && <p>Loading...</p>}
    </div>
        {imageBlob && (
          <div className="flex flex-col gap-4 items-center justify-center">
          <img src={imageBlob} alt="AI generated art" />
        {
              minted ? <p>Minted this NFT</p> : (
                <div className="flex flex-col items-center justify-center gap-4">
        {/* input for name */}
        <input
          className="border-2 border-black rounded-md p-2"
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder="Enter a name"
        />
        {/* input for description */}
        <input
          className="border-2 border-black rounded-md p-2"
          onChange={(e) => setDescription(e.target.value)}
          type="text"
          placeholder="Enter a description"
        />
        {/* input for address */}
        <input
          className="border-2 border-black rounded-md p-2"
          onChange={(e) => setAddress(e.target.value)}
          type="text"
          placeholder="Enter a address"
        />
         <button 
         onClick={mintNft}
          className="bg-black text-white rounded-md p-2">
            Mint
            </button>
    </div>
              )
            }
    </div>
  )}
    </div>
  </div>
  );
}
export default App
