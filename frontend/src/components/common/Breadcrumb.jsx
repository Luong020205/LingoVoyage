import { Link } from 'react-router-dom';

export default function Breadcrumb({ items }) {
  return (
    <nav className="flex text-sm text-gray-500 mb-6">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <span className="mx-2 text-gray-300">&gt;</span>}
          {item.link ? (
            <Link to={item.link} className="hover:text-primary transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-800 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
