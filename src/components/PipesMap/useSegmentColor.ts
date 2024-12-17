import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { RootState } from "../../app/store"

const useSegmentColor = () => {
  const connections = useSelector((state: RootState) => state.connections.value)
  
  const [colours, setColours] = useState<string[]>([])

  useEffect(() => {
    if (connections.length > colours.length) {
      const newColours = [...colours]
      for (let i = colours.length; i < connections.length; i++) {
        newColours.push(`#${generateColor()}`)
      }
      setColours(newColours)
    }
  }, [connections])

  const generateColor = () => {
    return Math.random().toString(16).slice(-6)
  }
  
  function getSegmentGroupNumber(lineIndex: number, segmentIndex: number) {
    return connections.findIndex(group => {
      return group.includes(`${lineIndex},${segmentIndex}`)
    })
  }

  const getSegmentColor = (lineIndex: number, segmentIndex: number): string => {
    const segmentGroupNumber = getSegmentGroupNumber(lineIndex, segmentIndex)
    return segmentGroupNumber > -1 ? colours[segmentGroupNumber] : ''
  }
  
  return getSegmentColor
}

export default useSegmentColor
