import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovie } from "./useMovie";
import { useLocalStorageState } from "./useLocalStorageState";
const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const key = "4e2d983a";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectId, setSelectId] = useState(null);
  const [watched, setWatched] = useLocalStorageState([], "watched");

  const { movies, error, isLoding } = useMovie(query);
  function handleselectid(id) {
    setSelectId((pre) => (pre === id ? null : id));
  }
  function handleclose(id) {
    setSelectId(null);
  }
  function handleWatchlist(movie) {
    setWatched((movies) => [...movies, movie]);
    // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  }
  function removeWachedList(id) {
    setWatched((movie) => movie.filter((mov) => mov.imdbID !== id));
  }

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <Numresult movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoding && <Load />}
          {error && <Error massage={error} />}
          {!isLoding && !error && (
            <MovieList movies={movies} handleselectid={handleselectid} />
          )}
        </Box>
        <Box>
          {selectId ? (
            <SelectMovies
              selectId={selectId}
              handleclose={handleclose}
              handleWatchlist={handleWatchlist}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                removeWachedList={removeWachedList}
              />
            </>
          )}
        </Box>

        {/* <WatchedBox /> */}
      </Main>
    </>
  );
  function SelectMovies({ selectId, handleclose, handleWatchlist, watched }) {
    const [movie, setMovie] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [userRating, setUserRating] = useState("");
    const isWatched = watched.map((wach) => wach.imdbID).includes(selectId);

    useEffect(
      function () {
        async function moviedetail() {
          setIsLoading(true);
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${key}&i=${selectId}`
          );
          const data = await res.json();
          setMovie(data);
          setIsLoading(false);
        }
        moviedetail();
      },
      [selectId]
    );
    const {
      Title: title,
      Year: year,
      Poster: poster,
      Runtime: runtime,
      imdbRating,
      Plot: plot,
      Released: released,
      Actors: actors,
      Director: director,
      Genre: genre,
    } = movie;

    useEffect(
      function () {
        if (!title) return;
        document.title = `movie | ${title}`;
        return function () {
          document.title = "usePopcorn";
          console.log(`${title}`);
        };
      },
      [title]
    );

    function onhandle() {
      const newWatcheslist = {
        imdbID: selectId,
        title,
        year,
        poster,
        imdbRating: Number(imdbRating),
        runtime: Number(runtime.split("").at(0)),
        userRating,
      };

      handleWatchlist(newWatcheslist);
      handleclose();
    }

    return (
      <div className="details">
        {isLoading ? (
          <Load />
        ) : (
          <>
            <header>
              <button className="btn-back" onClick={handleclose}>
                &larr;
              </button>
              <img src={poster} alt={`Poster of ${movie} movie`} />
              <div className="details-overview">
                <h2>{title}</h2>
                <p>
                  {released} &bull; {runtime}
                </p>
                <p>{genre}</p>
                <p>
                  <span>⭐️</span>
                  {imdbRating} IMDb rating
                </p>
              </div>
            </header>
            {/* <p>{avg}</p> */}
            <section>
              <div className="rating">
                {!isWatched ? (
                  <>
                    <StarRating
                      maxRating={10}
                      size={24}
                      onSetRating={setUserRating}
                    />
                    {userRating > 0 && (
                      <button className="btn-add" onClick={onhandle}>
                        Add to list
                      </button>
                    )}
                  </>
                ) : (
                  <p>You have rating</p>
                )}
              </div>

              <p>
                <em>{plot}</em>
              </p>
              <p>Starring {actors}</p>
              <p>Directed by {director}</p>
            </section>
          </>
        )}
      </div>
    );
  }
}
function Load() {
  return <p className="loader">loading.....</p>;
}
function Error({ massage }) {
  return <p className="error">{massage}</p>;
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />

      {children}
    </nav>
  );
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function Search({ query, setQuery }) {
  const myref = useRef(null);
  useEffect(function () {
    myref.current.focus();
  }, []);
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={myref}
    />
  );
}
function Numresult({ movies }) {
  const num = movies.length;
  return (
    <p className="num-results">
      Found <strong>{num}</strong> results
    </p>
  );
}
function Main({ children }) {
  return <main className="main">{children}</main>;
}
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}
// function WatchedBox() {
//   const [watched, setWatched] = useState(tempWatchedData);
//   const [isOpen2, setIsOpen2] = useState(true);

//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? "–" : "+"}
//       </button>
//       {isOpen2 && (
//         <>
//           <WatchedSummary watched={watched} />
//           <WatchedMovieList watched={watched} />

//         </>
//       )}
//     </div>
//   );
// }
function MovieList({ movies, handleselectid }) {
  // const [movies, setMovies] = useState(tempMovieData);
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          handleselectid={handleselectid}
        />
      ))}
    </ul>
  );
}
function Movie({ movie, handleselectid }) {
  return (
    <li onClick={() => handleselectid(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
function WatchedMovieList({ watched, removeWachedList }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          removeWachedList={removeWachedList}
        />
      ))}
    </ul>
  );
}
function WatchedMovie({ movie, removeWachedList }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          onClick={() => removeWachedList(movie.imdbID)}
          className="btn-delete"
        >
          ❌
        </button>
      </div>
    </li>
  );
}
