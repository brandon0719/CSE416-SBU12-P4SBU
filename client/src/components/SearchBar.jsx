import "../stylesheets/SearchBar.css";

const SearchBar = ({placeholder = "Search…", value, onChange}) => {
    return (
        <div className="search-bar-container">
            <input
                type="text"
                className="search-bar-input"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            <span className="search-bar-icon">🔍</span>
        </div>
    );
};

export default SearchBar;
