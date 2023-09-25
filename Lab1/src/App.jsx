import { useState, useEffect } from 'react'
import Plot from './Plot.jsx'
import './App.css'
import { Label, RangeSlider, TextInput, ToggleSwitch } from "flowbite-react";
import {
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
} from "recharts";

function App() {
  const [amplitude, setAmplitude] = useState(0.5)
  const [frequency, setFrequency] = useState(5)
  const [samplingFrequency, setSamplingFrequency] = useState(50)
  const [dutyCycle, setDutyCycle] = useState(0.5)
  const [phase0, setPhase0] = useState(0)

  const [isAmplitudeModulated, setIsAmplitudeModulated] = useState(false)
  const [carrierAmplitude, setCarrierAmplitude] = useState(0.5)
  const [carrierFrequency, setCarrierFrequency] = useState(5)
  const [carrierPhase, setCarrierPhase] = useState(0)
  
  const generateSinusData = (a, f, N, phi0) => {
    const data = [];
    for (let n = 1; n <= N; n++) {
      const y = a * Math.sin(2*Math.PI * f * n/N + phi0); // Customize the formula here
      data.push({ n, y });

    }
    return data;
  };

  const generateRectangularData = (a, f, N, dc) => {
    const data = []
    for (let n = 1; n <= N; n++) {
      let period = 1 / f
      let expression = ((n/N) % period) / period
      if (expression < dc)
        data.push({n, y: a})
      else {
        console.log('els')
        const negA = -1 * a
        data.push({n, y: negA})
      }
    }
    return data
  }

  const generateTriangularData = (a, f, N, phi0) => {
    const data = [];
    for (let n = 1; n <= N; n++) {
      const y = 2*a / Math.PI * Math.asin(Math.sin(2*Math.PI*f*n/N + phi0))
      data.push({ n, y });
    }
    return data;
  };

  const generateSawlikeData = (a, f, N, phi0) => {
    const data = [];
    for (let n = 1; n <= N; n++) {
      const y = -2*a/Math.PI * Math.atan(1/Math.tan(Math.PI*f*n/N + phi0))
      data.push({ n, y });
    }
    return data;
  };
  
  const sinusData = generateSinusData(amplitude, frequency, samplingFrequency, phase0);
  const rectangleData = generateRectangularData(amplitude, frequency, samplingFrequency, dutyCycle)
  const triangleData = generateTriangularData(amplitude, frequency, samplingFrequency, phase0)
  const sawlikeData = generateSawlikeData(amplitude, frequency, samplingFrequency, phase0)

  return (
    <div className="bg-blue-50 p-5 h-full">
      <div className="flex flex-row justify-end">
        <div className="flex flex-col w-2/6 fixed z-50">
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
          <Label
            htmlFor="duty-cycle"
            value={"Duty cycle " + dutyCycle}
            color="black"
            className="text-lg"
          />
          <RangeSlider
            id="sampling-frequency"
            sizing="lg"
            onChange={(e) => setDutyCycle(e.target.value / 100)}
          />
          <TextInput
            placeholder="phi0"
            type="number"
            value={phase0}
            onChange={(e) => setPhase0(e.target.value)}
          />
          <div>
            {/* <Label htmlFor='amplitude-modulation' color="black" className='text-lg' value='Amplitude modulation'></Label> */}
            <ToggleSwitch id='amplitude-modulation' label='Amplitude modulation' checked={isAmplitudeModulated} onChange={e => setIsAmplitudeModulated(!isAmplitudeModulated)}/>
          </div>
          {isAmplitudeModulated && (<>
            
            <h1 className="text-xl">Carrier signal</h1>
            <Label
              htmlFor="amplitude-carrier"
              value={"Amplitude " + carrierAmplitude}
              color="black"
              className="text-lg"
            />
            <RangeSlider
              id="amplitude-carrier"
              sizing="lg"
              onChange={(e) => setCarrierAmplitude(e.target.value / 100)}
            />
            <Label
              htmlFor="frequency-carrier"
              value={"Frequency " + carrierFrequency}
              color="black"
              className="text-lg"
            />
            <RangeSlider
              id="frequency-carrier"
              sizing="lg"
              onChange={(e) => setCarrierFrequency(e.target.value / 10)}
            />
            <TextInput
              placeholder="phi0"
              type="number"
              value={carrierPhase}
              onChange={(e) => setCarrierPhase(e.target.value)}
            />
          </>)}
        </div>
        <div className="flex flex-col flex-grow p-5 w-fit self-end">
          <Plot data={sinusData} formula={"x=f(n)"} chartName={"Sinus"}></Plot>
          <Plot
            data={rectangleData}
            formula={"x=f(n)"}
            chartName={"Rectangle"}
          ></Plot>
          <Plot
            data={triangleData}
            formula={"x=f(n)"}
            chartName={"Triangle"}
          ></Plot>
          <Plot
            data={sawlikeData}
            formula={"x=f(n)"}
            chartName={"Sawlike"}
          ></Plot>
          {/*           <Plot
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