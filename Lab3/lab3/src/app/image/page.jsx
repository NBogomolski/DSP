"use client";

import React, { useState } from "react";
import './Image.css'
import { UploadOutlined } from "@ant-design/icons";
import { Button, Input, message, Upload } from "antd";
import Link from "next/link";

function applyConvolutionKernel(imageData, kernel) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx.putImageData(imageData, 0, 0);

  const resultImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const resultData = resultImageData.data;

  const halfKernelSize = Math.floor(kernel.length / 2);

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      let r = 0,
        g = 0,
        b = 0;

      for (let ky = 0; ky < kernel.length; ky++) {
        for (let kx = 0; kx < kernel[ky].length; kx++) {
          const pixelX = x + kx - halfKernelSize;
          const pixelY = y + ky - halfKernelSize;

          if (
            pixelX >= 0 &&
            pixelX < canvas.width &&
            pixelY >= 0 &&
            pixelY < canvas.height
          ) {
            const index = (pixelY * canvas.width + pixelX) * 4;
            r += imageData.data[index] * kernel[ky][kx];
            g += imageData.data[index + 1] * kernel[ky][kx];
            b += imageData.data[index + 2] * kernel[ky][kx];
          }
        }
      }

      const index = (y * canvas.width + x) * 4;
      resultData[index] = Math.round(r);
      resultData[index + 1] = Math.round(g);
      resultData[index + 2] = Math.round(b);
    }
  }

  return resultImageData;
}

export default function page() {
  const [originalImage, setOriginalImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState([]);

  const handleFileInputChange = (file) => {
    // const file = event.target.files[0];
    console.log(file)
    const reader = new FileReader();

    reader.onload = () => {
      setSelectedImage(reader.result);
      setOriginalImage(reader.result);
      setAppliedFilters([]); // Сброс примененных фильтров
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const applyConvolution = (kernel) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.src = selectedImage;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const originalImageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );
      const resultImageData = applyConvolutionKernel(originalImageData, kernel);

      const resultCanvas = document.createElement("canvas");
      resultCanvas.width = img.width;
      resultCanvas.height = img.height;
      const resultCtx = resultCanvas.getContext("2d");
      resultCtx.putImageData(resultImageData, 0, 0);

      setSelectedImage(resultCanvas.toDataURL());
      setAppliedFilters([...appliedFilters, kernel]); // Сохранение примененного фильтра
    };
  };

  const clearFilters = () => {
    setSelectedImage(originalImage);
    setAppliedFilters([]);
  };


  return (
    <div className="image-container">
      <div className="flex justify-around items-center p-3 bg-slate-500 backdrop-blur-xl">
        <div className="w-fit">
          <Input
            type="file"
            accept="image/*"
            prefix={<UploadOutlined />}
            onChange={(e) => handleFileInputChange(e.target.files[0])}
            size="large"
            className="cursor-pointer"
            placeholder="Click to upload file"
          />
        </div>
        <Button
          size="large"
          onClick={() => {
            applyConvolution([
              [1 / 9, 1 / 9, 1 / 9],
              [1 / 9, 1 / 9, 1 / 9],
              [1 / 9, 1 / 9, 1 / 9],
            ]);
          }}
        >
          Apply Blur
        </Button>
        <Button
          size="large"
          onClick={() => {
            applyConvolution([
              [0, -1, 0],
              [-1, 5, -1],
              [0, -1, 0],
            ]);
          }}
        >
          Apply Sharpen
        </Button>
        <Button
          size="large"
          onClick={() => {
            applyConvolution([
              [-1, -1, -1],
              [-1, 8, -1],
              [-1, -1, -1],
            ]);
          }}
        >
          Apply Edge Detection
        </Button>
        <Button
          size="large"
          onClick={() => {
            clearFilters();
          }}
        >
          Clear Filters
        </Button>
        <Link href="/">
          <Button size="large">Main menu</Button>
        </Link>
      </div>
      {/* <input
        type="file"
        accept="image/*"
        onChange={(e) => handleFileInputChange(e.target.files[0])}
      /> */}
      <div className="images-container p-3">
        {selectedImage && (
          <>
            <div className="image-wrapper">
              <h3>Original Image</h3>
              <img
                className="image-loaded"
                src={originalImage}
                alt="Original"
              />
            </div>
            <div className="image-wrapper">
              <h3>Processed Image</h3>
              <img
                className="image-after"
                src={selectedImage}
                alt="Processed"
              />
            </div>
            {/* <div className="image-btn-container">
              <button
                onClick={() =>
                  applyConvolution([
                    [1 / 9, 1 / 9, 1 / 9],
                    [1 / 9, 1 / 9, 1 / 9],
                    [1 / 9, 1 / 9, 1 / 9],
                  ])
                }
              >
                Apply Blur
              </button>
              <button
                onClick={() =>
                  applyConvolution([
                    [0, -1, 0],
                    [-1, 5, -1],
                    [0, -1, 0],
                  ])
                }
              >
                Apply Sharpen
              </button>
              <button
                onClick={() =>
                  applyConvolution([
                    [-1, -1, -1],
                    [-1, 8, -1],
                    [-1, -1, -1],
                  ])
                }
              >
                Apply Edge Detection
              </button>
              <button onClick={clearFilters}>Clear Filters</button>
            </div> */}
          </>
        )}
        <div className="applied-filters">
          {appliedFilters.length > 0 && <h3>Applied Filters</h3>}
          <ul>
            {appliedFilters.map((filter, index) => (
              <li key={index}>
                {JSON.stringify(filter).replace(/(\d+\.\d+)/g, (match) =>
                  parseFloat(match).toFixed(2)
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
