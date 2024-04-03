import React from 'react'
import { useState } from 'react'
import axios from 'axios'

const App = () => {
  const [prompt , setPrompt] = useState("")
  console.log(prompt);
  return (
    <div className='flex flex-col items'>
      <h1 className='' > AI Art Gasless mints </h1>
    </div>
  )
}

export default App
