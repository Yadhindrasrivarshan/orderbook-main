import React, { FunctionComponent } from "react";
import useWebSocket from "react-use-websocket";

import TitleRow from "./TitleRow";
import { Container, TableContainer } from "./styles";
import PriceLevelRow from "./PriceLevelRow";
import { useAppDispatch, useAppSelector } from "../../hooks";
import {
  BidAndAskState,
  getLimit,
  insertOrder,
  removeOrder,
  selectAsks,
  selectBids,
  updateOrder,
} from "./orderbookSlice";
import { MOBILE_WIDTH } from "../../constants";
import Loader from "../Loader";
import DepthBackGround from "../DepthBackGround";
import { PriceLevelRowContainer } from "./PriceLevelRow/styles";
import { formatNumber } from "../../helpers";
import { useSelector } from "react-redux";

const WSS_FEED_URL: string = "wss://api-pub.bitfinex.com/ws/2";

function is2DArray(data: any): boolean {
  // Check if it's an array
  if (Array.isArray(data)) {
    // Check if the first element is an array
    if (Array.isArray(data[0])) {
      // It's a 2D array
      return true;
    }
  }
  return false;
}

export enum OrderType {
  BIDS,
  ASKS,
}

interface OrderBookProps {
  windowWidth: number;
}

interface Delta {
  bids: BidAndAskState[];
  asks: BidAndAskState[];
}

const OrderBook: FunctionComponent<OrderBookProps> = ({ windowWidth }) => {
  const bids: BidAndAskState[] = useAppSelector(selectBids);
  const asks: BidAndAskState[] = useAppSelector(selectAsks);
  const dispatch = useAppDispatch();
  const currentState = useSelector((state: any) => state.orderbook);
  const groupingSize: number = useAppSelector(getLimit);
  const { sendJsonMessage } = useWebSocket(
    WSS_FEED_URL,
    {
      onOpen: () => {
        console.log("WebSocket connection opened.");
        sendJsonMessage({
          event: "subscribe",
          channel: "book",
          symbol: "tBTCUSD",
        });
      },
      onClose: (event) => console.error("WebSocket connection closed:", event),
      shouldReconnect: (closeEvent) => true,
      onMessage: (event) => processMessages(event),
    }
  );

  const processMessages = (event: any) => {
    const response = JSON.parse(event.data);
    const data = response[1];
    if (Array.isArray(data)) {
      if (is2DArray(data)) {
        const orders = [...data];

        // Process orders
        const processedOrders = orders.map(
          ([price, count, amount]: [number, number, number]) => {
            count = typeof count === "number" ? count : 0;
            amount = typeof amount === "number" ? amount : 0;

            return {
              price,
              count,
              amount,
              total: count * amount, 
              type: amount > 0 ? "bid" : "ask", // Determine if it's a bid or ask based on the sign of the amount
            };
          }
        );

        // Separate buy (bid) and sell (ask) orders
        const buyOrders = processedOrders.filter(
          (order: any) => order.type === "bid"
        );
        const sellOrders = processedOrders.filter(
          (order: any) => order.type === "ask"
        );
        process({
          bids: buyOrders,
          asks: sellOrders,
        });
      } else {
        // If the length is 3, it's an individual order
        let [price, count, amount] = data;
        count = typeof count === "number" ? count : 0;
        amount = typeof amount === "number" ? amount : 0;
        // Process the order
        const processedOrder = {
          price,
          count,
          amount,
          total: count * amount,
          type: amount > 0 ? "bid" : "ask", // Determine if it's a bid or ask based on the sign of the amount
        };
        process({
          bids: processedOrder.type === "bid" ? [processedOrder] : [],
          asks: processedOrder.type === "ask" ? [processedOrder] : [],
        });

        console.log("Processed Order:", processedOrder);
      }
    }
  };

  const process = (data: Delta) => {
    if (data?.bids?.length > 0) {
      const { bids = [] } = data;
      bids.forEach(({ price, count, amount, total,type }) => {
        const existingOrder = currentState.bids.find(
          (order: any) => order.price === price
        );

        if (count === 0) {
          // If count is 0, consider it as a removal
          dispatch(removeOrder({ side: "bids", price }));
        } else if (existingOrder) {
          // If an existing order is found, consider it as an update
          dispatch(updateOrder({ side: "bids", price, amount }));
        } else {
          // If the order doesn't exist, consider it as an insert
          dispatch(insertOrder({ side: "bids", price, amount, count, total,type }));
        }
      });
    }
    if (data?.asks?.length >= 0) {
      const { asks } = data;

      asks.forEach(({ price, count, amount, total,type }) => {
        const existingOrder = currentState.asks.find(
          (order: any) => order.price === price
        );

        if (count === 0) {
          // If count is 0, consider it as a removal
          dispatch(removeOrder({ side: "asks", price }));
        } else if (existingOrder) {
          // If an existing order is found, consider it as an update
          dispatch(updateOrder({ side: "asks", price, amount }));
        } else {
          // If the order doesn't exist, consider it as an insert
          dispatch(insertOrder({ side: "asks", price, amount, count, total,type }));
        }
      });
    }
  };

  const formatPrice = (arg: number): string => {
    return arg.toLocaleString("en", {
      useGrouping: true,
      minimumFractionDigits: 2,
    });
  };

  const buildPriceLevels = (
    levels: any[],
    orderType: OrderType = OrderType.BIDS
  ): React.ReactNode => {
    return levels.map((level, idx) => {
      //const [price, count, amount] = data;
      //[46299, 1, 6403, 3.4931043512416533] : [price,count,total,amount]
      //   {
      //     "price": 46210,
      //     "amount": 0.20250214,
      //     "count": 3,
      //     "total": 0.60750642
      // }
      // const total: string = Math.abs(parseFloat(formatNumber(calculatedTotal))).toString();
      // const depth = Math.abs(level.amount);
      // const size: string = Math.abs(parseFloat(formatNumber(level.amount))).toString();
      // const price: string = Math.abs(parseFloat(formatPrice(level.price))).toString();
      // const calculatedTotal: number = level.total;
      // const total: string = formatNumber(calculatedTotal).includes('-') ?  formatNumber(calculatedTotal).slice(1): formatNumber(calculatedTotal);
      // const depth = Math.abs(level.amount)*30;
      // const size: string =  formatNumber(level.amount).includes('-') ?  formatNumber(level.amount).slice(1): formatNumber(level.amount);
      // const price: string = formatPrice(level.price).includes('-') ?  formatNumber(level.price).slice(1): formatNumber(level.price)

      const calculatedTotal: number = level.total;
      const total: string = formatNumber(calculatedTotal);
      const depth = Math.abs(level.amount) * 30;
      const size: string = formatNumber(level.amount);
      const price: string = formatPrice(level.price);
      return (
        <PriceLevelRowContainer key={idx + depth}>
          <DepthBackGround
            key={depth}
            windowWidth={windowWidth}
            depth={depth}
            orderType={orderType}
          />
          <PriceLevelRow
            key={size + total}
            total={total}
            size={size}
            price={price}
            count={level.count}
            reversedFieldsOrder={orderType === OrderType.ASKS}
            windowWidth={windowWidth}
          />
        </PriceLevelRowContainer>
      );
    });
  };

  const minLimitBasedOnData = (
    bids: BidAndAskState[],
    asks: BidAndAskState[],
    type: OrderType
  ): any[] => {
    bids = bids.slice().sort((a, b) => b.price - a.price);
    asks = asks.slice().sort((a,b) => a.price - b.price );
    if (bids.length > groupingSize && asks.length > groupingSize) {
      return type === OrderType.BIDS
        ? bids.slice(0,groupingSize)
        : asks.slice(0,groupingSize);
    } else {
      return type === OrderType.BIDS
        ? bids.slice(0 , Math.min(bids.length, asks.length))
        : asks.slice(0 ,  Math.min(bids.length, asks.length));
    }
  };

  const refinedBids =  minLimitBasedOnData(bids, asks, OrderType.BIDS);
  const refinedAsks =  minLimitBasedOnData(bids, asks, OrderType.ASKS)

  return (
    <Container>
      {bids.length && asks.length ? (
        <>
          <TableContainer>
            {windowWidth > MOBILE_WIDTH && (
              <TitleRow windowWidth={windowWidth} reversedFieldsOrder={false} />
            )}
            <div>
              {buildPriceLevels(
               refinedBids,
                OrderType.BIDS
              )}
            </div>
          </TableContainer>
          <TableContainer>
            <TitleRow windowWidth={windowWidth} reversedFieldsOrder={true} />
            <div>
              {buildPriceLevels(
                refinedAsks,
                OrderType.ASKS
              )}
            </div>
          </TableContainer>
        </>
      ) : (
        <Loader />
      )}
    </Container>
  );
};

export default OrderBook;
