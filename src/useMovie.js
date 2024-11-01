import { useEffect, useState } from "react";
const key = "4e2d983a";
export function useMovie(query) {
  const [movies, setMovies] = useState([]);

  const [isLoding, setIsloding] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      //   handleclose?.();
      const controller = new AbortController();
      async function FetchMovies() {
        try {
          setError("");
          setIsloding(true);
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${key}&s=${query}`,
            { signal: controller.signal }
          );
          if (!res.ok) throw new Error("someting went wronge");
          const data = await res.json();
          if (data.Response === "False") throw new Error(data.error);

          setMovies(data.Search);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        } finally {
          setIsloding(false);
        }
      }
      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }
      FetchMovies();
      return function () {
        controller.abort();
      };
    },
    [query]
  );
  return { movies, error, isLoding };
}
