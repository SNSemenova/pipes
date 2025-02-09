import { useSelector } from "react-redux";
import { RootState } from "../../app/store";

const useSegmentColor = () => {
  const connections = useSelector(
    (state: RootState) => state.connections.value,
  );

  function getSegmentGroupNumber(lineIndex: number, segmentIndex: number) {
    return connections.findIndex((group) => {
      return group.elements.includes(`${lineIndex},${segmentIndex}`);
    });
  }

  const getSegmentColor = (lineIndex: number, segmentIndex: number): string => {
    const segmentGroupNumber = getSegmentGroupNumber(lineIndex, segmentIndex);
    return segmentGroupNumber > -1
      ? connections[segmentGroupNumber].color
      : "gray";
  };

  return getSegmentColor;
};

export default useSegmentColor;
