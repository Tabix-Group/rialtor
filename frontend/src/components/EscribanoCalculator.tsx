import { useState } from 'react';

export default function EscribanoCalculator() {
  const [escrituraAmount, setEscrituraAmount] = useState('');
  const [buyerRate, setBuyerRate] = useState('2');
  const [sellerRate, setSellerRate] = useState('0');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    if (!escrituraAmount || isNaN(Number(escrituraAmount)) || Number(escrituraAmount) <= 0) {
      alert('El monto de escritura debe ser mayor a 0');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const numEscrituraAmount = Number(escrituraAmount);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/calculator/escribano`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        // Enviamos tanto escrituraAmount como saleAmount para máxima compatibilidad
        body: JSON.stringify({ escrituraAmount: numEscrituraAmount, saleAmount: numEscrituraAmount, buyerRate, sellerRate })
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
      <h2 className="text-xl font-bold mb-4 text-blue-700">Honorarios de Escribano</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Monto de Escritura</label>
          <input type="number" value={escrituraAmount} onChange={e => setEscrituraAmount(e.target.value)} className="w-full px-3 py-2 border rounded" min="0" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">% Comprador</label>
          <input type="number" value={buyerRate} onChange={e => setBuyerRate(e.target.value)} className="w-full px-3 py-2 border rounded" min="0" max="5" step="0.01" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">% Vendedor</label>
          <input type="number" value={sellerRate} onChange={e => setSellerRate(e.target.value)} className="w-full px-3 py-2 border rounded" min="0" max="5" step="0.01" />
        </div>
      </div>
      <button onClick={handleCalculate} disabled={loading || !escrituraAmount} className="bg-blue-600 text-white px-4 py-2 rounded font-bold disabled:bg-gray-300">{loading ? 'Calculando...' : 'Calcular'}</button>
      {result && (
        <div className="mt-4 bg-blue-50 rounded p-4">
          <div className="font-semibold">Resultado:</div>
          <div>Comprador: <span className="font-bold">{result.comprador.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span></div>
          <div>Vendedor: <span className="font-bold">{result.vendedor.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span></div>
          <div>Total: <span className="font-bold">{result.total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span></div>
        </div>
      )}
    </div>
  );
}
