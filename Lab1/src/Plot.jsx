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

const Plot = ({ data, formula, chartName, otherData }) => {
  if (otherData?.length == 1) {
    otherData[0]
  }
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

          {otherData?.length > 0 && (
            <Line
              type="monotone"
              dataKey="y"
              stroke="#f02943"
              data={otherData[0]}
            />
          )}
          {otherData?.length > 1 && (
            <Line
              type="monotone"
              dataKey="y"
              stroke="#f02943"
              data={otherData[1]}
            />
          )}
          {otherData?.length > 2 && (
            <Line
              type="monotone"
              dataKey="y"
              stroke="#050505"
              data={otherData[2]}
            />
          )}
          {otherData?.length > 3 && (
            <Line
              type="monotone"
              dataKey="y"
              stroke="#6efa02"
              data={otherData[3]}
            />
          )}
        </LineChart>
      </div>
    </>
  );
};

export default Plot;
