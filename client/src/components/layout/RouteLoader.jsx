import { useSelector } from 'react-redux';
import Loader from '../../common/Loader';

export default function RouteLoader() {
  const { loading, authLoading } = useSelector((state) => state.auth);
  const show = loading || authLoading;

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-30 pointer-events-none flex items-start justify-center pt-20">
      <div className="bg-base-100/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md border border-base-200/60">
        <Loader size="sm" />
      </div>
    </div>
  );
}

