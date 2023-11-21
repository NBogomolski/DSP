'use client'

import { useState, useMemo, useEffect } from "react";
import { Label, RangeSlider, TextInput, ToggleSwitch } from "flowbite-react";
import { Switch, Flex, Typography, InputNumber } from "antd";

const { Title } = Typography;

const ControlPanel = (props) => {
  const [amplitude, setAmplitude] = useState(0.5);
  const [frequency, setFrequency] = useState(1);
  const [dutyCycle, setDutyCycle] = useState(0.5);
  const [phase0, setPhase0] = useState(0);
  
  useEffect(() => {
    props.setParentAmplitude(amplitude )
    props.setParentFrequency(frequency)
    // props.setParentSamplingFrequency(samplingFrequency)
    props.setParentPhase0( phase0)
  }, [amplitude, frequency, phase0])

  return (
    <>
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
      {/* <Label
        htmlFor="duty-cycle"
        value={"Duty cycle " + dutyCycle}
        color="black"
        className="text-2xl"
      />
      <RangeSlider
        id="duty-cycle"
        sizing="lg"
        onChange={(e) => setDutyCycle(e.target.value / 100)}
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
    </>
  );
};
export default ControlPanel;