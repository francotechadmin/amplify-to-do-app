// Loader.tsx
interface LoaderProps {
  color: string;
}

const Loader: React.FC<LoaderProps> = ({ color }) => (
  <div
    className={`w-5 h-5 border-2 border-${color}-500 border-t-transparent rounded-full animate-spin`}
  ></div>
);

export default Loader;
