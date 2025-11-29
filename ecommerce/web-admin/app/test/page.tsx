export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-green-600 mb-4">✅ Página de Prueba Funciona</h1>
        <p className="text-gray-600">
          Si ves este mensaje, Next.js está funcionando correctamente.
          El problema está en la página principal o sus componentes.
        </p>
      </div>
    </div>
  );
}

