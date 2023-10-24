import { useState, useMemo } from "react";
import Plot from "./Plot.jsx";
import "./App.css";
import { Label, RangeSlider, TextInput, ToggleSwitch } from "flowbite-react";
import { Switch, Flex, Typography, InputNumber } from "antd";
import { StyleProvider } from "@ant-design/cssinjs";

const { Title } = Typography;

function App() {
  const [amplitude, setAmplitude] = useState(0.5);
  const [frequency, setFrequency] = useState(5);
  const [samplingFrequency, setSamplingFrequency] = useState(50);
  const [dutyCycle, setDutyCycle] = useState(0.5);
  const [phase0, setPhase0] = useState(0);

  const [isAmplitudeModulated, setIsAmplitudeModulated] = useState(false);
  const [carrierAmplitude, setCarrierAmplitude] = useState(0.5);
  const [carrierFrequency, setCarrierFrequency] = useState(5);
  const [carrierPhase, setCarrierPhase] = useState(0);

  const [isFourierTransformed, setIsFourierTransformed] = useState(false);
  const [kFourier, setKFourier] = useState(0);

  const generateSinusData = (a, f, N, phi0) => {
    const data = [];
    for (let n = 1; n <= N; n++) {
      const y = a * Math.sin((2 * Math.PI * f * n) / N + phi0); // Customize the formula here
      data.push({ n, y });
    }
    return data;
  };

  const generateRectangularData = (a, f, N, dc) => {
    const data = [];
    for (let n = 1; n <= N; n++) {
      let period = 1 / f;
      let expression = ((n / N) % period) / period;
      if (expression < dc) data.push({ n, y: a });
      else {
        const negA = -1 * a;
        data.push({ n, y: negA });
      }
    }
    return data;
  };

  const generateTriangularData = (a, f, N, phi0) => {
    const data = [];
    for (let n = 1; n <= N; n++) {
      const y =
        ((2 * a) / Math.PI) *
        Math.asin(Math.sin((2 * Math.PI * f * n) / N + phi0));
      data.push({ n, y });
    }
    return data;
  };

  const generateSawlikeData = (a, f, N, phi0) => {
    const data = [];
    for (let n = 1; n <= N; n++) {
      const y =
        ((-2 * a) / Math.PI) *
        Math.atan(1 / Math.tan((Math.PI * f * n) / N + phi0));
      data.push({ n, y });
    }
    return data;
  };

  const modulateAmplitude = (a, N, prevData, f, phi0) => {
    // const data = []
    return prevData.map((value, index) => {
      const y =
        a *
        (1 + value.y) *
        Math.sin((2 * Math.PI * f * (index - 1)) / N + phi0);
      return { ...value, y };
    });
  };

  function addChartData(data1, data2) {
    return data1.map((value, ind) => {
      const otherObj = data2[ind];
      return { ...value, y: otherObj.y + value.y };
    });
  }

  // Apply Fourier transform

  const calculateFourierCoordinates = (N, f, f0, A, k) => {
    let dataArr = [];
    for (let i = 0; i < N; i += N / k) {
      const value = A * Math.sin((2 * Math.PI * f * i) / N + f0);
      dataArr.push(value);
    }
    return dataArr;
  };

  const kpoints = useMemo(() => {
    return calculateFourierCoordinates(
      samplingFrequency,
      frequency,
      phase0,
      amplitude,
      kFourier
    );
  }, [samplingFrequency, amplitude, phase0, frequency, kFourier]);

  const calcFourier = (points, N) => {
    const res = {
      A: [],
      aCos: [],
      aSin: [],
      phases: [],
    };
    const n = N;
    const k = points.length;
    for (let j = 0; j < k; j++) {
      let cos = 0;
      let sin = 0;
      for (let i = 0; i < k; i++) {
        cos += points[i] * Math.cos((2 * Math.PI * i * j) / k);
        sin += points[i] * Math.sin((2 * Math.PI * i * j) / k);
      }

      sin *= 2 / k;
      cos *= 2 / k;

      res.aSin.push(sin);
      res.aCos.push(cos);
      res.A.push(Math.sqrt(sin * sin + cos * cos));
      res.phases.push(Math.atan2(sin, cos));
    }
  };

  const calcReverseFourier = (fourier, n, isHarmonic) => {
    const res = [];
    const k = fourier.A.length;
    for (let i = 0; i < n; i++) {
      let signal = 0;

      for (let j = isHarmonic ? 0 : 1; j < k / 2; j++) {
        signal +=
          fourier.A[j] *
          Math.cos((2 * Math.PI * i * j) / n - fourier.phases[j]);
      }
      res.push(signal + (!isHarmonic ? fourier.A[0] / 2 : 0));
    }
    return res;
  };

  let sinusData = generateSinusData(
    amplitude,
    frequency,
    samplingFrequency,
    phase0
  );
  const rectangleData = generateRectangularData(
    amplitude,
    frequency,
    samplingFrequency,
    dutyCycle
  );
  const triangleData = generateTriangularData(
    amplitude,
    frequency,
    samplingFrequency,
    phase0
  );
  const sawlikeData = generateSawlikeData(
    amplitude,
    frequency,
    samplingFrequency,
    phase0
  );

  if (isAmplitudeModulated)
    sinusData = modulateAmplitude(
      carrierAmplitude,
      samplingFrequency,
      sinusData,
      carrierFrequency,
      carrierPhase
    );

  const sumOfData = addChartData(
    addChartData(sinusData, rectangleData),
    addChartData(triangleData, sawlikeData)
  );

  let otherData = [];
  if (isFourierTransformed) {
    const yCoordinaties = sinusData.map((v) => v.y);
    console.log(yCoordinaties);
    const transformedData = calcFourier(kpoints, samplingFrequency);
    console.log(transformedData); //!undefined
    otherData = calcReverseFourier(transformedData, samplingFrequency, true);
  }
  otherData = otherData.map((v, ind) => {
    return { y: v, n: ind + 1 };
  });

  return (
    <div className="bg-blue-50 p-5 h-full">
      <div className="flex flex-row justify-end">
        <div className="flex flex-col w-2/6 fixed z-50">
          <Label
            htmlFor="amplitude"
            value={"Amplitude " + amplitude}
            color="black"
            className="text-2xl"
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
            className="text-2xl"
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
            className="text-2xl"
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
            className="text-2xl"
          />
          <RangeSlider
            id="sampling-frequency"
            sizing="lg"
            onChange={(e) => setDutyCycle(e.target.value / 100)}
          />
          {/* <TextInput
            placeholder="phi0"
            type="number"
            value={phase0}
            onChange={(e) => setPhase0(e.target.value)}
          /> */}
          <Label value={"Phase 0"} color="black" className="text-2xl" />
          <InputNumber
            className="my-2"
            placeholder="phi0"
            min={0}
            max={100}
            value={phase0}
            onChange={(value) => setPhase0(value)}
          />
          <div>
            <StyleProvider hashPriority={"high"}>
              {/* <ToggleSwitch
                className="text-2xl"
                id="amplitude-modulation"
                label="Amplitude modulation"
                checked={isAmplitudeModulated}
                onChange={() => setIsAmplitudeModulated(!isAmplitudeModulated)}
              /> */}
              <Flex align="center">
                <Title level={3}>Amplitude Modulation</Title>
                <Switch
                  id="amplitude-modulation"
                  label="Amplitude modulation"
                  checked={isAmplitudeModulated}
                  onChange={() =>
                    setIsAmplitudeModulated(!isAmplitudeModulated)
                  }
                />
              </Flex>
            </StyleProvider>
          </div>
          {isAmplitudeModulated && (
            <>
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
            </>
          )}
          {/* <ToggleSwitch
            className="text-2xl"
            id="fourier-transformation"
            label="Fourier Transformation"
            checked={isFourierTransformed}
            onChange={() => setIsFourierTransformed(!isFourierTransformed)}
          /> */}
          <Flex align="center">
            <Title level={3}>Fourier Transformation</Title>
            <Switch
              id="fourier-transformation"
              label="Fourier Transformation"
              checked={isFourierTransformed}
              onChange={() => setIsFourierTransformed(!isFourierTransformed)}
            />
          </Flex>
          {isFourierTransformed && (
            <div className="flex items-center">
              <Title level={3}>k</Title>
              <InputNumber
                className="m-2"
                placeholder="k"
                min={0}
                max={100}
                value={kFourier}
                onChange={(value) => setKFourier(value)}
              />
            </div>
          )}
        </div>
        <div className="flex flex-col flex-grow p-5 w-fit self-end">
          <Plot
            data={sinusData}
            formula={"x=f(n)"}
            chartName={"Sinus"}
            otherData={
              isFourierTransformed
                ? [
                    generateSinusData(
                      amplitude + 2,
                      frequency - 1,
                      samplingFrequency,
                      phase0 + 2
                    ),
                    otherData,
                  ]
                : undefined
            }
          ></Plot>
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
          <Plot
            data={sumOfData}
            formula={"x=f(n)"}
            chartName={"Sum of charts"}
          ></Plot>
        </div>
      </div>
    </div>
  );
}

export default App;
