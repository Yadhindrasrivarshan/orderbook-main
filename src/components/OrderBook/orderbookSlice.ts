import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../store';

export interface OrderbookState {
   bids:BidAndAskState[];
   asks: BidAndAskState[];
   limit:number;
}

export interface BidAndAskState {
  amount: number;
  count: number;
  price: number;
  total: number;
  type: string;
}

const initialState: OrderbookState = {
  bids: [],
  asks: [],
  limit: 15,
};


export const orderbookSlice = createSlice({
  name: 'orderbook',
  initialState,
  reducers: {
    removeOrder : (state , {payload}) =>{
      const side : ('bids' | 'asks') = payload.side;
      const price : number = payload.price;

      state[side] = state[side].filter(order => order.price !== price);
    },
    updateOrder: (state , {payload}) => {
      const side : ('bids' | 'asks') = payload.side;

      const { price, amount } = payload;
      const index = state[side].findIndex(order => order.price === price);
      if (index !== -1) {
        state[side][index].amount = amount;
      }

    },
    insertOrder : (state , {payload}) =>{
      const side : ('bids' | 'asks') = payload.side;
      const { price, amount,count,total,type} = payload;
      state[side].push({
        price,amount,count,total,type
      });

    },
    updateLimits : (state, {payload}) =>{
       state.limit = payload.limit;
    }
  }
});

export const {updateLimits ,removeOrder,insertOrder,updateOrder } = orderbookSlice.actions;

export const selectBids = (state: RootState): BidAndAskState[] => state.orderbook.bids;
export const selectAsks = (state: RootState): BidAndAskState[] => state.orderbook.asks;
export const getLimit = (state: RootState): number => state.orderbook.limit;

export default orderbookSlice.reducer;
