import { CheckCircle, XCircle, Info } from 'lucide-react';
import useStore from '../../store/useStore';

export default function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div className="toast">
      {toast.type === 'error'
        ? <XCircle size={16} className="toast-icon-error" />
        : toast.type === 'info'
        ? <Info size={16} className="toast-icon-info" />
        : <CheckCircle size={16} className="toast-icon-success" />}
      <span>{toast.message}</span>
    </div>
  );
}
