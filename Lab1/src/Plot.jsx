import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const Plot = ({ data, formula, chartName }) => {
  return (
    <>
      <div className="chart-container w-fit">
        <h3 className="text-lg font-bold">{chartName}</h3>
        <LineChart width={1000} height={400} data={data}>
          <XAxis dataKey="n" />
          <YAxis domain={[-1, 1]} tickFormatter={(num) => num.toFixed(2)} />
          <CartesianGrid stroke="#ccc" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="y" stroke="#8884d8" name={formula} />
        </LineChart>
      </div>
    </>
  );
};

export default Plot;
