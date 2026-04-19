import { CheckCircle, XCircle, Info } from 'lucide-react';
import useStore from '../store/useStore';

export default function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div className="toast">
      {toast.type === 'error'
        ? <XCircle size={16} style={{ color: 'var(--accent-red)', flexShrink: 0 }} />
        : toast.type === 'info'
        ? <Info size={16} style={{ color: '#4a6fa5', flexShrink: 0 }} />
        : <CheckCircle size={16} style={{ color: '#2d6a4f', flexShrink: 0 }} />}
      <span>{toast.message}</span>
    </div>
  );
}
