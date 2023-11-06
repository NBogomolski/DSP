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
  if (otherData?.length > 0) {
    if (otherData[0][0].y0 === undefined)
      otherData[0] = otherData[0].map((v) => {
        return { n: v.n, y0: v.y };
      });
    if (otherData.length > 1 && otherData[1][0].y1 === undefined)
      otherData[1] = otherData[1].map((v) => {return {n: v.n, y1: v.y}})
    // data = data.map((v, ind) => {return {...data, ...otherData[1][ind]}})
    for (let i = 0; i < otherData.length; i++) {
      data = data.map((objA) => {
        const correspondingObjB = otherData[i].find((objB) => objB.n === objA.n);
        // const next = ind > 0 ? objA : {y:0}
        return {...objA, ...correspondingObjB };
      });

    }
    // console.log(data)
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
              dataKey="y0"
              stroke="#f02943"
              name="fourier transformed"
            />
          )}
          {otherData?.length > 1 && (
            <Line
              type="monotone"
              dataKey="y1"
              stroke="#050505"
              name="Phases excluded"
            />
          )}
          {otherData?.length > 2 && (
            <Line
              type="monotone"
              dataKey="y"
              stroke="#6efa02"
              data={otherData[2]}
            />
          )}
          {otherData?.length > 3 && (
            <Line
              type="monotone"
              dataKey="sum"
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