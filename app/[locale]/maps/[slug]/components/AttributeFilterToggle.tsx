"use client";

const GLASS: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.88)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: 12,
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
};

export interface AttributeFilterItem {
  key: string;
  label: string;
  active: boolean;
}

interface AttributeFilterToggleProps {
  items: AttributeFilterItem[];
  onToggle: (key: string) => void;
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onClick={onChange}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(); } }}
      style={{
        position: 'relative',
        width: 36,
        height: 20,
        borderRadius: 10,
        backgroundColor: checked ? '#3B82F6' : '#D1D5DB',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 2,
        left: checked ? 18 : 2,
        width: 16,
        height: 16,
        borderRadius: '50%',
        backgroundColor: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'left 0.2s ease',
      }} />
    </div>
  );
}

export function AttributeFilterToggle({ items, onToggle }: AttributeFilterToggleProps) {
  if (items.length === 0) return null;

  return (
    <div
      style={{
        ...GLASS,
        position: 'absolute',
        bottom: 30,
        right: 16,
        zIndex: 800,
        padding: '12px 16px',
        fontSize: 13,
        
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {items.map((item) => (
        <div
          key={item.key}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            opacity: item.active ? 1 : 0.7,
            transition: 'opacity 0.2s ease',
          }}
        >
          <ToggleSwitch checked={item.active} onChange={() => onToggle(item.key)} />
          <span style={{ color: '#374151', fontSize: 13, lineHeight: 1.3 }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
