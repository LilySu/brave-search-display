import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Link = ({ href, children }) => (
  <a href={href} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

const parseContent = (content) => {
  if (typeof content !== 'string') return String(content);
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  return Array.from(doc.body.childNodes).map((node, index) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();
      if (tagName === 'a') {
        return <Link key={index} href={node.getAttribute('href')}>{node.textContent}</Link>;
      } else if (tagName === 'br') {
        return <br key={index} />;
      } else if (tagName === 'strong' || tagName === 'b') {
        return <strong key={index}>{node.textContent}</strong>;
      } else {
        return <span key={index}>{node.textContent}</span>;
      }
    }
    return null;
  });
};

const SearchResult = ({ result, showImages }) => (
  <div className="mb-4 bg-white rounded-lg shadow-sm p-6">
    {showImages && result.thumbnail && (
      <div className="mb-4 flex justify-center">
        <img 
          src={result.thumbnail.src} 
          alt={result.thumbnail.alt || result.title} 
          className="w-[150px] h-[150px] object-cover rounded-lg"
        />
      </div>
    )}
    <div>
      <a href={result.url} className="text-blue-500 hover:underline text-lg font-semibold">
        {parseContent(result.title)}
      </a>
      <p className="text-sm text-gray-600 mt-2">{parseContent(result.description)}</p>
    </div>
  </div>
);

const NewsResult = ({ result, showImages }) => (
  <div className="mb-4 bg-white rounded-lg shadow-sm p-6">
    {showImages && result.thumbnail && (
      <div className="mb-4 flex justify-center">
        <img 
          src={result.thumbnail.src} 
          alt={result.thumbnail.alt || result.title} 
          className="w-[150px] h-[150px] object-cover rounded-lg"
        />
      </div>
    )}
    <div>
      <a href={result.url} className="text-blue-500 hover:underline text-lg font-semibold">
        {parseContent(result.title)}
      </a>
      <p className="text-sm text-gray-500 mt-1">{result.meta_url?.hostname} - {result.age}</p>
      <p className="text-sm text-gray-600 mt-2">{parseContent(result.description)}</p>
    </div>
  </div>
);

const ImageResult = ({ result }) => (
  <div className="mb-4">
    {result.thumbnail && (
      <img 
        src={result.thumbnail.src} 
        alt={result.title} 
        className="w-full h-auto rounded-lg shadow-sm"
      />
    )}
    <p className="text-sm text-gray-600 mt-2">{parseContent(result.title)}</p>
    <p className="text-xs text-gray-500">{result.source}</p>
  </div>
);

const Infobox = ({ infobox }) => {
  if (!infobox || !infobox.results || infobox.results.length === 0) return null;

  const result = infobox.results[0];

  return (
    <div className="mb-4 p-4 bg-white rounded-lg shadow-sm text-sm leading-tight">
      <h3 className="text-lg font-semibold mb-2">{result.title}</h3>
      <p>{parseContent(result.description)}</p>
      {result.images && result.images.length > 0 && (
        <div className="mt-4">
          <img 
            src={result.images[0].src} 
            alt={result.images[0].alt} 
            className="w-full h-auto rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

const SearchBar = ({ query, setQuery, handleSearch, handleKeyPress }) => (
  <div className="flex items-center">
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyPress={handleKeyPress}
      className="flex-grow p-2 border rounded-l"
      placeholder="Enter search query"
    />
    <button
      onClick={handleSearch}
      className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
    >
      Search
    </button>
  </div>
);

const LayoutOptions = ({ columns, handleColumnChange, activeSearchType, handleSearchTypeChange, showImages, setShowImages }) => (
  <div className="p-4">
    <h2 className="text-lg font-semibold mb-4">Layout Options</h2>
    <div className="space-y-2 mb-4">
      {[1, 2, 3, 4, 5].map((layout) => (
        <button
          key={layout}
          onClick={() => handleColumnChange(layout)}
          className={`w-full p-2 rounded ${columns === layout ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          {layout} Column{layout > 1 ? 's' : ''}
        </button>
      ))}
    </div>
    <div className="space-y-2 mb-4">
      {['web', 'news', 'image'].map((type) => (
        <button
          key={type}
          onClick={() => handleSearchTypeChange(type)}
          className={`w-full p-2 rounded ${activeSearchType === type ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)} Search
        </button>
      ))}
    </div>
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id="showImages"
        checked={showImages}
        onChange={() => setShowImages(!showImages)}
      />
      <label htmlFor="showImages">Show Images</label>
    </div>
  </div>
);

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [query, setQuery] = useState('');
  const [columns, setColumns] = useState(2);
  const [activeSearchType, setActiveSearchType] = useState('web');
  const [showImages, setShowImages] = useState(true);
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [warning, setWarning] = useState('');
  const [infobox, setInfobox] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWarning('');
    }, 3000);
    return () => clearTimeout(timer);
  }, [warning]);

  const handleSearch = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/search?query=${query}&type=${activeSearchType}`);
      const data = await response.json();
      
      console.log('Search type:', activeSearchType);
      console.log('Raw search results:', data);

      if (activeSearchType === 'web') {
        setSearchResults(data.web?.results || []);
        setInfobox(data.infobox || null);
      } else if (activeSearchType === 'news') {
        setSearchResults(data.news?.results || []);
        setInfobox(null);
      } else if (activeSearchType === 'image') {
        setSearchResults(data.results || []);
        setInfobox(null);
      }

      console.log('Processed search results:', searchResults);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setSearchResults([]);
      setInfobox(null);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleColumnChange = (newColumns) => {
    setColumns(newColumns);
  };

  const handleSearchTypeChange = (newType) => {
    setActiveSearchType(newType);
    setSearchResults([]); // Clear previous results
    setInfobox(null);
    handleSearch();
  };

  const renderResult = (result, index) => {
    switch (activeSearchType) {
      case 'news':
        return <NewsResult key={index} result={result} showImages={showImages} />;
      case 'image':
        return <ImageResult key={index} result={result} />;
      default:
        return <SearchResult key={index} result={result} showImages={showImages} />;
    }
  };

  const getColumnClass = () => {
    switch (columns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 sm:grid-cols-2';
      case 3: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
      case 4: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      case 5: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
      default: return 'grid-cols-1';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className={`${menuCollapsed ? 'w-16' : 'w-64'} bg-gray-100 transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0`}>
        <button
          onClick={() => setMenuCollapsed(!menuCollapsed)}
          className="w-full p-4 text-gray-600 hover:text-gray-900"
        >
          {menuCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
        </button>
        {!menuCollapsed && (
          <LayoutOptions 
            columns={columns}
            handleColumnChange={handleColumnChange}
            activeSearchType={activeSearchType}
            handleSearchTypeChange={handleSearchTypeChange}
            showImages={showImages}
            setShowImages={setShowImages}
          />
        )}
      </div>
      <div className="flex-grow flex flex-col">
        <header className="bg-white shadow-sm p-4">
          <div className="mx-[80px]">
            <SearchBar 
              query={query}
              setQuery={setQuery}
              handleSearch={handleSearch}
              handleKeyPress={handleKeyPress}
            />
          </div>
        </header>
        <div className="flex-grow overflow-auto">
          <div className="mx-[80px] my-8">
            <div className={`grid gap-4 ${getColumnClass()}`}>
              {infobox && <Infobox infobox={infobox} />}
              {searchResults.map((result, index) => renderResult(result, index))}
            </div>
          </div>
        </div>
      </div>
      {warning && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-md">
          {warning}
        </div>
      )}
    </div>
  );
}

export default App;