'use client';

const employees = [
  {
    name: 'Rahim Uddin',
    email: 'rahim.uddin@toolera.com',
    avatar: null as string | null,
    initials: null,
    role: 'Super Admin',
    roleIcon: 'shield',
    roleBg: '#0369a11a',
    roleText: '#0369a1',
    status: 'Active',
    lastLogin: 'Today, 09:41 AM',
  },
  {
    name: 'Nusrat Jahan',
    email: 'nusrat.jahan@toolera.com',
    avatar: null as string | null,
    initials: null,
    role: 'Admin',
    roleIcon: 'admin_panel_settings',
    roleBg: '#00855c1a',
    roleText: '#006948',
    status: 'Active',
    lastLogin: 'Yesterday, 14:20 PM',
  },
  {
    name: 'Arif Hasan',
    email: 'arif.hasan@toolera.com',
    avatar: null as string | null,
    initials: 'AH',
    role: 'Support Agent',
    roleIcon: 'support_agent',
    roleBg: '#dce9ff',
    roleText: '#0b1c30',
    status: 'Inactive',
    lastLogin: 'Oct 12, 2023',
  },
];

export function EmployeeTable() {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr
              style={{
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <th
                style={{
                  padding: '16px 24px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  fontWeight: 600,
                  lineHeight: '16px',
                  letterSpacing: '0.05em',
                  color: '#3d4a42',
                }}
              >
                Name
              </th>
              <th
                style={{
                  padding: '16px 24px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  fontWeight: 600,
                  lineHeight: '16px',
                  letterSpacing: '0.05em',
                  color: '#3d4a42',
                }}
              >
                Role
              </th>
              <th
                style={{
                  padding: '16px 24px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  fontWeight: 600,
                  lineHeight: '16px',
                  letterSpacing: '0.05em',
                  color: '#3d4a42',
                }}
              >
                Status
              </th>
              <th
                style={{
                  padding: '16px 24px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  fontWeight: 600,
                  lineHeight: '16px',
                  letterSpacing: '0.05em',
                  color: '#3d4a42',
                }}
              >
                Last Login
              </th>
              <th
                style={{
                  padding: '16px 24px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  fontWeight: 600,
                  lineHeight: '16px',
                  letterSpacing: '0.05em',
                  color: '#3d4a42',
                  textAlign: 'right',
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: '1px solid #e2e8f0',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(248,250,252,0.5)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                }}
              >
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {emp.initials ? (
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '9999px',
                          background: '#d5e0f8',
                          color: '#3c475a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '12px',
                          fontWeight: 600,
                          lineHeight: '16px',
                          letterSpacing: '0.05em',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        {emp.initials}
                      </div>
                    ) : (
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '9999px',
                          background: '#e5eeff',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: '20px', color: '#3d4a42' }}
                        >
                          person
                        </span>
                      </div>
                    )}
                    <div>
                      <p
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: 600,
                          lineHeight: '20px',
                          letterSpacing: '0.05em',
                          color: '#0b1c30',
                        }}
                      >
                        {emp.name}
                      </p>
                      <p
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '12px',
                          fontWeight: 400,
                          lineHeight: '16px',
                          color: '#3d4a42',
                        }}
                      >
                        {emp.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      paddingLeft: '10px',
                      paddingRight: '10px',
                      paddingTop: '4px',
                      paddingBottom: '4px',
                      borderRadius: '9999px',
                      background: emp.roleBg,
                      color: emp.roleText,
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      fontWeight: 600,
                      lineHeight: '16px',
                      letterSpacing: '0.05em',
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '14px' }}
                    >
                      {emp.roleIcon}
                    </span>
                    {emp.role}
                  </span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      paddingLeft: '10px',
                      paddingRight: '10px',
                      paddingTop: '4px',
                      paddingBottom: '4px',
                      borderRadius: '9999px',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      fontWeight: 600,
                      lineHeight: '16px',
                      letterSpacing: '0.05em',
                      ...(emp.status === 'Active'
                        ? {
                            background: '#0e9b6d1a',
                            color: '#0e9b6d',
                            border: '1px solid #0e9b6d33',
                          }
                        : {
                            background: '#ffdad64d',
                            color: '#93000a',
                            border: '1px solid #ffdad6',
                          }),
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '9999px',
                        background: emp.status === 'Active' ? '#0e9b6d' : '#ba1a1a',
                        display: 'inline-block',
                      }}
                    />
                    {emp.status}
                  </span>
                </td>
                <td
                  style={{
                    padding: '16px 24px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: '24px',
                    color: '#3d4a42',
                  }}
                >
                  {emp.lastLogin}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <button
                    style={{
                      color: '#3d4a42',
                      padding: '8px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = '#eff4ff';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        style={{
          background: '#f8fafc',
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: '#3d4a42',
          }}
        >
          Showing 1 to 3 of 24 entries
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            style={{
              paddingLeft: '12px',
              paddingRight: '12px',
              paddingTop: '4px',
              paddingBottom: '4px',
              borderRadius: '4px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#3d4a42',
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              opacity: 0.5,
            }}
          >
            Prev
          </button>
          <button
            style={{
              paddingLeft: '12px',
              paddingRight: '12px',
              paddingTop: '4px',
              paddingBottom: '4px',
              borderRadius: '4px',
              border: '1px solid #e2e8f0',
              background: '#00855c',
              color: '#f5fff7',
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0.05em',
              cursor: 'pointer',
            }}
          >
            1
          </button>
          <button
            style={{
              paddingLeft: '12px',
              paddingRight: '12px',
              paddingTop: '4px',
              paddingBottom: '4px',
              borderRadius: '4px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#3d4a42',
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0.05em',
              cursor: 'pointer',
            }}
          >
            2
          </button>
          <button
            style={{
              paddingLeft: '12px',
              paddingRight: '12px',
              paddingTop: '4px',
              paddingBottom: '4px',
              borderRadius: '4px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#3d4a42',
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0.05em',
              cursor: 'pointer',
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
