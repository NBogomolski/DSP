
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const FilterPlot = ({ data, chartName, otherData }) => {
  
  data = data.map((value, ind) => {
    if (!otherData)
      return {y: value, n: ind+1}
    else return {y: value, y0: otherData[ind], n: ind+1}
  })

  return (
    <>
      <div className="chart-container w-fit">
        <h3 className="text-lg font-bold">{chartName}</h3>
        <LineChart width={750} height={400} data={data}>
          <XAxis dataKey="n" />
          <YAxis domain={[-1, 1]} tickFormatter={(num) => num.toFixed(2)} />
          <CartesianGrid stroke="#ccc" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="y" stroke="green"/>
          <Line type="monotone" dataKey="y0" stroke="blue"/>
        </LineChart>
      </div>
    </>
  );
};

export default FilterPlot;
