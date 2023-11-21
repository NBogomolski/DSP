// export const calcFourier = (points, N) => {
//   const res = {
//     A: [],
//     aCos: [],
//     aSin: [],
//     phases: [],
//   };
//   const n = N;
//   const k = points.length;
//   for (let j = 0; j < k; j++) {
//     let cos = 0;
//     let sin = 0;
//     for (let i = 0; i < k; i++) {
//       cos += points[i] * Math.cos((2 * Math.PI * i * j) / k);
//       sin += points[i] * Math.sin((2 * Math.PI * i * j) / k);
//     }

//     sin *= 2 / k;
//     cos *= 2 / k;

//     res.aSin.push(sin);
//     res.aCos.push(cos);
//     res.A.push(Math.sqrt(sin * sin + cos * cos));
//     res.phases.push(Math.atan2(sin, cos));
//   }

//   return res;
// };

// export const calcReverseFourier = (fourier, n, isHarmonic) => {
//   let res = [];
//   const k = fourier.A.length;
//   const coeff = n / k;
//   for (let i = 0; i < n; i++) {
//     let signal = 0;

//     for (let j = isHarmonic ? 0 : 1; j < k / 2; j++) {
//       signal +=
//         fourier.A[j] * Math.cos((2 * Math.PI * i * j) / n - fourier.phases[j]);
//     }
//     res.push(signal + (!isHarmonic ? fourier.A[0] / 2 : 0));
//   }
//   return res;
// };

export const arithmeticAveraging = (points, K) => {
  const m = (K - 1) / 2;
  let res = [];
  for (let i = 0; i < points.length; i++) {
    let value = 0;
    for (let j = i - m; j <= i + m; j++) {
      value +=
        j < 0
          ? points[0]
          : j >= points.length
          ? points[points.length - 1]
          : points[j];
    }
    res.push(value / K);
  }
  return res;
};

export const parabolaAveraging = (x) => {
  let res = [];
  for (let i = 0; i < x.length; i++) {
    const value =
      (5 * x[i - 3]
        ? x[i - 3]
        : 0 - 30 * x[i - 2]
        ? x[i - 2]
        : 0 + 75 * x[i - 1]
        ? x[i - 1]
        : 0 + 131 * x[i] + 75 * x[i + 1]
        ? x[i + 1]
        : 0 - 30 * x[i + 2]
        ? x[i + 2]
        : 0 + 5 * x[i + 3]
        ? x[i + 3]
        : 0) / 231;
    res.push(value);
  }
  return res;
};

function bubbleSort(arr) {
  let swapped;
  do {
    swapped = false;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] > arr[i + 1]) {
        let temp = arr[i];
        arr[i] = arr[i + 1];
        arr[i + 1] = temp;
        swapped = true;
      }
    }
  } while (swapped);
  return arr;
}

function modifyArray(arr, k) {
  if (k >= arr.length) {
    return new Array(arr.length).fill(0);
  }

  let result = arr.slice();
  for (let i = 0; i < k; i++) {
    result[i] = 0;
    result[arr.length - 1 - i] = 0;
  }

  return result;
}

export const medianaAveraging = (x, k) => {
  const sorted = bubbleSort(x);
  let kdeleted = modifyArray(sorted, k);
  const idCenter = kdeleted / 2;
  let value = 0;
  for (
    let m = idCenter - (kdeleted.length - 1) / 2 + k;
    m <= idCenter + (kdeleted.length - 1) / 2 - k;
    m++
  ) {
    value += kdeleted[m];
  }
  value = value / (kdeleted.length - 2 * k);
  kdeleted[idCenter] = value;
  return kdeleted;
};
export const getData = (a, leftx = 0) => {
  const xDataset = [];

  a.map((el, index) => {
    const newInd = parseInt(index) + parseInt(leftx);
    const res = { x: newInd.toString(), y: el };
    xDataset.push(res);
  });

  return xDataset;
};

export const LFFilter = (fourier, threshold) => {
  let res = {
    A: [],
    aCos: [],
    aSin: [],
    phases: [],
  };
  for (let i = 0; i <= threshold; i++) {
    res.A.push(fourier.A[i]);
    res.phases.push(fourier.phases[i]);
  }
  return res;
};
export const HFFilter = (fourier, threshold) => {
  let res = {
    A: [],
    aCos: [],
    aSin: [],
    phases: [],
  };
  for (let i = threshold; i < fourier.A.length; i++) {
    res.A.push(fourier.A[i]);
    res.phases.push(fourier.phases[i]);
  }
  return res;
};

export const BandpassFilter = (fourier, bound1, bound2) => {
  let res = {
    A: [],
    aCos: [],
    aSin: [],
    phases: [],
  };
  for (let i = bound1; i <= bound2; i++) {
    res.A.push(fourier.A[i]);
    res.phases.push(fourier.phases[i]);
  }
  return res;
};
