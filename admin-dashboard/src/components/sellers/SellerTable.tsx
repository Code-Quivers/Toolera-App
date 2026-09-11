'use client';

interface SellerTableProps {
  onOpenProducts: (sellerName: string) => void;
}

const sellers = [
  {
    name: 'Rahim Uddin',
    email: 'rahim@example.com',
    store: 'Dhaka Electronics',
    joined: 'Oct 12, 2023',
    status: 'Active Pro',
    avatar: null,
    initials: null,
  },
  {
    name: 'Fatima Begum',
    email: 'fatima.b@example.com',
    store: 'Heritage Weavers',
    joined: 'Nov 05, 2023',
    status: 'Active Basic',
    avatar: null,
    initials: null,
  },
  {
    name: 'Kamal Hossain',
    email: 'kamal.h@example.com',
    store: 'Fresh Grocers Ltd',
    joined: 'Dec 01, 2023',
    status: 'Suspended',
    avatar: null,
    initials: 'K',
  },
];

function getStatusBadge(status: string) {
  if (status === 'Suspended') {
    return (
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
        style={{ backgroundColor: '#ffdad6', color: '#93000a', border: '1px solid #ffdad6' }}
      >
        {status}
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: '#d9e6dd', color: '#00855c', border: '1px solid #66dca8' }}
    >
      {status}
    </span>
  );
}

export function SellerTable({ onOpenProducts }: SellerTableProps) {
  return (
    <div
      className="bg-white rounded-xl overflow-hidden"
      style={{ border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
    >
      <div
        className="p-4 flex justify-between items-center"
        style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}
      >
        <div className="relative">
          <span
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: '#3d4a42', fontSize: '20px' }}
          >
            search
          </span>
          <input
            className="pl-10 pr-4 py-2 rounded-lg text-sm w-64 focus:outline-none bg-white"
            style={{ border: '1px solid #e2e8f0' }}
            placeholder="Search sellers..."
            type="text"
          />
        </div>
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
          style={{
            color: '#3d4a42',
            border: '1px solid #e2e8f0',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            filter_list
          </span>{' '}
          Filter
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr
              style={{
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                color: '#3d4a42',
                fontFamily: 'Inter',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              <th className="p-4 font-semibold">Seller Name</th>
              <th className="p-4 font-semibold">Contact Info</th>
              <th className="p-4 font-semibold">Store Name</th>
              <th className="p-4 font-semibold">Joined Date</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((seller, index) => (
              <tr
                key={seller.name}
                className="transition-colors group"
                style={{
                  borderBottom: index < sellers.length - 1 ? '1px solid #e2e8f0' : 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {seller.avatar ? (
                      <img
                        className="w-10 h-10 rounded-full object-cover"
                        style={{ border: '1px solid #e2e8f0' }}
                        src={seller.avatar}
                        alt={seller.name}
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                        style={{
                          backgroundColor: '#dce9ff',
                          color: '#0369a1',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        {seller.initials}
                      </div>
                    )}
                    <span style={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 600, color: '#0b1c30' }}>
                      {seller.name}
                    </span>
                  </div>
                </td>
                <td className="p-4" style={{ color: '#3d4a42' }}>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#94a3b8' }}>
                      mail
                    </span>
                    {seller.email}
                  </div>
                </td>
                <td className="p-4 font-medium" style={{ color: '#0b1c30' }}>
                  {seller.store}
                </td>
                <td className="p-4" style={{ color: '#3d4a42' }}>
                  {seller.joined}
                </td>
                <td className="p-4">{getStatusBadge(seller.status)}</td>
                <td className="p-4 text-right">
                  <button
                    className="px-3 py-1.5 rounded text-xs"
                    style={{
                      color: '#0e9b6d',
                      border: '1px solid #0e9b6d',
                      fontFamily: 'Inter',
                      fontWeight: 600,
                      fontSize: '12px',
                      letterSpacing: '0.05em',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0e9b6d';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#0e9b6d';
                    }}
                    onClick={() => onOpenProducts(seller.name)}
                  >
                    View Products
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className="p-4 flex items-center justify-between text-sm"
        style={{
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          color: '#3d4a42',
        }}
      >
        <span>Showing 1 to 3 of 1,248 entries</span>
        <div className="flex gap-1">
          <button
            className="px-3 py-1 rounded bg-white"
            style={{ border: '1px solid #e2e8f0', opacity: 0.5 }}
            disabled
          >
            Prev
          </button>
          <button
            className="px-3 py-1 rounded text-white"
            style={{ border: '1px solid #006948', backgroundColor: '#006948' }}
          >
            1
          </button>
          <button
            className="px-3 py-1 rounded bg-white"
            style={{ border: '1px solid #e2e8f0' }}
          >
            2
          </button>
          <button
            className="px-3 py-1 rounded bg-white"
            style={{ border: '1px solid #e2e8f0' }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
