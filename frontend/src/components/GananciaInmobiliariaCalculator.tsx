import { useState } from 'react';

export default function GananciaInmobiliariaCalculator() {
  const [saleAmount, setSaleAmount] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [mejoras, setMejoras] = useState('');
  const [gastos, setGastos] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    if (!saleAmount || isNaN(Number(saleAmount)) || Number(saleAmount) <= 0) {
      alert('El monto de venta debe ser mayor a 0');
      return;
    }
    if (!purchaseAmount || isNaN(Number(purchaseAmount)) || Number(purchaseAmount) <= 0) {
      alert('El monto de compra debe ser mayor a 0');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/calculator/ganancias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ saleAmount, purchaseAmount, mejoras, gastos })
      });
      const data = await res.json();
      if (data.success) setResult(data.data);
      else alert(data.message || 'Error en el cálculo');
    } catch (e) {
      alert('Error en el cálculo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 mb-8">
      <h2 className="text-xl font-bold mb-4 text-green-700">Impuesto a la Ganancia Inmobiliaria</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Precio de Venta</label>
          <input type="number" value={saleAmount} onChange={e => setSaleAmount(e.target.value)} className="w-full px-3 py-2 border rounded" min="0" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Precio de Compra</label>
          <input type="number" value={purchaseAmount} onChange={e => setPurchaseAmount(e.target.value)} className="w-full px-3 py-2 border rounded" min="0" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Mejoras (opcional)</label>
          <input type="number" value={mejoras} onChange={e => setMejoras(e.target.value)} className="w-full px-3 py-2 border rounded" min="0" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Gastos deducibles (opcional)</label>
          <input type="number" value={gastos} onChange={e => setGastos(e.target.value)} className="w-full px-3 py-2 border rounded" min="0" />
        </div>
      </div>
      <button onClick={handleCalculate} disabled={loading || !saleAmount || !purchaseAmount} className="bg-green-600 text-white px-4 py-2 rounded font-bold disabled:bg-gray-300">{loading ? 'Calculando...' : 'Calcular'}</button>
      {result && (
        <div className="mt-4 bg-green-50 rounded p-4">
          <div className="font-semibold">Resultado:</div>
          <div>Base Imponible: <span className="font-bold">{result.baseImponible.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span></div>
          <div>Impuesto (15%): <span className="font-bold">{result.impuestoGanancia.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span></div>
        </div>
      )}
      <div className="text-xs text-gray-600 mt-2">
        <ul className="list-disc ml-5">
          <li>Solo aplica si el inmueble fue adquirido a partir del 2018 y no es vivienda única, familiar y de uso permanente.</li>
          <li>La base imponible es precio de venta menos costo de compra, mejoras y gastos deducibles.</li>
          <li>El impuesto es el 15% sobre la ganancia neta.</li>
        </ul>
      </div>
    </div>
  );
}
