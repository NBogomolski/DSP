import { useState, useMemo } from "react";
import Plot from "./Plot.jsx";
import "./App.css";
import { Label, RangeSlider, TextInput, ToggleSwitch } from "flowbite-react";
import { Switch, Flex, Typography, InputNumber } from "antd";
import { StyleProvider } from "@ant-design/cssinjs";

const { Title } = Typography;

function App() {
  const [amplitude, setAmplitude] = useState(0.5);
  const [frequency, setFrequency] = useState(1);
  const [samplingFrequency, setSamplingFrequency] = useState(50);
  const [dutyCycle, setDutyCycle] = useState(0.5);
  const [phase0, setPhase0] = useState(0);

  const [isAmplitudeModulated, setIsAmplitudeModulated] = useState(false);
  const [carrierAmplitude, setCarrierAmplitude] = useState(0.5);
  const [carrierFrequency, setCarrierFrequency] = useState(5);
  const [carrierPhase, setCarrierPhase] = useState(0);

  const [isFourierTransformed, setIsFourierTransformed] = useState(false);
  const [kFourier, setKFourier] = useState(samplingFrequency);

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
  //? i += N / k - why? (Even distribution)
  const calculateFourierCoordinatesSinus = (N, f, f0, A, k) => {
    let dataArr = [];
    for (let i = 1; i <= N; i += N / k) {
      const value = A * Math.sin((2 * Math.PI * f * i) / N + f0);
      dataArr.push(value);
    }
    return dataArr;
  };

  const calculateFourierCoordinatesRectangle = (N, T, A, dc, k) => {
    let dataArr = [];
    for (let i = 1; i <= N; i += N / k) {
      const value = ((i / N) % T) / T < dc ? A : -A;
      dataArr.push(value);
    }
    return dataArr;
  };

  const calculateFourierCoordinatesTriangle = (A, f, N, f0, k) => {
    let dataArr = [];
    for (let i = 1; i <= N; i += N / k) {
      const value =
        ((2 * A) / Math.PI) *
        Math.asin(Math.sin((2 * Math.PI * f * i) / N + f0));
      dataArr.push(value);
    }
    return dataArr;
  };

  const calculateFourierCoordinatesSawlike = (A, N, k, f, f0) => {
    let dataArr = [];
    for (let i = 1; i <= N; i += N / k) {
      const value =
        ((-2 * A) / Math.PI) *
        1 *
        Math.atan(1 / Math.tan((Math.PI * f * i) / N + f0));
      dataArr.push(value);
    }
    return dataArr;
  };

  //!This doesn't work

  // const calculateFourierCoordinatesPolyharmonic = (x, N, k, A, f) => {
  //   let dataArr = [];
  //   const firstArr = x;
  //   for (let i = 0; i < N; i += N / k) {
  //     const val1 = A * Math.sin((2 * Math.PI * f * i) / N + f0);
  //     const val2 =
  //       ((2 * A2) / Math.PI) *
  //       Math.asin(Math.sin((2 * Math.PI * f2 * i) / N + f02));
  //     const value = val1+val2
  //     dataArr.push(value);
  //   }
  //   console.log(dataArr);
  //   return dataArr;
  // };

  // const kpoints = () => {
  //   return calculateFourierCoordinates(
  //     samplingFrequency,
  //     frequency,
  //     phase0,
  //     amplitude,
  //     kFourier
  //   );
  // }, [samplingFrequency, amplitude, phase0, frequency, kFourier]);

  const calcFourier = (points, N) => {
    const res = {
      A: [],
      aCos: [],
      aSin: [],
      phases: [],
    };
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
    return res;
  };

  const calcReverseFourier = (fourier, n, isHarmonic, initialData0) => {
    const res = [];
    const sampFreq = fourier.A.length;
    for (let i = 0; i < n; i++) {
      let signal = 0;

      for (let j = isHarmonic ? 0 : 1; j < sampFreq / 2; j++) {
        signal +=
          fourier.A[j] *
          Math.cos((2 * Math.PI * i * j) / n - fourier.phases[j]);
      }
      res.push(signal); //
    }
    return res;
  };

  const calcReverseFourierPolyharmonic = (
    fourier,
    n,
    phasesIncluded = true
  ) => {
    const res = [];
    let currPhase;
    const sampFreq = fourier.A.length;
    for (let i = 0; i < n; i++) {
      let signal = 0;
      signal += fourier.A[0] / 2;
      for (let j = 1; j < sampFreq / 2; j++) {
        if (phasesIncluded) currPhase = fourier.phases[j];
        else currPhase = 0;
        signal +=
          fourier.A[j] * Math.cos((2 * Math.PI * i * j) / n - currPhase);
      }
      res.push(signal); //
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

  let fourierTransformedSinus = [];
  let sinAmpSpectrum = [];
  let sinPhaseSpectrum = [];

  let fourierTransformedRectangle = [];
  let rectAmpSpectrum = [];
  let rectPhaseSpectrum = [];

  let fourierTransformedTriangle = [];
  let triangleAmpSpectrum = [];
  let trianglePhaseSpectrum = [];

  let fourierTransformedSawlike = [];
  let sawAmpSpectrum = [];
  let sawPhaseSpectrum = [];

  let fourierTransformedPolyharmonic = [];
  let fourierTransformedPolyharmonicNOPHI = [];
  let polyharmonicAmpSpectrum = [];
  let polyharmonicPhaseSpectrum = [];

  let sinYCoordinates = calculateFourierCoordinatesSinus(
    samplingFrequency,
    frequency,
    phase0,
    amplitude,
    kFourier
  );
  // const sinYCoordinates = sinusData.map((obj) => obj.y);
  const rectYCoordinates = calculateFourierCoordinatesRectangle(
    samplingFrequency,
    1 / frequency,
    amplitude,
    dutyCycle,
    kFourier
  );
  // const rectYCoordinates = rectangleData.map((obj) => obj.y);
  const triangleYCoordinates = calculateFourierCoordinatesTriangle(
    amplitude,
    frequency,
    samplingFrequency,
    phase0,
    kFourier
  );
  const sawYCoordinates = calculateFourierCoordinatesSawlike(
    amplitude,
    samplingFrequency,
    kFourier,
    frequency,
    phase0
  );

  //* Checkup before proceeding
  if (isFourierTransformed && isAmplitudeModulated) {
    let sinYCoordinatesMap = sinYCoordinates.map((val, ind) => {
      return { n: ind + 1, y: val };
    });
    sinYCoordinatesMap = modulateAmplitude(
      carrierAmplitude,
      samplingFrequency,
      sinYCoordinatesMap,
      carrierFrequency,
      carrierPhase
    );
    sinYCoordinates = sinYCoordinatesMap.map((value) => value.y);
    console.log(sinYCoordinates);
    console.log(sinusData.map(value => value.y))
  }
  // * This works
  const polyharmonicYCoordinates = sinYCoordinates.map((val, ind) => {
    return (
      val +
      rectYCoordinates[ind] +
      triangleYCoordinates[ind] +
      sawYCoordinates[ind]
    );
  });

  if (isFourierTransformed) {
    let transformedData = calcFourier(sinYCoordinates, samplingFrequency);
    sinAmpSpectrum = transformedData.A;
    sinPhaseSpectrum = transformedData.phases;
    fourierTransformedSinus = calcReverseFourier(
      transformedData,
      samplingFrequency,
      true,
      sinusData[0].y
    );

    transformedData = calcFourier(rectYCoordinates, samplingFrequency);
    rectAmpSpectrum = transformedData.A;
    rectPhaseSpectrum = transformedData.phases;
    fourierTransformedRectangle = calcReverseFourier(
      transformedData,
      samplingFrequency,
      false,
      rectangleData[0].y
    );

    transformedData = calcFourier(triangleYCoordinates, samplingFrequency);
    triangleAmpSpectrum = transformedData.A;
    trianglePhaseSpectrum = transformedData.phases;
    fourierTransformedTriangle = calcReverseFourier(
      transformedData,
      samplingFrequency,
      false,
      triangleData[0].y
    );

    transformedData = calcFourier(sawYCoordinates, samplingFrequency);
    sawAmpSpectrum = transformedData.A;
    sawPhaseSpectrum = transformedData.phases;
    fourierTransformedSawlike = calcReverseFourier(
      transformedData,
      samplingFrequency,
      false,
      sawlikeData[0].y
    );

    transformedData = calcFourier(polyharmonicYCoordinates, samplingFrequency);
    polyharmonicAmpSpectrum = transformedData.A;
    polyharmonicPhaseSpectrum = transformedData.phases;
    fourierTransformedPolyharmonic = calcReverseFourierPolyharmonic(
      transformedData,
      samplingFrequency
    );
    fourierTransformedPolyharmonicNOPHI = calcReverseFourierPolyharmonic(
      transformedData,
      samplingFrequency,
      false
    );
  }

  fourierTransformedSinus = fourierTransformedSinus.map((v, ind) => {
    return { y: v, n: ind + 1 };
  });
  sinAmpSpectrum = sinAmpSpectrum.map((v, ind) => {
    return { y: v, n: ind + 1 };
  });
  sinPhaseSpectrum = sinPhaseSpectrum.map((v, ind) => {
    return { y: v, n: ind + 1 };
  });

  fourierTransformedRectangle = fourierTransformedRectangle.map((v, ind) => {
    return { y: v, n: ind + 1 };
  });
  rectAmpSpectrum = rectAmpSpectrum.map((v, ind) => {
    return { y: v, n: ind + 1 };
  });
  rectPhaseSpectrum = rectPhaseSpectrum.map((v, ind) => {
    return { y: v, n: ind + 1 };
  });

  fourierTransformedTriangle = fourierTransformedTriangle.map((v, ind) => {
    return { y: v, n: ind + 1 };
  });
  triangleAmpSpectrum = triangleAmpSpectrum.map((v, ind) => {
    return { y: v, n: ind + 1 };
  });
  trianglePhaseSpectrum = trianglePhaseSpectrum.map((v, ind) => {
    return { y: v, n: ind + 1 };
  });

  fourierTransformedSawlike = fourierTransformedSawlike.map((v, ind) => {
    return { y: v, n: ind + 1 };
  });
  sawAmpSpectrum = sawAmpSpectrum.map((v, ind) => {
    return { y: v, n: ind + 1 };
  });
  sawPhaseSpectrum = sawPhaseSpectrum.map((v, ind) => {
    return { y: v, n: ind + 1 };
  });

  fourierTransformedPolyharmonic = fourierTransformedPolyharmonic.map(
    (v, ind) => {
      return { y: v, n: ind + 1 };
    }
  );
  fourierTransformedPolyharmonicNOPHI = fourierTransformedPolyharmonicNOPHI.map(
    (v, ind) => {
      return { y: v, n: ind + 1 };
    }
  );
  polyharmonicAmpSpectrum = polyharmonicAmpSpectrum.map((v, ind) => {
    return { y: v, n: ind + 1 };
  });
  polyharmonicPhaseSpectrum = polyharmonicPhaseSpectrum.map((v, ind) => {
    return { y: v, n: ind + 1 };
  });

  // const sinAndFourierSum = addChartData(fourierTransformedSinus, sinusData);
  // const rectAndFourierSum = addChartData(fourierTransformedRectangle, rectangleData);
  // const triangleAndFourierSum = addChartData(
  //   fourierTransformedTriangle,
  //   triangleData
  // );
  // const sawAndFourierSum = addChartData(fourierTransformedSawlike, sawlikeData);

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
              isFourierTransformed ? [fourierTransformedSinus] : undefined
            }
          ></Plot>
          {isFourierTransformed && (
            <>
              <Plot
                data={sinAmpSpectrum}
                chartName={"Amplitude spectrum"}
              ></Plot>
              <Plot data={sinPhaseSpectrum} chartName={"Phase spectrum"}></Plot>
            </>
          )}
          <Plot
            data={rectangleData}
            formula={"x=f(n)"}
            chartName={"Rectangle"}
            otherData={
              isFourierTransformed ? [fourierTransformedRectangle] : undefined
            }
          ></Plot>
          {isFourierTransformed && (
            <>
              <Plot
                data={rectAmpSpectrum}
                chartName={"Amplitude spectrum"}
              ></Plot>
              <Plot
                data={rectPhaseSpectrum}
                chartName={"Phase spectrum"}
              ></Plot>
            </>
          )}
          <Plot
            data={triangleData}
            formula={"x=f(n)"}
            chartName={"Triangle"}
            otherData={
              isFourierTransformed ? [fourierTransformedTriangle] : undefined
            }
          ></Plot>
          {isFourierTransformed && (
            <>
              <Plot
                data={triangleAmpSpectrum}
                chartName={"Amplitude spectrum"}
              ></Plot>
              <Plot
                data={trianglePhaseSpectrum}
                chartName={"Phase spectrum"}
              ></Plot>
            </>
          )}
          <Plot
            data={sawlikeData}
            formula={"x=f(n)"}
            chartName={"Sawlike"}
            otherData={
              isFourierTransformed ? [fourierTransformedSawlike] : undefined
            }
          ></Plot>
          {isFourierTransformed && (
            <>
              <Plot
                data={sawAmpSpectrum}
                chartName={"Amplitude spectrum"}
              ></Plot>
              <Plot data={sawPhaseSpectrum} chartName={"Phase spectrum"}></Plot>
            </>
          )}
          <Plot
            data={sumOfData}
            formula={"x=f(n)"}
            chartName={"Polyharmonic"}
            otherData={
              isFourierTransformed
                ? [
                    fourierTransformedPolyharmonic,
                    fourierTransformedPolyharmonicNOPHI,
                  ]
                : undefined
            }
          ></Plot>
          {isFourierTransformed && (
            <>
              <Plot
                data={polyharmonicAmpSpectrum}
                chartName={"Amplitude spectrum"}
              ></Plot>
              <Plot
                data={polyharmonicPhaseSpectrum}
                chartName={"Phase spectrum"}
              ></Plot>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
