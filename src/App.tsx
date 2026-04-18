import React, { useState, useRef } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { Activity, Download } from 'lucide-react';

interface Inputs {
  a: string;
  b: string;
  c: string;
  d: string;
  e: string;
  f: string;
  g: string;
}

const COLORS = {
  BOR: '#3b82f6', // blue-500
  BTO: '#10b981', // emerald-500
  ALOS: '#f59e0b', // amber-500
  TOI: '#ef4444', // red-500
};

export default function App() {
  const [inputs, setInputs] = useState<Inputs>({
    a: '',
    b: '',
    c: '',
    d: '',
    e: '',
    f: '',
    g: '',
  });

  const [data, setData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const formatNumber = (num: number) => {
    return isNaN(num) || !isFinite(num) ? "0.00" : num.toFixed(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const generateGraph = () => {
    const a = parseFloat(inputs.a) || 0; // Jumlah Tempat Tidur
    const b = parseFloat(inputs.b) || 0; // Pasien Keluar Hidup
    const c = parseFloat(inputs.c) || 0; // Pasien Keluar Mati < 48 Jam
    const d = parseFloat(inputs.d) || 0; // Pasien Keluar Mati > 48 Jam
    const e = parseFloat(inputs.e) || 0; // Jumlah Hari Perawatan
    const f = parseFloat(inputs.f) || 0; // Lama Dirawat
    const g = parseFloat(inputs.g) || 0; // Hari Perawatan (Periode)

    const totalKeluar = b + c + d;

    const bor = a * g > 0 ? (e / (a * g)) * 100 : 0;
    const alos = totalKeluar > 0 ? f / totalKeluar : 0;
    const toi = totalKeluar > 0 ? ((a * g) - e) / totalKeluar : 0;
    const bto = a > 0 ? totalKeluar / a : 0;

    setMetrics({ bor, alos, toi, bto });

    const chartData = [
      {
        INDIKATOR: "TITIK RS",
        NILAI: `(TOI: ${formatNumber(toi)}, ALOS: ${formatNumber(alos)})`,
        X: toi,
        Y: alos,
      },
      {
        INDIKATOR: "BOR",
        NILAI: formatNumber(bor),
        X: (15 - (bor / 100 * 15)) || 0, // Adjusted for scale visibility
        Y: (bor / 100 * 15) || 0,
      },
      {
        INDIKATOR: "BTO",
        NILAI: formatNumber(bto),
        X: bto > 0 ? (91 / bto) : 0,
        Y: bto > 0 ? (91 / bto) : 0,
      },
      {
        INDIKATOR: "ALOS",
        NILAI: formatNumber(alos),
        X: 0,
        Y: alos || 0,
      },
      {
        INDIKATOR: "TOI",
        NILAI: formatNumber(toi),
        X: toi || 0,
        Y: 0,
      },
    ];

    setData(chartData);
  };

  const downloadGraph = () => {
    if (!chartRef.current) return;
    const svgElement = chartRef.current.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    
    // Scale up for higher resolution (retina display quality)
    const scale = 2;
    canvas.width = (svgElement.clientWidth || 800) * scale;
    canvas.height = (svgElement.clientHeight || 600) * scale;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.scale(scale, scale);
    
    const img = new Image();
    img.onload = () => {
      // Draw solid background color matching the container
      ctx.fillStyle = "#f8fafc"; // Tailwind slate-50
      ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);
      ctx.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "Grafik_Barber_Johnson.png";
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    // Safe encoding of svg data
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const getBorLineData = (percent: number) => {
    const slope = percent / (100 - percent);
    const endX = 15 / slope > 15 ? 15 : 15 / slope;
    const endY = endX * slope;
    return [
      { X: 0, Y: 0 },
      { X: endX, Y: endY },
    ];
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      if (!point.INDIKATOR) return null;
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-bold text-slate-800">{point.INDIKATOR}</p>
          <p className="text-sm text-slate-600">Nilai: <span className="font-semibold text-slate-900">{point.NILAI}</span></p>
          <p className="text-sm text-slate-500">X: {formatNumber(point.X)}, Y: {formatNumber(point.Y)}</p>
        </div>
      );
    }
    return null;
  };

  const [showJson, setShowJson] = useState(false);

  const getBtoLineData = (btoVal: number, gVal: number) => {
    const intercept = gVal / btoVal;
    if (intercept <= 0) return [];
    // Line x + y = intercept => y = intercept - x
    const startY = Math.min(15, intercept);
    const startX = intercept - startY;
    const endX = Math.min(15, intercept);
    const endY = intercept - endX;

    return [
      { X: startX, Y: startY },
      { X: endX, Y: endY },
    ];
  };

  const getDropLines = (x: number, y: number) => {
    return [
      { X: 0, Y: y },
      { X: x, Y: y },
      { X: x, Y: 0 }
    ];
  };

  return (
    <div className="min-h-screen p-6 md:p-12 w-full max-w-7xl mx-auto flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-600 rounded-xl shadow-indigo-500/20 shadow-lg">
          <Activity className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">SIDIET-BARBER</h1>
          <p className="text-slate-500 font-medium">Sistem Informasi Digital Efisiensi Tempat Tidur Berdasarkan Ebarber</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 pb-4 border-b border-slate-100 uppercase tracking-tight">Input Data</h2>

            <div className="flex flex-col gap-4">
              {[
                { id: 'a', label: 'a. Jumlah Tempat Tidur', placeholder: 'Ex: 100' },
                { id: 'b', label: 'b. Pasien Keluar Hidup', placeholder: 'Ex: 450' },
                { id: 'c', label: 'c. Pasien Keluar Mati < 48 Jam', placeholder: 'Ex: 5' },
                { id: 'd', label: 'd. Pasien Keluar Mati > 48 Jam', placeholder: 'Ex: 10' },
                { id: 'e', label: 'e. Jumlah Hari Perawatan', placeholder: 'Ex: 1800' },
                { id: 'f', label: 'f. Lama Dirawat', placeholder: 'Ex: 2100' },
                { id: 'g', label: 'g. Periode', placeholder: 'Ex: 30' }
              ].map((field) => (
                <div key={field.id} className="flex flex-col gap-1.5">
                  <label htmlFor={field.id} className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                    {field.label}
                  </label>
                  <input
                    type="number"
                    id={field.id}
                    name={field.id}
                    value={inputs[field.id as keyof Inputs]}
                    onChange={handleInputChange}
                    className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold text-slate-900 placeholder:text-slate-400"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}

              <button
                onClick={generateGraph}
                className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-2xl shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all transform hover:-translate-y-1 active:translate-y-0 active:scale-95 flex items-center justify-center gap-2"
              >
                GENERATE GRAFIK
              </button>
            </div>
          </div>

          {metrics && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 pb-4 border-b border-slate-100 uppercase tracking-tight">Hasil Perhitungan</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">BOR</p>
                  <p className="text-2xl font-black text-indigo-900">{formatNumber(metrics.bor)}%</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">ALOS</p>
                  <p className="text-2xl font-black text-orange-900">{formatNumber(metrics.alos)}</p>
                </div>
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">TOI</p>
                  <p className="text-2xl font-black text-rose-900">{formatNumber(metrics.toi)}</p>
                </div>
                <div className="bg-teal-50 border border-teal-100 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest mb-1">BTO</p>
                  <p className="text-2xl font-black text-teal-900">{formatNumber(metrics.bto)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-8 h-full min-h-[600px] flex flex-col">
            <h2 className="text-xl font-black text-slate-900 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between uppercase tracking-tight gap-4">
              <span>Visualisasi Barber Johnson</span>
              <div className="flex gap-2">
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 uppercase flex items-center justify-center">Scale 0-15</span>
                {data.length > 0 && (
                  <button 
                    onClick={downloadGraph}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-full shadow-md transition-all active:scale-95 uppercase"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                )}
              </div>
            </h2>

            <div ref={chartRef} className="flex-1 bg-slate-50 rounded-2xl border border-slate-100 p-6 relative">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    dataKey="X"
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }}
                    domain={[0, 15]}
                    label={{ value: 'TOI (Hari)', position: 'insideBottom', offset: -25, style: { fontWeight: 800, fill: '#475569' } }}
                  />
                  <YAxis
                    type="number"
                    dataKey="Y"
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }}
                    domain={[0, 15]}
                    label={{ value: 'ALOS (Hari)', angle: -90, position: 'insideLeft', offset: -10, style: { fontWeight: 800, fill: '#475569' } }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />

                  {/* BOR GARIS BANTU (Rays) */}
                  {[50, 70, 75, 80, 90].map((val) => (
                    <Scatter
                      key={`bor-${val}`}
                      data={getBorLineData(val)}
                      line={{ stroke: '#cbd5e1', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                      shape={() => null}
                    >
                      <LabelList
                        dataKey="Y"
                        content={({ x, y }) => (
                          <text x={x} y={y} dy={-8} dx={val > 80 ? -20 : 10} fill="#94a3b8" fontSize={9} fontWeight={800}>
                            BOR {val}%
                          </text>
                        )}
                      />
                    </Scatter>
                  ))}

                  {/* BTO GARIS BANTU (Diagonal) */}
                  {metrics && [12.5, 15, 20, 30].map((btoVal) => (
                    <Scatter
                      key={`bto-line-${btoVal}`}
                      data={getBtoLineData(btoVal, parseFloat(inputs.g) || 30)}
                      line={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                      shape={() => null}
                    >
                      <LabelList
                        dataKey="Y"
                        content={({ x, y }) => (
                          <text x={x} y={y} dy={15} dx={-25} fill="#cbd5e1" fontSize={9} fontWeight={700} transform={`rotate(-45, ${x}, ${y})`}>
                            BTO {btoVal}
                          </text>
                        )}
                      />
                    </Scatter>
                  ))}

                  {/* GARIS DARI PUSAT KE TITIK VALUE */}
                  {data.map((d, index) => {
                    if (d.INDIKATOR === 'TOI' || d.INDIKATOR === 'ALOS') return null;
                    return (
                      <Scatter
                        key={`origin-line-${index}`}
                        data={[{ X: 0, Y: 0 }, { X: d.X, Y: d.Y }]}
                        line={{
                          stroke: d.INDIKATOR === "TITIK RS" ? "#f43f5e" : Object.values(COLORS)[index % 4],
                          strokeWidth: d.INDIKATOR === "TITIK RS" ? 2 : 1.5,
                          strokeDasharray: d.INDIKATOR === "TITIK RS" ? 'none' : '4 4'
                        }}
                        shape={() => null}
                      />
                    );
                  })}

                  {/* DROP LINES FOR TITIK RS */}
                  {data.find(d => d.INDIKATOR === "TITIK RS") && (
                    <Scatter
                      data={getDropLines(
                        data.find(d => d.INDIKATOR === "TITIK RS")!.X,
                        data.find(d => d.INDIKATOR === "TITIK RS")!.Y
                      )}
                      line={{ stroke: '#f43f5e', strokeWidth: 1, strokeDasharray: '4 4' }}
                      shape={() => null}
                    />
                  )}

                  <Scatter name="Points" data={data} fill="#6366f1">
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.INDIKATOR === "TITIK RS" ? "#f43f5e" : Object.values(COLORS)[index % 4]}
                        r={entry.INDIKATOR === "TITIK RS" ? 8 : 4}
                        stroke={entry.INDIKATOR === "TITIK RS" ? "#fff" : "none"}
                        strokeWidth={2}
                      />
                    ))}
                    <LabelList
                      dataKey="INDIKATOR"
                      position="top"
                      style={{ fill: '#475569', fontWeight: 900, fontSize: 10, textTransform: 'uppercase' }}
                      offset={12}
                    />
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {data.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <button
                  onClick={() => setShowJson(!showJson)}
                  className="w-full flex items-center justify-between py-3 px-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all group"
                >
                  <span className="text-sm font-bold text-slate-700 uppercase tracking-widest">Data Object JSON</span>
                  <div className={`transform transition-transform duration-300 ${showJson ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {showJson && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-inner relative group">
                      <button
                        className="absolute top-4 right-4 text-[10px] font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity uppercase"
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(data, null, 2))}
                      >
                        Copy to clipboard
                      </button>
                      <pre className="text-[11px] text-indigo-300 font-mono leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
