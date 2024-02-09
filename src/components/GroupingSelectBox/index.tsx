import React, { ChangeEvent, FunctionComponent } from 'react';

import { Container } from "./Container";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { getLimit, updateLimits } from "../OrderBook/orderbookSlice";

interface GroupingSelectBoxProps {
  options: number[]
}

export const GroupingSelectBox: FunctionComponent<GroupingSelectBoxProps> = ({options}) => {
  const groupingSize: number = useAppSelector(getLimit);
  const dispatch = useAppDispatch();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatch(updateLimits({
      limit : Number(event.target.value)
    }));
  };

  return (
    <Container>
      <select  name="limiting" onChange={handleChange} defaultValue={groupingSize}>
        {options.map((option, idx) => <option key={idx} value={option}>Limit : {option}</option>)}
      </select>

    </Container>
  );
};

export default GroupingSelectBox;
