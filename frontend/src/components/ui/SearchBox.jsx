import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';

// Header search — underline input + arrow submit.
// Submits to /search/:keyword (HomePage renders the results).
const SearchBox = ({ initialValue = '', autoFocus = false }) => {
  const [keyword, setKeyword] = useState(initialValue);
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    const q = keyword.trim();
    navigate(q ? `/search/${encodeURIComponent(q)}` : '/');
  };

  return (
    <form onSubmit={submit} className="flex w-full items-end gap-3" role="search">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute bottom-3 left-0 h-4 w-4 text-faint"
          aria-hidden="true"
        />
        <input
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search the collection"
          aria-label="Search the collection"
          autoFocus={autoFocus}
          className="input !border-b !pl-7"
        />
      </div>
      <button type="submit" aria-label="Submit search" className="btn-outline !px-4 !py-2.5">
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
};

export default SearchBox;
