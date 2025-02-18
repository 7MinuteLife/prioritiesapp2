import ValuesPrioritization from './components/ValuesPrioritization';
import ProtectedRoute from './components/ProtectedRoute';

export default function Home() {
  return (
    <ProtectedRoute>
      <ValuesPrioritization />
    </ProtectedRoute>
  );
}
