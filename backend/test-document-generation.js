// Quick test script for document generation
const testData = {
  nombreComprador: "hernan guido dorra",
  dniComprador: "28079283", 
  estadoCivilComprador: "soltero",
  domicilioComprador: "yerbal 2222",
  emailComprador: "hernanofx@hotmail.com",
  direccionInmueble: "Argentina1 2234",
  montoReserva: "12345",
  montoTotal: "1111111",
  montoRefuerzo: "1555",
  nombreCorredor: "marcelo gomez",
  matriculaCucicba: "1234",
  matriculaCmcpci: "56789",
  nombreInmobiliaria: "Remax",
  dia: "2",
  mes: "mayo", 
  anio: "2025"
};

// Test API locally
async function testLocal() {
  try {
    const response = await fetch('http://localhost:3003/api/documents/generate-reserva', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log('SUCCESS:', result.message);
    console.log('Document length:', result.documentContent?.length || 0);
    console.log('First 200 chars:', result.documentContent?.substring(0, 200) || 'No content');
  } catch (error) {
    console.error('ERROR:', error.message);
  }
}

// Test API on production
async function testProduction() {
  try {
    const response = await fetch('https://remax-be-production.up.railway.app/api/documents/generate-reserva', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log('PRODUCTION SUCCESS:', result.message);
    console.log('Document length:', result.documentContent?.length || 0);
    console.log('First 200 chars:', result.documentContent?.substring(0, 200) || 'No content');
  } catch (error) {
    console.error('PRODUCTION ERROR:', error.message);
  }
}

// Run tests
console.log('Testing document generation...');
console.log('Data:', testData);

// Uncomment the test you want to run:
// testLocal();
// testProduction();