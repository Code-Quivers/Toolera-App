'use client';

interface ProductModalProps {
  opened: boolean;
  onClose: () => void;
  sellerName: string;
}

const products = [
  {
    name: 'SmartPhone X200',
    sku: 'DE-PH-001',
    price: '৳ 24,500',
    stock: 'In Stock (15)',
  },
  {
    name: 'Aura Wireless Headphones',
    sku: 'DE-AU-042',
    price: '৳ 4,200',
    stock: 'In Stock (8)',
  },
];

export function ProductModal({ opened, onClose, sellerName }: ProductModalProps) {
  if (!opened) return null;

  return (
    <div
      className="fixed inset-0 z-[100]"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(11,28,48,0.4)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      <div
        className="relative w-full bg-white flex flex-col"
        style={{
          maxWidth: '768px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          maxHeight: '85vh',
        }}
      >
        <div
          className="p-6 flex justify-between items-center"
          style={{ borderBottom: '1px solid #e2e8f0' }}
        >
          <div>
            <h3
              style={{
                fontFamily: 'Montserrat',
                fontSize: '24px',
                fontWeight: 600,
                color: '#0b1c30',
              }}
            >
              {sellerName} - Products
            </h3>
            <p className="text-sm mt-1" style={{ color: '#3d4a42' }}>
              Total: 42 items in catalog
            </p>
          </div>
          <button
            className="p-1"
            style={{ color: '#3d4a42' }}
            onClick={onClose}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div
          className="p-6 overflow-y-auto flex-1"
          style={{ backgroundColor: '#f8fafc' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((product) => (
              <div
                key={product.sku}
                className="p-4 rounded-lg flex gap-4"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  className="flex-shrink-0 rounded"
                  style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#e5eeff',
                    border: '1px solid #e2e8f0',
                  }}
                />
                <div>
                  <h4 style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 600, color: '#0b1c30' }}>
                    {product.name}
                  </h4>
                  <p className="mt-1" style={{ fontSize: '12px', color: '#3d4a42' }}>
                    SKU: {product.sku}
                  </p>
                  <p className="mt-2 font-bold" style={{ color: '#0e9b6d' }}>
                    {product.price}
                  </p>
                  <span
                    className="inline-block mt-1 rounded"
                    style={{
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      backgroundColor: '#d9e6dd',
                      color: '#006948',
                      padding: '2px 8px',
                    }}
                  >
                    {product.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="p-4 flex justify-end"
          style={{ borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}
        >
          <button
            className="px-4 py-2 rounded-lg"
            style={{
              border: '1px solid #e2e8f0',
              color: '#3d4a42',
              fontFamily: 'Inter',
              fontWeight: 600,
              fontSize: '12px',
              letterSpacing: '0.05em',
            }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
