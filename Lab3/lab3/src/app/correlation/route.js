import { NextResponse } from "next/server";


export async function POST(req) {
  const reqBody = await req.json();

  const refImg = reqBody['referenceImage'];
  const patternImg = reqBody['patternImage'];

  const metadata = refImg.substring(0, refImg.indexOf(",") + 1);

  const base64Codes = {
    referenceImage: refImg.substring(refImg.indexOf(",") + 1),
    patternImage: patternImg.substring(patternImg.indexOf(",") + 1),
  };

  const pyRequest = await fetch("http://127.0.0.1:5000/post", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(base64Codes),
  });

  const images = await pyRequest.json();

  const responseObject = {
      resultingImage: metadata + images['resultingImage'],
      heatmap: metadata + images['heatmap'],
  };
  
  // Create a NextResponse object and send it
  return new NextResponse(JSON.stringify(responseObject));
}