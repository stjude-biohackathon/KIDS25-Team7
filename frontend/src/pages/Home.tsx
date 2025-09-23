import type React from "react"
import { useGetCompounds } from "../api/useApi"

const Home: React.FC = () => {
  const {data: compounds, error: compoundsError} = useGetCompounds()
  const apiTest = (!compoundsError && compounds && Array.isArray(compounds) ?
    compounds.map(compound => (
      <li key={compound.id}>
        <span>{compound.name} </span>
        <span>{compound.smiles}</span>
      </li>
    )) : 
    <li>API Error!</li>
  )
  return (
    <div>
      <h2>API Test</h2>
      If the mock API works, compound SMILES will populate below.
      {apiTest}
    </div>
  )
}

export default Home