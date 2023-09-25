import { useState, useEffect } from 'react'
import Plot from './Plot.jsx'
import './App.css'
import { Label, RangeSlider, TextInput } from "flowbite-react";

function App() {
  const [amplitude, setAmplitude] = useState(0.5)
  const [frequency, setFrequency] = useState(0.5)
  const [samplingFrequency, setSamplingFrequency] = useState(0)
  
  const generateSinusData = (a, f, N, phi0) => {
    const data = [];
    for (let n = 1; n <= N; n++) {
      const y = a * Math.sin(2*Math.PI * f * n/N + phi0); // Customize the formula here
      data.push({ n, y });

    }
    return data;
  };

  const generateRectangularData = (a, f, N)
  
  const sinusData = generateSinusData(amplitude, frequency, samplingFrequency, 0); // Adjust formula parameters as needed
  // const chartData2 = generateSinusData(amplitude, 3, Math.PI / 2); // Adjust formula parameters as needed
  // const chartData3 = generateSinusData(amplitude, 1, Math.PI); // Adjust formula parameters as needed
  // const chartData4 = generateSinusData(amplitude, 4, Math.PI * 1.5);
  

  return (
    <div className="bg-blue-50 p-5 h-full">
      <div className="flex flex-row">
        <div className="flex flex-col w-2/6">
          <Label
            htmlFor="amplitude"
            value={"Amplitude " + amplitude}
            color="black"
            className="text-lg"
          />
          <RangeSlider
            id="amplitude"
            sizing="lg"
            onChange={(e) => setAmplitude(e.target.value / 100)}
          />
          <Label
            htmlFor="frequency"
            value={"Frequency " + frequency}
            color="black"
            className="text-lg"
          />
          <RangeSlider
            id="frequency"
            sizing="lg"
            onChange={(e) => setFrequency(e.target.value / 10)}
          />
          <Label
            htmlFor="sampling-frequency"
            value={"Sampling frequency " + samplingFrequency}
            color="black"
            className="text-lg"
          />
          <RangeSlider
            id="sampling-frequency"
            sizing="lg"
            onChange={(e) => setSamplingFrequency(e.target.value)}
          />
        </div>
        <div className="flex flex-col flex-grow p-5 w-fit">
          <Plot data={sinusData} formula={"y=f(x)"} chartName={"Sinus"}></Plot>
          {/*           <Plot
            data={chartData2}
            formula={"y=f(x)"}
            chartName={"Rectangle"}
          ></Plot>
          <Plot
            data={chartData3}
            formula={"y=f(x)"}
            chartName={"Triangle"}
          ></Plot>
          <Plot
            data={chartData4}
            formula={"y=f(x)"}
            chartName={"Saw-like"}
          ></Plot> */}
        </div>
      </div>
    </div>
  );
}

export default App	